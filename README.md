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

Atur koneksi MySQL pada `backend/.env`, kemudian jalankan migrasi dan seeder untuk mengisi data awal kategori, akun contoh, tenant, dan menu:

```bash
php artisan migrate --seed
php artisan serve
```

Backend secara default dapat diakses melalui `http://127.0.0.1:8000` (mendukung prefix `/api/*` maupun `/api/v1/*`). Endpoint pemeriksaan awal tersedia pada `/api/health`.

### Akun Awal Seeder (`password123`)

| Peran | Username | Email |
|---|---|---|
| Administrator | `admin` | `admin@upnvj.ac.id` |
| Vendor (Kantin Sejahtera) | `vendor01` | `sejahtera@upnvj.ac.id` |
| Vendor (Warung Nusantara) | `vendor02` | `nusantara@upnvj.ac.id` |
| Customer | `customer01` | `customer@upnvj.ac.id` |

## Konfigurasi Frontend dan Backend

- Frontend: `frontend/.env` dengan `VITE_API_BASE_URL`.
- Backend: `backend/.env` dengan konfigurasi aplikasi dan MySQL.
- Jangan commit file `.env` yang berisi kredensial atau rahasia.
- Variabel frontend dengan awalan `VITE_` dapat terlihat oleh browser. Jangan menyimpan password, API secret, atau kredensial privat di dalamnya.

## Modul API yang Tersedia

1. **Authentication API**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
2. **Category API**: `GET /api/categories`, `GET /api/categories/{id}`
3. **Tenant API**: `GET /api/tenants`, `GET /api/tenants/{id}`, `GET /api/tenants/{id}/menus`, `GET /api/vendor/tenant`, `PATCH /api/vendor/tenant`
4. **Menu API**: `GET /api/menus`, `GET /api/menus/{id}`, `GET /api/vendor/menus`, `POST /api/vendor/menus`, `PUT /api/vendor/menus/{id}`, `PATCH /api/vendor/menus/{id}/availability`, `DELETE /api/vendor/menus/{id}`
5. **Cart API (Customer)**: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart`
6. **Order & Order Status API**: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/{id}`, `GET /api/orders/{id}/status`, `GET /api/orders/{id}/status-history`, `GET /api/vendor/orders`, `PATCH /api/vendor/orders/{id}/status`
7. **Payment Simulation API**: `POST /api/orders/{id}/payment`, `GET /api/orders/{id}/payment`, `PATCH /api/payments/{id}/verification`
8. **Notification API**: `GET /api/notifications`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all`
9. **Administrator API**: `GET /api/admin/users`, `PUT /api/admin/users/{id}`, `GET /api/admin/tenants`, `POST /api/admin/tenants`, `PUT /api/admin/tenants/{id}`, `DELETE /api/admin/tenants/{id}`

## Dokumentasi

Dokumentasi proyek tersedia di direktori `docs/`, termasuk product management, project overview, project management, requirements, system design, testing, deployment, dan user documentation.
