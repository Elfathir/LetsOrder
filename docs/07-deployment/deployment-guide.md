# Deployment Guide

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Nama Dokumen | Deployment Guide |
| Versi | 1.0 Draft |
| Tanggal | 10 November 2026 |
| Status | Draft |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Deployment Guide menjelaskan tahapan penerapan aplikasi LetsOrder.com dari lingkungan pengembangan ke lingkungan server. Panduan ini digunakan sebagai acuan bagi tim pengembang dalam mempersiapkan aplikasi, mengatur konfigurasi server, menerapkan database, serta memastikan seluruh komponen sistem dapat berjalan dengan baik setelah deployment.

### 1.2 Ruang Lingkup

Proses deployment mencakup:

1. Persiapan lingkungan server.
2. Persiapan source code aplikasi.
3. Konfigurasi frontend React.
4. Konfigurasi backend Laravel.
5. Persiapan database MySQL.
6. Konfigurasi web server dan koneksi API.
7. Pengaktifan layanan aplikasi.
8. Verifikasi setelah deployment.
9. Pemeliharaan dan pembaruan aplikasi.

### 1.3 Arsitektur Deployment

LetsOrder.com menggunakan pendekatan client-server dengan tiga komponen utama.

| Komponen | Teknologi | Tanggung Jawab |
|---|---|---|
| Client | Web Browser | Mengakses dan menggunakan aplikasi. |
| Frontend Server | React | Menyediakan antarmuka aplikasi kepada pengguna. |
| Backend Server | Laravel | Memproses permintaan, autentikasi, validasi, dan logika bisnis. |
| Database Server | MySQL | Menyimpan data aplikasi. |

Frontend dan backend dapat ditempatkan pada satu server atau server berbeda, bergantung pada infrastruktur yang dipilih. Database harus dikonfigurasi agar hanya dapat diakses oleh layanan yang berwenang.

---

## 2. Persiapan Deployment

### 2.1 Persyaratan Server

Sebelum deployment dilakukan, siapkan server yang memenuhi kebutuhan aplikasi.

| Komponen | Persyaratan |
|---|---|
| Sistem Operasi | Sistem operasi server yang mendukung PHP, Node.js, dan MySQL. |
| Web Server | Nginx atau Apache. |
| PHP | Versi yang kompatibel dengan Laravel dan dependency proyek. |
| Composer | Untuk pengelolaan dependency backend. |
| Node.js dan npm | Untuk proses build frontend. |
| MySQL | Database aplikasi. |
| Git | Untuk mengambil dan memperbarui source code. |
| SSL/TLS | Untuk mengamankan komunikasi melalui HTTPS. |

Versi dan spesifikasi server harus ditentukan berdasarkan kebutuhan aktual aplikasi dan hasil pengujian. Dokumen ini tidak menetapkan kapasitas server tertentu karena penyedia infrastruktur belum dipilih.

### 2.2 Persiapan Domain dan Server

Sebelum aplikasi dipublikasikan, pastikan:

1. Server telah tersedia dan dapat diakses oleh administrator.
2. Domain telah disiapkan apabila aplikasi menggunakan domain publik.
3. DNS telah diarahkan ke alamat server yang sesuai.
4. Port layanan telah dikonfigurasi sesuai kebutuhan.
5. Sertifikat SSL/TLS telah tersedia untuk akses HTTPS.
6. Database telah disiapkan dengan kredensial khusus aplikasi.
7. Akses administratif server dibatasi kepada pihak yang berwenang.

### 2.3 Persiapan Source Code

Pastikan source code yang akan digunakan merupakan versi yang telah diperiksa dan disetujui untuk deployment.

Struktur komponen utama:

```text
LetsOrder.com/
├── frontend/
├── backend/
├── database/
└── docs/
```

Pastikan perubahan kode telah masuk ke branch yang ditentukan sebagai sumber deployment.

---

## 3. Deployment Backend Laravel

### 3.1 Menyiapkan Source Code Backend

Masuk ke server dan ambil source code dari repository:

```bash
git clone <URL_REPOSITORY>
```

Masuk ke direktori backend:

```bash
cd LetsOrder.com/backend
```

Jika source code sudah tersedia pada server, pastikan berada pada versi atau commit yang akan dipublikasikan.

### 3.2 Instalasi Dependency

Jalankan:

```bash
composer install --no-dev --optimize-autoloader
```

Perintah tersebut memasang dependency produksi berdasarkan konfigurasi Composer.

### 3.3 Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Sesuaikan konfigurasi berikut dengan lingkungan server:

```env
APP_NAME=LetsOrder
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://<DOMAIN_APLIKASI>

DB_CONNECTION=mysql
DB_HOST=<HOST_DATABASE>
DB_PORT=3306
DB_DATABASE=<NAMA_DATABASE>
DB_USERNAME=<USERNAME_DATABASE>
DB_PASSWORD=<PASSWORD_DATABASE>
```

Keterangan:

- `APP_ENV` menggunakan nilai `production`.
- `APP_DEBUG` harus dinonaktifkan.
- `APP_URL` menggunakan domain aplikasi yang telah ditentukan.
- Informasi database harus sesuai dengan konfigurasi server.
- Password database tidak boleh disimpan di repository publik.

Jika aplikasi belum memiliki application key, jalankan:

```bash
php artisan key:generate
```

Pada deployment berikutnya, pertahankan application key yang sudah digunakan. Jangan membuat key baru tanpa prosedur migrasi yang telah dipertimbangkan karena dapat memengaruhi data terenkripsi dan sesi aplikasi.

### 3.4 Persiapan Database

Pastikan database MySQL telah dibuat dan dapat diakses oleh backend.

Sebelum menerapkan perubahan struktur database:

1. Periksa migration yang akan dijalankan.
2. Pastikan struktur migration sesuai dengan ERD final.
3. Lakukan backup database sebelum perubahan skema.
4. Pastikan perubahan tidak menghapus data penting.

Jika migration telah diverifikasi, jalankan:

```bash
php artisan migrate --force
```

Gunakan opsi `--force` karena perintah dijalankan pada lingkungan produksi. Perintah ini hanya boleh dilakukan setelah migration diperiksa.

Jangan mengimpor SQL dan menjalankan migration secara bersamaan tanpa memastikan bahwa keduanya tidak membuat tabel atau struktur yang sama secara duplikat.

### 3.5 Optimasi Laravel

Setelah konfigurasi selesai, jalankan:

```bash
php artisan optimize
```

Perintah tersebut digunakan untuk mengoptimalkan cache konfigurasi dan komponen Laravel sesuai dukungan versi framework yang digunakan.

Jika aplikasi menggunakan penyimpanan file melalui Laravel Storage, periksa kebutuhan direktori penyimpanan dan izin aksesnya. Jalankan perintah berikut hanya jika aplikasi memang menggunakan public storage:

```bash
php artisan storage:link
```

### 3.6 Konfigurasi Hak Akses

Pastikan direktori yang diperlukan Laravel dapat ditulis oleh proses web server, terutama:

```text
backend/storage/
backend/bootstrap/cache/
```

Berikan hak akses secukupnya kepada pengguna sistem yang menjalankan aplikasi. Hindari memberikan izin akses penuh kepada seluruh pengguna.

---

## 4. Deployment Frontend React

### 4.1 Instalasi Dependency

Masuk ke direktori frontend:

```bash
cd ../frontend
```

Pasang dependency:

```bash
npm ci
```

Perintah tersebut menggunakan `package-lock.json` untuk menjaga konsistensi dependency.

### 4.2 Konfigurasi Environment

Buat file konfigurasi frontend sesuai kebutuhan proyek.

Contoh:

```env
VITE_API_BASE_URL=https://<DOMAIN_API>/api
```

Nama variabel harus mengikuti implementasi frontend yang sebenarnya.

Pastikan alamat API mengarah ke backend yang telah disiapkan. Jangan memasukkan password database, secret key, atau kredensial backend ke konfigurasi frontend.

### 4.3 Build Aplikasi

Jalankan:

```bash
npm run build
```

Jika proses berhasil, Vite akan menghasilkan file hasil build, biasanya pada direktori:

```text
frontend/dist/
```

Periksa hasil build sebelum dipublikasikan.

### 4.4 Menyediakan File Frontend

Tempatkan isi direktori `dist/` pada direktori publik web server yang telah ditentukan.

Web server harus dikonfigurasi agar:

1. File statis frontend dapat diakses melalui domain.
2. Permintaan halaman React diarahkan ke `index.html` apabila menggunakan client-side routing.
3. Permintaan API diteruskan ke backend, bukan ke halaman frontend.
4. File sensitif dan source code backend tidak dapat diakses secara publik.

---

## 5. Konfigurasi Web Server

### 5.1 Pengaturan Umum

Web server berfungsi menerima permintaan pengguna dan meneruskannya ke komponen aplikasi yang sesuai.

Konfigurasi perlu membedakan:

- Akses halaman frontend.
- Permintaan API backend.
- Akses file statis.
- Akses HTTPS.

### 5.2 Contoh Konfigurasi Nginx

Berikut contoh konfigurasi konseptual apabila frontend dan backend menggunakan domain yang sama:

```nginx
server {
    listen 80;
    server_name <DOMAIN_APLIKASI>;

    root /var/www/letsorder/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Konfigurasi tersebut merupakan contoh awal, bukan konfigurasi produksi yang siap digunakan tanpa penyesuaian.

Pada implementasi sebenarnya, Laravel sebaiknya dijalankan melalui PHP-FPM dengan document root diarahkan ke direktori `backend/public/`. Penggunaan server pengembangan `php artisan serve` tidak disarankan sebagai layanan produksi.

### 5.3 Konfigurasi HTTPS

Setelah domain dan web server siap, aktifkan HTTPS menggunakan sertifikat SSL/TLS yang valid.

Pastikan:

1. Pengguna dapat mengakses aplikasi melalui HTTPS.
2. Permintaan HTTP diarahkan ke HTTPS.
3. URL API menggunakan HTTPS.
4. Konfigurasi cookie dan sesi disesuaikan dengan penggunaan HTTPS.
5. Sertifikat diperbarui sebelum masa berlakunya berakhir.

---

## 6. Konfigurasi Komunikasi Frontend dan Backend

### 6.1 URL API

Frontend harus menggunakan URL API yang sesuai dengan alamat backend.

Contoh:

```text
https://<DOMAIN_APLIKASI>/api
```

Pastikan konfigurasi frontend dan backend menggunakan alamat yang konsisten.

### 6.2 Konfigurasi CORS

Jika frontend dan backend menggunakan domain atau origin berbeda, konfigurasi Cross-Origin Resource Sharing (CORS) pada Laravel perlu disesuaikan.

Konfigurasi harus membatasi origin yang diizinkan berdasarkan domain frontend resmi.

Hindari mengizinkan seluruh origin tanpa alasan yang jelas, terutama pada lingkungan produksi.

### 6.3 Pemeriksaan Komunikasi

Setelah deployment, lakukan pemeriksaan:

1. Frontend dapat diakses melalui domain.
2. Backend dapat menerima permintaan API.
3. Frontend dapat mengambil data dari backend.
4. Backend dapat berkomunikasi dengan MySQL.
5. Respons API diterima dengan format yang sesuai.
6. Tidak terdapat error komunikasi yang menghambat fungsi utama.

---

## 7. Aktivasi Aplikasi

### 7.1 Aktivasi Backend

Pastikan backend dijalankan melalui mekanisme layanan produksi yang sesuai, seperti PHP-FPM yang terintegrasi dengan Nginx atau Apache.

Jika aplikasi membutuhkan proses tambahan, seperti scheduler atau queue worker, aktifkan hanya setelah kebutuhan tersebut dipastikan dari implementasi aplikasi.

### 7.2 Aktivasi Frontend

Pastikan file hasil build frontend tersedia pada document root web server.

Frontend tidak perlu dijalankan menggunakan `npm run dev` pada lingkungan produksi. Perintah tersebut digunakan untuk pengembangan lokal.

### 7.3 Aktivasi Database

Pastikan MySQL berjalan dan dapat menerima koneksi dari backend.

Batasi akses database agar tidak terbuka untuk publik apabila tidak diperlukan.

---

## 8. Verifikasi Setelah Deployment

Setelah seluruh komponen aktif, lakukan pemeriksaan untuk memastikan sistem dapat digunakan.

| No. | Komponen | Pemeriksaan | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | Domain | Membuka domain aplikasi. | Halaman aplikasi dapat diakses. |
| 2 | HTTPS | Mengakses aplikasi menggunakan HTTPS. | Koneksi terenkripsi dan sertifikat valid. |
| 3 | Frontend | Membuka halaman utama. | Antarmuka tampil dengan benar. |
| 4 | Backend | Mengakses endpoint API yang tersedia. | Backend memberikan respons sesuai implementasi. |
| 5 | Database | Memeriksa koneksi backend ke MySQL. | Koneksi database berjalan. |
| 6 | Autentikasi | Mencoba login menggunakan akun pengujian. | Autentikasi berjalan sesuai kebutuhan. |
| 7 | Katalog | Membuka katalog menu. | Data menu dapat ditampilkan. |
| 8 | Pemesanan | Melakukan pengujian alur pemesanan. | Proses pemesanan berjalan sesuai spesifikasi. |
| 9 | Pembayaran | Menjalankan simulasi pembayaran. | Mekanisme simulasi dapat digunakan. |
| 10 | Self-Pickup | Memeriksa nomor antrean pesanan. | Nomor antrean dapat ditampilkan dan dikenali. |

Pengujian tersebut harus dilakukan menggunakan data uji yang sesuai dan tidak boleh dianggap berhasil sebelum hasil aktual dicatat.

---

## 9. Keamanan Deployment

Untuk menjaga keamanan aplikasi, terapkan ketentuan berikut:

1. Gunakan HTTPS untuk komunikasi pengguna dengan aplikasi.
2. Nonaktifkan debug pada lingkungan produksi.
3. Lindungi file `.env` dan kredensial database.
4. Batasi hak akses server sesuai kebutuhan layanan.
5. Gunakan validasi input pada backend.
6. Terapkan autentikasi dan pembatasan akses berdasarkan peran Customer, Vendor, dan Administrator.
7. Batasi akses langsung ke database.
8. Lakukan backup database secara berkala.
9. Perbarui dependency apabila terdapat pembaruan keamanan yang relevan.
10. Jangan menampilkan informasi error internal kepada pengguna.

---

## 10. Backup dan Pemulihan

### 10.1 Backup Database

Database perlu dicadangkan secara berkala untuk mengurangi risiko kehilangan data.

Contoh perintah backup MySQL:

```bash
mysqldump -u <USERNAME_DATABASE> -p <NAMA_DATABASE> > letsorder_backup.sql
```

File backup harus disimpan pada lokasi yang aman dan tidak ditempatkan pada direktori publik aplikasi.

### 10.2 Pemulihan Database

Jika diperlukan pemulihan, gunakan file backup yang telah diverifikasi.

Contoh perintah:

```bash
mysql -u <USERNAME_DATABASE> -p <NAMA_DATABASE> < letsorder_backup.sql
```

Proses pemulihan harus dilakukan oleh pihak yang berwenang setelah mempertimbangkan dampaknya terhadap data terbaru.

### 10.3 Verifikasi Backup

Pastikan:

- File backup berhasil dibuat.
- File dapat dibaca dan tidak rusak.
- Lokasi penyimpanan backup terlindungi.
- Proses pemulihan dapat diuji pada lingkungan terpisah.

Frekuensi backup dan periode penyimpanan harus ditentukan berdasarkan kebutuhan operasional proyek.

---

## 11. Pembaruan Aplikasi

Apabila terdapat perubahan source code yang akan diterapkan, lakukan prosedur berikut:

1. Pastikan perubahan telah ditinjau dan disetujui.
2. Periksa commit atau versi yang akan dipublikasikan.
3. Buat backup database sebelum perubahan skema.
4. Ambil source code versi terbaru.
5. Instal atau perbarui dependency sesuai lockfile.
6. Perbarui konfigurasi jika diperlukan.
7. Jalankan migration yang telah diverifikasi.
8. Build ulang frontend.
9. Aktifkan versi aplikasi yang baru.
10. Jalankan pemeriksaan setelah deployment.
11. Dokumentasikan hasil pembaruan.

Contoh pengambilan perubahan source code:

```bash
git pull origin <BRANCH_DEPLOYMENT>
```

Perintah tersebut harus dijalankan pada branch yang telah ditetapkan sebagai sumber deployment.

Jika pembaruan menyebabkan masalah, lakukan prosedur rollback sesuai strategi pemulihan yang telah disiapkan. Jangan mengembalikan source code tanpa mempertimbangkan kompatibilitas perubahan database.

---

## 12. Rollback Deployment

Rollback merupakan proses mengembalikan aplikasi ke versi sebelumnya ketika deployment baru menimbulkan masalah yang mengganggu operasional.

Langkah umum rollback:

1. Identifikasi masalah yang muncul setelah deployment.
2. Hentikan atau batasi akses ke versi bermasalah jika diperlukan.
3. Tentukan versi aplikasi sebelumnya yang masih stabil.
4. Kembalikan source code atau artefak frontend ke versi tersebut.
5. Periksa kompatibilitas backend dengan struktur database saat ini.
6. Pulihkan database dari backup hanya jika diperlukan dan telah dipertimbangkan dampaknya.
7. Aktifkan kembali layanan aplikasi.
8. Lakukan verifikasi fungsi utama.
9. Dokumentasikan penyebab dan tindakan rollback.

Rollback database tidak boleh dilakukan secara otomatis karena dapat menyebabkan hilangnya data yang telah masuk setelah deployment.

---

## 13. Penutup

Deployment Guide menjadi panduan penerapan aplikasi LetsOrder.com pada lingkungan server. Proses deployment mencakup persiapan infrastruktur, konfigurasi frontend dan backend, pengelolaan database, pengaktifan layanan, serta pemeriksaan setelah aplikasi dipublikasikan.

Setiap tahapan harus disesuaikan dengan infrastruktur yang benar-benar digunakan. Deployment dinyatakan selesai setelah komponen utama dapat berkomunikasi dan fungsi aplikasi telah diverifikasi melalui pengujian.

---

## 14. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan | Status |
|---|---|---|---|
| 1.0 | 10 November 2026 | Pembuatan awal Deployment Guide. | Draft |