# User Stories — LetsOrder.com

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen User Stories menjelaskan kebutuhan sistem dari sudut pandang pengguna LetsOrder.com. Setiap kebutuhan dirumuskan berdasarkan peran pengguna, tujuan yang ingin dicapai, dan manfaat yang diharapkan.

User story digunakan sebagai acuan dalam proses pengembangan, penentuan prioritas pekerjaan, serta penyusunan skenario pengujian. Setiap user story dilengkapi dengan acceptance criteria sebagai kriteria untuk menentukan apakah fungsi yang dikembangkan telah memenuhi kebutuhan pengguna.

### 1.2 Format User Story

User story menggunakan format:

**As a [role], I want [goal], so that [benefit].**

Keterangan:
- **As a:** Menjelaskan peran pengguna.
- **I want:** Menjelaskan tujuan atau kebutuhan pengguna.
- **So that:** Menjelaskan manfaat yang ingin diperoleh.

### 1.3 Aktor Sistem

| Aktor | Deskripsi |
|---|---|
| Customer | Pengguna yang melihat menu, melakukan pemesanan, melakukan simulasi pembayaran, dan mengambil pesanan. |
| Vendor | Pengelola tenant yang mengatur informasi tenant, menu, serta pesanan. |
| Administrator | Pengguna yang memiliki kewenangan untuk mengelola data pengguna dan tenant sesuai aturan sistem. |

---

## 2. User Stories — Customer

### US-CUS-01 — Registrasi Akun

**Prioritas:** Must Have  
**Terkait Fitur:** FP-01 Authentication and User Access

**User Story:**

As a customer, I want to register an account, so that I can access the LetsOrder.com system as a customer.

**Acceptance Criteria:**
1. Pengguna dapat mengisi informasi registrasi yang diperlukan.
2. Sistem memvalidasi informasi yang dimasukkan.
3. Sistem menyimpan informasi akun apabila data memenuhi ketentuan.
4. Sistem menampilkan informasi apabila registrasi berhasil atau gagal.

### US-CUS-02 — Login

**Prioritas:** Must Have  
**Terkait Fitur:** FP-01 Authentication and User Access

**User Story:**

As a customer, I want to log in to my account, so that I can access customer features.

**Acceptance Criteria:**
1. Customer dapat memasukkan username dan password.
2. Sistem memeriksa kecocokan informasi login.
3. Customer dapat masuk apabila informasi login valid.
4. Sistem menolak login apabila informasi yang dimasukkan tidak sesuai.

### US-CUS-03 — Melihat Katalog Menu

**Prioritas:** Must Have  
**Terkait Fitur:** FP-02 Menu Catalog

**User Story:**

As a customer, I want to view the available tenants and menus, so that I can choose food before placing an order.

**Acceptance Criteria:**
1. Sistem menampilkan daftar tenant.
2. Sistem menampilkan kategori menu.
3. Sistem menampilkan nama, deskripsi, gambar, dan harga menu sesuai data yang tersedia.
4. Sistem menampilkan estimasi waktu penyajian dan status ketersediaan menu.
5. Customer dapat melihat menu berdasarkan tenant yang dipilih.

### US-CUS-04 — Melihat Detail Menu

**Prioritas:** Must Have  
**Terkait Fitur:** FP-02 Menu Catalog

**User Story:**

As a customer, I want to view menu details, so that I can understand the food information before selecting it.

**Acceptance Criteria:**
1. Customer dapat membuka detail menu.
2. Sistem menampilkan informasi menu yang tersedia.
3. Sistem menampilkan harga, deskripsi, estimasi waktu penyajian, dan status ketersediaan.
4. Customer dapat kembali ke katalog menu.

### US-CUS-05 — Mengelola Keranjang

**Prioritas:** Must Have  
**Terkait Fitur:** FP-04 Shopping Cart

**User Story:**

As a customer, I want to add and manage menu items in my cart, so that I can prepare my order before checkout.

**Acceptance Criteria:**
1. Customer dapat menambahkan menu yang tersedia ke keranjang.
2. Customer dapat mengubah jumlah item.
3. Customer dapat menambahkan catatan pada item keranjang.
4. Customer dapat menghapus item dari keranjang.
5. Sistem menampilkan ringkasan item dan perhitungan harga berdasarkan jumlah yang dipilih.

### US-CUS-06 — Membuat Pesanan

**Prioritas:** Must Have  
**Terkait Fitur:** FP-05 Order Management

**User Story:**

As a customer, I want to create an order from my cart, so that I can purchase the selected menu items.

**Acceptance Criteria:**
1. Customer dapat melanjutkan proses pemesanan apabila keranjang berisi item.
2. Sistem menampilkan ringkasan pesanan sebelum dikonfirmasi.
3. Sistem menyimpan informasi pesanan dan detail pesanan.
4. Sistem menghasilkan nomor antrean untuk pesanan.
5. Sistem menampilkan informasi pesanan setelah berhasil dibuat.
6. Pesanan hanya ditujukan kepada satu tenant sesuai struktur database.

### US-CUS-07 — Melakukan Simulasi Pembayaran

**Prioritas:** Must Have  
**Terkait Fitur:** FP-06 Digital Payment Simulation

**User Story:**

As a customer, I want to complete a simulated digital payment, so that my order can proceed through the payment process.

**Acceptance Criteria:**
1. Customer dapat melihat informasi pembayaran berdasarkan pesanan.
2. Sistem menyediakan pilihan metode pembayaran yang ditetapkan untuk simulasi.
3. Sistem menampilkan kode QRIS untuk keperluan simulasi.
4. Sistem menampilkan jumlah pembayaran dan batas waktu pembayaran.
5. Sistem menampilkan status verifikasi pembayaran.
6. Sistem mencatat waktu pembayaran apabila pembayaran dinyatakan berhasil.
7. Sistem tidak melakukan transaksi keuangan sungguhan melalui payment gateway.

### US-CUS-08 — Melihat Status Pesanan

**Prioritas:** Must Have  
**Terkait Fitur:** FP-07 Order Tracking

**User Story:**

As a customer, I want to track my order status, so that I can know the progress of my order.

**Acceptance Criteria:**
1. Customer dapat melihat status pesanan yang dimilikinya.
2. Sistem menampilkan status pesanan terkini.
3. Customer dapat melihat riwayat perubahan status apabila tersedia.
4. Informasi status yang ditampilkan sesuai dengan data pesanan pada sistem.

### US-CUS-09 — Melihat Riwayat Pesanan

**Prioritas:** Should Have  
**Terkait Fitur:** FP-08 Order History

**User Story:**

As a customer, I want to view my previous orders, so that I can review my order history.

**Acceptance Criteria:**
1. Customer dapat membuka halaman riwayat pesanan.
2. Sistem menampilkan daftar pesanan milik customer yang sedang login.
3. Sistem menampilkan informasi nomor antrean, waktu pemesanan, total harga, dan status pesanan.
4. Customer dapat melihat detail pesanan yang dipilih.

### US-CUS-10 — Melihat Notifikasi

**Prioritas:** Should Have  
**Terkait Fitur:** FP-09 Notification

**User Story:**

As a customer, I want to receive order-related notifications, so that I can obtain information about my order.

**Acceptance Criteria:**
1. Sistem dapat menyimpan notifikasi yang berkaitan dengan pesanan.
2. Customer dapat melihat daftar notifikasi miliknya.
3. Sistem menampilkan isi pesan notifikasi.
4. Customer dapat mengetahui status baca notifikasi.
5. Notifikasi hanya dapat diakses oleh pengguna yang berhak.

### US-CUS-11 — Mengambil Pesanan Secara Mandiri

**Prioritas:** Must Have  
**Terkait Fitur:** FP-12 Self-Pickup

**User Story:**

As a customer, I want to collect my order directly from the tenant using my queue number, so that I can receive my food without a delivery service.

**Acceptance Criteria:**
1. Sistem menampilkan nomor antrean