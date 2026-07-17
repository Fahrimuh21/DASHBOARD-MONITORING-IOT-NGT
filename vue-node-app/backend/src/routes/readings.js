const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { deviceAccessClause, onlineStatus, formatDatetime, isNurse, jsonResponse } = require('../helpers');
const readingIngestService = require('../services/ReadingIngestService');

// POST /api/sensor/reading  — endpoint untuk ESP32
router.post('/sensor/reading', async (req, res) => {
  try {
    const { device_code, co2_value, co2_ppm, co2_percent, device_token } = req.body || {};
    const token = req.headers['x-device-token'] || device_token || '';

    if (!token || !device_code) {
      return jsonResponse(res, false, 'device_code dan x-device-token wajib diisi.', null, 400);
    }

    const rawPpm = co2_value ?? co2_ppm;
    const hasPpm = rawPpm !== undefined && rawPpm !== null;
    const hasPercent = co2_percent !== undefined && co2_percent !== null;

    if (!hasPpm && !hasPercent) {
      return jsonResponse(res, false, 'co2_ppm atau co2_percent wajib dikirim.', null, 400);
    }

    if (hasPpm && isNaN(parseFloat(rawPpm))) {
      return jsonResponse(res, false, 'Nilai co2_value/co2_ppm harus numerik.', null, 422);
    }
    if (hasPercent && isNaN(parseFloat(co2_percent))) {
      return jsonResponse(res, false, 'Nilai co2_percent harus numerik.', null, 422);
    }

    let ppm = hasPpm ? parseFloat(rawPpm) : parseFloat(co2_percent) * 10000;
    let pct = hasPercent ? parseFloat(co2_percent) : ppm / 10000;

    if (ppm < 0 || pct < 0) {
      return jsonResponse(res, false, 'Nilai CO2 tidak valid.', null, 422);
    }

    const [deviceRows] = await db.execute(
      'SELECT id, device_code, device_token, status FROM devices WHERE device_code = ? LIMIT 1',
      [device_code]
    );

    const device = deviceRows[0];
    if (!device || device.device_token !== token || device.status !== 'active') {
      return jsonResponse(res, false, 'Device tidak valid atau token salah.', null, 401);
    }

    const result = await readingIngestService.ingest(device.id, ppm, pct);

    return jsonResponse(res, true, 'Data pembacaan CO2 berhasil disimpan.', {
      device_code,
      co2_ppm: ppm,
      co2_percent: pct,
      ngt_status: result.status.ngt_status,
      risk_level: result.status.risk_level,
      co2_trend: result.trend.co2_trend,
    }, 201);
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Terjadi kesalahan server saat menyimpan data pembacaan CO2.', null, 500);
  }
});

// GET /api/readings — riwayat pembacaan
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '30'), 1), 100);
    const { where: devWhere, params: devParams } = deviceAccessClause(req, 'd');

    const whereParts = devWhere ? [devWhere] : [];
    const params = [...devParams];

    if (req.query.device_id) {
      whereParts.push('r.device_id = ?');
      params.push(parseInt(req.query.device_id));
    }
    if (req.query.risk_level) {
      whereParts.push('r.risk_level = ?');
      params.push(req.query.risk_level);
    }
    if (req.query.date) {
      whereParts.push('DATE(r.created_at) = ?');
      params.push(req.query.date);
    }

    let sql = `SELECT r.id, r.co2_ppm, r.co2_percent, r.previous_co2_ppm, r.delta_co2_ppm, r.co2_trend,
                      r.ngt_status, r.risk_level, r.message, r.created_at,
                      d.device_name, d.device_code, u.name AS patient_name
               FROM readings r
               JOIN devices d ON d.id = r.device_id
               LEFT JOIN users u ON u.id = d.user_id`;

    if (whereParts.length) sql += ' WHERE ' + whereParts.join(' AND ');
    sql += ' ORDER BY r.created_at DESC, r.id DESC LIMIT ?';
    params.push(limit);

    const [readings] = await db.execute(sql, params);
    return jsonResponse(res, true, 'Riwayat pembacaan berhasil diambil.', { readings });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil riwayat pembacaan.', null, 500);
  }
});

// GET /api/readings/latest — data terbaru per device (untuk dashboard polling)
router.get('/latest', requireAuth, async (req, res) => {
  try {
    const { where: devWhere, params: devParams } = deviceAccessClause(req, 'd');
    const whereSql = devWhere ? `WHERE ${devWhere}` : '';

    const [devices] = await db.execute(
      `SELECT d.id AS device_id, d.device_name, d.device_code, d.location, d.status, d.last_seen_at,
              u.name AS patient_name,
              d.live_co2_ppm AS co2_ppm, d.live_co2_percent AS co2_percent,
              d.live_previous_co2_ppm AS previous_co2_ppm, d.live_delta_co2_ppm AS delta_co2_ppm,
              d.live_co2_trend AS co2_trend, d.live_ngt_status AS ngt_status,
              d.live_risk_level AS risk_level, d.live_message AS message,
              d.last_seen_at AS reading_at
       FROM devices d
       LEFT JOIN users u ON u.id = d.user_id
       ${whereSql}
       ORDER BY d.updated_at DESC, d.id DESC
       LIMIT 50`,
      devParams
    );

    const result = devices.map((d) => {
      const connectionStatus = onlineStatus(d.last_seen_at);

      return {
        ...d,
        co2_ppm: connectionStatus === 'OFFLINE' ? 0 : d.co2_ppm,
        co2_percent: connectionStatus === 'OFFLINE' ? 0 : d.co2_percent,
        connection_status: connectionStatus,
      };
    });

    return jsonResponse(res, true, 'Data terbaru berhasil diambil.', { devices: result });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil data terbaru.', null, 500);
  }
});

module.exports = router;
