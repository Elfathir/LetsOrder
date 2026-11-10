# Installation Guide

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Nama Dokumen | Installation Guide |
| Versi | 1.0 Draft |
| Tanggal | 10 November 2026 |
| Status | Draft |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Installation Guide memberikan panduan instalasi dan persiapan lingkungan pengembangan untuk menjalankan aplikasi LetsOrder.com. Panduan ini ditujukan kepada anggota tim pengembang maupun pihak lain yang perlu menyiapkan aplikasi pada komputer lokal.

### 1.2 Ruang Lingkup

Panduan instalasi mencakup:

1. Persiapan perangkat lunak dan lingkungan pengembangan.
2. Pengambilan source code proyek.
3. Instalasi dependency frontend.
4. Instalasi dependency backend.
5. Konfigurasi koneksi database MySQL.
6. Persiapan struktur database.
7. Menjalankan backend Laravel.
8. Menjalankan frontend React.
9. Pemeriksaan awal instalasi.

### 1.3 Arsitektur Aplikasi

LetsOrder.com menggunakan arsitektur client-server dengan pembagian komponen sebagai berikut:

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Frontend | React | Menampilkan antarmuka dan menangani interaksi pengguna. |
| Backend | Laravel | Menangani autentikasi, logika bisnis, validasi, dan komunikasi dengan database. |
| Database | MySQL | Menyimpan data pengguna, tenant, menu, keranjang, pesanan, pembayaran, riwayat status, dan notifikasi. |

---

## 2. Persyaratan Sistem

### 2.1 Perangkat Keras

Komputer yang digunakan untuk pengembangan disarankan memiliki spesifikasi yang memadai untuk menjalankan frontend, backend, dan database secara bersamaan.

| Komponen | Rekomendasi |
|---|---|
| Prosesor | Minimal dual-core modern |
| RAM | Minimal 8 GB |
| Penyimpanan | Ruang kosong yang cukup untuk source code dan dependency |
| Koneksi Internet | Dibutuhkan untuk mengunduh dependency dan mengakses repository |

Spesifikasi tersebut merupakan rekomendasi awal, bukan persyaratan minimum hasil pengujian performa.

### 2.2 Perangkat Lunak

Perangkat lunak yang diperlukan meliputi:

| Perangkat Lunak | Fungsi |
|---|---|
| Git | Mengambil dan mengelola source code dari repository. |
| Node.js dan npm | Menjalankan lingkungan pengembangan frontend React. |
| PHP | Menjalankan backend Laravel. |
| Composer | Mengelola dependency PHP dan Laravel. |
| MySQL | Menjalankan database aplikasi. |
| Code Editor | Membuka dan mengelola source code. |
| Web Browser | Mengakses aplikasi melalui antarmuka web. |

**Catatan:** Versi Node.js, PHP, Composer, MySQL, dan Laravel harus disesuaikan dengan versi yang benar-benar digunakan pada proyek. Periksa `package.json`, `composer.json`, dan konfigurasi proyek sebelum melakukan instalasi.

### 2.3 Pemeriksaan Instalasi Perangkat Lunak

Buka terminal atau command prompt, kemudian jalankan perintah berikut:

Memeriksa Git:

```bash
git --version
```

Memeriksa Node.js:

```bash
node --version
```

Memeriksa npm:

```bash
npm --version
```

Memeriksa PHP:

```bash
php --version
```

Memeriksa Composer:

```bash
composer --version
```

Memeriksa MySQL:

```bash
mysql --version
```

Jika perintah menampilkan informasi versi, perangkat lunak terkait telah tersedia dan dapat diakses melalui terminal.

---

## 3. Mengambil Source Code Proyek

### 3.1 Mengakses Repository

Pastikan repository LetsOrder.com telah tersedia dan pengguna memiliki akses untuk mengambil source code.

Buka terminal, kemudian jalankan:

```bash
git clone <URL_REPOSITORY>
```

Ganti `<URL_REPOSITORY>` dengan alamat repository GitHub LetsOrder.com.

Masuk ke direktori proyek:

```bash
cd LetsOrder.com
```

### 3.2 Memeriksa Struktur Direktori

Pastikan struktur utama proyek tersedia:

```text
LetsOrder.com/
├── frontend/
├── backend/
├── database/
├── docs/
├── diagrams/
├── assets/
└── scripts/
```

Direktori `frontend/` berisi aplikasi React, sedangkan `backend/` berisi aplikasi Laravel. Direktori `database/` menyimpan dokumentasi dan berkas SQL database.

---

## 4. Instalasi Frontend

### 4.1 Masuk ke Direktori Frontend

Jalankan perintah:

```bash
cd frontend
```

### 4.2 Instalasi Dependency

Pastikan file `package.json` tersedia. Kemudian jalankan:

```bash
npm install
```

Perintah tersebut digunakan untuk mengunduh dan memasang dependency yang tercantum dalam `package.json`.

Jika repository menyediakan `package-lock.json`, instalasi yang lebih konsisten dapat menggunakan:

```bash
npm ci
```

Gunakan `npm ci` ketika dependency harus mengikuti lockfile yang tersedia dan tidak sedang melakukan perubahan dependency.

### 4.3 Konfigurasi Environment Frontend

Jika file `.env.example` tersedia, salin menjadi `.env`.

Pada Linux atau macOS:

```bash
cp .env.example .env
```

Pada Windows Command Prompt:

```cmd
copy .env.example .env
```

Isi konfigurasi frontend sesuai alamat backend yang digunakan.

Contoh jika proyek menggunakan variabel konfigurasi Vite:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Nama variabel di atas merupakan contoh. Pastikan nama variabel sesuai dengan implementasi pada source code frontend.

**Perhatian:** Jangan menyimpan password database, secret key, atau informasi sensitif backend pada variabel frontend. Variabel frontend dapat terekspos kepada pengguna melalui aplikasi yang dibangun.

### 4.4 Menjalankan Frontend

Jalankan perintah:

```bash
npm run dev
```

Vite akan menampilkan alamat lokal aplikasi pada terminal. Buka alamat tersebut melalui web browser.

Contoh alamat default:

```text
http://localhost:5173
```

Alamat sebenarnya mengikuti konfigurasi Vite dan informasi yang ditampilkan terminal.

---

## 5. Instalasi Backend

### 5.1 Masuk ke Direktori Backend

Buka terminal baru, kemudian masuk ke direktori backend dari root proyek:

```bash
cd LetsOrder.com/backend
```

Pastikan file `composer.json` dan `artisan` tersedia.

### 5.2 Instalasi Dependency Laravel

Jalankan:

```bash
composer install
```

Perintah ini akan memasang dependency PHP yang dibutuhkan oleh aplikasi Laravel berdasarkan konfigurasi Composer.

### 5.3 Konfigurasi Environment Backend

Jika file `.env` belum tersedia, salin file `.env.example`.

Linux atau macOS:

```bash
cp .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

Buka file `.env`, kemudian sesuaikan konfigurasi aplikasi dan database.

Contoh konfigurasi:

```env
APP_NAME=LetsOrder
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=letsorder
DB_USERNAME=root
DB_PASSWORD=
```

Nilai konfigurasi harus disesuaikan dengan lingkungan komputer masing-masing.

**Perhatian:** `APP_DEBUG=true` hanya digunakan untuk pengembangan lokal. Jangan menggunakan konfigurasi debug aktif pada lingkungan produksi.

### 5.4 Membuat Application Key

Jalankan perintah:

```bash
php artisan key:generate
```

Perintah tersebut menghasilkan application key dan menyimpannya ke dalam konfigurasi `.env`.

### 5.5 Membersihkan Cache Konfigurasi

Untuk memastikan Laravel membaca konfigurasi terbaru, jalankan:

```bash
php artisan optimize:clear
```

---

## 6. Persiapan Database MySQL

### 6.1 Membuat Database

Jalankan MySQL melalui aplikasi pengelola database atau terminal.

Jika menggunakan MySQL Command Line Client, masuk ke MySQL kemudian jalankan:

```sql
CREATE DATABASE letsorder;
```

Nama database dapat disesuaikan dengan konfigurasi pada `.env`.

### 6.2 Mengimpor Struktur Database

Repository menyediakan lokasi dokumentasi database:

```text
database/
├── documentation/
│   ├── ERD.md
│   └── data-dictionary.md
└── sql/
    └── letsorder_schema.sql
```

Jika file `letsorder_schema.sql` telah berisi struktur database yang final, impor menggunakan:

```bash
mysql -u root -p letsorder < ../database/sql/letsorder_schema.sql
```

Perintah tersebut dijalankan dari direktori `backend/`. Sesuaikan username MySQL dan lokasi file jika berbeda.

Alternatifnya, gunakan fitur import pada aplikasi pengelola database yang digunakan.

**Penting:** Pastikan struktur SQL telah sesuai dengan ERD final yang terdiri dari 11 entitas:

1. USER
2. TENANT
3. KATEGORI
4. MENU
5. KERANJANG
6. ITEM_KERANJANG
7. PESANAN
8. DETAIL_PESANAN
9. PEMBAYARAN
10. RIWAYAT_STATUS
11. NOTIFIKASI

Jangan membuat tabel atau kolom tambahan yang belum disetujui dalam rancangan database final.

### 6.3 Menjalankan Migrasi Laravel

Jika struktur database dikelola menggunakan migration Laravel, periksa terlebih dahulu seluruh file migration pada:

```text
backend/database/migrations/
```

Pastikan migration sesuai dengan ERD final dan tidak membuat struktur yang bertentangan dengan hasil impor SQL.

Jika migration menjadi sumber utama struktur database, jalankan:

```bash
php artisan migrate
```

Jangan menjalankan impor SQL dan migration secara bersamaan tanpa memeriksa kemungkinan pembuatan tabel duplikat.

### 6.4 Memeriksa Koneksi Database

Setelah konfigurasi selesai, jalankan:

```bash
php artisan migrate:status
```

Perintah ini dapat digunakan untuk memeriksa status migration Laravel dan membantu memastikan koneksi database berjalan.

---

## 7. Menjalankan Aplikasi

### 7.1 Menjalankan Backend

Buka terminal pada direktori `backend/`, kemudian jalankan:

```bash
php artisan serve
```

Secara default, Laravel menyediakan server pengembangan pada:

```text
http://127.0.0.1:8000
```

Alamat dapat berbeda jika port telah digunakan atau konfigurasi server diubah.

### 7.2 Menjalankan Frontend

Buka terminal baru pada direktori `frontend/`, kemudian jalankan:

```bash
npm run dev
```

Buka alamat frontend yang ditampilkan oleh Vite pada browser.

### 7.3 Memeriksa Koneksi Frontend dan Backend

Pastikan:

1. Backend Laravel dapat dijalankan tanpa error.
2. Database MySQL dapat diakses oleh backend.
3. Frontend React dapat dijalankan.
4. Alamat API pada frontend sesuai dengan alamat backend.
5. Permintaan API dapat diproses oleh backend.
6. Respons API dapat diterima dan ditampilkan oleh frontend.

Jika seluruh komponen berjalan, lingkungan pengembangan lokal telah siap untuk pengujian aplikasi.

---

## 8. Pemeriksaan Awal Instalasi

Setelah proses instalasi selesai, lakukan pemeriksaan berikut:

| No. | Komponen | Pemeriksaan | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | Repository | Source code berhasil diambil. | Direktori proyek tersedia. |
| 2 | Frontend | Dependency berhasil dipasang. | Tidak terdapat error instalasi yang menghambat. |
| 3 | Backend | Dependency berhasil dipasang. | Laravel dapat menjalankan perintah Artisan. |
| 4 | Environment | File `.env` telah dikonfigurasi. | Konfigurasi sesuai lingkungan lokal. |
| 5 | Database | Database MySQL tersedia. | Database dapat diakses oleh backend. |
| 6 | Migration/SQL | Struktur database telah disiapkan. | Struktur sesuai ERD final. |
| 7 | Backend Server | Laravel dapat dijalankan. | Server pengembangan aktif. |
| 8 | Frontend Server | React dapat dijalankan. | Halaman aplikasi dapat dibuka. |
| 9 | API Connection | Frontend dapat berkomunikasi dengan backend. | Permintaan dan respons API berjalan sesuai implementasi. |

Status pemeriksaan diisi setelah setiap langkah benar-benar dilakukan.

---

## 9. Troubleshooting

### 9.1 Dependency Frontend Gagal Dipasang

**Kemungkinan penyebab:**
- Versi Node.js tidak sesuai.
- Koneksi internet bermasalah.
- Dependency mengalami konflik.
- Lockfile tidak sesuai dengan `package.json`.

**Solusi:**
1. Periksa versi Node.js dan npm.
2. Pastikan koneksi internet tersedia.
3. Periksa pesan error pada terminal.
4. Gunakan `npm ci` jika lockfile tersedia dan sesuai.

### 9.2 Dependency Backend Gagal Dipasang

**Kemungkinan penyebab:**
- Versi PHP tidak memenuhi kebutuhan dependency.
- Extension PHP yang dibutuhkan belum tersedia.
- Versi Composer tidak sesuai.
- Terdapat konflik dependency.

**Solusi:**
1. Periksa versi PHP.
2. Periksa extension PHP yang dibutuhkan pada `composer.json`.
3. Periksa versi Composer.
4. Jalankan kembali instalasi setelah persyaratan terpenuhi.

### 9.3 Database Connection Error

**Kemungkinan penyebab:**
- MySQL belum berjalan.
- Nama database salah.
- Username atau password tidak sesuai.
- Port database berbeda.

**Solusi:**
1. Pastikan MySQL aktif.
2. Periksa konfigurasi `DB_HOST` dan `DB_PORT`.
3. Periksa `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD`.
4. Jalankan `php artisan optimize:clear`.
5. Periksa kembali koneksi database.

### 9.4 Frontend Tidak Dapat Mengakses Backend

**Kemungkinan penyebab:**
- URL API tidak sesuai.
- Backend belum berjalan.
- Konfigurasi CORS belum sesuai.
- Endpoint API belum tersedia.

**Solusi:**
1. Pastikan backend berjalan.
2. Periksa variabel URL API pada frontend.
3. Periksa konfigurasi CORS Laravel.
4. Periksa endpoint yang digunakan.
5. Periksa pesan error pada browser dan terminal backend.

### 9.5 Port Sudah Digunakan

Jika port frontend atau backend telah digunakan aplikasi lain, jalankan server menggunakan port alternatif sesuai dukungan konfigurasi masing-masing.

Pastikan alamat baru diperbarui pada konfigurasi yang membutuhkan koneksi ke server tersebut.

---

## 10. Keamanan dan Pengelolaan Konfigurasi

Untuk menjaga keamanan source code dan konfigurasi aplikasi, perhatikan ketentuan berikut:

1. Jangan mengunggah file `.env` yang berisi kredensial atau secret ke repository publik.
2. Gunakan `.env.example` untuk memberikan contoh nama variabel konfigurasi tanpa memasukkan informasi rahasia.
3. Jangan membagikan password database dan application key.
4. Gunakan konfigurasi debug hanya untuk lingkungan pengembangan.
5. Pastikan konfigurasi produksi menggunakan kredensial yang berbeda dari lingkungan lokal.
6. Jangan menyimpan secret backend pada variabel frontend.
7. Pastikan file `.gitignore` mencakup file konfigurasi lokal dan file sensitif.

---

## 11. Penutup

Panduan ini menjelaskan tahapan instalasi dan persiapan lingkungan pengembangan LetsOrder.com menggunakan React, Laravel, dan MySQL. Dengan mengikuti langkah-langkah tersebut, pengembang dapat menyiapkan aplikasi secara lokal sebelum melakukan pengembangan lanjutan dan pengujian.

Detail versi perangkat lunak, konfigurasi environment, serta mekanisme pengelolaan database perlu disesuaikan dengan implementasi final proyek. Setiap perubahan konfigurasi sebaiknya didokumentasikan agar proses instalasi dapat dilakukan secara konsisten oleh seluruh anggota tim.

---

## 12. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan | Status |
|---|---|---|---|
| 1.0 | 10 November 2026 | Pembuatan awal Installation Guide. | Draft |