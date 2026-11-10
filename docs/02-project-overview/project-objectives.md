# Project Objectives — LetsOrder.com

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Project Objectives menjelaskan sasaran yang ingin dicapai melalui pengembangan LetsOrder.com. Tujuan proyek dirumuskan berdasarkan permasalahan proses pemesanan makanan di Kantin UPNVJ, khususnya penumpukan antrean fisik, keterbatasan waktu mahasiswa, serta kebutuhan pengelolaan pesanan secara lebih terstruktur.

Dokumen ini digunakan sebagai acuan untuk menentukan arah pengembangan, mengukur pencapaian proyek, dan memastikan fitur yang dibangun memiliki hubungan dengan tujuan utama sistem.

### 1.2 Tujuan Umum

Mengembangkan sistem pemesanan dan self-pickup digital berbasis web untuk Kantin UPNVJ yang membantu mengurangi antrean fisik, mempermudah proses pemesanan makanan, menyediakan informasi perkembangan pesanan, serta mendukung pengelolaan menu dan pesanan oleh vendor.

## 2. Tujuan Khusus

### PO-01 — Mengurangi Antrean Fisik

Mengembangkan mekanisme pemesanan makanan secara digital agar customer dapat melakukan pemesanan sebelum datang ke tenant. Tujuannya adalah mengurangi ketergantungan pada pemesanan langsung yang berpotensi menyebabkan penumpukan antrean, terutama pada jam sibuk.

**Indikator keberhasilan:**
- Customer dapat membuat pesanan melalui sistem.
- Customer memperoleh nomor antrean setelah pesanan berhasil dibuat.
- Proses pemesanan dapat dilakukan tanpa harus memulai dari antrean fisik.

### PO-02 — Mempermudah Akses Informasi Menu

Menyediakan katalog digital yang menampilkan informasi tenant dan menu agar customer dapat mengetahui pilihan makanan sebelum melakukan pemesanan.

**Indikator keberhasilan:**
- Customer dapat melihat daftar tenant dan kategori menu.
- Sistem menampilkan nama, deskripsi, gambar, dan harga menu.
- Sistem menampilkan estimasi waktu penyajian dan status ketersediaan menu.

### PO-03 — Mempermudah Proses Pemesanan

Menyediakan fasilitas keranjang belanja dan pemesanan digital agar customer dapat memilih menu serta membuat pesanan melalui satu sistem.

**Indikator keberhasilan:**
- Customer dapat menambahkan menu ke keranjang.
- Customer dapat mengubah jumlah dan menambahkan catatan item.
- Customer dapat melihat ringkasan pesanan.
- Sistem dapat menyimpan pesanan dan detail pesanan.

### PO-04 — Menyediakan Simulasi Pembayaran Digital

Mengembangkan alur simulasi pembayaran digital menggunakan QRIS agar proses pembayaran dapat direpresentasikan dalam sistem tanpa melakukan transaksi keuangan sungguhan.

**Indikator keberhasilan:**
- Sistem menampilkan informasi pembayaran berdasarkan pesanan.
- Sistem menyediakan kode QRIS untuk simulasi.
- Sistem menampilkan jumlah pembayaran dan batas waktu pembayaran.
- Sistem dapat mencatat status verifikasi dan waktu pembayaran sesuai alur simulasi.

### PO-05 — Mendukung Pemantauan Status Pesanan

Menyediakan fasilitas pelacakan status pesanan agar customer dapat mengetahui perkembangan pesanan setelah melakukan pemesanan.

**Indikator keberhasilan:**
- Customer dapat melihat status pesanan terkini.
- Vendor dapat memperbarui status pesanan sesuai kewenangannya.
- Sistem menyimpan perubahan status pada riwayat status.
- Informasi status dapat ditampilkan kepada customer.

### PO-06 — Mendukung Pengelolaan Tenant dan Menu

Menyediakan fasilitas pengelolaan informasi tenant dan menu agar vendor dapat memperbarui informasi yang ditampilkan kepada customer.

**Indikator keberhasilan:**
- Vendor dapat mengelola informasi tenant.
- Vendor dapat mengelola informasi kategori dan menu sesuai kewenangannya.
- Vendor dapat mengatur status buka atau tutup tenant.
- Vendor dapat mengatur status ketersediaan menu.

### PO-07 — Mendukung Proses Self-Pickup

Menyediakan mekanisme pengambilan makanan secara mandiri berdasarkan nomor antrean agar customer dapat mengambil pesanan secara langsung di tenant.

**Indikator keberhasilan:**
- Sistem menampilkan nomor antrean pada informasi pesanan.
- Customer dapat menggunakan nomor antrean untuk mengidentifikasi pesanannya.
- Proses pengambilan dilakukan secara langsung di tenant.
- Sistem mendukung informasi status pesanan hingga tahap pengambilan.

### PO-08 — Menyediakan Informasi Riwayat dan Notifikasi

Menyediakan fasilitas untuk melihat riwayat pesanan dan informasi notifikasi agar pengguna dapat memperoleh informasi terkait aktivitas pemesanan.

**Indikator keberhasilan:**
- Customer dapat melihat daftar dan detail riwayat pesanan.
- Sistem dapat menyimpan notifikasi yang berkaitan dengan pesanan.
- Customer dapat melihat pesan dan status baca notifikasi.

### PO-09 — Mendukung Pengelolaan Sistem oleh Administrator

Menyediakan fasilitas bagi administrator untuk melihat dan mengelola informasi pengguna serta tenant sesuai kewenangan yang ditetapkan.

**Indikator keberhasilan:**
- Administrator dapat melihat data pengguna.
- Administrator dapat melihat data tenant.
- Administrator dapat melakukan pengelolaan data sesuai kewenangannya.
- Pengelolaan menggunakan atribut dan relasi yang tersedia pada ERD final.

### PO-10 — Memenuhi Target Kinerja Aplikasi

Mengembangkan aplikasi dengan memperhatikan kinerja dan kenyamanan penggunaan agar sistem dapat diakses secara responsif.

**Indikator keberhasilan:**
- Waktu pemuatan halaman ditargetkan kurang dari 2 detik dalam kondisi pengujian yang ditetapkan.
- Fungsi utama dapat dijalankan tanpa kesalahan kritis.
- Sistem dapat menampilkan informasi sesuai hasil pemrosesan backend dan database.

## 3. Keterkaitan Tujuan dengan Permasalahan

| Permasalahan | Tujuan Proyek | Solusi yang Dikembangkan |
|---|---|---|
| Penumpukan antrean fisik | PO-01 | Pemesanan digital dan nomor antrean. |
| Customer kesulitan memperoleh informasi menu sebelum datang | PO-02 | Katalog tenant dan menu digital. |
| Proses pemesanan membutuhkan waktu | PO-03 | Keranjang belanja dan pemesanan digital. |
| Belum tersedia alur pembayaran digital dalam sistem | PO-04 | Simulasi pembayaran QRIS. |
| Customer membutuhkan informasi perkembangan pesanan | PO-05 | Pelacakan dan riwayat status pesanan. |
| Vendor membutuhkan pengelolaan menu dan tenant | PO-06 | Pengelolaan tenant, kategori, dan menu. |
| Pengambilan pesanan perlu diidentifikasi | PO-07 | Self-pickup menggunakan nomor antrean. |
| Pengguna membutuhkan informasi aktivitas pesanan | PO-08 | Riwayat pesanan dan notifikasi. |
| Dibutuhkan pengelolaan data dari sisi administrator | PO-09 | Pengelolaan pengguna dan tenant. |
| Sistem perlu memiliki kinerja yang memadai | PO-10 | Pengujian kinerja dan fungsi aplikasi. |

## 4. Prioritas Pencapaian Tujuan

Pencapaian tujuan dilakukan secara bertahap berdasarkan kebutuhan inti produk.

| Prioritas | Tujuan | Keterangan |
|---|---|---|
| Utama | PO-01, PO-02, PO-03 | Mendukung proses utama customer dalam mencari menu dan melakukan pemesanan. |
| Utama | PO-04, PO-05, PO-07 | Mendukung pembayaran simulasi, pemantauan, dan pengambilan pesanan. |
| Pendukung | PO-06 | Mendukung pengelolaan tenant dan menu oleh vendor. |
| Pendukung | PO-08, PO-09 | Menyediakan fungsi tambahan untuk informasi dan administrasi sistem. |
| Kualitas | PO-10 | Memastikan aplikasi memenuhi target kinerja dan dapat digunakan dengan baik. |

## 5. Batasan Pencapaian Tujuan

Pencapaian tujuan proyek dibatasi oleh ruang lingkup LetsOrder.com yang telah disepakati. Oleh karena itu, tujuan proyek tidak mencakup:
- Pengembangan aplikasi native Android atau iOS.
- Penyediaan layanan pengantaran makanan.
- Integrasi payment gateway untuk transaksi sungguhan.
- Pengelolaan stok bahan baku.
- Laporan keuangan vendor tingkat lanjut.
- Pengelolaan beberapa staf dalam satu tenant.
- Dukungan operasional untuk banyak kampus.

Seluruh tujuan juga harus diwujudkan dengan tetap menggunakan sebelas entitas pada ERD final. Pengembangan tidak boleh menambahkan fitur yang membutuhkan entitas, atribut, atau relasi baru di luar rancangan tersebut.

## 6. Penutup

Tujuan pengembangan LetsOrder.com berfokus pada penyediaan sistem pemesanan makanan berbasis web yang dapat membantu mengurangi antrean fisik dan mempermudah proses pemesanan di Kantin UPNVJ. Tujuan tersebut mencakup kebutuhan customer, vendor, dan administrator, mulai dari akses informasi menu hingga pengelolaan dan pengambilan pesanan.

Setiap tujuan menjadi dasar dalam menentukan kebutuhan sistem, menyusun prioritas pengembangan, serta mengevaluasi hasil implementasi. Dengan demikian, pengembangan LetsOrder.com diharapkan tetap terarah pada permasalahan utama yang ingin diselesaikan.