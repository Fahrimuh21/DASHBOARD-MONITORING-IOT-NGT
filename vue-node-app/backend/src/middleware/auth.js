const { jsonResponse } = require('../helpers');

/**
 * requireAuth — pastikan user sudah login
 */
function requireAuth(req, res, next) {
  if (!req.session?.user_id) {
    return jsonResponse(res, false, 'Unauthorized. Silakan login terlebih dahulu.', null, 401);
  }
  next();
}

/**
 * requireNurse — hanya untuk role PERAWAT
 */
function requireNurse(req, res, next) {
  if (!req.session?.user_id) {
    return jsonResponse(res, false, 'Unauthorized.', null, 401);
  }
  if ((req.session.role || '').toUpperCase() !== 'PERAWAT') {
    return jsonResponse(res, false, 'Akses ditolak. Hanya untuk perawat.', null, 403);
  }
  next();
}

/**
 * requirePatient — hanya untuk role PASIEN
 */
function requirePatient(req, res, next) {
  if (!req.session?.user_id) {
    return jsonResponse(res, false, 'Unauthorized.', null, 401);
  }
  if ((req.session.role || '').toUpperCase() !== 'PASIEN') {
    return jsonResponse(res, false, 'Akses ditolak. Hanya untuk pasien.', null, 403);
  }
  next();
}

module.exports = { requireAuth, requireNurse, requirePatient };
