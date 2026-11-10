# Test Scenarios

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Nama Dokumen | Test Scenarios |
| Versi | 1.0 Draft |
| Tanggal | 10 November 2026 |
| Status | Draft |
| Dokumen Terkait | SRS, Functional Requirements, Non-Functional Requirements, Test Plan, Test Cases |

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Test Scenarios disusun untuk mendefinisikan skenario pengujian yang digunakan dalam memeriksa kesesuaian fungsi dan kualitas sistem LetsOrder.com terhadap kebutuhan yang telah ditetapkan. Skenario ini menjadi panduan bagi tim penguji dalam memastikan bahwa setiap alur utama sistem dapat berjalan sesuai dengan tujuan pengembangan.

### 1.2 Ruang Lingkup Pengujian

Pengujian mencakup tiga kelompok pengguna utama, yaitu:

1. **Customer**, sebagai pengguna yang melihat menu, mengelola keranjang, melakukan pemesanan, menyelesaikan simulasi pembayaran, dan mengambil pesanan.
2. **Vendor**, sebagai pengelola tenant yang mengatur informasi tenant, menu, serta memproses pesanan.
3. **Administrator**, sebagai pihak yang mengelola data pengguna dan tenant.

Selain pengujian fungsional, pengujian juga mencakup aspek nonfungsional seperti performa, keamanan, kemudahan penggunaan, keandalan, kompatibilitas, dan pemeliharaan sistem.

### 1.3 Acuan Pengujian

Dokumen ini mengacu pada:
- Software Requirements Specification (SRS).
- Functional Requirements.
- Non-Functional Requirements.
- User Requirements.
- Requirements Traceability Matrix.
- Test Plan.
- Test Cases.

---

## 2. Format Skenario Pengujian

Setiap skenario pengujian menggunakan format berikut:

| Atribut | Keterangan |
|---|---|
| Scenario ID | Identitas unik skenario pengujian |
| Nama Skenario | Nama alur atau kondisi yang diuji |
| Aktor | Pengguna yang terlibat dalam skenario |
| Tujuan | Hal yang ingin diverifikasi |
| Kondisi Awal | Kondisi yang harus tersedia sebelum pengujian |
| Alur Pengujian | Gambaran umum proses yang diuji |
| Hasil yang Diharapkan | Kondisi sistem yang seharusnya terjadi |
| Prioritas | Tingkat kepentingan pengujian |
| Test Case Terkait | Referensi test case yang lebih terperinci |

Prioritas pengujian dibagi menjadi:
- **P1 — Critical:** fungsi utama yang harus berjalan agar proses inti sistem dapat digunakan.
- **P2 — High:** fungsi penting yang mendukung proses utama.
- **P3 — Medium:** fungsi pendukung yang tetap perlu diverifikasi.
- **P4 — Low:** pengujian tambahan dengan tingkat urgensi lebih rendah.

---

## 3. Skenario Pengujian Fungsional

### 3.1 Pengujian Customer

| Scenario ID | Nama Skenario | Tujuan | Alur Pengujian | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|---|
| TS-CUS-01 | Registrasi Customer | Memastikan Customer dapat membuat akun. | Customer mengisi informasi akun dan mengirimkan formulir registrasi. | Sistem memproses registrasi dan menyimpan data pengguna sesuai ketentuan. | P1 |
| TS-CUS-02 | Login Customer | Memastikan Customer dapat masuk menggunakan akun yang terdaftar. | Customer memasukkan kredensial akun. | Sistem memverifikasi kredensial dan memberikan akses sesuai peran Customer. | P1 |
| TS-CUS-03 | Melihat Katalog Menu | Memastikan Customer dapat melihat menu yang tersedia. | Customer membuka halaman katalog dan menelusuri daftar menu. | Sistem menampilkan informasi menu yang tersedia beserta informasi tenant dan kategorinya. | P1 |
| TS-CUS-04 | Melihat Detail Menu | Memastikan informasi setiap menu dapat ditampilkan. | Customer memilih salah satu menu dari katalog. | Sistem menampilkan nama, deskripsi, gambar, harga, estimasi waktu, dan ketersediaan menu sesuai data. | P2 |
| TS-CUS-05 | Mengelola Keranjang | Memastikan Customer dapat menambahkan dan mengubah item keranjang. | Customer menambahkan menu, mengubah jumlah, memberikan catatan, atau menghapus item. | Sistem menampilkan isi keranjang sesuai perubahan yang dilakukan. | P1 |
| TS-CUS-06 | Validasi Keranjang | Memastikan item keranjang sesuai dengan ketentuan pemesanan. | Customer mencoba melanjutkan proses pemesanan dengan kondisi keranjang yang berbeda. | Sistem memvalidasi isi keranjang sebelum pesanan dibuat. | P1 |
| TS-CUS-07 | Membuat Pesanan | Memastikan Customer dapat membuat pesanan dari keranjang. | Customer memeriksa pesanan dan mengirimkan konfirmasi pemesanan. | Sistem menyimpan pesanan beserta detailnya, tenant, nomor antrean, total harga, catatan, dan waktu pemesanan. | P1 |
| TS-CUS-08 | Simulasi Pembayaran | Memastikan proses pembayaran simulasi dapat dijalankan. | Customer memilih metode pembayaran yang tersedia dan melanjutkan proses simulasi. | Sistem menampilkan informasi pembayaran sesuai metode yang dipilih dan menyimpan data pembayaran. | P1 |
| TS-CUS-09 | Verifikasi Pembayaran | Memastikan status verifikasi pembayaran dapat diproses sesuai mekanisme sistem. | Proses pembayaran simulasi dijalankan hingga menghasilkan kondisi pembayaran yang dapat diverifikasi. | Sistem mencatat status verifikasi dan informasi waktu pembayaran sesuai hasil proses. | P1 |
| TS-CUS-10 | Melihat Status Pesanan | Memastikan Customer dapat mengetahui perkembangan pesanan. | Customer membuka halaman pemantauan pesanan. | Sistem menampilkan status pesanan terkini berdasarkan data pesanan. | P1 |
| TS-CUS-11 | Melihat Riwayat Status | Memastikan perubahan status pesanan tercatat. | Customer membuka informasi pesanan yang memiliki perubahan status. | Sistem menampilkan riwayat status beserta waktu perubahan yang tercatat. | P2 |
| TS-CUS-12 | Melihat Riwayat Pesanan | Memastikan Customer dapat melihat pesanan sebelumnya. | Customer membuka halaman riwayat pesanan. | Sistem menampilkan daftar pesanan milik Customer sesuai data yang tersimpan. | P2 |
| TS-CUS-13 | Melihat Notifikasi | Memastikan Customer dapat melihat pemberitahuan terkait pesanan. | Customer membuka bagian notifikasi dan memilih pemberitahuan. | Sistem menampilkan pesan notifikasi dan memperbarui status baca sesuai tindakan pengguna. | P2 |
| TS-CUS-14 | Proses Self-Pickup | Memastikan Customer dapat mengambil pesanan menggunakan nomor antrean. | Customer mendatangi tenant dan menunjukkan nomor antrean pesanan. | Pesanan dapat dikenali berdasarkan nomor antrean dan diproses sesuai status pesanan. | P1 |
| TS-CUS-15 | Logout Customer | Memastikan Customer dapat mengakhiri sesi penggunaan. | Customer memilih fungsi logout. | Sistem mengakhiri sesi dan mengarahkan pengguna ke halaman yang sesuai. | P2 |

### 3.2 Pengujian Vendor

| Scenario ID | Nama Skenario | Tujuan | Alur Pengujian | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|---|
| TS-VEN-01 | Login Vendor | Memastikan Vendor dapat masuk ke sistem. | Vendor memasukkan kredensial akun. | Sistem memberikan akses sesuai peran Vendor yang terdaftar. | P1 |
| TS-VEN-02 | Melihat Informasi Tenant | Memastikan Vendor dapat melihat informasi tenant yang dikelola. | Vendor membuka halaman pengelolaan tenant. | Sistem menampilkan informasi tenant sesuai data yang terhubung dengan akun Vendor. | P1 |
| TS-VEN-03 | Memperbarui Informasi Tenant | Memastikan perubahan informasi tenant dapat disimpan. | Vendor mengubah informasi tenant yang diperbolehkan. | Sistem menyimpan perubahan pada data tenant sesuai ketentuan. | P2 |
| TS-VEN-04 | Mengubah Status Buka Tenant | Memastikan Vendor dapat mengubah status operasional tenant. | Vendor mengubah status tenant menjadi buka atau tutup. | Sistem menyimpan dan menampilkan status tenant terbaru. | P1 |
| TS-VEN-05 | Melihat Daftar Menu | Memastikan Vendor dapat melihat menu yang dikelola. | Vendor membuka halaman pengelolaan menu. | Sistem menampilkan daftar menu yang terhubung dengan tenant Vendor. | P1 |
| TS-VEN-06 | Menambahkan Menu | Memastikan Vendor dapat menambahkan menu baru. | Vendor mengisi informasi menu dan menyimpan data. | Sistem menyimpan menu dengan informasi tenant dan kategori yang sesuai. | P1 |
| TS-VEN-07 | Memperbarui Menu | Memastikan Vendor dapat memperbarui informasi menu. | Vendor memilih menu dan mengubah informasi yang tersedia. | Sistem menyimpan perubahan informasi menu. | P2 |
| TS-VEN-08 | Menghapus Menu | Memastikan Vendor dapat menghapus menu sesuai ketentuan sistem. | Vendor memilih menu dan menjalankan fungsi penghapusan. | Sistem memproses penghapusan sesuai aturan relasi data dan menampilkan kondisi terbaru. | P2 |
| TS-VEN-09 | Mengubah Ketersediaan Menu | Memastikan Vendor dapat mengatur ketersediaan menu. | Vendor mengubah status ketersediaan menu. | Sistem menyimpan status ketersediaan terbaru dan menyesuaikan tampilan katalog. | P1 |
| TS-VEN-10 | Melihat Pesanan Masuk | Memastikan Vendor dapat melihat pesanan yang masuk ke tenant. | Vendor membuka halaman daftar pesanan. | Sistem menampilkan pesanan yang terkait dengan tenant Vendor. | P1 |
| TS-VEN-11 | Melihat Detail Pesanan | Memastikan informasi pesanan dapat diperiksa Vendor. | Vendor memilih salah satu pesanan. | Sistem menampilkan detail pesanan, jumlah item, subtotal, catatan, dan informasi pembayaran yang tersedia. | P1 |
| TS-VEN-12 | Memproses Pesanan | Memastikan Vendor dapat memproses pesanan sesuai alur yang ditentukan. | Vendor membuka pesanan dan menjalankan tindakan perubahan status yang diizinkan. | Sistem memperbarui status pesanan dan mencatat perubahan pada riwayat status. | P1 |
| TS-VEN-13 | Memantau Antrean Pesanan | Memastikan Vendor dapat mengenali pesanan berdasarkan nomor antrean. | Vendor membuka daftar pesanan dan memeriksa nomor antrean. | Sistem menampilkan nomor antrean yang terkait dengan setiap pesanan. | P1 |
| TS-VEN-14 | Melihat Informasi Pembayaran | Memastikan Vendor dapat melihat informasi pembayaran pesanan. | Vendor membuka detail pembayaran dari pesanan. | Sistem menampilkan informasi pembayaran yang tersedia sesuai hak akses. | P2 |
| TS-VEN-15 | Melihat Notifikasi | Memastikan Vendor dapat melihat pemberitahuan terkait pesanan. | Vendor membuka bagian notifikasi. | Sistem menampilkan notifikasi yang ditujukan kepada akun Vendor sesuai data yang tersimpan. | P2 |
| TS-VEN-16 | Logout Vendor | Memastikan Vendor dapat mengakhiri sesi penggunaan. | Vendor memilih fungsi logout. | Sistem mengakhiri sesi dan mengarahkan pengguna ke halaman yang sesuai. | P2 |

### 3.3 Pengujian Administrator

| Scenario ID | Nama Skenario | Tujuan | Alur Pengujian | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|---|
| TS-ADM-01 | Login Administrator | Memastikan Administrator dapat masuk ke sistem. | Administrator memasukkan kredensial akun. | Sistem memberikan akses sesuai peran Administrator. | P1 |
| TS-ADM-02 | Melihat Data Pengguna | Memastikan Administrator dapat melihat data pengguna. | Administrator membuka halaman pengelolaan pengguna. | Sistem menampilkan data pengguna sesuai informasi yang tersimpan. | P1 |
| TS-ADM-03 | Memperbarui Data Pengguna | Memastikan Administrator dapat memperbarui data pengguna yang diizinkan. | Administrator memilih pengguna dan memperbarui informasi yang diperbolehkan. | Sistem menyimpan perubahan pada data pengguna. | P2 |
| TS-ADM-04 | Melihat Data Tenant | Memastikan Administrator dapat melihat daftar tenant. | Administrator membuka halaman pengelolaan tenant. | Sistem menampilkan data tenant yang tersimpan. | P1 |
| TS-ADM-05 | Memperbarui Data Tenant | Memastikan Administrator dapat memperbarui informasi tenant sesuai kewenangan. | Administrator memilih tenant dan mengubah informasi yang diperbolehkan. | Sistem menyimpan perubahan informasi tenant. | P2 |
| TS-ADM-06 | Logout Administrator | Memastikan Administrator dapat mengakhiri sesi penggunaan. | Administrator memilih fungsi logout. | Sistem mengakhiri sesi dan mengarahkan pengguna ke halaman yang sesuai. | P2 |

---

## 4. Skenario Pengujian Nonfungsional

Pengujian nonfungsional dilakukan untuk mengevaluasi kualitas sistem berdasarkan kebutuhan nonfungsional yang telah ditetapkan.

| Scenario ID | Aspek Pengujian | Tujuan | Skenario | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|---|
| TS-NFR-01 | Performance | Mengukur waktu pemuatan halaman. | Mengakses halaman utama dan halaman utama setiap peran dalam kondisi pengujian yang ditentukan. | Waktu pemuatan halaman memenuhi target kurang dari 2 detik pada kondisi pengujian yang ditetapkan. | P1 |
| TS-NFR-02 | Performance | Menguji respons sistem terhadap beberapa permintaan. | Menjalankan beberapa aktivitas pengguna secara bersamaan. | Sistem memberikan respons yang stabil sesuai kriteria performa dalam Test Plan. | P1 |
| TS-NFR-03 | Security | Menguji autentikasi pengguna. | Mengakses sistem menggunakan kredensial valid dan tidak valid. | Sistem hanya memberikan akses kepada pengguna dengan kredensial yang valid. | P1 |
| TS-NFR-04 | Security | Menguji pembatasan hak akses. | Pengguna mencoba mengakses fungsi yang bukan kewenangannya. | Sistem menolak akses yang tidak sesuai dengan peran pengguna. | P1 |
| TS-NFR-05 | Security | Menguji perlindungan data akun. | Memeriksa proses penyimpanan dan pengiriman informasi autentikasi. | Informasi autentikasi ditangani sesuai ketentuan keamanan yang ditetapkan. | P1 |
| TS-NFR-06 | Usability | Menguji kemudahan navigasi. | Pengguna menjalankan alur utama tanpa bantuan langsung dari penguji. | Pengguna dapat memahami navigasi dan menyelesaikan tugas utama sesuai kriteria usability. | P2 |
| TS-NFR-07 | Usability | Menguji kejelasan informasi. | Pengguna memeriksa informasi menu, pesanan, pembayaran, dan antrean. | Informasi ditampilkan secara jelas dan mudah dipahami. | P2 |
| TS-NFR-08 | Reliability | Menguji konsistensi penyimpanan data. | Melakukan aktivitas pemesanan dan memeriksa kembali data yang tersimpan. | Data yang ditampilkan sesuai dengan data yang berhasil disimpan. | P1 |
| TS-NFR-09 | Reliability | Menguji penanganan kegagalan proses. | Menjalankan proses dengan kondisi input atau koneksi yang tidak memenuhi ketentuan. | Sistem menangani kegagalan secara terkendali dan memberikan informasi yang sesuai. | P1 |
| TS-NFR-10 | Compatibility | Menguji kompatibilitas browser. | Mengakses sistem melalui browser yang termasuk dalam cakupan pengujian. | Fungsi dan tampilan utama berjalan sesuai kriteria kompatibilitas. | P2 |
| TS-NFR-11 | Compatibility | Menguji tampilan pada perangkat berbeda. | Mengakses sistem melalui ukuran layar perangkat yang berbeda. | Tampilan dapat digunakan tanpa mengganggu fungsi utama. | P2 |
| TS-NFR-12 | Maintainability | Menguji keteraturan struktur kode. | Melakukan peninjauan struktur frontend dan backend. | Struktur kode mengikuti standar dan pembagian modul yang ditetapkan proyek. | P3 |
| TS-NFR-13 | Maintainability | Menguji kemudahan penelusuran kesalahan. | Melakukan peninjauan mekanisme pencatatan kesalahan dan proses debugging. | Kesalahan dapat ditelusuri berdasarkan informasi yang tersedia. | P3 |

**Catatan:** Daftar di atas merupakan pengelompokan skenario awal berdasarkan aspek kualitas sistem. Pemetaan final setiap skenario ke NFR-01 sampai NFR-27 harus mengikuti definisi persis pada dokumen `non-functional-requirements.md` dan matriks keterlacakan. Jangan menganggap tabel ini sebagai pengganti pemetaan tersebut.

---

## 5. Skenario Pengujian Integrasi

Pengujian integrasi digunakan untuk memastikan beberapa bagian sistem dapat bekerja bersama dalam satu alur proses.

| Scenario ID | Nama Skenario | Komponen yang Terlibat | Alur Pengujian | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|---|
| TS-INT-01 | Integrasi Autentikasi dan Hak Akses | Frontend, Backend, USER | Pengguna melakukan login dan membuka halaman sesuai peran. | Backend memverifikasi akun dan frontend menampilkan akses sesuai peran. | P1 |
| TS-INT-02 | Integrasi Katalog dan Database | Frontend, Backend, MENU, KATEGORI, TENANT | Customer membuka katalog menu. | Informasi katalog diambil dari database dan ditampilkan sesuai data. | P1 |
| TS-INT-03 | Integrasi Keranjang dan Database | Frontend, Backend, KERANJANG, ITEM_KERANJANG, MENU | Customer menambahkan menu ke keranjang dan mengubah jumlahnya. | Perubahan keranjang tersimpan dan ditampilkan secara konsisten. | P1 |
| TS-INT-04 | Integrasi Pemesanan | Frontend, Backend, PESANAN, DETAIL_PESANAN, USER, TENANT, MENU | Customer mengonfirmasi pemesanan. | Data pesanan dan detailnya tersimpan dengan relasi yang sesuai. | P1 |
| TS-INT-05 | Integrasi Pembayaran Simulasi | Frontend, Backend, PESANAN, PEMBAYARAN | Customer menjalankan simulasi pembayaran. | Informasi pembayaran tersimpan dan terhubung dengan pesanan terkait. | P1 |
| TS-INT-06 | Integrasi Status dan Riwayat Pesanan | Backend, PESANAN, RIWAYAT_STATUS | Status pesanan diperbarui melalui proses yang diizinkan. | Status terkini dan riwayat perubahan tercatat secara konsisten. | P1 |
| TS-INT-07 | Integrasi Notifikasi | Backend, NOTIFIKASI, USER, PESANAN | Sistem menghasilkan pemberitahuan terkait pesanan. | Notifikasi tersimpan dan dapat ditampilkan kepada pengguna yang dituju. | P2 |
| TS-INT-08 | Integrasi Pengelolaan Tenant dan Menu | Frontend, Backend, TENANT, MENU, KATEGORI | Vendor mengelola informasi tenant dan menu. | Perubahan data tersimpan dan ditampilkan sesuai relasi yang berlaku. | P1 |

---

## 6. Skenario Pengujian Validasi dan Penanganan Kesalahan

| Scenario ID | Kondisi Pengujian | Alur Pengujian | Hasil yang Diharapkan | Prioritas |
|---|---|---|---|---|
| TS-VAL-01 | Input wajib kosong | Pengguna mengirim formulir tanpa mengisi informasi wajib. | Sistem menolak input dan memberikan pesan validasi. | P1 |
| TS-VAL-02 | Format input tidak sesuai | Pengguna memasukkan data dengan format yang tidak sesuai ketentuan. | Sistem menolak data yang tidak valid. | P1 |
| TS-VAL-03 | Kredensial tidak valid | Pengguna mencoba login dengan kredensial yang salah. | Sistem menolak autentikasi dan menampilkan pesan yang sesuai. | P1 |
| TS-VAL-04 | Jumlah item tidak valid | Customer memasukkan jumlah item yang tidak memenuhi ketentuan. | Sistem menolak perubahan jumlah dan menjaga konsistensi keranjang. | P1 |
| TS-VAL-05 | Menu tidak tersedia | Customer mencoba memesan menu yang tidak tersedia. | Sistem mencegah pemesanan menu yang tidak tersedia. | P1 |
| TS-VAL-06 | Data pesanan tidak ditemukan | Pengguna membuka pesanan yang tidak tersedia atau bukan hak aksesnya. | Sistem tidak menampilkan data yang tidak dapat diakses. | P1 |
| TS-VAL-07 | Akses tanpa autentikasi | Pengguna membuka halaman yang memerlukan autentikasi tanpa login. | Sistem menolak akses dan mengarahkan pengguna ke proses autentikasi. | P1 |
| TS-VAL-08 | Akses lintas peran | Pengguna mencoba menjalankan fungsi milik peran lain. | Sistem menolak tindakan yang tidak sesuai dengan hak akses. | P1 |

---

## 7. Keterkaitan dengan Test Cases

Setiap skenario pengujian harus memiliki referensi ke satu atau lebih test case yang menjelaskan langkah pengujian secara rinci.

Ketentuan keterkaitan:

1. Satu skenario dapat memiliki beberapa test case.
2. Setiap test case harus memiliki Scenario ID yang sesuai.
3. Setiap test case harus mengacu pada kebutuhan fungsional atau nonfungsional yang benar.
4. Skenario yang belum memiliki test case terperinci harus ditandai sebagai belum lengkap.
5. Hasil pengujian harus dicatat dalam dokumen `test-report.md` setelah pengujian benar-benar dilaksanakan.

Contoh format pemetaan:

| Scenario ID | Test Case Terkait | Status Pemetaan |
|---|---|---|
| TS-CUS-01 | TC-FR terkait registrasi | Perlu verifikasi |
| TS-CUS-07 | TC-FR terkait pembuatan pesanan | Perlu verifikasi |
| TS-CUS-08 | TC-FR terkait pembayaran simulasi | Perlu verifikasi |
| TS-VEN-10 | TC-FR terkait daftar pesanan Vendor | Perlu verifikasi |
| TS-ADM-02 | TC-FR terkait pengelolaan pengguna | Perlu verifikasi |
| TS-NFR-01 | TC-NFR terkait performa | Perlu verifikasi |
| TS-NFR-03 | TC-NFR terkait keamanan | Perlu verifikasi |

Pemetaan tersebut merupakan contoh struktur, bukan pemetaan final. Nomor test case dan requirement harus diperiksa kembali terhadap `functional-requirements.md`, `non-functional-requirements.md`, `test-cases.md`, dan `requirements-traceability-matrix.md`.

---

## 8. Kriteria Penyelesaian Pengujian

Skenario pengujian dinyatakan selesai apabila:

1. Alur pengujian telah dijalankan sesuai kondisi awal dan langkah yang ditentukan.
2. Hasil aktual telah dicatat.
3. Hasil aktual telah dibandingkan dengan hasil yang diharapkan.
4. Kegagalan pengujian telah dicatat sebagai defect untuk ditindaklanjuti.
5. Pengujian ulang dilakukan setelah perbaikan apabila diperlukan.
6. Status akhir pengujian telah didokumentasikan.

Status pengujian menggunakan kategori berikut:

| Status | Keterangan |
|---|---|
| Pass | Hasil aktual sesuai dengan hasil yang diharapkan. |
| Fail | Hasil aktual tidak sesuai dengan hasil yang diharapkan. |
| Blocked | Pengujian belum dapat dilaksanakan karena terdapat hambatan. |
| Not Tested | Pengujian belum dilaksanakan. |

---

## 9. Catatan dan Batasan

1. Pengujian pembayaran hanya mencakup mekanisme simulasi, bukan transaksi melalui penyedia payment gateway sungguhan.
2. Pengujian pengambilan pesanan menggunakan `nomor_antrean` yang tersimpan pada data pesanan.
3. Setiap pesanan hanya terhubung dengan satu tenant.
4. Pengujian tidak mencakup layanan pengantaran makanan.
5. Pengujian tidak boleh mengasumsikan adanya fitur yang tidak tercantum dalam ERD final.
6. Pengujian tidak boleh mengasumsikan status atau nilai enum yang belum ditetapkan dalam spesifikasi.
7. Skenario pengujian ini merupakan rancangan dan belum menunjukkan bahwa sistem telah berhasil diuji.

---

## 10. Penutup

Dokumen Test Scenarios menjadi acuan dalam pelaksanaan pengujian sistem LetsOrder.com. Skenario yang disusun mencakup proses utama Customer, Vendor, dan Administrator, serta pengujian integrasi, validasi, dan kualitas sistem.

Pelaksanaan pengujian harus dilakukan berdasarkan test case yang telah diverifikasi keterkaitannya dengan kebutuhan sistem. Hasil aktual, temuan kesalahan, dan tindak lanjut perbaikan selanjutnya didokumentasikan dalam `test-report.md`.