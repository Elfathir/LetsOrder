// Satu sumber kebenaran untuk status pesanan.
//
// Backend mengirim status berbahasa Indonesia pada `status_pesanan` (dan
// `raw_status`), sedangkan UI memakai kunci berbahasa Inggris pada `status`.
// Sebelum modul ini ada, pemetaan tersebut ditulis ulang di 3 tempat dengan
// daftar yang sedikit berbeda-beda. Semua helper di sini menjaga perilaku lama.

// Nilai mentah dari backend.
export const RAW_STATUS = {
  AWAITING_PAYMENT: "Menunggu Pembayaran",
  PREPARING: "Sedang Diproses",
  // "Diproses" adalah varian lama yang masih dikirim backend.
  PREPARING_ALT: "Diproses",
  READY: "Siap Diambil",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

// Kunci status yang dipakai di state/JSX.
export const UI_STATUS = {
  AWAITING_PAYMENT: "Awaiting payment",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  // Varian lama yang masih muncul pada data yang sudah tersimpan.
  READY_ALT: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Status yang berarti pesanan sudah dibayar.
const PAID_RAW_STATUSES = [
  RAW_STATUS.PREPARING,
  RAW_STATUS.PREPARING_ALT,
  RAW_STATUS.READY,
  RAW_STATUS.COMPLETED,
];

// Semua status yang masih berjalan (belum selesai/dibatalkan).
const ACTIVE_RAW_STATUSES = [RAW_STATUS.AWAITING_PAYMENT, ...PAID_RAW_STATUSES];

const IN_PROGRESS_UI_STATUSES = [
  UI_STATUS.AWAITING_PAYMENT,
  UI_STATUS.PREPARING,
  UI_STATUS.READY,
  UI_STATUS.READY_ALT,
];

const READY_UI_STATUSES = [UI_STATUS.READY, UI_STATUS.READY_ALT];

const RAW_TO_UI = {
  [RAW_STATUS.AWAITING_PAYMENT]: UI_STATUS.AWAITING_PAYMENT,
  [RAW_STATUS.PREPARING]: UI_STATUS.PREPARING,
  [RAW_STATUS.PREPARING_ALT]: UI_STATUS.PREPARING,
  [RAW_STATUS.READY]: UI_STATUS.READY,
  [RAW_STATUS.COMPLETED]: UI_STATUS.COMPLETED,
  [RAW_STATUS.CANCELLED]: UI_STATUS.CANCELLED,
};

const UI_LABELS = {
  EN: {
    [UI_STATUS.AWAITING_PAYMENT]: "Awaiting payment",
    [UI_STATUS.PREPARING]: "Preparing",
    [UI_STATUS.READY]: "Ready for pickup",
    [UI_STATUS.READY_ALT]: "Ready for pickup",
    [UI_STATUS.COMPLETED]: "Completed",
    [UI_STATUS.CANCELLED]: "Cancelled",
  },
  ID: {
    [UI_STATUS.AWAITING_PAYMENT]: "Menunggu bayar",
    [UI_STATUS.PREPARING]: "Diproses",
    [UI_STATUS.READY]: "Siap diambil",
    [UI_STATUS.READY_ALT]: "Siap diambil",
    [UI_STATUS.COMPLETED]: "Selesai",
    [UI_STATUS.CANCELLED]: "Dibatalkan",
  },
};

// Status pesanan -> kunci UI. Status mentah yang tidak dikenal dianggap
// "Preparing", sama seperti perilaku sebelumnya.
export function toUiStatus(rawStatus) {
  return RAW_TO_UI[rawStatus] || UI_STATUS.PREPARING;
}

// Apakah pesanan sudah dibayar (dasar untuk `is_paid` dan fitur chat).
export function isPaidStatus(rawStatus) {
  return PAID_RAW_STATUSES.includes(rawStatus);
}

// Apakah pesanan masih aktif (belum selesai/dibatalkan).
export function isActiveStatus(rawStatus) {
  return ACTIVE_RAW_STATUSES.includes(rawStatus);
}

export function isInProgressStatus(uiStatus) {
  return IN_PROGRESS_UI_STATUSES.includes(uiStatus);
}

export function isReadyStatus(uiStatus) {
  return READY_UI_STATUSES.includes(uiStatus);
}

export function isCompletedStatus(uiStatus) {
  return uiStatus === UI_STATUS.COMPLETED;
}

export function isCancelledStatus(uiStatus) {
  return uiStatus === UI_STATUS.CANCELLED;
}

// Pesanan dianggap dibatalkan bila salah satu representasinya menyatakan demikian.
export function isCancelledOrder(order) {
  if (!order) return false;
  return (
    order.status_pesanan === RAW_STATUS.CANCELLED ||
    order.status === UI_STATUS.CANCELLED
  );
}

// Label status sesuai bahasa aktif.
export function statusLabel(uiStatus, lang = "ID") {
  const table = UI_LABELS[lang] || UI_LABELS.ID;
  return table[uiStatus] || uiStatus || "";
}

// Filter daftar riwayat: "All" | "In progress" | "Completed" | "Cancelled".
export const HISTORY_FILTER_KEYS = {
  ALL: "All",
  IN_PROGRESS: "In progress",
  COMPLETED: UI_STATUS.COMPLETED,
  CANCELLED: UI_STATUS.CANCELLED,
};

export function matchesHistoryFilter(uiStatus, rawStatus, filter) {
  if (!filter || filter === HISTORY_FILTER_KEYS.ALL) return true;
  if (filter === HISTORY_FILTER_KEYS.IN_PROGRESS) {
    return isInProgressStatus(uiStatus) || isActiveStatus(rawStatus);
  }
  return uiStatus === filter;
}
