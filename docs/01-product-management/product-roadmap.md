# Product Roadmap — LetsOrder.com

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Product Roadmap ini menjelaskan tahapan pengembangan LetsOrder.com berdasarkan tujuan produk, ruang lingkup, dan prioritas fitur yang telah ditetapkan dalam Product Requirements Document (PRD) serta Feature Prioritization.

Roadmap digunakan sebagai panduan untuk menentukan urutan implementasi fitur, hasil yang diharapkan pada setiap tahap, serta ketergantungan antara satu fitur dengan fitur lainnya. Dengan adanya roadmap, proses pengembangan diharapkan berjalan secara terarah dan tetap sesuai dengan kebutuhan pengguna serta batasan proyek.

### 1.2 Pendekatan Pengembangan

Pengembangan LetsOrder.com dilakukan secara bertahap dengan pendekatan incremental. Setiap tahap berfokus pada penyelesaian kelompok fitur yang saling berkaitan sehingga hasil pengembangan dapat diperiksa sebelum dilanjutkan ke tahap berikutnya.

Urutan implementasi mempertimbangkan:
- Prioritas fitur berdasarkan metode MoSCoW.
- Ketergantungan antarf fitur.
- Kesiapan kebutuhan sistem dan database.
- Kesesuaian implementasi dengan ERD final.
- Kebutuhan pengujian sebelum fitur dinyatakan selesai.

## 2. Roadmap Pengembangan Produk

### 2.1 Tahapan Pengembangan

| Tahap | Fokus Pengembangan | Fitur yang Dikembangkan | Hasil yang Diharapkan |
|---|---|---|---|
| 1 | Persiapan dan autentikasi | FP-01 Authentication and User Access | Pengguna dapat melakukan registrasi, login, dan mengakses sistem sesuai perannya. |
| 2 | Pengelolaan tenant dan menu | FP-10 Tenant Management, FP-03 Menu Management | Vendor dapat mengelola informasi tenant dan menu yang tersedia. |
| 3 | Katalog menu | FP-02 Menu Catalog | Customer dapat melihat daftar tenant, kategori, dan menu yang tersedia. |
| 4 | Keranjang belanja | FP-04 Shopping Cart | Customer dapat menambahkan menu ke keranjang dan mengatur jumlah serta catatan pesanan. |
| 5 | Pemesanan dan pembayaran | FP-05 Order Management, FP-06 Digital Payment Simulation | Customer dapat membuat pesanan dan melakukan simulasi pembayaran digital. |
| 6 | Pelacakan dan pengambilan pesanan | FP-07 Order Tracking, FP-12 Self-Pickup | Customer dapat memantau status pesanan dan mengambil pesanan menggunakan nomor antrean. |
| 7 | Riwayat dan notifikasi | FP-08 Order History, FP-09 Notification | Pengguna dapat melihat riwayat pesanan dan menerima informasi terkait pesanan. |
| 8 | Pengelolaan administrator | FP-11 Administrator Management | Administrator dapat menjalankan pengelolaan pengguna dan tenant sesuai kewenangannya. |

### 2.2 Detail Setiap Tahap

#### Tahap 1 — Persiapan dan Autentikasi

**Tujuan:** Membangun fondasi sistem dan mekanisme akses pengguna.

Aktivitas utama:
- Menyiapkan struktur awal frontend dan backend.
- Menyiapkan koneksi database MySQL.
- Mengimplementasikan registrasi dan login.
- Mengelola informasi akun berdasarkan entitas USER.
- Menerapkan pembatasan akses berdasarkan peran pengguna.

**Output:** Mekanisme autentikasi dan akses pengguna dapat digunakan sebagai dasar fitur berikutnya.

#### Tahap 2 — Pengelolaan Tenant dan Menu

**Tujuan:** Menyediakan fasilitas bagi vendor untuk mengelola tenant dan menu yang dijual.

Aktivitas utama:
- Mengelola informasi tenant.
- Mengatur status buka atau tutup tenant.
- Mengelola kategori menu.
- Menambahkan, mengubah, dan menghapus informasi menu.
- Mengatur harga, estimasi waktu, gambar, dan ketersediaan menu.

**Output:** Vendor dapat mengelola informasi tenant dan menu berdasarkan data pada entitas TENANT, KATEGORI, dan MENU.

#### Tahap 3 — Katalog Menu

**Tujuan:** Memungkinkan customer menemukan tenant dan menu yang tersedia.

Aktivitas utama:
- Menampilkan daftar tenant.
- Menampilkan kategori menu.
- Menampilkan informasi menu.
- Menampilkan harga dan estimasi waktu penyajian.
- Menampilkan status ketersediaan menu.

**Output:** Customer dapat melihat katalog menu sebelum melakukan pemesanan.

#### Tahap 4 — Keranjang Belanja

**Tujuan:** Menyediakan fasilitas untuk menampung pilihan menu customer sebelum pesanan dibuat.

Aktivitas utama:
- Menambahkan menu ke keranjang.
- Mengubah jumlah menu.
- Menambahkan catatan pada item keranjang.
- Menghapus item dari keranjang.
- Menampilkan ringkasan harga berdasarkan item yang dipilih.

**Output:** Customer dapat mengelola pilihan menu melalui entitas KERANJANG dan ITEM_KERANJANG.

#### Tahap 5 — Pemesanan dan Pembayaran

**Tujuan:** Mengimplementasikan proses pembuatan pesanan dan simulasi pembayaran digital.

Aktivitas utama:
- Membuat pesanan berdasarkan isi keranjang.
- Menyimpan informasi pesanan dan detail pesanan.
- Menghasilkan nomor antrean.
- Menghitung total harga pesanan.
- Menyediakan simulasi pembayaran menggunakan QRIS.
- Mengelola status verifikasi dan batas waktu pembayaran.

**Output:** Proses pemesanan dan simulasi pembayaran dapat dilakukan melalui entitas PESANAN, DETAIL_PESANAN, dan PEMBAYARAN.

#### Tahap 6 — Pelacakan dan Pengambilan Pesanan

**Tujuan:** Memberikan informasi perkembangan pesanan hingga siap diambil oleh customer.

Aktivitas utama:
- Menampilkan status pesanan.
- Memperbarui status pesanan oleh vendor sesuai alur yang ditetapkan.
- Menyimpan perubahan status pada riwayat pesanan.
- Menampilkan nomor antrean sebagai identifikasi pengambilan.
- Menyediakan informasi bahwa pesanan telah siap diambil.

**Output:** Customer dapat memantau perkembangan pesanan dan melakukan self-pickup berdasarkan nomor antrean.

#### Tahap 7 — Riwayat dan Notifikasi

**Tujuan:** Menyediakan informasi tambahan terkait aktivitas pemesanan pengguna.

Aktivitas utama:
- Menampilkan riwayat pesanan.
- Menampilkan detail pesanan yang tercatat.
- Menyampaikan informasi terkait perubahan atau perkembangan pesanan.
- Menyediakan status baca notifikasi.

**Output:** Pengguna dapat melihat riwayat pesanan dan informasi notifikasi berdasarkan data yang tersedia pada entitas PESANAN, DETAIL_PESANAN, RIWAYAT_STATUS, dan NOTIFIKASI.

#### Tahap 8 — Pengelolaan Administrator

**Tujuan:** Melengkapi fungsi pengelolaan sistem dari sisi administrator.

Aktivitas utama:
- Menampilkan data pengguna.
- Menampilkan data tenant.
- Menyediakan pengelolaan data sesuai kewenangan administrator.
- Memastikan pengelolaan tetap mengikuti atribut dan relasi yang tersedia pada ERD.

**Output:** Administrator dapat menjalankan fungsi pengelolaan pengguna dan tenant tanpa menambahkan atribut atau entitas baru di luar ERD final.

## 3. Ketergantungan Antartahap

Setiap tahap memiliki hubungan ketergantungan yang perlu diperhatikan agar implementasi tidak dilakukan secara terbalik.

| Tahap | Bergantung pada | Alasan |
|---|---|---|
| 1 | Persiapan sistem dan database | Autentikasi membutuhkan struktur aplikasi dan koneksi database. |
| 2 | Tahap 1 | Pengelolaan tenant dan menu membutuhkan akses pengguna serta peran vendor. |
| 3 | Tahap 2 | Katalog membutuhkan data tenant, kategori, dan menu. |
| 4 | Tahap 1 dan 3 | Keranjang membutuhkan identitas customer dan data menu. |
| 5 | Tahap 4 | Pesanan dibuat berdasarkan item yang dipilih customer. |
| 6 | Tahap 5 | Pelacakan dan self-pickup membutuhkan data pesanan serta nomor antrean. |
| 7 | Tahap 5 dan 6 | Riwayat dan notifikasi membutuhkan data pesanan serta perkembangan statusnya. |
| 8 | Tahap 1 dan 2 | Pengelolaan administrator membutuhkan autentikasi dan data pengguna serta tenant. |

## 4. Prioritas dan Kriteria Penyelesaian

Pengembangan mengikuti prioritas yang telah ditetapkan pada dokumen Feature Prioritization.

| Prioritas | Fitur | Target Penyelesaian |
|---|---|---|
| Must Have | Authentication and User Access | Autentikasi dan akses berdasarkan peran berjalan. |
| Must Have | Tenant Management | Informasi tenant dapat dikelola. |
| Must Have | Menu Management | Data menu dapat dikelola vendor. |
| Must Have | Menu Catalog | Customer dapat melihat katalog menu. |
| Must Have | Shopping Cart | Customer dapat mengelola item keranjang. |
| Must Have | Order Management | Pesanan dapat dibuat dan dikelola. |
| Must Have | Digital Payment Simulation | Simulasi pembayaran dapat dijalankan. |
| Must Have | Order Tracking | Status pesanan dapat dipantau. |
| Must Have | Self-Pickup | Pengambilan pesanan menggunakan nomor antrean dapat dilakukan. |
| Should Have | Order History | Riwayat pesanan dapat ditampilkan. |
| Should Have | Notification | Informasi pesanan dapat disampaikan melalui notifikasi. |
| Should Have | Administrator Management | Administrator dapat mengelola pengguna dan tenant sesuai kewenangannya. |

Sebuah fitur dapat dinyatakan selesai apabila:
1. Implementasinya sesuai dengan kebutuhan yang telah ditentukan.
2. Data yang digunakan sesuai dengan struktur ERD final.
3. Fungsi utama dan kondisi kesalahan telah diuji.
4. Tidak ditemukan masalah kritis yang menghambat penggunaan fitur.
5. Dokumentasi terkait telah diperbarui apabila diperlukan.

## 5. Batasan Roadmap

Roadmap ini hanya mencakup fitur yang telah disepakati dalam PRD dan Feature Prioritization. Oleh karena itu, pengembangan tidak mencakup:
- Aplikasi native Android dan iOS.
- Layanan pengantaran makanan.
- Integrasi payment gateway untuk transaksi sungguhan.
- Laporan keuangan vendor tingkat lanjut.
- Pengelolaan stok bahan baku.
- Pengelolaan beberapa staf dalam satu tenant.
- Dukungan untuk banyak kampus.
- Fitur promo, rating, ulasan, favorit, dan rekomendasi menu.

Seluruh implementasi harus tetap menggunakan 11 entitas yang telah ditetapkan pada ERD final. Penambahan fitur yang membutuhkan entitas, atribut, atau relasi baru tidak termasuk dalam roadmap ini.

## 6. Evaluasi dan Perubahan Roadmap

Roadmap dapat dievaluasi apabila terdapat perubahan prioritas, kendala teknis, atau hasil pengujian yang memengaruhi proses pengembangan. Setiap perubahan harus diperiksa terlebih dahulu terhadap PRD, Feature Prioritization, SRS, dan ERD final.

Perubahan roadmap tidak boleh secara otomatis dianggap sebagai persetujuan untuk menambahkan fitur atau mengubah struktur database. Apabila suatu usulan membutuhkan perubahan ERD, usulan tersebut harus ditinjau sebagai perubahan ruang lingkup proyek.

## 7. Penutup

Product Roadmap LetsOrder.com menjadi panduan bertahap dalam membangun sistem pemesanan dan self-pickup digital untuk Kantin UPNVJ. Tahapan pengembangan dimulai dari fondasi autentikasi, pengelolaan tenant dan menu, proses pemesanan, pembayaran simulasi, pelacakan, hingga fungsi pendukung lainnya.

Dengan urutan tersebut, pengembangan diharapkan dapat berfokus terlebih dahulu pada fungsi inti yang mendukung proses pemesanan dan pengambilan makanan. Seluruh tahapan tetap mengacu pada prioritas produk dan struktur database yang telah disepakati.