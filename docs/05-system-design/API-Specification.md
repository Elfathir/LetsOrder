# API Specification

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | API Specification |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Backend | Laravel |
| Frontend | React |
| Database | MySQL |
| Format Data | JSON |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

API Specification merupakan dokumen yang menjelaskan rancangan antarmuka komunikasi antara frontend dan backend LetsOrder.com.

Dokumen ini digunakan sebagai acuan bagi pengembang frontend dan backend dalam menentukan endpoint, metode HTTP, parameter, format request, format response, serta hak akses setiap API.

Dengan adanya spesifikasi ini, proses integrasi antara React dan Laravel dapat dilakukan secara lebih terstruktur dan konsisten.

## 1.2 Ruang Lingkup

Spesifikasi API mencakup fungsi utama berikut:

1. Authentication dan Authorization.
2. Pengelolaan tenant.
3. Pengelolaan kategori dan menu.
4. Pengelolaan keranjang.
5. Pengelolaan pesanan.
6. Pembayaran simulasi.
7. Pelacakan dan riwayat status pesanan.
8. Pengelolaan notifikasi.
9. Pengelolaan data pengguna oleh Administrator.

## 1.3 Standar API

API LetsOrder.com dirancang dengan mengikuti ketentuan berikut:

| Komponen | Standar |
|---|---|
| Arsitektur | RESTful API |
| Base URL | `/api/v1` |
| Format request | JSON |
| Format response | JSON |
| Metode HTTP | GET, POST, PUT, PATCH, DELETE |
| Identifikasi sumber daya | ID masing-masing entitas |
| Komunikasi | HTTP atau HTTPS sesuai lingkungan deployment |
| Autentikasi | Token atau mekanisme autentikasi Laravel yang ditetapkan saat implementasi |

## 1.4 Konvensi Penamaan

1. Endpoint menggunakan format jamak untuk koleksi sumber daya, misalnya `/tenants` dan `/menus`.
2. Parameter ID dituliskan menggunakan format `{id}`.
3. Request dan response menggunakan JSON.
4. Nama atribut dalam payload mengikuti nama atribut yang telah ditetapkan pada ERD.
5. Endpoint yang memerlukan autentikasi harus menyertakan kredensial autentikasi yang valid.
6. Endpoint yang memiliki pembatasan peran harus melalui pemeriksaan otorisasi backend.

---

# 2. Autentikasi dan Hak Akses

## 2.1 Peran Pengguna

LetsOrder.com memiliki tiga peran pengguna.

| Peran | Keterangan |
|---|---|
| Customer | Melakukan pemesanan dan memantau pesanannya. |
| Vendor | Mengelola tenant, menu, dan pesanan tenant yang dikelolanya. |
| Administrator | Mengelola data pengguna dan tenant sesuai kewenangannya. |

## 2.2 Matriks Hak Akses API

Keterangan:

- **Publik:** dapat diakses tanpa login.
- **Ya:** dapat diakses setelah login dan pemeriksaan kewenangan.
- **-:** tidak diberikan akses berdasarkan rancangan ini.

| Modul | Publik | Customer | Vendor | Administrator |
|---|---|---|---|---|
| Registrasi | Ya | - | - | - |
| Login | Ya | Ya | Ya | Ya |
| Daftar tenant | Ya | Ya | Ya | Ya |
| Katalog menu | Ya | Ya | Ya | Ya |
| Detail menu | Ya | Ya | Ya | Ya |
| Pengelolaan menu | - | - | Ya | Sesuai kewenangan |
| Pengelolaan tenant | - | - | Ya | Ya |
| Keranjang | - | Ya | - | - |
| Pembuatan pesanan | - | Ya | - | - |
| Pengelolaan pesanan | - | - | Ya | Sesuai kewenangan |
| Pembayaran | - | Ya | Sesuai kewenangan | Sesuai kewenangan |
| Riwayat pesanan | - | Ya | - | - |
| Notifikasi | - | Ya | Ya | Sesuai kewenangan |
| Pengelolaan pengguna | - | - | - | Ya |

Hak akses Administrator terhadap menu, pesanan, pembayaran, dan notifikasi tidak diperluas tanpa keputusan kebutuhan yang jelas.

## 2.3 Mekanisme Autentikasi

Untuk endpoint yang membutuhkan login, frontend mengirimkan token autentikasi melalui HTTP header.

Contoh:

```http
Authorization: Bearer {access_token}
Content-Type: application/json
Accept: application/json
```

Token harus divalidasi oleh backend sebelum permintaan diproses.

Mekanisme penerbitan, penyimpanan, masa berlaku, dan pencabutan token ditetapkan pada tahap implementasi autentikasi Laravel.

---

# 3. Daftar Endpoint API

## 3.1 Authentication API

Authentication API digunakan untuk registrasi, login, dan pemeriksaan identitas pengguna.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| POST | `/auth/register` | Registrasi akun Customer | Publik |
| POST | `/auth/login` | Login pengguna | Publik |
| GET | `/auth/me` | Mendapatkan informasi akun yang sedang login | Semua pengguna terautentikasi |

### A. Registrasi Customer

**Endpoint:** `POST /api/v1/auth/register`

Request:

```json
{
  "username": "customer01",
  "nama": "Pengguna Contoh",
  "email": "customer@example.com",
  "password": "password123"
}
```

Response berhasil:

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id_user": 1,
    "username": "customer01",
    "nama": "Pengguna Contoh",
    "email": "customer@example.com",
    "peran": "Customer"
  }
}
```

Catatan: peran akun Customer ditentukan oleh backend sesuai mekanisme registrasi. Pengguna tidak boleh menetapkan peran Administrator atau Vendor secara bebas melalui request registrasi.

### B. Login

**Endpoint:** `POST /api/v1/auth/login`

Request:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Response berhasil:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "example_access_token",
    "token_type": "Bearer",
    "user": {
      "id_user": 1,
      "username": "customer01",
      "nama": "Pengguna Contoh",
      "email": "customer@example.com",
      "peran": "Customer"
    }
  }
}
```

Nilai token di atas hanya contoh ilustrasi, bukan token yang benar-benar berlaku.

### C. Informasi Akun

**Endpoint:** `GET /api/v1/auth/me`

Response berhasil:

```json
{
  "success": true,
  "message": "Data pengguna berhasil diambil",
  "data": {
    "id_user": 1,
    "username": "customer01",
    "nama": "Pengguna Contoh",
    "email": "customer@example.com",
    "peran": "Customer"
  }
}
```

---

## 3.2 Tenant API

Tenant API digunakan untuk menampilkan dan mengelola informasi tenant.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/tenants` | Menampilkan daftar tenant | Publik |
| GET | `/tenants/{id}` | Menampilkan detail tenant | Publik |
| PUT | `/tenants/{id}` | Memperbarui informasi tenant | Vendor pemilik, Administrator |

### A. Daftar Tenant

**Endpoint:** `GET /api/v1/tenants`

Response berhasil:

```json
{
  "success": true,
  "message": "Daftar tenant berhasil diambil",
  "data": [
    {
      "id_tenant": 1,
      "id_user": 2,
      "nama_tenant": "Kantin Sejahtera",
      "deskripsi": "Menyediakan makanan dan minuman",
      "logo": "tenant/logo1.png",
      "status_buka": true
    }
  ]
}
```

### B. Detail Tenant

**Endpoint:** `GET /api/v1/tenants/{id}`

Response berhasil menggunakan struktur data tenant yang sama dengan daftar tenant, tetapi hanya mengembalikan satu tenant.

### C. Memperbarui Tenant

**Endpoint:** `PUT /api/v1/tenants/{id}`

Request:

```json
{
  "nama_tenant": "Kantin Sejahtera",
  "deskripsi": "Menyediakan makanan dan minuman",
  "logo": "tenant/logo1.png",
  "status_buka": true
}
```

Backend harus memastikan Vendor hanya dapat memperbarui tenant yang berada dalam kewenangannya.

---

## 3.3 Kategori API

Kategori API digunakan untuk menampilkan kategori yang tersedia dan mendukung pengelompokan menu.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/categories` | Menampilkan daftar kategori | Publik |
| GET | `/categories/{id}` | Menampilkan detail kategori | Publik |

Response daftar kategori:

```json
{
  "success": true,
  "message": "Daftar kategori berhasil diambil",
  "data": [
    {
      "id_kategori": 1,
      "nama_kategori": "Makanan",
      "icon": "food-icon.png"
    },
    {
      "id_kategori": 2,
      "nama_kategori": "Minuman",
      "icon": "drink-icon.png"
    }
  ]
}
```

Endpoint penambahan, perubahan, dan penghapusan kategori belum ditetapkan karena kewenangan pengelolaan kategori belum dikonfirmasi.

---

## 3.4 Menu API

Menu API digunakan untuk menampilkan dan mengelola informasi makanan serta minuman yang tersedia pada tenant.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/menus` | Menampilkan daftar menu | Publik |
| GET | `/menus/{id}` | Menampilkan detail menu | Publik |
| POST | `/menus` | Menambahkan menu | Vendor |
| PUT | `/menus/{id}` | Memperbarui informasi menu | Vendor pemilik |
| DELETE | `/menus/{id}` | Menghapus menu | Vendor pemilik |
| PATCH | `/menus/{id}/availability` | Mengubah ketersediaan menu | Vendor pemilik |

### A. Daftar Menu

**Endpoint:** `GET /api/v1/menus`

Parameter query yang dapat digunakan:

| Parameter | Tipe | Keterangan |
|---|---|---|
| `id_tenant` | Integer | Menampilkan menu berdasarkan tenant. |
| `id_kategori` | Integer | Menampilkan menu berdasarkan kategori. |
| `status_tersedia` | Boolean | Memfilter menu berdasarkan ketersediaan. |

Contoh:

```http
GET /api/v1/menus?id_tenant=1&id_kategori=2
```

Response:

```json
{
  "success": true,
  "message": "Daftar menu berhasil diambil",
  "data": [
    {
      "id_menu": 1,
      "id_tenant": 1,
      "id_kategori": 2,
      "nama_menu": "Es Teh",
      "deskripsi": "Minuman teh dingin",
      "gambar": "menu/es-teh.png",
      "harga": 5000,
      "estimasi_menit": 3,
      "status_tersedia": true
    }
  ]
}
```

### B. Detail Menu

**Endpoint:** `GET /api/v1/menus/{id}`

Mengembalikan informasi lengkap satu menu berdasarkan `id_menu`.

### C. Menambahkan Menu

**Endpoint:** `POST /api/v1/menus`

Request:

```json
{
  "id_tenant": 1,
  "id_kategori": 2,
  "nama_menu": "Es Teh",
  "deskripsi": "Minuman teh dingin",
  "gambar": "menu/es-teh.png",
  "harga": 5000,
  "estimasi_menit": 3,
  "status_tersedia": true
}
```

### D. Memperbarui Menu

**Endpoint:** `PUT /api/v1/menus/{id}`

Request menggunakan atribut menu yang dapat diperbarui sesuai kewenangan Vendor.

### E. Menghapus Menu

**Endpoint:** `DELETE /api/v1/menus/{id}`

Backend harus memeriksa integritas referensial sebelum menghapus data. Perilaku penghapusan apabila menu sudah digunakan dalam keranjang atau pesanan harus mengikuti aturan implementasi yang disepakati.

### F. Mengubah Ketersediaan Menu

**Endpoint:** `PATCH /api/v1/menus/{id}/availability`

Request:

```json
{
  "status_tersedia": false
}
```

Response:

```json
{
  "success": true,
  "message": "Status ketersediaan menu berhasil diperbarui",
  "data": {
    "id_menu": 1,
    "status_tersedia": false
  }
}
```

---

## 3.5 Cart API

Cart API digunakan untuk mengelola keranjang dan item yang dipilih Customer.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/cart` | Menampilkan keranjang | Customer |
| POST | `/cart/items` | Menambahkan item ke keranjang | Customer |
| PUT | `/cart/items/{id}` | Mengubah jumlah atau catatan item | Customer |
| DELETE | `/cart/items/{id}` | Menghapus item dari keranjang | Customer |

### A. Menampilkan Keranjang

**Endpoint:** `GET /api/v1/cart`

Response:

```json
{
  "success": true,
  "message": "Keranjang berhasil diambil",
  "data": {
    "id_keranjang": 1,
    "items": [
      {
        "id_item_keranjang": 1,
        "id_menu": 1,
        "nama_menu": "Es Teh",
        "harga": 5000,
        "jumlah": 2,
        "catatan": "Tanpa es"
      }
    ],
    "total_harga": 10000
  }
}
```

Informasi `nama_menu` dan `harga` pada contoh merupakan data hasil penggabungan informasi menu untuk kebutuhan tampilan, bukan atribut tambahan pada ITEM_KERANJANG.

### B. Menambahkan Item

**Endpoint:** `POST /api/v1/cart/items`

Request:

```json
{
  "id_menu": 1,
  "jumlah": 2,
  "catatan": "Tanpa es"
}
```

### C. Mengubah Item

**Endpoint:** `PUT /api/v1/cart/items/{id}`

Request:

```json
{
  "jumlah": 3,
  "catatan": "Sedikit gula"
}
```

### D. Menghapus Item

**Endpoint:** `DELETE /api/v1/cart/items/{id}`

Response:

```json
{
  "success": true,
  "message": "Item berhasil dihapus",
  "data": null
}
```

Backend harus memastikan item yang diubah atau dihapus merupakan bagian dari keranjang milik Customer yang sedang login.

---

## 3.6 Order API

Order API merupakan bagian utama sistem yang digunakan untuk membuat dan mengelola pesanan.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| POST | `/orders` | Membuat pesanan | Customer |
| GET | `/orders` | Menampilkan riwayat pesanan Customer | Customer |
| GET | `/orders/{id}` | Menampilkan detail pesanan | Customer pemilik, Vendor terkait sesuai kewenangan |
| GET | `/vendor/orders` | Menampilkan pesanan masuk tenant | Vendor |
| PATCH | `/orders/{id}/status` | Memperbarui status pesanan | Vendor terkait |

### A. Membuat Pesanan

**Endpoint:** `POST /api/v1/orders`

Request:

```json
{
  "catatan": "Pesanan untuk dibawa pulang"
}
```

Backend mengambil item dari keranjang Customer yang sedang login dan memvalidasi seluruh item sebelum membuat pesanan.

Respons berhasil:

```json
{
  "success": true,
  "message": "Pesanan berhasil dibuat",
  "data": {
    "id_pesanan": 101,
    "id_user": 1,
    "id_tenant": 1,
    "nomor_antrean": "A001",
    "status_pesanan": "Menunggu Pembayaran",
    "total_harga": 10000,
    "catatan": "Pesanan untuk dibawa pulang",
    "waktu_pesan": "2026-11-10 10:30:00",
    "details": [
      {
        "id_detail": 1,
        "id_menu": 1,
        "jumlah": 2,
        "subtotal": 10000
      }
    ]
  }
}
```

Nomor antrean dan status dalam contoh hanya ilustrasi. Format nomor antrean serta daftar nilai status harus ditetapkan pada implementasi.

### B. Riwayat Pesanan

**Endpoint:** `GET /api/v1/orders`

Endpoint mengembalikan daftar pesanan milik Customer yang sedang login.

### C. Detail Pesanan

**Endpoint:** `GET /api/v1/orders/{id}`

Mengembalikan informasi pesanan beserta detail item dan informasi pembayaran yang relevan dengan hak akses pemanggil.

### D. Pesanan Masuk Vendor

**Endpoint:** `GET /api/v1/vendor/orders`

Vendor hanya dapat melihat pesanan yang ditujukan kepada tenant yang berada dalam kewenangannya.

### E. Memperbarui Status Pesanan

**Endpoint:** `PATCH /api/v1/orders/{id}/status`

Request:

```json
{
  "status_pesanan": "Siap Diambil"
}
```

Backend harus:

1. Memastikan Vendor memiliki kewenangan terhadap pesanan.
2. Memvalidasi perubahan status.
3. Memperbarui status pada PESANAN.
4. Mencatat perubahan pada RIWAYAT_STATUS.
5. Memproses notifikasi apabila perubahan status memerlukan pemberitahuan.

Contoh di atas menggunakan status ilustratif. Daftar status resmi harus mengikuti keputusan implementasi.

---

## 3.7 Payment API

Payment API digunakan untuk mengelola informasi pembayaran dan proses simulasi verifikasi.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| POST | `/orders/{id}/payment` | Membuat data pembayaran | Customer pemilik |
| GET | `/orders/{id}/payment` | Melihat informasi pembayaran | Customer pemilik, Vendor terkait |
| PATCH | `/payments/{id}/verification` | Memperbarui status verifikasi simulasi | Aktor yang ditetapkan dalam implementasi |

### A. Membuat Pembayaran

**Endpoint:** `POST /api/v1/orders/{id}/payment`

Request:

```json
{
  "metode_pembayaran": "QRIS"
}
```

Response:

```json
{
  "success": true,
  "message": "Pembayaran simulasi berhasil dibuat",
  "data": {
    "id_pembayaran": 1,
    "id_pesanan": 101,
    "metode_pembayaran": "QRIS",
    "kode_qris": "QRIS-SIMULASI-001",
    "total_bayar": 10000,
    "status_verifikasi": "Menunggu",
    "batas_waktu": "2026-11-10 10:45:00",
    "waktu_bayar": null
  }
}
```

Nilai kode QRIS di atas merupakan kode simulasi, bukan kode pembayaran yang dapat digunakan untuk transaksi sungguhan.

### B. Melihat Informasi Pembayaran

**Endpoint:** `GET /api/v1/orders/{id}/payment`

Endpoint mengembalikan data pembayaran berdasarkan pesanan dan kewenangan pengguna.

### C. Verifikasi Pembayaran Simulasi

**Endpoint:** `PATCH /api/v1/payments/{id}/verification`

Request ilustratif:

```json
{
  "status_verifikasi": "Terverifikasi"
}
```

Endpoint ini hanya digunakan untuk simulasi. Mekanisme pemanggilan dan aktor yang berwenang melakukan verifikasi harus dikonfirmasi sebelum implementasi karena tidak ada integrasi payment gateway sungguhan.

---

## 3.8 Order Tracking API

Order Tracking API digunakan untuk menampilkan perkembangan pesanan dan riwayat perubahan status.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/orders/{id}/status` | Melihat status terkini pesanan | Customer pemilik, Vendor terkait |
| GET | `/orders/{id}/status-history` | Melihat riwayat status | Customer pemilik, Vendor terkait |

### A. Status Terkini Pesanan

**Endpoint:** `GET /api/v1/orders/{id}/status`

Response:

```json
{
  "success": true,
  "message": "Status pesanan berhasil diambil",
  "data": {
    "id_pesanan": 101,
    "nomor_antrean": "A001",
    "status_pesanan": "Sedang Diproses"
  }
}
```

### B. Riwayat Status Pesanan

**Endpoint:** `GET /api/v1/orders/{id}/status-history`

Response:

```json
{
  "success": true,
  "message": "Riwayat status berhasil diambil",
  "data": [
    {
      "id_riwayat": 1,
      "id_pesanan": 101,
      "status": "Menunggu Pembayaran",
      "waktu": "2026-11-10 10:30:00"
    },
    {
      "id_riwayat": 2,
      "id_pesanan": 101,
      "status": "Sedang Diproses",
      "waktu": "2026-11-10 10:35:00"
    }
  ]
}
```

---

## 3.9 Notification API

Notification API digunakan untuk menampilkan dan memperbarui status baca notifikasi.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/notifications` | Menampilkan notifikasi pengguna | Pengguna terautentikasi |
| PATCH | `/notifications/{id}/read` | Memperbarui status baca | Pemilik notifikasi |

### A. Daftar Notifikasi

**Endpoint:** `GET /api/v1/notifications`

Response:

```json
{
  "success": true,
  "message": "Notifikasi berhasil diambil",
  "data": [
    {
      "id_notifikasi": 1,
      "id_user": 1,
      "id_pesanan": 101,
      "pesan": "Pesanan Anda siap diambil",
      "status_baca": false
    }
  ]
}
```

### B. Memperbarui Status Baca

**Endpoint:** `PATCH /api/v1/notifications/{id}/read`

Request:

```json
{
  "status_baca": true
}
```

Backend hanya mengizinkan pengguna memperbarui notifikasi miliknya sendiri.

---

## 3.10 Administrator API

Administrator API digunakan untuk melihat dan mengelola data pengguna serta tenant.

| Method | Endpoint | Fungsi | Hak Akses |
|---|---|---|---|
| GET | `/admin/users` | Menampilkan daftar pengguna | Administrator |
| GET | `/admin/users/{id}` | Menampilkan detail pengguna | Administrator |
| PUT | `/admin/users/{id}` | Memperbarui informasi pengguna | Administrator |
| GET | `/admin/tenants` | Menampilkan daftar tenant | Administrator |
| POST | `/admin/tenants` | Membuat data tenant | Administrator |
| GET | `/admin/tenants/{id}` | Menampilkan detail tenant | Administrator |
| PUT | `/admin/tenants/{id}` | Memperbarui informasi tenant | Administrator |
| DELETE | `/admin/tenants/{id}` | Menghapus data tenant | Administrator |

### A. Daftar Pengguna

**Endpoint:** `GET /api/v1/admin/users`

Response:

```json
{
  "success": true,
  "message": "Data pengguna berhasil diambil",
  "data": [
    {
      "id_user": 1,
      "username": "customer01",
      "nama": "Pengguna Contoh",
      "email": "customer@example.com",
      "peran": "Customer"
    }
  ]
}
```

### B. Memperbarui Pengguna

**Endpoint:** `PUT /api/v1/admin/users/{id}`

Request:

```json
{
  "username": "customer01",
  "nama": "Pengguna Contoh",
  "email": "customer@example.com",
  "peran": "Customer"
}
```

Backend harus memvalidasi perubahan data dan memastikan hak akses Administrator.

### C. Daftar Tenant

**Endpoint:** `GET /api/v1/admin/tenants`

Mengembalikan daftar tenant untuk kebutuhan administratif.

### D. Membuat Tenant

**Endpoint:** `POST /api/v1/admin/tenants`

Request:

```json
{
  "id_user": 2,
  "nama_tenant": "Kantin Sejahtera",
  "deskripsi": "Menyediakan makanan dan minuman",
  "logo": "tenant/logo1.png",
  "status_buka": true
}
```

### E. Detail Tenant

**Endpoint:** `GET /api/v1/admin/tenants/{id}`

Mengembalikan informasi tenant berdasarkan identitas tenant.

### F. Memperbarui Tenant

**Endpoint:** `PUT /api/v1/admin/tenants/{id}`

Memperbarui informasi tenant sesuai atribut yang tersedia pada entitas TENANT.

### G. Menghapus Tenant

**Endpoint:** `DELETE /api/v1/admin/tenants/{id}`

Penghapusan hanya dapat dilakukan apabila tidak melanggar integritas referensial. Kebijakan penghapusan tenant yang masih memiliki menu atau pesanan harus ditentukan sebelum implementasi.

---

# 4. Standar Request dan Response

## 4.1 Format Request

Seluruh request yang mengirimkan data menggunakan format JSON.

Contoh:

```http
POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer {access_token}
```

```json
{
  "catatan": "Pesanan untuk dibawa pulang"
}
```

## 4.2 Format Response Berhasil

Response berhasil menggunakan struktur umum berikut:

```json
{
  "success": true,
  "message": "Permintaan berhasil diproses",
  "data": {}
}
```

## 4.3 Format Response Gagal

Response gagal menggunakan struktur umum berikut:

```json
{
  "success": false,
  "message": "Permintaan tidak dapat diproses",
  "errors": {}
}
```

## 4.4 HTTP Status Code

| Status Code | Nama | Keterangan |
|---|---|---|
| 200 | OK | Permintaan berhasil diproses. |
| 201 | Created | Data berhasil dibuat. |
| 204 | No Content | Permintaan berhasil tanpa isi response. |
| 400 | Bad Request | Format permintaan tidak sesuai. |
| 401 | Unauthorized | Pengguna belum terautentikasi. |
| 403 | Forbidden | Pengguna tidak memiliki hak akses. |
| 404 | Not Found | Data yang diminta tidak ditemukan. |
| 409 | Conflict | Terjadi konflik dengan kondisi data saat ini. |
| 422 | Unprocessable Content | Data gagal melewati validasi. |
| 500 | Internal Server Error | Terjadi kesalahan pada server. |

---

# 5. Validasi dan Penanganan Kesalahan

## 5.1 Validasi Input

Backend harus memvalidasi data sebelum menjalankan operasi database.

Beberapa contoh validasi:

| Data | Ketentuan Validasi |
|---|---|
| Username | Wajib diisi dan mengikuti aturan format yang ditetapkan. |
| Email | Wajib memiliki format email yang valid. |
| Password | Wajib memenuhi ketentuan keamanan password. |
| Harga menu | Harus berupa nilai numerik yang valid. |
| Jumlah item | Harus berupa bilangan bulat positif. |
| Status ketersediaan | Harus berupa nilai boolean. |
| Status buka tenant | Harus berupa nilai boolean. |
| Metode pembayaran | Harus sesuai pilihan yang didukung sistem. |
| Nomor antrean | Harus tersedia dan sesuai pesanan. |
| Status pesanan | Harus sesuai aturan perubahan status yang diterapkan. |

## 5.2 Penanganan Kesalahan

1. Backend harus memberikan pesan kesalahan yang dapat dipahami.
2. Kesalahan validasi harus dikembalikan dengan status HTTP 422.
3. Permintaan tanpa autentikasi harus ditolak dengan status HTTP 401.
4. Permintaan yang tidak memiliki izin harus ditolak dengan status HTTP 403.
5. Data yang tidak ditemukan harus menghasilkan status HTTP 404.
6. Kesalahan internal tidak boleh menampilkan kredensial database atau informasi sensitif lainnya.

---

# 6. Keamanan API

Keamanan API diterapkan melalui beberapa mekanisme berikut:

## 6.1 Authentication

Setiap endpoint privat harus memverifikasi identitas pengguna melalui mekanisme autentikasi yang ditetapkan.

## 6.2 Authorization

Backend harus memeriksa peran dan kepemilikan data sebelum menjalankan operasi.

Contoh:

- Customer hanya dapat mengakses keranjang dan pesanan miliknya.
- Vendor hanya dapat mengelola menu dan pesanan tenant yang berada dalam kewenangannya.
- Administrator hanya dapat menjalankan fungsi administratif yang telah ditetapkan.

## 6.3 Input Validation

Seluruh data dari frontend harus divalidasi kembali pada backend. Validasi frontend tidak dapat menggantikan validasi backend.

## 6.4 Password Protection

Password tidak boleh dikirimkan kembali dalam response API dan harus disimpan menggunakan mekanisme hashing yang aman.

## 6.5 Secure Configuration

Kredensial database, token, dan konfigurasi rahasia lainnya tidak boleh dituliskan secara langsung pada kode sumber yang dipublikasikan.

---

# 7. Pemetaan Endpoint terhadap Kebutuhan Fungsional

Tabel berikut menghubungkan kelompok endpoint API dengan kebutuhan fungsional yang telah ditetapkan.

| Modul API | Endpoint Utama | ID Kebutuhan Fungsional |
|---|---|---|
| Authentication | `/auth/*` | FR-01 sampai FR-04 |
| Tenant | `/tenants/*` | FR-05, FR-12 |
| Kategori | `/categories/*` | FR-06, FR-08 |
| Menu | `/menus/*` | FR-06 sampai FR-11 |
| Cart | `/cart/*` | FR-13 sampai FR-18 |
| Order | `/orders/*` | FR-19 sampai FR-26, FR-33 |
| Payment | `/orders/{id}/payment`, `/payments/*` | FR-27 sampai FR-32 |
| Order Tracking | `/orders/{id}/status*` | FR-34, FR-37 sampai FR-39 |
| Notification | `/notifications/*` | FR-35, FR-36 |
| Administrator | `/admin/*` | FR-40 sampai FR-42 |

---

# 8. Ketentuan Konsistensi dengan ERD

Seluruh API harus mempertahankan kesesuaian dengan 11 entitas yang telah ditetapkan.

Ketentuan yang wajib diperhatikan:

1. Data pengguna menggunakan entitas USER.
2. Data tenant menggunakan entitas TENANT.
3. Data kategori menggunakan entitas KATEGORI.
4. Data menu menggunakan entitas MENU.
5. Data keranjang menggunakan entitas KERANJANG dan ITEM_KERANJANG.
6. Data transaksi menggunakan entitas PESANAN dan DETAIL_PESANAN.
7. Data pembayaran menggunakan entitas PEMBAYARAN.
8. Riwayat perubahan status menggunakan entitas RIWAYAT_STATUS.
9. Data pemberitahuan menggunakan entitas NOTIFIKASI.
10. Satu pesanan hanya memiliki satu tenant tujuan melalui `id_tenant`.
11. Nomor antrean menggunakan atribut `nomor_antrean`.
12. Pembayaran hanya mendukung proses simulasi.
13. API tidak boleh memperkenalkan atribut atau entitas baru yang tidak terdapat pada ERD final.

Data tambahan yang muncul pada response, seperti `nama_menu` atau `harga` dalam tampilan keranjang, hanya boleh berasal dari hasil pengambilan data atau penggabungan informasi antartabel. Data tersebut tidak otomatis menjadi atribut baru pada tabel.

---

# 9. Catatan Implementasi

Sebelum API diimplementasikan, beberapa keputusan berikut perlu diselesaikan:

1. **Mekanisme autentikasi:** menetapkan penggunaan token dan pengelolaannya pada Laravel.
2. **Pengelolaan kategori:** menentukan apakah Vendor atau Administrator memiliki kewenangan untuk menambah, mengubah, dan menghapus kategori.
3. **Verifikasi pembayaran:** menentukan aktor dan alur verifikasi pembayaran simulasi.
4. **Status pesanan:** menetapkan daftar status dan aturan transisi yang sah.
5. **Penghapusan data:** menentukan penanganan menu dan tenant yang telah digunakan pada keranjang atau pesanan.
6. **Format nomor antrean:** menetapkan aturan pembentukan nomor antrean tanpa menambahkan atribut baru ke ERD.
7. **Pengelolaan gambar:** menetapkan mekanisme upload dan penyimpanan file logo tenant serta gambar menu.

Keputusan tersebut harus didokumentasikan sebelum implementasi agar tidak terjadi perbedaan antara frontend, backend, dan database.

---

# 10. Penutup

API Specification ini menjadi acuan komunikasi antara frontend React dan backend Laravel pada sistem LetsOrder.com. Dokumentasi ini menjelaskan kelompok endpoint, metode HTTP, hak akses, format pertukaran data, serta mekanisme penanganan kesalahan.

Seluruh implementasi API harus mengikuti kebutuhan fungsional dan struktur ERD final. Dengan demikian, pengembangan backend dan integrasi frontend dapat dilakukan secara konsisten serta mendukung proses pemesanan dan self-pickup digital di Kantin UPNVJ.