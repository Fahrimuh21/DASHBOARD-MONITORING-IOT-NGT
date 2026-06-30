const db = require('../config/db');

class AlertService {
  async createIfNeeded(conn, deviceId, readingId, riskLevel, resp, message) {
    if (riskLevel === 'LOW') return;
    
    const title = 'Terdeteksi CO2'

    await (conn || db).execute(
      `INSERT INTO alerts 
      (device_id, reading_id, title, message, level, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [deviceId, readingId, title, message, riskLevel]
    );
  }
}

module.exports = new AlertService();