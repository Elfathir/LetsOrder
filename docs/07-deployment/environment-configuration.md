# Environment Configuration

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Nama Dokumen | Environment Configuration |
| Versi | 1.0 Draft |
| Tanggal | 10 November 2026 |
| Status | Draft |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Environment Configuration menjelaskan pengaturan konfigurasi lingkungan yang dibutuhkan untuk menjalankan aplikasi LetsOrder.com. Konfigurasi ini mencakup alamat aplikasi, koneksi API, pengaturan backend, koneksi database, serta pengelolaan informasi sensitif.

### 1.2 Ruang Lingkup

Dokumen ini mencakup:

1. Struktur file konfigurasi lingkungan.
2. Konfigurasi frontend React.
3. Konfigurasi backend Laravel.
4. Konfigurasi koneksi database MySQL.
5. Pemisahan konfigurasi development dan production.
6. Pengelolaan informasi sensitif.
7. Pemeriksaan konfigurasi.
8. Penanganan kesalahan konfigurasi.

### 1.3 Prinsip Konfigurasi

Pengaturan lingkungan LetsOrder.com mengikuti prinsip berikut:

- Konfigurasi lingkungan dipisahkan dari source code.
- Informasi sensitif tidak disimpan dalam repository publik.
- Setiap lingkungan menggunakan konfigurasi sesuai kebutuhan.
- Konfigurasi frontend hanya berisi informasi yang memang boleh diketahui pengguna.
- Konfigurasi backend dan database harus dilindungi.
- Perubahan konfigurasi harus diperiksa sebelum diterapkan.

---

## 2. Struktur File Environment

### 2.1 File Konfigurasi

Struktur file konfigurasi yang digunakan:

```text
LetsOrder.com/
├── frontend/
│   ├── .env.example
│   └── .env
│
└── backend/
    ├── .env.example
    └── .env
```

Keterangan:

| File | Fungsi |
|---|---|
| `frontend/.env.example` | Contoh konfigurasi frontend tanpa informasi rahasia. |
| `frontend/.env` | Konfigurasi frontend pada lingkungan lokal. |
| `backend/.env.example` | Contoh konfigurasi backend tanpa kredensial asli. |
| `backend/.env` | Konfigurasi backend sesuai lingkungan yang digunakan. |

File `.env` tidak boleh diunggah ke repository apabila berisi informasi sensitif.

### 2.2 Pengelolaan `.env.example`

File `.env.example` digunakan sebagai acuan konfigurasi bagi anggota tim.

Contoh:

```env
APP_NAME=LetsOrder
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=letsorder
DB_USERNAME=root
DB_PASSWORD=
```

Nilai di atas merupakan contoh untuk pengembangan lokal. Kredensial dan alamat sebenarnya harus disesuaikan dengan lingkungan masing-masing.

---

## 3. Konfigurasi Frontend React

### 3.1 Variabel Environment

Frontend React menggunakan Vite sehingga variabel environment yang diakses melalui kode frontend menggunakan awalan `VITE_`.

Contoh konfigurasi pada `frontend/.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

| Variabel | Fungsi | Contoh |
|---|---|---|
| `VITE_API_BASE_URL` | Menentukan alamat dasar API backend. | `http://127.0.0.1:8000/api` |

Nama variabel harus konsisten dengan implementasi pada source code frontend.

### 3.2 Penggunaan Variabel

Contoh penggunaan pada React:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

Variabel tersebut dapat digunakan oleh service frontend untuk mengirim permintaan ke backend.

Contoh:

```javascript
const response = await fetch(`${API_BASE_URL}/menus`);
const data = await response.json();
```

Contoh endpoint di atas hanya menggambarkan pola penggunaan URL API. Endpoint aktual harus mengikuti `API-Specification.md` dan implementasi backend.

### 3.3 Konfigurasi Development

Contoh `frontend/.env` untuk pengembangan lokal:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### 3.4 Konfigurasi Production

Contoh konfigurasi frontend untuk lingkungan produksi:

```env
VITE_API_BASE_URL=https://<DOMAIN_API>/api
```

Nilai konfigurasi harus ditentukan berdasarkan domain backend yang benar-benar digunakan.

Perubahan variabel environment frontend harus diikuti proses build ulang agar nilai konfigurasi diterapkan pada hasil build.

### 3.5 Keamanan Frontend

Variabel yang menggunakan awalan `VITE_` dapat dimasukkan ke dalam hasil build frontend dan diakses oleh pengguna.

Oleh karena itu, jangan menyimpan informasi berikut pada konfigurasi frontend:

- Password database.
- Application key Laravel.
- Secret key backend.
- Kredensial administrator.
- Token rahasia yang memberikan hak akses istimewa.

---

## 4. Konfigurasi Backend Laravel

### 4.1 Variabel Aplikasi

Contoh konfigurasi pada `backend/.env.example`:

```env
APP_NAME=LetsOrder
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
```

| Variabel | Fungsi |
|---|---|
| `APP_NAME` | Nama aplikasi. |
| `APP_ENV` | Menentukan lingkungan aplikasi. |
| `APP_KEY` | Kunci aplikasi Laravel. |
| `APP_DEBUG` | Mengatur tampilan informasi debug. |
| `APP_URL` | Menentukan URL utama backend. |

### 4.2 Variabel Database

Contoh konfigurasi:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=letsorder
DB_USERNAME=root
DB_PASSWORD=
```

| Variabel | Fungsi |
|---|---|
| `DB_CONNECTION` | Driver database yang digunakan. |
| `DB_HOST` | Alamat server database. |
| `DB_PORT` | Port koneksi database. |
| `DB_DATABASE` | Nama database aplikasi. |
| `DB_USERNAME` | Username database. |
| `DB_PASSWORD` | Password database. |

Kredensial database harus disesuaikan dengan akun yang disiapkan pada MySQL.

### 4.3 Variabel Konfigurasi Tambahan

Laravel dapat menggunakan variabel tambahan sesuai fitur dan konfigurasi yang diterapkan pada proyek.

Contoh:

```env
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

| Variabel | Fungsi |
|---|---|
| `LOG_CHANNEL` | Menentukan saluran pencatatan log. |
| `LOG_LEVEL` | Menentukan tingkat informasi log yang dicatat. |

Pengaturan tambahan seperti session, cache, mail, dan queue hanya perlu dimasukkan apabila benar-benar digunakan oleh implementasi aplikasi.

### 4.4 Konfigurasi Development

Contoh konfigurasi backend lokal:

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

LOG_CHANNEL=stack
LOG_LEVEL=debug
```

### 4.5 Konfigurasi Production

Contoh konfigurasi backend produksi:

```env
APP_NAME=LetsOrder
APP_ENV=production
APP_KEY=<APPLICATION_KEY>
APP_DEBUG=false
APP_URL=https://<DOMAIN_API>

DB_CONNECTION=mysql
DB_HOST=<HOST_DATABASE>
DB_PORT=3306
DB_DATABASE=<NAMA_DATABASE>
DB_USERNAME=<USERNAME_DATABASE>
DB_PASSWORD=<PASSWORD_DATABASE>

LOG_CHANNEL=stack
LOG_LEVEL=error
```

Nilai dalam tanda kurung sudut harus diganti dengan konfigurasi aktual. Jangan mengunggah nilai rahasia ke repository.

---

## 5. Konfigurasi Database MySQL

### 5.1 Informasi Database

LetsOrder.com menggunakan MySQL sebagai sistem pengelolaan basis data.

Informasi konfigurasi utama:

| Parameter | Keterangan |
|---|---|
| DBMS | MySQL |
| Database | `letsorder` |
| Connection Driver | `mysql` |
| Port Default | `3306` |
| Host Development | `127.0.0.1` |
| Host Production | Mengikuti konfigurasi server |

### 5.2 Struktur Database

Database harus mengikuti rancangan ERD final yang terdiri dari 11 entitas:

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

Perubahan struktur database harus mengikuti proses pengelolaan perubahan proyek dan tidak boleh menambahkan entitas atau atribut tanpa persetujuan perubahan rancangan.

### 5.3 Hak Akses Database

Akun database aplikasi sebaiknya memiliki hak akses sesuai kebutuhan operasionalnya.

Ketentuan:

- Gunakan akun khusus aplikasi pada lingkungan produksi.
- Hindari menggunakan akun root untuk koneksi aplikasi.
- Batasi akses database dari alamat server yang diperlukan.
- Jangan membagikan kredensial database.
- Lakukan backup sebelum perubahan struktur database.

---

## 6. Pemisahan Lingkungan

LetsOrder.com membedakan lingkungan pengembangan dan produksi untuk menjaga konsistensi proses pengembangan serta keamanan aplikasi.

### 6.1 Development Environment

Lingkungan development digunakan selama proses penulisan kode, debugging, dan pengujian awal.

Karakteristik:

- Berjalan pada komputer lokal pengembang.
- Menggunakan konfigurasi `APP_ENV=local`.
- Debug dapat diaktifkan.
- Menggunakan database pengembangan.
- Dapat menggunakan data uji.
- Perubahan source code dilakukan secara aktif.

### 6.2 Production Environment

Lingkungan production digunakan untuk menjalankan aplikasi yang telah disiapkan bagi pengguna.

Karakteristik:

- Berjalan pada server deployment.
- Menggunakan konfigurasi `APP_ENV=production`.
- Debug dinonaktifkan.
- Menggunakan database produksi.
- Menggunakan HTTPS.
- Kredensial dan informasi sensitif dilindungi.
- Perubahan dilakukan melalui prosedur deployment.

### 6.3 Perbandingan Lingkungan

| Aspek | Development | Production |
|---|---|---|
| APP_ENV | `local` | `production` |
| APP_DEBUG | `true` | `false` |
| Database | Database pengembangan | Database produksi |
| API URL | URL lokal | Domain backend |
| HTTPS | Tidak selalu diperlukan untuk localhost | Wajib digunakan pada akses publik |
| Logging | Informasi debug dapat dicatat | Mengikuti kebijakan log produksi |
| Source Code | Dapat berubah selama pengembangan | Menggunakan versi yang disetujui |
| Data | Data pengujian | Data operasional |

---

## 7. Pengelolaan File Environment

### 7.1 Membuat File Environment

Jika file `.env` belum tersedia, salin file contoh.

Linux atau macOS:

```bash
cp .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

Perintah dijalankan pada direktori komponen yang bersangkutan.

### 7.2 Mengubah Konfigurasi

Langkah pengubahan konfigurasi:

1. Buka file `.env` menggunakan code editor.
2. Periksa variabel yang diperlukan.
3. Sesuaikan nilai berdasarkan lingkungan.
4. Simpan perubahan.
5. Jalankan pemeriksaan konfigurasi.
6. Mulai ulang atau build ulang komponen apabila diperlukan.

### 7.3 Mengabaikan File Sensitif

Pastikan `.gitignore` pada frontend dan backend mencegah file `.env` lokal masuk ke repository.

Contoh aturan:

```gitignore
.env
.env.*
!.env.example
```

Periksa aturan tersebut sebelum digunakan karena pola `.gitignore` dapat memengaruhi file environment lain yang memang perlu disimpan.

### 7.4 Pengelolaan Secret

Informasi sensitif untuk production sebaiknya disimpan melalui mekanisme pengelolaan secret yang disediakan oleh lingkungan deployment.

Jangan:

- Mengunggah password ke GitHub.
- Menuliskan application key pada dokumentasi publik.
- Membagikan file `.env` melalui repository.
- Menampilkan kredensial pada log.
- Menggunakan kredensial production untuk pengujian lokal.

---

## 8. Pemeriksaan Konfigurasi

Setelah konfigurasi dilakukan, jalankan pemeriksaan berikut.

### 8.1 Pemeriksaan Frontend

| No. | Pemeriksaan | Hasil yang Diharapkan |
|---|---|---|
| 1 | File `.env` tersedia. | Konfigurasi frontend dapat dibaca. |
| 2 | URL API sesuai. | Frontend mengarah ke backend yang benar. |
| 3 | Variabel menggunakan awalan yang sesuai. | Variabel dapat diakses melalui mekanisme Vite. |
| 4 | Tidak ada secret backend. | Informasi sensitif tidak terekspos. |
| 5 | Build frontend berhasil. | File hasil build tersedia. |

### 8.2 Pemeriksaan Backend

| No. | Pemeriksaan | Hasil yang Diharapkan |
|---|---|---|
| 1 | File `.env` tersedia. | Laravel dapat membaca konfigurasi. |
| 2 | APP_KEY tersedia. | Application key telah dikonfigurasi. |
| 3 | APP_ENV sesuai. | Lingkungan aplikasi teridentifikasi dengan benar. |
| 4 | APP_DEBUG sesuai. | Debug aktif hanya pada lingkungan yang tepat. |
| 5 | Konfigurasi database sesuai. | Backend menggunakan database yang benar. |
| 6 | Koneksi database berjalan. | Backend dapat terhubung ke MySQL. |
| 7 | File konfigurasi terlindungi. | Informasi sensitif tidak masuk repository. |

### 8.3 Pemeriksaan Database

| No. | Pemeriksaan | Hasil yang Diharapkan |
|---|---|---|
| 1 | MySQL aktif. | Database dapat menerima koneksi. |
| 2 | Database tersedia. | Database `letsorder` dapat ditemukan. |
| 3 | Kredensial sesuai. | Backend dapat melakukan koneksi. |
| 4 | Struktur tabel sesuai ERD. | Sebelas entitas tersedia sesuai rancangan final. |
| 5 | Hak akses sesuai. | Akun aplikasi hanya memiliki hak yang diperlukan. |

---

## 9. Troubleshooting

### 9.1 Variabel Environment Tidak Terbaca

**Kemungkinan penyebab:**
- Nama variabel tidak sesuai.
- File `.env` berada di direktori yang salah.
- Proses belum dimulai ulang.
- Build frontend belum diperbarui.

**Solusi:**
1. Periksa nama variabel.
2. Pastikan file berada di direktori yang benar.
3. Jalankan ulang proses aplikasi.
4. Untuk frontend, jalankan kembali proses build.

### 9.2 Backend Tidak Dapat Terhubung ke Database

**Kemungkinan penyebab:**
- Host database salah.
- Port tidak sesuai.
- Username atau password salah.
- MySQL belum aktif.

**Solusi:**
1. Periksa konfigurasi `DB_HOST` dan `DB_PORT`.
2. Periksa kredensial database.
3. Pastikan MySQL berjalan.
4. Periksa izin akses akun database.
5. Bersihkan cache konfigurasi Laravel menggunakan:

```bash
php artisan optimize:clear
```

### 9.3 Frontend Mengarah ke URL API yang Salah

**Kemungkinan penyebab:**
- `VITE_API_BASE_URL` belum diperbarui.
- File build masih menggunakan konfigurasi lama.
- URL backend tidak sesuai.

**Solusi:**
1. Periksa nilai variabel environment.
2. Pastikan URL API benar.
3. Jalankan ulang proses build.
4. Periksa permintaan API melalui browser.

### 9.4 Konfigurasi Production Menampilkan Debug

**Kemungkinan penyebab:**
- `APP_DEBUG` masih bernilai `true`.
- Cache konfigurasi belum diperbarui.

**Solusi:**

Pastikan:

```env
APP_ENV=production
APP_DEBUG=false
```

Kemudian bersihkan dan bangun ulang cache konfigurasi sesuai prosedur deployment.

---

## 10. Penutup

Dokumen Environment Configuration menjadi acuan pengaturan lingkungan aplikasi LetsOrder.com. Konfigurasi yang tepat membantu memastikan frontend, backend, dan database dapat berkomunikasi sesuai kebutuhan serta mengurangi risiko kesalahan konfigurasi.

Pemisahan development dan production perlu diterapkan secara konsisten. Seluruh informasi sensitif harus dilindungi dan tidak boleh dimasukkan ke dalam repository publik. Nama variabel dan nilai konfigurasi akhir harus disesuaikan dengan implementasi aplikasi yang sebenarnya.

---

## 11. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan | Status |
|---|---|---|---|
| 1.0 | 10 November 2026 | Pembuatan awal Environment Configuration. | Draft |