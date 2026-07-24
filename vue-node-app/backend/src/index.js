require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');

require('./mqttSubscriber'); // MQTT START

const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const authRoutes = require('./routes/auth');
const readingsRoutes = require('./routes/readings');
const alertsRoutes = require('./routes/alerts');
const devicesRoutes = require('./routes/devices');
const contactsRoutes = require('./routes/contacts');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const frontendDistExists = fs.existsSync(frontendDistPath);

if (isProduction) {
  app.set('trust proxy', 1);
}

// MIDDLEWARE
app.use(requestLogger);

app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim()),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'ngt_sid',
  secret: process.env.SESSION_SECRET || 'ngt-safe',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    maxAge: 8 * 60 * 60 * 1000,
    sameSite: isProduction ? 'none' : 'lax',
  },
}));

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/sensor', readingsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/profile', profileRoutes);

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    mode: 'MQTT + HTTP HYBRID'
  });
});

if (frontendDistExists) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else if (isProduction) {
  console.warn('WARNING: frontend/dist tidak ditemukan. Pastikan frontend sudah dibuild dengan `npm --prefix frontend run build`.');
}

// ERROR HANDLER
app.use(errorHandler);

// START SERVER
app.listen(PORT, () => {
  console.log('====================================');
  console.log('🚀 BACKEND RUNNING');
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('📡 MQTT ACTIVE');
  console.log('====================================');
});

module.exports = app;
