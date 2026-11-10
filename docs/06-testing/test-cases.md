# Test Cases

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Test Cases |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi Pengujian | Test Plan |
| Metode Utama | Black Box Testing |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Test Cases merupakan dokumen yang berisi kumpulan kasus pengujian untuk memverifikasi apakah setiap fungsi pada sistem LetsOrder.com berjalan sesuai kebutuhan yang telah ditentukan.

Dokumen ini digunakan oleh tim Quality Control dan pengembang sebagai panduan dalam melaksanakan pengujian terhadap fitur Customer, Vendor, dan Administrator.

Setiap kasus pengujian disusun berdasarkan kebutuhan fungsional dan non-fungsional agar hasil pengujian dapat dicatat serta ditelusuri secara sistematis.

## 1.2 Ruang Lingkup

Pengujian mencakup:

1. Authentication.
2. Pengelolaan tenant.
3. Pengelolaan kategori dan menu.
4. Keranjang.
5. Pemesanan.
6. Pembayaran simulasi.
7. Pelacakan pesanan.
8. Riwayat pesanan.
9. Notifikasi.
10. Pengelolaan data oleh Administrator.
11. Proses self-pickup.
12. Kualitas sistem berdasarkan kebutuhan non-fungsional.

## 1.3 Ketentuan Pengujian

- Seluruh pengujian dilakukan pada lingkungan pengujian, bukan database produksi.
- Data yang digunakan merupakan data contoh.
- Setiap pengujian harus memiliki hasil aktual yang dicatat oleh penguji.
- Hasil pengujian tidak boleh ditentukan sebelum pengujian benar-benar dilaksanakan.
- Nilai status pesanan dan pembayaran harus mengikuti ketentuan implementasi yang telah disepakati.
- Pengujian harus mengikuti struktur 11 entitas pada ERD final.

---

# 2. Format Test Case

Setiap kasus pengujian menggunakan atribut berikut:

| Atribut | Keterangan |
|---|---|
| Test Case ID | Identitas unik kasus pengujian. |
| Requirement ID | Kebutuhan fungsional atau non-fungsional yang diuji. |
| Test Case | Nama atau tujuan pengujian. |
| Prioritas | Tingkat kepentingan pengujian. |
| Prasyarat | Kondisi yang harus dipenuhi sebelum pengujian. |
| Langkah Pengujian | Urutan tindakan yang dilakukan penguji. |
| Hasil yang Diharapkan | Respons atau kondisi yang seharusnya dihasilkan sistem. |
| Hasil Aktual | Hasil yang diperoleh ketika pengujian dilaksanakan. |
| Status | Pass, Fail, Blocked, atau Not Tested. |

## 2.1 Prioritas Pengujian

| Prioritas | Keterangan |
|---|---|
| P1 - Critical | Menguji fungsi utama yang sangat penting bagi operasional sistem. |
| P2 - High | Menguji fungsi penting yang mendukung alur utama. |
| P3 - Medium | Menguji fungsi pendukung. |
| P4 - Low | Menguji aspek minor atau penyempurnaan. |

## 2.2 Status Pengujian

| Status | Keterangan |
|---|---|
| Pass | Hasil aktual sesuai dengan hasil yang diharapkan. |
| Fail | Hasil aktual tidak sesuai dengan hasil yang diharapkan. |
| Blocked | Pengujian tidak dapat dilaksanakan karena terdapat kendala atau ketergantungan. |
| Not Tested | Pengujian belum dilaksanakan. |

---

# 3. Functional Test Cases

## 3.1 Authentication

Pengujian dilakukan untuk memastikan proses registrasi dan autentikasi pengguna berjalan sesuai ketentuan.

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-01 | FR-01 | Registrasi Customer dengan data valid | P1 |
| TC-FR-02 | FR-02 | Registrasi dengan email yang sudah digunakan | P2 |
| TC-FR-03 | FR-03 | Login menggunakan kredensial yang valid | P1 |
| TC-FR-04 | FR-04 | Login menggunakan password yang salah | P1 |
| TC-FR-05 | FR-04 | Mengakses halaman privat tanpa autentikasi | P1 |
| TC-FR-06 | FR-04 | Mengakses fitur yang tidak sesuai dengan peran pengguna | P1 |

### TC-FR-01 — Registrasi Customer dengan Data Valid

**Prasyarat:**
- Pengguna belum memiliki akun.
- Halaman registrasi dapat diakses.

**Langkah Pengujian:**
1. Buka halaman registrasi.
2. Masukkan username yang belum digunakan.
3. Masukkan nama pengguna.
4. Masukkan email yang valid dan belum terdaftar.
5. Masukkan password sesuai ketentuan.
6. Tekan tombol registrasi.

**Hasil yang Diharapkan:**
- Sistem menerima data registrasi.
- Akun Customer berhasil dibuat.
- Data pengguna tersimpan pada entitas USER.
- Sistem menampilkan informasi keberhasilan registrasi.

### TC-FR-02 — Registrasi dengan Email yang Sudah Digunakan

**Prasyarat:**
- Email sudah terdaftar pada sistem.
- Halaman registrasi dapat diakses.

**Langkah Pengujian:**
1. Buka halaman registrasi.
2. Masukkan data pengguna baru.
3. Gunakan email yang sudah terdaftar.
4. Tekan tombol registrasi.

**Hasil yang Diharapkan:**
- Sistem menolak registrasi.
- Sistem menampilkan pesan bahwa email telah digunakan.
- Data pengguna duplikat tidak dibuat.

### TC-FR-03 — Login dengan Kredensial Valid

**Prasyarat:**
- Akun pengguna telah terdaftar.

**Langkah Pengujian:**
1. Buka halaman login.
2. Masukkan email yang terdaftar.
3. Masukkan password yang benar.
4. Tekan tombol login.

**Hasil yang Diharapkan:**
- Sistem memverifikasi kredensial.
- Pengguna berhasil masuk.
- Sistem mengarahkan pengguna ke halaman sesuai perannya.

### TC-FR-04 — Login dengan Password Salah

**Prasyarat:**
- Akun pengguna telah terdaftar.

**Langkah Pengujian:**
1. Buka halaman login.
2. Masukkan email yang terdaftar.
3. Masukkan password yang salah.
4. Tekan tombol login.

**Hasil yang Diharapkan:**
- Sistem menolak autentikasi.
- Sistem menampilkan pesan kesalahan.
- Pengguna tidak memperoleh akses ke halaman privat.

### TC-FR-05 — Mengakses Halaman Privat Tanpa Autentikasi

**Prasyarat:**
- Pengguna belum login.

**Langkah Pengujian:**
1. Buka alamat halaman yang memerlukan autentikasi.
2. Coba mengakses halaman tersebut secara langsung.

**Hasil yang Diharapkan:**
- Backend menolak permintaan yang tidak memiliki autentikasi valid.
- Sistem tidak memberikan data privat.
- Pengguna diarahkan ke proses login atau menerima respons HTTP 401.

### TC-FR-06 — Mengakses Fitur yang Tidak Sesuai dengan Peran

**Prasyarat:**
- Pengguna login sebagai Customer.
- Terdapat endpoint khusus Vendor atau Administrator.

**Langkah Pengujian:**
1. Login menggunakan akun Customer.
2. Kirim permintaan ke endpoint khusus Vendor atau Administrator.
3. Amati respons backend.

**Hasil yang Diharapkan:**
- Backend menolak permintaan.
- Sistem memberikan respons HTTP 403.
- Customer tidak dapat melakukan tindakan di luar kewenangannya.

---

## 3.2 Tenant dan Kategori

Pengujian dilakukan untuk memastikan informasi tenant dan kategori dapat ditampilkan serta dikelola sesuai kewenangan.

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-07 | FR-05 | Menampilkan daftar tenant | P2 |
| TC-FR-08 | FR-05 | Menampilkan detail tenant | P2 |
| TC-FR-09 | FR-12 | Vendor memperbarui informasi tenant miliknya | P2 |
| TC-FR-10 | FR-12 | Vendor mencoba memperbarui tenant milik pihak lain | P1 |
| TC-FR-11 | FR-06 | Menampilkan daftar kategori | P2 |
| TC-FR-12 | FR-08 | Menampilkan menu berdasarkan kategori | P2 |

### TC-FR-07 — Menampilkan Daftar Tenant

**Prasyarat:**
- Terdapat data tenant pada database.

**Langkah Pengujian:**
1. Buka halaman daftar tenant.
2. Sistem mengirim permintaan daftar tenant ke backend.
3. Amati informasi yang ditampilkan.

**Hasil yang Diharapkan:**
- Daftar tenant berhasil ditampilkan.
- Informasi nama, deskripsi, logo, dan status buka sesuai data TENANT.

### TC-FR-08 — Menampilkan Detail Tenant

**Prasyarat:**
- Tenant yang akan diuji tersedia.

**Langkah Pengujian:**
1. Pilih salah satu tenant.
2. Buka halaman detail tenant.
3. Amati informasi yang ditampilkan.

**Hasil yang Diharapkan:**
- Sistem menampilkan informasi tenant sesuai data database.
- Informasi tidak tertukar dengan tenant lain.

### TC-FR-09 — Vendor Memperbarui Tenant Miliknya

**Prasyarat:**
- Vendor sudah login.
- Vendor memiliki tenant dalam kewenangannya.

**Langkah Pengujian:**
1. Buka halaman informasi tenant.
2. Ubah nama atau deskripsi tenant.
3. Simpan perubahan.
4. Muat ulang halaman.

**Hasil yang Diharapkan:**
- Perubahan berhasil disimpan.
- Data TENANT diperbarui.
- Informasi terbaru ditampilkan pada halaman tenant.

### TC-FR-10 — Vendor Memperbarui Tenant Milik Pihak Lain

**Prasyarat:**
- Vendor sudah login.
- Terdapat tenant lain yang tidak berada dalam kewenangannya.

**Langkah Pengujian:**
1. Kirim permintaan pembaruan menggunakan ID tenant lain.
2. Amati respons backend.

**Hasil yang Diharapkan:**
- Backend menolak permintaan.
- Data tenant lain tidak berubah.

### TC-FR-11 — Menampilkan Daftar Kategori

**Prasyarat:**
- Data kategori tersedia pada database.

**Langkah Pengujian:**
1. Buka halaman katalog menu.
2. Sistem mengambil daftar kategori.
3. Amati kategori yang ditampilkan.

**Hasil yang Diharapkan:**
- Daftar kategori berhasil ditampilkan.
- Nama kategori dan ikon sesuai data KATEGORI.

### TC-FR-12 — Menampilkan Menu Berdasarkan Kategori

**Prasyarat:**
- Terdapat beberapa menu dengan kategori berbeda.

**Langkah Pengujian:**
1. Buka halaman katalog.
2. Pilih salah satu kategori.
3. Amati daftar menu.

**Hasil yang Diharapkan:**
- Sistem hanya menampilkan menu yang memiliki `id_kategori` sesuai kategori terpilih.

---

## 3.3 Pengelolaan Menu

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-13 | FR-07 | Menampilkan daftar menu | P1 |
| TC-FR-14 | FR-09 | Vendor menambahkan menu dengan data valid | P1 |
| TC-FR-15 | FR-09 | Vendor menambahkan menu dengan data tidak valid | P2 |
| TC-FR-16 | FR-10 | Vendor memperbarui informasi menu | P1 |
| TC-FR-17 | FR-11 | Vendor menghapus menu | P2 |
| TC-FR-18 | FR-11 | Vendor mencoba mengelola menu milik tenant lain | P1 |
| TC-FR-19 | FR-10 | Vendor mengubah status ketersediaan menu | P1 |

### TC-FR-13 — Menampilkan Daftar Menu

**Prasyarat:**
- Data menu tersedia.

**Langkah Pengujian:**
1. Buka halaman katalog.
2. Pilih tenant.
3. Amati daftar menu.

**Hasil yang Diharapkan:**
- Sistem menampilkan menu milik tenant yang dipilih.
- Nama, gambar, deskripsi, harga, estimasi waktu, dan status ketersediaan sesuai database.

### TC-FR-14 — Vendor Menambahkan Menu dengan Data Valid

**Prasyarat:**
- Vendor sudah login.
- Vendor memiliki tenant.
- Kategori yang digunakan tersedia.

**Langkah Pengujian:**
1. Buka halaman pengelolaan menu.
2. Pilih tambah menu.
3. Masukkan nama menu.
4. Masukkan deskripsi.
5. Masukkan gambar.
6. Masukkan harga dan estimasi waktu.
7. Pilih kategori.
8. Tentukan status ketersediaan.
9. Simpan menu.

**Hasil yang Diharapkan:**
- Menu berhasil dibuat.
- Data tersimpan pada MENU.
- Menu terkait dengan tenant dan kategori yang benar.

### TC-FR-15 — Menambahkan Menu dengan Data Tidak Valid

**Prasyarat:**
- Vendor sudah login.

**Langkah Pengujian:**
1. Buka form tambah menu.
2. Masukkan harga dengan format tidak valid.
3. Masukkan estimasi waktu dengan nilai yang tidak valid.
4. Kirim form.

**Hasil yang Diharapkan:**
- Backend menolak data yang tidak valid.
- Sistem menampilkan pesan validasi.
- Data menu tidak disimpan.

### TC-FR-16 — Vendor Memperbarui Informasi Menu

**Prasyarat:**
- Menu telah tersedia.
- Vendor memiliki kewenangan atas menu tersebut.

**Langkah Pengujian:**
1. Pilih menu yang akan diperbarui.
2. Ubah nama atau deskripsi.
3. Simpan perubahan.
4. Periksa kembali detail menu.

**Hasil yang Diharapkan:**
- Informasi menu berhasil diperbarui.
- Perubahan tersimpan pada MENU.

### TC-FR-17 — Vendor Menghapus Menu

**Prasyarat:**
- Menu tersedia.
- Menu dapat dihapus tanpa melanggar integritas referensial.

**Langkah Pengujian:**
1. Pilih menu yang akan dihapus.
2. Jalankan tindakan penghapusan.
3. Periksa respons sistem.

**Hasil yang Diharapkan:**
- Penghapusan berhasil apabila memenuhi aturan integritas referensial.
- Menu tidak lagi muncul dalam daftar menu aktif.

### TC-FR-18 — Vendor Mengelola Menu Milik Tenant Lain

**Prasyarat:**
- Vendor sudah login.
- Terdapat menu milik tenant lain.

**Langkah Pengujian:**
1. Kirim permintaan perubahan atau penghapusan menu milik tenant lain.
2. Amati respons backend.

**Hasil yang Diharapkan:**
- Backend menolak permintaan.
- Data menu tidak berubah.

### TC-FR-19 — Mengubah Status Ketersediaan Menu

**Prasyarat:**
- Menu tersedia.
- Vendor memiliki kewenangan terhadap menu tersebut.

**Langkah Pengujian:**
1. Buka halaman pengelolaan menu.
2. Pilih salah satu menu.
3. Ubah status ketersediaan.
4. Simpan perubahan.
5. Periksa katalog Customer.

**Hasil yang Diharapkan:**
- Status `status_tersedia` berhasil diperbarui.
- Katalog menampilkan status terbaru.
- Menu yang tidak tersedia tidak dapat dipesan.

---

## 3.4 Keranjang

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-20 | FR-13 | Menampilkan keranjang Customer | P1 |
| TC-FR-21 | FR-14 | Menambahkan menu ke keranjang | P1 |
| TC-FR-22 | FR-15 | Memperbarui jumlah item | P1 |
| TC-FR-23 | FR-16 | Menghapus item keranjang | P2 |
| TC-FR-24 | FR-17 | Menghitung subtotal dan total keranjang | P1 |
| TC-FR-25 | FR-18 | Menambahkan catatan pada item | P2 |
| TC-FR-26 | FR-19 | Memvalidasi tenant pada keranjang | P1 |

### TC-FR-20 — Menampilkan Keranjang Customer

**Prasyarat:**
- Customer sudah login.
- Keranjang tersedia.

**Langkah Pengujian:**
1. Buka halaman keranjang.
2. Sistem mengambil data keranjang.
3. Amati daftar item.

**Hasil yang Diharapkan:**
- Keranjang menampilkan item milik Customer yang sedang login.
- Jumlah dan catatan item sesuai data ITEM_KERANJANG.

### TC-FR-21 — Menambahkan Menu ke Keranjang

**Prasyarat:**
- Customer sudah login.
- Menu tersedia.

**Langkah Pengujian:**
1. Pilih menu yang tersedia.
2. Tentukan jumlah.
3. Masukkan catatan jika diperlukan.
4. Tekan tombol tambah ke keranjang.
5. Buka halaman keranjang.

**Hasil yang Diharapkan:**
- Item berhasil ditambahkan.
- Data tersimpan pada ITEM_KERANJANG.
- Item terhubung dengan keranjang Customer dan menu yang dipilih.

### TC-FR-22 — Memperbarui Jumlah Item

**Prasyarat:**
- Keranjang memiliki item.

**Langkah Pengujian:**
1. Buka keranjang.
2. Pilih item.
3. Ubah jumlah item menjadi nilai positif.
4. Simpan perubahan.

**Hasil yang Diharapkan:**
- Jumlah item berhasil diperbarui.
- Subtotal dan total keranjang dihitung kembali.

### TC-FR-23 — Menghapus Item Keranjang

**Prasyarat:**
- Keranjang memiliki minimal satu item.

**Langkah Pengujian:**
1. Buka halaman keranjang.
2. Pilih item yang akan dihapus.
3. Tekan tombol hapus.
4. Periksa daftar keranjang.

**Hasil yang Diharapkan:**
- Item terpilih berhasil dihapus.
- Item lain tetap tersedia.

### TC-FR-24 — Menghitung Subtotal dan Total Keranjang

**Prasyarat:**
- Keranjang berisi satu atau lebih item.

**Langkah Pengujian:**
1. Masukkan item dengan jumlah tertentu.
2. Periksa harga setiap menu.
3. Periksa subtotal setiap item.
4. Periksa total keranjang.

**Hasil yang Diharapkan:**
- Subtotal dihitung berdasarkan harga menu dikalikan jumlah.
- Total keranjang merupakan penjumlahan seluruh subtotal.
- Nilai yang ditampilkan sesuai perhitungan backend.

### TC-FR-25 — Menambahkan Catatan Item

**Prasyarat:**
- Customer memiliki item pada keranjang.

**Langkah Pengujian:**
1. Pilih salah satu item.
2. Masukkan catatan.
3. Simpan perubahan.
4. Periksa kembali item.

**Hasil yang Diharapkan:**
- Catatan berhasil disimpan pada atribut `catatan` di ITEM_KERANJANG.

### TC-FR-26 — Memvalidasi Tenant pada Keranjang

**Prasyarat:**
- Customer telah memiliki item dari satu tenant.

**Langkah Pengujian:**
1. Tambahkan menu dari tenant pertama.
2. Coba menambahkan menu dari tenant kedua.
3. Amati respons sistem.

**Hasil yang Diharapkan:**
- Sistem menerapkan aturan satu tenant untuk satu pesanan.
- Sistem tidak menggabungkan menu dari tenant berbeda dalam satu pesanan.
- Pengguna menerima informasi mengenai kondisi keranjang.

---

## 3.5 Pemesanan

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-27 | FR-20 | Membuat pesanan dari keranjang valid | P1 |
| TC-FR-28 | FR-21 | Membentuk nomor antrean pesanan | P1 |
| TC-FR-29 | FR-22 | Menyimpan detail pesanan | P1 |
| TC-FR-30 | FR-23 | Menghitung total harga pesanan | P1 |
| TC-FR-31 | FR-24 | Menyimpan catatan pesanan | P2 |
| TC-FR-32 | FR-25 | Memvalidasi ketersediaan menu saat pemesanan | P1 |
| TC-FR-33 | FR-26 | Vendor melihat pesanan masuk | P1 |

### TC-FR-27 — Membuat Pesanan dari Keranjang Valid

**Prasyarat:**
- Customer sudah login.
- Keranjang memiliki item valid dari satu tenant.
- Menu masih tersedia.

**Langkah Pengujian:**
1. Buka halaman keranjang.
2. Periksa item dan total harga.
3. Lanjutkan proses pemesanan.
4. Konfirmasikan pesanan.

**Hasil yang Diharapkan:**
- Pesanan berhasil dibuat.
- Data tersimpan pada PESANAN.
- Detail item tersimpan pada DETAIL_PESANAN.
- Pesanan terhubung dengan Customer dan tenant yang benar.

### TC-FR-28 — Membentuk Nomor Antrean

**Prasyarat:**
- Pesanan berhasil dibuat.

**Langkah Pengujian:**
1. Buat pesanan baru.
2. Periksa data PESANAN.
3. Amati nilai `nomor_antrean`.

**Hasil yang Diharapkan:**
- Sistem menghasilkan nomor antrean.
- Nomor antrean terkait dengan pesanan yang dibuat.
- Nomor antrean mengikuti aturan pembentukan yang telah ditetapkan.

### TC-FR-29 — Menyimpan Detail Pesanan

**Prasyarat:**
- Customer memiliki keranjang valid.

**Langkah Pengujian:**
1. Buat pesanan dengan satu atau lebih item.
2. Periksa data PESANAN.
3. Periksa data DETAIL_PESANAN.

**Hasil yang Diharapkan:**
- Data pesanan tersimpan.
- Setiap item pesanan memiliki hubungan dengan pesanan dan menu yang sesuai.
- Jumlah dan subtotal tersimpan dengan benar.

### TC-FR-30 — Menghitung Total Harga Pesanan

**Prasyarat:**
- Keranjang memiliki item dengan jumlah dan harga yang valid.

**Langkah Pengujian:**
1. Tambahkan beberapa item.
2. Periksa subtotal setiap item.
3. Buat pesanan.
4. Bandingkan total pesanan dengan penjumlahan subtotal.

**Hasil yang Diharapkan:**
- `total_harga` pada PESANAN sesuai dengan jumlah seluruh subtotal DETAIL_PESANAN.
- Tidak terdapat perbedaan perhitungan antara frontend dan backend.

### TC-FR-31 — Menyimpan Catatan Pesanan

**Prasyarat:**
- Customer memiliki keranjang valid.

**Langkah Pengujian:**
1. Masukkan catatan pesanan.
2. Buat pesanan.
3. Periksa data PESANAN.

**Hasil yang Diharapkan:**
- Catatan tersimpan pada atribut `catatan` PESANAN.

### TC-FR-32 — Memvalidasi Ketersediaan Menu Saat Pemesanan

**Prasyarat:**
- Customer memiliki menu dalam keranjang.
- Status ketersediaan menu berubah sebelum pesanan dikonfirmasi.

**Langkah Pengujian:**
1. Tambahkan menu ke keranjang.
2. Ubah status menu menjadi tidak tersedia melalui akun Vendor.
3. Coba buat pesanan menggunakan keranjang tersebut.

**Hasil yang Diharapkan:**
- Backend memeriksa kembali ketersediaan menu.
- Pesanan tidak diproses menggunakan menu yang sudah tidak tersedia.
- Sistem memberikan informasi kepada Customer.

### TC-FR-33 — Vendor Melihat Pesanan Masuk

**Prasyarat:**
- Vendor sudah login.
- Terdapat pesanan untuk tenant miliknya.

**Langkah Pengujian:**
1. Buka halaman pesanan masuk Vendor.
2. Sistem mengambil data pesanan.
3. Amati daftar pesanan.

**Hasil yang Diharapkan:**
- Pesanan tenant berhasil ditampilkan.
- Informasi nomor antrean, total harga, dan status sesuai database.
- Vendor tidak dapat melihat pesanan tenant lain tanpa kewenangan.

---

## 3.6 Pembayaran Simulasi

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-34 | FR-27 | Membuat pembayaran simulasi | P1 |
| TC-FR-35 | FR-28 | Menampilkan informasi pembayaran | P1 |
| TC-FR-36 | FR-29 | Memvalidasi jumlah pembayaran | P1 |
| TC-FR-37 | FR-30 | Memproses verifikasi pembayaran simulasi | P1 |
| TC-FR-38 | FR-31 | Menangani batas waktu pembayaran | P2 |
| TC-FR-39 | FR-32 | Memperbarui informasi waktu pembayaran | P2 |

### TC-FR-34 — Membuat Pembayaran Simulasi

**Prasyarat:**
- Pesanan telah dibuat.
- Customer merupakan pemilik pesanan.

**Langkah Pengujian:**
1. Buka halaman pembayaran.
2. Pilih metode pembayaran yang tersedia.
3. Konfirmasikan pembayaran simulasi.
4. Periksa data PEMBAYARAN.

**Hasil yang Diharapkan:**
- Data pembayaran berhasil dibuat.
- Pembayaran terhubung dengan pesanan.
- Metode pembayaran dan total bayar tersimpan sesuai ketentuan.

### TC-FR-35 — Menampilkan Informasi Pembayaran

**Prasyarat:**
- Data pembayaran telah tersedia.

**Langkah Pengujian:**
1. Buka detail pembayaran.
2. Sistem mengambil informasi pembayaran.
3. Amati informasi yang ditampilkan.

**Hasil yang Diharapkan:**
- Metode pembayaran.
- Kode QRIS simulasi jika digunakan.
- Total bayar.
- Status verifikasi.
- Batas waktu pembayaran.

Seluruh informasi harus sesuai dengan data PEMBAYARAN.

### TC-FR-36 — Memvalidasi Jumlah Pembayaran

**Prasyarat:**
- Pesanan memiliki total harga.
- Data pembayaran akan dibuat atau diproses.

**Langkah Pengujian:**
1. Buat pembayaran untuk pesanan.
2. Periksa nilai total bayar.
3. Bandingkan dengan total harga pesanan.
4. Coba kirim nilai pembayaran yang tidak sesuai melalui request pengujian.

**Hasil yang Diharapkan:**
- Nilai pembayaran yang valid harus sesuai dengan total pesanan.
- Backend tidak menerima perubahan jumlah pembayaran yang tidak sah dari frontend.

### TC-FR-37 — Memproses Verifikasi Pembayaran Simulasi

**Prasyarat:**
- Data pembayaran tersedia.
- Mekanisme dan aktor verifikasi telah ditetapkan.
- Penguji memiliki kewenangan sesuai mekanisme tersebut.

**Langkah Pengujian:**
1. Buka informasi pembayaran.
2. Jalankan tindakan verifikasi simulasi.
3. Periksa status verifikasi.
4. Periksa keterkaitannya dengan pesanan.

**Hasil yang Diharapkan:**
- Status verifikasi diperbarui sesuai hasil proses simulasi.
- Perubahan hanya dapat dilakukan oleh aktor yang berwenang.
- Sistem tidak menghubungkan proses ini dengan transaksi payment gateway sungguhan.

### TC-FR-38 — Menangani Batas Waktu Pembayaran

**Prasyarat:**
- Data pembayaran memiliki batas waktu.

**Langkah Pengujian:**
1. Buat data pembayaran dengan batas waktu pengujian.
2. Simulasikan kondisi sebelum dan setelah batas waktu.
3. Amati respons sistem.

**Hasil yang Diharapkan:**
- Sistem dapat mengenali kondisi pembayaran yang melewati batas waktu.
- Proses selanjutnya mengikuti aturan pembayaran yang telah ditetapkan.
- Sistem tidak menandai pembayaran sebagai terverifikasi hanya karena batas waktu telah terlewati.

### TC-FR-39 — Memperbarui Waktu Pembayaran

**Prasyarat:**
- Pembayaran simulasi berhasil diproses sesuai mekanisme yang ditetapkan.

**Langkah Pengujian:**
1. Jalankan proses pembayaran simulasi.
2. Periksa data `waktu_bayar`.
3. Bandingkan dengan waktu proses yang tercatat.

**Hasil yang Diharapkan:**
- Waktu pembayaran dicatat sesuai ketentuan sistem.
- Nilai waktu tidak diisi sebagai pembayaran berhasil apabila proses belum memenuhi kondisi yang ditentukan.

---

## 3.7 Pelacakan dan Riwayat Pesanan

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-40 | FR-33 | Customer melihat detail pesanan | P1 |
| TC-FR-41 | FR-34 | Customer melihat status terkini pesanan | P1 |
| TC-FR-42 | FR-35 | Sistem mencatat riwayat perubahan status | P1 |
| TC-FR-43 | FR-36 | Customer menerima notifikasi pesanan | P2 |
| TC-FR-44 | FR-37 | Customer melihat riwayat pesanan | P2 |
| TC-FR-45 | FR-38 | Vendor memperbarui status pesanan | P1 |
| TC-FR-46 | FR-39 | Customer melihat perubahan status pesanan | P1 |

### TC-FR-40 — Customer Melihat Detail Pesanan

**Prasyarat:**
- Customer sudah login.
- Customer memiliki pesanan.

**Langkah Pengujian:**
1. Buka halaman pesanan.
2. Pilih salah satu pesanan.
3. Amati detail pesanan.

**Hasil yang Diharapkan:**
- Sistem menampilkan detail pesanan milik Customer.
- Informasi item, jumlah, subtotal, total, dan nomor antrean sesuai database.

### TC-FR-41 — Customer Melihat Status Terkini

**Prasyarat:**
- Pesanan telah dibuat.

**Langkah Pengujian:**
1. Buka halaman pelacakan pesanan.
2. Sistem mengambil status pesanan.
3. Amati informasi status.

**Hasil yang Diharapkan:**
- Status yang ditampilkan sesuai atribut `status_pesanan` pada PESANAN.

### TC-FR-42 — Mencatat Riwayat Perubahan Status

**Prasyarat:**
- Pesanan tersedia.
- Vendor memiliki kewenangan memperbarui status.

**Langkah Pengujian:**
1. Ubah status pesanan.
2. Periksa data PESANAN.
3. Periksa data RIWAYAT_STATUS.

**Hasil yang Diharapkan:**
- Status terkini pada PESANAN diperbarui.
- Perubahan tercatat pada RIWAYAT_STATUS.
- Waktu perubahan tercatat sesuai proses.

### TC-FR-43 — Customer Menerima Notifikasi

**Prasyarat:**
- Customer memiliki pesanan.
- Peristiwa yang memicu notifikasi telah terjadi.

**Langkah Pengujian:**
1. Jalankan peristiwa yang memerlukan notifikasi.
2. Periksa data NOTIFIKASI.
3. Buka halaman notifikasi Customer.

**Hasil yang Diharapkan:**
- Notifikasi terkait pesanan tersimpan.
- Notifikasi ditampilkan kepada Customer yang benar.
- Isi pesan sesuai peristiwa yang terjadi.

### TC-FR-44 — Customer Melihat Riwayat Pesanan

**Prasyarat:**
- Customer memiliki pesanan sebelumnya.

**Langkah Pengujian:**
1. Buka halaman riwayat pesanan.
2. Sistem mengambil daftar pesanan.
3. Amati data yang ditampilkan.

**Hasil yang Diharapkan:**
- Riwayat pesanan ditampilkan.
- Data hanya mencakup pesanan milik Customer yang sedang login.

### TC-FR-45 — Vendor Memperbarui Status Pesanan

**Prasyarat:**
- Vendor sudah login.
- Terdapat pesanan dari tenant yang dikelola.
- Perubahan status diperbolehkan berdasarkan alur status yang ditetapkan.

**Langkah Pengujian:**
1. Buka halaman pesanan masuk.
2. Pilih pesanan.
3. Lakukan perubahan status.
4. Simpan perubahan.

**Hasil yang Diharapkan:**
- Status pesanan berhasil diperbarui.
- Perubahan tercatat pada RIWAYAT_STATUS.
- Vendor tidak dapat mengubah pesanan tenant lain.

### TC-FR-46 — Customer Melihat Perubahan Status

**Prasyarat:**
- Customer memiliki pesanan.
- Vendor telah memperbarui status pesanan.

**Langkah Pengujian:**
1. Login sebagai Customer pemilik pesanan.
2. Buka halaman pelacakan.
3. Periksa status pesanan.

**Hasil yang Diharapkan:**
- Customer dapat melihat status terbaru.
- Informasi yang ditampilkan sesuai data PESANAN.

---

## 3.8 Notifikasi

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-47 | FR-35 | Menampilkan daftar notifikasi | P2 |
| TC-FR-48 | FR-36 | Memperbarui status baca notifikasi | P2 |
| TC-FR-49 | FR-36 | Pengguna mencoba mengubah notifikasi milik pengguna lain | P1 |

### TC-FR-47 — Menampilkan Daftar Notifikasi

**Prasyarat:**
- Pengguna sudah login.
- Data notifikasi tersedia.

**Langkah Pengujian:**
1. Buka halaman notifikasi.
2. Sistem mengambil data NOTIFIKASI.
3. Amati daftar notifikasi.

**Hasil yang Diharapkan:**
- Notifikasi milik pengguna yang sedang login ditampilkan.
- Isi pesan dan status baca sesuai database.

### TC-FR-48 — Memperbarui Status Baca Notifikasi

**Prasyarat:**
- Pengguna memiliki notifikasi yang belum dibaca.

**Langkah Pengujian:**
1. Buka halaman notifikasi.
2. Pilih notifikasi.
3. Tandai sebagai telah dibaca.
4. Periksa data NOTIFIKASI.

**Hasil yang Diharapkan:**
- Atribut `status_baca` berubah sesuai tindakan.
- Status terbaru ditampilkan pada antarmuka.

### TC-FR-49 — Mengubah Notifikasi Milik Pengguna Lain

**Prasyarat:**
- Pengguna A dan pengguna B memiliki notifikasi masing-masing.
- Pengguna A sudah login.

**Langkah Pengujian:**
1. Kirim permintaan perubahan status baca menggunakan ID notifikasi milik pengguna B.
2. Amati respons backend.

**Hasil yang Diharapkan:**
- Backend menolak permintaan.
- Data notifikasi pengguna B tidak berubah.

---

## 3.9 Administrator

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-50 | FR-40 | Administrator melihat daftar pengguna | P1 |
| TC-FR-51 | FR-41 | Administrator melihat detail pengguna | P2 |
| TC-FR-52 | FR-41 | Administrator memperbarui data pengguna | P2 |
| TC-FR-53 | FR-42 | Administrator melihat daftar tenant | P1 |
| TC-FR-54 | FR-42 | Administrator membuat data tenant | P2 |
| TC-FR-55 | FR-42 | Administrator memperbarui data tenant | P2 |
| TC-FR-56 | FR-42 | Administrator menghapus tenant sesuai integritas referensial | P2 |

### TC-FR-50 — Administrator Melihat Daftar Pengguna

**Prasyarat:**
- Administrator sudah login.
- Data pengguna tersedia.

**Langkah Pengujian:**
1. Buka halaman pengelolaan pengguna.
2. Sistem mengambil data USER.
3. Amati daftar pengguna.

**Hasil yang Diharapkan:**
- Daftar pengguna berhasil ditampilkan.
- Informasi username, nama, email, dan peran sesuai database.

### TC-FR-51 — Administrator Melihat Detail Pengguna

**Prasyarat:**
- Administrator sudah login.
- Data pengguna tersedia.

**Langkah Pengujian:**
1. Pilih salah satu pengguna.
2. Buka detail pengguna.
3. Amati informasi yang ditampilkan.

**Hasil yang Diharapkan:**
- Sistem menampilkan informasi pengguna sesuai data USER.
- Password tidak ditampilkan.

### TC-FR-52 — Administrator Memperbarui Data Pengguna

**Prasyarat:**
- Administrator sudah login.
- Pengguna yang akan diperbarui tersedia.

**Langkah Pengujian:**
1. Pilih pengguna.
2. Ubah atribut yang diizinkan.
3. Simpan perubahan.
4. Periksa data pengguna.

**Hasil yang Diharapkan:**
- Perubahan berhasil disimpan.
- Data USER diperbarui sesuai atribut yang tersedia.
- Password tidak ditampilkan kembali dalam response.

### TC-FR-53 — Administrator Melihat Daftar Tenant

**Prasyarat:**
- Administrator sudah login.
- Data tenant tersedia.

**Langkah Pengujian:**
1. Buka halaman pengelolaan tenant.
2. Sistem mengambil data tenant.
3. Amati daftar tenant.

**Hasil yang Diharapkan:**
- Daftar tenant berhasil ditampilkan.
- Informasi sesuai data TENANT.

### TC-FR-54 — Administrator Membuat Data Tenant

**Prasyarat:**
- Administrator sudah login.
- Data USER yang akan dikaitkan dengan tenant tersedia.

**Langkah Pengujian:**
1. Buka form tambah tenant.
2. Masukkan `id_user` yang valid.
3. Masukkan nama tenant.
4. Masukkan deskripsi dan logo.
5. Tentukan status buka.
6. Simpan data.

**Hasil yang Diharapkan:**
- Data tenant berhasil dibuat.
- Relasi dengan USER sesuai foreign key `id_user`.

### TC-FR-55 — Administrator Memperbarui Data Tenant

**Prasyarat:**
- Administrator sudah login.
- Tenant tersedia.

**Langkah Pengujian:**
1. Pilih tenant.
2. Ubah informasi yang diperbolehkan.
3. Simpan perubahan.
4. Periksa kembali data tenant.

**Hasil yang Diharapkan:**
- Informasi tenant berhasil diperbarui.
- Data sesuai atribut TENANT.

### TC-FR-56 — Administrator Menghapus Tenant

**Prasyarat:**
- Administrator sudah login.
- Tenant tersedia.

**Langkah Pengujian:**
1. Pilih tenant yang akan dihapus.
2. Jalankan tindakan penghapusan.
3. Periksa respons backend.

**Hasil yang Diharapkan:**
- Penghapusan hanya berhasil apabila tidak melanggar integritas referensial.
- Sistem menolak penghapusan apabila masih terdapat relasi yang tidak mengizinkan penghapusan.
- Data terkait tidak terhapus secara tidak sengaja.

---

## 3.10 Self-Pickup

| ID | Requirement | Test Case | Prioritas |
|---|---|---|---|
| TC-FR-57 | FR-33 | Customer melihat nomor antrean | P1 |
| TC-FR-58 | FR-33 | Vendor menggunakan nomor antrean untuk identifikasi pesanan | P1 |
| TC-FR-59 | FR-38 | Vendor memperbarui status pesanan menjadi siap diambil | P1 |
| TC-FR-60 | FR-39 | Customer melihat informasi pesanan siap diambil | P1 |

### TC-FR-57 — Customer Melihat Nomor Antrean

**Prasyarat:**
- Customer memiliki pesanan yang berhasil dibuat.

**Langkah Pengujian:**
1. Buka detail pesanan.
2. Periksa nomor antrean.
3. Bandingkan dengan data PESANAN.

**Hasil yang Diharapkan:**
- Nomor antrean ditampilkan dengan benar.
- Nomor antrean sesuai atribut `nomor_antrean`.

### TC-FR-58 — Vendor Mengidentifikasi Pesanan

**Prasyarat:**
- Vendor memiliki pesanan masuk.

**Langkah Pengujian:**
1. Buka daftar pesanan.
2. Periksa nomor antrean.
3. Cocokkan dengan detail pesanan.

**Hasil yang Diharapkan:**
- Vendor dapat mengidentifikasi pesanan berdasarkan nomor antrean.
- Informasi pesanan sesuai dengan data yang tersimpan.

### TC-FR-59 — Vendor Memperbarui Status Menjadi Siap Diambil

**Prasyarat:**
- Pesanan berada pada tahap yang memungkinkan perubahan status.
- Vendor memiliki kewenangan terhadap pesanan.

**Langkah Pengujian:**
1. Buka detail pesanan.
2. Lakukan perubahan status sesuai alur yang disepakati.
3. Simpan perubahan.
4. Periksa PESANAN dan RIWAYAT_STATUS.

**Hasil yang Diharapkan:**
- Status berubah sesuai tindakan yang sah.
- Perubahan tercatat pada riwayat status.

### TC-FR-60 — Customer Melihat Informasi Siap Diambil

**Prasyarat:**
- Status pesanan telah diperbarui menjadi status siap diambil sesuai daftar status resmi.

**Langkah Pengujian:**
1. Login sebagai Customer.
2. Buka halaman pelacakan pesanan.
3. Periksa status dan nomor antrean.

**Hasil yang Diharapkan:**
- Customer melihat status terbaru.
- Nomor antrean ditampilkan untuk membantu proses pengambilan di tenant.

---

# 4. Non-Functional Test Cases

Pengujian non-fungsional dilakukan berdasarkan NFR-01 sampai NFR-27.

## 4.1 Performance Efficiency

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-01 | NFR-01 | Mengukur waktu pemuatan halaman | Halaman memenuhi target waktu pemuatan kurang dari 2 detik pada kondisi pengujian yang ditetapkan. |
| TC-NFR-02 | NFR-02 | Mengukur waktu respons API | Respons API memenuhi batas waktu yang ditetapkan pada NFR terkait. |
| TC-NFR-03 | NFR-03 | Menguji sistem dengan beberapa permintaan bersamaan | Sistem tetap memberikan respons sesuai batas pengujian. |
| TC-NFR-04 | NFR-04 | Mengamati penggunaan sumber daya sistem | Penggunaan sumber daya tidak melampaui batas yang ditetapkan. |

**Langkah umum pengujian performa:**
1. Siapkan lingkungan pengujian.
2. Tentukan kondisi jaringan dan perangkat.
3. Jalankan halaman atau endpoint yang diuji.
4. Catat waktu pemuatan atau respons.
5. Ulangi pengujian untuk memperoleh hasil yang dapat dibandingkan.
6. Dokumentasikan hasil pengukuran.

## 4.2 Security

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-05 | NFR-05 | Memeriksa autentikasi endpoint privat | Endpoint menolak permintaan tanpa autentikasi valid. |
| TC-NFR-06 | NFR-06 | Memeriksa pembatasan hak akses | Pengguna tidak dapat mengakses fungsi di luar perannya. |
| TC-NFR-07 | NFR-07 | Memeriksa validasi input | Input tidak valid ditolak backend. |
| TC-NFR-08 | NFR-08 | Memeriksa perlindungan password | Password disimpan menggunakan hashing dan tidak ditampilkan dalam response. |
| TC-NFR-09 | NFR-09 | Memeriksa perlindungan informasi sensitif | Informasi sensitif tidak terekspos melalui response atau pesan kesalahan. |

Pengujian keamanan harus dilakukan pada lingkungan yang diizinkan dan menggunakan data pengujian.

## 4.3 Usability

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-10 | NFR-10 | Mengevaluasi kemudahan navigasi | Pengguna dapat menemukan fungsi utama dengan jelas. |
| TC-NFR-11 | NFR-11 | Mengevaluasi kejelasan pesan sistem | Pesan berhasil dan gagal mudah dipahami. |
| TC-NFR-12 | NFR-12 | Mengevaluasi konsistensi antarmuka | Tampilan mengikuti UI/UX Guidelines. |
| TC-NFR-13 | NFR-13 | Mengevaluasi kemudahan pengisian form | Input dapat diisi dan kesalahan dapat dikenali pengguna. |

Pengujian usability dapat melibatkan perwakilan Customer dan Vendor menggunakan skenario tugas yang telah ditentukan.

## 4.4 Reliability

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-14 | NFR-14 | Menguji konsistensi data pesanan | Data pesanan dan detailnya tetap konsisten. |
| TC-NFR-15 | NFR-15 | Menguji penanganan kegagalan request | Sistem memberikan respons kesalahan tanpa merusak data. |
| TC-NFR-16 | NFR-16 | Menguji konsistensi perubahan status | Status terkini dan riwayat status sesuai. |
| TC-NFR-17 | NFR-17 | Menguji kestabilan fungsi utama | Fungsi utama tetap berjalan pada kondisi pengujian yang ditentukan. |

## 4.5 Compatibility

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-18 | NFR-18 | Menguji tampilan pada browser pertama | Tampilan dan fungsi berjalan sesuai kebutuhan. |
| TC-NFR-19 | NFR-19 | Menguji tampilan pada browser lainnya | Tidak terdapat masalah kompatibilitas yang menghambat fungsi utama. |
| TC-NFR-20 | NFR-20 | Menguji tampilan pada perangkat berbeda | Antarmuka menyesuaikan ukuran layar. |
| TC-NFR-21 | NFR-21 | Menguji fungsi navigasi pada layar kecil | Navigasi tetap dapat digunakan. |

Browser dan perangkat yang digunakan harus dicatat pada hasil pengujian.

## 4.6 Maintainability

| ID | Requirement | Test Case | Hasil yang Diharapkan |
|---|---|---|---|
| TC-NFR-22 | NFR-22 | Memeriksa keteraturan struktur kode frontend | Struktur kode mengikuti pembagian direktori yang ditetapkan. |
| TC-NFR-23 | NFR-23 | Memeriksa keteraturan struktur backend | Struktur Laravel mengikuti pembagian modul yang ditetapkan. |
| TC-NFR-24 | NFR-24 | Memeriksa konsistensi penamaan | Penamaan file, fungsi, dan komponen konsisten. |
| TC-NFR-25 | NFR-25 | Memeriksa dokumentasi kode | Bagian penting memiliki dokumentasi yang memadai. |
| TC-NFR-26 | NFR-26 | Memeriksa kemudahan perubahan komponen | Perubahan pada satu komponen tidak menyebabkan gangguan yang tidak diharapkan pada bagian lain. |
| TC-NFR-27 | NFR-27 | Memeriksa keterpeliharaan konfigurasi | Konfigurasi dan dependensi terdokumentasi serta dapat dikelola. |

Catatan: metode pengukuran dan batas kelulusan setiap NFR harus mengikuti definisi rinci pada `non-functional-requirements.md`. Tabel ini tidak menggantikan kriteria kuantitatif yang ditetapkan dalam dokumen tersebut.

---

# 5. Test Data

## 5.1 Data Akun Pengujian

| Peran | Username | Email | Keterangan |
|---|---|---|---|
| Customer | customer_test | customer@test.local | Akun pengujian Customer. |
| Vendor | vendor_test | vendor@test.local | Akun pengujian Vendor. |
| Administrator | admin_test | admin@test.local | Akun pengujian Administrator. |

Password setiap akun ditetapkan pada lingkungan pengujian dan tidak dituliskan dalam dokumentasi publik.

## 5.2 Data Tenant

| Atribut | Contoh Data |
|---|---|
| id_tenant | 1 |
| nama_tenant | Kantin Sejahtera |
| deskripsi | Menyediakan makanan dan minuman |
| logo | tenant/logo1.png |
| status_buka | true |

## 5.3 Data Kategori

| id_kategori | nama_kategori | icon |
|---|---|---|
| 1 | Makanan | food-icon.png |
| 2 | Minuman | drink-icon.png |

## 5.4 Data Menu

| Atribut | Contoh Data |
|---|---|
| id_menu | 1 |
| id_tenant | 1 |
| id_kategori | 2 |
| nama_menu | Es Teh |
| deskripsi | Minuman teh dingin |
| gambar | menu/es-teh.png |
| harga | 5000 |
| estimasi_menit | 3 |
| status_tersedia | true |

## 5.5 Data Pesanan

| Atribut | Contoh Data |
|---|---|
| id_pesanan | 101 |
| id_user | 1 |
| id_tenant | 1 |
| nomor_antrean | A001 |
| status_pesanan | Mengikuti status yang ditetapkan |
| total_harga | 10000 |
| catatan | Contoh catatan pesanan |
| waktu_pesan | Waktu pengujian |

Seluruh data pada bagian ini hanya merupakan contoh data pengujian, bukan data transaksi sebenarnya.

---

# 6. Pencatatan Hasil Pengujian

## 6.1 Format Hasil Aktual

Hasil aktual harus diisi setelah test case dilaksanakan.

| Test Case ID | Hasil Aktual | Status | Catatan |
|---|---|---|---|
| TC-FR-01 | Belum diuji | Not Tested | - |
| TC-FR-03 | Belum diuji | Not Tested | - |
| TC-FR-14 | Belum diuji | Not Tested | - |
| TC-FR-27 | Belum diuji | Not Tested | - |
| TC-FR-34 | Belum diuji | Not Tested | - |
| TC-FR-45 | Belum diuji | Not Tested | - |
| TC-FR-54 | Belum diuji | Not Tested | - |
| TC-NFR-01 | Belum diuji | Not Tested | - |

Tabel tersebut merupakan contoh format pencatatan, bukan rekap seluruh test case.

## 6.2 Format Pelaporan Defect

Apabila ditemukan kesalahan, penguji harus mencatat:

| Atribut | Keterangan |
|---|---|
| Defect ID | Identitas unik kesalahan. |
| Test Case ID | Kasus pengujian yang menemukan kesalahan. |
| Judul Defect | Ringkasan masalah. |
| Deskripsi | Penjelasan masalah yang ditemukan. |
| Langkah Reproduksi | Langkah untuk memunculkan kembali kesalahan. |
| Expected Result | Hasil yang seharusnya terjadi. |
| Actual Result | Hasil yang benar-benar terjadi. |
| Severity | Tingkat keparahan. |
| Status Perbaikan | Status penanganan kesalahan. |

---

# 7. Kriteria Kelulusan

Sebuah test case dinyatakan lulus apabila:

1. Seluruh langkah pengujian dapat dilaksanakan.
2. Sistem menghasilkan respons sesuai hasil yang diharapkan.
3. Data yang tersimpan sesuai struktur dan relasi database.
4. Tidak ditemukan pelanggaran hak akses pada fungsi yang diuji.
5. Tidak terdapat kesalahan yang mengganggu fungsi utama.

Test case dinyatakan gagal apabila hasil aktual tidak sesuai dengan hasil yang diharapkan.

Test case yang belum dapat dijalankan karena fitur belum tersedia atau terdapat kendala lingkungan harus dicatat sebagai Not Tested atau Blocked, bukan dianggap lulus.

---

# 8. Penutup

Test Cases ini menjadi acuan pelaksanaan pengujian sistem LetsOrder.com secara terperinci. Setiap kasus pengujian dirancang untuk memastikan fungsi Customer, Vendor, dan Administrator berjalan sesuai kebutuhan sistem.

Pengujian dilakukan dengan memperhatikan kesesuaian hasil, validasi data, pembatasan hak akses, integrasi antarkomponen, serta kualitas perangkat lunak.

Hasil pelaksanaan seluruh test case akan menjadi dasar evaluasi, identifikasi defect, perbaikan sistem, dan penyusunan Test Report.