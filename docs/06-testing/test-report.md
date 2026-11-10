# Test Report

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Nama Dokumen | Test Report |
| Versi | 1.0 Draft |
| Tanggal | 10 November 2026 |
| Status | Draft |
| Dokumen Terkait | Test Plan, Test Cases, Test Scenarios, SRS |

---

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen Test Report disusun untuk mencatat dan menyampaikan hasil pelaksanaan pengujian sistem LetsOrder.com. Laporan ini digunakan untuk mengetahui kesesuaian fungsi sistem terhadap kebutuhan yang telah ditetapkan, mengidentifikasi kesalahan yang ditemukan, serta mengevaluasi kesiapan sistem sebelum digunakan.

### 1.2 Ruang Lingkup

Pengujian mencakup tiga kelompok pengguna utama:

1. **Customer:** pengujian registrasi, login, katalog menu, keranjang, pemesanan, simulasi pembayaran, pemantauan pesanan, notifikasi, riwayat pesanan, dan self-pickup.
2. **Vendor:** pengujian login, pengelolaan tenant, pengelolaan menu, pemantauan pesanan, dan pemrosesan pesanan.
3. **Administrator:** pengujian login, melihat dan memperbarui data pengguna, serta melihat dan memperbarui data tenant.

Pengujian juga mencakup aspek nonfungsional, integrasi antarkomponen, validasi input, dan penanganan kesalahan.

### 1.3 Acuan Pengujian

Pelaksanaan pengujian mengacu pada dokumen berikut:

- `SRS.md`
- `functional-requirements.md`
- `non-functional-requirements.md`
- `user-requirements.md`
- `requirements-traceability-matrix.md`
- `test-plan.md`
- `test-cases.md`
- `test-scenarios.md`

---

## 2. Informasi Pelaksanaan Pengujian

Bagian ini diisi berdasarkan pelaksanaan pengujian yang sebenarnya.

| Informasi | Keterangan |
|---|---|
| Versi Sistem | Diisi sesuai versi aplikasi yang diuji |
| Tanggal Pengujian | Diisi setelah pengujian dilaksanakan |
| Lingkungan Pengujian | Diisi sesuai lingkungan pengujian |
| Browser | Diisi sesuai browser yang digunakan |
| Perangkat | Diisi sesuai perangkat yang digunakan |
| Penguji | Diisi dengan nama anggota tim yang melaksanakan pengujian |
| Build/Commit | Diisi dengan versi build atau commit yang diuji |

### 2.1 Lingkungan Pengujian

Sistem LetsOrder.com menggunakan teknologi berikut:

| Komponen | Teknologi |
|---|---|
| Frontend | React |
| Backend | Laravel |
| Database | MySQL |
| Antarmuka Pengguna | Web Browser |
| Metode Komunikasi | API berbasis JSON |

Versi perangkat lunak, konfigurasi server, spesifikasi perangkat, dan browser yang digunakan harus dicatat ketika pengujian dilaksanakan.

---

## 3. Ringkasan Hasil Pengujian

### 3.1 Status Pengujian

Status awal seluruh pengujian ditetapkan sebagai `Not Tested` karena belum terdapat hasil eksekusi pengujian aktual yang dilaporkan.

| Status | Jumlah | Keterangan |
|---|---:|---|
| Pass | 0 | Belum ada pengujian yang dinyatakan berhasil. |
| Fail | 0 | Belum ada pengujian yang dinyatakan gagal. |
| Blocked | 0 | Belum ada pengujian yang dilaporkan terhambat. |
| Not Tested | Belum dihitung | Pengujian belum dilaksanakan atau belum dicatat. |

Jumlah keseluruhan test case harus dihitung berdasarkan versi final `test-cases.md` setelah pemetaan kebutuhan diverifikasi.

### 3.2 Ringkasan Berdasarkan Kelompok Pengujian

| Kelompok Pengujian | Fokus Pengujian | Status Awal |
|---|---|---|
| Functional Testing — Customer | Fungsi pemesanan dan self-pickup | Not Tested |
| Functional Testing — Vendor | Pengelolaan tenant, menu, dan pesanan | Not Tested |
| Functional Testing — Administrator | Pengelolaan data pengguna dan tenant | Not Tested |
| Integration Testing | Integrasi frontend, backend, dan database | Not Tested |
| Validation Testing | Validasi input dan penanganan kesalahan | Not Tested |
| Non-Functional Testing | Performa, keamanan, usability, reliability, compatibility, dan maintainability | Not Tested |

---

## 4. Hasil Pengujian Fungsional

Bagian ini digunakan untuk mencatat hasil pengujian fungsional berdasarkan test case yang telah disusun.

### 4.1 Pengujian Customer

| Test Case ID | Nama Pengujian | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|
| TC-CUS-01 | Registrasi Customer | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-02 | Login Customer | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-03 | Melihat Katalog Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-04 | Melihat Detail Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-05 | Mengelola Keranjang | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-06 | Validasi Keranjang | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-07 | Membuat Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-08 | Simulasi Pembayaran | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-09 | Verifikasi Pembayaran | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-10 | Melihat Status Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-11 | Melihat Riwayat Status | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-12 | Melihat Riwayat Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-13 | Melihat Notifikasi | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-14 | Proses Self-Pickup | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-CUS-15 | Logout Customer | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |

**Catatan:** ID `TC-CUS-01` dan seterusnya merupakan format pengelompokan yang disarankan. ID tersebut harus disesuaikan dengan ID sebenarnya dalam `test-cases.md`.

### 4.2 Pengujian Vendor

| Test Case ID | Nama Pengujian | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|
| TC-VEN-01 | Login Vendor | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-02 | Melihat Informasi Tenant | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-03 | Memperbarui Informasi Tenant | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-04 | Mengubah Status Buka Tenant | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-05 | Melihat Daftar Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-06 | Menambahkan Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-07 | Memperbarui Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-08 | Menghapus Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-09 | Mengubah Ketersediaan Menu | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-10 | Melihat Pesanan Masuk | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-11 | Melihat Detail Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-12 | Memproses Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-13 | Memantau Antrean Pesanan | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-14 | Melihat Informasi Pembayaran | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-15 | Melihat Notifikasi | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-VEN-16 | Logout Vendor | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |

**Catatan:** ID harus diselaraskan dengan daftar test case final.

### 4.3 Pengujian Administrator

| Test Case ID | Nama Pengujian | Hasil Aktual | Status | Catatan |
|---|---|---|---|---|
| TC-ADM-01 | Login Administrator | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-ADM-02 | Melihat Data Pengguna | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-ADM-03 | Memperbarui Data Pengguna | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-ADM-04 | Melihat Data Tenant | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-ADM-05 | Memperbarui Data Tenant | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |
| TC-ADM-06 | Logout Administrator | Belum diuji | Not Tested | Menunggu pelaksanaan pengujian. |

---

## 5. Hasil Pengujian Nonfungsional

Pengujian nonfungsional dilakukan untuk mengevaluasi kualitas sistem berdasarkan kebutuhan yang telah ditentukan.

| Aspek | Indikator Pengujian | Hasil Aktual | Status |
|---|---|---|---|
| Performance | Waktu pemuatan halaman kurang dari 2 detik | Belum diukur | Not Tested |
| Performance | Respons sistem terhadap beberapa permintaan | Belum diuji | Not Tested |
| Security | Autentikasi dan validasi kredensial | Belum diuji | Not Tested |
| Security | Pembatasan hak akses berdasarkan peran | Belum diuji | Not Tested |
| Usability | Kemudahan navigasi dan penggunaan | Belum dievaluasi | Not Tested |
| Reliability | Konsistensi penyimpanan dan pengambilan data | Belum diuji | Not Tested |
| Compatibility | Kompatibilitas browser | Belum diuji | Not Tested |
| Maintainability | Keteraturan struktur kode dan kemudahan pemeliharaan | Belum dievaluasi | Not Tested |

### 5.1 Evaluasi Performa

Target performa sistem adalah waktu pemuatan halaman kurang dari 2 detik.

Hasil pengukuran harus dicatat menggunakan metode dan lingkungan pengujian yang konsisten.

| Halaman | Waktu Pemuatan | Target | Status |
|---|---:|---:|---|
| Halaman utama | Belum diukur | < 2 detik | Not Tested |
| Halaman katalog | Belum diukur | < 2 detik | Not Tested |
| Halaman Customer | Belum diukur | < 2 detik | Not Tested |
| Dashboard Vendor | Belum diukur | < 2 detik | Not Tested |
| Dashboard Administrator | Belum diukur | < 2 detik | Not Tested |

Pengukuran dilakukan setelah sistem tersedia pada lingkungan pengujian. Hasil pengukuran perlu menyertakan kondisi jaringan, perangkat, browser, dan metode pengukuran agar dapat dievaluasi secara objektif.

---

## 6. Temuan Kesalahan (Defect Report)

Setiap kesalahan yang ditemukan selama pengujian harus dicatat untuk memudahkan proses analisis dan perbaikan.

### 6.1 Format Pencatatan Defect

| Atribut | Keterangan |
|---|---|
| Defect ID | Identitas unik kesalahan |
| Test Case ID | Test case yang menemukan kesalahan |
| Deskripsi | Penjelasan kesalahan yang ditemukan |
| Severity | Tingkat dampak kesalahan |
| Priority | Tingkat urgensi perbaikan |
| Langkah Reproduksi | Langkah untuk memunculkan kembali kesalahan |
| Expected Result | Hasil yang seharusnya terjadi |
| Actual Result | Hasil yang benar-benar terjadi |
| Status | Kondisi penanganan defect |
| Assigned To | Penanggung jawab perbaikan |

### 6.2 Kategori Severity

| Severity | Keterangan |
|---|---|
| Critical | Kesalahan yang menyebabkan sistem atau proses utama tidak dapat digunakan. |
| High | Kesalahan yang mengganggu fungsi penting sistem. |
| Medium | Kesalahan yang memengaruhi sebagian fungsi, tetapi tidak menghentikan keseluruhan proses utama. |
| Low | Kesalahan dengan dampak terbatas terhadap penggunaan sistem. |

### 6.3 Status Defect

| Status | Keterangan |
|---|---|
| Open | Kesalahan baru ditemukan dan belum diperbaiki. |
| In Progress | Kesalahan sedang diperbaiki. |
| Fixed | Perbaikan telah dilakukan dan menunggu pengujian ulang. |
| Retest | Kesalahan sedang diuji ulang. |
| Closed | Kesalahan telah diperbaiki dan dinyatakan selesai. |
| Reopened | Kesalahan masih muncul setelah perbaikan. |

### 6.4 Daftar Defect

| Defect ID | Test Case ID | Deskripsi | Severity | Status |
|---|---|---|---|---|
| Belum tersedia | - | Belum ada hasil pengujian aktual yang dilaporkan. | - | - |

---

## 7. Evaluasi dan Tindak Lanjut

Setelah pengujian dilaksanakan, tim melakukan evaluasi berdasarkan hasil aktual.

Evaluasi mencakup:

1. Memeriksa test case yang berstatus Pass.
2. Mengidentifikasi test case yang berstatus Fail.
3. Menentukan penyebab kegagalan berdasarkan hasil pengujian.
4. Mencatat defect dan menentukan prioritas perbaikannya.
5. Melaksanakan perbaikan pada bagian sistem yang bermasalah.
6. Melakukan pengujian ulang untuk memastikan perbaikan berjalan sesuai harapan.
7. Memperbarui laporan pengujian berdasarkan hasil terbaru.

### 7.1 Kriteria Penerimaan

Sistem dapat dipertimbangkan untuk diterima apabila:

- Fungsi utama Customer, Vendor, dan Administrator telah diuji.
- Seluruh kebutuhan yang ditetapkan sebagai prioritas utama telah memenuhi kriteria penerimaan.
- Tidak terdapat defect Critical yang belum diselesaikan.
- Defect High telah ditangani atau memiliki keputusan tindak lanjut yang disepakati.
- Target nonfungsional telah dievaluasi berdasarkan hasil pengukuran.
- Hasil pengujian telah terdokumentasi dan dapat ditelusuri.

Keputusan penerimaan akhir harus mempertimbangkan hasil aktual dan persetujuan pihak yang berwenang.

---

## 8. Kesimpulan

Dokumen Test Report menjadi sarana pencatatan dan evaluasi hasil pengujian sistem LetsOrder.com. Melalui laporan ini, tim dapat mengetahui tingkat kesesuaian sistem terhadap kebutuhan fungsional dan nonfungsional, mendokumentasikan kesalahan yang ditemukan, serta menentukan tindak lanjut perbaikan.

Dokumen ini masih berstatus draft dan belum memuat hasil pengujian aktual. Oleh karena itu, seluruh status pengujian harus diperbarui setelah test case dilaksanakan. Laporan akhir baru dapat disusun setelah hasil pengujian, defect, dan evaluasi sistem tersedia.

---

## 9. Riwayat Perubahan Dokumen

| Versi | Tanggal | Perubahan | Status |
|---|---|---|---|
| 1.0 | 10 November 2026 | Pembuatan awal dokumen Test Report. | Draft |