import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setAdminLocale } from "./utils/format.js";

const STORAGE_KEY = "letsorder_admin_lang";

// English strings keyed by the Indonesian copy used in the source.
// Any string without an entry simply stays Indonesian, so nothing breaks.
export const EN = {
  // Shell
  "Admin Console": "Admin Console",
  "Navigasi admin": "Admin navigation",
  "Buka menu": "Open menu",
  "Dashboard": "Dashboard",
  "Ringkasan operasional": "Operational overview",
  "Pesanan": "Orders",
  "Pesanan semua tenant": "All tenant orders",
  "Semua pesanan tenant": "All tenant orders",
  "Pembayaran": "Payments",
  "Verifikasi & rekonsiliasi": "Verification & reconciliation",
  "Tenant": "Tenants",
  "Kelola kantin & jam buka": "Manage canteens & opening hours",
  "Pengguna": "Users",
  "Akun customer & vendor": "Customer & vendor accounts",
  "Banner": "Banners",
  "Slide beranda customer": "Customer home slides",
  "Kupon": "Coupons",
  "Kode promo & voucher": "Promo codes & vouchers",
  "Profil saya": "My profile",
  "Akun administrator": "Administrator account",
  "Sesi Administrator": "Administrator session",
  "Keluar": "Sign out",
  "Keluar…": "Signing out…",
  "Memeriksa sesi admin…": "Checking admin session…",
  "Bahasa": "Language",
  "Ganti bahasa": "Change language",

  // Login
  "Sistem pemesanan kantin kampus": "Campus canteen ordering system",
  "Username atau Email": "Username or email",
  "Kata Sandi": "Password",
  "Masukkan kata sandi": "Enter your password",
  "Sembunyikan kata sandi": "Hide password",
  "Tampilkan kata sandi": "Show password",
  "Username/email dan kata sandi wajib diisi.": "Username/email and password are required.",
  "Respons login tidak lengkap. Periksa kembali konfigurasi backend.":
    "Incomplete login response. Check the backend configuration.",
  "Akun ini terdaftar sebagai Vendor. Gunakan portal tenant untuk akun tersebut.":
    "This account is registered as a Vendor. Use the tenant portal for it.",
  "Akun ini bukan Administrator. Hanya akun Administrator yang dapat membuka Panel Admin.":
    "This account is not an Administrator. Only Administrator accounts can open the Admin Panel.",
  "Tidak dapat terhubung ke server API. Pastikan backend berjalan di http://127.0.0.1:8000.":
    "Cannot reach the API server. Make sure the backend runs on http://127.0.0.1:8000.",
  "Login gagal. Silakan coba lagi.": "Login failed. Please try again.",
  "Memeriksa akun…": "Checking account…",
  "Masuk ke Panel Admin": "Sign in to Admin Panel",
  "Akses ini khusus Administrator. Akun Customer dan Vendor tetap menggunakan aplikasi utama.":
    "Access is for Administrators only. Customer and Vendor accounts keep using the main app.",

  // Dashboard
  "Ringkasan": "Overview",
  "Halo, {name}": "Hello, {name}",
  "Pantau pesanan, pembayaran, dan tenant kantin dari satu tempat.":
    "Track orders, payments, and canteen tenants in one place.",
  "{n} hari": "{n} days",
  "Pesanan hari ini": "Orders today",
  "Total {n} pesanan": "Total {n} orders",
  "Omzet hari ini": "Revenue today",
  "Total {amount}": "Total {amount}",
  "Menunggu pembayaran": "Awaiting payment",
  "{n} lewat 15 menit": "{n} over 15 minutes",
  "Tenant buka": "Open tenants",
  "{n} sedang tutup": "{n} currently closed",
  "Omzet {n} hari terakhir": "Revenue · last {n} days",
  "tiap {n} hari": "every {n} days",
  "tiap hari": "daily",
  "Memuat…": "Loading…",
  "Memuat data {n} hari…": "Loading {n} days of data…",
  "Belum ada data pada rentang ini.": "No data in this range yet.",
  "Grafik omzet mingguan": "Weekly revenue chart",
  "Grafik omzet harian": "Daily revenue chart",
  "{period} · {amount} · {n} pesanan": "{period} · {amount} · {n} orders",
  "{a} – {b} ({n} hari)": "{a} – {b} ({n} days)",
  "Perlu perhatian": "Needs attention",
  "Pesanan belum dibayar > 15 menit": "Unpaid orders older than 15 minutes",
  "Pembayaran kedaluwarsa": "Expired payments",
  "Tenant sedang tutup": "Tenants closed",
  "Tenant tanpa menu": "Tenants without menus",
  "Lihat pesanan": "View orders",
  "Pesanan terbaru": "Recent orders",
  "Semua": "All",
  "Belum ada pesanan masuk.": "No orders yet.",
  "Tenant terlaris": "Top tenants",
  "{n} tenant": "{n} tenants",
  "Belum ada penjualan pada rentang ini.": "No sales in this range yet.",
  "{n} pesanan": "{n} orders",
  "Menu terlaris": "Top menus",
  "{n} menu": "{n} menus",
  "Belum ada menu terjual pada rentang ini.": "No menu items sold in this range yet.",
  "{n} terjual": "{n} sold",
  "{n} pengguna": "{n} users",
  "Diperbarui": "Updated",
  "Gagal memuat statistik.": "Failed to load statistics.",

  // Profile
  "Profil administrator": "Administrator profile",
  "Kelola data akun yang Anda pakai untuk masuk ke panel admin.":
    "Manage the account details you use to sign in to the admin panel.",
  "Nama lengkap": "Full name",
  "Username": "Username",
  "Email": "Email",
  "Nomor telepon": "Phone number",
  "Peran": "Role",
  "ID akun": "Account ID",
  "Bergabung": "Joined",
  "Belum diisi": "Not set",
  "Simpan profil": "Save profile",
  "Menyimpan…": "Saving…",
  "Profil diperbarui.": "Profile updated.",
  "Gagal menyimpan profil.": "Failed to save profile.",
  "Perbarui profil": "Update profile",
  "Ganti foto": "Change photo",
  "Hapus foto": "Remove photo",
  "PNG, JPEG, WEBP, atau GIF. Foto dikecilkan otomatis sebelum disimpan.":
    "PNG, JPEG, WEBP, or GIF. The photo is resized automatically before saving.",
  "Ukuran foto maksimal 5 MB.": "The photo must be 5 MB or smaller.",
  "File foto harus berupa gambar PNG, JPEG, WEBP, atau GIF.":
    "The file must be a PNG, JPEG, WEBP, or GIF image.",
  "Ubah kata sandi": "Change password",
  "Kata sandi saat ini": "Current password",
  "Kata sandi baru": "New password",
  "Ulangi kata sandi baru": "Repeat new password",
  "Simpan kata sandi": "Save password",
  "Kata sandi saat ini wajib diisi.": "Current password is required.",
  "Kata sandi baru minimal 6 karakter.": "New password must be at least 6 characters.",
  "Konfirmasi kata sandi tidak sama.": "The password confirmation does not match.",
  "Kata sandi diperbarui. Sesi lain otomatis keluar.":
    "Password updated. Other sessions were signed out automatically.",
  "Gagal mengubah kata sandi.": "Failed to change the password.",
  "Minimal 6 karakter. Semua sesi lain pada akun ini akan keluar otomatis.":
    "At least 6 characters. All other sessions on this account will be signed out.",
  "Ubah email memerlukan nomor telepon minimal 8 digit.":
    "Changing your email requires a phone number with at least 8 digits.",
  "Keamanan akun": "Account security",
  "Sesi ini memakai akun Administrator dengan akses penuh ke seluruh data tenant, pengguna, dan transaksi.":
    "This session uses an Administrator account with full access to all tenant, user, and transaction data.",
  "Data akun": "Account details",
  "Informasi akun": "Account information",

  // Common
  "Muat ulang": "Refresh",
  "Batal": "Cancel",
  "Simpan": "Save",
  "Simpan perubahan": "Save changes",
  "Edit": "Edit",
  "Detail": "Detail",
  "Reset": "Reset",
  "Sebelumnya": "Previous",
  "Berikutnya": "Next",
  "Tutup": "Close",
  "Hapus": "Delete",
  "Semua status": "All statuses",
  "Semua tenant": "All tenants",
  "Semua peran": "All roles",
  "Tanggal mulai": "Start date",
  "Tanggal akhir": "End date",
  "Tidak ada": "None",
  "Tanpa booth": "No booth",
  "Buka": "Open",
  "Tertutup": "Closed",
  "Aktif": "Active",
  "Nonaktif": "Inactive",
  "Aktifkan": "Activate",
  "Menghapus…": "Deleting…",
  "Memproses…": "Processing…",
  "Membatalkan…": "Cancelling…",
  "halaman {a}/{b}": "page {a}/{b}",

  // Status
  "Menunggu Pembayaran": "Awaiting payment",
  "Sedang Diproses": "In progress",
  "Diproses": "Processing",
  "Siap Diambil": "Ready for pickup",
  "Selesai": "Completed",
  "Dibatalkan": "Cancelled",
  "Menunggu bayar": "Awaiting payment",
  "Siap diambil": "Ready for pickup",
  "Menunggu": "Pending",
  "Terverifikasi": "Verified",
  "Gagal": "Failed",
  "Kedaluwarsa": "Expired",
  "Lunas": "Paid",
  "Belum bayar": "Unpaid",

  // Orders
  "Operasional": "Operations",
  "Pantau alur pesanan self-pickup, ubah status, atau batalkan pesanan bermasalah.":
    "Track the self-pickup order flow, change statuses, or cancel problematic orders.",
  "Cari nomor antrean, tenant, atau customer": "Search queue number, tenant, or customer",
  "Filter status": "Filter status",
  "Filter tenant": "Filter tenant",
  "Antrean": "Queue",
  "Waktu": "Time",
  "Customer": "Customer",
  "Total": "Total",
  "Status": "Status",
  "Bayar": "Payment",
  "Memuat pesanan…": "Loading orders…",
  "Tidak ada pesanan yang cocok dengan filter.": "No orders match the filters.",
  "{n} pesanan · halaman {a}/{b}": "{n} orders · page {a}/{b}",
  "Detail pesanan": "Order detail",
  "Pesanan #{n}": "Order #{n}",
  "Memuat detail…": "Loading detail…",
  "Detail tidak tersedia.": "Detail unavailable.",
  "Waktu pesan": "Ordered at",
  "Promo": "Promo",
  "Item pesanan": "Order items",
  "Catatan: {text}": "Note: {text}",
  "Batas {time}": "Due {time}",
  "Dibayar {time}": "Paid {time}",
  "Verifikasi": "Verify",
  "Pembayaran belum dibuat untuk pesanan ini.": "No payment has been created for this order.",
  "Riwayat status": "Status history",
  "Ubah status": "Change status",
  "Batalkan pesanan": "Cancel order",
  "Alasan pembatalan (opsional)": "Cancellation reason (optional)",
  "Batalkan": "Cancel order",
  "Status diubah menjadi \"{status}\".": "Status changed to \"{status}\".",
  "Pesanan dibatalkan.": "Order cancelled.",
  "Pembayaran ditandai terverifikasi.": "Payment marked as verified.",
  "Gagal memuat pesanan.": "Failed to load orders.",
  "Gagal memuat detail pesanan.": "Failed to load order detail.",
  "Gagal mengubah status pesanan.": "Failed to change the order status.",
  "Gagal membatalkan pesanan.": "Failed to cancel the order.",
  "Gagal memverifikasi pembayaran.": "Failed to verify the payment.",
  "Satu pesanan selalu milik satu tenant. Perubahan status memicu notifikasi ke customer.":
    "Every order belongs to a single tenant. Status changes notify the customer.",

  // Payments
  "Rekonsiliasi": "Reconciliation",
  "Verifikasi pembayaran QRIS, pantau pembayaran kedaluwarsa, dan cocokkan total.":
    "Verify QRIS payments, watch for expired payments, and reconcile totals.",
  "Cari kode QRIS, antrean, atau tenant": "Search QRIS code, queue, or tenant",
  "Filter status verifikasi": "Filter verification status",
  "Kode": "Code",
  "Metode": "Method",
  "Batas waktu": "Due time",
  "Aksi": "Action",
  "Memuat pembayaran…": "Loading payments…",
  "Belum ada pembayaran yang cocok dengan filter.": "No payments match the filters.",
  "{n} pembayaran · halaman {a}/{b}": "{n} payments · page {a}/{b}",
  "Gagal memuat pembayaran.": "Failed to load payments.",
  "Gagal memproses pembayaran.": "Failed to process the payment.",
  "Pembayaran pesanan #{n} ditandai lunas.": "Payment for order #{n} marked as paid.",
  "Pembayaran pesanan #{n} ditandai {status}.": "Payment for order #{n} marked as {status}.",
  "Pembayaran berstatus Menunggu otomatis kedaluwarsa 15 menit setelah dibuat.":
    "Payments with Pending status expire automatically 15 minutes after creation.",

  // Tenants
  "Data induk": "Master data",
  "Tenant kantin": "Canteen tenants",
  "Kelola profil tenant, jam operasional, dan buka/tutup kantin.":
    "Manage tenant profiles, opening hours, and open/close the canteen.",
  "Cari nama tenant, booth, atau pemilik": "Search tenant name, booth, or owner",
  "Filter status buka": "Filter open status",
  "Pemilik": "Owner",
  "Jam operasional": "Opening hours",
  "Menu": "Menus",
  "Vendor": "Vendor",
  "Administrator": "Administrator",
  "Rentang hari": "Day range",
  "Banner \"{title}\" {state}.": "Banner \"{title}\" {state}.",
  "Memuat tenant…": "Loading tenants…",
  "Belum ada tenant terdaftar.": "No tenants registered yet.",
  " · otomatis": " · automatic",
  " · manual": " · manual",
  "{n} tenant · halaman {a}/{b}": "{n} tenants · page {a}/{b}",
  "Tutup tenant": "Close tenant",
  "Edit tenant": "Edit tenant",
  "Nama tenant": "Tenant name",
  "Nomor booth": "Booth number",
  "Jam buka": "Opens at",
  "Jam tutup": "Closes at",
  "Deskripsi": "Description",
  "Tenant sedang buka": "Tenant is open",
  "Ikuti jam operasional otomatis": "Follow opening hours automatically",
  "Gagal memuat tenant.": "Failed to load tenants.",
  "Gagal menyimpan tenant.": "Failed to save the tenant.",
  "Gagal mengubah status tenant.": "Failed to change the tenant status.",
  "Nama tenant minimal 2 karakter.": "Tenant name must be at least 2 characters.",
  "Tenant \"{name}\" diperbarui.": "Tenant \"{name}\" updated.",
  "Tenant \"{name}\" sekarang {state}.": "Tenant \"{name}\" is now {state}.",
  "dibuka": "open",
  "ditutup": "closed",
  "Menutup tenant langsung menghentikan penerimaan pesanan baru dari customer.":
    "Closing a tenant immediately stops accepting new customer orders.",

  // Users
  "Kelola akun Customer, Vendor, dan Administrator beserta perannya.":
    "Manage Customer, Vendor, and Administrator accounts and their roles.",
  "Cari nama, username, atau email": "Search name, username, or email",
  "Filter peran": "Filter role",
  "Memuat pengguna…": "Loading users…",
  "Tidak ada pengguna yang cocok dengan filter.": "No users match the filters.",
  "{n} pengguna · halaman {a}/{b}": "{n} users · page {a}/{b}",
  "Nama minimal 2 karakter.": "Name must be at least 2 characters.",
  "Format email tidak valid.": "Invalid email format.",
  "Password baru minimal 8 karakter.": "New password must be at least 8 characters.",
  "Data {name} diperbarui.": "Data for {name} updated.",
  "Gagal memuat pengguna.": "Failed to load users.",
  "Gagal menyimpan pengguna.": "Failed to save the user.",
  "Password baru (opsional)": "New password (optional)",
  "Biarkan kosong jika tidak diubah": "Leave blank to keep the current password",
  "Edit pengguna": "Edit user",
  "Akun baru tetap mendaftar sendiri lewat aplikasi utama; admin hanya mengelola data yang ada.":
    "New accounts still sign up through the main app; admins only manage existing data.",

  // Banners
  "Halaman utama": "Home page",
  "Banner promo": "Promo banners",
  "Atur slide banner yang tampil di beranda customer: judul, deskripsi, gambar, dan tombol ajakan.":
    "Manage the banner slides shown on the customer home: title, description, image, and call-to-action buttons.",
  "Tambah banner": "Add banner",
  "Memuat banner…": "Loading banners…",
  "Belum ada banner di database. Tambahkan satu untuk menampilkannya di beranda customer.":
    "No banners in the database yet. Add one to show it on the customer home.",
  "Tampil": "Visible",
  "Sembunyikan": "Hide",
  "Tampilkan": "Show",
  "Edit banner": "Edit banner",
  "Urutan #{n}": "Position #{n}",
  "Banner tampil paling atas di beranda customer.": "The banner appears at the top of the customer home.",
  "Pratinjau gambar": "Image preview",
  "Masukkan URL gambar untuk melihat pratinjau": "Enter an image URL to see the preview",
  "URL gambar": "Image URL",
  "Label kecil (opsional)": "Small label (optional)",
  "Urutan tampil": "Display order",
  "Judul banner": "Banner title",
  "Tombol utama": "Primary button",
  "Tombol kedua": "Secondary button",
  "Tampilkan banner ini di beranda customer": "Show this banner on the customer home",
  "Banner diperbarui.": "Banner updated.",
  "Banner ditambahkan dan tampil di halaman utama customer.": "Banner added and shown on the customer home.",
  "Banner dihapus.": "Banner deleted.",
  "Gagal memuat banner.": "Failed to load banners.",
  "Gagal menyimpan banner.": "Failed to save the banner.",
  "Gagal mengubah status banner.": "Failed to change the banner status.",
  "Gagal menghapus banner.": "Failed to delete the banner.",
  "Judul banner minimal 2 karakter.": "Banner title must be at least 2 characters.",
  "URL gambar harus diawali http(s):// atau /.": "The image URL must start with http(s):// or /.",
  "Hapus banner?": "Delete banner?",
  "Hapus banner": "Delete banner",
  "Banner yang dihapus langsung hilang dari beranda customer. Slide lain tetap tampil.":
    "A deleted banner disappears from the customer home immediately. Other slides stay.",
  "Banner aktif tampil bergantian otomatis di beranda customer setiap 5 detik.":
    "Active banners rotate automatically on the customer home every 5 seconds.",
  "Terjemahan bahasa Inggris": "English translation",
  "Dipakai otomatis saat pengunjung memilih bahasa EN. Kosongkan untuk memakai teks Indonesia.":
    "Used automatically when visitors pick EN. Leave blank to fall back to the Indonesian text.",
  "Label kecil (English)": "Small label (English)",
  "Judul banner (English)": "Banner title (English)",
  "Deskripsi (English)": "Description (English)",
  "Tombol utama (English)": "Primary button (English)",
  "Tombol kedua (English)": "Secondary button (English)",

  // Coupons
  "Promosi": "Promotions",
  "Kupon & promo": "Coupons & promos",
  "Buat kode kupon untuk semua tenant atau tenant tertentu, atur nominal potongan, minimal belanja, dan jatah pemakaian per akun.":
    "Create coupon codes for all tenants or one tenant, set the discount, minimum spend, and per-account usage limit.",
  "Buat kupon": "Create coupon",
  "Cari kode, judul, atau tenant": "Search code, title, or tenant",
  "Filter status kupon": "Filter coupon status",
  "Berlaku untuk": "Applies to",
  "Diskon": "Discount",
  "Min. belanja": "Min. spend",
  "Kuota / dipakai": "Quota / used",
  "Memuat kupon…": "Loading coupons…",
  "Belum ada kupon. Klik “Buat kupon” untuk menambahkan.":
    "No coupons yet. Click “Create coupon” to add one.",
  "{n} kupon · halaman {a}/{b}": "{n} coupons · page {a}/{b}",
  "Kupon aktif dan bisa diklaim customer": "Coupon is active and can be claimed by customers",
  "Kode kupon": "Coupon code",
  "Judul kupon": "Coupon title",
  "Tipe diskon": "Discount type",
  "Nominal (Rp)": "Fixed amount (Rp)",
  "Persentase (%)": "Percentage (%)",
  "Persentase diskon": "Discount percentage",
  "Potongan (Rp)": "Discount (Rp)",
  "Minimal belanja (Rp)": "Minimum spend (Rp)",
  "Jatah voucher per akun": "Voucher quota per account",
  "Contoh: KANTIN10": "e.g. KANTIN10",
  "Contoh: Diskon spesial jam makan siang": "e.g. Special lunch-hour discount",
  "Hapus kupon?": "Delete coupon?",
  "Hapus kupon": "Delete coupon",
  "Buat kupon baru": "Create new coupon",
  "Kupon bisa dipakai customer selama masih aktif.": "Customers can use the coupon while it stays active.",
  "Kupon yang dihapus tidak bisa diklaim lagi oleh customer. Pemakaian sebelumnya tetap tercatat di riwayat pesanan.":
    "A deleted coupon can no longer be claimed. Previous redemptions stay in the order history.",
  "Kupon langsung muncul di halaman promo customer dan bisa dipakai saat checkout.":
    "Coupons appear on the customer promo page and can be used at checkout.",
  "Kode kupon minimal 3 karakter (huruf/angka).": "Coupon code must be at least 3 characters (letters/numbers).",
  "Judul kupon minimal 3 karakter.": "Coupon title must be at least 3 characters.",
  "Nominal diskon wajib lebih dari 0.": "The discount amount must be greater than 0.",
  "Diskon persentase maksimal 90%.": "Percentage discounts are capped at 90%.",
  "Gagal memuat kupon.": "Failed to load coupons.",
  "Gagal menyimpan kupon.": "Failed to save the coupon.",
  "Gagal mengubah status kupon.": "Failed to change the coupon status.",
  "Gagal menghapus kupon.": "Failed to delete the coupon.",
  "Kupon \"{code}\" diperbarui.": "Coupon \"{code}\" updated.",
  "Kupon \"{code}\" dibuat dan langsung bisa dipakai customer.": "Coupon \"{code}\" created and ready to use.",
  "Kupon \"{code}\" {state}.": "Coupon \"{code}\" {state}.",
  "diaktifkan": "activated",
  "dinonaktifkan": "deactivated",
  "{n} kali dipakai": "{n} times used",
  " · semua tenant": " · all tenants",
  "{n} dipakai": "{n} used",
};

const interpolate = (template, vars) => {
  if (!vars) return template;
  return String(template).replace(/\{(\w+)\}/g, (full, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : full
  );
};

const LangContext = createContext({
  lang: "ID",
  setLang: () => {},
  toggleLang: () => {},
  t: (text) => text,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "EN" ? "EN" : "ID";
    } catch {
      return "ID";
    }
  });

  useEffect(() => {
    setAdminLocale(lang === "EN" ? "en-GB" : "id-ID");
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage restrictions
    }
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next === "EN" ? "EN" : "ID");
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => (prev === "EN" ? "ID" : "EN"));
  }, []);

  const t = useCallback(
    (text, vars) => {
      const source = String(text ?? "");
      if (lang !== "EN") return interpolate(source, vars);
      const translated = Object.prototype.hasOwnProperty.call(EN, source) ? EN[source] : source;
      return interpolate(translated, vars);
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
