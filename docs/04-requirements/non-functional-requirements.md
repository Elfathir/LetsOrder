# Non-Functional Requirements

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Non-Functional Requirements |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi | Software Requirements Specification (SRS) |
| Standar Acuan | ISO/IEC 25010 |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen Non-Functional Requirements (NFR) disusun untuk menjelaskan kebutuhan kualitas dan batasan operasional yang harus dipenuhi oleh sistem LetsOrder.com. Berbeda dengan kebutuhan fungsional yang menjelaskan fungsi sistem, kebutuhan nonfungsional berfokus pada bagaimana sistem harus beroperasi agar dapat memberikan pengalaman penggunaan yang baik, aman, andal, dan mudah dipelihara.

Dokumen ini menjadi acuan bagi tim pengembang dalam menentukan standar kualitas selama proses perancangan, implementasi, dan pengujian sistem.

## 1.2 Ruang Lingkup

Kebutuhan nonfungsional LetsOrder.com mencakup beberapa karakteristik kualitas perangkat lunak yang mengacu pada ISO/IEC 25010, yaitu:

1. Performance Efficiency.
2. Security.
3. Usability.
4. Reliability.
5. Compatibility.
6. Maintainability.

Kebutuhan tersebut disesuaikan dengan karakteristik aplikasi web LetsOrder.com dan teknologi yang digunakan, yaitu React, Laravel, dan MySQL.

## 1.3 Standar Acuan

ISO/IEC 25010 digunakan sebagai referensi dalam menentukan karakteristik kualitas produk perangkat lunak. Standar tersebut membantu tim pengembang mengidentifikasi aspek kualitas yang perlu diperhatikan agar sistem dapat memenuhi kebutuhan pengguna dan tujuan proyek.

---

# 2. Spesifikasi Kebutuhan Nonfungsional

## 2.1 Performance Efficiency

Performance Efficiency berkaitan dengan kemampuan sistem dalam memberikan respons dan menggunakan sumber daya secara efisien selama operasional.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-01 | Sistem harus memiliki waktu pemuatan halaman yang cepat. | Waktu pemuatan halaman ditargetkan kurang dari 2 detik pada kondisi pengujian yang telah ditetapkan. | Must Have |
| NFR-02 | Sistem harus memproses permintaan pengguna secara efisien. | Operasi utama seperti menampilkan katalog, membuka keranjang, dan melihat status pesanan dapat berjalan tanpa keterlambatan yang mengganggu penggunaan normal. | Must Have |
| NFR-03 | Sistem harus mengelola pertukaran data antara frontend dan backend secara efisien. | Data yang dikirim melalui API hanya mencakup informasi yang diperlukan untuk proses terkait. | Should Have |

## 2.2 Security

Security berkaitan dengan kemampuan sistem dalam melindungi informasi dan membatasi akses berdasarkan kewenangan pengguna.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-04 | Sistem harus melindungi kredensial pengguna. | Password disimpan menggunakan mekanisme hashing yang aman dan tidak disimpan dalam bentuk teks biasa. | Must Have |
| NFR-05 | Sistem harus menerapkan autentikasi pengguna. | Fungsi yang memerlukan login tidak dapat diakses oleh pengguna yang belum terautentikasi. | Must Have |
| NFR-06 | Sistem harus menerapkan pembatasan hak akses berdasarkan peran. | Customer, Vendor, dan Administrator hanya dapat menjalankan fungsi sesuai kewenangannya. | Must Have |
| NFR-07 | Sistem harus melakukan validasi terhadap data masukan. | Data yang tidak memenuhi aturan validasi ditolak sebelum diproses lebih lanjut. | Must Have |
| NFR-08 | Sistem harus melindungi komunikasi data. | HTTPS digunakan pada lingkungan deployment yang mendukungnya. | Must Have |
| NFR-09 | Sistem harus melindungi data dari akses yang tidak sah. | Pengguna tidak dapat melihat atau mengubah data milik pengguna lain tanpa kewenangan. | Must Have |

## 2.3 Usability

Usability berkaitan dengan kemudahan pengguna dalam mempelajari, memahami, dan mengoperasikan sistem.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-10 | Sistem harus memiliki antarmuka yang mudah dipahami. | Menu navigasi dan fungsi utama dapat dikenali oleh pengguna sesuai perannya. | Must Have |
| NFR-11 | Sistem harus menyediakan navigasi yang konsisten. | Struktur navigasi memiliki pola yang konsisten pada halaman dengan fungsi sejenis. | Must Have |
| NFR-12 | Sistem harus memberikan informasi yang jelas kepada pengguna. | Pesan keberhasilan, kesalahan, dan validasi ditampilkan menggunakan bahasa yang mudah dipahami. | Must Have |
| NFR-13 | Sistem harus menyederhanakan proses pemesanan. | Customer dapat menyelesaikan proses pemilihan menu, pengelolaan keranjang, dan pembuatan pesanan melalui alur yang jelas. | Must Have |
| NFR-14 | Sistem harus memiliki tampilan yang responsif. | Antarmuka dapat menyesuaikan ukuran layar komputer, tablet, dan smartphone. | Must Have |

## 2.4 Reliability

Reliability berkaitan dengan kemampuan sistem dalam menjalankan fungsi secara konsisten dan mempertahankan integritas data.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-15 | Sistem harus menjaga konsistensi data pesanan. | Informasi pesanan dan rincian item tersimpan sesuai hubungan yang telah ditetapkan dalam database. | Must Have |
| NFR-16 | Sistem harus menjaga konsistensi perubahan status pesanan. | Status terbaru pada pesanan sesuai dengan perubahan yang tercatat dalam riwayat status. | Must Have |
| NFR-17 | Sistem harus menangani kegagalan proses penyimpanan data. | Sistem menampilkan informasi kegagalan dan tidak memberikan konfirmasi keberhasilan apabila penyimpanan gagal. | Must Have |
| NFR-18 | Sistem harus menjaga konsistensi informasi pembayaran. | Informasi pembayaran yang ditampilkan sesuai dengan data pembayaran yang tersimpan. | Must Have |
| NFR-19 | Sistem harus mencegah pemrosesan data yang tidak valid. | Data yang tidak memenuhi ketentuan sistem tidak diproses sebagai transaksi yang berhasil. | Must Have |

## 2.5 Compatibility

Compatibility berkaitan dengan kemampuan sistem untuk digunakan pada berbagai lingkungan perangkat lunak dan perangkat pengguna.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-20 | Sistem harus mendukung browser modern. | Fungsi utama aplikasi berjalan pada browser yang menjadi target pengujian. | Must Have |
| NFR-21 | Sistem harus mendukung berbagai ukuran layar. | Halaman dapat ditampilkan dan digunakan pada komputer, laptop, tablet, dan smartphone. | Must Have |
| NFR-22 | Sistem harus menjaga konsistensi tampilan pada browser yang didukung. | Komponen utama, navigasi, dan fungsi aplikasi tetap dapat digunakan pada lingkungan pengujian yang ditetapkan. | Should Have |

## 2.6 Maintainability

Maintainability berkaitan dengan kemudahan sistem untuk diperiksa, diperbaiki, dikembangkan, dan dipelihara.

| ID | Kebutuhan | Kriteria Penerimaan | Prioritas |
|---|---|---|---|
| NFR-23 | Kode frontend dan backend harus memiliki struktur yang terorganisasi. | Pengembangan mengikuti struktur direktori dan pemisahan tanggung jawab aplikasi yang telah ditentukan. | Must Have |
| NFR-24 | Sistem harus memiliki dokumentasi teknis. | Dokumentasi mencakup arsitektur sistem, struktur database, dan spesifikasi API. | Must Have |
| NFR-25 | Sistem harus mendukung pengujian perangkat lunak. | Fungsi utama dan integrasi antarkomponen dapat diuji secara terstruktur. | Must Have |
| NFR-26 | Sistem harus menggunakan penamaan kode yang konsisten. | Penamaan file, variabel, fungsi, dan komponen mengikuti konvensi yang ditetapkan tim. | Should Have |
| NFR-27 | Sistem harus memisahkan komponen berdasarkan tanggung jawabnya. | Perubahan pada satu bagian aplikasi tidak menimbulkan ketergantungan yang tidak diperlukan pada bagian lainnya. | Should Have |

---

# 3. Ketentuan Pengujian Nonfungsional

Setiap kebutuhan nonfungsional harus diverifikasi melalui pengujian yang sesuai dengan karakteristik kualitasnya.

| Aspek | Metode Pengujian | Hal yang Diverifikasi |
|---|---|---|
| Performance Efficiency | Performance Testing | Waktu pemuatan halaman dan respons fungsi utama. |
| Security | Security Testing | Autentikasi, hak akses, validasi input, dan perlindungan data. |
| Usability | Usability Testing | Kemudahan navigasi, pemahaman antarmuka, dan alur pemesanan. |
| Reliability | Functional dan Integration Testing | Konsistensi data, penanganan kegagalan, dan perubahan status. |
| Compatibility | Compatibility Testing | Penggunaan aplikasi pada browser dan ukuran layar yang didukung. |
| Maintainability | Code Review dan Documentation Review | Struktur kode, konsistensi penamaan, dan kelengkapan dokumentasi. |

## 3.1 Pengujian Performa

Pengujian performa dilakukan untuk mengetahui kemampuan sistem dalam memberikan respons terhadap permintaan pengguna. Pengujian difokuskan pada halaman utama, katalog menu, keranjang, dan informasi pesanan.

Target waktu pemuatan halaman adalah kurang dari 2 detik pada kondisi pengujian yang telah ditentukan. Hasil pengujian harus dicatat agar dapat diketahui apakah target tersebut telah tercapai.

## 3.2 Pengujian Keamanan

Pengujian keamanan dilakukan untuk memastikan bahwa sistem menerapkan autentikasi dan pembatasan akses sesuai peran. Pengujian juga mencakup validasi data masukan dan pemeriksaan agar pengguna tidak dapat mengakses data yang bukan menjadi kewenangannya.

## 3.3 Pengujian Usability

Pengujian usability dilakukan dengan mengamati kemudahan pengguna dalam menjalankan fungsi utama aplikasi. Pengujian dapat melibatkan calon pengguna dari masing-masing peran untuk memperoleh masukan mengenai navigasi, tampilan, dan alur penggunaan.

## 3.4 Pengujian Reliability

Pengujian reliability dilakukan untuk memastikan bahwa sistem dapat menjaga konsistensi data ketika pengguna melakukan pemesanan, pembayaran simulasi, dan perubahan status pesanan.

## 3.5 Pengujian Compatibility

Pengujian compatibility dilakukan dengan menjalankan aplikasi pada browser dan perangkat yang menjadi target pengujian. Pemeriksaan difokuskan pada tampilan, navigasi, dan fungsi utama.

## 3.6 Pengujian Maintainability

Pengujian maintainability dilakukan melalui pemeriksaan struktur kode, konsistensi implementasi, serta kelengkapan dokumentasi teknis agar sistem lebih mudah dipelihara dan dikembangkan.

---

# 4. Ketentuan Umum

## 4.1 Konsistensi dengan Kebutuhan Fungsional

Seluruh kebutuhan nonfungsional harus mendukung pelaksanaan kebutuhan fungsional yang telah ditetapkan dalam dokumen `functional-requirements.md`. Pemenuhan kualitas sistem tidak boleh mengubah fungsi utama maupun menambahkan kebutuhan bisnis yang berada di luar ruang lingkup proyek.

## 4.2 Konsistensi dengan ERD

Kebutuhan nonfungsional tidak menjadi dasar untuk menambahkan entitas, atribut, atau hubungan baru ke dalam database. Implementasi tetap harus mengikuti ERD final LetsOrder.com yang terdiri atas sebelas entitas.

## 4.3 Evaluasi Kualitas

Pemenuhan kebutuhan nonfungsional dievaluasi melalui hasil pengujian. Setiap hasil pengujian harus dicatat berdasarkan ID NFR agar dapat ditelusuri dan dibandingkan dengan kriteria penerimaan yang telah ditetapkan.

---

# 5. Penutup

Dokumen Non-Functional Requirements ini menjadi acuan dalam menentukan kualitas operasional sistem LetsOrder.com. Kebutuhan yang dijelaskan mencakup performa, keamanan, kemudahan penggunaan, keandalan, kompatibilitas, dan kemudahan pemeliharaan.

Dengan adanya kebutuhan nonfungsional yang terdefinisi, tim pengembang diharapkan dapat membangun sistem yang tidak hanya memenuhi fungsi pemesanan dan self-pickup, tetapi juga memberikan pengalaman penggunaan yang aman, konsisten, dan sesuai dengan standar kualitas yang dijadikan acuan.