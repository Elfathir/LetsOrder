# Project Schedule — LetsOrder.com

**Nama Proyek:** LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ  
**Versi Dokumen:** 1.0  
**Status:** Draft  
**Tanggal:** 10 November 2026  
**Project Manager:** Anggota 1

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Project Schedule merupakan dokumen yang menjelaskan rencana urutan pelaksanaan kegiatan pengembangan LetsOrder.com. Dokumen ini digunakan sebagai acuan bagi tim dalam mengatur aktivitas, memantau perkembangan pekerjaan, serta memastikan setiap tahapan dilaksanakan sesuai dependensi dan prioritas yang telah ditentukan.

### 1.2 Dasar Penyusunan Jadwal

Penyusunan jadwal proyek mengacu pada beberapa dokumen berikut:

- Project Charter sebagai dasar pelaksanaan proyek.
- Project Scope sebagai batasan pekerjaan.
- Product Roadmap sebagai acuan urutan pengembangan fitur.
- Feature Prioritization sebagai dasar penentuan prioritas.
- User Stories sebagai acuan kebutuhan pengguna.
- ERD final sebagai acuan struktur database.

Jadwal ini bersifat awal dan dapat diperbarui setelah tanggal pelaksanaan serta estimasi durasi setiap pekerjaan disepakati oleh tim.

## 2. Pendekatan Penjadwalan

Pengembangan LetsOrder.com direncanakan menggunakan pendekatan Agile dengan kerangka kerja Scrum. Aktivitas pengembangan dibagi menjadi beberapa fase yang saling berkaitan berdasarkan dependensi pekerjaan.

Setiap fase memiliki aktivitas utama, hasil yang diharapkan, dan kriteria penyelesaian. Beberapa aktivitas dapat dilaksanakan secara paralel apabila tidak memiliki ketergantungan langsung.

Penjadwalan dilakukan berdasarkan:
1. Prioritas fitur.
2. Ketergantungan antaraktivitas.
3. Ketersediaan anggota tim.
4. Kesiapan desain dan kebutuhan sistem.
5. Hasil pengujian pada setiap tahapan.

## 3. Rencana Tahapan Proyek

| ID | Tahapan | Aktivitas Utama | Hasil yang Diharapkan |
|---|---|---|---|
| SCH-01 | Persiapan dan Autentikasi | Finalisasi kebutuhan, persiapan lingkungan pengembangan, struktur proyek, dan autentikasi. | Fondasi aplikasi dan autentikasi pengguna. |
| SCH-02 | Pengelolaan Tenant dan Menu | Pengembangan pengelolaan tenant, kategori, serta menu. | Fitur pengelolaan tenant dan menu. |
| SCH-03 | Katalog Menu | Pengembangan tampilan katalog, informasi tenant, dan detail menu. | Katalog menu yang dapat diakses customer. |
| SCH-04 | Keranjang Belanja | Pengembangan keranjang dan pengelolaan item keranjang. | Fitur pengelolaan keranjang belanja. |
| SCH-05 | Pemesanan dan Pembayaran | Pengembangan pembuatan pesanan, detail pesanan, dan simulasi pembayaran. | Proses pemesanan dan simulasi pembayaran. |
| SCH-06 | Pelacakan dan Self-Pickup | Pengembangan perubahan status, riwayat status, dan penggunaan nomor antrean. | Fitur pelacakan pesanan dan self-pickup. |
| SCH-07 | Riwayat dan Notifikasi | Pengembangan riwayat pesanan dan notifikasi. | Informasi riwayat serta notifikasi terkait pesanan. |
| SCH-08 | Pengelolaan Administrator | Pengembangan fungsi administrator untuk mengelola data pengguna dan tenant. | Fungsi pengelolaan administrator. |
| SCH-09 | Pengujian dan Evaluasi | Pengujian fungsional, integrasi, perbaikan bug, dan pengujian performa. | Hasil pengujian dan evaluasi sistem. |
| SCH-10 | Persiapan Deployment dan Dokumentasi | Konfigurasi lingkungan, penyusunan panduan instalasi, deployment, dan panduan pengguna. | Aplikasi siap diterapkan sesuai lingkungan yang ditentukan dan dokumentasi tersedia. |

**Catatan:** SCH-09 dan SCH-10 merupakan tahapan pendukung yang dilakukan terhadap hasil pengembangan. Pengujian juga dilaksanakan secara bertahap selama fase pengembangan, bukan hanya pada akhir proyek.

## 4. Detail Aktivitas dan Dependensi

| ID | Aktivitas | Dependensi | Prioritas |
|---|---|---|---|
| ACT-01 | Finalisasi kebutuhan dan ruang lingkup | - | Tinggi |
| ACT-02 | Persiapan repository dan lingkungan pengembangan | ACT-01 | Tinggi |
| ACT-03 | Implementasi autentikasi dan hak akses | ACT-02 | Tinggi |
| ACT-04 | Implementasi pengelolaan tenant | ACT-03 | Tinggi |
| ACT-05 | Implementasi kategori dan pengelolaan menu | ACT-04 | Tinggi |
| ACT-06 | Implementasi katalog menu | ACT-05 | Tinggi |
| ACT-07 | Implementasi keranjang belanja | ACT-06 | Tinggi |
| ACT-08 | Implementasi pembuatan pesanan dan detail pesanan | ACT-07 | Tinggi |
| ACT-09 | Implementasi simulasi pembayaran | ACT-08 | Tinggi |
| ACT-10 | Implementasi pelacakan dan riwayat status | ACT-08 | Tinggi |
| ACT-11 | Implementasi self-pickup menggunakan nomor antrean | ACT-10 | Tinggi |
| ACT-12 | Implementasi riwayat pesanan | ACT-08 | Sedang |
| ACT-13 | Implementasi notifikasi | ACT-08, ACT-10 | Sedang |
| ACT-14 | Implementasi pengelolaan administrator | ACT-03, ACT-04 | Sedang |
| ACT-15 | Pengujian integrasi dan fungsional | Implementasi fitur terkait | Tinggi |
| ACT-16 | Perbaikan bug dan pengujian ulang | ACT-15 | Tinggi |
| ACT-17 | Pengujian performa | Implementasi fitur utama | Sedang |
| ACT-18 | Persiapan deployment dan dokumentasi | ACT-16, ACT-17 | Tinggi |

Dependensi menunjukkan urutan logis penyelesaian aktivitas. Aktivitas yang tidak memiliki ketergantungan langsung dapat dikerjakan secara paralel setelah kebutuhan dan sumber daya tersedia.

## 5. Rencana Penjadwalan Berdasarkan Fase

| Fase | Aktivitas yang Dilaksanakan | Fokus Penyelesaian |
|---|---|---|
| Fase 1 | ACT-01 sampai ACT-03 | Persiapan proyek dan autentikasi. |
| Fase 2 | ACT-04 sampai ACT-05 | Pengelolaan tenant, kategori, dan menu. |
| Fase 3 | ACT-06 | Katalog menu. |
| Fase 4 | ACT-07 | Keranjang belanja. |
| Fase 5 | ACT-08 sampai ACT-09 | Pemesanan dan simulasi pembayaran. |
| Fase 6 | ACT-10 sampai ACT-11 | Pelacakan pesanan dan self-pickup. |
| Fase 7 | ACT-12 sampai ACT-13 | Riwayat pesanan dan notifikasi. |
| Fase 8 | ACT-14 | Pengelolaan administrator. |
| Fase 9 | ACT-15 sampai ACT-17 | Pengujian, perbaikan, dan evaluasi. |
| Fase 10 | ACT-18 | Persiapan deployment dan dokumentasi. |

## 6. Milestone Proyek

Milestone merupakan titik pencapaian penting yang digunakan untuk mengevaluasi perkembangan proyek.

| ID | Milestone | Indikator Pencapaian |
|---|---|---|
| MS-01 | Persiapan Proyek Selesai | Kebutuhan, ruang lingkup, repository, dan lingkungan pengembangan siap. |
| MS-02 | Autentikasi Selesai | Pengguna dapat melakukan autentikasi sesuai peran. |
| MS-03 | Pengelolaan Tenant dan Menu Selesai | Pengelolaan tenant, kategori, dan menu dapat dijalankan. |
| MS-04 | Katalog dan Keranjang Selesai | Customer dapat melihat menu dan mengelola keranjang. |
| MS-05 | Pemesanan dan Pembayaran Selesai | Customer dapat membuat pesanan dan menjalankan simulasi pembayaran. |
| MS-06 | Pelacakan dan Self-Pickup Selesai | Status pesanan dapat dipantau dan nomor antrean tersedia untuk pengambilan. |
| MS-07 | Riwayat dan Notifikasi Selesai | Riwayat pesanan dan notifikasi dapat ditampilkan. |
| MS-08 | Pengelolaan Administrator Selesai | Fungsi pengelolaan data pengguna dan tenant tersedia. |
| MS-09 | Pengujian Selesai | Pengujian utama telah dilaksanakan dan temuan penting ditindaklanjuti. |
| MS-10 | Persiapan Rilis Selesai | Konfigurasi deployment dan dokumentasi tersedia. |

## 7. Pembagian Tanggung Jawab Penjadwalan

| Aktivitas | Penanggung Jawab Utama | Pihak Pendukung |
|---|---|---|
| Perencanaan dan pemantauan jadwal | Anggota 1 | Seluruh anggota |
| Desain UI/UX | Anggota 1 dan Anggota 3 | Backend Developer |
| Pengembangan backend | Anggota 2 dan Anggota 5 | UI/UX Designer |
| Pengujian dan evaluasi | Anggota 4 dan Anggota 5 | Backend Developer |
| Dokumentasi perkembangan | Anggota 1 | Seluruh anggota |
| Persiapan deployment | Tim pengembang | Sesuai pembagian tugas teknis |

Pembagian tanggung jawab ini mengikuti struktur tim pada dokumen `project-team.md`. Penugasan teknis lebih rinci dapat disesuaikan melalui task management.

## 8. Pemantauan dan Pengendalian Jadwal

Pemantauan jadwal dilakukan oleh Project Manager bersama seluruh anggota tim. Proses pemantauan bertujuan mengetahui kesesuaian perkembangan pekerjaan dengan rencana yang telah disepakati.

Kegiatan pemantauan meliputi:

1. Memeriksa status setiap aktivitas.
2. Membandingkan perkembangan aktual dengan rencana.
3. Mengidentifikasi aktivitas yang mengalami keterlambatan.
4. Menganalisis dampak keterlambatan terhadap aktivitas berikutnya.
5. Menentukan penyesuaian prioritas atau pembagian pekerjaan.
6. Memperbarui jadwal apabila terdapat perubahan yang telah disepakati.
7. Mendokumentasikan perubahan dan alasan penyesuaian.

Status aktivitas dapat menggunakan kategori berikut:

- **Not Started:** pekerjaan belum dimulai.
- **In Progress:** pekerjaan sedang berlangsung.
- **Under Review:** pekerjaan sedang diperiksa atau diuji.
- **Completed:** pekerjaan telah memenuhi kriteria penyelesaian.
- **Blocked:** pekerjaan terhambat oleh kendala atau dependensi.

## 9. Pengelolaan Perubahan Jadwal

Perubahan jadwal dapat terjadi akibat perubahan kebutuhan, kendala teknis, keterlambatan pekerjaan, atau hasil evaluasi pengujian.

Setiap perubahan jadwal dilakukan melalui tahapan berikut:

1. Mengidentifikasi alasan perubahan.
2. Menganalisis dampak terhadap aktivitas dan milestone.
3. Mendiskusikan perubahan bersama anggota tim.
4. Menetapkan penyesuaian yang disepakati.
5. Memperbarui dokumen jadwal.
6. Menginformasikan perubahan kepada pihak terkait.

Perubahan jadwal tidak boleh secara otomatis memperluas ruang lingkup atau menambahkan fitur yang tidak tercantum dalam dokumen kebutuhan dan ERD final.

## 10. Informasi dan Alokasi Jadwal Proyek

Berdasarkan perencanaan pada dokumen Laporan Awal Proyek Perangkat Lunak, pengembangan LetsOrder.com direncanakan berlangsung selama **16 minggu**, dimulai pada **18 Oktober 2026**. Pelaksanaan proyek dibagi menjadi empat fase utama, yaitu perencanaan dan desain awal, development dan integrasi, testing dan deployment, serta project closure.

### 10.1 Periode Pelaksanaan Proyek

| Informasi | Keterangan |
|---|---|
| Tanggal Mulai Proyek | 18 Oktober 2026 |
| Durasi Keseluruhan | 16 minggu |
| Metode Pengembangan | Agile dengan kerangka kerja Scrum |
| Jumlah Fase | 4 fase |
| Periode Pelaksanaan | Minggu ke-1 sampai minggu ke-16 |
| Hari Koordinasi Tim | Rabu dan Kamis |
| Media Komunikasi | WhatsApp dan Discord |

### 10.2 Alokasi Waktu Setiap Fase

| Fase | Periode | Durasi | Fokus Kegiatan |
|---|---|---:|---|
| Phase 1 — Perencanaan dan Desain Awal | Minggu 1–4 | 4 minggu | Pengumpulan kebutuhan sistem, perencanaan proyek, pembuatan wireframe UI/UX, dan prototyping aplikasi web serta dashboard vendor. |
| Phase 2 — Development dan Integrasi | Minggu 5–10 | 6 minggu | Pengembangan frontend dan backend, implementasi antarmuka pemesanan, dashboard vendor, serta integrasi sistem. |
| Phase 3 — Testing dan Deployment | Minggu 11–14 | 4 minggu | Pengujian lintas-browser dan lintas-device, User Acceptance Testing (UAT), perbaikan bug, serta optimasi sistem. |
| Phase 4 — Project Closure | Minggu 15–16 | 2 minggu | Penyusunan dokumentasi final, penyelesaian dan distribusi source code, serta demonstrasi akhir proyek. |
| **Total** | **Minggu 1–16** | **16 minggu** | |

### 10.3 Rencana Koordinasi Tim

Koordinasi antaranggota tim dilaksanakan secara sinkronus pada hari Rabu dan Kamis. Apabila pertemuan langsung tidak memungkinkan, komunikasi dilakukan secara asinkronus melalui grup WhatsApp dan platform komunikasi langsung atau audio conference seperti Discord.

Kegiatan koordinasi mencakup:
- Membahas perkembangan pekerjaan setiap anggota.
- Mengidentifikasi kendala selama pengembangan.
- Menyesuaikan prioritas pekerjaan berdasarkan kebutuhan proyek.
- Membahas hasil pengujian dan perbaikan sistem.
- Mengevaluasi pencapaian setiap fase dan Sprint.

### 10.4 Evaluasi dan Pengendalian Jadwal

Project Manager bertanggung jawab memantau pelaksanaan jadwal berdasarkan alokasi waktu yang telah ditetapkan. Evaluasi dilakukan secara berkala untuk memastikan aktivitas proyek tetap berjalan sesuai periode masing-masing fase.

Apabila terjadi keterlambatan atau perubahan kebutuhan, tim melakukan evaluasi terhadap dampaknya pada aktivitas berikutnya dan menentukan penyesuaian yang diperlukan tanpa mengabaikan ruang lingkup proyek.

**Catatan:** Pembagian minggu pada setiap fase merupakan baseline jadwal proyek berdasarkan dokumen perencanaan awal. Rincian tanggal mulai dan selesai setiap aktivitas maupun Sprint dapat ditentukan lebih lanjut melalui Sprint Planning dan pemantauan perkembangan proyek.

## 11. Penutup

Project Schedule ini menjadi acuan awal dalam mengatur urutan pelaksanaan pengembangan LetsOrder.com. Tahapan pekerjaan disusun berdasarkan prioritas fitur, dependensi aktivitas, dan kebutuhan penyelesaian proyek.

Melalui pemantauan serta pengendalian jadwal secara berkala, tim diharapkan dapat mengidentifikasi keterlambatan lebih awal, mengelola perubahan pekerjaan, dan menjaga agar pengembangan tetap sesuai dengan ruang lingkup serta tujuan proyek.

---

**Akhir Dokumen Project Schedule — LetsOrder.com**