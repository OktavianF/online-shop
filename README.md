# Online Shop (ElegantShop)

Proyek **Online Shop** adalah aplikasi e-commerce sederhana dengan arsitektur multi-layer:
- **Frontend**: HTML, CSS, JavaScript (Vite untuk tooling frontend)
- **Backend API**: PHP (endpoint autentikasi dan produk)
- **Database**: PostgreSQL (schema dan seed SQL tersedia di folder `supabase/`)

Dokumentasi ini disusun agar siap dipakai sebagai baseline dokumentasi repository dengan standar industri.

## Daftar Isi
- [Ringkasan Fitur](#ringkasan-fitur)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Repository](#struktur-repository)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Panduan Setup Lokal](#panduan-setup-lokal)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Dokumentasi Teknis Tambahan](#dokumentasi-teknis-tambahan)
- [Keamanan & Konfigurasi](#keamanan--konfigurasi)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)

## Ringkasan Fitur
- Katalog produk dan filter/sorting pada halaman shop
- Autentikasi user (register/login) dengan session PHP
- Keranjang belanja berbasis `localStorage`
- Checkout bertahap (shipping, payment, review)
- Seller dashboard untuk pengelolaan produk

## Arsitektur Sistem
1. Browser memuat halaman statis (`index.html`, `pages/*.html`/`*.php`)
2. Frontend JS memanggil API PHP (`/php/api/*.php`)
3. API berkomunikasi dengan PostgreSQL melalui helper di `php/config.php`
4. Session PHP dipakai untuk kontrol autentikasi dan role seller

## Struktur Repository
```text
online-shop/
├── css/                    # Stylesheet global dan per halaman
├── img/                    # Asset gambar produk/UI
├── js/                     # Modul frontend (home, shop, auth, dashboard, dsb.)
├── pages/                  # Halaman aplikasi (HTML/PHP)
├── php/
│   ├── api/                # REST-like endpoint (auth, products)
│   └── config.php          # Koneksi DB + helper response/session
├── public/                 # Asset Vite
├── supabase/
│   ├── migrations/         # Schema SQL utama
│   └── record.sql          # Seed data contoh
├── index.html              # Landing page utama
└── package.json            # Script frontend (Vite)
```

## Tech Stack
- Vite 5
- Vanilla JavaScript (ES Modules)
- PHP
- PostgreSQL

## Prasyarat
- Node.js 18+ dan npm
- PHP 8+
- PostgreSQL 13+
- Web server lokal (Apache/Nginx) atau environment lokal yang mampu menjalankan PHP

## Panduan Setup Lokal
1. Install dependency frontend:
   ```bash
   npm ci
   ```
2. Buat database PostgreSQL, contoh:
   - Nama DB: `online-shop`
3. Jalankan schema migration:
   - File: `supabase/migrations/20250511083341_floral_shadow.sql`
4. (Opsional) Isi data awal:
   - File: `supabase/record.sql`
5. Konfigurasikan kredensial database di:
   - `php/config.php`
   - `php/api/auth.php` (saat ini memiliki konfigurasi koneksi lokal sendiri)

## Menjalankan Aplikasi
### Mode Frontend Development
```bash
npm run dev
```

### Menjalankan Backend PHP
Jalankan melalui web server lokal dan pastikan repository berada pada path aplikasi `/online-shop` agar URL absolut di frontend bekerja sesuai implementasi saat ini.

## Dokumentasi Teknis Tambahan
- [Dokumentasi API](docs/API.md)
- [Dokumentasi Database](docs/DATABASE.md)
- [Panduan Kontribusi](CONTRIBUTING.md)

## Keamanan & Konfigurasi
- Jangan gunakan kredensial database hardcoded untuk environment production.
- Gunakan kredensial non-default dan prinsip least privilege untuk user database.
- Hindari commit secret/config sensitif langsung ke repository.

## Troubleshooting
- **Build Vite gagal saat `npm run build`**  
  Saat ini build dapat gagal karena import path absolut `/online-shop/js/main.js` di `index.html` belum sesuai ekspektasi bundling Vite.
- **API gagal akses database**  
  Pastikan host/port/nama DB/user/password di file PHP sesuai environment lokal.
- **Redirect/login tidak sesuai**  
  Pastikan session PHP aktif dan aplikasi dijalankan dari base path `/online-shop`.

## Kontribusi
Silakan baca [CONTRIBUTING.md](CONTRIBUTING.md) sebelum membuat perubahan.
