// Route Catalog — dipindah verbatim dari backend/server.mjs (baris 1798-2153).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { sendJson } from "../lib/http.mjs";
import { db } from "../lib/db.mjs";
import { compactMediaUrl, createEnrichContext, enrichMenu, enrichOrder, enrichTenant, isTenantConfigured } from "../lib/enrich.mjs";
import { getAuthUser, sanitizeUserResponse } from "../lib/auth.mjs";
export async function handleCatalogRoutes({ req, res, pathname, method, urlObj }) {
  const mediaMatch = pathname.match(/^\/media\/(tenant|menu|user)\/(\d+)$/);
  if (mediaMatch && method === "GET") {
    const type = mediaMatch[1];
    const targetId = Number(mediaMatch[2]);
    let rawImg = "";
    if (type === "menu") {
      rawImg = db.menus.find((m) => Number(m.id_menu) === targetId)?.gambar || "";
    } else if (type === "user") {
      rawImg = db.users.find((u) => Number(u.id_user) === targetId)?.avatar || "";
    } else if (type === "tenant") {
      const t = db.tenants.find((x) => Number(x.id_tenant) === targetId);
      if (t) {
        const owner = db.users.find((u) => Number(u.id_user) === Number(t.id_user));
        const menuImg =
          db.menus.find((m) => Number(m.id_tenant) === targetId && m.gambar && m.gambar !== "menu/default.png")?.gambar || "";
        const rawLogo = t.logo && t.logo !== "tenant/default.png" ? t.logo : "";
        const rawGambar = t.gambar && t.gambar !== "tenant/default.png" ? t.gambar : "";
        rawImg = rawGambar || rawLogo || owner?.avatar || menuImg || "";
      }
    }
    const trimmed = String(rawImg || "").trim();
    const imgMatch = trimmed.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([\s\S]+)$/i);
    if (!imgMatch) {
      if (/^https?:\/\//i.test(trimmed)) {
        res.writeHead(302, { ...getCorsHeaders(req), Location: trimmed });
        res.end();
        return;
      }
      return sendJson(req, res, 404, { success: false, message: "Media tidak ditemukan." });
    }
    const etag = `"${crypto.createHash("md5").update(trimmed).digest("hex")}"`;
    const cacheHeaders = {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      ETag: etag,
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    };
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, cacheHeaders);
      res.end();
      return;
    }
    const buf = Buffer.from(imgMatch[2].replace(/\s+/g, ""), "base64");
    const mime = imgMatch[1].toLowerCase() === "image/jpg" ? "image/jpeg" : imgMatch[1].toLowerCase();
    res.writeHead(200, {
      ...cacheHeaders,
      "Content-Type": mime,
      "Content-Length": String(buf.length),
    });
    res.end(buf);
    return;
  }

  if (pathname === "/sync" && method === "GET") {
    const authHeader = req.headers.authorization || "";
    const hasBearer = /^Bearer\s+\S+/i.test(authHeader);
    const user = hasBearer ? getAuthUser(req) : null;
    if (hasBearer && !user) {
      return sendJson(req, res, 401, { success: false, message: "Unauthenticated." });
    }
    const includeCatalog = urlObj.searchParams.get("catalog") !== "0";
    const compactMedia = urlObj.searchParams.get("compact_media") !== "0";
    const ctx = createEnrichContext(compactMedia);
    const isVendor = Boolean(user && String(user.peran).toLowerCase() === "vendor");
    const isCustomer = Boolean(user && String(user.peran).toLowerCase() === "customer");
    const rawVendorTenant = isVendor
      ? db.tenants.find((t) => Number(t.id_user) === Number(user.id_user)) || null
      : null;
    const vendorTenant = rawVendorTenant ? enrichTenant(rawVendorTenant, ctx) : null;

    let tenants = null;
    let menus = null;
    let promos = null;
    let vendorMenus = null;
    let vendorPromos = null;
    let vendorReviews = null;

    if (includeCatalog) {
      tenants = db.tenants
        .filter((t) => isTenantConfigured(t, ctx))
        .map((t) => enrichTenant(t, ctx));
      menus = db.menus.map((m) => enrichMenu(m, ctx));
      promos = (db.promos || [])
        .filter((p) => {
          if (!p.aktif) return false;
          const limit = Number(p.batas_per_user ?? 1);
          if (user && limit > 0) {
            const used = (db.orders || []).filter(
              (o) =>
                Number(o.id_user) === Number(user.id_user) &&
                String(o.promo_code || "").toUpperCase() === String(p.kode_promo || "").toUpperCase() &&
                o.status_pesanan !== "Dibatalkan"
            ).length;
            if (used >= limit) return false;
          }
          return true;
        })
        .map((p) => {
          const limit = Number(p.batas_per_user ?? 1);
          const used = user
            ? (db.orders || []).filter(
                (o) =>
                  Number(o.id_user) === Number(user.id_user) &&
                  String(o.promo_code || "").toUpperCase() === String(p.kode_promo || "").toUpperCase() &&
                  o.status_pesanan !== "Dibatalkan"
              ).length
            : 0;
          return {
            ...p,
            batas_per_user: limit,
            used_by_user: used,
            sisa_klaim: limit > 0 ? Math.max(0, limit - used) : null,
          };
        });

      if (isVendor && rawVendorTenant) {
        vendorMenus = db.menus
          .filter((m) => m.id_tenant === rawVendorTenant.id_tenant)
          .map((m) => enrichMenu(m, ctx));
        vendorPromos = (db.promos || []).filter(
          (p) => Number(p.id_tenant) === Number(rawVendorTenant.id_tenant)
        );
        vendorReviews = (db.reviews || [])
          .filter((r) => Number(r.id_tenant) === Number(rawVendorTenant.id_tenant))
          .map((r) => {
            const menuObj = ctx.menuById.get(Number(r.id_menu));
            const userObj = ctx.userById.get(Number(r.id_user));
            const orderObj = db.orders.find((o) => Number(o.id_pesanan) === Number(r.id_pesanan));
            return {
              ...r,
              nama_menu: r.nama_menu || menuObj?.nama_menu || "Menu",
              reviewer_name: r.reviewer_name || userObj?.nama || userObj?.username || "Pelanggan",
              nomor_antrean: r.nomor_antrean || orderObj?.nomor_antrean || null,
            };
          })
          .sort((a, b) => b.id_review - a.id_review);
      } else if (isVendor) {
        vendorMenus = [];
        vendorPromos = [];
        vendorReviews = [];
      }
    }

    let orders = null;
    let vendorOrders = null;
    let cart = null;
    let notifications = null;

    if (user) {
      if (isVendor) {
        vendorOrders = rawVendorTenant
          ? db.orders
              .filter((o) => o.id_tenant === rawVendorTenant.id_tenant)
              .sort((a, b) => b.id_pesanan - a.id_pesanan)
              .map((o) => enrichOrder(o, ctx))
          : [];
      } else {
        orders = db.orders
          .filter((o) => o.id_user === user.id_user)
          .sort((a, b) => b.id_pesanan - a.id_pesanan)
          .map((o) => enrichOrder(o, ctx));
        if (isCustomer) {
          const rawItems = db.carts[user.id_user] || [];
          cart = {
            items: rawItems
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
              .filter(Boolean),
          };
        }
      }
      notifications = db.notifications.filter((n) => n.id_user === user.id_user);
    }

    let userPayload = null;
    if (user) {
      userPayload = sanitizeUserResponse(user, vendorTenant);
      if (compactMedia && userPayload.avatar) {
        userPayload.avatar = compactMediaUrl("user", user.id_user, userPayload.avatar);
      }
    }

    return sendJson(req, res, 200, {
      success: true,
      data: {
        authenticated: Boolean(user),
        user: userPayload,
        tenants,
        menus,
        promos,
        orders,
        cart,
        notifications,
        vendor_tenant: vendorTenant,
        vendor_menus: vendorMenus,
        vendor_orders: vendorOrders,
        vendor_promos: vendorPromos,
        vendor_reviews: vendorReviews,
      },
    });
  }

  if (pathname === "/categories" && method === "GET") {
    return sendJson(
      req,
      res,
      200,
      {
        success: true,
        message: "Daftar kategori berhasil diambil.",
        data: db.categories,
      },
      { "Cache-Control": "public, max-age=300" }
    );
  }

  if (pathname === "/tenants" && method === "GET") {
    const includeUnconfigured = urlObj.searchParams.get("include_unconfigured") === "true";
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const ctx = createEnrichContext(compactMedia);
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar tenant berhasil diambil.",
      data: db.tenants
        .filter((t) => includeUnconfigured || isTenantConfigured(t, ctx))
        .map((t) => enrichTenant(t, ctx)),
    });
  }

  if (pathname === "/banners" && method === "GET") {
    const list = (db.banners || [])
      .filter((banner) => banner.aktif !== false)
      .sort(
        (a, b) =>
          (Number(a.urutan) || 0) - (Number(b.urutan) || 0) ||
          Number(a.id_banner) - Number(b.id_banner)
      );
    return sendJson(req, res, 200, { success: true, data: list });
  }

  if (pathname === "/promos" && method === "GET") {
    const idTenantParam = urlObj.searchParams.get("id_tenant");
    const authUser = getAuthUser(req);
    const list = (db.promos || [])
      .filter((p) => {
        if (!p.aktif) return false;
        if (idTenantParam && p.id_tenant && Number(p.id_tenant) !== Number(idTenantParam)) {
          return false;
        }
        const limit = Number(p.batas_per_user ?? 1);
        if (authUser && limit > 0) {
          const used = (db.orders || []).filter(
            (o) =>
              Number(o.id_user) === Number(authUser.id_user) &&
              String(o.promo_code || "").toUpperCase() === String(p.kode_promo || "").toUpperCase() &&
              o.status_pesanan !== "Dibatalkan"
          ).length;
          if (used >= limit) return false;
        }
        return true;
      })
      .map((p) => {
        const limit = Number(p.batas_per_user ?? 1);
        const used = authUser
          ? (db.orders || []).filter(
              (o) =>
                Number(o.id_user) === Number(authUser.id_user) &&
                String(o.promo_code || "").toUpperCase() === String(p.kode_promo || "").toUpperCase() &&
                o.status_pesanan !== "Dibatalkan"
            ).length
          : 0;
        return {
          ...p,
          batas_per_user: limit,
          used_by_user: used,
          sisa_klaim: limit > 0 ? Math.max(0, limit - used) : null,
        };
      });
    return sendJson(req, res, 200, {
      success: true,
      data: list,
    });
  }

  if (pathname === "/reviews" && method === "GET") {
    const idMenuParam = urlObj.searchParams.get("id_menu");
    const idTenantParam = urlObj.searchParams.get("id_tenant");
    const idOrderParam = urlObj.searchParams.get("id_pesanan");
    const list = (db.reviews || [])
      .filter((r) => {
        if (idMenuParam && Number(r.id_menu) !== Number(idMenuParam)) return false;
        if (idTenantParam && Number(r.id_tenant) !== Number(idTenantParam)) return false;
        if (idOrderParam && Number(r.id_pesanan) !== Number(idOrderParam)) return false;
        return true;
      })
      .map((r) => {
        const menuObj = db.menus.find((m) => Number(m.id_menu) === Number(r.id_menu));
        const userObj = db.users.find((u) => Number(u.id_user) === Number(r.id_user));
        const orderObj = db.orders.find((o) => Number(o.id_pesanan) === Number(r.id_pesanan));
        return {
          ...r,
          nama_menu: r.nama_menu || menuObj?.nama_menu || "Menu",
          reviewer_name: r.reviewer_name || userObj?.nama || userObj?.username || "Pelanggan",
          nomor_antrean: r.nomor_antrean || orderObj?.nomor_antrean || null,
        };
      })
      .sort((a, b) => b.id_review - a.id_review);
    return sendJson(req, res, 200, {
      success: true,
      data: list,
    });
  }

  const tenantMenusMatch = pathname.match(/^\/tenants\/(\d+)\/menus$/);
  if (tenantMenusMatch && method === "GET") {
    const idTenant = Number(tenantMenusMatch[1]);
    const includeUnavailable = urlObj.searchParams.get("include_unavailable") === "true";
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const ctx = createEnrichContext(compactMedia);
    const menus = db.menus
      .filter((m) => m.id_tenant === idTenant && (includeUnavailable || Boolean(m.status_tersedia)))
      .map((m) => enrichMenu(m, ctx));
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar menu tenant berhasil diambil.",
      data: menus,
    });
  }

  if (pathname === "/menus" && method === "GET") {
    const includeUnavailable = urlObj.searchParams.get("include_unavailable") === "true";
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const ctx = createEnrichContext(compactMedia);
    const list = db.menus
      .filter((m) => (includeUnavailable ? true : Boolean(m.status_tersedia)))
      .map((m) => enrichMenu(m, ctx));
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar menu berhasil diambil.",
      data: list,
    });
  }
}