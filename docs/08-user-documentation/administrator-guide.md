# Administrator Guide
## LetsOrder.com — Panduan Penggunaan untuk Administrator

**Versi Dokumen:** 1.0  
**Tanggal:** 10 November 2026  
**Status:** Draft

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini menjelaskan tata cara penggunaan LetsOrder.com dari sisi Administrator. Panduan ini disusun untuk membantu Administrator memahami proses login, melihat dan mengelola data pengguna, melihat dan mengelola data tenant, serta mengakhiri sesi penggunaan aplikasi.

### 1.2 Ruang Lingkup

Panduan Administrator mencakup fitur-fitur berikut:

- Login Administrator.
- Melihat daftar pengguna.
- Melihat detail pengguna.
- Memperbarui data pengguna.
- Melihat daftar tenant.
- Melihat detail tenant.
- Memperbarui data tenant.
- Logout.

### 1.3 Peran Administrator

Administrator merupakan pengguna yang memiliki kewenangan untuk mengelola data pengguna dan tenant dalam sistem LetsOrder.com.

Administrator bertanggung jawab memastikan data yang tersimpan sesuai dengan informasi yang diperlukan oleh aplikasi. Pengelolaan tersebut dilakukan melalui fitur yang tersedia berdasarkan hak akses Administrator.

---

## 2. Persiapan Penggunaan

Sebelum menggunakan LetsOrder.com, Administrator perlu menyiapkan:

1. Perangkat yang memiliki browser web.
2. Koneksi internet yang stabil.
3. Akun Administrator yang telah terdaftar pada sistem.
4. Informasi akun untuk melakukan autentikasi.

LetsOrder.com merupakan aplikasi berbasis web sehingga Administrator dapat mengaksesnya melalui browser tanpa memasang aplikasi Android atau iOS.

---

## 3. Panduan Penggunaan

### 3.1 Login Administrator

Login digunakan untuk mengakses halaman pengelolaan sistem dengan hak akses Administrator.

Langkah-langkah:

1. Buka halaman LetsOrder.com melalui browser.
2. Pilih menu login.
3. Masukkan informasi akun sesuai mekanisme login yang diterapkan.
4. Masukkan password.
5. Tekan tombol login.
6. Jika informasi akun valid dan perannya sesuai, sistem akan mengarahkan Administrator ke halaman dashboard Administrator.

Apabila login gagal, periksa kembali informasi akun yang dimasukkan.

### 3.2 Melihat Daftar Pengguna

Administrator dapat melihat daftar pengguna yang tercatat pada sistem.

Data pengguna disimpan dalam entitas USER dengan informasi berikut:

- ID pengguna.
- Username.
- Nama.
- Email.
- Password yang disimpan dalam bentuk terenkripsi atau hash.
- Peran pengguna.

Langkah-langkah:

1. Buka dashboard Administrator.
2. Pilih menu pengelolaan pengguna.
3. Sistem menampilkan daftar pengguna.
4. Periksa informasi pengguna yang ditampilkan.
5. Gunakan fitur pencarian atau penyaringan apabila tersedia pada implementasi aplikasi.

Informasi password tidak boleh ditampilkan dalam bentuk teks asli kepada Administrator.

### 3.3 Melihat Detail Pengguna

Administrator dapat membuka detail pengguna untuk memeriksa informasi akun yang tersimpan.

Langkah-langkah:

1. Buka halaman daftar pengguna.
2. Pilih pengguna yang ingin diperiksa.
3. Buka halaman atau tampilan detail pengguna.
4. Periksa informasi username, nama, email, dan peran.
5. Kembali ke daftar pengguna setelah selesai.

Pemeriksaan dilakukan untuk memastikan data pengguna sesuai dengan informasi yang tercatat pada sistem.

### 3.4 Memperbarui Data Pengguna

Administrator dapat memperbarui informasi pengguna melalui fitur pengelolaan pengguna.

Langkah-langkah:

1. Buka halaman daftar pengguna.
2. Pilih pengguna yang datanya ingin diperbarui.
3. Pilih fitur edit atau ubah data.
4. Perbarui informasi yang diperbolehkan, seperti username, nama, email, atau peran.
5. Periksa kembali informasi yang telah diubah.
6. Simpan perubahan.
7. Pastikan sistem menampilkan data terbaru.

**Catatan:** Pembaruan data harus mengikuti aturan validasi dan kewenangan yang diterapkan pada sistem. Password tidak ditampilkan sebagai informasi yang dapat dibaca Administrator.

### 3.5 Melihat Daftar Tenant

Administrator dapat melihat daftar tenant yang terdaftar pada LetsOrder.com.

Informasi tenant yang tersimpan meliputi:

- ID tenant.
- ID pengguna yang terkait.
- Nama tenant.
- Deskripsi tenant.
- Logo tenant.
- Status buka atau tutup.

Langkah-langkah:

1. Buka dashboard Administrator.
2. Pilih menu pengelolaan tenant.
3. Sistem menampilkan daftar tenant.
4. Periksa informasi tenant yang ditampilkan.
5. Pilih tenant apabila ingin melihat informasi lebih lanjut.

### 3.6 Melihat Detail Tenant

Administrator dapat melihat detail tenant untuk memeriksa informasi yang tersimpan dalam sistem.

Langkah-langkah:

1. Buka daftar tenant.
2. Pilih tenant yang ingin diperiksa.
3. Buka halaman atau tampilan detail tenant.
4. Periksa nama, deskripsi, logo, dan status operasional tenant.
5. Periksa informasi pengguna yang terkait apabila ditampilkan.
6. Kembali ke daftar tenant setelah selesai.

### 3.7 Memperbarui Data Tenant

Administrator dapat memperbarui informasi tenant sesuai kewenangan yang tersedia pada aplikasi.

Langkah-langkah:

1. Buka halaman daftar tenant.
2. Pilih tenant yang ingin diperbarui.
3. Pilih fitur edit atau ubah data.
4. Perbarui informasi yang diperlukan, seperti nama tenant, deskripsi, atau logo.
5. Periksa kembali informasi yang telah diperbarui.
6. Simpan perubahan.
7. Pastikan sistem menampilkan informasi terbaru.

Status buka atau tutup merupakan informasi operasional tenant. Perubahan status tersebut harus mengikuti hak akses dan mekanisme yang ditetapkan pada implementasi aplikasi.

### 3.8 Logout Administrator

Logout digunakan untuk mengakhiri sesi penggunaan akun Administrator.

Langkah-langkah:

1. Buka menu akun atau navigasi pengguna.
2. Pilih tombol logout.
3. Tunggu hingga sistem mengakhiri sesi.
4. Pastikan pengguna kembali ke halaman login atau halaman awal sesuai implementasi aplikasi.

Administrator disarankan melakukan logout setelah menyelesaikan aktivitas pengelolaan sistem, terutama ketika menggunakan perangkat bersama.

---

## 4. Ketentuan Penggunaan

Administrator perlu memperhatikan beberapa ketentuan berikut:

1. Administrator harus menggunakan akun dengan peran Administrator untuk mengakses fitur pengelolaan sistem.
2. Pengelolaan data pengguna harus dilakukan sesuai kewenangan yang diberikan.
3. Perubahan informasi pengguna harus mengikuti aturan validasi aplikasi.
4. Informasi password tidak boleh ditampilkan dalam bentuk teks asli.
5. Pengelolaan tenant harus mengacu pada data yang tersimpan dalam sistem.
6. Perubahan data harus diperiksa kembali sebelum disimpan.
7. Status buka atau tutup tenant merupakan status operasional, bukan status aktif atau nonaktif akun.
8. Administrator tidak boleh mengakses atau mengubah data di luar kewenangan yang ditetapkan sistem.

---

## 5. Permasalahan Umum

| Permasalahan | Hal yang Perlu Diperiksa |
|---|---|
| Tidak dapat login | Periksa kembali informasi akun dan password. |
| Daftar pengguna tidak muncul | Periksa koneksi dan akses ke halaman pengelolaan pengguna. |
| Detail pengguna tidak dapat dibuka | Pastikan pengguna yang dipilih tersedia. |
| Perubahan data pengguna tidak tersimpan | Periksa kelengkapan data dan validasi formulir. |
| Daftar tenant tidak muncul | Periksa koneksi dan akses ke halaman pengelolaan tenant. |
| Detail tenant tidak dapat dibuka | Pastikan tenant yang dipilih tersedia. |
| Perubahan data tenant tidak tersimpan | Periksa kelengkapan data dan validasi formulir. |
| Tidak dapat mengakses dashboard Administrator | Pastikan akun memiliki peran Administrator. |

Apabila permasalahan masih terjadi, Administrator dapat melakukan pemeriksaan lebih lanjut sesuai prosedur pemeliharaan sistem.

---

## 6. Penutup

Panduan ini diharapkan dapat membantu Administrator menjalankan tugas pengelolaan data pengguna dan tenant pada LetsOrder.com. Dengan adanya panduan ini, proses administrasi sistem diharapkan dapat dilakukan secara lebih terstruktur dan sesuai dengan hak akses yang telah ditetapkan.

Dokumen ini dapat diperbarui apabila terdapat perubahan fitur, hak akses, antarmuka, atau mekanisme pengelolaan data berdasarkan hasil implementasi dan pengujian sistem.