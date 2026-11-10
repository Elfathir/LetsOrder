# Project Team — LetsOrder.com

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen Project Team menjelaskan struktur tim yang terlibat dalam pengembangan LetsOrder.com, termasuk pembagian peran, tanggung jawab, dan mekanisme koordinasi antaranggota.

Dokumen ini digunakan sebagai acuan agar setiap anggota memahami tugas dan tanggung jawabnya selama proses pengembangan proyek berlangsung.

### 1.2 Komposisi Tim

Tim pengembangan LetsOrder.com terdiri dari **5 orang anggota** dengan pembagian peran berdasarkan tanggung jawab masing-masing. Dalam pelaksanaannya, terdapat anggota yang merangkap dua peran untuk mendukung kebutuhan pengembangan proyek.

## 2. Struktur dan Pembagian Peran Tim

| No. | Anggota | Peran | Jumlah Peran |
|---:|---|---|---:|
| 1 | Anggota 1 | Project Manager dan UI/UX Designer | 2 |
| 2 | Anggota 2 | Backend Developer | 1 |
| 3 | Anggota 3 | UI/UX Designer | 1 |
| 4 | Anggota 4 | Quality Control | 1 |
| 5 | Anggota 5 | Backend Developer dan Quality Control | 2 |
| | **Total** | **5 Anggota** | **7 Penugasan Peran** |


## 3. Tanggung Jawab Setiap Peran

### 3.1 Project Manager

**Penanggung jawab:** Anggota 1

Project Manager bertanggung jawab mengoordinasikan kegiatan pengembangan agar berjalan sesuai tujuan, ruang lingkup, dan jadwal proyek.

Tanggung jawab:
- Menyusun dan mengoordinasikan rencana pelaksanaan proyek.
- Memantau perkembangan pekerjaan setiap anggota.
- Mengatur prioritas dan pembagian tugas.
- Mengidentifikasi kendala yang dapat memengaruhi pelaksanaan proyek.
- Mengadakan koordinasi dan evaluasi perkembangan proyek.
- Memastikan dokumentasi proyek diperbarui sesuai perkembangan.
- Mengawasi agar pekerjaan tetap sesuai dengan ruang lingkup yang disepakati.

### 3.2 UI/UX Designer

**Penanggung jawab:** Anggota 1 dan Anggota 3

UI/UX Designer bertanggung jawab merancang tampilan dan pengalaman pengguna agar LetsOrder.com mudah dipahami dan digunakan.

Tanggung jawab:
- Menganalisis kebutuhan antarmuka berdasarkan aktor sistem.
- Menyusun alur penggunaan aplikasi.
- Membuat wireframe dan desain antarmuka.
- Menentukan konsistensi komponen visual.
- Menyusun desain halaman customer, vendor, dan administrator.
- Menyesuaikan desain dengan kebutuhan fungsional sistem.
- Berkoordinasi dengan Backend Developer mengenai kebutuhan data dan interaksi sistem.

**Pembagian fokus pekerjaan:**

| Anggota | Fokus Tanggung Jawab |
|---|---|
| Anggota 1 | Mengarahkan konsistensi desain serta memastikan rancangan UI/UX sesuai kebutuhan dan tujuan produk. |
| Anggota 3 | Mengerjakan rancangan antarmuka, komponen visual, dan alur interaksi pengguna. |

Pembagian tersebut merupakan pembagian fokus kerja, bukan pemisahan tanggung jawab secara mutlak. Kedua anggota tetap berkoordinasi dalam menghasilkan desain yang konsisten.

### 3.3 Backend Developer

**Penanggung jawab:** Anggota 2 dan Anggota 5

Backend Developer bertanggung jawab mengembangkan logika aplikasi, pengelolaan data, dan layanan yang mendukung fungsi LetsOrder.com.

Tanggung jawab:
- Mengembangkan backend menggunakan Laravel.
- Mengimplementasikan API untuk kebutuhan frontend.
- Mengelola koneksi aplikasi dengan database MySQL.
- Mengimplementasikan autentikasi dan pembatasan akses berdasarkan peran.
- Mengembangkan proses pengelolaan tenant dan menu.
- Mengembangkan proses keranjang, pemesanan, dan simulasi pembayaran.
- Mengembangkan proses pelacakan status dan notifikasi.
- Memastikan implementasi sesuai dengan ERD final.
- Menangani dan memperbaiki kesalahan pada sisi backend.

### 3.4 Quality Control

**Penanggung jawab:** Anggota 4 dan Anggota 5

Quality Control bertanggung jawab memastikan fungsi sistem berjalan sesuai kebutuhan dan kriteria penerimaan yang telah ditetapkan.

Tanggung jawab:
- Menyusun rencana dan skenario pengujian.
- Menyusun test cases berdasarkan kebutuhan sistem.
- Melakukan pengujian fungsional.
- Memeriksa kesesuaian hasil implementasi dengan acceptance criteria.
- Mengidentifikasi dan mendokumentasikan bug.
- Melakukan pengujian ulang setelah perbaikan.
- Menyusun laporan hasil pengujian.
- Memastikan masalah kritis ditangani sebelum sistem dinyatakan siap.

## 4. Matriks Pembagian Tanggung Jawab

Matriks berikut menunjukkan keterlibatan setiap anggota dalam kelompok pekerjaan utama proyek.

Keterangan:
- **P:** Penanggung jawab utama.
- **D:** Mendukung pelaksanaan pekerjaan.
- **K:** Melakukan koordinasi atau pemeriksaan terkait.

| Aktivitas | Anggota 1 | Anggota 2 | Anggota 3 | Anggota 4 | Anggota 5 |
|---|:---:|:---:|:---:|:---:|:---:|
| Perencanaan dan koordinasi proyek | P | D | D | D | D |
| Penyusunan kebutuhan produk | P | K | D | K | K |
| Desain UI/UX | P | K | D | K | K |
| Pengembangan backend | K | P | K | K | D |
| Integrasi frontend dan backend | K | P | D | K | D |
| Pengujian fungsional | K | D | K | P | D |
| Identifikasi dan dokumentasi bug | K | D | K | P | D |
| Perbaikan bug backend | K | P | K | D | D |
| Evaluasi dan dokumentasi proyek | P | D | D | D | D |

Matriks tersebut merupakan gambaran pembagian tanggung jawab pada tingkat aktivitas. Penugasan teknis yang lebih terperinci dapat ditetapkan melalui task management selama pengembangan.

## 5. Mekanisme Koordinasi Tim

Koordinasi dilakukan untuk memastikan seluruh pekerjaan berjalan selaras dan tidak menimbulkan perbedaan pemahaman antaranggota.

Mekanisme koordinasi meliputi:

### 5.1 Koordinasi Perencanaan

Project Manager mengoordinasikan perencanaan pekerjaan, penentuan prioritas, dan pembagian tugas berdasarkan kebutuhan proyek.

### 5.2 Koordinasi Desain dan Pengembangan

UI/UX Designer berkoordinasi dengan Backend Developer untuk memastikan desain antarmuka sesuai dengan kemampuan sistem, kebutuhan data, dan alur proses bisnis.

### 5.3 Koordinasi Pengembangan dan Pengujian

Backend Developer berkoordinasi dengan Quality Control untuk menjelaskan fungsi yang telah dikembangkan, sedangkan Quality Control menyampaikan hasil pengujian dan temuan bug untuk ditindaklanjuti.

### 5.4 Evaluasi Perkembangan

Tim melakukan evaluasi secara berkala untuk membahas:
- Pekerjaan yang telah diselesaikan.
- Pekerjaan yang sedang berlangsung.
- Kendala yang dihadapi.
- Temuan hasil pengujian.
- Prioritas pekerjaan berikutnya.

## 6. Tools Pendukung Kolaborasi

Tools berikut dapat digunakan untuk mendukung koordinasi dan pengembangan proyek.

| Tools | Kegunaan |
|---|---|
| GitHub | Pengelolaan repository, version control, issue, dan pull request. |
| Figma | Perancangan dan kolaborasi desain UI/UX. |
| Visual Studio Code | Editor kode untuk pengembangan aplikasi. |
| Postman | Pengujian dan pemeriksaan API. |
| MySQL | Pengelolaan database sistem. |
| WhatsApp atau platform komunikasi tim | Koordinasi dan komunikasi antaranggota. |

## 7. Prinsip Kerja Tim

Dalam pelaksanaan proyek, setiap anggota diharapkan menerapkan prinsip berikut:

1. **Tanggung jawab:** Setiap anggota menyelesaikan pekerjaan sesuai peran dan tugas yang diberikan.
2. **Kolaborasi:** Anggota saling berkoordinasi ketika pekerjaan memiliki ketergantungan.
3. **Komunikasi:** Kendala dan perubahan pekerjaan disampaikan secara terbuka kepada tim.
4. **Dokumentasi:** Perubahan penting pada sistem dan pekerjaan dicatat agar dapat ditelusuri.
5. **Konsistensi:** Implementasi harus mengikuti kebutuhan, rancangan sistem, dan ERD final.
6. **Evaluasi:** Setiap hasil pekerjaan diperiksa sebelum dilanjutkan ke tahap berikutnya.

## 8. Penutup

Tim pengembangan LetsOrder.com terdiri dari lima anggota dengan tanggung jawab yang mencakup Project Management, UI/UX Design, Backend Development, dan Quality Control. Pembagian peran disusun berdasarkan kebutuhan pekerjaan proyek, termasuk penugasan rangkap pada beberapa anggota.

Melalui pembagian tanggung jawab dan mekanisme koordinasi yang jelas, setiap anggota diharapkan dapat berkontribusi secara terarah dalam menghasilkan sistem pemesanan dan self-pickup digital sesuai tujuan dan ruang lingkup yang telah ditetapkan.