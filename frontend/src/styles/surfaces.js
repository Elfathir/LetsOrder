// Kumpulan "resep" gaya yang dipakai berulang di LetsOrderApp.
//
// Nilainya identik dengan literal yang sebelumnya disalin manual di banyak
// tempat, jadi memakai spread dari sini tidak mengubah tampilan sama sekali.
// Urutan properti dipertahankan agar perilaku override tetap sama.

/** Kartu dasar: permukaan putih, sudut besar, garis tipis. */
export const SURFACE_CARD = {
  backgroundColor: "var(--bg-card)",
  borderRadius: "var(--radius-xl)",
  border: "1px solid var(--border-light)",
};

/** Tombol/chip berbentuk pil dengan garis input dan latar kartu. */
export const BUTTON_PILL_OUTLINE = {
  borderRadius: "var(--radius-pill)",
  border: "1px solid var(--border-input)",
  backgroundColor: "var(--bg-card)",
};

/** Tombol aksi utama: pil oranye tanpa garis. */
export const BUTTON_PILL_PRIMARY = {
  borderRadius: "var(--radius-pill)",
  border: "none",
  backgroundColor: "var(--orange)",
};

/** Chip/pil krem untuk label ringan (tenant, kategori, dsb.). */
export const CHIP_CREAM = {
  borderRadius: "var(--radius-pill)",
  backgroundColor: "var(--bg-cream)",
};

/** Judul halaman utama. */
export const PAGE_TITLE = {
  fontSize: 32,
  fontWeight: 900,
  color: "var(--maroon)",
};
