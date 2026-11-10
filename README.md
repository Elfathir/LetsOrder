# LetsOrder.com

**Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ**

LetsOrder.com adalah aplikasi web untuk membantu Customer melihat menu tenant kantin, membuat pesanan, menggunakan simulasi pembayaran digital, memantau status pesanan, dan mengambil pesanan secara mandiri (*self-pickup*). Vendor mengelola tenant, menu, dan pesanan, sedangkan Administrator mengelola data pengguna dan tenant.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Laravel, PHP |
| Database | MySQL |
| Komunikasi | REST API dengan JSON |

## Ruang Lingkup dan Batasan

- Pemesanan dilakukan untuk satu tenant dalam satu pesanan.
- Pengambilan pesanan dilakukan langsung di tenant (*self-pickup*), bukan pengantaran.
- QRIS/dompet digital hanya disimulasikan untuk kebutuhan proyek; aplikasi ini tidak memproses transaksi uang sungguhan.
- Nomor antrean digunakan sebagai identitas pesanan saat pengambilan.
- Aplikasi dikembangkan untuk penggunaan melalui browser web.

## Struktur Repository

```text
LetsOrder.com/
├── .github/
├── backend/
├── frontend/
├── docs/
├── diagrams/
├── database/
├── assets/
└── README.md
```

## Persyaratan Lingkungan

Pastikan perangkat pengembangan telah memiliki:

- Git
- Node.js dan npm (gunakan versi yang memenuhi `engines` pada `frontend/package.json`)
- PHP 8.2 atau lebih baru
- Composer 2
- MySQL
- Browser modern

## Menjalankan Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Vite akan menampilkan alamat lokal pada terminal, biasanya `http://localhost:5173`.

Variabel `VITE_API_BASE_URL` pada `frontend/.env` menunjuk ke alamat API backend. Nilai contoh disediakan pada `.env.example`.

## Menyiapkan Backend Laravel

> **Penting:** `composer.json` pada repository ini adalah konfigurasi dependensi, bukan keseluruhan kerangka Laravel. Pastikan direktori `backend/` sudah berisi kerangka aplikasi Laravel yang lengkap (termasuk `artisan`, `bootstrap/app.php`, konfigurasi, dan file bawaan Laravel) sebelum menjalankan perintah berikut. Folder kosong saja belum cukup untuk menjalankan Laravel.

Jika kerangka Laravel sudah tersedia:

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Atur koneksi MySQL pada `backend/.env`, kemudian jalankan migrasi hanya setelah file migration proyek tersedia dan telah diperiksa:

```bash
php artisan migrate
php artisan serve
```

Backend secara default dapat diakses melalui `http://127.0.0.1:8000`. Endpoint pemeriksaan awal tersedia pada `/api/health`.

## Konfigurasi Frontend dan Backend

- Frontend: `frontend/.env` dengan `VITE_API_BASE_URL`.
- Backend: `backend/.env` dengan konfigurasi aplikasi dan MySQL.
- Jangan commit file `.env` yang berisi kredensial atau rahasia.
- Variabel frontend dengan awalan `VITE_` dapat terlihat oleh browser. Jangan menyimpan password, API secret, atau kredensial privat di dalamnya.

## Status Implementasi

Repository ini merupakan kerangka awal dokumentasi dan aplikasi. Keberadaan konfigurasi proyek tidak berarti seluruh fitur telah selesai diimplementasikan. Endpoint bisnis, autentikasi, model, migration, controller, validasi, dan pengujian harus diselesaikan serta diverifikasi sebelum aplikasi dinyatakan siap digunakan.

## Dokumentasi

Dokumentasi proyek tersedia di direktori `docs/`, termasuk product management, project overview, project management, requirements, system design, testing, deployment, dan user documentation.
