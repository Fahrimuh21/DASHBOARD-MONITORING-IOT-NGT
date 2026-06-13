const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { deviceAccessClause, jsonResponse } = require('../helpers');

// GET /api/alerts
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20'), 1), 100);
    const { where: devWhere, params: devParams } = deviceAccessClause(req, 'd');
    const whereSql = devWhere ? `WHERE ${devWhere}` : '';

    const params = [...devParams, limit];

    const [alerts] = await db.execute(
      `SELECT a.id, a.title, a.message, a.level, a.is_read, a.created_at,
              d.device_name, d.device_code, u.name AS patient_name
       FROM alerts a
       JOIN devices d ON d.id = a.device_id
       LEFT JOIN users u ON u.id = d.user_id
       ${whereSql}
       ORDER BY a.created_at DESC, a.id DESC LIMIT ?`,
      params
    );

    return jsonResponse(res, true, 'Alert berhasil diambil.', { alerts });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil alert.', null, 500);
  }
});

// GET /api/alerts/unread-count
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const { where: devWhere, params: devParams } = deviceAccessClause(req, 'd');
    const whereSql = devWhere
      ? `WHERE a.is_read = 0 AND ${devWhere}`
      : 'WHERE a.is_read = 0';

    const [rows] = await db.execute(
      `SELECT COUNT(*) AS cnt FROM alerts a JOIN devices d ON d.id = a.device_id ${whereSql}`,
      devParams
    );
    return jsonResponse(res, true, 'Unread count berhasil diambil.', { count: rows[0].cnt });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil unread count.', null, 500);
  }
});

// PUT /api/alerts/:id/read — tandai sudah dibaca
router.put('/:id/read', requireAuth, async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    await db.execute(
      'UPDATE alerts SET is_read = 1, updated_at = NOW() WHERE id = ?',
      [alertId]
    );
    return jsonResponse(res, true, 'Alert berhasil ditandai dibaca.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal menandai alert.', null, 500);
  }
});

// PUT /api/alerts/read-all — tandai semua dibaca
router.put('/read-all', requireAuth, async (req, res) => {
  try {
    const { where: devWhere, params: devParams } = deviceAccessClause(req, 'd');
    if (devWhere) {
      // Pasien: hanya tandai alert milik device-nya
      const [devices] = await db.execute(
        `SELECT d.id FROM devices d WHERE ${devWhere}`,
        devParams
      );
      const ids = devices.map((d) => d.id);
      if (ids.length) {
        await db.execute(
          `UPDATE alerts SET is_read = 1, updated_at = NOW() WHERE device_id IN (${ids.map(() => '?').join(',')})`,
          ids
        );
      }
    } else {
      // Perawat: tandai semua
      await db.execute('UPDATE alerts SET is_read = 1, updated_at = NOW()');
    }
    return jsonResponse(res, true, 'Semua alert berhasil ditandai dibaca.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal menandai semua alert.', null, 500);
  }
});

module.exports = router;
