# NGT-Safe CO2

NGT-Safe CO2 adalah prototipe dashboard IoT untuk memantau indikasi posisi selang nasogastrik (NGT) berdasarkan pembacaan CO2. Data dikirim oleh ESP32 ke REST API, diproses menjadi tingkat risiko, disimpan di MySQL, lalu ditampilkan secara real-time melalui dashboard web.

> [!WARNING]
> Aplikasi ini merupakan prototipe skrining awal, bukan alat diagnosis. Hasilnya tidak menggantikan verifikasi klinis seperti pemeriksaan pH aspirat, radiografi, atau prosedur rumah sakit. Nilai ambang CO2 masih memerlukan kalibrasi dan validasi lebih lanjut.

## Fitur

- Autentikasi berbasis session untuk pasien dan perawat
- Dashboard pembacaan CO2 terbaru dengan polling berkala
- Klasifikasi risiko `LOW`, `MEDIUM`, dan `HIGH`
- Riwayat pembacaan dan notifikasi peringatan
- Pengelolaan serta pengaitan device dengan pasien
- Profil pengguna dan daftar kontak
- Endpoint HTTP untuk pengiriman data dari ESP32
- Tampilan responsif berbasis Vue 3

## Teknologi

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios
- **Backend:** Node.js, Express, MySQL2, Express Session
- **Database:** MySQL
- **IoT:** ESP32, ArduinoJson, HTTPClient

## Struktur Proyek

```text
co2-temperature-iot-dashboard/
|-- arduino/
|   `-- esp32_sensor_sender/    # Firmware pengirim data sensor
|-- vue-node-app/
|   |-- backend/                # REST API Express dan schema database
|   `-- frontend/               # Single-page application Vue 3
|-- implementation_plan.md
`-- README.md
```

## Prasyarat

Pastikan perangkat berikut sudah tersedia:

- Node.js 18 atau versi yang lebih baru
- npm
- MySQL 8 atau MariaDB yang kompatibel
- Arduino IDE atau PlatformIO jika menggunakan ESP32

## Instalasi

### 1. Siapkan database

Jalankan schema berikut melalui MySQL CLI, phpMyAdmin, atau aplikasi database lain:

```bash
mysql -u root -p < vue-node-app/backend/schema.sql
```

Script tersebut membuat database `ngt_safe_co2`, tabel aplikasi, dan dua akun demo.

> [!CAUTION]
> `schema.sql` menjalankan `DROP DATABASE IF EXISTS ngt_safe_co2`. Jangan jalankan pada database yang berisi data penting tanpa membuat backup.

### 2. Konfigurasi backend

Buat file `vue-node-app/backend/.env` dengan isi berikut:

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ngt_safe_co2
DB_USER=root
DB_PASS=

SESSION_SECRET=ganti-dengan-secret-yang-kuat
OFFLINE_SECONDS=15
```

Kemudian instal dependensi backend:

```bash
cd vue-node-app/backend
npm install
```

### 3. Konfigurasi frontend

Instal dependensi frontend:

```bash
cd vue-node-app/frontend
npm install
```

Pada mode development, Vite meneruskan request `/api` ke backend di `http://localhost:3001`.

## Menjalankan Aplikasi

Buka dua terminal dari root proyek.

Terminal backend:

```bash
cd vue-node-app/backend
npm run dev
```

Terminal frontend:

```bash
cd vue-node-app/frontend
npm run dev
```

Buka aplikasi melalui:

```text
http://localhost:5173
```

Health check backend tersedia di:

```text
http://localhost:3001/api/health
```

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Pasien | `pasien@iot.local` | `pasien123` |
| Perawat | `perawat@iot.local` | `perawat123` |

Perawat dapat mengelola beberapa pasien dan device. Pasien hanya dapat menghubungkan satu device ke akunnya.

## Menghubungkan ESP32

Firmware contoh tersedia di `arduino/esp32_sensor_sender/esp32_sensor_sender.ino`. Sesuaikan konfigurasi berikut sebelum mengunggah firmware:

```cpp
const char* WIFI_SSID = "NAMA_WIFI";
const char* WIFI_PASSWORD = "PASSWORD_WIFI";
const char* SERVER_URL = "http://IP_KOMPUTER:3001/api/readings/sensor/reading";
const char* DEVICE_CODE = "KODE_DEVICE";
const char* DEVICE_TOKEN = "TOKEN_DEVICE";
```

Gunakan alamat IP komputer pada jaringan lokal, bukan `localhost`. `DEVICE_CODE` dan `DEVICE_TOKEN` harus sama dengan data device yang dibuat oleh akun perawat.

Contoh payload yang dikirim:

```json
{
  "device_code": "ESP32-CO2-001",
  "co2_ppm": 450
}
```

Token device dikirim melalui header:

```text
x-device-token: TOKEN_DEVICE
```

## Build Production

Untuk membuat build frontend:

```bash
cd vue-node-app/frontend
npm run build
```

Hasil build tersimpan di `vue-node-app/frontend/dist`. Backend dapat dijalankan dengan:

```bash
cd vue-node-app/backend
npm start
```

Konfigurasi deployment production, HTTPS, penyimpanan session persisten, dan penyajian folder `dist` perlu disiapkan sesuai server tujuan.

## Catatan Pengembangan

- OTP registrasi dan reset password masih dikembalikan melalui response API untuk kebutuhan development.
- Session masih menggunakan memory store bawaan Express dan belum cocok untuk deployment production multi-instance.
- Fungsi pembacaan sensor pada firmware contoh masih berupa placeholder dan harus disesuaikan dengan sensor CO2 yang digunakan.
- Status device dianggap offline jika tidak mengirim data melebihi nilai `OFFLINE_SECONDS`.

## Lisensi

Belum ada lisensi yang ditetapkan untuk proyek ini.
