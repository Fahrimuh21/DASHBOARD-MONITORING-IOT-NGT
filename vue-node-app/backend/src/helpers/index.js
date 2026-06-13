const { OFFLINE_SECONDS } = require('../config/app');

/**
 * Format datetime string ke 'd M Y H:i:s' (id-ID)
 */
function formatDatetime(value) {
  if (!value) return '-';
  const date = new Date(String(value).replace(' ', 'T'));
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Cek status online berdasarkan last_seen_at
 */
function onlineStatus(lastSeen) {
  if (!lastSeen) return 'OFFLINE';
  const diffSec = (Date.now() - new Date(lastSeen).getTime()) / 1000;
  return diffSec <= OFFLINE_SECONDS ? 'ONLINE' : 'OFFLINE';
}

/**
 * Kembalikan user role dari session
 */
function currentUserRole(req) {
  return ((req.session?.role) || '').toUpperCase();
}

function isNurse(req) {
  return currentUserRole(req) === 'PERAWAT';
}

function isPatient(req) {
  return currentUserRole(req) === 'PASIEN';
}

/**
 * Kembalikan WHERE clause dan params untuk device access control
 * Perawat: semua device. Pasien: hanya device miliknya.
 */
function deviceAccessClause(req, alias = 'd') {
  if (isNurse(req)) return { where: '', params: [] };
  return {
    where: `${alias}.user_id = ?`,
    params: [parseInt(req.session?.user_id || 0)],
  };
}

/**
 * Format nomor telepon menjadi link WhatsApp
 */
function formatWaLink(phone) {
  if (!phone) return '#';
  const clean = phone.replace(/\D/g, '');
  const wa = clean.startsWith('0') ? '62' + clean.slice(1) : clean;
  return 'https://wa.me/' + wa;
}

/**
 * JSON response helper
 */
function jsonResponse(res, success, message, data = null, status = 200) {
  return res.status(status).json({ success, message, data });
}

module.exports = {
  formatDatetime,
  onlineStatus,
  currentUserRole,
  isNurse,
  isPatient,
  deviceAccessClause,
  formatWaLink,
  jsonResponse,
};
