const db = require('../config/db');
const ngtStatusService = require('./NgtStatusService');
const trendService = require('./TrendService');
const alertService = require('./AlertService');

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
   * Alert hanya dibuat saat transisi risk_level menjadi HIGH (bukan tiap tick selama HIGH berlangsung).
   */
  async ingest(deviceId, ppm, pct = null) {
    const [deviceRows] = await db.execute(
      'SELECT live_risk_level FROM devices WHERE id = ? LIMIT 1',
      [deviceId]
    );
    const previousLiveRisk = deviceRows[0] ? deviceRows[0].live_risk_level : null;

    const [lastReadingRows] = await db.execute(
      'SELECT co2_ppm, created_at FROM readings WHERE device_id = ? ORDER BY created_at DESC, id DESC LIMIT 1',
      [deviceId]
    );
    const lastReading = lastReadingRows[0] || null;
    const previousPersistedPpm = lastReading ? parseFloat(lastReading.co2_ppm) : null;

    const status = ngtStatusService.evaluate(ppm);
    const trend = trendService.calculate(ppm, previousPersistedPpm);
    const isHigh = status.risk_level === 'HIGH';

    await db.execute(
      `UPDATE devices SET
         live_co2_ppm = ?, live_co2_percent = ?, live_previous_co2_ppm = ?, live_delta_co2_ppm = ?,
         live_co2_trend = ?, live_ngt_status = ?, live_risk_level = ?, live_message = ?,
         last_seen_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [
        ppm, pct, trend.previous_co2_ppm, trend.delta_co2_ppm,
        trend.co2_trend, status.ngt_status, status.risk_level, status.message,
        deviceId,
      ]
    );

    let readingId = null;
    if (isHigh || isNewHourBucket(lastReading ? lastReading.created_at : null)) {
      const [result] = await db.execute(
        `INSERT INTO readings
          (device_id, co2_ppm, co2_percent, previous_co2_ppm, delta_co2_ppm, co2_trend,
           respiratory_pattern_detected, ngt_status, risk_level, message, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          deviceId, ppm, pct, trend.previous_co2_ppm, trend.delta_co2_ppm, trend.co2_trend,
          isHigh ? 1 : 0, status.ngt_status, status.risk_level, status.message,
        ]
      );
      readingId = result.insertId;
    }

    if (isHigh && previousLiveRisk !== 'HIGH') {
      await alertService.createIfNeeded(null, deviceId, readingId, status.risk_level, 1, status.message);
    }

    return { co2_ppm: ppm, co2_percent: pct, status, trend, readingId };
  }
}

module.exports = new ReadingIngestService();
