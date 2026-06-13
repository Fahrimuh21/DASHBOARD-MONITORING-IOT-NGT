const router = require('express').Router();
const db = require('../config/db');
const { requireAuth, requireNurse, requirePatient } = require('../middleware/auth');
const { onlineStatus, jsonResponse } = require('../helpers');

// GET /api/devices — daftar device (perawat: semua, pasien: miliknya)
router.get('/', requireAuth, async (req, res) => {
  try {
    const isNurseRole = (req.session.role || '').toUpperCase() === 'PERAWAT';
    let sql, params;

    if (isNurseRole) {
      sql = `SELECT d.id, d.device_name, d.device_code, d.device_token, d.location, d.status, d.last_seen_at,
                    u.name AS patient_name, u.id AS patient_id
             FROM devices d
             LEFT JOIN users u ON u.id = d.user_id
             ORDER BY d.device_name ASC`;
      params = [];
    } else {
      sql = `SELECT d.id, d.device_name, d.device_code, d.device_token, d.location, d.status, d.last_seen_at,
                    u.name AS patient_name
             FROM devices d
             LEFT JOIN users u ON u.id = d.user_id
             WHERE d.user_id = ?
             ORDER BY d.updated_at DESC`;
      params = [req.session.user_id];
    }

    const [devices] = await db.execute(sql, params);
    const result = devices.map((d) => ({ ...d, connection_status: onlineStatus(d.last_seen_at) }));
    return jsonResponse(res, true, 'Device berhasil diambil.', { devices: result });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil device.', null, 500);
  }
});

// GET /api/devices/patients — daftar pasien (untuk assign device)
router.get('/patients', requireNurse, async (req, res) => {
  try {
    const [patients] = await db.execute(
      "SELECT id, name, email FROM users WHERE role = 'PASIEN' ORDER BY name ASC"
    );
    return jsonResponse(res, true, 'Pasien berhasil diambil.', { patients });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil pasien.', null, 500);
  }
});

// GET /api/devices/:id
router.get('/:id', requireNurse, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT d.*, u.name AS patient_name FROM devices d LEFT JOIN users u ON u.id = d.user_id WHERE d.id = ? LIMIT 1`,
      [parseInt(req.params.id)]
    );
    if (!rows[0]) return jsonResponse(res, false, 'Device tidak ditemukan.', null, 404);
    return jsonResponse(res, true, 'Device berhasil diambil.', { device: rows[0] });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil device.', null, 500);
  }
});

// POST /api/devices — tambah device (perawat)
router.post('/', requireNurse, async (req, res) => {
  try {
    const { device_name, device_code, device_token, location, user_id } = req.body;

    if (!device_name || !device_code || !device_token) {
      return jsonResponse(res, false, 'Nama, kode, dan token device wajib diisi.', null, 400);
    }

    await db.execute(
      `INSERT INTO devices (user_id, device_name, device_code, device_token, location, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [user_id ? parseInt(user_id) : null, device_name, device_code, device_token, location || null]
    );

    return jsonResponse(res, true, 'Device berhasil ditambahkan.', null, 201);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return jsonResponse(res, false, 'Gagal menyimpan device. Pastikan device_code unik.', null, 409);
    }
    return jsonResponse(res, false, 'Gagal menyimpan device.', null, 500);
  }
});

// PUT /api/devices/:id — edit device (perawat)
router.put('/:id', requireNurse, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { device_name, device_code, device_token, location, user_id, status } = req.body;

    await db.execute(
      `UPDATE devices SET device_name = ?, device_code = ?, device_token = ?, location = ?,
       user_id = ?, status = ?, updated_at = NOW() WHERE id = ?`,
      [
        device_name, device_code, device_token, location || null,
        user_id ? parseInt(user_id) : null,
        status || 'active', id,
      ]
    );

    return jsonResponse(res, true, 'Device berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal memperbarui device.', null, 500);
  }
});

// PUT /api/devices/:id/toggle — toggle active/inactive (perawat)
router.put('/:id/toggle', requireNurse, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await db.execute('SELECT status FROM devices WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return jsonResponse(res, false, 'Device tidak ditemukan.', null, 404);

    const newStatus = rows[0].status === 'active' ? 'inactive' : 'active';
    await db.execute('UPDATE devices SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);

    return jsonResponse(res, true, `Device berhasil ${newStatus === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`, { status: newStatus });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal toggle status device.', null, 500);
  }
});

// POST /api/devices/connect — pasien connect device via token
router.post('/connect', requirePatient, async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { device_token } = req.body;

    if (!device_token) {
      return jsonResponse(res, false, 'Token device wajib diisi.', null, 400);
    }

    // Cek apakah pasien sudah punya device
    const [myDevices] = await db.execute(
      'SELECT id FROM devices WHERE user_id = ? LIMIT 1',
      [userId]
    );
    if (myDevices.length > 0) {
      return jsonResponse(res, false, 'Anda sudah terhubung ke device. Lepas device saat ini terlebih dahulu.', null, 409);
    }

    const [deviceRows] = await db.execute(
      'SELECT id, device_name, user_id FROM devices WHERE device_token = ? LIMIT 1',
      [device_token]
    );
    const device = deviceRows[0];

    if (!device) {
      return jsonResponse(res, false, 'Token device tidak ditemukan. Pastikan token benar.', null, 404);
    }
    if (device.user_id !== null && parseInt(device.user_id) !== parseInt(userId)) {
      return jsonResponse(res, false, 'Device ini sudah terhubung dengan pasien lain.', null, 409);
    }

    await db.execute(
      'UPDATE devices SET user_id = ?, updated_at = NOW() WHERE id = ?',
      [userId, device.id]
    );

    return jsonResponse(res, true, `Berhasil terhubung ke device "${device.device_name}"!`);
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal menghubungkan device.', null, 500);
  }
});

// POST /api/devices/disconnect — pasien lepas device
router.post('/disconnect', requirePatient, async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { device_id } = req.body;

    const [rows] = await db.execute(
      'SELECT id FROM devices WHERE id = ? AND user_id = ? LIMIT 1',
      [parseInt(device_id), userId]
    );

    if (!rows[0]) {
      return jsonResponse(res, false, 'Device tidak ditemukan atau bukan milik Anda.', null, 404);
    }

    await db.execute(
      'UPDATE devices SET user_id = NULL, updated_at = NOW() WHERE id = ?',
      [parseInt(device_id)]
    );

    return jsonResponse(res, true, 'Device berhasil dilepas.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal melepas device.', null, 500);
  }
});

module.exports = router;
