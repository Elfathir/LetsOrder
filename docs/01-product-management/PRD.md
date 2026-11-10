# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# LetsOrder.com

**Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ**

| Informasi | Detail |
|---|---|
| Nama Produk | LetsOrder.com |
| Jenis Produk | Web-Based Food Ordering System |
| Versi Dokumen | 1.0 |
| Status Dokumen | Draft |
| Platform | Website |
| Target Pengguna | Customer, Vendor, Administrator |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Metode Pengambilan | Self-Pickup |
| Pembayaran | Simulasi QRIS dan dompet digital |

---

# 1. PRODUCT OVERVIEW

## 1.1 Product Background

Kantin merupakan salah satu fasilitas yang digunakan mahasiswa untuk memenuhi kebutuhan makanan dan minuman selama berada di lingkungan kampus. Namun, tingginya aktivitas mahasiswa, khususnya pada jam istirahat dan waktu makan siang, dapat menyebabkan penumpukan antrean di area kantin. Kondisi tersebut membuat mahasiswa harus menghabiskan waktu untuk memilih menu, melakukan pemesanan, dan menunggu pesanan disiapkan.

Permasalahan antrean tidak hanya berdampak pada kenyamanan pelanggan, tetapi juga dapat memengaruhi efisiensi pelayanan vendor kantin. Proses pemesanan yang masih dilakukan secara langsung menyebabkan pelanggan harus berada di lokasi untuk mengetahui ketersediaan menu dan melakukan transaksi pemesanan.

Berdasarkan permasalahan tersebut, dikembangkan **LetsOrder.com**, yaitu sistem pemesanan makanan berbasis web yang menyediakan mekanisme pemesanan digital dan pengambilan pesanan secara mandiri (*self-pickup*). Melalui sistem ini, pelanggan dapat melihat menu, memasukkan pilihan makanan ke keranjang, melakukan pemesanan, serta memantau status pesanan sebelum mengambilnya di kantin.

LetsOrder.com diharapkan dapat membantu mengurangi antrean fisik, mempermudah proses pemesanan, dan mendukung efisiensi pelayanan kantin UPNVJ.

## 1.2 Product Vision

Menjadi sistem pemesanan makanan berbasis web yang mempermudah proses pemesanan dan pengambilan makanan secara mandiri di lingkungan Kantin UPNVJ melalui layanan digital yang praktis, terorganisasi, dan mudah digunakan.

## 1.3 Product Mission

Untuk mewujudkan visi tersebut, LetsOrder.com memiliki misi sebagai berikut:

1. Menyediakan akses informasi menu kantin secara digital.
2. Mempermudah pelanggan dalam melakukan pemesanan makanan tanpa harus mengantre untuk memesan secara langsung.
3. Menyediakan informasi status pesanan agar pelanggan dapat mengetahui perkembangan pesanannya.
4. Membantu vendor mengelola informasi menu dan pesanan pelanggan.
5. Mendukung proses administrasi sistem melalui pengelolaan pengguna dan tenant.

---

# 2. PRODUCT OBJECTIVES

Pengembangan LetsOrder.com memiliki beberapa tujuan utama:

| ID | Tujuan | Indikator Keberhasilan |
|---|---|---|
| PO-01 | Mengurangi antrean fisik saat proses pemesanan makanan. | Pelanggan dapat melakukan pemesanan melalui website sebelum datang ke kantin. |
| PO-02 | Mempermudah pelanggan memperoleh informasi menu. | Pelanggan dapat melihat informasi nama, deskripsi, harga, dan ketersediaan menu. |
| PO-03 | Mempermudah proses pemesanan. | Pelanggan dapat memilih menu, mengatur jumlah pesanan, dan mengirimkan pesanan melalui sistem. |
| PO-04 | Meningkatkan transparansi informasi pesanan. | Pelanggan dapat melihat status pesanan secara digital. |
| PO-05 | Mendukung pengelolaan pesanan oleh vendor. | Vendor dapat melihat dan memperbarui status pesanan melalui dashboard. |
| PO-06 | Mendukung administrasi sistem. | Administrator dapat mengelola data pengguna dan tenant sesuai kewenangannya. |

---

# 3. TARGET USERS AND PERSONAS

LetsOrder.com memiliki tiga kelompok pengguna utama.

## 3.1 Customer

**Deskripsi:**

Customer merupakan mahasiswa atau pengguna kantin yang menggunakan LetsOrder.com untuk mencari menu, melakukan pemesanan, dan mengambil makanan secara mandiri.

**Kebutuhan utama:**

- Melihat daftar menu yang tersedia.
- Melihat informasi harga dan deskripsi makanan.
- Memasukkan menu ke keranjang.
- Mengatur jumlah pesanan dan catatan pesanan.
- Melakukan pemesanan.
- Melakukan pembayaran melalui metode simulasi yang disediakan.
- Memantau status pesanan.
- Melihat notifikasi terkait pesanan.

**Permasalahan yang ingin diselesaikan:**

Customer tidak perlu memulai proses pemesanan dengan mengantre secara langsung di depan tenant untuk memilih dan memesan makanan.

## 3.2 Vendor

**Deskripsi:**

Vendor merupakan pihak penjual atau pengelola tenant kantin yang menggunakan sistem untuk mengelola informasi menu dan menangani pesanan pelanggan.

**Kebutuhan utama:**

- Mengelola informasi tenant.
- Mengelola kategori dan menu yang ditawarkan.
- Memperbarui ketersediaan menu.
- Melihat pesanan yang masuk.
- Memproses pesanan.
- Memperbarui status pesanan.
- Melihat informasi pembayaran dan status verifikasinya.

**Permasalahan yang ingin diselesaikan:**

Vendor membutuhkan sistem terpusat untuk menerima dan mengelola pesanan digital sehingga proses pelayanan menjadi lebih terorganisasi.

## 3.3 Administrator

**Deskripsi:**

Administrator merupakan pihak yang bertanggung jawab terhadap pengelolaan data dan administrasi sistem LetsOrder.com.

**Kebutuhan utama:**

- Mengelola data pengguna.
- Mengelola data tenant.
- Melihat informasi yang berkaitan dengan aktivitas sistem sesuai kewenangannya.
- Mendukung keteraturan data dan penggunaan sistem.

**Permasalahan yang ingin diselesaikan:**

Administrator membutuhkan akses pengelolaan agar data pengguna dan tenant dapat dikelola secara terpusat.

---

# 4. PRODUCT SCOPE

## 4.1 In Scope

Fitur dan kemampuan yang termasuk dalam ruang lingkup pengembangan LetsOrder.com adalah sebagai berikut.

| ID | Area | Deskripsi |
|---|---|---|
| IS-01 | Authentication | Registrasi, login, dan autentikasi pengguna. |
| IS-02 | Menu Catalog | Menampilkan daftar kategori dan menu makanan dari tenant. |
| IS-03 | Menu Management | Mengelola informasi menu, harga, deskripsi, gambar, estimasi waktu, dan ketersediaan. |
| IS-04 | Shopping Cart | Menambahkan menu ke keranjang, mengubah jumlah, dan memberikan catatan. |
| IS-05 | Order Management | Membuat dan mengelola pesanan pelanggan. |
| IS-06 | Digital Payment Simulation | Menyediakan simulasi pembayaran melalui QRIS dan dompet digital. |
| IS-07 | Order Tracking | Menampilkan perkembangan status pesanan. |
| IS-08 | Order History | Menampilkan informasi pesanan yang telah dibuat. |
| IS-09 | Notification | Menyediakan notifikasi terkait pesanan kepada pengguna. |
| IS-10 | Tenant Management | Mengelola informasi tenant dan status buka atau tutup. |
| IS-11 | User Management | Mendukung pengelolaan data pengguna oleh administrator. |
| IS-12 | Self-Pickup | Memungkinkan pelanggan mengambil pesanan secara mandiri di tenant berdasarkan informasi pesanan dan nomor antrean. |

## 4.2 Out of Scope

Fitur berikut tidak termasuk dalam ruang lingkup pengembangan versi proyek ini.

| ID | Fitur | Alasan |
|---|---|---|
| OS-01 | Aplikasi Android dan iOS native | Pengembangan difokuskan pada platform website. |
| OS-02 | Layanan pengantaran makanan | Sistem menggunakan mekanisme self-pickup. |
| OS-03 | Integrasi payment gateway asli | Pembayaran hanya disimulasikan. |
| OS-04 | Laporan keuangan vendor tingkat lanjut | Bukan fokus utama pengembangan. |
| OS-05 | Pengelolaan stok bahan baku | Sistem berfokus pada pengelolaan menu dan pesanan. |
| OS-06 | Pengelolaan banyak staf dalam satu tenant | Tidak termasuk dalam kebutuhan proyek saat ini. |
| OS-07 | Dukungan berbagai kampus | Implementasi difokuskan pada Kantin UPNVJ. |

---

# 5. PRODUCT FEATURES AND REQUIREMENTS

Bagian ini menjelaskan fitur utama yang menjadi dasar pengembangan produk.

## 5.1 Authentication and User Access

**Deskripsi:**

Sistem menyediakan mekanisme autentikasi agar pengguna dapat mengakses layanan sesuai peran masing-masing.

**Kebutuhan produk:**

- Pengguna dapat melakukan registrasi dan login.
- Sistem mengenali peran Customer, Vendor, dan Administrator.
- Pengguna mendapatkan akses sesuai dengan perannya.
- Informasi akun pengguna dikelola melalui sistem.

## 5.2 Menu Catalog

**Deskripsi:**

Sistem menyediakan katalog menu yang dapat digunakan pelanggan untuk mencari dan melihat pilihan makanan dari tenant.

**Kebutuhan produk:**

- Menampilkan kategori menu.
- Menampilkan nama dan deskripsi menu.
- Menampilkan gambar menu.
- Menampilkan harga menu.
- Menampilkan estimasi waktu penyajian.
- Menampilkan ketersediaan menu.

## 5.3 Menu Management

**Deskripsi:**

Vendor dapat mengelola informasi menu yang ditawarkan kepada pelanggan.

**Kebutuhan produk:**

- Menambahkan informasi menu.
- Memperbarui informasi menu.
- Mengelola harga menu.
- Mengelola kategori menu.
- Memperbarui status ketersediaan menu.

## 5.4 Shopping Cart

**Deskripsi:**

Keranjang digunakan pelanggan untuk menampung menu yang akan dipesan sebelum pesanan dikirimkan.

**Kebutuhan produk:**

- Menambahkan menu ke keranjang.
- Mengubah jumlah menu.
- Menambahkan catatan pada item keranjang.
- Melihat daftar item yang dipilih.
- Menghitung subtotal berdasarkan harga menu dan jumlah pesanan.

## 5.5 Order Management

**Deskripsi:**

Sistem mengelola proses pemesanan mulai dari pelanggan mengirimkan pesanan sampai pesanan selesai diproses.

**Kebutuhan produk:**

- Pelanggan dapat membuat pesanan.
- Sistem mencatat informasi pesanan.
- Sistem menghasilkan nomor antrean.
- Pesanan memiliki informasi total harga.
- Pesanan memiliki status yang dapat diperbarui.
- Vendor dapat melihat dan memproses pesanan.
- Perubahan status pesanan dapat dicatat dalam riwayat status.

## 5.6 Digital Payment Simulation

**Deskripsi:**

Sistem menyediakan mekanisme simulasi pembayaran digital untuk mendukung alur pemesanan.

**Kebutuhan produk:**

- Menyediakan pilihan metode pembayaran yang disimulasikan.
- Menampilkan informasi pembayaran QRIS apabila metode tersebut dipilih.
- Menyimpan informasi pembayaran.
- Menampilkan status verifikasi pembayaran.
- Menyimpan batas waktu pembayaran dan waktu pembayaran apabila tersedia.

**Batasan:**

Fitur pembayaran tidak terhubung dengan payment gateway atau penyedia layanan keuangan eksternal. Seluruh proses pembayaran hanya digunakan untuk simulasi dalam proyek.

## 5.7 Order Tracking and History

**Deskripsi:**

Pelanggan dapat memantau perkembangan pesanan melalui informasi status yang disediakan sistem.

**Kebutuhan produk:**

- Menampilkan status pesanan terkini.
- Menampilkan riwayat perubahan status pesanan.
- Menampilkan informasi nomor antrean.
- Menampilkan informasi pesanan yang pernah dibuat.

## 5.8 Notification

**Deskripsi:**

Sistem menyediakan informasi pemberitahuan kepada pengguna mengenai perkembangan pesanan.

**Kebutuhan produk:**

- Menampilkan pesan notifikasi terkait pesanan.
- Menghubungkan notifikasi dengan pengguna dan pesanan.
- Menyimpan status apakah notifikasi sudah dibaca.

## 5.9 Tenant Management

**Deskripsi:**

Sistem menyediakan pengelolaan informasi tenant yang berpartisipasi dalam layanan LetsOrder.com.

**Kebutuhan produk:**

- Menampilkan informasi tenant.
- Mengelola nama tenant.
- Mengelola deskripsi tenant.
- Mengelola logo tenant.
- Memperbarui status buka atau tutup tenant.

## 5.10 Administrator Management

**Deskripsi:**

Administrator memiliki kewenangan untuk membantu mengelola data pengguna dan tenant dalam sistem.

**Kebutuhan produk:**

- Melihat data pengguna.
- Mengelola informasi pengguna sesuai atribut yang tersedia.
- Melihat data tenant.
- Mengelola informasi tenant sesuai atribut yang tersedia.

---

# 6. PRODUCT WORKFLOW

## 6.1 Customer Workflow

Alur penggunaan sistem oleh Customer:

1. Customer membuka website LetsOrder.com.
2. Customer melakukan registrasi atau login.
3. Customer melihat daftar tenant dan menu.
4. Customer memilih menu yang diinginkan.
5. Customer memasukkan menu ke keranjang.
6. Customer memeriksa daftar pesanan.
7. Customer mengirimkan pesanan.
8. Sistem mencatat pesanan dan nomor antrean.
9. Customer melakukan pembayaran melalui mekanisme simulasi.
10. Customer memantau status pesanan.
11. Setelah pesanan siap, Customer datang ke tenant.
12. Customer mengambil pesanan secara mandiri.

## 6.2 Vendor Workflow

Alur penggunaan sistem oleh Vendor:

1. Vendor melakukan login.
2. Vendor mengakses dashboard.
3. Vendor mengelola informasi tenant dan menu.
4. Vendor melihat pesanan yang masuk.
5. Vendor memeriksa informasi pesanan.
6. Vendor memproses pesanan.
7. Vendor memperbarui status pesanan.
8. Vendor menyelesaikan proses pelayanan pesanan.

## 6.3 Administrator Workflow

Alur penggunaan sistem oleh Administrator:

1. Administrator melakukan login.
2. Administrator mengakses halaman administrasi.
3. Administrator melihat data pengguna.
4. Administrator mengelola informasi pengguna sesuai kewenangannya.
5. Administrator melihat dan mengelola informasi tenant.
6. Administrator memastikan data administrasi tetap terorganisasi.

---

# 7. PRODUCT CONSTRAINTS

Pengembangan LetsOrder.com memiliki sejumlah batasan yang harus diperhatikan.

| ID | Batasan | Keterangan |
|---|---|---|
| PC-01 | Platform | Sistem dikembangkan sebagai aplikasi berbasis web. |
| PC-02 | Frontend | Menggunakan React. |
| PC-03 | Backend | Menggunakan Laravel. |
| PC-04 | Database | Menggunakan MySQL. |
| PC-05 | Payment | Pembayaran QRIS dan dompet digital hanya berupa simulasi. |
| PC-06 | Fulfillment | Pengambilan pesanan menggunakan mekanisme self-pickup. |
| PC-07 | Deployment Scope | Sistem difokuskan untuk lingkungan Kantin UPNVJ. |
| PC-08 | Database Structure | Struktur database mengikuti ERD final yang telah disepakati. |

---

# 8. NON-FUNCTIONAL PRODUCT EXPECTATIONS

Berikut ekspektasi kualitas produk yang menjadi perhatian selama pengembangan.

| ID | Aspek | Ekspektasi |
|---|---|---|
| NPE-01 | Performance | Waktu pemuatan halaman ditargetkan kurang dari 2 detik dalam kondisi pengujian yang ditentukan. |
| NPE-02 | Security | Informasi akun dan akses pengguna harus dilindungi melalui mekanisme keamanan aplikasi. |
| NPE-03 | Usability | Antarmuka harus mudah dipahami oleh Customer, Vendor, dan Administrator. |
| NPE-04 | Reliability | Sistem harus mampu menjalankan proses utama pemesanan secara konsisten. |
| NPE-05 | Compatibility | Website dapat digunakan melalui browser yang mendukung teknologi aplikasi. |
| NPE-06 | Maintainability | Struktur kode harus terorganisasi agar memudahkan pemeliharaan dan pengembangan. |

Pengujian kualitas perangkat lunak dapat mengacu pada karakteristik ISO/IEC 25010.

---

# 9. PRODUCT SUCCESS CRITERIA

Keberhasilan produk dinilai berdasarkan kemampuan sistem dalam memenuhi tujuan utamanya.

| ID | Kriteria Keberhasilan | Target Evaluasi |
|---|---|---|
| PSC-01 | Pemesanan digital | Customer dapat menyelesaikan alur pemesanan melalui website. |
| PSC-02 | Informasi menu | Customer dapat melihat informasi menu dan ketersediaannya. |
| PSC-03 | Pengelolaan pesanan | Vendor dapat menerima dan memperbarui status pesanan. |
| PSC-04 | Pemantauan pesanan | Customer dapat melihat perkembangan status pesanan. |
| PSC-05 | Pembayaran simulasi | Sistem dapat menjalankan alur pembayaran simulasi. |
| PSC-06 | Self-pickup | Customer dapat mengambil pesanan berdasarkan informasi pesanan dan nomor antrean. |
| PSC-07 | Administrasi | Administrator dapat mengelola data pengguna dan tenant sesuai kewenangannya. |
| PSC-08 | Kinerja | Waktu pemuatan halaman memenuhi target yang ditetapkan dalam pengujian. |

---

# 10. PRODUCT ROADMAP

Roadmap berikut merupakan gambaran tahapan pengembangan produk, bukan jadwal pengerjaan yang mengikat.

| Tahap | Fokus Pengembangan | Hasil yang Diharapkan |
|---|---|---|
| Phase 1 | Product Planning | PRD, identifikasi pengguna, ruang lingkup, dan prioritas produk. |
| Phase 2 | Requirements Analysis | SRS dan identifikasi kebutuhan sistem. |
| Phase 3 | System Design | ERD, UML, arsitektur, rancangan API, dan UI/UX. |
| Phase 4 | Frontend Development | Implementasi antarmuka menggunakan React. |
| Phase 5 | Backend Development | Implementasi API dan logika bisnis menggunakan Laravel. |
| Phase 6 | Integration | Integrasi frontend, backend, dan database MySQL. |
| Phase 7 | Testing and Evaluation | Pengujian fungsional dan kualitas sistem. |
| Phase 8 | Deployment | Persiapan dan penerapan aplikasi. |

---

# 11. ASSUMPTIONS AND DEPENDENCIES

## 11.1 Assumptions

1. Customer memiliki perangkat dan browser yang dapat mengakses website.
2. Vendor memiliki akses ke sistem untuk mengelola menu dan pesanan.
3. Administrator memiliki akun dengan hak akses administrasi.
4. Vendor bertanggung jawab terhadap persiapan dan penyerahan pesanan.
5. Customer mengambil pesanan secara langsung di tenant.
6. Pembayaran dalam proyek ini hanya berupa simulasi.

## 11.2 Dependencies

1. Ketersediaan lingkungan pengembangan React.
2. Ketersediaan lingkungan backend Laravel.
3. Ketersediaan database MySQL.
4. Ketersediaan rancangan UI/UX sebagai acuan implementasi frontend.
5. Ketersediaan ERD final sebagai acuan implementasi database.
6. Kesesuaian implementasi frontend dan backend terhadap spesifikasi API.

---

# 12. DATA MODEL ALIGNMENT

Seluruh kebutuhan produk harus konsisten dengan ERD final LetsOrder.com.

ERD final terdiri dari 11 entitas berikut:

| No. | Entitas | Peran dalam Sistem |
|---|---|---|
| 1 | USER | Menyimpan informasi akun dan peran pengguna. |
| 2 | TENANT | Menyimpan informasi tenant kantin. |
| 3 | KATEGORI | Menyimpan kategori menu. |
| 4 | MENU | Menyimpan informasi menu yang ditawarkan tenant. |
| 5 | KERANJANG | Menyimpan keranjang milik pengguna. |
| 6 | ITEM_KERANJANG | Menyimpan item menu dalam keranjang. |
| 7 | PESANAN | Menyimpan informasi utama pesanan. |
| 8 | DETAIL_PESANAN | Menyimpan rincian item dalam pesanan. |
| 9 | PEMBAYARAN | Menyimpan informasi pembayaran. |
| 10 | RIWAYAT_STATUS | Menyimpan riwayat perubahan status pesanan. |
| 11 | NOTIFIKASI | Menyimpan informasi notifikasi pengguna. |

**Ketentuan konsistensi:**

- PRD tidak boleh menjadi alasan untuk menambahkan entitas atau atribut baru ke ERD final.
- Kebutuhan produk harus diterjemahkan ke SRS sesuai struktur data yang telah disepakati.
- Informasi pesanan dan nomor antrean menggunakan data yang sudah tersedia dalam entitas PESANAN.
- Pembayaran tetap menggunakan mekanisme simulasi.
- Tidak ada fitur pengantaran makanan, ulasan, rating, favorit, atau promosi dalam ruang lingkup dokumen ini.

---

# 13. DOCUMENT REFERENCES

Dokumen dan sumber berikut menjadi acuan pengembangan LetsOrder.com:

| No. | Referensi | Keterangan |
|---|---|---|
| 1 | Software Requirements Specification (SRS) | Dokumen spesifikasi kebutuhan perangkat lunak. |
| 2 | Entity Relationship Diagram (ERD) | Acuan struktur dan relasi database. |
| 3 | UI/UX Design – Figma | Acuan rancangan antarmuka pengguna. |
| 4 | Project Management Documentation | Acuan pengelolaan proyek. |
| 5 | ISO/IEC 25010 | Acuan karakteristik kualitas perangkat lunak. |

---

# 14. DOCUMENT CHANGE HISTORY

| Version | Date | Description |
|---|---|---|
| 1.0 | 4 November 2026 | Initial draft of Product Requirements Document. |

---

**End of Document**