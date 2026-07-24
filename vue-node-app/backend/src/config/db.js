const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'nasppion_ngt_safe_co2',
  user: process.env.DB_USER || 'naspiont_sysadm',
  password: process.env.DB_PASS || '8&P3qvSz*!Yot_9',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: process.env.DB_TIMEZONE || '+07:00',
});

module.exports = pool;
