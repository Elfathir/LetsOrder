// Dipindah verbatim dari backend/server.mjs (src/lib/promo.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { SERVER_PROMOS } from "../config.mjs";
import { db } from "./db.mjs";
function calculateServerPromoDiscount(promoCode, subtotal, tenantId = null) {
  const code = String(promoCode || "").trim().toUpperCase();
  if (!code) return 0;

  if (Array.isArray(db?.promos)) {
    const customPromo = db.promos.find(
      (p) =>
        String(p.kode_promo || "").trim().toUpperCase() === code &&
        Boolean(p.aktif) &&
        (!p.id_tenant || Number(p.id_tenant) === Number(tenantId))
    );
    if (customPromo) {
      const minSpend = Math.max(0, Number(customPromo.minimal_belanja || 0));
      if (subtotal < minSpend) return 0;
      const val = Math.max(0, Number(customPromo.diskon || 0));
      if (customPromo.tipe === "percentage") {
        const pct = val > 1 ? Math.min(100, val) / 100 : val;
        return Math.min(subtotal, Math.round(subtotal * pct));
      }
      return Math.min(subtotal, val);
    }
  }

  const promo = SERVER_PROMOS[code];
  if (!promo || subtotal < promo.minSpend) return 0;
  if (promo.type === "percentage") {
    return Math.min(subtotal, Math.round(subtotal * promo.discount));
  }
  return Math.min(subtotal, promo.discount);
}

export { calculateServerPromoDiscount };