# NGT-Safe CO2

Project utama saat ini berada di folder `php-native-app`.

NGT-Safe CO2 adalah aplikasi PHP Native + MySQL untuk prototipe PKM-KC monitoring selang NGT berbasis deteksi CO2. Sistem menerima data asli dari ESP32 melalui HTTP POST, menyimpan pembacaan ke MySQL, menghitung status indikasi posisi NGT, membuat alert, dan menampilkan dashboard mobile web.

Jalankan melalui:

```text
http://localhost/co2-temperature-iot-dashboard/php-native-app/
```

Dokumentasi lengkap tersedia di:

```text
php-native-app/README.md
```

Catatan klinis: aplikasi ini adalah prototipe skrining awal dan tidak menggantikan prosedur verifikasi klinis seperti pH aspirat, radiografi, atau prosedur rumah sakit. Threshold memerlukan kalibrasi dan validasi lebih lanjut.

Role aplikasi:

- Pasien: hanya melihat 1 device IoT yang terhubung ke akun pasien.
- Perawat: melihat dan mengelola beberapa data pasien/device.

Akun demo dibuat melalui `php-native-app/database/setup_admin.php`:

- `pasien@iot.local` / `pasien123`
- `perawat@iot.local` / `perawat123`
