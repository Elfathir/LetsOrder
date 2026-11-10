# Project Background — LetsOrder.com

---

## 1. Latar Belakang Proyek

Kantin merupakan salah satu fasilitas yang mendukung kebutuhan mahasiswa selama menjalani aktivitas perkuliahan di lingkungan Universitas Pembangunan Nasional Veteran Jakarta (UPNVJ). Mahasiswa memanfaatkan kantin untuk membeli makanan dan minuman, terutama pada waktu istirahat maupun jam makan siang. Tingginya aktivitas pemesanan pada waktu-waktu tersebut dapat menyebabkan penumpukan antrean, sehingga mahasiswa harus menghabiskan waktu untuk melihat menu, melakukan pemesanan, dan menunggu makanan disiapkan.

Kondisi antrean fisik dapat menjadi kendala bagi mahasiswa yang memiliki jadwal perkuliahan cukup padat. Waktu yang seharusnya dapat digunakan untuk beristirahat atau mempersiapkan kegiatan akademik justru berkurang karena proses pemesanan dan menunggu makanan. Selain itu, penumpukan pelanggan juga berpotensi memengaruhi kelancaran pelayanan tenant kantin, khususnya ketika beberapa pelanggan melakukan pemesanan dalam waktu yang bersamaan.

Permasalahan tersebut menunjukkan adanya kebutuhan terhadap proses pemesanan makanan yang lebih praktis dan terorganisasi. Pemanfaatan teknologi berbasis web dapat menjadi salah satu pendekatan untuk membantu mengurangi ketergantungan pada proses pemesanan secara langsung. Melalui sistem digital, pelanggan dapat memperoleh informasi menu dan melakukan pemesanan sebelum datang ke tenant.

Berdasarkan kebutuhan tersebut, dikembangkan **LetsOrder.com**, yaitu sistem pemesanan dan self-pickup digital untuk Kantin UPNVJ. Sistem ini dirancang agar customer dapat melihat katalog tenant dan menu, memilih makanan, mengelola keranjang, membuat pesanan, serta memantau perkembangan pesanan melalui platform berbasis web.

Di sisi lain, vendor memperoleh fasilitas untuk mengelola informasi tenant, menu, dan pesanan yang diterima. Administrator juga memiliki fungsi pengelolaan pengguna dan tenant sesuai kewenangannya. Dengan demikian, sistem melibatkan tiga aktor utama, yaitu customer, vendor, dan administrator.

Proses pemenuhan pesanan pada LetsOrder.com menggunakan mekanisme **self-pickup**. Customer melakukan pemesanan melalui sistem, kemudian datang langsung ke tenant untuk mengambil makanan berdasarkan nomor antrean yang tercantum pada pesanan. Sistem juga menyediakan simulasi pembayaran digital menggunakan QRIS sebagai bagian dari alur pemesanan. Simulasi tersebut tidak menggunakan integrasi payment gateway untuk transaksi keuangan sungguhan.

Pengembangan LetsOrder.com diharapkan dapat membantu mengurangi antrean fisik, memberikan kemudahan dalam proses pemesanan, serta mendukung pengelolaan pesanan yang lebih terstruktur di lingkungan Kantin UPNVJ.

## 2. Kondisi dan Permasalahan yang Melatarbelakangi

Beberapa kondisi yang menjadi dasar pengembangan LetsOrder.com meliputi:

### 2.1 Penumpukan Antrean pada Jam Sibuk

Aktivitas pemesanan makanan yang dilakukan secara langsung dapat menyebabkan antrean, terutama ketika banyak mahasiswa membeli makanan pada waktu yang berdekatan. Kondisi ini membuat pelanggan harus menunggu sebelum dapat menyelesaikan proses pemesanan.

### 2.2 Keterbatasan Waktu Mahasiswa

Mahasiswa perlu menyesuaikan aktivitas makan dengan jadwal perkuliahan. Proses pemesanan dan menunggu makanan secara langsung dapat mengurangi waktu yang tersedia untuk beristirahat maupun mempersiapkan kegiatan akademik berikutnya.

### 2.3 Akses Informasi Menu

Pelanggan membutuhkan informasi mengenai pilihan menu, harga, dan ketersediaannya sebelum melakukan pemesanan. Penyediaan katalog digital dapat membantu pelanggan memperoleh informasi tersebut tanpa harus terlebih dahulu datang ke tenant.

### 2.4 Pengelolaan Pesanan

Vendor membutuhkan sarana untuk melihat dan mengelola pesanan yang diterima. Pengelolaan melalui sistem digital diharapkan dapat membantu menyusun informasi pesanan secara lebih terstruktur.

### 2.5 Informasi Perkembangan Pesanan

Customer membutuhkan informasi mengenai perkembangan pesanan setelah melakukan pemesanan. Informasi status pesanan melalui sistem dapat membantu customer mengetahui proses pesanan tanpa harus terus-menerus menanyakan langsung kepada vendor.

## 3. Solusi yang Diusulkan

LetsOrder.com dikembangkan sebagai sistem pemesanan makanan berbasis web dengan mekanisme self-pickup. Sistem ini menyediakan alur pemesanan digital yang menghubungkan customer dengan vendor melalui platform yang sama.

Solusi yang diusulkan mencakup beberapa bagian berikut:

1. **Katalog digital:** Menyediakan informasi tenant, kategori, dan menu yang dapat dilihat oleh customer.
2. **Keranjang belanja:** Memungkinkan customer memilih menu, mengatur jumlah, dan memberikan catatan pada item yang dipesan.
3. **Pemesanan digital:** Memungkinkan customer membuat pesanan melalui sistem dan memperoleh nomor antrean.
4. **Simulasi pembayaran:** Menyediakan alur simulasi pembayaran digital menggunakan QRIS.
5. **Pengelolaan pesanan:** Memungkinkan vendor melihat pesanan dan memperbarui statusnya.
6. **Pelacakan pesanan:** Memungkinkan customer memantau perkembangan pesanan melalui sistem.
7. **Self-pickup:** Memungkinkan customer mengambil pesanan secara langsung di tenant menggunakan nomor antrean.

Solusi tersebut dirancang untuk mendukung proses pemesanan makanan tanpa mengubah mekanisme pemenuhan pesanan menjadi layanan pengantaran.

## 4. Alasan Pengembangan Proyek

Pengembangan LetsOrder.com didasarkan pada beberapa alasan utama:

- **Mengurangi antrean fisik:** Memberikan alternatif pemesanan melalui sistem digital sebelum customer datang ke tenant.
- **Membantu efisiensi waktu:** Mengurangi waktu yang diperlukan untuk melakukan pemesanan secara langsung.
- **Mempermudah akses informasi:** Menyediakan katalog digital agar customer dapat melihat informasi menu sebelum memesan.
- **Mendukung pengelolaan vendor:** Menyediakan fasilitas pengelolaan informasi tenant, menu, dan pesanan.
- **Meningkatkan keteraturan proses pemesanan:** Menghubungkan proses pemesanan, pembayaran simulasi, pelacakan, dan pengambilan dalam satu sistem.

## 5. Konteks Pengembangan Sistem

LetsOrder.com dikembangkan sebagai aplikasi berbasis web dengan teknologi berikut:

| Komponen | Teknologi | Peran |
|---|---|---|
| Frontend | React | Membangun antarmuka dan interaksi pengguna. |
| Backend | Laravel | Mengelola proses bisnis dan komunikasi dengan database. |
| Database | MySQL | Menyimpan data pengguna, tenant, menu, keranjang, pesanan, pembayaran, riwayat status, dan notifikasi. |

Sistem dirancang berdasarkan tiga kelompok pengguna, yaitu customer, vendor, dan administrator. Struktur data mengikuti ERD final yang terdiri dari sebelas entitas:

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

Penggunaan teknologi dan struktur data tersebut menjadi dasar dalam implementasi sistem agar fungsi yang dikembangkan tetap sesuai dengan kebutuhan proyek.

## 6. Ruang Lingkup Konteks Proyek

Pengembangan LetsOrder.com difokuskan pada proses pemesanan makanan dan pengambilan mandiri di Kantin UPNVJ. Sistem mencakup pengelolaan tenant dan menu, pemesanan digital, simulasi pembayaran, pelacakan status, serta pengambilan pesanan secara langsung.

Adapun pengembangan tidak mencakup aplikasi native Android atau iOS, layanan pengantaran makanan, integrasi payment gateway sungguhan, pengelolaan stok bahan baku, laporan keuangan vendor tingkat lanjut, pengelolaan beberapa staf dalam satu tenant, maupun dukungan untuk banyak kampus.

Batasan tersebut digunakan agar proses pengembangan tetap berfokus pada permasalahan utama yang ingin diselesaikan dan tidak meluas ke kebutuhan di luar kesepakatan proyek.

## 7. Penutup

LetsOrder.com dikembangkan sebagai upaya untuk membantu mengatasi permasalahan antrean dan proses pemesanan makanan secara langsung di Kantin UPNVJ. Melalui sistem pemesanan berbasis web dan mekanisme self-pickup, customer diharapkan dapat melakukan pemesanan dengan lebih praktis, sedangkan vendor memperoleh sarana untuk mengelola menu dan pesanan secara lebih terstruktur.

Pengembangan proyek ini berfokus pada kebutuhan utama lingkungan kantin kampus dengan tetap memperhatikan batasan fitur, teknologi, dan struktur database yang telah ditetapkan. Dokumen ini menjadi dasar pemahaman mengenai alasan dan konteks pengembangan LetsOrder.com sebelum memasuki tahap perencanaan dan implementasi sistem.