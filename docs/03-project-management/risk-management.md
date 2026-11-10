# Risk Management
## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

**Versi:** 1.0  
**Status:** Draft

## 1. Pendahuluan

Manajemen risiko merupakan proses untuk mengidentifikasi, menganalisis, dan menentukan langkah penanganan terhadap berbagai kemungkinan yang dapat menghambat pelaksanaan proyek LetsOrder.com. Berdasarkan hasil diskusi kelompok, terdapat tiga risiko utama yang perlu diperhatikan, yaitu risiko teknis (*technical risks*), risiko operasional (*operational risks*), dan risiko adopsi pengguna (*adoption risks*).

Pengelolaan risiko dilakukan agar tim dapat mengantisipasi kendala sejak awal, mengurangi dampak yang mungkin ditimbulkan, serta menjaga agar pengembangan sistem tetap berjalan sesuai tujuan proyek.

## 2. Identifikasi Risiko

Berdasarkan hasil diskusi kelompok, risiko utama yang telah diidentifikasi adalah sebagai berikut.

| ID | Kategori Risiko | Risiko | Deskripsi |
|---|---|---|---|
| R-01 | Technical Risk | Kompatibilitas browser | Sistem berpotensi menampilkan tampilan atau menjalankan fungsi yang berbeda pada browser yang digunakan oleh pengguna. |
| R-02 | Operational Risk | Keterlambatan dari pihak vendor | Vendor berpotensi mengalami keterlambatan dalam memproses pesanan sehingga waktu pengambilan pesanan oleh pelanggan ikut terpengaruh. |
| R-03 | Adoption Risk | Perbedaan usia pengguna | Perbedaan usia dan tingkat pemahaman teknologi pengguna dapat memengaruhi kemudahan mereka dalam mempelajari dan menggunakan sistem. |

## 3. Analisis dan Tingkat Risiko

Penilaian risiko dilakukan berdasarkan dua aspek, yaitu kemungkinan terjadinya risiko (*likelihood*) dan besarnya dampak terhadap proyek (*impact*). Penilaian berikut merupakan estimasi awal yang dapat diperbarui berdasarkan hasil pengujian dan perkembangan proyek.

| ID | Risiko | Kemungkinan | Dampak | Tingkat Risiko |
|---|---|---|---|---|
| R-01 | Kompatibilitas browser | Sedang | Tinggi | Tinggi |
| R-02 | Keterlambatan dari pihak vendor | Sedang | Tinggi | Tinggi |
| R-03 | Perbedaan usia pengguna | Sedang | Sedang | Sedang |

### 3.1 Technical Risk — Kompatibilitas Browser

Risiko ini berkaitan dengan kemungkinan adanya perbedaan tampilan, tata letak, maupun perilaku fungsi sistem ketika diakses melalui browser yang berbeda. Kondisi tersebut dapat mengurangi kenyamanan pengguna dan menghambat proses pemesanan.

**Strategi penanganan:**
- Melakukan pengujian sistem pada beberapa browser yang umum digunakan.
- Memastikan tampilan antarmuka tetap responsif pada berbagai ukuran layar.
- Memeriksa fungsi utama, seperti autentikasi, pemilihan menu, keranjang, dan pemesanan pada browser yang diuji.
- Memperbaiki permasalahan tampilan atau fungsi yang ditemukan selama pengujian.

**Penanggung jawab:** Tim pengembangan dan Quality Control.

### 3.2 Operational Risk — Keterlambatan dari Pihak Vendor

Risiko ini muncul apabila vendor membutuhkan waktu lebih lama untuk memproses pesanan dibandingkan dengan estimasi yang diharapkan. Keterlambatan dapat memengaruhi waktu pengambilan pesanan dan pengalaman pelanggan dalam menggunakan sistem.

**Strategi penanganan:**
- Menyediakan informasi estimasi waktu persiapan menu melalui sistem.
- Memastikan vendor memahami alur penerimaan dan pemrosesan pesanan.
- Menyediakan pembaruan status pesanan agar pelanggan dapat mengetahui perkembangan pesanannya.
- Melakukan koordinasi dengan vendor apabila terjadi keterlambatan pemrosesan pesanan.

**Penanggung jawab:** Project Manager dan pihak vendor.

### 3.3 Adoption Risk — Perbedaan Usia Pengguna

Risiko ini berkaitan dengan perbedaan usia dan tingkat pemahaman teknologi di antara pengguna sistem. Sebagian pengguna mungkin sudah terbiasa menggunakan layanan digital, sedangkan pengguna lainnya membutuhkan waktu lebih lama untuk memahami alur pemesanan.

**Strategi penanganan:**
- Menggunakan desain antarmuka yang sederhana dan mudah dipahami.
- Menyediakan navigasi serta label tombol yang jelas.
- Menghindari alur pemesanan yang terlalu panjang atau membingungkan.
- Melakukan pengujian kegunaan (*usability testing*) untuk memperoleh masukan dari calon pengguna dengan tingkat pengalaman teknologi yang beragam.
- Menyediakan panduan penggunaan sistem bagi pelanggan dan vendor.

**Penanggung jawab:** Tim UI/UX dan Quality Control.

## 4. Rencana Pemantauan Risiko

Pemantauan risiko dilakukan selama proses pengembangan hingga pengujian sistem. Setiap risiko perlu diperiksa secara berkala untuk mengetahui apakah kemungkinan terjadinya meningkat, dampaknya berubah, atau strategi penanganan yang telah direncanakan perlu disesuaikan.

| ID | Aspek yang Dipantau | Tindakan Pemantauan |
|---|---|---|
| R-01 | Kompatibilitas browser | Memeriksa hasil pengujian tampilan dan fungsi sistem pada browser yang berbeda. |
| R-02 | Waktu pemrosesan pesanan | Mengamati kesesuaian proses pemesanan dan pembaruan status dengan estimasi waktu persiapan. |
| R-03 | Kemudahan penggunaan | Mengumpulkan masukan dari pengguna dan mengevaluasi kendala ketika mereka menjalankan alur pemesanan. |

Hasil pemantauan dibahas dalam koordinasi tim agar kendala yang ditemukan dapat segera ditindaklanjuti.

## 5. Kesimpulan

Berdasarkan hasil identifikasi, proyek LetsOrder.com memiliki tiga risiko utama yang perlu dikelola, yaitu kompatibilitas browser, keterlambatan pemrosesan pesanan oleh vendor, serta perbedaan usia dan tingkat pemahaman teknologi pengguna. Ketiga risiko tersebut memiliki karakteristik dan dampak yang berbeda sehingga membutuhkan strategi penanganan yang sesuai.

Melalui pengujian lintas browser, koordinasi dengan vendor, serta perancangan antarmuka yang mudah digunakan, tim diharapkan dapat mengurangi kemungkinan dan dampak dari risiko-risiko tersebut. Pemantauan secara berkala juga diperlukan agar penanganan risiko tetap relevan dengan perkembangan proyek.