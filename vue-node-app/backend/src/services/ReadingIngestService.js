const db = require('../config/db');
const ngtStatusService = require('./NgtStatusService');
const trendService = require('./TrendService');
const alertService = require('./AlertService');
const mailer = require('./Mailer');
const whatsAppNotifier = require('./WhatsAppNotifier');
const baselineService = require('./BaselineService');

const DANGER_NOTIFICATION_INTERVAL_MINUTES = parseInt(process.env.DANGER_NOTIFICATION_INTERVAL_MINUTES || '5');

function isNewHourBucket(lastCreatedAt) {
  if (!lastCreatedAt) return true;
  const last = new Date(lastCreatedAt);
  const now = new Date();
  return (
    last.getFullYear() !== now.getFullYear() ||
    last.getMonth() !== now.getMonth() ||
    last.getDate() !== now.getDate() ||
    last.getHours() !== now.getHours()
  );
}

class ReadingIngestService {
  /**
   * Selalu update live state device (untuk dashboard realtime tiap 5 detik).
   * Hanya menulis ke tabel `readings` (riwayat) saat masuk jam baru atau saat HIGH (danger).
   * Alert bahaya dibuat ulang maksimal setiap beberapa menit selama status tetap HIGH.
   */
  async ingest(deviceId, ppm, pct = null, metadata = {}) {
    await baselineService.ensureSchema();

    const [deviceRows] = await db.execute(
      'SELECT live_risk_level, device_name, user_id FROM devices WHERE id = ? LIMIT 1',
      [deviceId]
    );
    const previousLiveRisk = deviceRows[0] ? deviceRows[0].live_risk_level : null;
    const deviceName = deviceRows[0] ? deviceRows[0].device_name : 'Alat';
    const patientUserId = deviceRows[0] ? deviceRows[0].user_id : null;

    const [lastReadingRows] = await db.execute(
      'SELECT co2_ppm, created_at FROM readings WHERE device_id = ? ORDER BY created_at DESC, id DESC LIMIT 1',
      [deviceId]
    );
    const lastReading = lastReadingRows[0] || null;
    const previousPersistedPpm = lastReading ? parseFloat(lastReading.co2_ppm) : null;

    const trend = trendService.calculate(ppm, previousPersistedPpm);
    const baseline = await baselineService.calculate(deviceId, ppm, metadata);
    const status = ngtStatusService.evaluate(ppm, baseline);
    const isHigh = status.risk_level === 'HIGH';

    await db.execute(
      `UPDATE devices SET
         live_co2_ppm = ?, live_co2_percent = ?, live_previous_co2_ppm = ?, live_delta_co2_ppm = ?,
         live_co2_trend = ?, live_ngt_status = ?, live_risk_level = ?, live_message = ?,
         live_baseline_ppm = ?, live_deviation_ppm = ?, live_deviation_percent = ?,
         live_baseline_status = ?, live_baseline_valid = ?, live_baseline_state = ?,
         live_baseline_range_ppm = ?, live_baseline_stddev_ppm = ?, live_baseline_slope_ppm_min = ?,
         last_seen_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [
        ppm, pct, trend.previous_co2_ppm, trend.delta_co2_ppm,
        trend.co2_trend, status.ngt_status, status.risk_level, status.message,
        baseline.baseline_ppm, baseline.deviation_ppm, baseline.deviation_percent,
        baseline.baseline_status, baseline.baseline_valid ? 1 : 0, baseline.baseline_state,
        baseline.baseline_range_ppm, baseline.baseline_stddev_ppm, baseline.baseline_slope_ppm_min,
        deviceId,
      ]
    );

    let readingId = null;
    if (isHigh || isNewHourBucket(lastReading ? lastReading.created_at : null)) {
      const [result] = await db.execute(
        `INSERT INTO readings
          (device_id, co2_ppm, co2_percent, previous_co2_ppm, delta_co2_ppm, co2_trend,
           baseline_ppm, deviation_ppm, deviation_percent, baseline_status, baseline_valid,
           baseline_state, baseline_range_ppm, baseline_stddev_ppm, baseline_slope_ppm_min,
           respiratory_pattern_detected, ngt_status, risk_level, message, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          deviceId, ppm, pct, trend.previous_co2_ppm, trend.delta_co2_ppm, trend.co2_trend,
          baseline.baseline_ppm, baseline.deviation_ppm, baseline.deviation_percent,
          baseline.baseline_status, baseline.baseline_valid ? 1 : 0,
          baseline.baseline_state, baseline.baseline_range_ppm, baseline.baseline_stddev_ppm, baseline.baseline_slope_ppm_min,
          isHigh ? 1 : 0, status.ngt_status, status.risk_level, status.message,
        ]
      );
      readingId = result.insertId;
    }

    const shouldNotifyDanger = isHigh && await this.shouldNotifyDanger(deviceId, previousLiveRisk);

    if (shouldNotifyDanger) {
      await alertService.createIfNeeded(null, deviceId, readingId, status.risk_level, 1, status.message);
      this.notifyDanger(deviceName, patientUserId, ppm, status.message).catch((err) => {
        console.error('❌ Gagal mengirim notifikasi bahaya:', err.message);
      });
    }

    return { co2_ppm: ppm, co2_percent: pct, status, trend, baseline, readingId };
  }

  async shouldNotifyDanger(deviceId, previousLiveRisk) {
    if (previousLiveRisk !== 'HIGH') return true;

    const [rows] = await db.execute(
      `SELECT created_at
       FROM alerts
       WHERE device_id = ? AND level = 'HIGH'
       ORDER BY created_at DESC
       LIMIT 1`,
      [deviceId]
    );

    if (!rows.length || !rows[0].created_at) return true;

    const lastSentAt = new Date(rows[0].created_at).getTime();
    const intervalMs = DANGER_NOTIFICATION_INTERVAL_MINUTES * 60 * 1000;

    return Date.now() - lastSentAt >= intervalMs;
  }

  async notifyDanger(deviceName, patientUserId, ppm, message) {
    const [recipients] = await db.execute(
      `SELECT DISTINCT id, name, email, phone FROM users WHERE role = 'PERAWAT'${patientUserId ? ' OR id = ?' : ''}`,
      patientUserId ? [patientUserId] : []
    );
    if (!recipients.length) return;

    const occurredAt = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const alertPayload = { deviceName, ppm, message, occurredAt };

    await Promise.all(
      recipients.flatMap((r) => {
        const jobs = [];

        if (r.email) {
          jobs.push(
            mailer
              .sendDangerAlert(r.email, { recipientName: r.name, ...alertPayload })
              .catch((err) => console.error(`❌ Gagal kirim email ke ${r.email}:`, err.message))
          );
        }

        if (r.phone) {
          jobs.push(
            whatsAppNotifier
              .sendDangerAlert(r.phone, { recipientName: r.name, ...alertPayload })
              .catch((err) => console.error(`❌ Gagal kirim WhatsApp ke ${r.phone}:`, err.message))
          );
        }

        return jobs;
      })
    );
  }
}

module.exports = new ReadingIngestService();
