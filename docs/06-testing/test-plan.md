# Test Plan

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Test Plan |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Referensi Kualitas | ISO/IEC 25010 |

---

# 1. Pendahuluan

## 1.1 Tujuan Pengujian

Test Plan merupakan dokumen yang menjelaskan perencanaan, pendekatan, ruang lingkup, lingkungan, dan kriteria pengujian perangkat lunak pada sistem LetsOrder.com.

Pengujian dilakukan untuk memastikan bahwa sistem dapat menjalankan fungsi sesuai kebutuhan yang telah ditetapkan, memiliki kualitas yang memadai, serta memberikan pengalaman penggunaan yang baik bagi Customer, Vendor, dan Administrator.

Dokumen ini menjadi acuan bagi tim pengembang dan Quality Control dalam melaksanakan proses pengujian secara terstruktur.

## 1.2 Tujuan Dokumen

Dokumen ini memiliki tujuan sebagai berikut:

1. Menentukan ruang lingkup pengujian sistem.
2. Menetapkan strategi dan metode pengujian.
3. Mengidentifikasi kebutuhan lingkungan pengujian.
4. Menentukan kriteria keberhasilan dan kegagalan pengujian.
5. Menentukan tanggung jawab pelaksanaan pengujian.
6. Menjadi acuan dalam penyusunan test cases, test scenarios, dan test report.

## 1.3 Referensi Pengujian

Pelaksanaan pengujian mengacu pada dokumen proyek berikut:

| Dokumen | Kegunaan |
|---|---|
| `SRS.md` | Acuan kebutuhan perangkat lunak. |
| `functional-requirements.md` | Acuan pengujian fungsi sistem FR-01 sampai FR-42. |
| `non-functional-requirements.md` | Acuan pengujian kualitas sistem NFR-01 sampai NFR-27. |
| `user-requirements.md` | Acuan kebutuhan Customer, Vendor, dan Administrator. |
| `requirements-traceability-matrix.md` | Acuan keterlacakan kebutuhan terhadap pengujian. |
| `system-architecture.md` | Acuan arsitektur frontend, backend, dan database. |
| `database-design.md` | Acuan struktur dan relasi database. |
| `API-Specification.md` | Acuan komunikasi API antara frontend dan backend. |
| `UI-UX-Guidelines.md` | Acuan kesesuaian tampilan dan pengalaman pengguna. |

---

# 2. Ruang Lingkup Pengujian

## 2.1 Pengujian Fungsional

Pengujian fungsional dilakukan untuk memastikan seluruh fitur berjalan sesuai kebutuhan yang telah ditetapkan.

Cakupan pengujian meliputi:

| ID | Modul | Cakupan Pengujian |
|---|---|---|
| TF-01 | Authentication | Registrasi, login, dan autentikasi pengguna. |
| TF-02 | Tenant | Penampilan dan pengelolaan informasi tenant. |
| TF-03 | Kategori | Penampilan informasi kategori menu. |
| TF-04 | Menu | Penampilan, penambahan, perubahan, dan penghapusan menu. |
| TF-05 | Cart | Penambahan, perubahan, dan penghapusan item keranjang. |
| TF-06 | Order | Pembuatan dan pengelolaan pesanan. |
| TF-07 | Payment | Pembuatan dan verifikasi pembayaran simulasi. |
| TF-08 | Order Tracking | Penampilan status terkini dan riwayat status pesanan. |
| TF-09 | Order History | Penampilan riwayat pesanan Customer. |
| TF-10 | Notification | Penampilan dan perubahan status baca notifikasi. |
| TF-11 | Vendor Management | Pengelolaan tenant, menu, dan pesanan sesuai kewenangan Vendor. |
| TF-12 | Administrator | Pengelolaan data pengguna dan tenant. |
| TF-13 | Self-Pickup | Penggunaan nomor antrean dan penyelesaian proses pengambilan pesanan. |

## 2.2 Pengujian Non-Fungsional

Pengujian non-fungsional dilakukan untuk mengevaluasi kualitas sistem berdasarkan kebutuhan yang telah ditetapkan.

Cakupan pengujian meliputi:

| Aspek | Fokus Pengujian |
|---|---|
| Performance Efficiency | Waktu respons dan waktu pemuatan halaman. |
| Security | Autentikasi, otorisasi, validasi input, dan perlindungan data. |
| Usability | Kemudahan penggunaan dan kejelasan antarmuka. |
| Reliability | Konsistensi dan kestabilan fungsi sistem. |
| Compatibility | Kesesuaian penggunaan pada browser dan perangkat yang didukung. |
| Maintainability | Keteraturan struktur kode dan kemudahan pemeliharaan. |

Pengujian mengikuti rincian NFR-01 sampai NFR-27 pada dokumen Non-Functional Requirements.

## 2.3 Pengujian Integrasi

Pengujian integrasi dilakukan untuk memastikan setiap bagian sistem dapat berkomunikasi dan bekerja bersama dengan benar.

Bagian yang diuji meliputi:

1. Integrasi React dengan API Laravel.
2. Integrasi Laravel dengan database MySQL.
3. Integrasi autentikasi dan pembatasan hak akses.
4. Integrasi keranjang dengan proses pembuatan pesanan.
5. Integrasi pesanan dengan pembayaran simulasi.
6. Integrasi perubahan status dengan riwayat status.
7. Integrasi perubahan status dengan notifikasi.

## 2.4 Pengujian Antarmuka

Pengujian antarmuka dilakukan dengan membandingkan hasil implementasi frontend dengan rancangan UI/UX yang telah disepakati.

Cakupan pengujian:

- Customer Interface.
- Vendor Interface.
- Administrator Interface setelah rancangan tersedia.
- Navigasi ant halaman.
- Tampilan komponen.
- Responsivitas.
- Pesan kesalahan dan umpan balik sistem.

---

# 3. Strategi dan Metode Pengujian

## 3.1 Black Box Testing

Black Box Testing digunakan untuk menguji fungsi sistem berdasarkan input dan output tanpa harus memeriksa implementasi internal kode program.

Pengujian dilakukan dengan memberikan masukan tertentu, kemudian membandingkan hasil aktual dengan hasil yang diharapkan.

Contoh:

| Fitur | Input | Hasil yang Diharapkan |
|---|---|---|
| Login | Email dan password valid | Pengguna berhasil masuk. |
| Login | Password tidak sesuai | Sistem menampilkan pesan kesalahan. |
| Tambah menu | Data menu valid | Menu berhasil disimpan. |
| Tambah keranjang | Menu tersedia dan jumlah valid | Item berhasil ditambahkan. |
| Buat pesanan | Keranjang berisi item valid dari satu tenant | Pesanan berhasil dibuat. |
| Pembayaran simulasi | Data pembayaran valid | Data pembayaran berhasil diproses sesuai mekanisme simulasi. |

## 3.2 Unit Testing

Unit Testing dilakukan untuk memeriksa bagian terkecil dari aplikasi secara terpisah.

Pengujian difokuskan pada fungsi atau komponen yang memiliki tanggung jawab tertentu, seperti:

- Validasi input.
- Perhitungan subtotal dan total pesanan.
- Pemeriksaan ketersediaan menu.
- Validasi perubahan status.
- Pemeriksaan hak akses.
- Pengolahan data pada backend.

## 3.3 Integration Testing

Integration Testing dilakukan untuk memastikan beberapa komponen dapat bekerja bersama.

Contoh pengujian:

- Frontend mengirim request dan menerima response dari backend.
- Backend mengambil data menu dari MySQL.
- Data keranjang digunakan dalam pembuatan pesanan.
- Pembuatan pesanan menghasilkan data yang sesuai pada tabel terkait.
- Perubahan status pesanan tercatat pada RIWAYAT_STATUS.
- Notifikasi dapat dikaitkan dengan pengguna dan pesanan.

## 3.4 System Testing

System Testing dilakukan terhadap aplikasi secara keseluruhan setelah komponen utama selesai diintegrasikan.

Pengujian mencakup alur penggunaan dari autentikasi hingga proses pemesanan dan self-pickup.

## 3.5 User Acceptance Testing (UAT)

UAT dilakukan untuk memastikan sistem memenuhi kebutuhan pengguna yang menjadi target aplikasi.

Pihak yang dilibatkan:

1. Perwakilan Customer.
2. Perwakilan Vendor.
3. Administrator atau pihak yang mewakili pengelola sistem.

UAT dilakukan berdasarkan skenario penggunaan yang telah disiapkan. Hasilnya digunakan untuk menilai apakah sistem sudah sesuai dengan kebutuhan pengguna.

---

# 4. Lingkungan Pengujian

## 4.1 Lingkungan Perangkat Lunak

| Komponen | Teknologi |
|---|---|
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Browser | Browser modern yang ditetapkan untuk pengujian |
| Format komunikasi | RESTful API dengan JSON |
| Sistem operasi | Lingkungan pengembangan yang kompatibel dengan teknologi proyek |

Versi perangkat lunak dan browser yang digunakan harus dicatat ketika pengujian dilaksanakan.

## 4.2 Lingkungan Perangkat Keras

Pengujian dapat menggunakan perangkat komputer atau laptop yang mampu menjalankan frontend, backend, dan database secara bersamaan.

Spesifikasi perangkat pengujian perlu dicatat agar hasil pengujian performa dapat dianalisis secara tepat.

## 4.3 Data Pengujian

Data pengujian harus disiapkan berdasarkan struktur database final.

Data yang digunakan dapat mencakup:

- Akun Customer.
- Akun Vendor.
- Akun Administrator.
- Data tenant.
- Data kategori.
- Data menu.
- Data keranjang.
- Data pesanan.
- Data detail pesanan.
- Data pembayaran simulasi.
- Data riwayat status.
- Data notifikasi.

Data pengujian harus menggunakan data contoh dan tidak menggunakan kredensial pribadi atau data sensitif pengguna sebenarnya.

## 4.4 Lingkungan Database

Pengujian menggunakan database MySQL khusus untuk lingkungan pengujian.

Ketentuan:

1. Struktur tabel harus mengikuti database design final.
2. Relasi antarentitas harus sesuai ERD.
3. Data awal harus disiapkan sebelum pengujian.
4. Data pengujian harus dapat diatur ulang apabila diperlukan.
5. Pengujian tidak boleh mengganggu database produksi apabila nantinya sistem telah diterapkan.

---

# 5. Kriteria Pengujian

## 5.1 Entry Criteria

Pengujian dapat dimulai apabila kondisi berikut terpenuhi:

1. Dokumen kebutuhan sistem telah tersedia.
2. Rancangan sistem dan database telah ditetapkan.
3. Fitur yang akan diuji telah selesai dikembangkan.
4. Frontend dan backend dapat dijalankan.
5. Database pengujian telah disiapkan.
6. Data pengujian telah tersedia.
7. Skenario dan test cases telah disusun.
8. Lingkungan pengujian dapat digunakan.

## 5.2 Exit Criteria

Pengujian dapat dinyatakan selesai apabila:

1. Seluruh test case yang direncanakan telah dijalankan atau memiliki alasan penundaan yang terdokumentasi.
2. Hasil aktual setiap pengujian telah dicatat.
3. Tidak terdapat defect kritis atau tinggi yang belum diselesaikan untuk fitur yang akan dirilis.
4. Kebutuhan fungsional utama telah memenuhi kriteria penerimaan.
5. Kebutuhan non-fungsional telah dievaluasi berdasarkan metode pengujian yang sesuai.
6. Hasil pengujian telah didokumentasikan dalam Test Report.
7. Hasil UAT telah dievaluasi oleh pihak terkait.

Kriteria kelulusan akhir harus disetujui oleh tim proyek sebelum sistem dinyatakan siap dirilis.

## 5.3 Pass dan Fail Criteria

| Status | Keterangan |
|---|---|
| Pass | Hasil aktual sesuai dengan hasil yang diharapkan. |
| Fail | Hasil aktual tidak sesuai dengan hasil yang diharapkan. |
| Blocked | Pengujian tidak dapat dilakukan karena terdapat ketergantungan atau kendala. |
| Not Tested | Pengujian belum dilaksanakan. |

---

# 6. Prioritas dan Tingkat Keparahan Defect

## 6.1 Prioritas Pengujian

| Prioritas | Keterangan | Contoh |
|---|---|---|
| P1 - Critical | Fungsi utama sistem tidak dapat digunakan atau menimbulkan risiko serius. | Customer tidak dapat membuat pesanan. |
| P2 - High | Fungsi penting mengalami gangguan tetapi sebagian sistem masih dapat digunakan. | Vendor tidak dapat memperbarui status pesanan. |
| P3 - Medium | Gangguan pada fungsi pendukung yang tidak menghentikan alur utama. | Riwayat pesanan tidak tersusun sesuai urutan yang diharapkan. |
| P4 - Low | Gangguan tampilan atau detail kecil yang tidak menghambat fungsi utama. | Jarak antar elemen antarmuka tidak konsisten. |

## 6.2 Kategori Defect

| Tingkat | Keterangan |
|---|---|
| Critical | Sistem mengalami kegagalan serius atau terdapat masalah keamanan yang berdampak besar. |
| High | Fungsi utama tidak berjalan sesuai kebutuhan. |
| Medium | Fungsi berjalan sebagian atau menghasilkan kesalahan yang masih memiliki alternatif penggunaan. |
| Low | Kesalahan minor yang tidak memengaruhi fungsi utama. |

Setiap defect harus memiliki identitas, deskripsi, langkah reproduksi, hasil yang diharapkan, hasil aktual, tingkat keparahan, dan status penyelesaian.

---

# 7. Peran dan Tanggung Jawab

Pelaksanaan pengujian mengikuti pembagian tim proyek yang telah ditetapkan.

| Anggota | Peran | Tanggung Jawab Pengujian |
|---|---|---|
| Anggota 1 | Project Manager dan UI/UX Designer | Mengkoordinasikan proses pengujian dan mengevaluasi kesesuaian antarmuka dengan rancangan. |
| Anggota 2 | Backend Developer | Memperbaiki kesalahan pada backend dan mendukung pengujian API. |
| Anggota 3 | UI/UX Designer | Mengevaluasi tampilan, konsistensi desain, dan pengalaman pengguna. |
| Anggota 4 | Quality Control | Menyusun dan menjalankan pengujian serta mendokumentasikan hasilnya. |
| Anggota 5 | Backend Developer dan Quality Control | Mendukung perbaikan backend dan pelaksanaan pengujian teknis. |

Setiap anggota dapat bekerja sama dalam proses identifikasi, pelaporan, dan verifikasi perbaikan defect.

---

# 8. Tahapan Pelaksanaan Pengujian

Pengujian dilakukan secara bertahap mengikuti kesiapan fitur dan integrasi sistem.

| Tahap | Aktivitas | Hasil yang Diharapkan |
|---|---|---|
| 1. Persiapan | Memeriksa dokumen kebutuhan, menyiapkan lingkungan, dan data pengujian. | Lingkungan pengujian siap digunakan. |
| 2. Unit Testing | Menguji fungsi dan komponen secara terpisah. | Kesalahan pada unit dapat ditemukan lebih awal. |
| 3. Integration Testing | Menguji komunikasi frontend, backend, dan database. | Integrasi antarbagian berjalan sesuai kebutuhan. |
| 4. Functional Testing | Menguji fungsi Customer, Vendor, dan Administrator. | Fitur berjalan sesuai kebutuhan fungsional. |
| 5. Non-Functional Testing | Mengevaluasi performa, keamanan, usability, reliability, compatibility, dan maintainability. | Kualitas sistem dapat dievaluasi. |
| 6. System Testing | Menguji keseluruhan alur sistem. | Sistem dapat menjalankan alur utama secara terintegrasi. |
| 7. UAT | Melibatkan perwakilan pengguna untuk mengevaluasi sistem. | Kesesuaian sistem dengan kebutuhan pengguna dapat dinilai. |
| 8. Regression Testing | Menguji kembali fungsi yang terdampak setelah perbaikan. | Perbaikan tidak menimbulkan kerusakan pada fungsi lain. |
| 9. Dokumentasi | Mengumpulkan hasil dan menyusun laporan pengujian. | Test Report tersedia sebagai dokumentasi. |

---

# 9. Jadwal Pengujian

Pengujian disesuaikan dengan jadwal proyek LetsOrder.com yang memiliki durasi 16 minggu.

Berdasarkan jadwal proyek:

| Fase | Periode | Kegiatan yang Berkaitan dengan Pengujian |
|---|---|---|
| Fase 1 | Minggu 1–4 | Persiapan kebutuhan pengujian dan penyusunan rancangan test case. |
| Fase 2 | Minggu 5–10 | Pengujian unit dan integrasi secara bertahap selama pengembangan. |
| Fase 3 | Minggu 11–14 | Pengujian lintas browser dan perangkat, UAT, perbaikan bug, dan optimasi. |
| Fase 4 | Minggu 15–16 | Penyelesaian dokumentasi pengujian dan penutupan proyek. |

Pembagian aktivitas tersebut merupakan pemetaan kegiatan pengujian terhadap fase proyek, bukan jadwal pelaksanaan setiap test case secara terperinci.

---

# 10. Risiko Pengujian

Beberapa risiko yang dapat memengaruhi pelaksanaan pengujian antara lain:

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| TR-01 | Fitur belum selesai ketika jadwal pengujian dimulai. | Pengujian tertunda. | Menyesuaikan prioritas pengujian dengan kesiapan fitur. |
| TR-02 | Lingkungan pengujian mengalami gangguan. | Pengujian tidak dapat berjalan. | Memeriksa konfigurasi dan kesiapan lingkungan sebelum pengujian. |
| TR-03 | Data pengujian tidak sesuai dengan struktur ERD. | Hasil pengujian tidak akurat. | Memvalidasi data berdasarkan database design final. |
| TR-04 | Integrasi frontend dan backend mengalami kesalahan. | Fungsi sistem tidak berjalan secara menyeluruh. | Melakukan integration testing secara bertahap. |
| TR-05 | Defect ditemukan menjelang akhir proyek. | Perbaikan dapat mengganggu jadwal. | Memprioritaskan defect berdasarkan dampak dan tingkat keparahan. |
| TR-06 | Hasil pengujian tidak terdokumentasi dengan baik. | Sulit melakukan evaluasi dan penelusuran kesalahan. | Menggunakan format test case dan test report yang konsisten. |

---

# 11. Deliverables Pengujian

Dokumen dan hasil yang harus dihasilkan selama proses pengujian meliputi:

| No. | Deliverable | Keterangan |
|---|---|---|
| 1 | Test Plan | Dokumen perencanaan pengujian. |
| 2 | Test Cases | Daftar kasus pengujian beserta input dan hasil yang diharapkan. |
| 3 | Test Scenarios | Skenario alur pengujian berdasarkan aktivitas pengguna. |
| 4 | Test Report | Dokumentasi hasil pengujian dan evaluasi. |
| 5 | Defect Records | Catatan kesalahan yang ditemukan selama pengujian. |
| 6 | UAT Results | Dokumentasi hasil penerimaan pengguna. |

---

# 12. Penutup

Test Plan ini menjadi pedoman pelaksanaan pengujian sistem LetsOrder.com agar proses evaluasi perangkat lunak dapat dilakukan secara terstruktur dan terdokumentasi.

Pengujian mencakup aspek fungsional, non-fungsional, integrasi, antarmuka, dan penerimaan pengguna. Seluruh kegiatan pengujian harus mengacu pada kebutuhan sistem serta struktur database yang telah ditetapkan.

Hasil pengujian akan digunakan untuk mengidentifikasi kekurangan sistem, memverifikasi perbaikan, dan menilai kesiapan LetsOrder.com sebelum diterapkan.