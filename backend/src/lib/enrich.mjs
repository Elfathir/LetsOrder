// Dipindah verbatim dari backend/server.mjs (src/lib/enrich.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { db } from "./db.mjs";
function formatDbTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isTenantOpenNow(tenant) {
  if (!tenant) return false;
  if (!tenant.auto_schedule) return Boolean(tenant.status_buka);
  if (tenant.status_buka === false) return false;
  const openStr = String(tenant.jam_buka || "07:00").slice(0, 5);
  const closeStr = String(tenant.jam_tutup || "21:00").slice(0, 5);
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  if (openStr <= closeStr) return hhmm >= openStr && hhmm < closeStr;
  return hhmm >= openStr || hhmm < closeStr;
}

function isMediaEndpointRef(val) {
  if (typeof val !== "string") return false;
  return /^(?:https?:\/\/[^/]+)?\/api\/(?:v1\/)?media\/(?:tenant|menu|user)\/\d+/i.test(val.trim());
}

function compactMediaUrl(type, id, rawVal) {
  const trimmed = String(rawVal || "").trim();
  if (!trimmed || trimmed === "menu/default.png" || trimmed === "tenant/default.png") return "";
  if (/^data:image\//i.test(trimmed)) {
    const version = crypto.createHash("md5").update(trimmed).digest("hex").slice(0, 10);
    return `/api/media/${type}/${id}?v=${version}`;
  }
  return trimmed;
}

// Posisi & zoom foto disimpan sebagai metadata supaya crop bisa diedit ulang
// tanpa mengubah berkas aslinya. Nilai dipakai langsung oleh CSS object-position.
const PHOTO_FOCUS_DEFAULTS = { foto_x: 50, foto_y: 50, foto_zoom: 1 };

function clampPhotoValue(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

// Mengambil hanya field posisi yang dikirim klien, sudah dinormalisasi.
function readPhotoFocus(body = {}) {
  const out = {};
  if (body.foto_x !== undefined) out.foto_x = clampPhotoValue(body.foto_x, 0, 100, 50);
  if (body.foto_y !== undefined) out.foto_y = clampPhotoValue(body.foto_y, 0, 100, 50);
  if (body.foto_zoom !== undefined) out.foto_zoom = clampPhotoValue(body.foto_zoom, 1, 3, 1);
  return out;
}

function createEnrichContext(compactMedia = false) {
  const userById = new Map();
  for (const u of db.users || []) userById.set(Number(u.id_user), u);

  const tenantById = new Map();
  for (const t of db.tenants || []) tenantById.set(Number(t.id_tenant), t);

  const categoryById = new Map();
  for (const c of db.categories || []) categoryById.set(Number(c.id_kategori), c);

  const menuById = new Map();
  const menusByTenant = new Map();
  for (const m of db.menus || []) {
    menuById.set(Number(m.id_menu), m);
    const tid = Number(m.id_tenant);
    let arr = menusByTenant.get(tid);
    if (!arr) {
      arr = [];
      menusByTenant.set(tid, arr);
    }
    arr.push(m);
  }

  const reviewsByTenant = new Map();
  const reviewsByMenu = new Map();
  const reviewsByOrder = new Map();
  for (const r of db.reviews || []) {
    const tid = Number(r.id_tenant);
    if (!reviewsByTenant.has(tid)) reviewsByTenant.set(tid, []);
    reviewsByTenant.get(tid).push(r);

    const mid = Number(r.id_menu);
    if (!reviewsByMenu.has(mid)) reviewsByMenu.set(mid, []);
    reviewsByMenu.get(mid).push(r);

    const oid = Number(r.id_pesanan);
    if (!reviewsByOrder.has(oid)) reviewsByOrder.set(oid, []);
    reviewsByOrder.get(oid).push(r);
  }

  const latestPaymentByOrder = new Map();
  for (const p of db.payments || []) {
    const oid = Number(p.id_pesanan);
    const prev = latestPaymentByOrder.get(oid);
    if (!prev || Number(p.id_pembayaran) > Number(prev.id_pembayaran)) {
      latestPaymentByOrder.set(oid, p);
    }
  }

  const messagesByOrder = new Map();
  for (const m of db.messages || []) {
    const oid = Number(m.id_pesanan);
    if (!messagesByOrder.has(oid)) messagesByOrder.set(oid, []);
    messagesByOrder.get(oid).push(m);
  }

  return {
    compactMedia: Boolean(compactMedia),
    userById,
    tenantById,
    categoryById,
    menuById,
    menusByTenant,
    reviewsByTenant,
    reviewsByMenu,
    reviewsByOrder,
    latestPaymentByOrder,
    messagesByOrder,
    enrichedTenants: new Map(),
  };
}

function isTenantConfigured(tenant, ctx = null) {
  if (!tenant) return false;
  const defaultDescs = ["", "tenant kantin kampus upnvj", "tenant kantin kampus", "campus canteen tenant"];
  const rawDesc = String(tenant.deskripsi || "").trim().toLowerCase();
  const hasCustomDesc = !defaultDescs.includes(rawDesc);
  const hasLogo = Boolean(
    (tenant.logo && tenant.logo !== "tenant/default.png") ||
      (tenant.gambar && tenant.gambar !== "tenant/default.png")
  );
  const tid = Number(tenant.id_tenant);
  const hasMenus = ctx
    ? (ctx.menusByTenant.get(tid)?.length || 0) > 0
    : (db.menus || []).some((m) => Number(m.id_tenant) === tid);
  return hasCustomDesc || hasLogo || hasMenus;
}

function enrichTenant(tenant, ctx = null) {
  if (!tenant) return null;
  const tid = Number(tenant.id_tenant);
  if (ctx?.enrichedTenants.has(tid)) {
    return ctx.enrichedTenants.get(tid);
  }
  const defaultDescs = ["", "tenant kantin kampus upnvj", "tenant kantin kampus", "campus canteen tenant"];
  const rawDesc = String(tenant.deskripsi || "").trim();
  const cleanDesc = defaultDescs.includes(rawDesc.toLowerCase()) ? "" : rawDesc;
  const owner = ctx
    ? ctx.userById.get(Number(tenant.id_user)) || null
    : db.users.find((u) => u.id_user === tenant.id_user) || null;
  const tenantReviews = ctx
    ? ctx.reviewsByTenant.get(tid) || []
    : (db.reviews || []).filter((r) => Number(r.id_tenant) === tid);
  const avgRating =
    tenantReviews.length > 0
      ? (
          tenantReviews.reduce((s, r) => s + Number(r.rating || 5), 0) /
          tenantReviews.length
        ).toFixed(1)
      : "0.0";
  const tenantMenus = ctx
    ? ctx.menusByTenant.get(tid) || []
    : db.menus.filter((m) => Number(m.id_tenant) === tid);
  const menuImgFallback = tenantMenus.find((m) => m.gambar)?.gambar || "";
  const effectiveRaw = tenant.gambar || tenant.logo || owner?.avatar || menuImgFallback || "";
  const logoOut = ctx?.compactMedia
    ? compactMediaUrl("tenant", tid, tenant.logo || effectiveRaw)
    : tenant.logo || effectiveRaw;
  const effectiveOut = ctx?.compactMedia
    ? compactMediaUrl("tenant", tid, effectiveRaw)
    : effectiveRaw;
  const enriched = {
    ...tenant,
    deskripsi: cleanDesc,
    logo: logoOut,
    gambar: effectiveOut,
    is_configured: isTenantConfigured(tenant, ctx),
    jam_buka: tenant.jam_buka || "07:00",
    jam_tutup: tenant.jam_tutup || "21:00",
    auto_schedule: Boolean(tenant.auto_schedule),
    status_buka_efektif: isTenantOpenNow(tenant),
    rating: tenantReviews.length > 0 ? avgRating : null,
    reviews_count: tenantReviews.length,
  };
  if (ctx) {
    ctx.enrichedTenants.set(tid, enriched);
  }
  return enriched;
}

function pushNotification(idUser, idPesanan, pesan) {
  if (!idUser) return;
  const nextId = Math.max(0, ...db.notifications.map((n) => Number(n.id_notifikasi) || 0)) + 1;
  db.notifications.unshift({
    id_notifikasi: nextId,
    id_user: idUser,
    id_pesanan: idPesanan || null,
    pesan,
    status_baca: false,
    waktu: formatDbTimestamp(),
  });
}

function enrichMenu(menu, ctx = null) {
  const rawTenant = ctx
    ? ctx.tenantById.get(Number(menu.id_tenant)) || null
    : db.tenants.find((t) => t.id_tenant === menu.id_tenant) || null;
  const tenant = rawTenant ? enrichTenant(rawTenant, ctx) : null;
  const category = ctx
    ? ctx.categoryById.get(Number(menu.id_kategori)) || null
    : db.categories.find((c) => c.id_kategori === menu.id_kategori) || null;
  const menuReviews = ctx
    ? ctx.reviewsByMenu.get(Number(menu.id_menu)) || []
    : (db.reviews || []).filter((r) => Number(r.id_menu) === Number(menu.id_menu));
  const avgRating =
    menuReviews.length > 0
      ? (
          menuReviews.reduce((s, r) => s + Number(r.rating || 5), 0) /
          menuReviews.length
        ).toFixed(1)
      : null;
  const gambarOut = ctx?.compactMedia
    ? compactMediaUrl("menu", menu.id_menu, menu.gambar)
    : menu.gambar;
  return {
    ...menu,
    gambar: gambarOut,
    available: Boolean(menu.status_tersedia),
    tenant_name: tenant?.nama_tenant || menu.tenant_name || "Canteen Tenant",
    kategori_nama: category?.nama_kategori || menu.kategori_nama || "Rice & Mains",
    rating: avgRating,
    reviews: menuReviews.length,
    reviews_count: menuReviews.length,
    tenant,
    category,
  };
}

function isOrderPaid(order, payment = null) {
  if (!order) return false;
  const latestPay =
    payment ||
    (db.payments || [])
      .filter((p) => Number(p.id_pesanan) === Number(order.id_pesanan))
      .sort((a, b) => Number(b.id_pembayaran) - Number(a.id_pembayaran))[0] ||
    null;
  return Boolean(
    latestPay?.status_verifikasi === "Terverifikasi" ||
      ["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"].includes(
        order.status_pesanan
      )
  );
}

function enrichOrder(order, ctx = null) {
  const oid = Number(order.id_pesanan);
  const rawTenant = ctx
    ? ctx.tenantById.get(Number(order.id_tenant)) || null
    : db.tenants.find((t) => t.id_tenant === order.id_tenant) || null;
  const tenant = rawTenant ? enrichTenant(rawTenant, ctx) : null;
  const user = ctx
    ? ctx.userById.get(Number(order.id_user)) || null
    : db.users.find((u) => u.id_user === order.id_user) || null;
  const payment = ctx
    ? ctx.latestPaymentByOrder.get(oid) || null
    : db.payments
        .filter((p) => p.id_pesanan === order.id_pesanan)
        .sort((a, b) => b.id_pembayaran - a.id_pembayaran)[0] || null;
  const orderReviews = ctx
    ? ctx.reviewsByOrder.get(oid) || []
    : (db.reviews || []).filter((r) => Number(r.id_pesanan) === oid);
  const orderMessages = (
    ctx
      ? [...(ctx.messagesByOrder.get(oid) || [])]
      : (db.messages || []).filter((m) => Number(m.id_pesanan) === oid)
  ).sort((a, b) => Number(a.id_pesan) - Number(b.id_pesan));
  const lastChat = orderMessages[orderMessages.length - 1] || null;
  const details = (order.details || []).map((d) => {
    const m = ctx
      ? ctx.menuById.get(Number(d.id_menu))
      : db.menus.find((x) => x.id_menu === d.id_menu);
    const rawDetailImg = m?.gambar || d.gambar || "";
    const detailImgOut =
      ctx?.compactMedia && (m?.id_menu || d.id_menu)
        ? compactMediaUrl("menu", m?.id_menu || d.id_menu, rawDetailImg)
        : rawDetailImg;
    return {
      ...d,
      gambar: detailImgOut,
      estimasi_menit: m?.estimasi_menit || d.estimasi_menit || 8,
      menu: m ? (ctx?.compactMedia ? { ...m, gambar: detailImgOut } : m) : null,
    };
  });
  return {
    ...order,
    is_paid: isOrderPaid(order, payment),
    chat_count: orderMessages.length,
    last_chat: lastChat
      ? {
          id_pesan: lastChat.id_pesan,
          id_pengirim: lastChat.id_pengirim,
          peran_pengirim: lastChat.peran_pengirim,
          nama_pengirim: lastChat.nama_pengirim,
          teks: lastChat.teks || "",
          has_image: Boolean(lastChat.gambar),
          waktu: lastChat.waktu,
        }
      : null,
    tenant,
    payment,
    reviews: orderReviews,
    has_reviewed: orderReviews.length > 0,
    user: user
      ? {
          id_user: user.id_user,
          username: user.username,
          nama: user.nama,
          email: user.email,
          peran: user.peran,
        }
      : null,
    details,
    order_details: details,
    status_history: order.status_history || [
      { status: order.status_pesanan, waktu: order.waktu_pesan },
    ],
  };
}

export { PHOTO_FOCUS_DEFAULTS, compactMediaUrl, createEnrichContext, enrichMenu, enrichOrder, enrichTenant, formatDbTimestamp, isMediaEndpointRef, isOrderPaid, isTenantConfigured, isTenantOpenNow, pushNotification, readPhotoFocus };