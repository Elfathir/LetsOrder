# Project Scope — LetsOrder.com

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Project Scope menjelaskan ruang lingkup pekerjaan dalam pengembangan LetsOrder.com. Dokumen ini digunakan untuk menentukan batas fitur, aktivitas pengembangan, hasil yang diharapkan, serta hal-hal yang tidak menjadi bagian dari proyek.

Penetapan ruang lingkup bertujuan agar proses pengembangan tetap berfokus pada kebutuhan utama sistem pemesanan dan self-pickup digital untuk Kantin UPNVJ. Dokumen ini juga menjadi acuan dalam mengendalikan perubahan kebutuhan selama proyek berlangsung.

### 1.2 Deskripsi Singkat Proyek

LetsOrder.com merupakan aplikasi berbasis web yang dikembangkan untuk membantu proses pemesanan makanan di Kantin UPNVJ. Sistem memungkinkan customer melihat katalog menu, memilih makanan, mengelola keranjang, membuat pesanan, melakukan simulasi pembayaran digital, serta memantau perkembangan pesanan sebelum mengambilnya secara langsung di tenant.

Sistem juga menyediakan fasilitas bagi vendor untuk mengelola informasi tenant, menu, dan pesanan. Administrator memiliki akses untuk mengelola informasi pengguna dan tenant sesuai kewenangannya.

## 2. Ruang Lingkup Proyek

### 2.1 In Scope

Berikut merupakan pekerjaan dan fungsi yang termasuk dalam pengembangan LetsOrder.com.

| ID | Ruang Lingkup | Deskripsi |
|---|---|---|
| IS-01 | Authentication | Menyediakan registrasi, login, dan akses sistem berdasarkan peran pengguna. |
| IS-02 | Menu Catalog | Menampilkan daftar tenant, kategori, dan informasi menu yang tersedia. |
| IS-03 | Menu Management | Menyediakan pengelolaan kategori dan informasi menu oleh vendor sesuai kewenangannya. |
| IS-04 | Shopping Cart | Menyediakan fasilitas untuk menambahkan, mengubah jumlah, memberikan catatan, dan menghapus item keranjang. |
| IS-05 | Order Management | Menyediakan proses pembuatan dan pengelolaan pesanan. |
| IS-06 | Digital Payment Simulation | Menyediakan simulasi pembayaran digital menggunakan QRIS tanpa transaksi keuangan sungguhan. |
| IS-07 | Order Tracking | Menyediakan informasi status dan perkembangan pesanan. |
| IS-08 | Order History | Menampilkan daftar serta detail riwayat pesanan customer. |
| IS-09 | Notification | Menyediakan notifikasi terkait pesanan dan status baca notifikasi. |
| IS-10 | Tenant Management | Menyediakan pengelolaan informasi tenant, termasuk nama, deskripsi, logo, dan status buka. |
| IS-11 | Administrator Management | Menyediakan pengelolaan data pengguna dan tenant oleh administrator sesuai kewenangannya. |
| IS-12 | Self-Pickup | Mendukung pengambilan pesanan secara langsung di tenant menggunakan nomor antrean. |

### 2.2 Out of Scope

Berikut merupakan fitur dan pekerjaan yang tidak termasuk dalam pengembangan proyek:

| ID | Ruang Lingkup yang Dikecualikan | Alasan |
|---|---|---|
| OS-01 | Aplikasi native Android | Pengembangan difokuskan pada aplikasi berbasis web. |
| OS-02 | Aplikasi native iOS | Pengembangan difokuskan pada aplikasi berbasis web. |
| OS-03 | Layanan pengantaran makanan | Sistem menggunakan mekanisme self-pickup. |
| OS-04 | Integrasi payment gateway sungguhan | Pembayaran hanya berupa simulasi digital. |
| OS-05 | Laporan keuangan vendor tingkat lanjut | Tidak termasuk kebutuhan utama sistem. |
| OS-06 | Pengelolaan stok bahan baku | Sistem berfokus pada informasi menu dan pemesanan. |
| OS-07 | Pengelolaan beberapa staf dalam satu tenant | Pengelolaan tenant mengikuti struktur pengguna yang telah ditetapkan. |
| OS-08 | Dukungan operasional banyak kampus | Sistem difokuskan pada Kantin UPNVJ. |
| OS-09 | Fitur promo dan diskon | Tidak termasuk dalam rancangan ERD final. |
| OS-10 | Rating dan ulasan menu | Tidak termasuk dalam rancangan ERD final. |
| OS-11 | Fitur favorit dan rekomendasi menu | Tidak termasuk dalam ruang lingkup produk. |

## 3. Ruang Lingkup Berdasarkan Aktor

### 3.1 Customer

Customer merupakan pengguna yang melakukan pemesanan makanan melalui sistem.

Ruang lingkup fungsi customer:
- Melakukan registrasi dan login.
- Melihat daftar tenant dan katalog menu.
- Melihat informasi detail menu.
- Menambahkan menu ke keranjang.
- Mengubah jumlah dan catatan item keranjang.
- Membuat pesanan.
- Melakukan simulasi pembayaran digital.
- Melihat status dan riwayat pesanan.
- Melihat notifikasi terkait pesanan.
- Mengambil pesanan secara langsung menggunakan nomor antrean.

### 3.2 Vendor

Vendor merupakan pihak yang mengelola tenant dan menerima pesanan dari customer.

Ruang lingkup fungsi vendor:
- Melakukan login.
- Melihat dan mengelola informasi tenant.
- Mengelola kategori menu sesuai kewenangannya.
- Menambahkan, mengubah, dan menghapus informasi menu.
- Mengatur status ketersediaan menu.
- Melihat pesanan yang ditujukan kepada tenant miliknya.
- Memperbarui status pesanan sesuai alur yang ditetapkan.

### 3.3 Administrator

Administrator merupakan pengguna yang bertanggung jawab atas pengelolaan data sistem sesuai kewenangannya.

Ruang lingkup fungsi administrator:
- Melakukan login.
- Melihat informasi pengguna.
- Mengelola data pengguna sesuai aturan sistem.
- Melihat informasi tenant.
- Mengelola data tenant sesuai kewenangannya.

## 4. Ruang Lingkup Teknis

### 4.1 Teknologi yang Digunakan

| Komponen | Teknologi | Ruang Lingkup Penggunaan |
|---|---|---|
| Frontend | React | Membangun antarmuka dan interaksi pengguna. |
| Backend | Laravel | Mengelola logika aplikasi dan komunikasi dengan database. |
| Database | MySQL | Menyimpan dan mengelola data sistem. |

### 4.2 Ruang Lingkup Database

Struktur database menggunakan ERD final yang telah ditetapkan dengan sebelas entitas berikut:

| No. | Entitas | Fungsi dalam Sistem |
|---:|---|---|
| 1 | USER | Menyimpan informasi akun dan peran pengguna. |
| 2 | TENANT | Menyimpan informasi tenant kantin. |
| 3 | KATEGORI | Menyimpan kategori menu. |
| 4 | MENU | Menyimpan informasi menu yang ditawarkan tenant. |
| 5 | KERANJANG | Menyimpan informasi keranjang milik pengguna. |
| 6 | ITEM_KERANJANG | Menyimpan item menu yang dimasukkan ke keranjang. |
| 7 | PESANAN | Menyimpan informasi utama pesanan. |
| 8 | DETAIL_PESANAN | Menyimpan rincian menu dalam pesanan. |
| 9 | PEMBAYARAN | Menyimpan informasi simulasi pembayaran. |
| 10 | RIWAYAT_STATUS | Menyimpan perubahan status pesanan. |
| 11 | NOTIFIKASI | Menyimpan informasi notifikasi pengguna. |

Seluruh fungsi yang dikembangkan harus menggunakan atribut dan relasi yang tersedia pada ERD tersebut. Pengembangan tidak mencakup penambahan entitas, atribut, atau relasi baru tanpa adanya perubahan rancangan yang disetujui secara resmi.

### 4.3 Ketentuan Implementasi

Beberapa ketentuan teknis yang perlu diperhatikan:
1. Sistem dikembangkan sebagai aplikasi berbasis web.
2. Frontend menggunakan React dan backend menggunakan Laravel.
3. Database menggunakan MySQL.
4. Hak akses pengguna dibedakan berdasarkan peran.
5. Satu pesanan hanya berkaitan dengan satu tenant.
6. Identifikasi pengambilan pesanan menggunakan nomor antrean yang tersedia pada data pesanan.
7. Pembayaran digital hanya berupa simulasi.
8. Sistem tidak menyediakan layanan pengantaran makanan.

## 5. Deliverables Proyek

Deliverables merupakan hasil pekerjaan yang diharapkan tersedia selama dan setelah proses pengembangan.

| ID | Deliverable | Deskripsi |
|---|---|---|
| DLV-01 | Product Documentation | Dokumen kebutuhan dan perencanaan produk, termasuk PRD, Product Vision, Product Roadmap, dan User Stories. |
| DLV-02 | Project Documentation | Dokumen latar belakang, tujuan, ruang lingkup, dan pengelolaan proyek. |
| DLV-03 | Requirements Documentation | Dokumen SRS dan spesifikasi kebutuhan sistem. |
| DLV-04 | System Design Documentation | Dokumen arsitektur sistem, rancangan database, API, dan pedoman UI/UX. |
| DLV-05 | Database Implementation | Implementasi database MySQL berdasarkan ERD final. |
| DLV-06 | Frontend Application | Aplikasi antarmuka berbasis React. |
| DLV-07 | Backend Application | Implementasi layanan dan logika sistem menggunakan Laravel. |
| DLV-08 | Testing Documentation | Dokumen rencana pengujian, test cases, test scenarios, dan test report. |
| DLV-09 | Deployment Documentation | Panduan instalasi, konfigurasi lingkungan, dan deployment. |
| DLV-10 | User Documentation | Panduan penggunaan sistem untuk customer, vendor, dan administrator. |

## 6. Batasan dan Asumsi Proyek

### 6.1 Batasan Proyek

Pengembangan LetsOrder.com memiliki batasan sebagai berikut:
- Sistem hanya dikembangkan untuk kebutuhan Kantin UPNVJ.
- Sistem berbentuk aplikasi web.
- Pembayaran hanya menggunakan simulasi digital.
- Pengambilan pesanan dilakukan secara mandiri oleh customer.
- Sistem tidak menyediakan layanan pengantaran.
- Struktur database mengikuti ERD final.
- Fitur yang dikembangkan harus sesuai dengan PRD dan prioritas yang telah ditentukan.

### 6.2 Asumsi Proyek

Pengembangan proyek menggunakan asumsi berikut:
1. Customer, vendor, dan administrator memiliki akses terhadap perangkat yang dapat menjalankan aplikasi web.
2. Pengguna memiliki koneksi internet untuk mengakses sistem.
3. Vendor bersedia memperbarui informasi menu dan status pesanan melalui sistem.
4. Informasi tenant dan menu yang dimasukkan ke sistem disediakan oleh pihak yang berwenang.
5. Proses pengambilan makanan dilakukan secara langsung di tenant terkait.
6. Simulasi pembayaran digunakan untuk merepresentasikan alur pembayaran dalam pengembangan dan pengujian sistem.

## 7. Pengendalian Perubahan Ruang Lingkup

Setiap usulan perubahan ruang lingkup perlu diperiksa sebelum diterapkan. Pemeriksaan dilakukan untuk memastikan perubahan tersebut sesuai dengan tujuan proyek, kebutuhan pengguna, prioritas fitur, dan struktur database.

Tahapan pengendalian perubahan meliputi:

1. **Pengajuan perubahan:** Usulan perubahan disampaikan dengan menjelaskan kebutuhan dan alasan perubahan.
2. **Analisis dampak:** Tim menilai dampak perubahan terhadap fitur, waktu pengerjaan, dokumentasi, dan database.
3. **Pemeriksaan kesesuaian:** Usulan dibandingkan dengan PRD, SRS, Feature Prioritization, dan ERD final.
4. **Persetujuan:** Perubahan hanya diterapkan setelah memperoleh persetujuan pihak yang berwenang.
5. **Pembaruan dokumentasi:** Dokumen terkait diperbarui apabila perubahan telah disetujui.

Perubahan yang membutuhkan entitas, atribut, atau relasi database baru tidak boleh langsung diterapkan karena ERD telah ditetapkan sebagai rancangan final proyek.

## 8. Kriteria Penyelesaian Ruang Lingkup

Ruang lingkup proyek dapat dinyatakan terpenuhi apabila:
1. Fitur yang termasuk dalam ruang lingkup telah diimplementasikan sesuai prioritas.
2. Fungsi utama customer, vendor, dan administrator dapat dijalankan sesuai kewenangannya.
3. Proses pemesanan, simulasi pembayaran, pelacakan, dan self-pickup dapat diuji.
4. Database telah sesuai dengan sebelas entitas pada ERD final.
5. Pengujian telah dilakukan dan hasilnya terdokumentasi.
6. Dokumentasi teknis dan panduan pengguna telah disiapkan.
7. Tidak terdapat fitur di luar ruang lingkup yang diterapkan tanpa persetujuan perubahan.

## 9. Penutup

Project Scope menjadi acuan dalam menentukan batas pengembangan LetsOrder.com agar pekerjaan tetap berfokus pada kebutuhan pemesanan makanan dan self-pickup di Kantin UPNVJ. Ruang lingkup mencakup pengembangan fungsi customer, vendor, dan administrator, implementasi aplikasi web, database, pengujian, serta dokumentasi.

Dengan batasan yang telah ditetapkan, proses pengembangan diharapkan berjalan lebih terarah dan setiap hasil pekerjaan dapat diperiksa berdasarkan kebutuhan serta deliverables yang telah disepakati.