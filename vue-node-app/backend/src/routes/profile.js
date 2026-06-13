const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { jsonResponse } = require('../helpers');

// GET /api/profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, alamat, profile_photo, role, email_verified_at, created_at FROM users WHERE id = ? LIMIT 1',
      [req.session.user_id]
    );
    if (!rows[0]) return jsonResponse(res, false, 'User tidak ditemukan.', null, 404);
    return jsonResponse(res, true, 'Profil berhasil diambil.', { user: rows[0] });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal mengambil profil.', null, 500);
  }
});

// PUT /api/profile
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, phone, alamat, profile_photo, password, confirm_password } = req.body;

    if (!name || !phone) {
      return jsonResponse(res, false, 'Nama dan no telepon wajib diisi.', null, 400);
    }

    if (password) {
      if (password.length < 6) {
        return jsonResponse(res, false, 'Password minimal 6 karakter.', null, 400);
      }
      if (password !== confirm_password) {
        return jsonResponse(res, false, 'Konfirmasi password tidak cocok.', null, 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute(
        'UPDATE users SET name = ?, phone = ?, alamat = ?, profile_photo = ?, password = ?, updated_at = NOW() WHERE id = ?',
        [name, phone, alamat || null, profile_photo || null, hashedPassword, req.session.user_id]
      );
    } else {
      await db.execute(
        'UPDATE users SET name = ?, phone = ?, alamat = ?, profile_photo = ?, updated_at = NOW() WHERE id = ?',
        [name, phone, alamat || null, profile_photo || null, req.session.user_id]
      );
    }

    // Update session
    req.session.name = name;
    req.session.profile_photo = profile_photo || null;

    return jsonResponse(res, true, 'Profil berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal memperbarui profil.', null, 500);
  }
});

module.exports = router;
