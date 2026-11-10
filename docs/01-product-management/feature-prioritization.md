# FEATURE PRIORITIZATION
# LetsOrder.com

**Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ**

| Informasi | Detail |
|---|---|
| Nama Produk | LetsOrder.com |
| Jenis Dokumen | Feature Prioritization |
| Versi Dokumen | 1.0 |
| Status Dokumen | Draft |
| Metode Prioritisasi | MoSCoW |
| Acuan Utama | Product Requirements Document (PRD) |
| Platform | Website |
| Target Pengguna | Customer, Vendor, Administrator |

---

# 1. INTRODUCTION

## 1.1 Purpose

Dokumen Feature Prioritization disusun untuk menentukan tingkat kepentingan setiap fitur yang akan dikembangkan dalam sistem LetsOrder.com. Prioritisasi dilakukan agar tim pengembang dapat membedakan fitur yang wajib tersedia pada versi awal produk, fitur pendukung yang penting, serta fitur yang belum menjadi fokus pengembangan.

Dokumen ini menjadi acuan dalam menentukan urutan implementasi fitur, mengalokasikan sumber daya pengembangan, dan menjaga agar pengembangan produk tetap sesuai dengan tujuan serta ruang lingkup yang telah ditetapkan dalam Product Requirements Document (PRD).

## 1.2 Objectives

Tujuan penyusunan dokumen ini adalah:

1. Mengidentifikasi fitur berdasarkan kebutuhan Customer, Vendor, dan Administrator.
2. Menentukan tingkat prioritas setiap fitur berdasarkan kontribusinya terhadap tujuan produk.
3. Memastikan fitur utama dapat diselesaikan sebelum fitur pendukung.
4. Mengurangi risiko pengembangan fitur yang tidak termasuk dalam ruang lingkup proyek.
5. Menjadi acuan dalam penyusunan tahapan implementasi dan pengujian produk.
6. Menjaga konsistensi antara prioritas fitur, PRD, SRS, dan ERD final.

## 1.3 Scope

Prioritisasi mencakup fitur-fitur utama LetsOrder.com, meliputi:

- Authentication and User Access
- Menu Catalog
- Menu Management
- Shopping Cart
- Order Management
- Digital Payment Simulation
- Order Tracking and History
- Notification
- Tenant Management
- Administrator Management
- Self-Pickup

---

# 2. PRIORITIZATION METHOD

## 2.1 MoSCoW Method

Metode MoSCoW digunakan untuk mengelompokkan fitur berdasarkan tingkat kepentingannya terhadap keberhasilan produk.

Metode ini memiliki empat kategori prioritas:

| Kategori | Tingkat Prioritas | Penjelasan |
|---|---|---|
| Must Have | Sangat Tinggi | Fitur wajib tersedia agar fungsi utama produk dapat berjalan. |
| Should Have | Tinggi | Fitur penting yang mendukung pengalaman dan efektivitas penggunaan produk, tetapi bukan penghambat utama apabila belum tersedia pada tahap awal. |
| Could Have | Menengah | Fitur tambahan yang dapat dikembangkan apabila waktu dan sumber daya memungkinkan. |
| Won't Have | Tidak Termasuk Versi Ini | Fitur yang secara sengaja tidak dikembangkan dalam ruang lingkup versi proyek saat ini. |

## 2.2 Prioritization Criteria

Penentuan prioritas mempertimbangkan beberapa aspek berikut:

| Kriteria | Penjelasan |
|---|---|
| Business Value | Kontribusi fitur terhadap tujuan utama LetsOrder.com. |
| User Impact | Pengaruh fitur terhadap kebutuhan dan pengalaman pengguna. |
| Functional Dependency | Ketergantungan fitur terhadap fitur lain dalam sistem. |
| Operational Importance | Tingkat kepentingan fitur terhadap operasional Customer, Vendor, dan Administrator. |
| Project Scope | Kesesuaian fitur dengan ruang lingkup dan batasan proyek. |
| Implementation Feasibility | Kelayakan implementasi berdasarkan teknologi, waktu, dan sumber daya yang tersedia. |
| Data Model Compatibility | Kesesuaian kebutuhan fitur dengan struktur ERD final. |

## 2.3 Prioritization Rules

Beberapa ketentuan yang digunakan dalam menentukan prioritas:

1. Fitur yang menjadi bagian langsung dari alur pemesanan utama ditempatkan pada kategori Must Have.
2. Fitur yang mendukung pengelolaan operasional dan transparansi informasi ditempatkan berdasarkan tingkat kepentingannya terhadap alur utama.
3. Fitur yang tidak menjadi kebutuhan utama tetapi mendukung penggunaan sistem dapat ditempatkan pada kategori Should Have.
4. Fitur yang membutuhkan perubahan struktur ERD tidak boleh dimasukkan sebagai kebutuhan baru tanpa persetujuan perubahan desain database.
5. Fitur yang telah ditetapkan sebagai Out of Scope dalam PRD tidak menjadi target implementasi versi proyek ini.
6. Prioritas dapat dievaluasi kembali apabila terdapat perubahan kebutuhan yang disetujui oleh tim proyek.

---

# 3. FEATURE PRIORITIZATION OVERVIEW

Berikut ringkasan prioritas fitur utama LetsOrder.com.

| ID | Fitur | Pengguna Utama | Prioritas |
|---|---|---|---|
| FP-01 | Authentication and User Access | Semua pengguna | Must Have |
| FP-02 | Menu Catalog | Customer | Must Have |
| FP-03 | Menu Management | Vendor | Must Have |
| FP-04 | Shopping Cart | Customer | Must Have |
| FP-05 | Order Management | Customer, Vendor | Must Have |
| FP-06 | Digital Payment Simulation | Customer, Vendor | Must Have |
| FP-07 | Order Tracking | Customer | Must Have |
| FP-08 | Order History | Customer | Should Have |
| FP-09 | Notification | Customer | Should Have |
| FP-10 | Tenant Management | Vendor, Administrator | Must Have |
| FP-11 | Administrator Management | Administrator | Should Have |
| FP-12 | Self-Pickup | Customer, Vendor | Must Have |

---

# 4. MUST HAVE FEATURES

Kategori Must Have berisi fitur yang wajib tersedia agar tujuan utama LetsOrder.com dapat tercapai. Tanpa fitur-fitur ini, proses pemesanan digital dan self-pickup tidak dapat berjalan secara utuh.

## 4.1 FP-01 — Authentication and User Access

**Prioritas:** Must Have

**Pengguna:** Customer, Vendor, Administrator

**Deskripsi:**

Authentication and User Access merupakan fitur yang digunakan untuk mengidentifikasi pengguna dan memberikan akses terhadap sistem berdasarkan peran masing-masing.

**Alasan Prioritas:**

Fitur autentikasi menjadi dasar akses sistem. Setiap pengguna membutuhkan mekanisme login agar dapat menggunakan fungsi yang sesuai dengan perannya.

**Cakupan Fitur:**

- Registrasi akun.
- Login pengguna.
- Validasi informasi autentikasi.
- Identifikasi peran pengguna.
- Pembatasan akses berdasarkan peran.

**Ketergantungan:**

- Database USER.
- Sistem autentikasi backend.
- Pengaturan hak akses pengguna.

**Kriteria Penerimaan:**

- Pengguna dapat melakukan registrasi sesuai ketentuan sistem.
- Pengguna yang memiliki kredensial valid dapat login.
- Sistem mengenali peran Customer, Vendor, dan Administrator.
- Pengguna tidak dapat mengakses halaman yang tidak sesuai dengan hak aksesnya.

## 4.2 FP-02 — Menu Catalog

**Prioritas:** Must Have

**Pengguna:** Customer

**Deskripsi:**

Menu Catalog menyediakan informasi kategori dan daftar makanan atau minuman yang ditawarkan oleh tenant.

**Alasan Prioritas:**

Customer membutuhkan informasi menu sebelum menentukan makanan yang akan dipesan. Katalog menu merupakan bagian awal dari alur pemesanan.

**Cakupan Fitur:**

- Menampilkan daftar tenant.
- Menampilkan kategori menu.
- Menampilkan nama menu.
- Menampilkan deskripsi menu.
- Menampilkan gambar menu.
- Menampilkan harga menu.
- Menampilkan estimasi waktu penyajian.
- Menampilkan status ketersediaan menu.

**Ketergantungan:**

- Database TENANT.
- Database KATEGORI.
- Database MENU.

**Kriteria Penerimaan:**

- Customer dapat melihat daftar tenant.
- Customer dapat melihat menu berdasarkan kategori.
- Informasi nama, deskripsi, harga, dan gambar menu ditampilkan sesuai data yang tersedia.
- Menu yang tidak tersedia dapat dikenali oleh Customer.
- Informasi tenant dan menu ditampilkan berdasarkan data yang tersimpan.

## 4.3 FP-03 — Menu Management

**Prioritas:** Must Have

**Pengguna:** Vendor

**Deskripsi:**

Menu Management memungkinkan Vendor mengelola informasi menu yang ditawarkan kepada Customer.

**Alasan Prioritas:**

Informasi menu harus dapat dikelola agar katalog yang dilihat Customer tetap sesuai dengan kondisi menu yang ditawarkan oleh Vendor.

**Cakupan Fitur:**

- Menambahkan menu.
- Memperbarui informasi menu.
- Mengelola deskripsi menu.
- Mengelola gambar menu.
- Mengatur harga menu.
- Mengatur kategori menu.
- Mengatur estimasi waktu penyajian.
- Memperbarui status ketersediaan menu.

**Ketergantungan:**

- Database TENANT.
- Database KATEGORI.
- Database MENU.
- Authentication and User Access.

**Kriteria Penerimaan:**

- Vendor dapat menambahkan menu sesuai hak aksesnya.
- Vendor dapat memperbarui informasi menu.
- Vendor dapat mengubah harga dan kategori menu.
- Vendor dapat memperbarui status ketersediaan menu.
- Perubahan informasi menu dapat ditampilkan pada katalog Customer.

## 4.4 FP-04 — Shopping Cart

**Prioritas:** Must Have

**Pengguna:** Customer

**Deskripsi:**

Shopping Cart merupakan fitur yang digunakan Customer untuk menampung menu yang dipilih sebelum pesanan dikirimkan.

**Alasan Prioritas:**

Keranjang menjadi bagian penting dalam proses pemesanan karena Customer perlu memeriksa dan mengatur pilihan menu sebelum membuat pesanan.

**Cakupan Fitur:**

- Menambahkan menu ke keranjang.
- Mengubah jumlah menu.
- Menghapus item dari keranjang.
- Menambahkan catatan pada item keranjang.
- Menampilkan daftar item yang dipilih.
- Menghitung subtotal berdasarkan harga menu dan jumlah item.

**Ketergantungan:**

- Database USER.
- Database KERANJANG.
- Database ITEM_KERANJANG.
- Database MENU.

**Kriteria Penerimaan:**

- Customer dapat menambahkan menu ke keranjang.
- Customer dapat mengubah jumlah item.
- Customer dapat menghapus item yang dipilih.
- Customer dapat memberikan catatan pada item.
- Sistem menampilkan subtotal berdasarkan data menu dan jumlah item.

## 4.5 FP-05 — Order Management

**Prioritas:** Must Have

**Pengguna:** Customer, Vendor

**Deskripsi:**

Order Management merupakan fitur inti yang mengelola proses pemesanan makanan dari Customer hingga pesanan diproses oleh Vendor.

**Alasan Prioritas:**

Pemesanan merupakan tujuan utama pengembangan LetsOrder.com. Fitur ini menghubungkan aktivitas Customer dengan proses pelayanan Vendor.

**Cakupan Fitur:**

- Membuat pesanan dari item yang dipilih.
- Menyimpan informasi pesanan.
- Menyimpan rincian item pesanan.
- Menghasilkan nomor antrean.
- Menghitung total harga pesanan.
- Menampilkan daftar pesanan kepada Vendor.
- Memperbarui status pesanan.
- Mencatat perubahan status pesanan.

**Ketergantungan:**

- Database PESANAN.
- Database DETAIL_PESANAN.
- Database RIWAYAT_STATUS.
- Shopping Cart.
- Authentication and User Access.

**Kriteria Penerimaan:**

- Customer dapat membuat pesanan dari keranjang.
- Sistem menyimpan informasi utama pesanan.
- Sistem menyimpan rincian item pesanan.
- Sistem menyediakan nomor antrean untuk pesanan.
- Vendor dapat melihat pesanan yang masuk.
- Vendor dapat memperbarui status pesanan sesuai alur yang ditetapkan.
- Perubahan status pesanan dapat tercatat dalam riwayat status.

## 4.6 FP-06 — Digital Payment Simulation

**Prioritas:** Must Have

**Pengguna:** Customer, Vendor

**Deskripsi:**

Digital Payment Simulation menyediakan alur pembayaran digital dalam bentuk simulasi agar proses pemesanan dapat diuji secara menyeluruh.

**Alasan Prioritas:**

Pembayaran merupakan bagian dari alur transaksi yang telah ditentukan dalam ruang lingkup proyek. Meskipun tidak terhubung dengan penyedia pembayaran eksternal, proses simulasi tetap dibutuhkan untuk menguji alur transaksi.

**Cakupan Fitur:**

- Menyediakan pilihan metode pembayaran simulasi.
- Menampilkan informasi QRIS simulasi.
- Menyimpan informasi metode pembayaran.
- Menampilkan status verifikasi pembayaran.
- Mencatat batas waktu pembayaran.
- Mencatat waktu pembayaran apabila tersedia.

**Ketergantungan:**

- Database PEMBAYARAN.
- Database PESANAN.
- Order Management.

**Kriteria Penerimaan:**

- Customer dapat memilih metode pembayaran yang tersedia dalam simulasi.
- Sistem menampilkan informasi pembayaran sesuai metode yang dipilih.
- Informasi pembayaran tersimpan pada sistem.
- Status pembayaran dapat ditampilkan.
- Proses pembayaran tidak memerlukan integrasi payment gateway asli.

## 4.7 FP-07 — Order Tracking

**Prioritas:** Must Have

**Pengguna:** Customer

**Deskripsi:**

Order Tracking memungkinkan Customer memantau perkembangan pesanan berdasarkan status yang diperbarui oleh sistem.

**Alasan Prioritas:**

Salah satu tujuan LetsOrder.com adalah memberikan transparansi informasi pesanan sehingga Customer dapat mengetahui perkembangan pesanannya tanpa harus terus-menerus menanyakan langsung kepada Vendor.

**Cakupan Fitur:**

- Menampilkan status pesanan terkini.
- Menampilkan riwayat perubahan status.
- Menampilkan nomor antrean.
- Menampilkan informasi pesanan yang sedang diproses.

**Ketergantungan:**

- Database PESANAN.
- Database RIWAYAT_STATUS.
- Order Management.

**Kriteria Penerimaan:**

- Customer dapat melihat status pesanan.
- Status yang ditampilkan sesuai dengan data pesanan.
- Customer dapat melihat riwayat perubahan status.
- Nomor antrean ditampilkan sebagai informasi identifikasi pesanan.

## 4.8 FP-10 — Tenant Management

**Prioritas:** Must Have

**Pengguna:** Vendor, Administrator

**Deskripsi:**

Tenant Management digunakan untuk mengelola informasi tenant yang berpartisipasi dalam sistem LetsOrder.com.

**Alasan Prioritas:**

Informasi tenant menjadi bagian penting dari katalog dan proses pemesanan. Data tenant juga perlu dikelola agar informasi yang ditampilkan kepada Customer tetap sesuai.

**Cakupan Fitur:**

- Mengelola nama tenant.
- Mengelola deskripsi tenant.
- Mengelola logo tenant.
- Memperbarui status buka atau tutup tenant.
- Mengelola keterkaitan akun pengguna dengan tenant sesuai struktur sistem.

**Ketergantungan:**

- Database USER.
- Database TENANT.
- Authentication and User Access.

**Kriteria Penerimaan:**

- Informasi tenant dapat ditampilkan.
- Vendor dapat mengelola informasi tenant sesuai hak aksesnya.
- Status buka atau tutup tenant dapat diperbarui.
- Informasi tenant yang diperbarui dapat ditampilkan pada sistem.

## 4.9 FP-12 — Self-Pickup

**Prioritas:** Must Have

**Pengguna:** Customer, Vendor

**Deskripsi:**

Self-Pickup merupakan mekanisme pengambilan makanan secara mandiri oleh Customer di tenant setelah pesanan siap.

**Alasan Prioritas:**

Self-pickup merupakan karakteristik utama produk LetsOrder.com. Fitur ini membedakan proses pemesanan digital dengan mekanisme pemesanan langsung di kantin.

**Cakupan Fitur:**

- Menampilkan nomor antrean pesanan.
- Menampilkan status kesiapan pesanan.
- Memberikan informasi bahwa pesanan dapat diambil.
- Memungkinkan Customer mengambil pesanan secara langsung di tenant.

**Ketergantungan:**

- Database PESANAN.
- Database RIWAYAT_STATUS.
- Order Tracking.
- Order Management.

**Kriteria Penerimaan:**

- Customer dapat melihat nomor antrean pesanan.
- Customer dapat mengetahui ketika pesanan telah siap.
- Vendor dapat mengetahui pesanan yang perlu diserahkan.
- Pengambilan dilakukan secara langsung di tenant.
- Identifikasi pesanan menggunakan informasi yang tersedia, termasuk nomor antrean, tanpa memerlukan kode pengambilan baru.

---

# 5. SHOULD HAVE FEATURES

Kategori Should Have berisi fitur yang penting untuk meningkatkan kemudahan penggunaan, keteraturan informasi, dan pengalaman pengguna. Fitur ini mendukung sistem utama, tetapi implementasinya dapat dilakukan setelah kebutuhan Must Have terpenuhi.

## 5.1 FP-08 — Order History

**Prioritas:** Should Have

**Pengguna:** Customer

**Deskripsi:**

Order History memungkinkan Customer melihat informasi pesanan yang pernah dibuat sebelumnya.

**Alasan Prioritas:**

Riwayat pesanan membantu Customer memperoleh informasi transaksi sebelumnya tanpa harus mencari kembali informasi pesanan secara manual.

**Cakupan Fitur:**

- Menampilkan daftar pesanan milik Customer.
- Menampilkan nomor antrean.
- Menampilkan waktu pemesanan.
- Menampilkan total harga.
- Menampilkan status pesanan.
- Menampilkan rincian item pesanan.

**Ketergantungan:**

- Database PESANAN.
- Database DETAIL_PESANAN.
- Authentication and User Access.

**Kriteria Penerimaan:**

- Customer dapat melihat pesanan yang terkait dengan akunnya.
- Informasi pesanan ditampilkan sesuai data yang tersimpan.
- Customer tidak dapat melihat riwayat pesanan milik pengguna lain.

## 5.2 FP-09 — Notification

**Prioritas:** Should Have

**Pengguna:** Customer

**Deskripsi:**

Notification menyediakan pemberitahuan terkait perkembangan pesanan kepada Customer.

**Alasan Prioritas:**

Notifikasi membantu Customer mengetahui informasi terbaru mengenai pesanan tanpa harus terus-menerus membuka halaman pemantauan pesanan.

**Cakupan Fitur:**

- Menampilkan pesan notifikasi terkait pesanan.
- Menghubungkan notifikasi dengan pesanan.
- Menampilkan status baca notifikasi.
- Memperbarui status notifikasi ketika dibaca.

**Ketergantungan:**

- Database NOTIFIKASI.
- Database USER.
- Database PESANAN.
- Order Management.

**Kriteria Penerimaan:**

- Customer dapat melihat notifikasi yang terkait dengan akunnya.
- Notifikasi menampilkan pesan yang tersimpan.
- Notifikasi dapat ditandai sebagai sudah dibaca.
- Notifikasi dapat dikaitkan dengan pesanan yang relevan.

## 5.3 FP-11 — Administrator Management

**Prioritas:** Should Have

**Pengguna:** Administrator

**Deskripsi:**

Administrator Management menyediakan fungsi administrasi untuk melihat dan mengelola data pengguna serta informasi tenant berdasarkan hak akses administrator.

**Alasan Prioritas:**

Pengelolaan administrasi diperlukan untuk mendukung keteraturan data pengguna dan tenant. Namun, fitur ini bukan bagian langsung dari alur pemesanan Customer sehingga dapat diprioritaskan setelah proses utama berjalan.

**Cakupan Fitur:**

- Melihat data pengguna.
- Mengelola informasi pengguna sesuai atribut yang tersedia.
- Melihat data tenant.
- Mengelola informasi tenant sesuai atribut yang tersedia.

**Ketergantungan:**

- Database USER.
- Database TENANT.
- Authentication and User Access.

**Kriteria Penerimaan:**

- Administrator dapat mengakses halaman administrasi.
- Administrator dapat melihat data pengguna.
- Administrator dapat melihat data tenant.
- Pengelolaan data hanya mencakup atribut yang tersedia dalam ERD final.
- Hak akses administrasi tidak dapat digunakan oleh pengguna dengan peran lain.

---

# 6. COULD HAVE FEATURES

Kategori Could Have digunakan untuk fitur tambahan yang dapat dipertimbangkan apabila terdapat waktu dan sumber daya yang mencukupi.

Untuk versi proyek LetsOrder.com saat ini, belum ditetapkan fitur tambahan pada kategori ini.

Penetapan tersebut dilakukan dengan mempertimbangkan bahwa:

1. Fitur utama pemesanan dan self-pickup harus menjadi fokus pengembangan.
2. Fitur pendukung yang sudah teridentifikasi telah ditempatkan pada kategori Should Have.
3. Penambahan fitur baru harus melalui evaluasi ruang lingkup dan kesesuaian ERD.
4. Fitur tambahan tidak boleh mengganggu penyelesaian kebutuhan utama proyek.

Fitur baru dapat dimasukkan ke kategori Could Have apabila telah memperoleh persetujuan tim dan tidak bertentangan dengan batasan proyek.

---

# 7. WON'T HAVE FEATURES

Kategori Won't Have berisi fitur yang secara sengaja tidak dikembangkan dalam versi proyek saat ini.

Fitur berikut telah ditetapkan sebagai bagian dari Out of Scope pada PRD.

| ID | Fitur | Alasan Tidak Dikembangkan |
|---|---|---|
| WH-01 | Native Android Application | Pengembangan difokuskan pada aplikasi berbasis web. |
| WH-02 | Native iOS Application | Pengembangan difokuskan pada aplikasi berbasis web. |
| WH-03 | Food Delivery Service | Sistem menggunakan mekanisme self-pickup. |
| WH-04 | Real Payment Gateway Integration | Pembayaran hanya berupa simulasi. |
| WH-05 | Advanced Vendor Financial Reporting | Bukan fokus utama pengembangan proyek. |
| WH-06 | Raw Material Inventory Management | Sistem hanya berfokus pada informasi menu dan pesanan. |
| WH-07 | Multiple Staff Management per Tenant | Tidak termasuk kebutuhan versi proyek saat ini. |
| WH-08 | Multi-Campus Support | Implementasi difokuskan pada Kantin UPNVJ. |

Fitur tambahan yang tidak tercantum dalam ruang lingkup PRD, seperti promo, rating, ulasan, favorit, dan rekomendasi menu, juga tidak menjadi target pengembangan versi ini.

---

# 8. PRIORITY SUMMARY

## 8.1 Priority Distribution

Distribusi prioritas fitur berdasarkan hasil klasifikasi MoSCoW:

| Kategori | Jumlah Fitur | Persentase |
|---|---:|---:|
| Must Have | 9 | 75% |
| Should Have | 3 | 25% |
| Could Have | 0 | 0% |
| Won't Have | 8 | Tidak dihitung sebagai fitur prioritas implementasi |
| Total Fitur In Scope | 12 | 100% |

## 8.2 Priority Overview

| Prioritas | Feature ID | Nama Fitur |
|---|---|---|
| Must Have | FP-01 | Authentication and User Access |
| Must Have | FP-02 | Menu Catalog |
| Must Have | FP-03 | Menu Management |
| Must Have | FP-04 | Shopping Cart |
| Must Have | FP-05 | Order Management |
| Must Have | FP-06 | Digital Payment Simulation |
| Must Have | FP-07 | Order Tracking |
| Must Have | FP-10 | Tenant Management |
| Must Have | FP-12 | Self-Pickup |
| Should Have | FP-08 | Order History |
| Should Have | FP-09 | Notification |
| Should Have | FP-11 | Administrator Management |

---

# 9. IMPLEMENTATION PRIORITY SEQUENCE

Prioritas fitur juga digunakan untuk menentukan urutan implementasi secara logis berdasarkan hubungan ketergantungan antarf fitur.

| Tahap | Fokus Implementasi | Fitur |
|---|---|---|
| Phase 1 | Fondasi Sistem | Authentication and User Access |
| Phase 2 | Pengelolaan Data Produk | Tenant Management dan Menu Management |
| Phase 3 | Penjelajahan Produk | Menu Catalog |
| Phase 4 | Persiapan Pemesanan | Shopping Cart |
| Phase 5 | Proses Transaksi | Order Management dan Digital Payment Simulation |
| Phase 6 | Proses Pelayanan | Order Tracking dan Self-Pickup |
| Phase 7 | Fitur Pendukung Customer | Order History dan Notification |
| Phase 8 | Administrasi Sistem | Administrator Management |

**Catatan:** Urutan di atas merupakan urutan implementasi berdasarkan dependensi dan alur sistem, bukan jadwal sprint atau pembagian pekerjaan anggota tim.

---

# 10. FEATURE DEPENDENCY

Beberapa fitur memiliki ketergantungan terhadap fitur lainnya. Hubungan tersebut perlu diperhatikan agar implementasi tidak dilakukan secara terbalik.

| Fitur | Bergantung pada | Alasan |
|---|---|---|
| Authentication and User Access | Database USER | Membutuhkan data akun dan peran pengguna. |
| Tenant Management | Authentication and User Access | Pengelolaan tenant membutuhkan identifikasi pengguna dan hak akses. |
| Menu Management | Tenant Management | Menu harus terhubung dengan tenant. |
| Menu Catalog | Tenant Management, Menu Management | Katalog membutuhkan data tenant dan menu. |
| Shopping Cart | Menu Catalog, Authentication and User Access | Customer harus dapat memilih menu dan memiliki keranjang. |
| Order Management | Shopping Cart | Pesanan dibuat berdasarkan item yang dipilih Customer. |
| Digital Payment Simulation | Order Management | Pembayaran harus dikaitkan dengan pesanan. |
| Order Tracking | Order Management | Informasi status berasal dari data pesanan. |
| Self-Pickup | Order Management, Order Tracking | Pengambilan dilakukan setelah pesanan mencapai status siap. |
| Order History | Order Management | Riwayat berasal dari pesanan yang telah dibuat. |
| Notification | Order Management | Notifikasi berkaitan dengan informasi pesanan. |
| Administrator Management | Authentication and User Access | Pengelolaan administrasi membutuhkan hak akses Administrator. |

---

# 11. ALIGNMENT WITH PRD AND ERD

Seluruh prioritas fitur dalam dokumen ini harus tetap konsisten dengan PRD, SRS, dan ERD final LetsOrder.com.

## 11.1 ERD Compatibility

Fitur yang diprioritaskan harus menggunakan struktur database yang telah disepakati.

ERD final terdiri dari 11 entitas:

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

## 11.2 Data Model Constraints

Ketentuan berikut wajib diperhatikan selama implementasi:

- Fitur autentikasi menggunakan data USER.
- Pengelolaan tenant menggunakan data TENANT.
- Katalog dan pengelolaan menu menggunakan data KATEGORI dan MENU.
- Keranjang menggunakan data KERANJANG dan ITEM_KERANJANG.
- Pemesanan menggunakan data PESANAN dan DETAIL_PESANAN.
- Pembayaran menggunakan data PEMBAYARAN.
- Pemantauan status menggunakan data PESANAN dan RIWAYAT_STATUS.
- Notifikasi menggunakan data NOTIFIKASI.
- Self-pickup menggunakan informasi pesanan dan nomor antrean yang sudah tersedia.
- Pengelolaan administrator tidak boleh mengasumsikan adanya atribut status akun atau atribut lain yang belum tersedia dalam ERD.

## 11.3 Change Control

Apabila terdapat usulan fitur baru atau perubahan kebutuhan:

1. Usulan harus dijelaskan berdasarkan kebutuhan pengguna atau tujuan produk.
2. Tim mengevaluasi manfaat dan dampak fitur.
3. Tim memeriksa kesesuaian fitur terhadap PRD dan ruang lingkup proyek.
4. Tim memeriksa kebutuhan data terhadap ERD final.
5. Perubahan prioritas harus memperoleh persetujuan tim.
6. Apabila perubahan memerlukan perubahan ERD, perubahan tersebut harus melalui persetujuan desain database terlebih dahulu.

---

# 12. CONCLUSION

Prioritisasi fitur LetsOrder.com menggunakan metode MoSCoW untuk memastikan pengembangan berfokus pada kebutuhan utama produk.

Fitur Must Have menjadi prioritas pertama karena mendukung proses inti pemesanan makanan secara digital, mulai dari autentikasi pengguna, pengelolaan menu, keranjang, pemesanan, pembayaran simulasi, hingga pengambilan makanan secara mandiri.

Fitur Should Have berfungsi sebagai pendukung yang meningkatkan kemudahan penggunaan dan pengelolaan sistem, seperti riwayat pesanan, notifikasi, dan administrasi pengguna.

Sementara itu, fitur Could Have belum ditetapkan untuk versi proyek saat ini karena fokus pengembangan diarahkan pada penyelesaian kebutuhan utama. Fitur Won't Have secara tegas tidak termasuk dalam ruang lingkup implementasi versi ini.

Dengan adanya dokumen ini, tim pengembang memiliki acuan yang lebih terstruktur dalam menentukan urutan pengerjaan, mengelola ruang lingkup, serta memastikan seluruh implementasi tetap konsisten dengan PRD, SRS, dan ERD final LetsOrder.com.

---

# 13. DOCUMENT CHANGE HISTORY

| Version | Date | Description |
|---|---|---|
| 1.0 | 4 November 2026 | Initial draft of Feature Prioritization Document. |

---

**End of Document**