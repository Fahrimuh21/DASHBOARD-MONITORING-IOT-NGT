require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const readingsRoutes = require('./routes/readings');
const alertsRoutes = require('./routes/alerts');
const devicesRoutes = require('./routes/devices');
const contactsRoutes = require('./routes/contacts');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'ngt_sid',
  secret: process.env.SESSION_SECRET || 'ngt-safe-co2-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set true di production dengan HTTPS
    maxAge: 8 * 60 * 60 * 1000, // 8 jam
    sameSite: 'lax',
  },
}));

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/sensor', readingsRoutes);   // alias untuk ESP32 endpoint
app.use('/api/alerts', alertsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'NGT-Safe CO2 Backend', timestamp: new Date().toISOString() });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.', data: null });
});

// Error handler (harus paling akhir)
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ NGT-Safe CO2 Backend berjalan di http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
