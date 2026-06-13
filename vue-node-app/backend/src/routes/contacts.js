const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { isNurse, formatWaLink, jsonResponse } = require('../helpers');

// GET /api/contacts — role-aware: perawat lihat pasien, pasien lihat perawat
router.get('/', requireAuth, async (req, res) => {
  try {
    if (isNurse(req)) {
      const [contacts] = await db.execute(
        `SELECT u.id, u.name, u.email, u.phone, u.alamat, 'Pasien' AS position
         FROM users u WHERE u.role = 'PASIEN' ORDER BY u.name ASC`
      );
      return jsonResponse(res, true, 'Kontak berhasil diambil.', {
        contacts: contacts.map((c) => ({ ...c, wa_link: formatWaLink(c.phone) })),
        role_label: 'Pasien',
      });
    } else {
      const [contacts] = await db.execute(
        `SELECT u.id, u.name, u.email, u.phone, u.alamat, 'Perawat' AS position
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
