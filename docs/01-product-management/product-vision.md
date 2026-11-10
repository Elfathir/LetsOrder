# Product Vision — LetsOrder.com

---

## 1. Visi Produk

Menjadi sistem pemesanan makanan digital yang membantu mahasiswa dan pengguna kantin UPNVJ melakukan pemesanan secara lebih praktis, mengurangi antrean fisik, serta mempermudah proses pengambilan makanan melalui mekanisme self-pickup yang terorganisasi.

LetsOrder.com berfokus pada penyederhanaan proses pemesanan makanan di lingkungan kantin kampus melalui platform berbasis web. Pengguna dapat melihat menu, memilih makanan, membuat pesanan, melakukan simulasi pembayaran digital, serta memantau perkembangan pesanan sebelum mengambilnya secara langsung di tenant.

## 2. Latar Belakang Produk

Aktivitas pemesanan makanan di kantin kampus sering mengalami penumpukan antrean, terutama pada waktu istirahat dan jam makan siang. Mahasiswa harus meluangkan waktu untuk melihat menu, melakukan pemesanan, dan menunggu makanan disiapkan. Kondisi tersebut dapat mengurangi waktu istirahat dan berpotensi mengganggu jadwal perkuliahan.

Di sisi lain, proses pelayanan tenant juga dapat menjadi kurang efisien ketika banyak pelanggan melakukan pemesanan secara bersamaan. Informasi mengenai pesanan dan perkembangan proses penyajiannya belum tentu dapat diketahui pelanggan secara langsung.

LetsOrder.com dikembangkan sebagai solusi digital untuk membantu mengatasi permasalahan tersebut. Melalui sistem pemesanan berbasis web, customer dapat melakukan pemesanan sebelum datang ke kantin, sedangkan vendor dapat mengelola menu dan pesanan melalui sistem. Proses pengambilan tetap dilakukan secara langsung oleh customer menggunakan nomor antrean yang tersedia pada pesanan.

## 3. Permasalahan yang Ingin Diselesaikan

LetsOrder.com dirancang untuk menjawab beberapa permasalahan utama berikut:

1. **Antrean fisik di kantin:** Customer harus datang dan melakukan pemesanan secara langsung sehingga berpotensi menimbulkan antrean, terutama pada jam sibuk.
2. **Waktu pemesanan:** Proses melihat menu dan melakukan pemesanan secara langsung membutuhkan waktu tambahan.
3. **Informasi ketersediaan menu:** Customer membutuhkan informasi mengenai menu yang tersedia sebelum memutuskan untuk memesan.
4. **Informasi perkembangan pesanan:** Customer membutuhkan informasi mengenai status pesanan tanpa harus terus-menerus menanyakan langsung kepada vendor.
5. **Pengelolaan pesanan oleh vendor:** Vendor membutuhkan sarana digital untuk mengelola informasi menu dan pesanan secara lebih terstruktur.

## 4. Target Pengguna

LetsOrder.com memiliki tiga kelompok pengguna utama.

### 4.1 Customer

Customer merupakan mahasiswa atau pengguna kantin yang menggunakan sistem untuk melihat katalog menu, memasukkan pilihan makanan ke keranjang, membuat pesanan, melakukan simulasi pembayaran, serta memantau status pesanan hingga mengambil makanan.

**Kebutuhan utama:**
- Melihat daftar tenant dan menu yang tersedia.
- Mengetahui harga serta estimasi waktu penyajian.
- Melakukan pemesanan melalui web.
- Melakukan simulasi pembayaran digital.
- Memantau status pesanan.
- Mengambil pesanan berdasarkan nomor antrean.

### 4.2 Vendor

Vendor merupakan pihak penjual makanan atau pengelola tenant di kantin UPNVJ yang menggunakan sistem untuk mengelola informasi tenant, menu, serta pesanan yang diterima.

**Kebutuhan utama:**
- Mengelola informasi tenant.
- Mengelola kategori dan informasi menu.
- Mengatur ketersediaan menu.
- Melihat dan mengelola pesanan.
- Memperbarui status pesanan sesuai proses pelayanan.

### 4.3 Administrator

Administrator merupakan pihak yang bertanggung jawab terhadap pengelolaan sistem sesuai kewenangannya.

**Kebutuhan utama:**
- Melihat informasi pengguna.
- Mengelola data pengguna sesuai kewenangan.
- Melihat dan mengelola data tenant sesuai kewenangan.
- Memastikan pengelolaan sistem berjalan sesuai aturan yang ditetapkan.

## 5. Nilai yang Ditawarkan

LetsOrder.com memberikan nilai melalui beberapa aspek berikut.

| Aspek | Nilai yang Ditawarkan |
|---|---|
| Kemudahan pemesanan | Customer dapat memesan makanan melalui web tanpa harus memulai proses pemesanan dari antrean fisik. |
| Efisiensi waktu | Customer dapat melakukan pemesanan sebelum tiba di tenant sehingga proses pemesanan langsung dapat dikurangi. |
| Informasi menu | Customer dapat melihat informasi menu, harga, dan ketersediaannya. |
| Transparansi pesanan | Customer dapat memantau perkembangan status pesanan melalui sistem. |
| Pengelolaan tenant | Vendor memperoleh sarana untuk mengelola informasi tenant dan menu. |
| Pengelolaan pesanan | Vendor dapat melihat dan memperbarui status pesanan melalui sistem. |

## 6. Prinsip Utama Produk

Pengembangan LetsOrder.com berpedoman pada prinsip-prinsip berikut:

1. **Praktis:** Proses pemesanan harus mudah dipahami dan tidak memerlukan langkah yang berlebihan.
2. **Terstruktur:** Informasi pengguna, tenant, menu, pesanan, dan pembayaran dikelola melalui sistem yang saling terhubung.
3. **Transparan:** Customer memperoleh informasi mengenai menu dan perkembangan status pesanan.
4. **Efisien:** Sistem dirancang untuk membantu mengurangi kebutuhan pemesanan secara langsung dan penumpukan antrean.
5. **Terbatas pada ruang lingkup:** Fitur yang dikembangkan harus sesuai dengan ruang lingkup proyek dan struktur ERD final.

## 7. Gambaran Produk

LetsOrder.com merupakan aplikasi berbasis web dengan React sebagai teknologi frontend, Laravel sebagai backend, dan MySQL sebagai basis data.

Secara umum, alur penggunaan produk adalah sebagai berikut:

1. Customer mengakses sistem dan melakukan autentikasi.
2. Customer melihat daftar tenant serta katalog menu.
3. Customer memilih menu dan memasukkannya ke keranjang.
4. Customer membuat pesanan berdasarkan pilihan yang telah ditentukan.
5. Customer melakukan simulasi pembayaran digital menggunakan QRIS.
6. Vendor mengelola pesanan dan memperbarui statusnya.
7. Customer memantau perkembangan pesanan melalui sistem.
8. Customer datang ke tenant untuk mengambil makanan menggunakan nomor antrean.

Penggunaan QRIS pada proyek ini merupakan simulasi pembayaran, bukan integrasi dengan payment gateway untuk transaksi keuangan sungguhan. Sistem juga tidak menyediakan layanan pengantaran makanan karena proses pemenuhan pesanan menggunakan mekanisme self-pickup.

## 8. Indikator Keberhasilan Produk

Keberhasilan LetsOrder.com dinilai berdasarkan kemampuan sistem dalam mendukung kebutuhan utama pengguna.

| Indikator | Target Keberhasilan |
|---|---|
| Autentikasi pengguna | Pengguna dapat masuk ke sistem sesuai perannya. |
| Pengelolaan menu | Vendor dapat mengelola informasi dan ketersediaan menu. |
| Katalog menu | Customer dapat melihat informasi tenant dan menu yang tersedia. |
| Proses pemesanan | Customer dapat membuat pesanan melalui sistem. |
| Simulasi pembayaran | Customer dapat menyelesaikan alur simulasi pembayaran digital. |
| Pelacakan pesanan | Customer dapat melihat perkembangan status pesanan. |
| Self-pickup | Pesanan dapat diidentifikasi dan diambil menggunakan nomor antrean. |
| Kinerja aplikasi | Waktu pemuatan halaman ditargetkan kurang dari 2 detik dalam kondisi pengujian yang ditetapkan. |

Indikator tersebut digunakan sebagai acuan evaluasi produk dan perlu diperiksa lebih lanjut melalui pengujian fungsional maupun nonfungsional.

## 9. Batasan Visi Produk

Visi produk LetsOrder.com dibatasi pada pengembangan sistem pemesanan makanan dan self-pickup untuk lingkungan Kantin UPNVJ.

Dengan demikian, produk tidak diarahkan untuk menyediakan:
- Aplikasi native Android atau iOS.
- Layanan pengantaran makanan.
- Integrasi pembayaran dengan payment gateway sungguhan.
- Pengelolaan stok bahan baku.
- Laporan keuangan vendor tingkat lanjut.
- Pengelolaan beberapa staf dalam satu tenant.
- Dukungan operasional untuk banyak kampus.
- Fitur promo, rating, ulasan, favorit, dan rekomendasi menu.

Seluruh fungsi produk harus tetap mengacu pada sebelas entitas yang telah ditetapkan dalam ERD final. Visi produk tidak menjadi dasar untuk menambahkan entitas, atribut, atau relasi baru di luar rancangan database tersebut.

## 10. Penutup

LetsOrder.com dikembangkan sebagai solusi pemesanan makanan digital yang berfokus pada kemudahan customer, pengelolaan pesanan oleh vendor, dan pengurangan antrean fisik di Kantin UPNVJ. Melalui katalog menu, keranjang belanja, pemesanan digital, simulasi pembayaran, pelacakan status, dan mekanisme self-pickup, sistem diharapkan dapat membantu membuat proses pemesanan makanan di lingkungan kampus menjadi lebih terstruktur dan efisien.

Visi ini menjadi pedoman dalam menentukan arah pengembangan produk agar setiap fitur yang dibangun tetap berhubungan dengan permasalahan utama dan kebutuhan pengguna.