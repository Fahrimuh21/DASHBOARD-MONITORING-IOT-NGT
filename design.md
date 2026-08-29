# Design System Naspiotech

Dokumen ini merangkum bahasa desain untuk web Naspiotech, aplikasi pemantauan CO2 real-time untuk membantu observasi keamanan posisi selang NGT. Sistem desain ini mengikuti UI yang sudah ada di frontend Vue dan dipakai sebagai acuan ketika menambah halaman, komponen, atau state baru.

## Prinsip Desain

### Tenang, Klinis, dan Mudah Dipindai

Antarmuka harus terasa aman dan menenangkan, bukan ramai. Karena konteksnya pemantauan kesehatan, informasi penting harus cepat terbaca: status perangkat, kadar CO2, status NGT, tren, dan notifikasi.

### Realtime Tanpa Panik

Gunakan visual status yang jelas, tetapi hindari gaya yang terlalu agresif. Warna merah hanya untuk kondisi bahaya atau risiko tinggi. Status aman tetap dominan agar pengguna merasa sistem sedang memantau dengan stabil.

### Mobile-First untuk Penggunaan Lapangan

Pasien dan perawat kemungkinan membuka dashboard lewat perangkat mobile. Setiap kartu, tombol, drawer, tabel alternatif, dan status harus tetap rapi di layar kecil.

### Glass Modern dengan Struktur Padat

Identitas UI memakai permukaan glass, bayangan lembut, radius besar, dan aksen mint/teal. Walau modern, layout tetap padat dan fungsional seperti dashboard operasional.

## Identitas Produk

Nama produk utama: **Naspiotech** atau **Naspiontech** sesuai konteks layar yang sudah ada.

Deskripsi singkat:

> Realtime CO2 monitoring untuk keamanan pemasangan NGT.

Nada komunikasi:

- Hangat dan menenangkan.
- Informatif, tidak terlalu teknis untuk pasien.
- Tegas dan langsung untuk status klinis.
- Hindari kalimat yang membuat pengguna panik.

Contoh copy:

- "Posisi selang makan (NGT) terpantau, Anda tetap tenang."
- "Kadar CO2 terbaca"
- "Belum ada notifikasi. Semua kondisi aman!"
- "Yuk, hubungkan perangkat Anda agar kami bisa mulai memantau."

## Warna

### Warna Utama

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--primary` | `#10b981` | Aksi utama, status aman, aksen aktif |
| `--primary-dark` | `#047857` | Teks aksen, hover, label aktif |
| `--primary-soft` | `#a7f3d0` | Avatar lembut, permukaan hijau muda |
| `--primary-mint` | `#dcfce7` | Background pill, state aktif ringan |
| `--teal` | `#14b8a6` | CO2, baseline, data sensor |

### Warna Pendukung

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--blue` | `#2563eb` | Aksen sekunder |
| `--sky` | `#0ea5e9` | Status perangkat, konektivitas |
| `--violet` | `#7c3aed` | Form password atau aksen non-klinis |
| `--amber` | `#f59e0b` | Waspada, observasi |
| `--rose` | `#e11d48` | Aksen bahaya terbatas |
| `--slate` | `#475569` | Netral kuat |

### Status

| Status | Warna | Background | Penggunaan |
| --- | --- | --- | --- |
| Aman | `#10b981` | `#ecfdf5` | CO2 normal, NGT aman |
| Waspada | `#f59e0b` | `#fffbeb` | Perlu observasi/verifikasi |
| Bahaya | `#ef4444` | `#fef2f2` | Risiko tinggi, deviasi serius |
| Offline | `#64748b` | `#f1f5f9` | Perangkat tidak terhubung |
| Info | `#0ea5e9` | `#f0f9ff` | Informasi umum |

### Netral dan Permukaan

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--bg` | `#f6fbf8` | Background utama |
| `--surface` | `rgba(255,255,255,.74)` | Card glass |
| `--surface-strong` | `rgba(255,255,255,.92)` | Modal/drawer/permukaan penting |
| `--surface-solid` | `#ffffff` | Form, tabel, elemen solid |
| `--text` | `#0f1f1a` | Teks utama |
| `--text-soft` | `#526175` | Teks sekunder |
| `--muted` | `#94a3b8` | Placeholder, empty state |
| `--border` | `rgba(15,23,42,.08)` | Garis pemisah ringan |
| `--border-strong` | `rgba(15,23,42,.14)` | Border interaktif |

## Tipografi

Font utama: **Poppins**.

Fallback:

```css
font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Skala tipografi:

| Elemen | Ukuran | Berat | Catatan |
| --- | --- | --- | --- |
| Hero title dashboard | `clamp(24px, 3.4vw, 38px)` | `800` | Untuk pesan utama |
| Landing hero | `clamp(30px, 4vw, 56px)` | `800` | Khusus landing page |
| Section title | `clamp(14px, 1.4vw, 18px)` | `700` | Header panel/dashboard |
| Card value | `clamp(17px, 1.6vw, 23px)` | `800` | Angka CO2, status, hitungan |
| Body text | `13px - 15px` | `400 - 500` | Deskripsi dan informasi |
| Label kecil | `9px - 11px` | `700 - 900` | Uppercase untuk field label |
| Badge text | `9px - 12px` | `700 - 800` | Status dan pill |

Aturan:

- Gunakan angka besar hanya untuk metrik utama.
- Label metrik sebaiknya uppercase kecil dengan letter spacing ringan.
- Hindari teks panjang di dalam tombol.
- Gunakan `line-height` sekitar `1.5 - 1.78` untuk paragraf.

## Spacing dan Radius

### Spacing

| Token Praktis | Nilai | Penggunaan |
| --- | --- | --- |
| `4px` | Micro gap | Ikon kecil, status inline |
| `8px` | Gap kecil | Navbar link, tombol kecil |
| `12px` | Gap standar | Card internal, form row |
| `16px` | Gap sedang | Grid card, panel |
| `18px` | Card padding umum | Kartu dashboard |
| `24px` | Section/card besar | Hero kecil, modal |
| `36px` | Page padding desktop | Shell utama |

### Radius

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--radius-sm` | `10px` | Input, ikon kecil |
| `--radius` | `18px` | Metric card, elemen standar |
| `--radius-lg` | `26px` | Card utama |
| `--radius-xl` | `34px` | Elemen besar/hero |
| `999px` | Full pill | Badge, nav item, CTA rounded |

## Elevation dan Glass

Shadow:

| Token | Nilai | Penggunaan |
| --- | --- | --- |
| `--shadow-xs` | `0 1px 2px rgba(15,23,42,.04)` | Elemen halus |
| `--shadow-sm` | `0 5px 14px rgba(15,23,42,.06)` | Card kecil |
| `--shadow` | `0 14px 34px rgba(15,23,42,.09)` | Card hover/aktif |
| `--shadow-lg` | `0 26px 60px rgba(15,23,42,.14)` | Drawer, auth card |
| `--shadow-glow` | `0 16px 44px rgba(16,185,129,.23)` | CTA utama |

Aturan glass:

- Card utama memakai `background: var(--surface)`, `border: 1px solid var(--glass-border)`, dan `backdrop-filter: blur(16px) saturate(160%)`.
- Drawer dan navbar boleh memakai blur lebih kuat.
- Jangan membuat terlalu banyak lapisan card di dalam card; gunakan list row atau section kecil.

## Layout

### App Shell

Gunakan `.app-shell` untuk halaman aplikasi setelah login.

```css
.app-shell {
  width: min(100%, 1440px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 28px 36px 108px;
}
```

Responsive:

- Desktop: padding horizontal `36px`.
- Tablet: padding `20px 18px 104px`.
- Mobile: grid menjadi satu kolom.

### Dashboard Grid

Pola utama dashboard:

- Metric row: 4 kolom di desktop.
- Main content: 2 kolom, kolom kiri lebih lebar.
- Tablet/mobile: semua menjadi 1 kolom.

```css
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.dashboard-page .dashboard-grid {
  grid-template-columns: minmax(0, 2fr) minmax(310px, .92fr);
}
```

### Landing Page

Landing page memakai namespace `.lp-*` agar tidak bentrok dengan dashboard. Gunakan layout editorial lebih lega, tetapi tetap mempertahankan warna hijau, white surface, dan radius besar.

## Komponen

### Navbar Aplikasi

Karakter:

- Sticky di atas.
- Glass surface.
- Brand di kiri, navigasi di tengah, user action di kanan.
- Desktop menyembunyikan link saat lebar kurang dari `1300px`, lalu memakai drawer.

State:

- Link normal: teks slate.
- Hover: background mint, teks `--primary-dark`.
- Active: gradient mint dan shadow lembut.

### Bottom Navbar

Digunakan hanya mobile (`max-width: 768px`). Bentuk pill fixed di bawah layar.

Aturan:

- Ikon harus mudah dikenali.
- Active item memakai gradient primary dan teks putih.
- Jangan menaruh label panjang di bottom navbar.

### Button

Varian utama:

| Kelas | Penggunaan |
| --- | --- |
| `.btn-primary` | CTA utama di hero dashboard |
| `.btn-secondary` | CTA pendamping |
| `.btn.primary` | Submit/form action utama |
| `.btn.ghost` | Action ringan seperti logout/perbarui |
| `.btn-whatsapp` | Action kontak WhatsApp |

Aturan:

- Gunakan full-width di mobile untuk CTA besar.
- Hover boleh `translateY(-2px)` dengan shadow bertambah.
- Tombol destruktif harus memakai warna bahaya dan tidak disamakan dengan CTA utama.

### Card

Card utama memakai `.card`.

Karakter:

- Radius `--radius-lg`.
- Border glass.
- Background semi-transparan.
- Shadow lembut.
- Hover menaikkan shadow dan border hijau.

Gunakan card untuk:

- Panel chart.
- Panel alert.
- Form section.
- Item pasien/perangkat/kontak.

Hindari:

- Card di dalam card tanpa kebutuhan jelas.
- Dekorasi berlebihan yang mengganggu data.

### Metric Card

Metric card adalah elemen ringkas untuk angka atau status utama.

Struktur:

- Label kecil.
- Value besar.
- Unit kecil.
- Accent bar di kiri.
- Glow dekoratif halus di kanan atas.

Varian:

| Kelas | Warna | Penggunaan |
| --- | --- | --- |
| `.co2` | Teal | Kadar CO2 |
| `.trend` | Primary | Tren/baseline |
| `.device` | Sky | Status perangkat |
| `.alert` | Amber | Notifikasi |

### Status Badge

Status badge wajib ringkas dan jelas.

Mapping:

- CO2 `< 1000`: `Status Aman`
- CO2 `1000 - 2000`: `Status Waspada`
- CO2 `> 2000`: `Status Bahaya`
- Offline/null: `Device Offline`

Gunakan label Indonesia untuk pengguna akhir:

- Aman
- Waspada
- Bahaya
- Offline
- Belum Diketahui

### Alert Row

Alert row harus bisa dipindai cepat.

Isi minimal:

- Ikon/status.
- Judul atau level.
- Waktu.
- Pesan singkat jika ada.

Prioritas warna:

- `danger` untuk bahaya.
- `warning` untuk waspada.
- `safe` untuk aman.

### Empty State

Empty state memakai `.empty`.

Karakter:

- Border dashed.
- Teks muted.
- Background putih transparan.
- Jika ada aksi lanjutan, tempatkan tombol di bawah pesan.

Contoh:

- "Belum ada pasien yang terhubung saat ini."
- "Belum ada notifikasi. Semua kondisi aman!"

### Form

Form memakai input rounded, border ringan, dan label kecil.

Aturan:

- Label harus jelas dan tidak terlalu teknis.
- Input auth lebih compact.
- Error memakai `.alert-box.error`.
- Optional field ditandai dengan teks kecil, bukan warna mencolok.

## Ikonografi

Saat ini ikon banyak ditulis sebagai inline SVG. Gaya ikon:

- Stroke `2`.
- `fill: none`.
- Round cap dan join.
- Ukuran umum `16px - 20px`.

Makna ikon:

| Ikon | Penggunaan |
| --- | --- |
| Grid | Dashboard |
| Activity/polyline | Monitoring atau CO2 |
| Clock | Riwayat |
| Bell | Notifikasi |
| Phone | Kontak |
| Device/phone | Perangkat |
| Wifi | Koneksi |

## Motion

Durasi dan easing:

```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);
```

Aturan:

- Hover card: `translateY(-3px)`.
- Hover button: `translateY(-2px)`.
- Drawer mobile: slide dari kanan.
- Spinner dipakai untuk loading data.
- Hormati `prefers-reduced-motion: reduce`.

## Responsive Breakpoints

| Breakpoint | Perubahan |
| --- | --- |
| `1300px` | Navbar desktop link disembunyikan, hamburger muncul |
| `980px` | Dashboard grid menjadi satu kolom, metric grid 2 kolom |
| `768px` | Metric grid 1 kolom, hero stack, CTA full-width, tabel riwayat diganti card list |
| `480px` | Landing hero dan carousel lebih compact |

## Aksesibilitas

Aturan minimum:

- Navbar memiliki `aria-label`.
- Tombol drawer punya label aksesibel.
- Gambar memakai alt yang menjelaskan isi.
- Status tidak hanya mengandalkan warna; selalu tampilkan teks.
- Fokus keyboard harus terlihat pada tombol, link, dan input.
- Jangan menyembunyikan informasi penting hanya di hover.

## Panduan Konten

### Untuk Pasien

Gunakan bahasa sederhana:

- "Kadar CO2"
- "Status NGT"
- "Aman"
- "Waspada"
- "Bahaya"
- "Hubungkan perangkat"

Hindari istilah teknis tanpa konteks:

- "baseline deviation" sebaiknya menjadi "Perubahan dari baseline".
- "risk level HIGH" sebaiknya menjadi "Bahaya".

### Untuk Perawat

Boleh lebih operasional:

- "Pasien yang Anda Pantau"
- "Token & Device"
- "Perbarui Data"
- "Kamar"
- "Status Perangkat"

## Do and Don't

### Do

- Pakai token warna yang sudah ada.
- Gunakan card ringkas untuk data real-time.
- Selalu tampilkan waktu pembacaan terakhir.
- Gunakan status teks + warna.
- Pertahankan visual hijau/mint sebagai identitas utama.
- Pastikan mobile tetap nyaman dibaca.

### Don't

- Jangan memakai merah untuk hal selain bahaya.
- Jangan membuat dashboard terlalu dekoratif.
- Jangan memasukkan paragraf panjang di card metrik.
- Jangan membuat warna baru jika token yang ada sudah cukup.
- Jangan mengubah pola radius dan shadow tanpa alasan.
- Jangan memakai istilah teknis mentah untuk pasien.

## Checklist Saat Menambah UI Baru

- Apakah komponen memakai token warna yang sudah ada?
- Apakah status punya label teks, bukan hanya warna?
- Apakah layout aman di `768px` ke bawah?
- Apakah value utama mudah terlihat dalam 1 detik?
- Apakah empty/loading/error state tersedia?
- Apakah copy sesuai konteks pasien atau perawat?
- Apakah elemen interaktif punya hover/focus state?
- Apakah tidak ada card bersarang yang membuat UI terasa berat?

