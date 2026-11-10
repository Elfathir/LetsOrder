# Project Charter — LetsOrder.com

**Nama Proyek:** LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ  
**Versi Dokumen:** 1.0  
**Status:** Draft  
**Tanggal:** 4 November 2026  
**Project Manager:** Anggota 1

---

## 1. Informasi Umum Proyek

| Komponen | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Judul Proyek | Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ |
| Jenis Proyek | Pengembangan aplikasi berbasis web |
| Lokasi Implementasi | Kantin UPNVJ |
| Project Manager | Anggota 1 |
| Jumlah Anggota Tim | 5 orang |
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Metode Pengembangan | Agile dengan pendekatan Scrum |
| Standar Kualitas Acuan | ISO/IEC 25010 |

## 2. Latar Belakang Proyek

Kantin UPNVJ merupakan salah satu fasilitas yang digunakan mahasiswa untuk memenuhi kebutuhan makan dan minum di lingkungan kampus. Pada waktu-waktu tertentu, khususnya jam istirahat dan makan siang, aktivitas pemesanan dapat menyebabkan antrean fisik. Mahasiswa perlu menghabiskan waktu untuk melihat menu, melakukan pemesanan, dan menunggu pesanan disiapkan.

Kondisi tersebut berpotensi mengurangi waktu yang dapat digunakan mahasiswa untuk kegiatan akademik maupun aktivitas lainnya. Di sisi lain, proses pelayanan tenant juga perlu dikelola agar pesanan dapat diterima dan diproses dengan lebih teratur.

Berdasarkan permasalahan tersebut, dikembangkan LetsOrder.com sebagai sistem pemesanan makanan berbasis web dengan mekanisme self-pickup. Sistem memungkinkan customer melihat menu, melakukan pemesanan sebelum tiba di kantin, melakukan simulasi pembayaran digital, serta memantau status pesanan melalui aplikasi.

Dengan demikian, proyek ini diharapkan dapat membantu mengurangi ketergantungan pada proses pemesanan langsung dan mendukung pengelolaan pesanan tenant secara digital.

## 3. Tujuan Proyek

Proyek LetsOrder.com memiliki tujuan sebagai berikut:

1. Mengurangi antrean fisik pada proses pemesanan makanan di Kantin UPNVJ.
2. Menyediakan informasi menu, harga, dan ketersediaan menu secara digital.
3. Memfasilitasi customer dalam melakukan pemesanan makanan melalui aplikasi web.
4. Menyediakan simulasi pembayaran digital menggunakan QRIS.
5. Memungkinkan customer memantau perkembangan status pesanan.
6. Memfasilitasi tenant dalam mengelola informasi tenant dan menu.
7. Mendukung proses pengambilan pesanan secara mandiri melalui nomor antrean.
8. Menyediakan informasi riwayat pesanan dan notifikasi.
9. Mendukung administrator dalam mengelola data pengguna dan tenant.
10. Menargetkan waktu pemuatan halaman aplikasi di bawah 2 detik.

Tujuan tersebut merupakan target proyek yang akan dievaluasi melalui proses pengembangan dan pengujian, bukan hasil yang sudah dicapai.

## 4. Ruang Lingkup Proyek

### 4.1 Ruang Lingkup yang Termasuk

Pengembangan LetsOrder.com mencakup:

- Autentikasi dan pengelolaan akses berdasarkan peran pengguna.
- Katalog menu dan informasi tenant.
- Pengelolaan informasi tenant dan menu.
- Pengelolaan kategori menu.
- Keranjang belanja.
- Pembuatan dan pengelolaan pesanan.
- Simulasi pembayaran digital menggunakan QRIS.
- Pemantauan status pesanan.
- Riwayat status pesanan.
- Riwayat pemesanan customer.
- Notifikasi terkait pesanan.
- Pengambilan pesanan secara mandiri menggunakan nomor antrean.
- Pengelolaan data pengguna dan tenant oleh administrator.

### 4.2 Ruang Lingkup yang Tidak Termasuk

Proyek ini tidak mencakup:

- Pengembangan aplikasi native Android dan iOS.
- Layanan pengantaran makanan.
- Integrasi payment gateway untuk transaksi keuangan nyata.
- Laporan keuangan tenant tingkat lanjut.
- Pengelolaan persediaan bahan baku.
- Pengelolaan beberapa staf dalam satu tenant.
- Dukungan untuk banyak kampus.
- Fitur promo dan diskon.
- Fitur rating dan ulasan.
- Fitur favorit dan rekomendasi menu.

## 5. Deliverables Proyek

Hasil utama yang diharapkan dari proyek ini meliputi:

| No. | Deliverable | Deskripsi |
|---:|---|---|
| 1 | Dokumen Product Management | PRD, product vision, product roadmap, feature prioritization, dan user stories. |
| 2 | Dokumen Project Overview | Latar belakang, tujuan, ruang lingkup, dan struktur tim proyek. |
| 3 | Dokumen Project Management | Project charter, WBS, jadwal proyek, dan manajemen risiko. |
| 4 | Dokumen Requirements | SRS, kebutuhan fungsional, nonfungsional, kebutuhan pengguna, dan traceability matrix. |
| 5 | Dokumen System Design | Arsitektur sistem, desain database, spesifikasi API, dan pedoman UI/UX. |
| 6 | Database System | Database MySQL yang mengikuti ERD final. |
| 7 | Frontend Application | Antarmuka web berbasis React. |
| 8 | Backend Application | Layanan backend berbasis Laravel. |
| 9 | Dokumen Testing | Test plan, test cases, test scenarios, dan test report. |
| 10 | Dokumen Deployment dan User Guide | Panduan instalasi, deployment, konfigurasi lingkungan, dan penggunaan sistem. |

## 6. Struktur Tim Proyek

Proyek dilaksanakan oleh lima anggota dengan pembagian peran sebagai berikut:

| No. | Anggota | Peran |
|---:|---|---|
| 1 | Anggota 1 | Project Manager dan UI/UX Designer |
| 2 | Anggota 2 | Backend Developer |
| 3 | Anggota 3 | UI/UX Designer |
| 4 | Anggota 4 | Quality Control |
| 5 | Anggota 5 | Backend Developer dan Quality Control |

### 6.1 Tanggung Jawab Utama

- **Project Manager:** mengoordinasikan perencanaan, pelaksanaan, pemantauan, dan evaluasi proyek.
- **UI/UX Designer:** merancang antarmuka dan alur interaksi pengguna.
- **Backend Developer:** mengembangkan logika aplikasi, API, dan integrasi database.
- **Quality Control:** menyusun serta melaksanakan pengujian dan mendokumentasikan temuan.

Pembagian tanggung jawab secara lebih terperinci dijelaskan dalam dokumen `project-team.md`.

## 7. Pemangku Kepentingan

Pihak-pihak yang berkaitan dengan pengembangan dan penggunaan sistem meliputi:

| Stakeholder | Kepentingan dan Tanggung Jawab |
|---|---|
| Customer | Mengakses katalog menu, melakukan pemesanan, melakukan simulasi pembayaran, memantau status, dan mengambil pesanan. |
| Vendor | Mengelola informasi tenant, menu, serta memproses pesanan yang diterima. |
| Administrator | Mengelola data pengguna dan tenant sesuai kewenangan sistem. |
| Tim Pengembang | Merancang, membangun, menguji, dan mendokumentasikan aplikasi. |
| Pihak Kantin UPNVJ | Menjadi lingkungan penerapan sistem dan pihak yang berkaitan dengan operasional kantin. |

## 8. Teknologi dan Sumber Daya

### 8.1 Teknologi yang Digunakan

| Teknologi | Fungsi |
|---|---|
| React | Pengembangan antarmuka frontend. |
| Laravel | Pengembangan backend dan API. |
| MySQL | Penyimpanan dan pengelolaan data. |
| Figma | Perancangan UI/UX. |
| GitHub | Pengelolaan kode sumber dan kolaborasi tim. |
| Postman | Pengujian API. |
| Visual Studio Code | Lingkungan pengembangan kode. |

### 8.2 Sumber Daya

Sumber daya utama yang diperlukan meliputi:
- Lima anggota tim pengembang sesuai pembagian peran.
- Perangkat komputer atau laptop untuk pengembangan.
- Koneksi internet.
- Perangkat lunak dan tools pendukung.
- Lingkungan pengembangan frontend, backend, dan database.
- Dokumen kebutuhan serta rancangan sistem.

## 9. Asumsi dan Batasan Proyek

### 9.1 Asumsi

Pelaksanaan proyek didasarkan pada asumsi berikut:

1. Customer, vendor, dan administrator memiliki perangkat yang dapat mengakses aplikasi melalui browser.
2. Pengguna memiliki koneksi internet untuk mengakses sistem.
3. Informasi menu dan harga disediakan oleh pihak yang berwenang.
4. Vendor memperbarui ketersediaan menu dan status pesanan secara berkala.
5. Customer mengambil pesanan secara langsung di tenant terkait.
6. Simulasi pembayaran digital digunakan untuk kebutuhan demonstrasi sistem dan bukan transaksi keuangan nyata.

### 9.2 Batasan

Batasan utama proyek meliputi:

1. Sistem dikembangkan dalam bentuk aplikasi berbasis web.
2. Teknologi yang digunakan adalah React, Laravel, dan MySQL.
3. Satu pesanan hanya berkaitan dengan satu tenant.
4. Identifikasi pengambilan pesanan menggunakan nomor antrean.
5. Pembayaran QRIS hanya berupa simulasi.
6. Pengembangan mengikuti struktur sebelas entitas pada ERD final.
7. Fitur yang membutuhkan entitas atau atribut tambahan di luar ERD final tidak termasuk dalam implementasi.

## 10. Risiko Awal Proyek

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-01 | Perubahan kebutuhan selama pengembangan | Perubahan desain dan pekerjaan yang sudah direncanakan. | Melakukan evaluasi kebutuhan dan pengendalian perubahan. |
| R-02 | Ketidaksesuaian implementasi dengan ERD | Struktur database dan proses aplikasi menjadi tidak konsisten. | Menjadikan ERD final sebagai acuan implementasi. |
| R-03 | Kendala integrasi frontend dan backend | Fitur tidak berjalan sesuai alur yang direncanakan. | Menetapkan kontrak API dan melakukan pengujian integrasi. |
| R-04 | Keterlambatan penyelesaian tugas | Mengganggu urutan dan target penyelesaian pekerjaan. | Memantau progres dan menyesuaikan prioritas pekerjaan. |
| R-05 | Bug pada fitur utama | Mengurangi keandalan sistem. | Melaksanakan pengujian dan perbaikan secara bertahap. |
| R-06 | Kurangnya koordinasi antaranggota | Terjadi tumpang tindih pekerjaan atau perbedaan pemahaman. | Melakukan koordinasi dan pencatatan pembagian tugas. |

Risiko tersebut merupakan identifikasi awal dan dapat diperbarui selama proyek berlangsung.

## 11. Kriteria Keberhasilan Proyek

Proyek dinyatakan berhasil apabila memenuhi kriteria berikut:

1. Aplikasi dapat diakses melalui browser sesuai lingkungan implementasi.
2. Customer dapat melakukan pemesanan melalui alur yang telah ditetapkan.
3. Vendor dapat mengelola menu dan memproses pesanan.
4. Simulasi pembayaran digital dapat dijalankan sesuai rancangan.
5. Customer dapat memantau status pesanan dan melihat riwayat pesanan.
6. Proses self-pickup dapat menggunakan nomor antrean.
7. Administrator dapat menjalankan fungsi pengelolaan data sesuai kewenangannya.
8. Implementasi database sesuai dengan ERD final.
9. Fitur utama telah melalui pengujian dan memenuhi kriteria penerimaan.
10. Dokumentasi teknis dan panduan pengguna tersedia.
11. Target waktu pemuatan halaman di bawah 2 detik dievaluasi melalui pengujian performa.

## 12. Metode Pengembangan dan Pengendalian Proyek

Pengembangan LetsOrder.com menggunakan pendekatan Agile dengan kerangka kerja Scrum. Pekerjaan dibagi ke dalam beberapa iterasi agar tim dapat mengembangkan, mengevaluasi, dan memperbaiki sistem secara bertahap.

Pengendalian proyek dilakukan melalui:
- Perencanaan pekerjaan berdasarkan prioritas fitur.
- Pembagian pekerjaan berdasarkan deliverable dan kebutuhan sistem.
- Pemantauan progres secara berkala.
- Pengujian terhadap hasil implementasi.
- Evaluasi kendala dan risiko.
- Dokumentasi perubahan kebutuhan dan keputusan proyek.

Rincian pekerjaan dan urutan pelaksanaannya akan dijelaskan lebih lanjut dalam dokumen WBS dan project schedule.

## 13. Persetujuan Project Charter

Project Charter ini menjadi dasar awal pelaksanaan proyek LetsOrder.com. Persetujuan dokumen menunjukkan bahwa pihak terkait memahami tujuan, ruang lingkup, tanggung jawab, dan batasan utama proyek.

| Pihak | Nama | Persetujuan |
|---|---|---|
| Project Manager | Anggota 1 | Menunggu persetujuan |
| Perwakilan Tim Pengembang | Diisi kemudian | Menunggu persetujuan |
| Pihak terkait proyek | Diisi jika diperlukan | Menunggu persetujuan |

---

**Akhir Dokumen Project Charter — LetsOrder.com**