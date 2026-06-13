# Konversi PHP Native → Vue.js + Node.js

## Ringkasan

Aplikasi **NGT-Safe CO2** adalah dashboard IoT monitoring selang NGT berbasis CO2 untuk ESP32. Saat ini menggunakan PHP native + MySQL. 

Kita akan mengkonversi menjadi arsitektur modern **monorepo** dengan:
- **Backend**: Node.js (Express) + MySQL2 — menggantikan PHP
- **Frontend**: Vue 3 (Vite) + Vue Router + Pinia — menggantikan PHP template
- Database schema **tidak berubah** (reuse `schema.sql`)

---

## Arsitektur Target

```
co2-temperature-iot-dashboard/
├── arduino/                    # tidak berubah
├── php-native-app/             # tetap ada (tidak dihapus)
└── vue-node-app/               # BARU
    ├── backend/                # Node.js Express API
    │   ├── src/
    │   │   ├── config/         # db config, app constants
    │   │   ├── middleware/     # auth, error handler
    │   │   ├── routes/         # auth, readings, alerts, devices, contacts
    │   │   ├── services/       # NgtStatusService, TrendService, AlertService
    │   │   └── index.js
    │   ├── package.json
    │   └── .env.example
    └── frontend/               # Vue 3 SPA
        ├── src/
        │   ├── assets/         # CSS (migrasi style.css)
        │   ├── components/     # AppNavbar, BottomNavbar, MetricCard, dll
        │   ├── stores/         # Pinia: auth, dashboard, alerts
        │   ├── views/          # 1 file per halaman
        │   │   ├── auth/       # Login, Register, VerifyEmail, ForgotPassword
        │   │   ├── Dashboard.vue
        │   │   ├── Monitoring.vue
        │   │   ├── History.vue
        │   │   ├── Notifications.vue
        │   │   ├── Contact.vue
        │   │   ├── Profile.vue
        │   │   ├── ConnectDevice.vue
        │   │   └── admin/      # Devices, DeviceCreate, DeviceEdit
        │   ├── router/index.js # Vue Router dengan route guards
        │   └── main.js
        ├── package.json
        └── vite.config.js
```

---

## Perubahan yang Diperlukan

### Backend — Node.js/Express

#### [NEW] `vue-node-app/backend/`

**`package.json`**
- Dependencies: `express`, `mysql2`, `bcryptjs`, `express-session`, `cors`, `dotenv`, `express-validator`

**`src/config/db.js`** — pool connection MySQL2 (pengganti `config/database.php`)

**`src/config/app.js`** — konstanta app (APP_NAME, OFFLINE_SECONDS, dll)

**`src/middleware/auth.js`** — `requireAuth`, `requireNurse`, `requirePatient` (pengganti `auth_check.php`, `admin_check.php`)

**`src/services/NgtStatusService.js`** — port dari PHP `NgtStatusService.php`

**`src/services/TrendService.js`** — port dari PHP `TrendService.php`

**`src/services/AlertService.js`** — port dari PHP `AlertService.php`

**`src/routes/auth.js`** — `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `POST /api/auth/verify-email`, `POST /api/auth/forgot-password`

**`src/routes/readings.js`** — `GET /api/readings`, `GET /api/readings/latest`, `POST /api/sensor/reading` (untuk ESP32)

**`src/routes/alerts.js`** — `GET /api/alerts`, `PUT /api/alerts/:id/read`, `GET /api/alerts/unread-count`

**`src/routes/devices.js`** — CRUD device untuk admin perawat + `POST /api/devices/connect`, `POST /api/devices/disconnect`

**`src/routes/contacts.js`** — `GET /api/contacts`

**`src/routes/profile.js`** — `GET /api/profile`, `PUT /api/profile`

---

### Frontend — Vue 3 + Vite

#### [NEW] `vue-node-app/frontend/`

**`src/assets/style.css`** — **Migrasi penuh** CSS dari `style.css` PHP (glassmorphism, token warna, komponen)

**`src/router/index.js`** — Vue Router dengan navigation guards (redirect ke login jika belum auth)

**`src/stores/auth.js`** (Pinia) — state user, login, logout, register

**`src/stores/dashboard.js`** (Pinia) — polling realtime tiap 5 detik

**`src/stores/alerts.js`** (Pinia) — alert & notifikasi

**`src/components/`**:
- `AppNavbar.vue` — top navbar glassmorphism + mobile drawer
- `BottomNavbar.vue` — bottom dock mobile
- `MetricCard.vue` — card metrik (CO2, risk, online, harian)
- `Co2Donut.vue` — donut chart CSS murni (dari PHP dashboard)
- `AlertRow.vue` — baris alert
- `ContactItem.vue` — item kontak

**`src/views/auth/LoginView.vue`** — form login dengan role switch (PASIEN/PERAWAT)

**`src/views/auth/RegisterView.vue`** — form registrasi

**`src/views/auth/VerifyEmailView.vue`** — input OTP

**`src/views/auth/ForgotPasswordView.vue`** — form lupa password

**`src/views/DashboardView.vue`** — dashboard utama + nurse patient list, polling 5s

**`src/views/MonitoringView.vue`** — live sensor monitoring

**`src/views/HistoryView.vue`** — riwayat dengan filter

**`src/views/NotificationsView.vue`** — daftar alert

**`src/views/ContactView.vue`** — kontak perawat/pasien

**`src/views/ProfileView.vue`** — profil akun

**`src/views/ConnectDeviceView.vue`** — koneksi device (pasien)

**`src/views/admin/DevicesView.vue`** — manajemen device (perawat)

**`src/views/admin/DeviceCreateView.vue`** — tambah device

**`src/views/admin/DeviceEditView.vue`** — edit device

---

## User Review Required

> [!IMPORTANT]
> **Session vs JWT**: Backend akan menggunakan `express-session` (sama dengan PHP session) untuk simplisitas. Jika ingin stateless/JWT, harap beritahu.

> [!IMPORTANT]
> **Port backend**: Backend Node.js akan berjalan di `http://localhost:3001`, frontend Vite di `http://localhost:5173`. Vite akan proxy `/api` ke backend sehingga tidak ada CORS issue di dev.

> [!NOTE]
> **PHP app tidak akan dihapus** — hanya ditambah folder `vue-node-app/` baru. Kedua versi bisa berjalan bersamaan.

> [!NOTE]  
> **Email OTP**: Fitur verify email di PHP menyimpan OTP ke database dan menampilkan di session (mode dev). Di Node.js, kita pertahankan pola yang sama (dev display OTP).

---

## Open Questions

> [!IMPORTANT]
> **Database credentials**: Apakah tetap `localhost`, DB `ngt_safe_co2`, user `root`, password `""`? (Akan disimpan di `.env`)

---

## Verification Plan

### Automated (manual check)
- `npm run dev` di `backend/` — pastikan server berjalan di port 3001
- `npm run dev` di `frontend/` — pastikan Vite berjalan di port 5173
- Test ESP32 endpoint: `POST /api/sensor/reading` dengan header `x-device-token`

### Manual Verification
- Login sebagai pasien & perawat
- Dashboard polling 5 detik
- Connect device (pasien)
- Admin device management (perawat)
- Riwayat & filter
- Notifikasi alert
- Kontak WhatsApp
