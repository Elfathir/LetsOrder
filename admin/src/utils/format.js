export function formatRupiah(value) {
  const num = Number(value || 0);
  return `Rp${num.toLocaleString("id-ID")}`;
}

export function formatCompactRupiah(value) {
  const num = Number(value || 0);
  if (num >= 1_000_000) return `Rp${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (num >= 1_000) return `Rp${Math.round(num / 1_000)}rb`;
  return `Rp${num}`;
}

// Set from the language provider so dates and relative labels follow the active language.
let adminLocale = "id-ID";

export function setAdminLocale(nextLocale) {
  adminLocale = String(nextLocale || "id-ID");
}

export function getAdminLocale() {
  return adminLocale;
}

const isEnglish = () => adminLocale.toLowerCase().startsWith("en");

function parseStamp(value) {
  if (!value) return null;
  const parsed = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTime(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  return date.toLocaleString(adminLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  return date.toLocaleTimeString(adminLocale, { hour: "2-digit", minute: "2-digit" });
}

export function formatDayLabel(value) {
  const date = parseStamp(value);
  if (!date) return value;
  return date.toLocaleDateString(adminLocale, { day: "2-digit", month: "short" });
}

export function formatFullDate(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  return date.toLocaleDateString(adminLocale, { day: "2-digit", month: "long", year: "numeric" });
}

export function relativeAge(value) {
  const date = parseStamp(value);
  if (!date) return "—";
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  const en = isEnglish();
  if (diffMinutes < 1) return en ? "just now" : "baru saja";
  if (diffMinutes < 60) return en ? `${diffMinutes} min ago` : `${diffMinutes} menit lalu`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return en ? `${hours} h ago` : `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return en ? `${days} d ago` : `${days} hari lalu`;
}

export function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "AD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export const ORDER_STATUSES = [
  "Menunggu Pembayaran",
  "Sedang Diproses",
  "Siap Diambil",
  "Selesai",
  "Dibatalkan",
];

export const STATUS_LABEL = {
  "Menunggu Pembayaran": "Menunggu bayar",
  "Sedang Diproses": "Diproses",
  Diproses: "Diproses",
  "Siap Diambil": "Siap diambil",
  Selesai: "Selesai",
  Dibatalkan: "Dibatalkan",
};

export function statusTone(status) {
  switch (status) {
    case "Menunggu Pembayaran":
      return "pending";
    case "Sedang Diproses":
    case "Diproses":
      return "preparing";
    case "Siap Diambil":
      return "ready";
    case "Selesai":
      return "completed";
    case "Dibatalkan":
      return "cancelled";
    case "Terverifikasi":
      return "completed";
    case "Menunggu":
      return "pending";
    case "Gagal":
      return "cancelled";
    case "Kedaluwarsa":
      return "cancelled";
    default:
      return "neutral";
  }
}

export function verificationLabel(status) {
  return status || "—";
}
