# Contributing Guide

Terima kasih telah berkontribusi pada proyek Online Shop.

## Prinsip Kontribusi
- Buat perubahan kecil, fokus, dan mudah direview.
- Hindari perubahan besar yang tidak terkait issue.
- Pastikan perubahan tidak merusak alur utama aplikasi.

## Alur Kerja
1. Buat branch fitur/perbaikan dari branch aktif.
2. Lakukan perubahan seperlunya.
3. Jalankan verifikasi yang tersedia:
   ```bash
   npm run build
   ```
4. Commit dengan pesan yang jelas.
5. Buat Pull Request dengan ringkasan perubahan dan dampaknya.

## Standar Kualitas
- Gunakan gaya kode yang konsisten dengan file sekitarnya.
- Jangan commit kredensial/secret.
- Jika menambah endpoint atau mengubah schema, update dokumentasi terkait di:
  - `docs/API.md`
  - `docs/DATABASE.md`
  - `README.md` (bila perlu)

## Panduan Pull Request
Deskripsi PR minimal mencakup:
- Latar belakang masalah
- Ringkasan solusi
- File utama yang berubah
- Cara verifikasi
- Risiko dan rollback plan (jika relevan)
