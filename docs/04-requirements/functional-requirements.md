# Functional Requirements

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | Functional Requirements |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi | Software Requirements Specification (SRS) |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

Dokumen Functional Requirements menjelaskan fungsi-fungsi yang harus disediakan oleh sistem LetsOrder.com secara lebih terperinci. Dokumen ini merupakan turunan dari kebutuhan fungsional yang telah ditetapkan dalam SRS dan digunakan sebagai pedoman bagi tim pengembang dalam proses implementasi serta pengujian sistem.

Setiap kebutuhan fungsional memiliki identitas unik, deskripsi, aktor yang terlibat, prioritas, dan kriteria penerimaan. Dengan demikian, setiap fungsi dapat diperiksa kesesuaiannya terhadap kebutuhan proyek.

## 1.2 Cakupan

Kebutuhan fungsional dalam dokumen ini mencakup:

1. Autentikasi dan pengaturan hak akses pengguna.
2. Katalog dan pengelolaan menu.
3. Pengelolaan keranjang belanja.
4. Pengelolaan pesanan.
5. Simulasi pembayaran digital.
6. Riwayat pesanan dan notifikasi.
7. Proses pengambilan pesanan (*self-pickup*).
8. Pengelolaan data oleh administrator.

## 1.3 Keterangan Prioritas

| Prioritas | Keterangan |
|---|---|
| Must Have | Fungsi utama yang wajib tersedia agar sistem dapat menjalankan tujuan utamanya. |
| Should Have | Fungsi pendukung yang penting, tetapi tidak menjadi ketergantungan utama seluruh proses pemesanan. |

---

# 2. Spesifikasi Kebutuhan Fungsional

## 2.1 Autentikasi dan Hak Akses

### FR-01 — Registrasi Pengguna

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan fasilitas registrasi agar pengguna dapat membuat akun untuk mengakses layanan LetsOrder.com. |
| Prasyarat | Pengguna belum memiliki akun atau belum melakukan login. |
| Hasil yang Diharapkan | Data akun pengguna berhasil disimpan pada sistem. |

**Kriteria Penerimaan:**
- Sistem menampilkan formulir registrasi.
- Pengguna dapat memasukkan informasi akun sesuai atribut USER pada ERD.
- Sistem memvalidasi kelengkapan dan format data yang dimasukkan.
- Sistem menolak data yang tidak memenuhi ketentuan validasi.
- Akun berhasil dibuat apabila seluruh persyaratan registrasi terpenuhi.

### FR-02 — Login Pengguna

| Atribut | Keterangan |
|---|---|
| Aktor | Customer, Vendor, Administrator |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan fasilitas login menggunakan kredensial akun yang telah terdaftar. |
| Prasyarat | Pengguna memiliki akun. |
| Hasil yang Diharapkan | Pengguna berhasil masuk ke sistem sesuai perannya. |

**Kriteria Penerimaan:**
- Sistem menampilkan formulir login.
- Pengguna memasukkan username dan password.
- Sistem memeriksa kecocokan kredensial.
- Pengguna dengan kredensial valid dapat masuk ke sistem.
- Pengguna dengan kredensial tidak valid memperoleh pesan kesalahan.

### FR-03 — Validasi Kredensial

| Atribut | Keterangan |
|---|---|
| Aktor | Customer, Vendor, Administrator |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memvalidasi kredensial pengguna sebelum memberikan akses ke aplikasi. |
| Prasyarat | Pengguna mengirimkan permintaan login. |
| Hasil yang Diharapkan | Sistem menentukan apakah kredensial pengguna valid atau tidak. |

**Kriteria Penerimaan:**
- Sistem memeriksa username dan password yang dimasukkan.
- Sistem hanya menerima kredensial yang sesuai dengan data akun.
- Sistem tidak memberikan akses apabila validasi gagal.
- Sistem menampilkan informasi kesalahan tanpa mengungkapkan informasi sensitif akun.

### FR-04 — Pembatasan Hak Akses

| Atribut | Keterangan |
|---|---|
| Aktor | Customer, Vendor, Administrator |
| Prioritas | Must Have |
| Deskripsi | Sistem harus membatasi akses fitur berdasarkan atribut peran pengguna. |
| Prasyarat | Pengguna telah berhasil login. |
| Hasil yang Diharapkan | Pengguna hanya dapat mengakses fungsi sesuai perannya. |

**Kriteria Penerimaan:**
- Sistem mengenali peran Customer, Vendor, dan Administrator.
- Customer hanya dapat mengakses fungsi pelanggan.
- Vendor hanya dapat mengakses fungsi pengelolaan tenant, menu, dan pesanan sesuai kewenangannya.
- Administrator dapat mengakses fungsi administratif.
- Permintaan akses yang tidak sesuai kewenangan harus ditolak.

---

## 2.2 Katalog dan Pengelolaan Menu

### FR-05 — Menampilkan Daftar Tenant

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan daftar tenant yang tersedia beserta informasi utamanya. |
| Prasyarat | Customer membuka halaman katalog tenant. |
| Hasil yang Diharapkan | Daftar tenant dapat dilihat oleh customer. |

**Kriteria Penerimaan:**
- Sistem menampilkan daftar tenant berdasarkan data yang tersedia.
- Informasi tenant ditampilkan sesuai atribut yang tersimpan.
- Status buka tenant ditampilkan berdasarkan data status_buka.
- Sistem memberikan informasi apabila belum terdapat tenant yang dapat ditampilkan.

### FR-06 — Menampilkan Katalog Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan daftar menu berdasarkan tenant dan kategori. |
| Prasyarat | Data tenant dan menu tersedia. |
| Hasil yang Diharapkan | Customer dapat melihat menu yang ditawarkan oleh tenant. |

**Kriteria Penerimaan:**
- Sistem menampilkan menu berdasarkan tenant yang dipilih.
- Menu dapat ditampilkan berdasarkan kategori.
- Menu yang tidak tersedia tidak dapat dipilih untuk pemesanan.
- Sistem menampilkan informasi apabila tidak terdapat menu yang sesuai.

### FR-07 — Menampilkan Detail Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan informasi detail dari menu yang dipilih customer. |
| Prasyarat | Customer memilih salah satu menu. |
| Hasil yang Diharapkan | Informasi menu ditampilkan secara lengkap sesuai data yang tersedia. |

**Kriteria Penerimaan:**
- Sistem menampilkan nama menu.
- Sistem menampilkan deskripsi dan gambar apabila tersedia.
- Sistem menampilkan harga menu.
- Sistem menampilkan estimasi waktu penyajian.
- Sistem menampilkan status ketersediaan menu.

### FR-08 — Menambahkan Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor menambahkan menu baru ke dalam tenant yang dikelolanya. |
| Prasyarat | Vendor telah login dan memiliki akses pengelolaan tenant. |
| Hasil yang Diharapkan | Data menu baru berhasil disimpan. |

**Kriteria Penerimaan:**
- Sistem menyediakan formulir penambahan menu.
- Vendor dapat mengisi informasi sesuai atribut MENU pada ERD.
- Sistem memvalidasi informasi yang dimasukkan.
- Menu disimpan dengan keterkaitan tenant dan kategori yang sesuai.
- Menu berhasil ditampilkan setelah penyimpanan berhasil.

### FR-09 — Mengubah Informasi Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor memperbarui informasi menu yang dikelolanya. |
| Prasyarat | Menu telah tersedia dan vendor memiliki kewenangan terhadap menu tersebut. |
| Hasil yang Diharapkan | Informasi menu berhasil diperbarui. |

**Kriteria Penerimaan:**
- Vendor dapat memilih menu yang akan diperbarui.
- Sistem menampilkan informasi menu saat ini.
- Vendor dapat mengubah informasi sesuai atribut MENU.
- Sistem memvalidasi perubahan sebelum menyimpannya.
- Perubahan ditampilkan pada katalog setelah berhasil disimpan.

### FR-10 — Menghapus Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor menghapus menu sesuai ketentuan pengelolaan data. |
| Prasyarat | Menu tersedia dan vendor memiliki kewenangan terhadap menu tersebut. |
| Hasil yang Diharapkan | Menu berhasil dihapus apabila tidak melanggar aturan integritas data. |

**Kriteria Penerimaan:**
- Vendor dapat memilih menu yang akan dihapus.
- Sistem meminta konfirmasi sebelum menjalankan penghapusan.
- Sistem memeriksa keterkaitan data sesuai aturan integritas database.
- Penghapusan hanya dilakukan apabila memenuhi ketentuan sistem.
- Sistem memberikan informasi apabila penghapusan tidak dapat dilakukan.

### FR-11 — Memperbarui Ketersediaan Menu

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor mengubah status ketersediaan menu. |
| Prasyarat | Menu telah tersedia dan vendor memiliki kewenangan untuk mengelolanya. |
| Hasil yang Diharapkan | Status ketersediaan menu berhasil diperbarui. |

**Kriteria Penerimaan:**
- Vendor dapat memilih menu yang ingin diperbarui.
- Vendor dapat mengubah status tersedia atau tidak tersedia.
- Sistem menyimpan perubahan pada atribut status_tersedia.
- Katalog menampilkan status ketersediaan terbaru.

### FR-12 — Pengelolaan Informasi Tenant

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor, Administrator |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan fasilitas pengelolaan informasi tenant sesuai kewenangan pengguna. |
| Prasyarat | Pengguna telah login dan memiliki hak akses yang sesuai. |
| Hasil yang Diharapkan | Informasi tenant dapat dilihat atau diperbarui sesuai kewenangan. |

**Kriteria Penerimaan:**
- Vendor dapat melihat informasi tenant yang dikelolanya.
- Vendor dapat memperbarui informasi tenant sesuai kewenangannya.
- Administrator dapat melihat dan mengelola informasi tenant.
- Sistem memvalidasi informasi sebelum menyimpan perubahan.
- Perubahan informasi tenant ditampilkan pada sistem setelah berhasil disimpan.

---

## 2.3 Keranjang Belanja

### FR-13 — Menyediakan Keranjang Belanja

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan keranjang belanja untuk menampung menu yang dipilih customer. |
| Prasyarat | Customer telah login. |
| Hasil yang Diharapkan | Customer dapat menggunakan keranjang untuk menyusun pesanan. |

**Kriteria Penerimaan:**
- Customer dapat membuka halaman keranjang.
- Sistem menampilkan item yang telah ditambahkan.
- Keranjang terhubung dengan customer yang sedang login.
- Sistem menampilkan informasi apabila keranjang masih kosong.

### FR-14 — Menambahkan Item ke Keranjang

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan customer menambahkan menu ke keranjang. |
| Prasyarat | Customer telah login dan menu tersedia. |
| Hasil yang Diharapkan | Item menu berhasil ditambahkan ke keranjang. |

**Kriteria Penerimaan:**
- Customer memilih menu yang tersedia.
- Customer menentukan jumlah item.
- Sistem memvalidasi jumlah yang dimasukkan.
- Sistem menyimpan item ke dalam ITEM_KERANJANG.
- Item ditampilkan pada halaman keranjang.

### FR-15 — Mengubah Jumlah Item

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan customer mengubah jumlah menu yang terdapat dalam keranjang. |
| Prasyarat | Keranjang memiliki minimal satu item. |
| Hasil yang Diharapkan | Jumlah item berhasil diperbarui. |

**Kriteria Penerimaan:**
- Customer dapat memilih item yang akan diubah.
- Customer dapat memasukkan jumlah baru.
- Sistem memvalidasi jumlah yang dimasukkan.
- Sistem menyimpan perubahan pada atribut jumlah.
- Total harga keranjang diperbarui berdasarkan jumlah terbaru.

### FR-16 — Menambahkan Catatan Item

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Should Have |
| Deskripsi | Sistem harus memungkinkan customer menambahkan catatan pada item dalam keranjang. |
| Prasyarat | Customer memiliki item dalam keranjang. |
| Hasil yang Diharapkan | Catatan berhasil disimpan bersama item keranjang. |

**Kriteria Penerimaan:**
- Customer dapat memasukkan catatan pada item.
- Sistem menyimpan catatan pada atribut catatan di ITEM_KERANJANG.
- Catatan ditampilkan kembali ketika customer membuka keranjang.
- Catatan dapat diperbarui sebelum pesanan dibuat.

### FR-17 — Menghapus Item dari Keranjang

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan customer menghapus item dari keranjang. |
| Prasyarat | Keranjang memiliki minimal satu item. |
| Hasil yang Diharapkan | Item yang dipilih berhasil dihapus dari keranjang. |

**Kriteria Penerimaan:**
- Customer dapat memilih item yang ingin dihapus.
- Sistem menghapus item yang dipilih.
- Item yang dihapus tidak lagi ditampilkan dalam keranjang.
- Total harga keranjang diperbarui setelah penghapusan.

### FR-18 — Menampilkan Total Keranjang

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan jumlah item dan total harga seluruh item dalam keranjang. |
| Prasyarat | Customer membuka halaman keranjang. |
| Hasil yang Diharapkan | Informasi jumlah item dan total harga ditampilkan. |

**Kriteria Penerimaan:**
- Sistem menampilkan jumlah setiap item.
- Sistem menghitung subtotal berdasarkan jumlah dan harga menu.
- Sistem menampilkan total harga keranjang.
- Total diperbarui ketika jumlah item atau isi keranjang berubah.

### FR-19 — Pembatasan Tenant dalam Keranjang

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memastikan satu transaksi pemesanan hanya berasal dari satu tenant. |
| Prasyarat | Customer menambahkan menu ke keranjang. |
| Hasil yang Diharapkan | Item dalam satu transaksi berasal dari tenant yang sama. |

**Kriteria Penerimaan:**
- Sistem mengenali tenant dari menu yang dipilih.
- Sistem tidak menggabungkan menu dari tenant berbeda dalam satu transaksi.
- Sistem memberikan informasi apabila customer mencoba memasukkan menu dari tenant lain.
- Customer harus menyelesaikan atau mengosongkan keranjang sebelum beralih ke tenant lain.

---

## 2.4 Pengelolaan Pesanan

### FR-20 — Membuat Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan customer membuat pesanan berdasarkan item yang terdapat dalam keranjang. |
| Prasyarat | Customer telah login dan keranjang berisi item yang valid. |
| Hasil yang Diharapkan | Pesanan berhasil dibuat dan disimpan dalam sistem. |

**Kriteria Penerimaan:**
- Customer dapat meninjau item sebelum membuat pesanan.
- Sistem memvalidasi item dan tenant yang dipilih.
- Sistem menghitung total harga pesanan.
- Sistem menyimpan informasi pesanan pada PESANAN.
- Sistem menyimpan rincian item pada DETAIL_PESANAN.
- Sistem memberikan informasi apabila pembuatan pesanan gagal.

### FR-21 — Menghasilkan Nomor Antrean

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menghasilkan nomor antrean untuk setiap pesanan. |
| Prasyarat | Pesanan berhasil dibuat. |
| Hasil yang Diharapkan | Pesanan memiliki nomor antrean yang dapat digunakan untuk identifikasi. |

**Kriteria Penerimaan:**
- Sistem menghasilkan nomor antrean ketika pesanan berhasil dibuat.
- Nomor antrean disimpan pada atribut nomor_antrean di PESANAN.
- Nomor antrean ditampilkan pada informasi pesanan.
- Nomor antrean dapat digunakan untuk membantu proses pengambilan pesanan.

### FR-22 — Menyimpan Informasi Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyimpan informasi utama setiap pesanan. |
| Prasyarat | Customer berhasil membuat pesanan. |
| Hasil yang Diharapkan | Informasi pesanan tersimpan pada database. |

**Kriteria Penerimaan:**
- Sistem menyimpan identitas customer.
- Sistem menyimpan identitas tenant.
- Sistem menyimpan nomor antrean.
- Sistem menyimpan status pesanan.
- Sistem menyimpan total harga dan catatan pesanan.
- Sistem menyimpan waktu pemesanan.

### FR-23 — Menyimpan Rincian Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyimpan rincian menu yang terdapat dalam setiap pesanan. |
| Prasyarat | Pesanan berhasil dibuat. |
| Hasil yang Diharapkan | Rincian item pesanan tersimpan pada DETAIL_PESANAN. |

**Kriteria Penerimaan:**
- Sistem menyimpan hubungan rincian dengan pesanan.
- Sistem menyimpan menu yang dipesan.
- Sistem menyimpan jumlah setiap menu.
- Sistem menyimpan subtotal setiap rincian.
- Rincian dapat ditampilkan kembali pada halaman detail pesanan.

### FR-24 — Melihat Daftar Pesanan Masuk

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor melihat pesanan yang ditujukan kepada tenant yang dikelolanya. |
| Prasyarat | Vendor telah login dan terdapat pesanan pada tenant terkait. |
| Hasil yang Diharapkan | Vendor dapat melihat daftar pesanan masuk. |

**Kriteria Penerimaan:**
- Sistem menampilkan daftar pesanan berdasarkan tenant vendor.
- Informasi pesanan mencakup nomor antrean, waktu pemesanan, status, dan total harga.
- Vendor dapat membuka rincian menu dalam pesanan.
- Pesanan dari tenant lain tidak ditampilkan sebagai pesanan yang dikelola vendor tersebut.

### FR-25 — Memperbarui Status Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus memungkinkan vendor memperbarui status pesanan selama proses pemrosesan. |
| Prasyarat | Pesanan tersedia dan vendor memiliki kewenangan terhadap tenant terkait. |
| Hasil yang Diharapkan | Status pesanan berhasil diperbarui. |

**Kriteria Penerimaan:**
- Vendor dapat memilih pesanan yang akan diperbarui.
- Sistem menampilkan status pesanan saat ini.
- Vendor dapat memperbarui status sesuai tahapan proses yang ditetapkan.
- Sistem menyimpan status terbaru pada PESANAN.
- Sistem mencatat perubahan pada RIWAYAT_STATUS.
- Sistem menyimpan waktu perubahan status.

### FR-26 — Menampilkan Status Pesanan kepada Customer

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan status terbaru dari pesanan customer. |
| Prasyarat | Customer memiliki pesanan. |
| Hasil yang Diharapkan | Customer dapat mengetahui perkembangan pesanan. |

**Kriteria Penerimaan:**
- Customer dapat membuka informasi detail pesanan.
- Sistem menampilkan status terbaru pesanan.
- Sistem menampilkan nomor antrean.
- Sistem menampilkan informasi perubahan status yang tersedia.
- Informasi pesanan hanya dapat diakses oleh pengguna yang berwenang.

---

## 2.5 Simulasi Pembayaran

### FR-27 — Memilih Metode Pembayaran

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan pilihan metode pembayaran simulasi berupa QRIS atau dompet digital. |
| Prasyarat | Customer telah membuat pesanan dan masuk ke proses pembayaran. |
| Hasil yang Diharapkan | Metode pembayaran berhasil dipilih. |

**Kriteria Penerimaan:**
- Sistem menampilkan pilihan QRIS dan dompet digital.
- Customer dapat memilih salah satu metode.
- Sistem menyimpan metode pada atribut metode_pembayaran.
- Metode yang dipilih ditampilkan pada informasi pembayaran.

### FR-28 — Menampilkan Kode QRIS

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan kode QRIS untuk mendukung simulasi pembayaran apabila customer memilih metode QRIS. |
| Prasyarat | Customer memilih metode pembayaran QRIS. |
| Hasil yang Diharapkan | Kode QRIS simulasi ditampilkan kepada customer. |

**Kriteria Penerimaan:**
- Sistem menampilkan kode QRIS simulasi.
- Kode QRIS berkaitan dengan informasi pembayaran pesanan.
- Customer memperoleh informasi bahwa pembayaran bersifat simulasi.
- Sistem tidak mengklaim bahwa pembayaran telah diterima oleh penyedia pembayaran nyata.

### FR-29 — Menyimpan Informasi Pembayaran

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyimpan informasi pembayaran yang berkaitan dengan pesanan. |
| Prasyarat | Customer telah memilih metode pembayaran. |
| Hasil yang Diharapkan | Informasi pembayaran tersimpan pada database. |

**Kriteria Penerimaan:**
- Sistem menyimpan hubungan pembayaran dengan pesanan.
- Sistem menyimpan metode pembayaran.
- Sistem menyimpan kode QRIS apabila digunakan.
- Sistem menyimpan total pembayaran.
- Sistem menyimpan status verifikasi.
- Sistem menyimpan batas waktu dan waktu pembayaran sesuai proses yang berlangsung.

### FR-30 — Verifikasi Pembayaran Simulasi

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem, Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyediakan mekanisme verifikasi status pembayaran dalam lingkungan simulasi. |
| Prasyarat | Informasi pembayaran telah dibuat. |
| Hasil yang Diharapkan | Status verifikasi pembayaran dapat diketahui. |

**Kriteria Penerimaan:**
- Sistem menyediakan mekanisme untuk memperbarui status verifikasi pembayaran.
- Status verifikasi disimpan pada atribut status_verifikasi.
- Sistem menampilkan hasil verifikasi kepada pihak yang berwenang.
- Proses verifikasi tidak memerlukan koneksi ke penyedia pembayaran nyata.
- Sistem membedakan pembayaran yang belum diverifikasi dan yang telah diverifikasi sesuai status yang ditetapkan.

### FR-31 — Mencatat Waktu Pembayaran

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus mencatat batas waktu pembayaran dan waktu pembayaran sesuai proses simulasi. |
| Prasyarat | Data pembayaran telah dibuat. |
| Hasil yang Diharapkan | Informasi waktu pembayaran tersimpan. |

**Kriteria Penerimaan:**
- Sistem menyimpan batas waktu pembayaran.
- Sistem menyimpan waktu pembayaran apabila proses pembayaran telah dilakukan.
- Informasi waktu dapat ditampilkan kembali sesuai data pembayaran.
- Sistem dapat membedakan pembayaran yang belum dilakukan dan pembayaran yang telah tercatat.

### FR-32 — Menampilkan Status Pembayaran

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan informasi status pembayaran kepada customer. |
| Prasyarat | Customer memiliki pesanan dengan informasi pembayaran. |
| Hasil yang Diharapkan | Customer dapat mengetahui status pembayaran pesanan. |

**Kriteria Penerimaan:**
- Sistem menampilkan metode pembayaran yang dipilih.
- Sistem menampilkan total pembayaran.
- Sistem menampilkan status verifikasi pembayaran.
- Sistem menampilkan informasi batas waktu pembayaran apabila tersedia.

---

## 2.6 Riwayat Pesanan dan Notifikasi

### FR-33 — Melihat Riwayat Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Should Have |
| Deskripsi | Sistem harus menampilkan riwayat pesanan yang pernah dibuat oleh customer. |
| Prasyarat | Customer telah login dan memiliki data pesanan. |
| Hasil yang Diharapkan | Daftar riwayat pesanan dapat ditampilkan. |

**Kriteria Penerimaan:**
- Sistem menampilkan pesanan berdasarkan customer yang sedang login.
- Informasi mencakup nomor antrean, tenant, waktu pemesanan, total harga, dan status pesanan.
- Customer dapat melihat rincian pesanan.
- Customer tidak dapat melihat riwayat pesanan milik pengguna lain.

### FR-34 — Mencatat Riwayat Perubahan Status

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menyimpan perubahan status pesanan beserta waktu perubahannya. |
| Prasyarat | Terjadi perubahan status pesanan. |
| Hasil yang Diharapkan | Perubahan status tercatat dalam RIWAYAT_STATUS. |

**Kriteria Penerimaan:**
- Sistem mencatat status yang diterapkan pada pesanan.
- Sistem mencatat waktu perubahan status.
- Setiap catatan terhubung dengan pesanan terkait.
- Riwayat dapat digunakan untuk menampilkan perkembangan pesanan.

### FR-35 — Menyediakan Notifikasi Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Sistem |
| Prioritas | Should Have |
| Deskripsi | Sistem harus menyediakan notifikasi yang berisi informasi terkait pesanan kepada pengguna. |
| Prasyarat | Terdapat peristiwa atau perubahan informasi pesanan yang memerlukan pemberitahuan. |
| Hasil yang Diharapkan | Notifikasi tersimpan dan dapat ditampilkan kepada pengguna terkait. |

**Kriteria Penerimaan:**
- Sistem membuat notifikasi berdasarkan peristiwa pesanan yang ditetapkan.
- Notifikasi terhubung dengan pengguna dan pesanan terkait.
- Sistem menyimpan isi pesan notifikasi.
- Notifikasi dapat ditampilkan kepada pengguna yang berhak menerimanya.

### FR-36 — Melihat Status Baca Notifikasi

| Atribut | Keterangan |
|---|---|
| Aktor | Customer, Vendor |
| Prioritas | Should Have |
| Deskripsi | Sistem harus memungkinkan pengguna melihat status baca notifikasi yang diterima. |
| Prasyarat | Pengguna memiliki notifikasi. |
| Hasil yang Diharapkan | Status baca notifikasi dapat diketahui. |

**Kriteria Penerimaan:**
- Sistem menampilkan daftar notifikasi milik pengguna.
- Sistem membedakan notifikasi yang sudah dibaca dan belum dibaca.
- Status baca mengikuti nilai atribut status_baca.
- Pengguna hanya dapat melihat notifikasi yang berkaitan dengan akunnya.

---

## 2.7 Self-Pickup

### FR-37 — Menampilkan Nomor Antrean

| Atribut | Keterangan |
|---|---|
| Aktor | Customer |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan nomor antrean pada informasi pesanan customer. |
| Prasyarat | Pesanan telah berhasil dibuat. |
| Hasil yang Diharapkan | Customer dapat mengetahui nomor antrean pesanan. |

**Kriteria Penerimaan:**
- Sistem menampilkan nomor antrean pada halaman detail pesanan.
- Nomor antrean sesuai dengan data PESANAN.
- Nomor antrean dapat digunakan customer untuk mengidentifikasi pesanan saat pengambilan.

### FR-38 — Menampilkan Pesanan Siap Diambil

| Atribut | Keterangan |
|---|---|
| Aktor | Customer, Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus menampilkan informasi pesanan yang telah siap diambil. |
| Prasyarat | Status pesanan telah diperbarui menjadi siap diambil. |
| Hasil yang Diharapkan | Customer dan vendor dapat mengetahui bahwa pesanan siap diambil. |

**Kriteria Penerimaan:**
- Vendor dapat melihat pesanan yang siap diambil.
- Customer dapat melihat status siap diambil pada informasi pesanan.
- Sistem menampilkan nomor antrean pesanan.
- Informasi yang ditampilkan sesuai dengan status terbaru.

### FR-39 — Menyelesaikan Pesanan

| Atribut | Keterangan |
|---|---|
| Aktor | Vendor |
| Prioritas | Must Have |
| Deskripsi | Sistem harus mendukung penyelesaian pesanan setelah proses pengambilan dilakukan. |
| Prasyarat | Pesanan telah mencapai tahap siap diambil dan proses pengambilan telah dilakukan. |
| Hasil yang Diharapkan | Status pesanan diperbarui menjadi selesai. |

**Kriteria Penerimaan:**
- Vendor dapat memilih pesanan yang telah diambil customer.
- Vendor dapat memperbarui status pesanan menjadi selesai.
- Sistem memperbarui status pada PESANAN.
- Sistem mencatat perubahan pada RIWAYAT_STATUS.
- Customer dapat melihat status pesanan yang telah selesai.

---

## 2.8 Pengelolaan Data oleh Administrator

### FR-40 — Melihat Data Pengguna

| Atribut | Keterangan |
|---|---|
| Aktor | Administrator |
| Prioritas | Should Have |
| Deskripsi | Sistem harus memungkinkan administrator melihat data pengguna yang tersimpan. |
| Prasyarat | Administrator telah login. |
| Hasil yang Diharapkan | Daftar data pengguna dapat ditampilkan. |

**Kriteria Penerimaan:**
- Sistem menampilkan daftar pengguna.
- Informasi pengguna ditampilkan sesuai atribut USER yang tersedia.
- Administrator dapat melihat informasi peran pengguna.
- Data yang ditampilkan tidak mengungkapkan password dalam bentuk aslinya.

### FR-41 — Mengelola Data Pengguna

| Atribut | Keterangan |
|---|---|
| Aktor | Administrator |
| Prioritas | Should Have |
| Deskripsi | Sistem harus memungkinkan administrator mengelola data pengguna sesuai kewenangannya. |
| Prasyarat | Administrator telah login dan memiliki akses pengelolaan pengguna. |
| Hasil yang Diharapkan | Data pengguna dapat diperbarui sesuai ketentuan sistem. |

**Kriteria Penerimaan:**
- Administrator dapat memilih data pengguna yang akan dikelola.
- Sistem menampilkan informasi pengguna yang dapat dikelola.
- Administrator dapat memperbarui informasi yang diizinkan.
- Sistem memvalidasi perubahan sebelum menyimpannya.
- Pengelolaan tidak menambahkan atribut atau status akun di luar ERD.

### FR-42 — Mengelola Data Tenant

| Atribut | Keterangan |
|---|---|
| Aktor | Administrator |
| Prioritas | Should Have |
| Deskripsi | Sistem harus memungkinkan administrator melihat dan mengelola data tenant. |
| Prasyarat | Administrator telah login. |
| Hasil yang Diharapkan | Data tenant dapat dikelola sesuai kewenangan administrator. |

**Kriteria Penerimaan:**
- Sistem menampilkan daftar tenant.
- Administrator dapat melihat informasi tenant.
- Administrator dapat memperbarui informasi tenant sesuai kewenangannya.
- Sistem memvalidasi data sebelum menyimpan perubahan.
- Informasi yang dikelola mengikuti atribut TENANT pada ERD.

---

# 3. Ketentuan Umum Implementasi

## 3.1 Konsistensi dengan ERD

Seluruh implementasi kebutuhan fungsional harus mengikuti struktur basis data yang telah ditetapkan dalam ERD final LetsOrder.com. ERD tersebut terdiri atas sebelas entitas:

1. USER
2. TENANT
3. KATEGORI
4. MENU
5. KERANJANG
6. ITEM_KERANJANG
7. PESANAN
8. DETAIL_PESANAN
9. PEMBAYARAN
10. RIWAYAT_STATUS
11. NOTIFIKASI

Kebutuhan fungsional tidak boleh secara sepihak menambahkan entitas, atribut, atau relasi baru di luar rancangan tersebut.

## 3.2 Ketentuan Proses Pemesanan

1. Customer harus memiliki akun dan melakukan login sebelum membuat pesanan.
2. Customer memilih menu dari satu tenant untuk satu transaksi.
3. Sistem menyimpan item pesanan beserta jumlah dan subtotal.
4. Sistem menghasilkan nomor antrean setelah pesanan berhasil dibuat.
5. Customer dapat memilih metode pembayaran simulasi.
6. Vendor memproses pesanan dan memperbarui statusnya.
7. Customer mengambil pesanan secara langsung di tenant.
8. Pesanan dinyatakan selesai setelah proses pengambilan dikonfirmasi melalui pembaruan status oleh vendor.

## 3.3 Ketentuan Pembayaran

1. Pembayaran hanya digunakan untuk simulasi proses transaksi.
2. Metode pembayaran yang disediakan adalah QRIS dan dompet digital.
3. Informasi pembayaran disimpan pada entitas PEMBAYARAN.
4. Sistem tidak melakukan transaksi keuangan nyata.
5. Status pembayaran harus dibedakan dari status pesanan.

## 3.4 Ketentuan Pengujian

Setiap kebutuhan fungsional harus diuji berdasarkan kriteria penerimaan yang telah ditentukan. Pengujian dilakukan untuk memastikan bahwa fungsi berjalan sesuai deskripsi, hak akses diterapkan dengan benar, dan data yang dihasilkan sesuai dengan rancangan database.

Hasil pengujian setiap kebutuhan dapat dicatat menggunakan identitas FR yang bersangkutan sehingga memudahkan proses pelacakan kebutuhan dan evaluasi sistem.

---

# 4. Penutup

Dokumen Functional Requirements ini menjadi pedoman teknis dalam memahami fungsi yang harus tersedia pada sistem LetsOrder.com. Setiap kebutuhan telah diberikan identitas dan kriteria penerimaan agar dapat digunakan dalam proses implementasi serta pengujian.

Seluruh fungsi yang dikembangkan harus tetap memperhatikan batasan proyek, pembagian hak akses pengguna, mekanisme self-pickup, simulasi pembayaran digital, serta konsistensi dengan ERD final.