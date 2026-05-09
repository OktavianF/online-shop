# Database Documentation

Dokumen ini menjelaskan sumber schema, tabel utama, dan alur inisialisasi database.

## Engine
- PostgreSQL

## Sumber Schema
- `supabase/migrations/20250511083341_floral_shadow.sql`

## Sumber Seed Data (Opsional)
- `supabase/record.sql`

## Entity Utama
- `pengguna` (user, role seller)
- `alamat_pengguna` (alamat user)
- `kategori` (kategori produk)
- `produk` (katalog produk)
- `pesanan` (order)
- `detail_pesanan` (item order)
- `pembayaran` (payment)
- `pengiriman` (shipping header)
- `detailpengiriman` (shipping tracking detail)

## Relasi Inti
- `produk.user_id -> pengguna.id`
- `produk.category_id -> kategori.id`
- `alamat_pengguna.user_id -> pengguna.id`
- `pesanan.user_id -> pengguna.id`
- `pesanan.address_id -> alamat_pengguna.id`
- `detail_pesanan.order_id -> pesanan.id`
- `detail_pesanan.product_id -> produk.id`
- `pembayaran.order_id -> pesanan.id`
- `pengiriman.order_id -> pesanan.id`
- `detailpengiriman.shipping_id -> pengiriman.id`

## Alur Inisialisasi Database
1. Buat database baru (contoh: `online-shop`).
2. Jalankan file migration:
   - `supabase/migrations/20250511083341_floral_shadow.sql`
3. (Opsional) Isi data contoh:
   - `supabase/record.sql`

## Catatan Integrasi Aplikasi
- Koneksi database berada di `php/config.php` (helper global backend).
- Endpoint auth (`php/api/auth.php`) saat ini menggunakan konfigurasi koneksi lokal tersendiri.
- Pastikan seluruh konfigurasi koneksi mengarah ke database yang sama.

## Rekomendasi Produksi
- Simpan kredensial lewat environment variable, bukan hardcoded.
- Gunakan migrasi terkontrol untuk setiap perubahan schema.
- Aktifkan backup otomatis dan monitoring query lambat.
