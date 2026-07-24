const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { isNurse, formatWaLink, jsonResponse } = require('../helpers');

// GET /api/contacts — role-aware & token-private: perawat lihat pasien terhubung, pasien lihat perawat jika sudah punya token
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user_id;

    if (isNurse(req)) {
      // Perawat hanya melihat pasien yang SUDAH terhubung ke perangkat via device_token
      const [contacts] = await db.execute(
        `SELECT DISTINCT u.id, u.name, u.email, u.phone, u.alamat, u.profile_photo, 'Pasien' AS position
         FROM users u
         JOIN devices d ON d.user_id = u.id
         WHERE u.role = 'PASIEN' AND d.device_token IS NOT NULL AND d.device_token != ''
         ORDER BY u.name ASC`
      );
      return jsonResponse(res, true, 'Kontak berhasil diambil.', {
        contacts: contacts.map((c) => ({ ...c, wa_link: formatWaLink(c.phone) })),
        role_label: 'Pasien Terhubung',
      });
    } else {
      // Pasien: hanya dapat melihat kontak perawat jika pasien sudah terhubung ke device token
      const [myDevices] = await db.execute(
        `SELECT device_token FROM devices WHERE user_id = ? AND device_token IS NOT NULL AND device_token != '' LIMIT 1`,
        [userId]
      );

      if (myDevices.length === 0) {
        return jsonResponse(res, true, 'Belum ada kontak. Hubungkan perangkat terlebih dahulu.', {
          contacts: [],
          role_label: 'Perawat / Dokter',
          message: 'Kontak bersifat privat. Silakan hubungkan perangkat NGT Anda menggunakan token perangkat terlebih dahulu.',
        });
      }

      const [contacts] = await db.execute(
        `SELECT u.id, u.name, u.email, u.phone, u.alamat, u.profile_photo, 'Perawat' AS position
         FROM users u WHERE u.role = 'PERAWAT' ORDER BY u.name ASC`
      );
      return jsonResponse(res, true, 'Kontak berhasil diambil.', {
        contacts: contacts.map((c) => ({ ...c, wa_link: formatWaLink(c.phone) })),
        role_label: 'Perawat / Dokter',
      });
    }
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil kontak.', null, 500);
  }
});

// GET /api/contacts/patient-contacts — untuk dashboard sidebar (contact_persons table)
router.get('/patient-contacts', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user_id;

    if (!isNurse(req)) {
      const [myDevices] = await db.execute(
        `SELECT id FROM devices WHERE user_id = ? AND device_token IS NOT NULL AND device_token != '' LIMIT 1`,
        [userId]
      );
      if (myDevices.length === 0) {
        return jsonResponse(res, true, 'Contact persons berhasil diambil.', { contacts: [] });
      }
    }

    const [contacts] = await db.execute(
      'SELECT id, name, position, phone FROM contact_persons ORDER BY name ASC LIMIT 4'
    );
    return jsonResponse(res, true, 'Contact persons berhasil diambil.', { contacts });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil contact persons.', null, 500);
  }
});

module.exports = router;
