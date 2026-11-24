// Format tanggal, jam, angka, dan inisial yang dipakai bersama oleh semua tampilan.
export function getLocalDateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatLiveClock(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatPercentDelta(todayVal, yesterdayVal) {
  if (yesterdayVal > 0) {
    const pct = Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  }
  return todayVal > 0 ? "+100%" : "0%";
}

export function formatRupiah(num) {
  return "Rp" + Number(num || 0).toLocaleString("id-ID");
}

export function getInitials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "LO";
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}
