const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { jsonResponse } = require('../helpers');
const mailer = require('../services/Mailer');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return jsonResponse(res, false, 'Email dan password wajib diisi.', null, 400);
    }

    const selectedRole = ['PASIEN', 'PERAWAT'].includes((role || '').toUpperCase())
      ? role.toUpperCase()
      : 'PASIEN';

    const [rows] = await db.execute(
      'SELECT id, name, email, password, role, profile_photo, email_verified_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return jsonResponse(res, false, 'Email atau password salah.', null, 401);
    }

    if (user.role.toUpperCase() !== selectedRole) {
      return jsonResponse(res, false, 'Role yang dipilih tidak sesuai dengan akun.', null, 401);
    }

    if (!user.email_verified_at) {
      // Generate OTP baru untuk verifikasi
      const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      try {
        await mailer.sendOtp(user.email, otp, 'verify');
      } catch (mailErr) {
        console.error('Gagal mengirim email OTP:', mailErr.message);
        return jsonResponse(res, false, 'Gagal mengirim kode OTP ke email. Periksa konfigurasi email server.', null, 502);
      }

      await db.execute(
        'UPDATE users SET otp_code = ?, otp_expires_at = ?, updated_at = NOW() WHERE id = ?',
        [otp, otpExpires, user.id]
      );

      req.session.pending_verify_email = user.email;

      return jsonResponse(res, false, 'Email belum diverifikasi. Kode OTP telah dikirim ke email Anda.', {
        need_verification: true,
        email: user.email,
      }, 403);
    }

    req.session.regenerate((err) => {
      if (err) throw err;
      req.session.user_id = user.id;
      req.session.name = user.name;
      req.session.email = user.email;
      req.session.role = user.role.toUpperCase();
      req.session.profile_photo = user.profile_photo || null;

      return jsonResponse(res, true, 'Login berhasil.', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toUpperCase(),
          profile_photo: user.profile_photo || null,
        },
      });
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Login gagal. Periksa koneksi database.', null, 500);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirm_password, phone, alamat, role } = req.body;

    if (!name || !email || !password || !phone) {
      return jsonResponse(res, false, 'Nama, email, password, dan no telepon wajib diisi.', null, 400);
    }
    if (password.length < 6) {
      return jsonResponse(res, false, 'Password minimal 6 karakter.', null, 400);
    }
    if (password !== confirm_password) {
      return jsonResponse(res, false, 'Konfirmasi password tidak cocok.', null, 400);
    }

    const selectedRole = ['PASIEN', 'PERAWAT'].includes((role || '').toUpperCase())
      ? role.toUpperCase()
      : 'PASIEN';

    const [existing] = await db.execute(
      'SELECT id, email_verified_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existing.length > 0) {
      if (existing[0].email_verified_at) {
        return jsonResponse(res, false, 'Email sudah terdaftar. Silakan login.', null, 409);
      }
      // Email ada tapi belum diverifikasi — kirim ulang OTP
      const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      try {
        await mailer.sendOtp(email, otp, 'verify');
      } catch (mailErr) {
        console.error('Gagal mengirim email OTP:', mailErr.message);
        return jsonResponse(res, false, 'Gagal mengirim kode OTP ke email. Periksa konfigurasi email server.', null, 502);
      }
      await db.execute(
        'UPDATE users SET otp_code = ?, otp_expires_at = ?, updated_at = NOW() WHERE id = ?',
        [otp, otpExpires, existing[0].id]
      );
      req.session.pending_verify_email = email;
      return jsonResponse(res, true, 'Email sudah terdaftar namun belum diverifikasi. Kode OTP baru telah dikirim.', { email }, 200);
    }

    const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // Kirim email dulu — jangan buat akun jika OTP gagal terkirim.
    try {
      await mailer.sendOtp(email, otp, 'verify');
    } catch (mailErr) {
      console.error('Gagal mengirim email OTP:', mailErr.message);
      return jsonResponse(res, false, 'Gagal mengirim kode OTP ke email. Periksa konfigurasi email server.', null, 502);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      `INSERT INTO users (name, email, password, role, phone, alamat, otp_code, otp_expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, hashedPassword, selectedRole, phone, alamat || null, otp, otpExpires]
    );

    req.session.pending_verify_email = email;

    return jsonResponse(res, true, 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.', {
      email,
    }, 201);
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Registrasi gagal. Periksa koneksi database.', null, 500);
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return jsonResponse(res, false, 'Email dan OTP wajib diisi.', null, 400);
    }

    const [rows] = await db.execute(
      'SELECT id, name, role, otp_code, otp_expires_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];
    if (!user) return jsonResponse(res, false, 'Email tidak ditemukan.', null, 404);

    if (user.otp_code !== String(otp).trim()) {
      return jsonResponse(res, false, 'OTP tidak valid.', null, 400);
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return jsonResponse(res, false, 'OTP sudah kadaluarsa.', null, 400);
    }

    await db.execute(
      'UPDATE users SET email_verified_at = NOW(), otp_code = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    return jsonResponse(res, true, 'Email berhasil diverifikasi. Silakan login.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Verifikasi gagal.', null, 500);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return jsonResponse(res, false, 'Email wajib diisi.', null, 400);

    const [rows] = await db.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      // Jangan bocorkan apakah email terdaftar
      return jsonResponse(res, true, 'Jika email terdaftar, OTP reset akan dikirim.');
    }

    const otp = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    try {
      await mailer.sendOtp(email, otp, 'reset');
    } catch (mailErr) {
      console.error('Gagal mengirim email OTP:', mailErr.message);
      return jsonResponse(res, false, 'Gagal mengirim kode OTP ke email. Periksa konfigurasi email server.', null, 502);
    }

    await db.execute(
      'UPDATE users SET otp_code = ?, otp_expires_at = ?, updated_at = NOW() WHERE id = ?',
      [otp, otpExpires, rows[0].id]
    );

    return jsonResponse(res, true, 'OTP reset password telah dikirim ke email Anda.', {
      email,
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal memproses permintaan.', null, 500);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password, confirm_password } = req.body;

    if (!email || !otp || !password) {
      return jsonResponse(res, false, 'Email, OTP, dan password wajib diisi.', null, 400);
    }
    if (password.length < 6) {
      return jsonResponse(res, false, 'Password minimal 6 karakter.', null, 400);
    }
    if (password !== confirm_password) {
      return jsonResponse(res, false, 'Konfirmasi password tidak cocok.', null, 400);
    }

    const [rows] = await db.execute(
      'SELECT id, otp_code, otp_expires_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user) return jsonResponse(res, false, 'Email tidak ditemukan.', null, 404);
    if (user.otp_code !== String(otp).trim()) {
      return jsonResponse(res, false, 'OTP tidak valid.', null, 400);
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return jsonResponse(res, false, 'OTP sudah kadaluarsa.', null, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'UPDATE users SET password = ?, otp_code = NULL, otp_expires_at = NULL, updated_at = NOW() WHERE id = ?',
      [hashedPassword, user.id]
    );

    return jsonResponse(res, true, 'Password berhasil direset. Silakan login.');
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal reset password.', null, 500);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    return jsonResponse(res, true, 'Logout berhasil.');
  });
});

// GET /api/auth/me — cek status login
router.get('/me', async (req, res) => {
  if (!req.session?.user_id) {
    return jsonResponse(res, false, 'Belum login.', null, 401);
  }
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, profile_photo FROM users WHERE id = ? LIMIT 1',
      [req.session.user_id]
    );

    if (!rows[0]) return jsonResponse(res, false, 'User tidak ditemukan.', null, 404);

    req.session.name = rows[0].name;
    req.session.email = rows[0].email;
    req.session.role = rows[0].role.toUpperCase();
    req.session.profile_photo = rows[0].profile_photo || null;

    return jsonResponse(res, true, 'Session aktif.', {
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role.toUpperCase(),
        profile_photo: rows[0].profile_photo || null,
      },
    });
  } catch (err) {
    console.error(err);
    return jsonResponse(res, false, 'Gagal memuat session.', null, 500);
  }
});

module.exports = router;
