# Contributing Guidelines

# Panduan Kontribusi LetsOrder.com

Terima kasih telah berkontribusi dalam pengembangan **LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ**.

Dokumen ini menjelaskan aturan dan prosedur yang perlu diikuti oleh seluruh anggota tim agar proses pengembangan berjalan secara terstruktur, konsisten, dan mudah dikelola.

## 1. Tujuan Kontribusi

Panduan ini dibuat untuk:

- Menjaga konsistensi struktur dan kualitas kode.
- Memudahkan koordinasi antaranggota tim.
- Mengatur proses pengembangan dan integrasi perubahan.
- Mengurangi risiko konflik kode dan kesalahan implementasi.
- Memastikan dokumentasi selalu sesuai dengan kondisi sistem.

## 2. Ruang Lingkup Kontribusi

Kontribusi dapat dilakukan pada bagian berikut:

| Area | Teknologi atau Komponen |
|---|---|
| Frontend | React dan Vite |
| Backend | Laravel dan PHP |
| Database | MySQL |
| API | Laravel API |
| Testing | Pengujian fungsional dan nonfungsional |
| Documentation | Markdown dan diagram Mermaid |
| Deployment | Konfigurasi lingkungan dan penerapan aplikasi |
| CI | GitHub Actions |

## 3. Persiapan Lingkungan Pengembangan

Sebelum mulai berkontribusi, pastikan perangkat telah memiliki perangkat lunak yang diperlukan:

- Git.
- Node.js versi yang sesuai dengan konfigurasi frontend.
- npm.
- PHP versi 8.2 atau lebih tinggi.
- Composer.
- MySQL.
- Code editor seperti Visual Studio Code.

### 3.1 Clone Repository

Unduh repository ke perangkat lokal:

```bash
git clone https://github.com/Elfathir/LetsOrder.git
```

Masuk ke direktori proyek:

```bash
cd LetsOrder
```

### 3.2 Menyiapkan Frontend

Masuk ke direktori frontend:

```bash
cd frontend
```

Instal dependensi:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

### 3.3 Menyiapkan Backend

Masuk ke direktori backend:

```bash
cd backend
```

Instal dependensi:

```bash
composer install
```

Salin konfigurasi lingkungan:

```bash
cp .env.example .env
```

Buat application key:

```bash
php artisan key:generate
```

Konfigurasikan koneksi database MySQL melalui file `.env` sebelum menjalankan aplikasi.

**Catatan:** Perintah di atas dapat dijalankan setelah skeleton Laravel dan file pendukung backend tersedia secara lengkap.

## 4. Aturan Pengelolaan Branch

Gunakan branch terpisah untuk setiap pekerjaan agar perubahan lebih mudah ditinjau.

Format penamaan branch:

```text
<type>/<short-description>
```

Contoh:

```text
feature/customer-login
feature/menu-management
fix/cart-validation
docs/update-installation-guide
test/order-process
```

Jenis branch yang digunakan:

| Prefix | Penggunaan |
|---|---|
| `feature/` | Pengembangan fitur baru |
| `fix/` | Perbaikan bug |
| `docs/` | Perubahan dokumentasi |
| `test/` | Penambahan atau perbaikan pengujian |
| `refactor/` | Perbaikan struktur kode |
| `config/` | Perubahan konfigurasi |

Branch utama yang digunakan adalah `main`. Perubahan sebaiknya digabungkan melalui Pull Request, bukan langsung dikirim ke `main`.

## 5. Aturan Commit

Gunakan format commit message yang jelas dan konsisten:

```text
<type>: <description>
```

Contoh:

```bash
git commit -m "feat: add customer login page"
git commit -m "fix: correct cart item quantity"
git commit -m "docs: update installation guide"
git commit -m "test: add order validation tests"
git commit -m "refactor: organize menu components"
```

Jenis commit:

| Type | Keterangan |
|---|---|
| `feat` | Menambahkan fitur |
| `fix` | Memperbaiki bug |
| `docs` | Memperbarui dokumentasi |
| `test` | Menambahkan atau memperbaiki pengujian |
| `refactor` | Merapikan struktur kode |
| `style` | Perubahan format atau tampilan kode tanpa perubahan logika |
| `chore` | Pekerjaan pemeliharaan atau konfigurasi |

Hindari pesan commit yang terlalu umum seperti `update`, `perbaikan`, atau `changes`.

## 6. Standar Penulisan Kode

### 6.1 Frontend

- Gunakan React untuk membangun antarmuka pengguna.
- Gunakan komponen agar kode lebih terstruktur dan dapat digunakan kembali.
- Pisahkan halaman berdasarkan peran Customer, Vendor, dan Administrator.
- Gunakan nama komponen dan variabel yang deskriptif.
- Pisahkan pemanggilan API dari komponen tampilan jika memungkinkan.
- Hindari penulisan kode yang berulang tanpa kebutuhan.

### 6.2 Backend

- Gunakan Laravel sebagai framework backend.
- Tempatkan controller sesuai tanggung jawab dan modul.
- Gunakan validasi input sebelum memproses permintaan.
- Pisahkan logika bisnis dari controller apabila diperlukan.
- Gunakan Eloquent ORM untuk interaksi dengan database.
- Terapkan autentikasi dan otorisasi sesuai peran pengguna.

### 6.3 Database

- Gunakan MySQL sebagai sistem manajemen basis data.
- Pertahankan konsistensi penamaan tabel dan kolom.
- Gunakan primary key dan foreign key sesuai ERD final.
- Jangan menambahkan entitas atau atribut baru tanpa persetujuan tim.
- Pastikan perubahan database terdokumentasi.

## 7. Aturan Pengembangan LetsOrder.com

Seluruh kontribusi harus mengikuti keputusan dan batasan proyek berikut:

1. Sistem menggunakan React, Laravel, dan MySQL.
2. Pengguna sistem terdiri dari Customer, Vendor, dan Administrator.
3. Proses pemesanan menggunakan mekanisme self-pickup.
4. Satu pesanan hanya terkait dengan satu tenant.
5. Nomor antrean digunakan untuk identifikasi pengambilan pesanan.
6. Pembayaran QRIS atau dompet digital hanya berupa simulasi.
7. Sistem tidak menyediakan layanan pengantaran makanan.
8. ERD final menjadi acuan utama pengembangan database dan kebutuhan sistem.

Setiap perubahan yang berpotensi memengaruhi ERD, kebutuhan sistem, atau ruang lingkup proyek harus dibahas dan disetujui oleh tim terlebih dahulu.

## 8. Prosedur Pengajuan Issue

Gunakan GitHub Issues untuk mencatat pekerjaan dan permasalahan.

Pilih templat sesuai kebutuhan:

- **Bug Report:** untuk melaporkan kesalahan sistem.
- **Feature Request:** untuk mengusulkan fitur atau peningkatan.
- **Task Request:** untuk mengajukan pekerjaan teknis maupun dokumentasi.

Sertakan deskripsi, langkah pengerjaan atau reproduksi, dan informasi pendukung yang relevan.

## 9. Prosedur Pull Request

Setelah pekerjaan selesai:

1. Pastikan perubahan telah disimpan melalui commit.
2. Push branch ke repository GitHub.
3. Buat Pull Request menuju branch `main`.
4. Gunakan format pada `PULL_REQUEST_TEMPLATE.md`.
5. Hubungkan Pull Request dengan Issue terkait jika tersedia.
6. Tunggu proses pemeriksaan dan Code Review.
7. Lakukan perbaikan apabila reviewer meminta perubahan.
8. Gabungkan perubahan setelah mendapatkan persetujuan sesuai kesepakatan tim.

## 10. Code Review

Setiap reviewer diharapkan memeriksa:

- Kesesuaian perubahan dengan kebutuhan proyek.
- Keterbacaan dan struktur kode.
- Potensi kesalahan atau bug.
- Dampak perubahan terhadap modul lain.
- Kesesuaian implementasi dengan ERD dan dokumentasi.
- Hasil pengujian yang disertakan.

Reviewer dapat memberikan komentar, menyetujui perubahan, atau meminta perbaikan.

## 11. Pengujian dan Continuous Integration

Sebelum Pull Request digabungkan:

- Jalankan pemeriksaan yang relevan secara lokal.
- Pastikan build frontend berhasil jika ada perubahan frontend.
- Pastikan sintaks PHP valid jika ada perubahan backend.
- Jalankan pengujian yang tersedia sesuai modul yang diubah.
- Periksa hasil GitHub Actions pada workflow Frontend CI dan Backend CI.

Pengujian harus dilakukan sesuai implementasi yang tersedia. Jangan menyatakan pengujian berhasil apabila belum dijalankan.

## 12. Dokumentasi

Setiap perubahan yang memengaruhi penggunaan atau cara kerja sistem harus diikuti dengan pembaruan dokumentasi yang relevan di direktori `docs/`.

Dokumentasi harus:

- Menggunakan bahasa Indonesia yang jelas dan formal.
- Menggunakan istilah teknis secara konsisten.
- Memiliki struktur heading yang teratur.
- Menyertakan diagram atau contoh apabila diperlukan.
- Sesuai dengan implementasi sistem yang sebenarnya.

## 13. Keamanan dan Kerahasiaan

Seluruh anggota tim wajib memperhatikan keamanan proyek:

- Jangan mengunggah file `.env` ke repository.
- Jangan menyimpan password, API key, atau token akses di dalam kode.
- Gunakan `.env.example` untuk memberikan contoh konfigurasi.
- Jangan mengunggah data pribadi atau informasi sensitif pengguna.
- Lakukan validasi terhadap input pengguna.
- Terapkan pembatasan akses berdasarkan peran pengguna.

## 14. Komunikasi dan Koordinasi Tim

Gunakan kanal komunikasi tim yang telah disepakati untuk:

- Membahas kendala teknis.
- Mengonfirmasi perubahan kebutuhan.
- Menyampaikan perkembangan pekerjaan.
- Mengatur pembagian dan prioritas tugas.
- Membahas hasil pengujian dan evaluasi.

Setiap perubahan penting sebaiknya dicatat melalui GitHub Issues, Pull Requests, atau dokumentasi proyek agar dapat ditelusuri.

## 15. Penutup

Seluruh anggota tim diharapkan mengikuti panduan ini selama proses pengembangan LetsOrder.com. Konsistensi dalam menulis kode, mengelola perubahan, melakukan pengujian, dan memperbarui dokumentasi akan membantu menjaga kualitas serta keteraturan proyek.

Terima kasih telah berkontribusi dalam pengembangan LetsOrder.com.