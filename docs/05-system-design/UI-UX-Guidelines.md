# UI/UX Guidelines

## LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin UPNVJ

| Informasi | Keterangan |
|---|---|
| Nama Proyek | LetsOrder.com |
| Jenis Dokumen | UI/UX Guidelines |
| Versi | 1.0 |
| Status Dokumen | Draft |
| Tanggal | 10 November 2026 |
| Referensi Desain | UI/UX User Vendor |
| Platform | Web Application |
| Frontend | React |

---

# 1. Pendahuluan

## 1.1 Tujuan Dokumen

UI/UX Guidelines merupakan dokumen yang berisi pedoman antarmuka dan pengalaman pengguna dalam pengembangan sistem LetsOrder.com.

Dokumen ini disusun berdasarkan rancangan antarmuka yang telah dibuat oleh tim UI/UX untuk memberikan acuan kepada pengembang frontend dalam mengimplementasikan tampilan sistem menggunakan React.

Pedoman ini bertujuan menjaga konsistensi antarmuka, mempermudah interaksi pengguna, serta memastikan setiap tampilan mendukung proses pemesanan makanan dan minuman dengan mekanisme self-pickup.

## 1.2 Ruang Lingkup

Dokumen ini mencakup pedoman antarmuka untuk dua kelompok pengguna yang telah memiliki rancangan desain:

1. **Customer Interface**, yaitu antarmuka untuk pengguna yang melakukan pemesanan makanan dan minuman.
2. **Vendor Interface**, yaitu antarmuka untuk tenant yang mengelola menu dan memproses pesanan.

Antarmuka Administrator belum tercakup dalam kedua dokumen desain yang tersedia. Oleh karena itu, pedoman untuk Administrator belum ditentukan secara visual dan perlu dilengkapi berdasarkan rancangan lanjutan.

## 1.3 Referensi Desain

Pedoman ini menggunakan dua dokumen desain sebagai referensi utama:

| Dokumen | Pengguna | Cakupan |
|---|---|---|
| `UIUX user.pdf` | Customer | Halaman utama, autentikasi, katalog menu, keranjang, pembayaran, pelacakan pesanan, dan riwayat pesanan. |
| `UIUX vendor.pdf` | Vendor | Dashboard, pengelolaan menu, ketersediaan menu, pesanan masuk, pembayaran, dan riwayat pesanan. |

Implementasi visual harus mengacu pada rancangan asli yang dibuat tim UI/UX. Dokumen ini tidak menggantikan atau mengubah desain Figma.

---

# 2. Prinsip Dasar Desain

## 2.1 Konsistensi Antarmuka

Setiap halaman harus menggunakan pola navigasi, komponen, dan penyajian informasi yang konsisten. Elemen yang memiliki fungsi sama sebaiknya memiliki bentuk dan perilaku yang seragam.

## 2.2 Kemudahan Penggunaan

Antarmuka harus memudahkan Customer menemukan menu, memasukkan pesanan, dan mengetahui perkembangan pesanan. Sementara itu, Vendor harus dapat mengelola menu dan memproses pesanan tanpa melalui langkah yang tidak diperlukan.

## 2.3 Kejelasan Informasi

Informasi penting seperti nama menu, harga, status ketersediaan, nomor antrean, dan status pesanan harus ditampilkan dengan jelas.

## 2.4 Efisiensi Interaksi

Alur penggunaan dirancang agar pengguna dapat menyelesaikan aktivitas utama dengan langkah yang terarah, terutama pada proses pemesanan dan pemrosesan pesanan.

## 2.5 Umpan Balik Sistem

Setiap tindakan penting harus memberikan respons yang dapat dipahami pengguna, misalnya ketika item berhasil ditambahkan ke keranjang, menu berhasil diperbarui, atau status pesanan berubah.

---

# 3. Customer Interface

Customer Interface merupakan antarmuka yang digunakan pengguna untuk mencari menu, membuat pesanan, melakukan pembayaran simulasi, dan mengambil pesanan di tenant.

## 3.1 Navigasi Utama

Rancangan halaman Customer menampilkan navigasi utama yang terdiri atas:

| Menu Navigasi | Fungsi |
|---|---|
| Home | Menampilkan halaman utama dan informasi menu. |
| Tenant | Menampilkan informasi tenant dan menu yang tersedia. |
| Orders | Menampilkan pesanan yang sedang berlangsung. |
| History | Menampilkan riwayat pesanan sebelumnya. |
| Language | Menyediakan pilihan bahasa sesuai rancangan antarmuka. |

Navigasi harus dapat digunakan secara konsisten pada halaman Customer.

## 3.2 Halaman Utama

<text weight="medium">Referensi: UIUX user.pdf — halaman Home.</text>

Halaman utama menjadi titik awal Customer dalam menggunakan LetsOrder.com.

Elemen yang ditampilkan dalam rancangan meliputi:

- Header dengan identitas LetsOrder.com.
- Navigasi utama.
- Kolom pencarian makanan atau minuman.
- Informasi kategori menu.
- Daftar menu populer.
- Kartu menu yang menampilkan nama, tenant, estimasi waktu, dan harga.
- Informasi tenant yang menyediakan menu.

**Pedoman implementasi:**

1. Kolom pencarian harus mudah ditemukan.
2. Kategori menu harus ditampilkan secara terstruktur.
3. Informasi nama menu dan harga harus mudah dibaca.
4. Gambar menu harus ditampilkan secara proporsional.
5. Informasi tenant dan estimasi waktu penyajian harus mudah dikenali.
6. Menu yang tidak tersedia tidak boleh ditampilkan seolah-olah dapat dipesan.

## 3.3 Halaman Autentikasi

<text weight="medium">Referensi: UIUX user.pdf — Login dan Sign Up.</text>

Rancangan autentikasi Customer mencakup halaman login dan pendaftaran akun.

Elemen halaman login:

- Username atau email sesuai rancangan form.
- Password.
- Tombol login.
- Tautan menuju halaman pendaftaran.
- Tautan bantuan akun apabila tersedia dalam implementasi.

Elemen halaman pendaftaran:

- Username.
- Nama pengguna.
- Email.
- Password.
- Tombol pendaftaran.
- Tautan kembali menuju halaman login.

**Pedoman implementasi:**

1. Setiap input harus memiliki label yang jelas.
2. Password harus ditampilkan dalam bentuk tersembunyi secara default.
3. Kesalahan input harus disampaikan melalui pesan yang mudah dipahami.
4. Tombol autentikasi harus memberikan umpan balik ketika proses berlangsung.
5. Sistem harus menampilkan respons yang sesuai ketika login atau registrasi berhasil maupun gagal.

## 3.4 Halaman Katalog Menu

<text weight="medium">Referensi: UIUX user.pdf — halaman Tenant dan Menu.</text>

Halaman katalog digunakan untuk menampilkan makanan dan minuman berdasarkan tenant serta kategori.

Informasi yang ditampilkan meliputi:

- Nama menu.
- Gambar menu.
- Harga menu.
- Nama tenant.
- Estimasi waktu penyajian.
- Kategori menu.
- Status ketersediaan menu.
- Deskripsi menu pada tampilan detail.

**Pedoman implementasi:**

1. Menu ditampilkan menggunakan kartu agar mudah dipindai.
2. Informasi harga harus terlihat jelas.
3. Status tersedia dan tidak tersedia harus memiliki pembeda visual.
4. Menu yang tidak tersedia tidak dapat ditambahkan ke keranjang.
5. Informasi menu harus mengikuti data yang dikirimkan backend.

## 3.5 Halaman Detail Menu

Halaman detail menu digunakan untuk menampilkan informasi lebih lengkap sebelum Customer menambahkan menu ke keranjang.

Informasi utama:

- Nama menu.
- Gambar menu.
- Deskripsi.
- Harga.
- Tenant.
- Estimasi waktu penyajian.
- Jumlah pesanan.
- Catatan untuk menu.
- Tombol tambah ke keranjang.

**Pedoman implementasi:**

1. Nama dan harga menu harus terlihat jelas.
2. Jumlah pesanan harus dapat diubah sesuai ketentuan sistem.
3. Catatan menu harus diteruskan ke atribut `catatan` pada ITEM_KERANJANG.
4. Tombol tambah ke keranjang harus memberikan umpan balik setelah berhasil.
5. Menu yang tidak tersedia tidak boleh diproses sebagai item pesanan baru.

## 3.6 Halaman Keranjang

<text weight="medium">Referensi: UIUX user.pdf — Cart & Promo.</text>

Halaman keranjang digunakan untuk meninjau item yang akan dipesan sebelum Customer melanjutkan proses pembayaran.

Informasi yang relevan dengan ruang lingkup sistem:

- Daftar item keranjang.
- Nama menu.
- Harga menu.
- Jumlah item.
- Catatan item.
- Subtotal.
- Total harga.
- Tombol untuk mengubah atau menghapus item.
- Tombol melanjutkan proses pesanan.

**Pedoman implementasi:**

1. Customer harus dapat meninjau seluruh item sebelum membuat pesanan.
2. Jumlah item dapat diperbarui.
3. Item dapat dihapus dari keranjang.
4. Total harga harus dihitung berdasarkan jumlah dan harga menu yang berlaku.
5. Sistem harus memastikan seluruh item dalam satu pesanan berasal dari tenant yang sama.
6. Customer harus memperoleh informasi apabila item tidak lagi tersedia.

## 3.7 Halaman Pembayaran

<text weight="medium">Referensi: UIUX user.pdf — Payment.</text>

Halaman pembayaran digunakan untuk menampilkan informasi pembayaran simulasi setelah pesanan dibuat.

Elemen yang relevan dengan sistem:

- Ringkasan pesanan.
- Metode pembayaran.
- Informasi kode QRIS simulasi.
- Jumlah pembayaran.
- Status verifikasi pembayaran.
- Batas waktu pembayaran.
- Tombol konfirmasi tindakan pembayaran sesuai mekanisme simulasi.

**Pedoman implementasi:**

1. Jumlah pembayaran harus sesuai dengan total pesanan.
2. Informasi pembayaran harus ditampilkan secara jelas.
3. Status pembayaran harus dapat dibedakan.
4. Batas waktu pembayaran harus mengikuti data `batas_waktu` pada PEMBAYARAN.
5. Sistem harus memberikan informasi apabila pembayaran belum diverifikasi atau melewati batas waktu.
6. QRIS yang ditampilkan merupakan simulasi dan bukan fasilitas transaksi sungguhan.

## 3.8 Halaman Pelacakan Pesanan

<text weight="medium">Referensi: UIUX user.pdf — Preparing dan Pickup.</text>

Halaman pelacakan digunakan untuk memberikan informasi mengenai perkembangan pesanan Customer.

Informasi yang ditampilkan:

- Nomor antrean.
- Ringkasan pesanan.
- Status pesanan.
- Informasi tenant.
- Estimasi waktu penyajian apabila tersedia.
- Informasi bahwa pesanan dapat diambil di tenant.

**Pedoman implementasi:**

1. Status pesanan harus mengikuti data PESANAN.
2. Perubahan status harus ditampilkan secara konsisten.
3. Customer harus dapat melihat nomor antrean sebagai identifikasi pesanan.
4. Sistem harus menampilkan informasi pengambilan pesanan di tenant.
5. Perubahan status yang relevan dapat disampaikan melalui NOTIFIKASI.

Nomor antrean menggunakan atribut `nomor_antrean` pada PESANAN sebagai identifikasi pengambilan pesanan.

## 3.9 Halaman Riwayat Pesanan

<text weight="medium">Referensi: UIUX user.pdf — Order History.</text>

Halaman riwayat digunakan untuk menampilkan daftar pesanan yang pernah dibuat oleh Customer.

Rancangan menyediakan pengelompokan pesanan berdasarkan status, seperti:

- All.
- In Progress.
- Completed.
- Cancelled.

Informasi yang ditampilkan dapat mencakup:

- Ringkasan item pesanan.
- Tanggal dan waktu pesanan.
- Total harga.
- Status pesanan.

**Pedoman implementasi:**

1. Riwayat hanya menampilkan pesanan milik Customer yang sedang login.
2. Informasi status harus sesuai dengan data pesanan.
3. Daftar riwayat harus mudah dipahami.
4. Informasi pesanan harus tetap mengikuti data yang tersimpan pada database.

---

# 4. Vendor Interface

Vendor Interface merupakan antarmuka yang digunakan pengelola tenant untuk mengelola informasi menu dan menangani pesanan Customer.

## 4.1 Navigasi Utama

<text weight="medium">Referensi: UIUX vendor.pdf — Tenant Portal.</text>

Navigasi utama Vendor terdiri atas:

| Menu Navigasi | Fungsi |
|---|---|
| Dashboard | Menampilkan ringkasan aktivitas tenant. |
| Menu | Menampilkan dan mengelola menu. |
| Orders | Menampilkan dan memproses pesanan masuk. |
| History | Menampilkan riwayat pesanan. |
| Language | Menyediakan pilihan bahasa sesuai rancangan. |
| Tenant Information | Menampilkan identitas tenant. |

## 4.2 Dashboard Vendor

<text weight="medium">Referensi: UIUX vendor.pdf — Dashboard.</text>

Dashboard digunakan untuk memberikan gambaran umum mengenai aktivitas tenant.

Rancangan menampilkan ringkasan seperti:

- Orders Today.
- Revenue Today.
- In Queue Now.
- Average Preparation Time.
- Incoming Orders.
- Menu Availability.
- Top Sellers Today.

**Pedoman implementasi:**

1. Informasi ringkasan harus disajikan secara terstruktur.
2. Daftar pesanan masuk harus mudah ditemukan.
3. Status pesanan harus terlihat jelas.
4. Informasi ketersediaan menu harus sesuai dengan data MENU.
5. Data ringkasan harus berasal dari data sistem yang tersedia.

Catatan: beberapa informasi dashboard merupakan hasil perhitungan dari data pesanan dan detail pesanan, bukan atribut tambahan pada ERD. Perhitungan tersebut harus mengikuti data yang tersedia dan tidak boleh dianggap sebagai entitas baru.

## 4.3 Halaman Pengelolaan Menu

<text weight="medium">Referensi: UIUX vendor.pdf — My Menu.</text>

Halaman ini digunakan Vendor untuk melihat daftar menu yang dimiliki tenant.

Informasi yang ditampilkan:

- Nama menu.
- Harga.
- Ketersediaan menu.
- Kolom pencarian menu.
- Pengelompokan menu berdasarkan status ketersediaan.
- Tombol untuk mengubah informasi menu.

**Pedoman implementasi:**

1. Menu harus ditampilkan berdasarkan tenant yang dikelola Vendor.
2. Status tersedia dan tidak tersedia harus memiliki pembeda visual.
3. Vendor harus dapat menemukan menu melalui pencarian.
4. Perubahan ketersediaan harus memberikan umpan balik.
5. Informasi yang ditampilkan harus sesuai dengan data MENU.

## 4.4 Form Tambah dan Edit Menu

<text weight="medium">Referensi: UIUX vendor.pdf — Edit Menu.</text>

Form pengelolaan menu digunakan untuk menambahkan atau memperbarui informasi menu.

Atribut yang digunakan mengikuti entitas MENU:

| Atribut | Keterangan |
|---|---|
| `nama_menu` | Nama makanan atau minuman. |
| `deskripsi` | Penjelasan mengenai menu. |
| `gambar` | Referensi gambar menu. |
| `harga` | Harga menu. |
| `estimasi_menit` | Estimasi waktu penyajian. |
| `id_kategori` | Kategori menu. |
| `status_tersedia` | Status ketersediaan menu. |
| `id_tenant` | Tenant pemilik menu. |

**Pedoman implementasi:**

1. Form harus memiliki label untuk setiap input.
2. Harga harus divalidasi sebagai nilai numerik yang valid.
3. Estimasi waktu harus menggunakan bilangan bulat yang valid.
4. Status ketersediaan harus mudah diubah.
5. Perubahan menu harus disimpan melalui backend.
6. Sistem harus menampilkan pesan berhasil atau gagal setelah penyimpanan.

Kewenangan Vendor dalam mengelola data kategori belum ditetapkan. Oleh sebab itu, pengelolaan kategori tidak diasumsikan sebagai fitur CRUD Vendor.

## 4.5 Halaman Pesanan Masuk

<text weight="medium">Referensi: UIUX vendor.pdf — Incoming Orders.</text>

Halaman pesanan masuk digunakan Vendor untuk melihat pesanan yang ditujukan kepada tenant.

Informasi yang ditampilkan:

- Nomor antrean.
- Informasi Customer.
- Jumlah item.
- Total harga.
- Status pesanan.
- Tindakan untuk memperbarui status pesanan.

**Pedoman implementasi:**

1. Vendor hanya dapat melihat pesanan tenant yang berada dalam kewenangannya.
2. Nomor antrean harus ditampilkan dengan jelas.
3. Status pesanan harus mudah dikenali.
4. Tindakan perubahan status harus melalui konfirmasi atau validasi sesuai kebutuhan.
5. Setiap perubahan status harus dicatat pada RIWAYAT_STATUS.

## 4.6 Halaman Detail Pesanan dan Pembayaran

<text weight="medium">Referensi: UIUX vendor.pdf — Payment dan Order Detail.</text>

Halaman detail digunakan Vendor untuk memeriksa informasi pesanan dan pembayaran yang berkaitan dengan tenant.

Informasi yang relevan:

- Nomor antrean.
- Daftar item pesanan.
- Jumlah item.
- Subtotal.
- Total pesanan.
- Metode pembayaran.
- Status verifikasi pembayaran.

**Pedoman implementasi:**

1. Informasi pembayaran harus sesuai dengan data PEMBAYARAN.
2. Vendor hanya dapat melihat pesanan yang menjadi kewenangannya.
3. Status verifikasi pembayaran harus ditampilkan secara jelas.
4. Tindakan verifikasi harus mengikuti mekanisme dan kewenangan yang ditetapkan pada tahap implementasi.
5. Sistem tidak boleh menganggap pembayaran simulasi sebagai transaksi sungguhan.

## 4.7 Halaman Penyelesaian Pesanan

<text weight="medium">Referensi: UIUX vendor.pdf — Preparing dan Pickup.</text>

Halaman ini mendukung Vendor dalam memproses pesanan hingga selesai.

Informasi yang ditampilkan:

- Nomor antrean.
- Ringkasan pesanan.
- Status pesanan.
- Informasi pengambilan di tenant.
- Tindakan memperbarui status pesanan.

**Pedoman implementasi:**

1. Vendor harus dapat membedakan pesanan yang sedang diproses dan yang siap diambil.
2. Nomor antrean digunakan untuk membantu identifikasi pesanan.
3. Status pesanan harus diperbarui melalui backend.
4. Penyelesaian pesanan harus tercatat pada RIWAYAT_STATUS.
5. Status selesai harus ditampilkan kepada Customer sesuai perubahan data pesanan.

## 4.8 Halaman Riwayat Pesanan Vendor

<text weight="medium">Referensi: UIUX vendor.pdf — Order History.</text>

Halaman riwayat digunakan Vendor untuk melihat pesanan yang pernah ditangani oleh tenant.

Informasi yang dapat ditampilkan:

- Ringkasan pesanan.
- Waktu pesanan.
- Total harga.
- Status pesanan.

Vendor hanya dapat mengakses riwayat pesanan yang berkaitan dengan tenant dalam kewenangannya.

---

# 5. Pedoman Komponen Antarmuka

## 5.1 Navigasi

- Navigasi harus memiliki penamaan yang konsisten.
- Halaman yang sedang aktif harus memiliki penanda visual.
- Navigasi harus memudahkan perpindahan antarhalaman.
- Menu navigasi harus menyesuaikan peran pengguna.

## 5.2 Tombol

Tombol harus memiliki label yang menjelaskan tindakan yang dilakukan.

Contoh tindakan:

- Login.
- Sign Up.
- Add to Cart.
- Continue to Payment.
- Save Changes.
- Mark Ready.
- Complete Pickup.

Tombol harus memberikan umpan balik ketika ditekan dan tidak boleh memicu tindakan berulang secara tidak sengaja selama proses masih berlangsung.

## 5.3 Form Input

- Setiap input harus memiliki label yang jelas.
- Format data harus sesuai dengan jenis informasi yang dimasukkan.
- Input wajib harus memiliki penanda.
- Kesalahan validasi harus ditampilkan dekat dengan input terkait atau melalui pesan yang mudah ditemukan.

## 5.4 Kartu Menu

Kartu menu harus menampilkan informasi utama secara ringkas, meliputi gambar, nama menu, tenant, estimasi waktu penyajian, dan harga.

Status ketersediaan harus terlihat tanpa membuat informasi utama sulit dibaca.

## 5.5 Status Pesanan

Status pesanan harus ditampilkan secara konsisten pada halaman Customer dan Vendor.

Nilai status yang digunakan harus mengikuti aturan status pesanan yang ditetapkan dalam implementasi backend. Contoh teks pada mockup tidak otomatis menjadi daftar status resmi.

## 5.6 Notifikasi dan Pesan Sistem

Sistem harus memberikan umpan balik terhadap tindakan penting, seperti:

- Berhasil login.
- Gagal login.
- Item berhasil ditambahkan.
- Pesanan berhasil dibuat.
- Pembayaran berhasil diverifikasi.
- Status pesanan berubah.
- Menu berhasil diperbarui.

Pesan harus singkat, jelas, dan menjelaskan tindakan yang perlu dilakukan apabila terjadi kesalahan.

---

# 6. Responsivitas dan Aksesibilitas

## 6.1 Responsivitas

Implementasi frontend harus mempertimbangkan ukuran layar yang berbeda agar sistem tetap dapat digunakan melalui perangkat desktop, tablet, maupun smartphone.

Ketentuan umum:

1. Tata letak harus menyesuaikan lebar layar.
2. Navigasi harus tetap mudah digunakan pada layar berukuran kecil.
3. Kartu menu harus menyesuaikan ruang yang tersedia.
4. Form tidak boleh terpotong pada layar kecil.
5. Informasi penting tidak boleh tersembunyi ketika tata letak berubah.

Ketentuan ini merupakan pedoman implementasi frontend. Detail breakpoint dan perilaku responsif harus disesuaikan dengan rancangan Figma dan hasil pengujian.

## 6.2 Aksesibilitas

Untuk mendukung kemudahan penggunaan:

1. Teks harus memiliki kontras yang memadai terhadap latar belakang.
2. Informasi tidak boleh disampaikan hanya melalui warna.
3. Setiap gambar yang memiliki fungsi informatif harus memiliki teks alternatif.
4. Form input harus memiliki label yang sesuai.
5. Elemen interaktif harus dapat dikenali dan digunakan dengan jelas.
6. Ukuran teks dan tombol harus tetap nyaman dibaca dan digunakan.

---

# 7. Konsistensi dengan Kebutuhan Sistem dan ERD

Implementasi UI/UX harus mengikuti ruang lingkup sistem dan struktur database yang telah ditetapkan.

Beberapa ketentuan penting:

| Elemen pada Desain | Ketentuan Implementasi |
|---|---|
| Nomor antrean | Menggunakan atribut `nomor_antrean` pada PESANAN. |
| Status pesanan | Menggunakan atribut `status_pesanan` pada PESANAN. |
| Riwayat status | Menggunakan entitas RIWAYAT_STATUS. |
| Status ketersediaan menu | Menggunakan atribut `status_tersedia` pada MENU. |
| Informasi tenant | Menggunakan entitas TENANT. |
| Keranjang | Menggunakan KERANJANG dan ITEM_KERANJANG. |
| Informasi pembayaran | Menggunakan entitas PEMBAYARAN. |
| Notifikasi | Menggunakan entitas NOTIFIKASI. |
| Total pembayaran | Mengacu pada data total pesanan dan pembayaran yang tersimpan. |

## 7.1 Elemen Desain yang Tidak Termasuk Ruang Lingkup Implementasi

Beberapa elemen pada mockup tidak didukung oleh ERD final atau tidak termasuk ruang lingkup fitur yang telah ditetapkan.

| Elemen pada Mockup | Ketentuan |
|---|---|
| Promo dan kode diskon | Tidak diimplementasikan karena tidak terdapat entitas PROMO maupun atribut pendukung pada ERD final. |
| Rating dan review | Tidak diimplementasikan karena tidak termasuk ruang lingkup dan tidak memiliki entitas pendukung. |
| Favorites | Tidak diimplementasikan karena tidak terdapat struktur data pendukung pada ERD final. |
| Rekomendasi menu | Tidak menjadi fitur sistem yang telah ditetapkan. |
| Pickup code terpisah | Tidak digunakan sebagai atribut atau kode baru. Identifikasi pengambilan menggunakan `nomor_antrean`. |
| Service fee | Tidak diterapkan sebagai komponen biaya tersendiri karena belum ditetapkan dalam kebutuhan dan ERD. |
| Integrasi pembayaran sungguhan | Tidak diterapkan. Pembayaran hanya berupa simulasi. |

Elemen-elemen tersebut dapat tetap terlihat pada file desain sebagai bagian dari rancangan visual, tetapi tidak boleh langsung diimplementasikan sebagai fitur aktif tanpa persetujuan perubahan ruang lingkup dan penyesuaian dokumentasi sistem.

---

# 8. Administrator Interface

Berdasarkan dokumen desain yang tersedia, belum terdapat rancangan visual khusus untuk Administrator.

Oleh karena itu, tampilan Administrator belum ditentukan dalam dokumen ini.

Fungsi administratif yang telah tercantum dalam kebutuhan sistem mencakup pengelolaan data pengguna dan tenant sesuai kewenangan Administrator.

Sebelum frontend Administrator dikembangkan, tim perlu melengkapi rancangan yang mencakup:

1. Halaman utama Administrator.
2. Halaman pengelolaan pengguna.
3. Halaman pengelolaan tenant.
4. Form tambah atau pembaruan data tenant.
5. Detail informasi pengguna dan tenant.

Rancangan tersebut harus tetap mengikuti atribut USER dan TENANT yang tersedia pada ERD final.

---

# 9. Pedoman Implementasi Frontend

Implementasi antarmuka menggunakan React dengan memperhatikan struktur frontend yang telah ditetapkan dalam dokumentasi arsitektur sistem.

Pembagian direktori yang berkaitan dengan implementasi UI:

| Direktori | Tanggung Jawab |
|---|---|
| `src/components/` | Komponen antarmuka yang dapat digunakan kembali. |
| `src/pages/customer/` | Halaman Customer. |
| `src/pages/vendor/` | Halaman Vendor. |
| `src/pages/administrator/` | Halaman Administrator setelah desain tersedia. |
| `src/layouts/` | Layout dan kerangka halaman. |
| `src/routes/` | Pengaturan navigasi dan rute halaman. |
| `src/services/` | Komunikasi dengan backend API. |
| `src/assets/` | Gambar, ikon, dan aset visual. |
| `src/styles/` | Pengaturan styling antarmuka. |

## 9.1 Komponen yang Dapat Digunakan Kembali

Komponen yang memiliki fungsi serupa sebaiknya dibuat sebagai komponen reusable, misalnya:

- Navbar.
- Sidebar atau navigasi Vendor.
- Menu Card.
- Search Bar.
- Status Badge.
- Form Input.
- Button.
- Modal atau Dialog.
- Notification Component.

## 9.2 Integrasi dengan Backend

Setiap halaman yang membutuhkan data dinamis harus mengambil informasi melalui API Laravel.

Contoh:

| Halaman | Data yang Dibutuhkan |
|---|---|
| Home Customer | Tenant, kategori, dan menu. |
| Menu Detail | Informasi menu dan tenant. |
| Cart | Keranjang dan item keranjang. |
| Payment | Informasi pembayaran. |
| Order Tracking | Pesanan dan riwayat status. |
| Customer History | Riwayat pesanan. |
| Vendor Dashboard | Ringkasan pesanan dan menu. |
| Vendor Menu | Data menu tenant. |
| Vendor Orders | Pesanan tenant. |

Frontend tidak boleh menjadi satu-satunya pihak yang menentukan kebenaran data transaksi, harga, status pembayaran, dan kewenangan pengguna. Seluruh data tersebut harus divalidasi oleh backend.

---

# 10. Evaluasi dan Pengujian UI/UX

Pengujian antarmuka dilakukan untuk memastikan implementasi sesuai dengan rancangan dan kebutuhan pengguna.

| ID | Aspek Pengujian | Kriteria |
|---|---|---|
| UI-01 | Konsistensi desain | Komponen dan navigasi mengikuti rancangan yang telah disepakati. |
| UI-02 | Navigasi Customer | Customer dapat berpindah antarhalaman utama. |
| UI-03 | Navigasi Vendor | Vendor dapat mengakses dashboard, menu, orders, dan history. |
| UI-04 | Katalog menu | Informasi menu ditampilkan sesuai data backend. |
| UI-05 | Keranjang | Item dapat ditambahkan, diperbarui, dan dihapus. |
| UI-06 | Pembayaran | Informasi pembayaran simulasi ditampilkan dengan benar. |
| UI-07 | Pelacakan pesanan | Status dan nomor antrean ditampilkan sesuai data. |
| UI-08 | Pengelolaan menu | Vendor dapat mengelola informasi menu sesuai kewenangannya. |
| UI-09 | Responsivitas | Tampilan menyesuaikan ukuran layar. |
| UI-10 | Umpan balik | Sistem memberikan pesan ketika tindakan berhasil atau gagal. |
| UI-11 | Aksesibilitas | Informasi dan elemen interaktif mudah dikenali serta digunakan. |
| UI-12 | Konsistensi data | Informasi pada antarmuka sesuai dengan data yang dikembalikan backend. |

Evaluasi dilakukan melalui pemeriksaan kesesuaian dengan desain Figma, pengujian fungsi antarmuka, dan pengujian penggunaan pada beberapa ukuran layar.

---

# 11. Penutup

UI/UX Guidelines ini menjadi pedoman implementasi antarmuka LetsOrder.com berdasarkan rancangan Customer dan Vendor yang telah disusun oleh tim UI/UX.

Dokumen ini membantu menjaga konsistensi antara rancangan visual, implementasi frontend, kebutuhan fungsional, dan struktur database.

Seluruh pengembangan antarmuka harus tetap mengikuti ruang lingkup sistem serta ERD final. Apabila terdapat elemen desain yang belum didukung oleh kebutuhan atau struktur database, implementasinya harus menunggu keputusan perubahan yang disepakati oleh tim.

Rancangan Administrator juga perlu dilengkapi agar seluruh peran pengguna memiliki pedoman antarmuka yang konsisten.