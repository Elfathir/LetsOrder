# Software Requirements Specification (SRS)

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Software Requirements Specification (SRS) |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Platform | Aplikasi Web |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Standar Kualitas | ISO/IEC 25010 |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen Software Requirements Specification (SRS) ini disusun untuk menjelaskan kebutuhan perangkat lunak pada sistem LetsOrder.com, yaitu aplikasi berbasis web yang dirancang untuk mendukung proses pemesanan makanan dan minuman serta pengambilan pesanan secara mandiri (*self-pickup*) di lingkungan kantin Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ).

Dokumen ini menjadi acuan bagi tim pengembang dalam memahami ruang lingkup, fungsi, karakteristik, batasan, dan kebutuhan sistem. Selain itu, SRS digunakan sebagai dasar dalam proses perancangan sistem, implementasi, pengujian, dan evaluasi hasil pengembangan.

## 1.2 Ruang Lingkup Produk

LetsOrder.com merupakan sistem pemesanan makanan dan minuman berbasis web yang memungkinkan pelanggan melihat menu dari tenant kantin, memasukkan produk ke keranjang, membuat pesanan, melakukan simulasi pembayaran digital, serta memantau status pesanan hingga siap diambil.

Sistem menyediakan tiga jenis peran pengguna, yaitu:

1. **Customer:** Pengguna yang dapat melihat menu, mengelola keranjang, membuat pesanan, melakukan simulasi pembayaran, memantau status, dan melihat riwayat pesanan.
2. **Vendor:** Pengelola tenant yang dapat mengelola informasi tenant, menu, ketersediaan produk, serta memproses pesanan yang masuk.
3. **Administrator:** Pengelola sistem yang bertanggung jawab terhadap pengelolaan data pengguna dan tenant sesuai kewenangannya.

Sistem menerapkan mekanisme *self-pickup*, sehingga pelanggan mengambil pesanan secara langsung di tenant berdasarkan nomor antrean yang diberikan oleh sistem. Pembayaran digital hanya disimulasikan melalui metode QRIS atau dompet digital dan tidak menggunakan integrasi *payment gateway* secara nyata.

## 1.3 Definisi, Akronim, dan Istilah

| Istilah | Definisi |
|---|---|
| SRS | Software Requirements Specification, dokumen spesifikasi kebutuhan perangkat lunak. |
| Customer | Pengguna yang melakukan pemesanan makanan atau minuman. |
| Vendor | Pengelola tenant yang menyediakan dan memproses pesanan. |
| Administrator | Pengguna yang mengelola data pengguna dan tenant pada sistem. |
| Tenant | Unit usaha atau penjual makanan dan minuman di lingkungan kantin. |
| Menu | Produk makanan atau minuman yang ditawarkan oleh tenant. |
| Self-Pickup | Mekanisme pengambilan pesanan secara langsung oleh pelanggan di tenant. |
| Nomor Antrean | Nomor yang digunakan untuk mengidentifikasi pesanan dalam proses pengambilan. |
| QRIS | Metode pembayaran berbasis kode QR yang digunakan dalam simulasi pembayaran. |
| ERD | Entity Relationship Diagram, diagram yang menggambarkan struktur dan hubungan entitas basis data. |
| ISO/IEC 25010 | Standar model kualitas produk perangkat lunak. |

## 1.4 Referensi

1. Dokumen ERD final LetsOrder.com sebagai acuan utama struktur dan hubungan basis data.
2. Dokumen perencanaan proyek LetsOrder.com.
3. Rancangan antarmuka pengguna LetsOrder.com pada Figma: https://www.figma.com/design/jla2cJuSfDZCmczXGa5D8g/MMPL_K7?node-id=0-1&t=QOOE6CWTclYWD6Ia
4. ISO/IEC 25010 sebagai referensi karakteristik kualitas perangkat lunak.

## 1.5 Gambaran Umum Dokumen

Dokumen ini terdiri atas beberapa bagian yang menjelaskan kebutuhan sistem secara bertahap. Bagian pertama membahas pendahuluan dan ruang lingkup produk. Bagian kedua menjelaskan gambaran umum sistem, karakteristik pengguna, lingkungan operasional, serta batasan pengembangan. Bagian ketiga menjabarkan kebutuhan antarmuka, kebutuhan fungsional, kebutuhan data, dan kebutuhan nonfungsional sebagai dasar implementasi dan pengujian sistem.

---

# 2. Deskripsi Umum Sistem

## 2.1 Perspektif Produk

LetsOrder.com merupakan aplikasi web yang dikembangkan untuk membantu proses pemesanan makanan dan minuman di lingkungan kantin UPNVJ. Sistem ini menghubungkan pelanggan dengan tenant melalui proses pemesanan digital yang dapat dilakukan sebelum pelanggan datang mengambil pesanannya.

Aplikasi dikembangkan menggunakan arsitektur *client-server*. React digunakan untuk membangun antarmuka pengguna, Laravel digunakan untuk menangani logika dan layanan backend, sedangkan MySQL digunakan sebagai sistem pengelolaan basis data.

Secara umum, interaksi antarkomponen berlangsung sebagai berikut:

1. Pengguna mengakses aplikasi melalui browser.
2. Antarmuka React menampilkan halaman sesuai peran pengguna.
3. Permintaan pengguna diteruskan ke backend Laravel.
4. Laravel memproses permintaan dan berinteraksi dengan database MySQL.
5. Hasil pemrosesan dikirim kembali untuk ditampilkan pada antarmuka aplikasi.

## 2.2 Fungsi Utama Produk

Fungsi utama yang disediakan oleh LetsOrder.com meliputi:

1. **Autentikasi Pengguna:** Memungkinkan pengguna melakukan registrasi dan login sesuai mekanisme autentikasi sistem serta peran yang dimiliki.
2. **Katalog Menu:** Menampilkan daftar tenant dan menu makanan atau minuman yang tersedia.
3. **Pengelolaan Menu:** Memungkinkan vendor mengelola informasi menu, kategori, harga, estimasi waktu, dan ketersediaan.
4. **Keranjang Belanja:** Memungkinkan customer menambahkan, mengubah jumlah, dan menghapus item dari keranjang.
5. **Pemesanan:** Memungkinkan customer membuat pesanan berdasarkan item yang dipilih dari satu tenant.
6. **Simulasi Pembayaran:** Menyediakan proses simulasi pembayaran menggunakan QRIS atau dompet digital.
7. **Pengelolaan Pesanan:** Memungkinkan vendor melihat dan memperbarui status pesanan.
8. **Pelacakan Pesanan:** Memungkinkan customer mengetahui perkembangan status pesanannya.
9. **Riwayat Pesanan:** Menyediakan informasi pesanan yang pernah dibuat oleh customer.
10. **Notifikasi:** Menyampaikan informasi terkait pesanan kepada pengguna.
11. **Pengelolaan Tenant:** Memungkinkan pengelolaan informasi tenant sesuai kewenangan vendor dan administrator.
12. **Pengelolaan Pengguna:** Memungkinkan administrator mengelola data pengguna sesuai kewenangannya.
13. **Self-Pickup:** Mendukung proses pengambilan pesanan secara langsung menggunakan nomor antrean.

## 2.3 Karakteristik Pengguna

Sistem memiliki tiga kategori pengguna dengan karakteristik dan kewenangan yang berbeda.

| Pengguna | Deskripsi | Hak Akses Utama |
|---|---|---|
| Customer | Mahasiswa atau pengguna yang memesan makanan dan minuman. | Melihat katalog, mengelola keranjang, membuat pesanan, melakukan simulasi pembayaran, melihat status, riwayat, dan notifikasi. |
| Vendor | Pengelola tenant kantin. | Mengelola informasi tenant dan menu serta melihat dan memproses pesanan. |
| Administrator | Pengelola sistem. | Mengelola data pengguna dan tenant serta menjalankan fungsi administratif sistem. |

Setiap pengguna hanya dapat mengakses fungsi yang sesuai dengan peran dan kewenangan yang dimilikinya.

## 2.4 Lingkungan Operasional

Lingkungan operasional sistem LetsOrder.com meliputi:

| Komponen | Spesifikasi |
|---|---|
| Platform | Aplikasi berbasis web |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Browser | Browser modern yang mendukung aplikasi web |
| Perangkat Pengguna | Komputer, laptop, tablet, atau smartphone |
| Koneksi | Jaringan internet atau jaringan lokal yang dapat mengakses server aplikasi |

Antarmuka sistem dirancang agar dapat digunakan melalui berbagai ukuran layar, terutama perangkat komputer dan smartphone.

## 2.5 Batasan Sistem

Batasan pengembangan sistem LetsOrder.com adalah sebagai berikut:

1. Sistem dikembangkan sebagai aplikasi berbasis web dan tidak mencakup aplikasi native Android maupun iOS.
2. Sistem hanya mendukung mekanisme pengambilan pesanan secara langsung (*self-pickup*), bukan layanan pengantaran.
3. Pembayaran QRIS dan dompet digital hanya berupa simulasi dan tidak terhubung dengan penyedia layanan pembayaran secara nyata.
4. Satu pesanan hanya dapat berisi menu dari satu tenant.
5. Nomor antrean digunakan sebagai identifikasi pesanan ketika proses pengambilan.
6. Sistem tidak mencakup pengelolaan persediaan bahan baku.
7. Sistem tidak mencakup laporan keuangan vendor tingkat lanjut.
8. Sistem tidak mencakup pengelolaan banyak staf dalam satu tenant.
9. Sistem tidak mencakup pengelolaan tenant untuk berbagai kampus.
10. Pengembangan sistem mengikuti struktur basis data berdasarkan ERD final yang telah ditetapkan.

## 2.6 Asumsi dan Ketergantungan

Pengembangan dan penggunaan sistem didasarkan pada beberapa asumsi berikut:

1. Pengguna memiliki perangkat yang dapat mengakses aplikasi web.
2. Pengguna memiliki koneksi jaringan untuk mengakses aplikasi.
3. Vendor bertanggung jawab memperbarui informasi menu dan ketersediaan produk.
4. Vendor memproses pesanan yang masuk melalui sistem.
5. Customer mengambil pesanan secara langsung di tenant berdasarkan nomor antrean.
6. Proses pembayaran digital hanya digunakan untuk simulasi alur pembayaran.
7. Keberhasilan pengoperasian aplikasi bergantung pada ketersediaan server, backend, dan database.

---

# 3. Kebutuhan Spesifik Sistem

## 3.1 Kebutuhan Antarmuka Eksternal

### 3.1.1 Antarmuka Pengguna

Antarmuka pengguna dirancang agar mudah dipahami dan digunakan oleh Customer, Vendor, dan Administrator. Setiap peran memperoleh tampilan dan fungsi yang sesuai dengan kewenangannya.

Kebutuhan antarmuka meliputi:

1. Halaman autentikasi untuk registrasi dan login.
2. Halaman katalog yang menampilkan tenant dan menu.
3. Halaman detail menu yang menampilkan informasi produk.
4. Halaman keranjang untuk mengelola item pesanan.
5. Halaman checkout dan simulasi pembayaran.
6. Halaman pemantauan status serta riwayat pesanan.
7. Dashboard vendor untuk pengelolaan tenant, menu, dan pesanan.
8. Halaman administrator untuk pengelolaan pengguna dan tenant.
9. Halaman atau komponen notifikasi untuk menampilkan informasi terkait pesanan.

### 3.1.2 Antarmuka Perangkat Keras

Sistem tidak memerlukan perangkat keras khusus. Pengguna dapat mengakses aplikasi melalui perangkat yang memiliki browser dan koneksi jaringan.

Perangkat yang dapat digunakan antara lain:

- Komputer desktop.
- Laptop.
- Tablet.
- Smartphone.

### 3.1.3 Antarmuka Perangkat Lunak

Sistem menggunakan beberapa perangkat lunak utama:

| Perangkat Lunak | Fungsi |
|---|---|
| React | Membangun antarmuka frontend. |
| Laravel | Menangani logika aplikasi dan layanan backend. |
| MySQL | Menyimpan dan mengelola data sistem. |
| Web Browser | Menjalankan dan menampilkan aplikasi kepada pengguna. |

Komunikasi antara frontend dan backend dilakukan melalui layanan API.

### 3.1.4 Antarmuka Komunikasi

Sistem membutuhkan koneksi jaringan untuk pertukaran data antara frontend, backend, dan database.

Kebutuhan komunikasi meliputi:

1. Pertukaran data antara frontend dan backend melalui API.
2. Pengiriman permintaan dan respons menggunakan protokol HTTP atau HTTPS.
3. Komunikasi backend dengan database MySQL untuk proses penyimpanan dan pengambilan data.
4. Penggunaan HTTPS pada lingkungan deployment yang mendukungnya.

## 3.2 Kebutuhan Fungsional

Kebutuhan fungsional menjelaskan fungsi yang harus disediakan oleh sistem untuk memenuhi kebutuhan masing-masing pengguna.

### 3.2.1 Autentikasi dan Hak Akses

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-01 | Sistem harus menyediakan fasilitas registrasi pengguna. | Customer | Must Have |
| FR-02 | Sistem harus menyediakan fasilitas login menggunakan kredensial pengguna. | Customer, Vendor, Administrator | Must Have |
| FR-03 | Sistem harus memvalidasi kredensial pengguna sebelum memberikan akses. | Customer, Vendor, Administrator | Must Have |
| FR-04 | Sistem harus membatasi akses fungsi berdasarkan peran pengguna. | Semua pengguna | Must Have |

### 3.2.2 Katalog dan Pengelolaan Menu

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-05 | Sistem harus menampilkan daftar tenant yang tersedia. | Customer | Must Have |
| FR-06 | Sistem harus menampilkan daftar menu berdasarkan tenant dan kategori. | Customer | Must Have |
| FR-07 | Sistem harus menampilkan detail menu berupa nama, deskripsi, gambar, harga, estimasi waktu, dan ketersediaan. | Customer | Must Have |
| FR-08 | Sistem harus memungkinkan vendor menambahkan menu. | Vendor | Must Have |
| FR-09 | Sistem harus memungkinkan vendor mengubah informasi menu. | Vendor | Must Have |
| FR-10 | Sistem harus memungkinkan vendor menghapus menu sesuai ketentuan sistem. | Vendor | Must Have |
| FR-11 | Sistem harus memungkinkan vendor memperbarui status ketersediaan menu. | Vendor | Must Have |
| FR-12 | Sistem harus memungkinkan pengelolaan informasi tenant oleh pihak yang berwenang. | Vendor, Administrator | Must Have |

### 3.2.3 Keranjang Belanja

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-13 | Sistem harus menyediakan keranjang belanja bagi customer. | Customer | Must Have |
| FR-14 | Sistem harus memungkinkan customer menambahkan menu ke keranjang. | Customer | Must Have |
| FR-15 | Sistem harus memungkinkan customer mengubah jumlah item dalam keranjang. | Customer | Must Have |
| FR-16 | Sistem harus memungkinkan customer menambahkan catatan pada item keranjang. | Customer | Should Have |
| FR-17 | Sistem harus memungkinkan customer menghapus item dari keranjang. | Customer | Must Have |
| FR-18 | Sistem harus menampilkan jumlah item dan total harga keranjang. | Customer | Must Have |
| FR-19 | Sistem harus membatasi satu keranjang pesanan pada menu dari satu tenant dalam satu transaksi pemesanan. | Customer | Must Have |

### 3.2.4 Pengelolaan Pesanan

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-20 | Sistem harus memungkinkan customer membuat pesanan dari item keranjang. | Customer | Must Have |
| FR-21 | Sistem harus menghasilkan nomor antrean untuk setiap pesanan. | Sistem | Must Have |
| FR-22 | Sistem harus menyimpan informasi pesanan, termasuk customer, tenant, nomor antrean, status, total harga, catatan, dan waktu pemesanan. | Sistem | Must Have |
| FR-23 | Sistem harus menyimpan rincian item pada setiap pesanan. | Sistem | Must Have |
| FR-24 | Sistem harus memungkinkan vendor melihat daftar pesanan yang ditujukan kepada tenant miliknya. | Vendor | Must Have |
| FR-25 | Sistem harus memungkinkan vendor memperbarui status pesanan sesuai tahapan pemrosesan. | Vendor | Must Have |
| FR-26 | Sistem harus menampilkan status terbaru pesanan kepada customer. | Customer | Must Have |

### 3.2.5 Simulasi Pembayaran

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-27 | Sistem harus menyediakan pilihan metode pembayaran simulasi QRIS atau dompet digital. | Customer | Must Have |
| FR-28 | Sistem harus menampilkan kode QRIS untuk mendukung simulasi proses pembayaran apabila metode QRIS dipilih. | Customer | Must Have |
| FR-29 | Sistem harus menyimpan informasi pembayaran yang berkaitan dengan pesanan. | Sistem | Must Have |
| FR-30 | Sistem harus menyediakan mekanisme verifikasi status pembayaran dalam lingkungan simulasi. | Sistem, Vendor | Must Have |
| FR-31 | Sistem harus mencatat batas waktu pembayaran dan waktu pembayaran sesuai proses yang berlangsung. | Sistem | Must Have |
| FR-32 | Sistem harus menampilkan informasi status pembayaran kepada customer. | Customer | Must Have |

### 3.2.6 Riwayat Pesanan dan Notifikasi

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-33 | Sistem harus menampilkan riwayat pesanan berdasarkan pengguna yang sedang login. | Customer | Should Have |
| FR-34 | Sistem harus menyimpan perubahan status pesanan beserta waktu perubahannya. | Sistem | Must Have |
| FR-35 | Sistem harus menyediakan notifikasi yang berkaitan dengan pesanan kepada pengguna. | Sistem | Should Have |
| FR-36 | Sistem harus memungkinkan pengguna melihat status baca notifikasi. | Customer, Vendor | Should Have |

### 3.2.7 Self-Pickup

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-37 | Sistem harus menampilkan nomor antrean pada informasi pesanan customer. | Customer | Must Have |
| FR-38 | Sistem harus menampilkan informasi pesanan yang siap diambil. | Customer, Vendor | Must Have |
| FR-39 | Sistem harus mendukung penyelesaian pesanan setelah proses pengambilan dilakukan. | Vendor | Must Have |

### 3.2.8 Pengelolaan Data oleh Administrator

| ID | Kebutuhan Fungsional | Aktor | Prioritas |
|---|---|---|---|
| FR-40 | Sistem harus memungkinkan administrator melihat data pengguna. | Administrator | Should Have |
| FR-41 | Sistem harus memungkinkan administrator mengelola data pengguna sesuai kewenangannya. | Administrator | Should Have |
| FR-42 | Sistem harus memungkinkan administrator melihat dan mengelola data tenant. | Administrator | Should Have |

## 3.3 Kebutuhan Nonfungsional

Kebutuhan nonfungsional menjelaskan karakteristik kualitas dan batasan operasional yang harus diperhatikan selama pengembangan sistem.

### 3.3.1 Performance Efficiency

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-01 | Sistem harus memiliki waktu pemuatan halaman yang cepat. | Target waktu pemuatan halaman kurang dari 2 detik pada kondisi pengujian yang ditetapkan. |
| NFR-02 | Sistem harus memberikan respons terhadap permintaan pengguna secara efisien. | Proses pengambilan dan penyimpanan data tidak boleh menimbulkan keterlambatan yang mengganggu penggunaan normal. |

### 3.3.2 Security

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-03 | Sistem harus melindungi kredensial pengguna. | Password disimpan menggunakan mekanisme hashing yang aman. |
| NFR-04 | Sistem harus menerapkan autentikasi sebelum pengguna mengakses fungsi yang memerlukan login. | Permintaan tanpa autentikasi yang valid tidak memperoleh akses ke fungsi terlindungi. |
| NFR-05 | Sistem harus menerapkan pembatasan akses berdasarkan peran. | Customer, Vendor, dan Administrator hanya dapat mengakses fungsi sesuai kewenangannya. |
| NFR-06 | Sistem harus melakukan validasi terhadap data yang diterima. | Data yang tidak sesuai aturan validasi harus ditolak. |
| NFR-07 | Sistem harus melindungi komunikasi data. | HTTPS digunakan pada lingkungan deployment yang mendukungnya. |

### 3.3.3 Usability

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-08 | Sistem harus memiliki antarmuka yang mudah dipahami. | Navigasi dan fungsi utama dapat dikenali oleh pengguna sesuai perannya. |
| NFR-09 | Sistem harus menampilkan informasi dan pesan kesalahan yang jelas. | Pengguna memperoleh informasi ketika proses berhasil, gagal, atau membutuhkan tindakan lanjutan. |
| NFR-10 | Sistem harus memiliki tampilan yang responsif. | Antarmuka dapat menyesuaikan ukuran layar komputer, tablet, dan smartphone. |

### 3.3.4 Reliability

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-11 | Sistem harus menjaga konsistensi data pesanan. | Data pesanan dan rincian item harus tersimpan secara konsisten. |
| NFR-12 | Sistem harus menjaga konsistensi perubahan status pesanan. | Perubahan status harus tercatat dan dapat ditampilkan sesuai data terbaru. |
| NFR-13 | Sistem harus menangani kegagalan proses secara tepat. | Kegagalan penyimpanan atau pemrosesan tidak boleh dilaporkan sebagai transaksi berhasil. |

### 3.3.5 Compatibility

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-14 | Sistem harus dapat digunakan melalui browser modern. | Fungsi utama aplikasi berjalan pada browser yang menjadi target pengujian. |
| NFR-15 | Sistem harus mendukung berbagai perangkat pengguna. | Tampilan dapat digunakan pada komputer dan perangkat mobile. |

### 3.3.6 Maintainability

| ID | Kebutuhan | Kriteria |
|---|---|---|
| NFR-16 | Kode frontend dan backend harus memiliki struktur yang terorganisasi. | Pengembangan mengikuti pemisahan komponen dan tanggung jawab aplikasi. |
| NFR-17 | Sistem harus memiliki dokumentasi teknis. | Dokumentasi mencakup struktur aplikasi, database, dan API. |
| NFR-18 | Sistem harus dapat diuji secara terstruktur. | Pengujian dilakukan terhadap fungsi utama dan integrasi antarkomponen. |

## 3.4 Kebutuhan Data dan Basis Data

### 3.4.1 Ketentuan Umum

Sistem menggunakan MySQL sebagai basis data utama. Struktur data mengikuti ERD final LetsOrder.com yang telah ditetapkan. Seluruh proses penyimpanan, pembaruan, penghapusan, dan pengambilan data harus mengikuti hubungan antarentitas serta aturan integritas referensial yang telah dirancang.

Sistem memiliki tepat sebelas entitas utama sebagai berikut.

### 3.4.2 Daftar Entitas

| No. | Entitas | Fungsi |
|---|---|---|
| 1 | USER | Menyimpan informasi akun pengguna dan perannya. |
| 2 | TENANT | Menyimpan informasi tenant yang dikelola oleh pengguna dengan peran vendor. |
| 3 | KATEGORI | Menyimpan kategori menu. |
| 4 | MENU | Menyimpan informasi makanan atau minuman yang ditawarkan tenant. |
| 5 | KERANJANG | Menyimpan data keranjang milik customer. |
| 6 | ITEM_KERANJANG | Menyimpan item dan jumlah menu dalam keranjang. |
| 7 | PESANAN | Menyimpan informasi utama transaksi pemesanan. |
| 8 | DETAIL_PESANAN | Menyimpan rincian menu dalam setiap pesanan. |
| 9 | PEMBAYARAN | Menyimpan informasi pembayaran simulasi untuk pesanan. |
| 10 | RIWAYAT_STATUS | Menyimpan riwayat perubahan status pesanan. |
| 11 | NOTIFIKASI | Menyimpan pesan notifikasi yang berkaitan dengan pengguna dan pesanan. |

### 3.4.3 Ketentuan Pengelolaan Data

1. Setiap pengguna memiliki identitas dan peran yang digunakan dalam pengaturan hak akses.
2. Data tenant berhubungan dengan pengguna yang mengelolanya.
3. Setiap menu berhubungan dengan tenant dan kategori.
4. Keranjang berhubungan dengan customer yang memilikinya.
5. Item keranjang mengacu pada menu yang dipilih.
6. Setiap pesanan berhubungan dengan satu customer dan satu tenant.
7. Rincian pesanan mengacu pada menu yang dipesan.
8. Data pembayaran berhubungan dengan pesanan yang dibayarkan.
9. Riwayat status berhubungan dengan pesanan yang mengalami perubahan status.
10. Notifikasi berhubungan dengan pengguna dan pesanan terkait.

### 3.4.4 Aturan Integritas Data

1. Setiap entitas harus memiliki primary key sesuai ERD.
2. Hubungan antartabel harus mengikuti foreign key yang telah ditetapkan.
3. Data yang memiliki hubungan referensial harus divalidasi sebelum proses perubahan dilakukan.
4. Jumlah item pesanan harus bernilai sesuai aturan validasi sistem.
5. Nilai total pesanan harus sesuai dengan hasil perhitungan item yang dipesan.
6. Data pesanan harus memiliki keterkaitan dengan customer dan tenant.
7. Proses perubahan status pesanan harus dicatat pada entitas RIWAYAT_STATUS.
8. Data pembayaran harus mengacu pada pesanan yang sesuai.

---

# 4. Aturan Bisnis Sistem

Aturan bisnis merupakan ketentuan yang harus diikuti dalam pelaksanaan proses utama LetsOrder.com.

| ID | Aturan Bisnis |
|---|---|
| BR-01 | Pengguna harus melakukan login sebelum mengakses fungsi yang memerlukan autentikasi. |
| BR-02 | Setiap pengguna memiliki peran yang menentukan hak aksesnya. |
| BR-03 | Vendor hanya dapat mengelola tenant dan data yang berada dalam kewenangannya. |
| BR-04 | Customer hanya dapat membuat pesanan dari menu yang tersedia. |
| BR-05 | Satu transaksi pemesanan hanya dapat berasal dari satu tenant. |
| BR-06 | Sistem menghasilkan nomor antrean untuk setiap pesanan. |
| BR-07 | Total harga pesanan dihitung berdasarkan jumlah dan harga menu yang dipilih sesuai data sistem. |
| BR-08 | Pembayaran menggunakan QRIS atau dompet digital hanya disimulasikan. |
| BR-09 | Status pembayaran dan status pesanan merupakan informasi yang berbeda dan dikelola sesuai proses masing-masing. |
| BR-10 | Vendor bertanggung jawab memperbarui status pesanan selama proses persiapan hingga pesanan selesai. |
| BR-11 | Customer mengambil pesanan secara langsung di tenant menggunakan nomor antrean. |
| BR-12 | Perubahan status pesanan harus tercatat dalam riwayat status. |

---

# 5. Kriteria Penerimaan Sistem

Sistem LetsOrder.com dapat dinyatakan memenuhi kebutuhan dasar apabila kriteria berikut telah dipenuhi:

1. Customer dapat melakukan registrasi dan login sesuai mekanisme yang tersedia.
2. Customer dapat melihat daftar tenant dan menu yang tersedia.
3. Customer dapat menambahkan menu ke keranjang dan mengelola item pesanan.
4. Customer dapat membuat pesanan dari satu tenant.
5. Sistem dapat menghasilkan nomor antrean untuk pesanan.
6. Sistem dapat menjalankan simulasi pembayaran QRIS atau dompet digital.
7. Vendor dapat melihat pesanan yang masuk dan memperbarui statusnya.
8. Customer dapat melihat perkembangan status pesanan.
9. Sistem dapat menyimpan riwayat perubahan status pesanan.
10. Sistem dapat menampilkan notifikasi terkait pesanan.
11. Customer dapat mengambil pesanan secara langsung di tenant.
12. Administrator dapat mengelola data pengguna dan tenant sesuai kewenangannya.
13. Struktur basis data sesuai dengan ERD final yang terdiri atas sebelas entitas.
14. Target waktu pemuatan halaman kurang dari dua detik dapat dicapai pada kondisi pengujian yang ditetapkan.
15. Sistem dapat digunakan melalui browser modern dan berbagai ukuran layar perangkat.

---

# 6. Batasan dan Pengendalian Perubahan Kebutuhan

## 6.1 Batasan Perubahan

Perubahan kebutuhan sistem harus mempertimbangkan ruang lingkup proyek, kemampuan tim, serta konsistensi rancangan sistem. Setiap perubahan harus dievaluasi sebelum diterapkan agar tidak menimbulkan ketidaksesuaian antara kebutuhan, desain, implementasi, dan pengujian.

## 6.2 Pengendalian Perubahan

Proses pengendalian perubahan kebutuhan dilakukan melalui tahapan berikut:

1. Mengidentifikasi kebutuhan atau perubahan yang diajukan.
2. Menjelaskan alasan dan tujuan perubahan.
3. Mengevaluasi dampaknya terhadap fungsi, desain, database, jadwal, dan pengujian.
4. Memastikan perubahan memperoleh persetujuan tim yang berwenang.
5. Memperbarui dokumen terkait apabila perubahan disetujui.
6. Memastikan implementasi dan pengujian mengikuti kebutuhan terbaru.

## 6.3 Konsistensi dengan ERD

ERD final merupakan acuan utama dalam penentuan struktur data sistem. Oleh karena itu, implementasi kebutuhan tidak boleh secara sepihak menambahkan entitas, atribut, atau hubungan baru yang tidak terdapat dalam ERD.

Apabila terdapat kebutuhan baru yang mengharuskan perubahan struktur basis data, perubahan tersebut harus melalui proses evaluasi dan persetujuan sebelum ERD maupun dokumen kebutuhan diperbarui.

---

# 7. Penutup

Dokumen Software Requirements Specification (SRS) ini menjadi acuan utama dalam pengembangan sistem LetsOrder.com. Seluruh kebutuhan yang dijelaskan di dalamnya digunakan sebagai pedoman untuk proses perancangan, implementasi, pengujian, dan evaluasi sistem.

Dengan adanya spesifikasi kebutuhan yang terstruktur, diharapkan pengembangan LetsOrder.com dapat berjalan sesuai tujuan proyek, memenuhi kebutuhan Customer, Vendor, dan Administrator, serta tetap konsisten dengan ruang lingkup dan rancangan basis data yang telah ditetapkan.

Dokumen ini dapat diperbarui apabila terdapat perubahan kebutuhan yang telah disepakati oleh tim proyek.