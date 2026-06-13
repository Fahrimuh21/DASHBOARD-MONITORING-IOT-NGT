const db = require('../config/db');

/**
 * Port dari PHP AlertService.php + NotificationService.php
 */
class AlertService {
  async createIfNeeded(conn, deviceId, readingId, riskLevel, respiratoryPatternDetected, message) {
    const shouldCreate =
      ['MEDIUM', 'HIGH'].includes(riskLevel) || respiratoryPatternDetected === 1;

    if (!shouldCreate) return null;

    const level = ['MEDIUM', 'HIGH'].includes(riskLevel) ? riskLevel : 'MEDIUM';

    const titleMap = {
      HIGH: 'BAHAYA: Risiko malposisi NGT terdeteksi!',
      MEDIUM: 'WASPADA: Verifikasi posisi selang NGT diperlukan',
    };

    const title = titleMap[level] || 'Alert CO2 NGT';

    const [result] = await (conn || db).execute(
      `INSERT INTO alerts (device_id, reading_id, title, message, level, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [deviceId, readingId, title, message, level]
    );

    return result.insertId;
  }
}

module.exports = new AlertService();
