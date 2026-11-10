# User Requirements

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | User Requirements |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi | Software Requirements Specification (SRS) |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen User Requirements disusun untuk menjelaskan kebutuhan sistem berdasarkan sudut pandang pengguna LetsOrder.com. Dokumen ini menggambarkan fungsi yang dibutuhkan setiap pengguna dalam menjalankan aktivitasnya melalui aplikasi.

Kebutuhan pengguna dikelompokkan berdasarkan peran Customer, Vendor, dan Administrator. Setiap kebutuhan dilengkapi dengan deskripsi dan hasil yang diharapkan agar dapat menjadi acuan dalam perancangan antarmuka, implementasi fitur, serta pengujian sistem.

## 1.2 Ruang Lingkup

Dokumen ini mencakup kebutuhan pengguna dalam menjalankan aktivitas utama sistem, yaitu:

1. Mengakses aplikasi dan menggunakan akun.
2. Melihat informasi tenant dan katalog menu.
3. Mengelola keranjang dan membuat pesanan.
4. Melakukan simulasi pembayaran.
5. Memantau status dan riwayat pesanan.
6. Mengelola tenant dan menu.
7. Memproses pesanan dan mendukung pengambilan secara langsung.
8. Mengelola data pengguna dan tenant sesuai kewenangan administrator.

## 1.3 Kategori Pengguna

| Pengguna | Deskripsi |
|---|---|
| Customer | Pengguna yang memesan makanan atau minuman melalui aplikasi. |
| Vendor | Pengelola tenant yang menyediakan menu dan memproses pesanan. |
| Administrator | Pengelola sistem yang bertanggung jawab terhadap pengelolaan data pengguna dan tenant. |

---

# 2. Kebutuhan Customer

Customer merupakan pengguna yang menggunakan LetsOrder.com untuk mencari menu, melakukan pemesanan, dan mengambil pesanan secara langsung di tenant.

## 2.1 Kebutuhan Akses Akun

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-CUS-01 | Registrasi akun | Customer membutuhkan fasilitas untuk membuat akun baru. | Customer memiliki akun yang dapat digunakan untuk mengakses sistem. |
| UR-CUS-02 | Login akun | Customer membutuhkan fasilitas login menggunakan kredensial akun. | Customer dapat masuk ke aplikasi. |
| UR-CUS-03 | Akses sesuai peran | Customer membutuhkan akses terhadap fungsi yang disediakan untuk pelanggan. | Customer dapat menggunakan fitur sesuai kewenangannya. |

## 2.2 Kebutuhan Informasi Tenant dan Menu

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-CUS-04 | Melihat daftar tenant | Customer membutuhkan informasi tenant yang tersedia di kantin. | Customer dapat mengetahui tenant yang dapat dipilih. |
| UR-CUS-05 | Melihat katalog menu | Customer membutuhkan daftar makanan dan minuman yang ditawarkan tenant. | Customer dapat melihat menu berdasarkan tenant dan kategori. |
| UR-CUS-06 | Melihat detail menu | Customer membutuhkan informasi nama, deskripsi, gambar, harga, estimasi waktu, dan ketersediaan menu. | Customer dapat memahami informasi produk sebelum memesan. |

## 2.3 Kebutuhan Keranjang dan Pemesanan

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-CUS-07 | Menambahkan menu ke keranjang | Customer membutuhkan fasilitas untuk memilih dan memasukkan menu ke keranjang. | Menu yang dipilih tersimpan dalam keranjang. |
| UR-CUS-08 | Mengubah jumlah menu | Customer membutuhkan fasilitas untuk menyesuaikan jumlah menu yang dipesan. | Jumlah item dalam keranjang dapat diperbarui. |
| UR-CUS-09 | Menambahkan catatan item | Customer membutuhkan fasilitas untuk memberikan catatan pada item pesanan. | Catatan tersimpan bersama item keranjang. |
| UR-CUS-10 | Menghapus item | Customer membutuhkan fasilitas untuk menghapus menu yang tidak jadi dipesan. | Item yang dipilih dihapus dari keranjang. |
| UR-CUS-11 | Melihat total harga | Customer membutuhkan informasi jumlah item dan total harga sebelum membuat pesanan. | Customer dapat mengetahui total biaya pesanan. |
| UR-CUS-12 | Membuat pesanan | Customer membutuhkan fasilitas untuk mengirimkan pesanan berdasarkan menu dalam keranjang. | Pesanan berhasil dibuat dan tersimpan dalam sistem. |
| UR-CUS-13 | Mendapatkan nomor antrean | Customer membutuhkan nomor antrean setelah pesanan berhasil dibuat. | Customer memiliki nomor antrean untuk mengidentifikasi pesanannya. |

## 2.4 Kebutuhan Pembayaran

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-CUS-14 | Memilih metode pembayaran | Customer membutuhkan pilihan pembayaran simulasi melalui QRIS atau dompet digital. | Customer dapat memilih metode pembayaran yang tersedia. |
| UR-CUS-15 | Melihat kode QRIS | Customer membutuhkan kode QRIS simulasi ketika memilih metode tersebut. | Customer dapat melihat kode QRIS untuk mengikuti alur simulasi. |
| UR-CUS-16 | Melihat informasi pembayaran | Customer membutuhkan informasi total pembayaran, metode, dan status verifikasi. | Customer mengetahui informasi pembayaran pesanannya. |

## 2.5 Kebutuhan Pelacakan dan Pengambilan Pesanan

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-CUS-17 | Memantau status pesanan | Customer membutuhkan informasi perkembangan pesanan. | Customer dapat mengetahui status terbaru pesanan. |
| UR-CUS-18 | Melihat riwayat pesanan | Customer membutuhkan akses terhadap daftar pesanan yang pernah dibuat. | Customer dapat melihat informasi pesanan sebelumnya. |
| UR-CUS-19 | Melihat notifikasi | Customer membutuhkan pemberitahuan terkait perkembangan pesanan. | Customer memperoleh informasi pesanan melalui notifikasi sistem. |
| UR-CUS-20 | Mengambil pesanan | Customer membutuhkan informasi nomor antrean dan status siap diambil. | Customer dapat mengambil pesanan secara langsung di tenant. |
| UR-CUS-21 | Mengetahui penyelesaian pesanan | Customer membutuhkan informasi ketika pesanan telah selesai diproses dan diambil. | Customer dapat mengetahui bahwa pesanannya telah selesai. |

---

# 3. Kebutuhan Vendor

Vendor merupakan pengguna yang mengelola tenant, menyediakan informasi menu, serta bertanggung jawab memproses pesanan yang diterima melalui LetsOrder.com.

## 3.1 Kebutuhan Akses Akun

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-VEN-01 | Login akun | Vendor membutuhkan fasilitas login untuk mengakses dashboard pengelolaan tenant. | Vendor dapat masuk ke sistem. |
| UR-VEN-02 | Akses sesuai kewenangan | Vendor membutuhkan akses terhadap data dan fungsi tenant yang dikelolanya. | Vendor hanya dapat mengelola data sesuai kewenangannya. |

## 3.2 Kebutuhan Pengelolaan Tenant dan Menu

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-VEN-03 | Melihat informasi tenant | Vendor membutuhkan akses terhadap informasi tenant yang dikelolanya. | Informasi tenant dapat ditampilkan. |
| UR-VEN-04 | Memperbarui informasi tenant | Vendor membutuhkan fasilitas untuk memperbarui informasi tenant sesuai kewenangannya. | Informasi tenant dapat diperbarui. |
| UR-VEN-05 | Menambahkan menu | Vendor membutuhkan fasilitas untuk memasukkan menu baru ke dalam katalog tenant. | Menu baru tersimpan dan dapat ditampilkan. |
| UR-VEN-06 | Mengubah informasi menu | Vendor membutuhkan fasilitas untuk memperbarui informasi menu. | Informasi menu dapat diperbarui. |
| UR-VEN-07 | Menghapus menu | Vendor membutuhkan fasilitas untuk menghapus menu sesuai ketentuan sistem. | Menu dapat dihapus apabila tidak melanggar integritas data. |
| UR-VEN-08 | Mengubah ketersediaan menu | Vendor membutuhkan fasilitas untuk memperbarui status ketersediaan menu. | Customer dapat melihat status ketersediaan terbaru. |

## 3.3 Kebutuhan Pengelolaan Pesanan

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-VEN-09 | Melihat pesanan masuk | Vendor membutuhkan daftar pesanan yang ditujukan kepada tenant miliknya. | Vendor dapat melihat pesanan yang perlu diproses. |
| UR-VEN-10 | Melihat detail pesanan | Vendor membutuhkan informasi rincian menu, jumlah, subtotal, dan nomor antrean. | Vendor dapat memahami isi pesanan. |
| UR-VEN-11 | Memperbarui status pesanan | Vendor membutuhkan fasilitas untuk memperbarui perkembangan pesanan. | Status pesanan dapat diperbarui dan dicatat dalam riwayat. |
| UR-VEN-12 | Melihat pesanan siap diambil | Vendor membutuhkan informasi pesanan yang telah selesai disiapkan. | Vendor dapat mengetahui pesanan yang menunggu pengambilan. |
| UR-VEN-13 | Menyelesaikan pesanan | Vendor membutuhkan fasilitas untuk memperbarui status setelah pesanan diambil customer. | Pesanan tercatat sebagai selesai. |

## 3.4 Kebutuhan Pembayaran dan Notifikasi

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-VEN-14 | Melihat informasi pembayaran | Vendor membutuhkan informasi metode dan status verifikasi pembayaran terkait pesanan. | Vendor dapat mengetahui status pembayaran sesuai data sistem. |
| UR-VEN-15 | Melihat notifikasi | Vendor membutuhkan informasi notifikasi yang berkaitan dengan aktivitas pesanan. | Vendor dapat mengetahui informasi pesanan yang diterima melalui sistem. |
| UR-VEN-16 | Mengetahui status baca notifikasi | Vendor membutuhkan informasi status baca notifikasi. | Vendor dapat membedakan notifikasi yang sudah dibaca dan belum dibaca. |

---

# 4. Kebutuhan Administrator

Administrator merupakan pengguna yang bertanggung jawab terhadap pengelolaan data pengguna dan tenant serta memastikan fungsi administratif sistem dapat dijalankan sesuai kewenangannya.

## 4.1 Kebutuhan Akses Akun

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-ADM-01 | Login administrator | Administrator membutuhkan fasilitas login untuk mengakses fungsi pengelolaan sistem. | Administrator dapat masuk ke sistem. |
| UR-ADM-02 | Akses administratif | Administrator membutuhkan akses terhadap fungsi administratif sesuai perannya. | Administrator dapat menjalankan fungsi yang menjadi kewenangannya. |

## 4.2 Kebutuhan Pengelolaan Data

| ID | Kebutuhan Pengguna | Deskripsi | Hasil yang Diharapkan |
|---|---|---|---|
| UR-ADM-03 | Melihat data pengguna | Administrator membutuhkan akses untuk melihat daftar dan informasi pengguna. | Data pengguna dapat ditampilkan sesuai atribut yang tersedia. |
| UR-ADM-04 | Mengelola data pengguna | Administrator membutuhkan fasilitas untuk mengelola informasi pengguna sesuai kewenangannya. | Informasi pengguna dapat diperbarui sesuai ketentuan sistem. |
| UR-ADM-05 | Melihat data tenant | Administrator membutuhkan akses untuk melihat daftar dan informasi tenant. | Data tenant dapat ditampilkan. |
| UR-ADM-06 | Mengelola data tenant | Administrator membutuhkan fasilitas untuk mengelola informasi tenant. | Informasi tenant dapat diperbarui sesuai kewenangannya. |

---

# 5. Ringkasan Kebutuhan Pengguna

Berikut merupakan ringkasan jumlah kebutuhan berdasarkan kategori pengguna.

| No. | Kategori Pengguna | Jumlah Kebutuhan | Rentang ID |
|---|---|---:|---|
| 1 | Customer | 21 | UR-CUS-01 – UR-CUS-21 |
| 2 | Vendor | 16 | UR-VEN-01 – UR-VEN-16 |
| 3 | Administrator | 6 | UR-ADM-01 – UR-ADM-06 |
| | **Total** | **43** | |

## 5.1 Prioritas Kebutuhan Pengguna

Seluruh kebutuhan pengguna mendukung fungsi yang telah ditetapkan dalam SRS dan Functional Requirements. Prioritas implementasi mengikuti prioritas kebutuhan fungsional pada dokumen `functional-requirements.md`.

## 5.2 Ketentuan Hak Akses

1. Customer hanya dapat mengakses informasi dan pesanan yang berkaitan dengan akunnya.
2. Vendor hanya dapat mengelola tenant dan pesanan yang berada dalam kewenangannya.
3. Administrator dapat mengelola data pengguna dan tenant sesuai kewenangan administratifnya.
4. Setiap akses terhadap fungsi sistem harus melalui pemeriksaan autentikasi dan otorisasi.

---

# 6. Ketentuan Konsistensi Sistem

Seluruh kebutuhan pengguna dalam dokumen ini harus mengikuti ruang lingkup dan struktur data LetsOrder.com yang telah ditetapkan.

Ketentuan yang harus diperhatikan meliputi:

1. Sistem menggunakan tiga peran utama, yaitu Customer, Vendor, dan Administrator.
2. Satu transaksi pemesanan hanya mencakup menu dari satu tenant.
3. Pengambilan pesanan dilakukan secara langsung melalui mekanisme self-pickup.
4. Nomor antrean digunakan sebagai identifikasi pesanan.
5. Pembayaran QRIS dan dompet digital hanya berupa simulasi.
6. Informasi pengguna, tenant, menu, keranjang, pesanan, pembayaran, riwayat status, dan notifikasi harus mengikuti ERD final.
7. Pengelolaan kategori dan verifikasi pembayaran harus mengikuti kewenangan yang telah disepakati dalam implementasi.
8. Tidak ada kebutuhan pengguna yang secara sepihak menambahkan entitas, atribut, atau relasi baru di luar ERD final.

---

# 7. Penutup

Dokumen User Requirements ini menggambarkan kebutuhan Customer, Vendor, dan Administrator dalam menggunakan sistem LetsOrder.com. Pengelompokan berdasarkan peran pengguna diharapkan dapat membantu tim pengembang memahami kebutuhan setiap aktor secara lebih jelas.

Dokumen ini menjadi acuan dalam penyusunan antarmuka, implementasi hak akses, serta pengujian sistem agar fungsi yang dikembangkan sesuai dengan kebutuhan pengguna dan ruang lingkup proyek.