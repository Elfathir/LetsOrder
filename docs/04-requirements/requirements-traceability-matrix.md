# Requirements Traceability Matrix (RTM)

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Requirements Traceability Matrix |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi | User Requirements, Functional Requirements, Non-Functional Requirements, SRS |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Requirements Traceability Matrix (RTM) merupakan dokumen yang digunakan untuk memetakan hubungan antara kebutuhan pengguna, kebutuhan fungsional, kebutuhan nonfungsional, dan aktivitas pengujian sistem.

Dokumen ini bertujuan memastikan bahwa setiap kebutuhan yang telah ditetapkan memiliki keterkaitan yang jelas dengan fungsi sistem dan rencana pengujian. Dengan demikian, tim pengembang dapat memantau pemenuhan kebutuhan selama proses pengembangan hingga tahap pengujian.

## 1.2 Ruang Lingkup

RTM LetsOrder.com mencakup:

1. Pemetaan kebutuhan Customer, Vendor, dan Administrator.
2. Pemetaan kebutuhan pengguna terhadap kebutuhan fungsional.
3. Pemetaan kebutuhan fungsional terhadap rencana pengujian.
4. Pemetaan kebutuhan nonfungsional terhadap metode verifikasi.
5. Identifikasi kebutuhan yang belum memiliki pemetaan atau memerlukan konfirmasi.

## 1.3 Dokumen Acuan

| No. | Dokumen | Lokasi |
|---|---|---|
| 1 | Software Requirements Specification | `SRS.md` |
| 2 | Functional Requirements | `functional-requirements.md` |
| 3 | Non-Functional Requirements | `non-functional-requirements.md` |
| 4 | User Requirements | `user-requirements.md` |
| 5 | Test Plan | `../06-testing/test-plan.md` |
| 6 | Test Cases | `../06-testing/test-cases.md` |

---

# 2. Matriks Keterlacakan Kebutuhan Pengguna

Bagian ini menunjukkan hubungan antara kebutuhan setiap aktor dengan kebutuhan fungsional sistem.

## 2.1 Kebutuhan Customer

| ID Kebutuhan Pengguna | Kebutuhan Pengguna | ID Kebutuhan Fungsional |
|---|---|---|
| UR-CUS-01 | Registrasi akun | FR-01 |
| UR-CUS-02 | Login akun | FR-02, FR-03 |
| UR-CUS-03 | Akses sesuai peran | FR-04 |
| UR-CUS-04 | Melihat daftar tenant | FR-05 |
| UR-CUS-05 | Melihat katalog menu | FR-06 |
| UR-CUS-06 | Melihat detail menu | FR-07 |
| UR-CUS-07 | Menambahkan menu ke keranjang | FR-13, FR-14 |
| UR-CUS-08 | Mengubah jumlah menu | FR-15 |
| UR-CUS-09 | Menambahkan catatan item | FR-16 |
| UR-CUS-10 | Menghapus item | FR-17 |
| UR-CUS-11 | Melihat total harga | FR-18 |
| UR-CUS-12 | Membuat pesanan | FR-19, FR-20, FR-22, FR-23 |
| UR-CUS-13 | Mendapatkan nomor antrean | FR-21 |
| UR-CUS-14 | Memilih metode pembayaran | FR-27 |
| UR-CUS-15 | Melihat kode QRIS | FR-28 |
| UR-CUS-16 | Melihat informasi pembayaran | FR-29, FR-31, FR-32 |
| UR-CUS-17 | Memantau status pesanan | FR-26, FR-34 |
| UR-CUS-18 | Melihat riwayat pesanan | FR-33 |
| UR-CUS-19 | Melihat notifikasi | FR-35, FR-36 |
| UR-CUS-20 | Mengambil pesanan | FR-37, FR-38 |
| UR-CUS-21 | Mengetahui penyelesaian pesanan | FR-39 |

## 2.2 Kebutuhan Vendor

| ID Kebutuhan Pengguna | Kebutuhan Pengguna | ID Kebutuhan Fungsional |
|---|---|---|
| UR-VEN-01 | Login akun | FR-02, FR-03 |
| UR-VEN-02 | Akses sesuai kewenangan | FR-04 |
| UR-VEN-03 | Melihat informasi tenant | FR-12 |
| UR-VEN-04 | Memperbarui informasi tenant | FR-12 |
| UR-VEN-05 | Menambahkan menu | FR-08 |
| UR-VEN-06 | Mengubah informasi menu | FR-09 |
| UR-VEN-07 | Menghapus menu | FR-10 |
| UR-VEN-08 | Mengubah ketersediaan menu | FR-11 |
| UR-VEN-09 | Melihat pesanan masuk | FR-24 |
| UR-VEN-10 | Melihat detail pesanan | FR-23 |
| UR-VEN-11 | Memperbarui status pesanan | FR-25, FR-34 |
| UR-VEN-12 | Melihat pesanan siap diambil | FR-25, FR-38 |
| UR-VEN-13 | Menyelesaikan pesanan | FR-39 |
| UR-VEN-14 | Melihat informasi pembayaran | FR-29, FR-30, FR-32 |
| UR-VEN-15 | Melihat notifikasi | FR-35 |
| UR-VEN-16 | Mengetahui status baca notifikasi | FR-36 |

## 2.3 Kebutuhan Administrator

| ID Kebutuhan Pengguna | Kebutuhan Pengguna | ID Kebutuhan Fungsional |
|---|---|---|
| UR-ADM-01 | Login administrator | FR-02, FR-03 |
| UR-ADM-02 | Akses administratif | FR-04 |
| UR-ADM-03 | Melihat data pengguna | FR-40 |
| UR-ADM-04 | Mengelola data pengguna | FR-41 |
| UR-ADM-05 | Melihat data tenant | FR-42 |
| UR-ADM-06 | Mengelola data tenant | FR-42 |

---

# 3. Matriks Keterlacakan Kebutuhan Fungsional

Bagian ini menghubungkan setiap kebutuhan fungsional dengan kebutuhan pengguna dan rencana pengujian.

Kode pengujian pada tabel merupakan kode referensi yang akan digunakan dalam penyusunan dokumen `test-cases.md`. Kode tersebut belum menunjukkan bahwa pengujian telah dilaksanakan atau berhasil.

| ID FR | Deskripsi Kebutuhan Fungsional | Kebutuhan Pengguna Terkait | Referensi Pengujian |
|---|---|---|---|
| FR-01 | Registrasi akun | UR-CUS-01 | TC-FR-01 |
| FR-02 | Login pengguna | UR-CUS-02, UR-VEN-01, UR-ADM-01 | TC-FR-02 |
| FR-03 | Validasi kredensial | UR-CUS-02, UR-VEN-01, UR-ADM-01 | TC-FR-03 |
| FR-04 | Pembatasan akses berdasarkan peran | UR-CUS-03, UR-VEN-02, UR-ADM-02 | TC-FR-04 |
| FR-05 | Menampilkan daftar tenant | UR-CUS-04 | TC-FR-05 |
| FR-06 | Menampilkan katalog menu | UR-CUS-05 | TC-FR-06 |
| FR-07 | Menampilkan detail menu | UR-CUS-06 | TC-FR-07 |
| FR-08 | Menambahkan menu | UR-VEN-05 | TC-FR-08 |
| FR-09 | Memperbarui informasi menu | UR-VEN-06 | TC-FR-09 |
| FR-10 | Menghapus menu | UR-VEN-07 | TC-FR-10 |
| FR-11 | Mengubah ketersediaan menu | UR-VEN-08 | TC-FR-11 |
| FR-12 | Mengelola informasi tenant | UR-VEN-03, UR-VEN-04 | TC-FR-12 |
| FR-13 | Mengakses keranjang | UR-CUS-07, UR-CUS-08, UR-CUS-09, UR-CUS-10, UR-CUS-11 | TC-FR-13 |
| FR-14 | Menambahkan item ke keranjang | UR-CUS-07 | TC-FR-14 |
| FR-15 | Mengubah jumlah item | UR-CUS-08 | TC-FR-15 |
| FR-16 | Menambahkan catatan item | UR-CUS-09 | TC-FR-16 |
| FR-17 | Menghapus item dari keranjang | UR-CUS-10 | TC-FR-17 |
| FR-18 | Menghitung total harga keranjang | UR-CUS-11 | TC-FR-18 |
| FR-19 | Membatasi satu tenant dalam satu pesanan | UR-CUS-12 | TC-FR-19 |
| FR-20 | Membuat pesanan | UR-CUS-12 | TC-FR-20 |
| FR-21 | Menghasilkan nomor antrean | UR-CUS-13 | TC-FR-21 |
| FR-22 | Menyimpan data pesanan | UR-CUS-12 | TC-FR-22 |
| FR-23 | Menyimpan detail pesanan | UR-CUS-12, UR-VEN-10 | TC-FR-23 |
| FR-24 | Menampilkan pesanan masuk kepada Vendor | UR-VEN-09 | TC-FR-24 |
| FR-25 | Memperbarui status pesanan | UR-VEN-11, UR-VEN-12 | TC-FR-25 |
| FR-26 | Menampilkan status pesanan kepada Customer | UR-CUS-17 | TC-FR-26 |
| FR-27 | Memilih metode pembayaran | UR-CUS-14 | TC-FR-27 |
| FR-28 | Menampilkan kode QRIS simulasi | UR-CUS-15 | TC-FR-28 |
| FR-29 | Menyimpan data pembayaran | UR-CUS-16, UR-VEN-14 | TC-FR-29 |
| FR-30 | Melakukan simulasi verifikasi pembayaran | UR-VEN-14 | TC-FR-30 |
| FR-31 | Menyimpan batas waktu dan waktu pembayaran | UR-CUS-16 | TC-FR-31 |
| FR-32 | Menampilkan status pembayaran | UR-CUS-16, UR-VEN-14 | TC-FR-32 |
| FR-33 | Menampilkan riwayat pesanan | UR-CUS-18 | TC-FR-33 |
| FR-34 | Mencatat riwayat perubahan status | UR-CUS-17, UR-VEN-11 | TC-FR-34 |
| FR-35 | Mengirimkan atau menampilkan notifikasi | UR-CUS-19, UR-VEN-15 | TC-FR-35 |
| FR-36 | Mengelola status baca notifikasi | UR-CUS-19, UR-VEN-16 | TC-FR-36 |
| FR-37 | Menampilkan nomor antrean | UR-CUS-20 | TC-FR-37 |
| FR-38 | Menampilkan status siap diambil | UR-CUS-20, UR-VEN-12 | TC-FR-38 |
| FR-39 | Menyelesaikan pesanan setelah pengambilan | UR-CUS-21, UR-VEN-13 | TC-FR-39 |
| FR-40 | Menampilkan data pengguna kepada Administrator | UR-ADM-03 | TC-FR-40 |
| FR-41 | Mengelola data pengguna | UR-ADM-04 | TC-FR-41 |
| FR-42 | Mengelola data tenant | UR-ADM-05, UR-ADM-06 | TC-FR-42 |

---

# 4. Matriks Keterlacakan Kebutuhan Nonfungsional

Kebutuhan nonfungsional dipetakan ke metode verifikasi untuk memastikan kualitas sistem sesuai kriteria yang telah ditentukan.

| ID NFR | Aspek Kualitas | Deskripsi Kebutuhan | Metode Verifikasi | Referensi Pengujian |
|---|---|---|---|---|
| NFR-01 | Performance Efficiency | Waktu pemuatan halaman ditargetkan kurang dari 2 detik pada kondisi pengujian yang ditetapkan. | Performance Testing | TC-NFR-01 |
| NFR-02 | Performance Efficiency | Pemrosesan permintaan API harus berlangsung secara efisien. | API Performance Testing | TC-NFR-02 |
| NFR-03 | Performance Efficiency | API hanya mengirimkan data yang diperlukan oleh fungsi terkait. | API Inspection | TC-NFR-03 |
| NFR-04 | Security | Password harus disimpan menggunakan metode hashing yang aman. | Security Inspection | TC-NFR-04 |
| NFR-05 | Security | Sistem harus menerapkan autentikasi sebelum pengguna mengakses fungsi yang memerlukan akun. | Authentication Testing | TC-NFR-05 |
| NFR-06 | Security | Sistem harus membatasi akses berdasarkan peran pengguna. | Authorization Testing | TC-NFR-06 |
| NFR-07 | Security | Sistem harus melakukan validasi terhadap data yang diterima. | Input Validation Testing | TC-NFR-07 |
| NFR-08 | Security | Komunikasi melalui HTTPS diterapkan apabila lingkungan deployment mendukungnya. | Configuration Inspection | TC-NFR-08 |
| NFR-09 | Security | Pengguna hanya dapat mengakses data yang menjadi kewenangannya. | Access Control Testing | TC-NFR-09 |
| NFR-10 | Usability | Antarmuka harus mudah dipahami oleh pengguna. | Usability Testing | TC-NFR-10 |
| NFR-11 | Usability | Navigasi sistem harus konsisten dan mudah digunakan. | Usability Inspection | TC-NFR-11 |
| NFR-12 | Usability | Informasi menu dan pesanan harus disajikan secara jelas. | Interface Inspection | TC-NFR-12 |
| NFR-13 | Usability | Sistem harus memberikan umpan balik terhadap tindakan pengguna. | Functional Usability Testing | TC-NFR-13 |
| NFR-14 | Usability | Tampilan harus mendukung penggunaan pada ukuran layar yang relevan. | Responsive Testing | TC-NFR-14 |
| NFR-15 | Reliability | Sistem harus menangani kesalahan tanpa menyebabkan kegagalan fungsi yang tidak semestinya. | Error Handling Testing | TC-NFR-15 |
| NFR-16 | Reliability | Data pesanan harus tersimpan secara konsisten. | Data Integrity Testing | TC-NFR-16 |
| NFR-17 | Reliability | Proses pemesanan harus menangani kegagalan validasi dan penyimpanan dengan tepat. | Transaction Testing | TC-NFR-17 |
| NFR-18 | Reliability | Status pesanan harus tetap konsisten dengan riwayat perubahan statusnya. | State Consistency Testing | TC-NFR-18 |
| NFR-19 | Reliability | Sistem harus dapat menangani kondisi kesalahan pada proses pembayaran simulasi. | Payment Simulation Testing | TC-NFR-19 |
| NFR-20 | Compatibility | Sistem harus dapat digunakan pada browser yang menjadi target pengujian. | Cross-Browser Testing | TC-NFR-20 |
| NFR-21 | Compatibility | Sistem harus dapat ditampilkan pada perangkat dengan ukuran layar yang didukung. | Device Compatibility Testing | TC-NFR-21 |
| NFR-22 | Compatibility | Frontend dan backend harus dapat berkomunikasi melalui antarmuka API yang ditentukan. | Integration Testing | TC-NFR-22 |
| NFR-23 | Maintainability | Struktur kode harus disusun secara terorganisasi. | Code Review | TC-NFR-23 |
| NFR-24 | Maintainability | Komponen sistem harus memiliki pemisahan tanggung jawab yang jelas. | Architecture Inspection | TC-NFR-24 |
| NFR-25 | Maintainability | Kode harus memiliki penamaan dan format yang konsisten. | Code Review | TC-NFR-25 |
| NFR-26 | Maintainability | Konfigurasi lingkungan pengembangan dan deployment harus terdokumentasi. | Documentation Inspection | TC-NFR-26 |
| NFR-27 | Maintainability | Perubahan kode harus dapat diperiksa melalui pengujian yang relevan. | Regression Testing | TC-NFR-27 |

---

# 5. Matriks Keterlacakan terhadap ERD

Bagian ini memastikan kebutuhan fungsional yang berhubungan dengan penyimpanan data tetap sesuai dengan struktur ERD final LetsOrder.com.

| Entitas ERD | Atribut atau Data Utama | Kebutuhan Fungsional Terkait |
|---|---|---|
| USER | Identitas, username, nama, email, password, peran | FR-01, FR-02, FR-03, FR-04, FR-40, FR-41 |
| TENANT | Identitas tenant, pemilik, nama, deskripsi, logo, status buka | FR-05, FR-12, FR-42 |
| KATEGORI | Identitas, nama kategori, icon | FR-06, FR-08 |
| MENU | Identitas menu, tenant, kategori, nama, deskripsi, gambar, harga, estimasi, ketersediaan | FR-06, FR-07, FR-08, FR-09, FR-10, FR-11 |
| KERANJANG | Identitas keranjang dan pemilik | FR-13, FR-14, FR-17, FR-18 |
| ITEM_KERANJANG | Identitas item, keranjang, menu, jumlah, catatan | FR-14, FR-15, FR-16, FR-17 |
| PESANAN | Identitas pesanan, pengguna, tenant, nomor antrean, status, total harga, catatan, waktu pesan | FR-19, FR-20, FR-21, FR-22, FR-24, FR-25, FR-26, FR-33, FR-37, FR-38, FR-39 |
| DETAIL_PESANAN | Identitas detail, pesanan, menu, jumlah, subtotal | FR-23 |
| PEMBAYARAN | Identitas pembayaran, pesanan, metode, kode QRIS, total bayar, status verifikasi, batas waktu, waktu bayar | FR-27, FR-28, FR-29, FR-30, FR-31, FR-32 |
| RIWAYAT_STATUS | Identitas riwayat, pesanan, status, waktu | FR-34 |
| NOTIFIKASI | Identitas notifikasi, pengguna, pesanan, pesan, status baca | FR-35, FR-36 |

**Catatan:** Pemetaan entitas di atas menunjukkan keterkaitan kebutuhan dengan struktur data. Pemetaan tersebut tidak mengubah ERD, menambahkan atribut, atau menetapkan relasi baru.

---

# 6. Status Keterlacakan dan Verifikasi

Untuk memantau pemenuhan kebutuhan, proyek menggunakan status berikut:

| Status | Keterangan |
|---|---|
| Not Started | Pengembangan atau pengujian belum dimulai. |
| In Progress | Kebutuhan sedang dikembangkan atau diuji. |
| Passed | Kebutuhan telah memenuhi kriteria pengujian. |
| Failed | Kebutuhan belum memenuhi kriteria pengujian. |
| Blocked | Pengembangan atau pengujian terhambat oleh kendala tertentu. |
| Not Applicable | Kebutuhan tidak relevan dengan kondisi pengujian tertentu, disertai alasan. |

## 6.1 Aturan Penggunaan Status

1. Setiap kebutuhan fungsional harus memiliki referensi pengujian.
2. Setiap kebutuhan nonfungsional harus memiliki metode verifikasi yang sesuai.
3. Status Passed hanya dapat diberikan setelah hasil pengujian memenuhi kriteria penerimaan.
4. Kebutuhan yang gagal harus dicatat untuk proses perbaikan.
5. Perubahan kebutuhan harus diikuti dengan pemeriksaan ulang terhadap dokumen terkait.

## 6.2 Ringkasan Keterlacakan

| Kategori | Jumlah | Kondisi |
|---|---:|---|
| Kebutuhan Customer | 21 | Telah dipetakan |
| Kebutuhan Vendor | 16 | Telah dipetakan |
| Kebutuhan Administrator | 6 | Telah dipetakan |
| Kebutuhan Fungsional | 42 | Telah dipetakan |
| Kebutuhan Nonfungsional | 27 | Telah dipetakan |
| Entitas ERD | 11 | Telah dipetakan |

---

# 7. Catatan Konsistensi Dokumen

Terdapat satu hal yang perlu diselaraskan sebelum seluruh dokumen requirements ditetapkan sebagai baseline final.

Dokumen `SRS.md` sebelumnya mencantumkan 18 kebutuhan nonfungsional, sedangkan dokumen `non-functional-requirements.md` mengembangkan daftar tersebut menjadi 27 kebutuhan nonfungsional.

Untuk menjaga konsistensi, daftar NFR-01 sampai NFR-27 dalam dokumen `non-functional-requirements.md` digunakan sebagai acuan pemetaan RTM ini. Oleh karena itu, `SRS.md` perlu diperbarui agar mencantumkan seluruh 27 kebutuhan tersebut dengan ID dan deskripsi yang konsisten.

Selain itu, kewenangan Vendor dalam verifikasi pembayaran dan pengelolaan kategori perlu dikonfirmasi berdasarkan keputusan implementasi. RTM ini tidak menetapkan kewenangan tambahan yang belum disepakati.

---

# 8. Penutup

Requirements Traceability Matrix ini digunakan sebagai acuan untuk memastikan seluruh kebutuhan pengguna dan kebutuhan kualitas sistem memiliki hubungan yang jelas dengan kebutuhan fungsional, struktur data, serta aktivitas pengujian.

Dengan adanya matriks keterlacakan, tim pengembang dapat mengidentifikasi kebutuhan yang belum terpenuhi, memantau hasil pengujian, dan mengendalikan perubahan selama pengembangan LetsOrder.com.

Dokumen ini perlu diperbarui apabila terdapat perubahan resmi pada kebutuhan sistem, selama perubahan tersebut telah disetujui dan tetap memperhatikan ERD final sebagai acuan struktur basis data.