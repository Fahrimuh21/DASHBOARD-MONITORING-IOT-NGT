const db = require('../config/db');

class AlertService {
  async createIfNeeded(conn, deviceId, readingId, riskLevel, resp, message) {
    if (riskLevel !== 'HIGH') return;

    const title = 'DANGER - Risiko tinggi NGT';
    const alertMessage = message || 'Risiko tinggi NGT';

    await (conn || db).execute(
      `INSERT INTO alerts 
      (device_id, reading_id, title, message, level, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [deviceId, readingId, title, alertMessage, riskLevel]
    );
  }
}

module.exports = new AlertService();
