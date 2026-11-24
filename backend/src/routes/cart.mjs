// Route Cart — dipindah verbatim dari backend/server.mjs (baris 2157-2287).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { parseBody, sendJson } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { createEnrichContext, enrichMenu, isTenantOpenNow } from "../lib/enrich.mjs";
import { requireAuth, requireRole } from "../lib/auth.mjs";
export async function handleCartRoutes({ req, res, pathname, method, urlObj }) {
  if (pathname === "/cart" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const rawItems = db.carts[user.id_user] || [];
    const ctx = createEnrichContext(compactMedia);
    const items = rawItems
      .map((ci) => {
        const m = ctx.menuById.get(Number(ci.id_menu));
        if (!m) return null;
        const enriched = enrichMenu(m, ctx);
        return {
          id_item_keranjang: ci.id_item_keranjang,
          id_menu: m.id_menu,
          id_tenant: m.id_tenant,
          nama_menu: m.nama_menu,
          tenant_name: enriched.tenant_name,
          harga: m.harga,
          jumlah: ci.jumlah,
          subtotal: m.harga * ci.jumlah,
          gambar: enriched.gambar,
        };
      })
      .filter(Boolean);
    return sendJson(req, res, 200, {
      success: true,
      message: "Keranjang berhasil diambil.",
      data: { items },
    });
  }

  if (pathname === "/cart" && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    db.carts[user.id_user] = [];
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Keranjang berhasil dikosongkan.",
      data: null,
    });
  }

  if (pathname === "/cart/items" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const body = await parseBody(req);
    const idMenu = Number(body.id_menu);
    const jumlah = Math.max(1, Math.min(100, Number(body.jumlah || 1)));

    const menu = db.menus.find((m) => m.id_menu === idMenu);
    if (!menu) {
      return sendJson(req, res, 404, { success: false, message: "Menu tidak ditemukan." });
    }
    if (!menu.status_tersedia) {
      return sendJson(req, res, 422, { success: false, message: "Menu sedang tidak tersedia." });
    }
    const menuTenant = db.tenants.find((t) => t.id_tenant === menu.id_tenant);
    if (menuTenant && !isTenantOpenNow(menuTenant)) {
      return sendJson(req, res, 422, { success: false, message: "Tenant sedang tutup." });
    }

    if (!db.carts[user.id_user]) db.carts[user.id_user] = [];
    const existingCartTenantIds = new Set(
      db.carts[user.id_user]
        .map((ci) => db.menus.find((m) => m.id_menu === ci.id_menu)?.id_tenant)
        .filter(Boolean)
    );
    if (existingCartTenantIds.size > 0 && !existingCartTenantIds.has(menu.id_tenant)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Keranjang hanya boleh berisi menu dari satu tenant yang sama.",
      });
    }

    const existing = db.carts[user.id_user].find((i) => i.id_menu === idMenu);
    if (existing) {
      existing.jumlah = Math.min(100, existing.jumlah + jumlah);
    } else {
      const nextId =
        Math.max(0, ...db.carts[user.id_user].map((i) => i.id_item_keranjang)) + 1;
      db.carts[user.id_user].push({
        id_item_keranjang: nextId,
        id_menu: idMenu,
        jumlah,
        catatan: String(body.catatan || "").slice(0, 500),
      });
    }
    saveDb(db);
    return sendJson(req, res, 201, {
      success: true,
      message: "Item berhasil ditambahkan ke keranjang.",
    });
  }

  const cartItemMatch = pathname.match(/^\/cart\/items\/(\d+)$/);
  if (cartItemMatch && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const idTarget = Number(cartItemMatch[1]);
    const body = await parseBody(req);
    const userCart = db.carts[user.id_user] || [];
    const item = userCart.find(
      (i) => i.id_item_keranjang === idTarget || i.id_menu === idTarget
    );
    if (!item) {
      return sendJson(req, res, 404, { success: false, message: "Item keranjang tidak ditemukan." });
    }
    item.jumlah = Math.max(1, Math.min(100, Number(body.jumlah || 1)));
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Item keranjang berhasil diperbarui.",
    });
  }

  if (cartItemMatch && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const idTarget = Number(cartItemMatch[1]);
    if (db.carts[user.id_user]) {
      db.carts[user.id_user] = db.carts[user.id_user].filter(
        (i) => i.id_item_keranjang !== idTarget && i.id_menu !== idTarget
      );
      saveDb(db);
    }
    return sendJson(req, res, 200, {
      success: true,
      message: "Item berhasil dihapus.",
    });
  }
}