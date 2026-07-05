# Naspiotech — Design System

Ringkasan token visual yang dipakai di frontend (Vue). Sumber kebenaran ada di
[`vue-node-app/frontend/src/assets/style.css`](vue-node-app/frontend/src/assets/style.css)
(dipakai di seluruh dashboard/app) dan style block di
[`LandingView.vue`](vue-node-app/frontend/src/views/LandingView.vue) (landing page publik).

## Typography

**Font:** [Poppins](https://fonts.google.com/specimen/Poppins) — di-load lewat Google Fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
```

Fallback stack: `'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Weight | Nilai | Dipakai untuk |
|---|---|---|
| Light | 300 | teks dekoratif/sub-halus |
| Regular | 400 | body text, deskripsi |
| Medium | 500 | label, sub-heading kecil |
| Semibold | 600 | tombol, nav link, judul kartu |
| Bold | 700 | heading section (`h2`, `h3`) |
| Extrabold | 800 | angka/metric, judul penting (profil, kontak, riwayat) |
| Black | 900 | hero headline (landing page) |

Konvensi lain yang konsisten dipakai:
- `letter-spacing: -.01em` sampai `-.02em` pada heading besar/angka (memberi kesan rapat & modern).
- `text-transform: uppercase` + `letter-spacing: .04–.14em` untuk label kecil (badge, eyebrow, cluster label).
- Ukuran dasar antar body text 11–14px untuk UI dashboard (padat, banyak data), naik ke `clamp(24px, 3.4vw, 34px)`+ untuk hero landing page.

## Main Color Palette

Didefinisikan sebagai CSS variable di `:root` — pakai variabel ini, jangan hardcode hex baru.

### Brand / Primary

| Token | Hex | Deskripsi |
|---|---|---|
| `--primary` | `#10b981` | Hijau emerald utama — CTA, ikon aktif, status "aman" |
| `--primary-dark` | `#047857` | Hover/aksen teks di atas latar terang |
| `--primary-soft` | `#a7f3d0` | Aksen lembut, border/glow tipis |
| `--primary-mint` | `#dcfce7` | Latar badge/chip, selection highlight |
| `--primary-glow` | `rgba(16,185,129,.28)` | Bayangan/glow di sekitar elemen primary |

### Aksen sekunder

| Token | Hex | Dipakai untuk |
|---|---|---|
| `--teal` | `#14b8a6` | Ikon CO₂, aksen kedua setelah hijau |
| `--sky` | `#0ea5e9` | Ikon device/monitor, info |
| `--blue` | `#2563eb` | Gradient biru (`--grad-blue`) |
| `--violet` | `#7c3aed` | Ikon password/keamanan |
| `--amber` | `#f59e0b` | Warning/peringatan |
| `--rose` | `#e11d48` | Aksen bahaya (jarang dipakai langsung, lihat semantic) |
| `--slate` | `#475569` | Teks/ikon netral sekunder |

### Netral & Background

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--bg` | `#f6fbf8` | Latar utama app |
| `--bg-grad` | radial+linear gradient mint/sky/violet pucat | Background dekoratif di belakang `--bg` |
| `--surface` / `--surface-strong` / `--surface-soft` | putih transparan (`.56`–`.92` alpha) | Kartu kaca (glassmorphism) |
| `--surface-solid` | `#ffffff` | Kartu solid (form, modal) |
| `--text` | `#0f1f1a` | Teks utama (hijau-hitam, bukan hitam murni) |
| `--text-soft` | `#526175` | Teks sekunder/deskripsi |
| `--muted` | `#94a3b8` | Placeholder, teks nonaktif |
| `--border` / `--border-strong` | `rgba(15,23,42,.08 / .14)` | Garis pembatas kartu/input |

### Semantic (status)

| Token | Hex | Arti |
|---|---|---|
| `--ok` / `--ok-bg` | `#10b981` / `#ecfdf5` | Status aman/normal |
| `--warn` / `--warn-bg` | `#f59e0b` / `#fffbeb` | Perlu perhatian |
| `--danger` / `--danger-bg` / `--danger-text` | `#ef4444` / `#fef2f2` / `#b91c1c` | Risiko tinggi/error |
| `--info` / `--info-bg` | `#0ea5e9` / `#f0f9ff` | Informasi netral |

### Gradient

| Token | Nilai |
|---|---|
| `--grad-primary` | `linear-gradient(135deg, #34d399 0%, #10b981 52%, #059669 100%)` |
| `--grad-blue` | `linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)` |
| `--grad-violet` | `linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)` |
| `--grad-amber` | `linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)` |
| `--grad-danger` | `linear-gradient(135deg, #fb7185 0%, #ef4444 100%)` |

Footer landing page pakai gradient khusus: `linear-gradient(135deg, #10b981 0%, #059669 52%, #047857 100%)` — varian gelap dari `--grad-primary`.

### Radius & Shadow (pendukung palet)

- Radius: `--radius-sm 10px` · `--radius 18px` · `--radius-lg 26px` · `--radius-xl 34px`
- Shadow: `--shadow-xs` → `--shadow-lg` (elevasi 1–4), plus `--shadow-glow` (glow hijau `rgba(16,185,129,.23)`) untuk elemen primary yang ingin ditonjolkan.

## Logo Color Palette

Logo (`src/assets/logo-pkm-erfat.png`) berbentuk cincin dengan alur menyerupai lambung/selang NGT + node sirkuit, memakai gradient tiga warna yang identik dengan token brand di atas — jadi logo dan UI otomatis konsisten:

| Posisi di logo | Warna | Token yang setara |
|---|---|---|
| Atas cincin | Hijau | `--primary` `#10b981` |
| Tengah cincin (transisi) | Teal | `--teal` `#14b8a6` |
| Bawah cincin | Biru | `--sky` `#0ea5e9` |
| Aksen "gelombang/tangan" kanan-bawah | Biru medium | mendekati `--blue` `#2563eb` |
| Latar | Putih/transparan | `--surface-solid` `#ffffff` |

**Panduan pemakaian logo:**
- Selalu di atas latar terang (putih atau `--bg`) agar gradient hijau→biru tetap kontras.
- Jangan mewarnai ulang logo di luar tiga warna gradient di atas — warna ini yang mengikat identitas "sensor/teknologi (biru-teal)" dengan "kesehatan/keselamatan (hijau)".
- Mascot (`MaskotNaspion.png`) mengikuti palet yang sama sebagai pasangan visual logo di hero landing page.
