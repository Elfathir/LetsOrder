// Normalisasi data menu/tenant dari API ke bentuk yang dipakai UI.
export const CATEGORY_ID_MAP = {
  "Rice & Mains": 1,
  Snacks: 2,
  Drinks: 3,
};

export function isOrderChatEligible(ord) {
  if (!ord) return false;
  if (ord.is_paid) return true;
  if (ord.payment?.status_verifikasi === "Terverifikasi") return true;
  const raw = ord.status_pesanan || ord.raw_status || "";
  if (["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"].includes(raw)) return true;
  const uiStatus = ord.status || "";
  return ["Preparing", "Ready for pickup", "Ready", "Completed"].includes(uiStatus);
}

export function normalizeCategoryName(rawName) {
  const name = String(rawName || "").trim();
  if (!name || name === "Makanan") return "Rice & Mains";
  if (name === "Camilan") return "Snacks";
  if (name === "Minuman") return "Drinks";
  return name;
}

export function normalizeMenuRecord(m) {
  const revCount = Number(m.reviews_count ?? (Array.isArray(m.reviews) ? m.reviews.length : m.reviews) ?? 0);
  return {
    ...m,
    available: Boolean(m.status_tersedia ?? m.available ?? true),
    kategori_nama: normalizeCategoryName(m.kategori_nama || m.category?.nama_kategori),
    tenant_name: m.tenant_name || m.tenant?.nama_tenant || "Kantin",
    sold_today: Number(m.sold_today || 0),
    rating: revCount > 0 && m.rating ? String(m.rating) : null,
    reviews: revCount,
    reviews_count: revCount,
  };
}

export function isTenantOpenAt(tenant, nowDate = new Date()) {
  if (!tenant) return false;
  if (!tenant.auto_schedule) return Boolean(tenant.status_buka ?? true);
  if (tenant.status_buka === false) return false;
  const openStr = String(tenant.jam_buka || "07:00").slice(0, 5);
  const closeStr = String(tenant.jam_tutup || "21:00").slice(0, 5);
  const pad = (n) => String(n).padStart(2, "0");
  const cur = `${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`;
  return openStr <= closeStr ? cur >= openStr && cur < closeStr : cur >= openStr || cur < closeStr;
}
