// Route Vendor — dipindah verbatim dari backend/server.mjs (baris 3081-3409).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { SERVER_PROMOS } from "../config.mjs";
import { isSafeImageInput, parseBody, sendJson , readCompactMedia } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { createEnrichContext, enrichMenu, enrichTenant, isMediaEndpointRef, readPhotoFocus } from "../lib/enrich.mjs";
import { ensureTenantForVendor, requireAuth, requireRole } from "../lib/auth.mjs";
export async function handleVendorRoutes({ req, res, pathname, method, urlObj }) {
  if (pathname === "/vendor/tenant" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const hadTenant = db.tenants.some((t) => t.id_user === user.id_user);
    const tenant = ensureTenantForVendor(user);
    if (!hadTenant && tenant) saveDb(db);
    const compactMedia = readCompactMedia(urlObj);
    const ctx = compactMedia ? createEnrichContext(true) : null;
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi tenant berhasil diambil.",
      data: enrichTenant(tenant, ctx),
    });
  }

  if (pathname === "/vendor/tenant" && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Payload terlalu besar." });
    }
    const imgInput = body.logo !== undefined ? body.logo : body.gambar;
    if (imgInput !== undefined && !isSafeImageInput(imgInput)) {
      return sendJson(req, res, 422, { success: false, message: "Format gambar tenant tidak valid." });
    }
    const tenant = ensureTenantForVendor(user);
    if (body.nama_tenant !== undefined) tenant.nama_tenant = String(body.nama_tenant).trim().slice(0, 100);
    if (body.deskripsi !== undefined) tenant.deskripsi = String(body.deskripsi).slice(0, 500);
    if (body.booth !== undefined) tenant.booth = String(body.booth).slice(0, 100);
    if (imgInput !== undefined && !isMediaEndpointRef(imgInput)) {
      tenant.gambar = imgInput;
      tenant.logo = imgInput;
    }
    if (body.jam_buka !== undefined && /^\d{2}:\d{2}/.test(String(body.jam_buka))) {
      tenant.jam_buka = String(body.jam_buka).slice(0, 5);
    }
    if (body.jam_tutup !== undefined && /^\d{2}:\d{2}/.test(String(body.jam_tutup))) {
      tenant.jam_tutup = String(body.jam_tutup).slice(0, 5);
    }
    if (body.auto_schedule !== undefined) {
      tenant.auto_schedule = Boolean(body.auto_schedule);
    }
    if (body.status_buka !== undefined) tenant.status_buka = Boolean(body.status_buka);
    Object.assign(tenant, readPhotoFocus(body));
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi tenant berhasil diperbarui.",
      data: enrichTenant(tenant),
    });
  }

  if (pathname === "/vendor/promos" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const tenant = isAdmin ? null : ensureTenantForVendor(user);
    const list = (db.promos || []).filter((p) =>
      isAdmin ? true : Number(p.id_tenant) === Number(tenant.id_tenant)
    );
    return sendJson(req, res, 200, { success: true, data: list });
  }

  if (pathname === "/vendor/promos" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const tenant = ensureTenantForVendor(user);
    const body = await parseBody(req);
    const kodePromo = String(body.kode_promo || body.code || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
    const judul = String(body.judul || body.title || "").trim().slice(0, 100);
    const tipe = body.tipe === "percentage" ? "percentage" : "fixed";
    const diskon = Math.max(1, Number(body.diskon || body.discount || 0));
    const minimalBelanja = Math.max(0, Number(body.minimal_belanja || body.minSpend || 0));
    const batasPerUser =
      body.batas_per_user !== undefined && body.batas_per_user !== ""
        ? Math.max(0, Math.min(1000, Math.floor(Number(body.batas_per_user))))
        : 1;

    if (!kodePromo || !judul || diskon <= 0) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Kode promo, judul, dan nominal diskon wajib diisi.",
      });
    }
    if (
      SERVER_PROMOS[kodePromo] ||
      (db.promos || []).some((p) => String(p.kode_promo).toUpperCase() === kodePromo)
    ) {
      return sendJson(req, res, 422, {
        success: false,
        message: `Kode promo '${kodePromo}' sudah digunakan.`,
      });
    }
    if (tipe === "percentage" && diskon > 90) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Diskon persentase maksimal 90%.",
      });
    }

    const nextPromoId = Math.max(0, ...(db.promos || []).map((p) => Number(p.id_promo) || 0)) + 1;
    const newPromo = {
      id_promo: nextPromoId,
      id_tenant: tenant.id_tenant,
      kode_promo: kodePromo,
      judul,
      tipe,
      diskon,
      minimal_belanja: minimalBelanja,
      batas_per_user: batasPerUser,
      aktif: body.aktif !== undefined ? Boolean(body.aktif) : true,
    };
    db.promos.unshift(newPromo);
    saveDb(db);
    return sendJson(req, res, 201, {
      success: true,
      message: "Promo khusus tenant berhasil dibuat.",
      data: newPromo,
    });
  }

  const vendorPromoMatch = pathname.match(/^\/vendor\/promos\/(\d+)$/);
  if (vendorPromoMatch && (method === "PATCH" || method === "PUT")) {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const promoId = Number(vendorPromoMatch[1]);
    const promo = (db.promos || []).find((p) => Number(p.id_promo) === promoId);
    if (!promo) {
      return sendJson(req, res, 404, { success: false, message: "Promo tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || Number(promo.id_tenant) !== Number(vendorTenant.id_tenant))) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    const body = await parseBody(req);
    if (body.aktif !== undefined) promo.aktif = Boolean(body.aktif);
    if (body.judul !== undefined) promo.judul = String(body.judul).trim().slice(0, 100);
    if (body.minimal_belanja !== undefined) promo.minimal_belanja = Math.max(0, Number(body.minimal_belanja));
    if (body.batas_per_user !== undefined) {
      promo.batas_per_user = Math.max(0, Math.min(1000, Math.floor(Number(body.batas_per_user))));
    }
    saveDb(db);
    return sendJson(req, res, 200, { success: true, data: promo });
  }

  if (vendorPromoMatch && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const promoId = Number(vendorPromoMatch[1]);
    const promo = (db.promos || []).find((p) => Number(p.id_promo) === promoId);
    if (!promo) {
      return sendJson(req, res, 404, { success: false, message: "Promo tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || Number(promo.id_tenant) !== Number(vendorTenant.id_tenant))) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    db.promos = db.promos.filter((p) => Number(p.id_promo) !== promoId);
    saveDb(db);
    return sendJson(req, res, 200, { success: true, message: "Promo berhasil dihapus." });
  }

  if (pathname === "/vendor/menus" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const hadTenant = !isAdmin && db.tenants.some((t) => t.id_user === user.id_user);
    const tenant = isAdmin ? null : ensureTenantForVendor(user);
    if (!hadTenant && tenant) saveDb(db);
    const compactMedia = readCompactMedia(urlObj);
    const ctx = createEnrichContext(compactMedia);
    const menus = db.menus
      .filter((m) => (isAdmin ? true : m.id_tenant === tenant.id_tenant))
      .map((m) => enrichMenu(m, ctx));
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar menu tenant berhasil diambil.",
      data: menus,
    });
  }

  if ((pathname === "/vendor/menus" || pathname === "/menus") && method === "POST") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Payload terlalu besar." });
    }
    if (body.gambar !== undefined && !isSafeImageInput(body.gambar)) {
      return sendJson(req, res, 422, { success: false, message: "Format gambar menu tidak valid." });
    }
    const tenant = ensureTenantForVendor(user);
    const namaMenu = String(body.nama_menu || "").trim().slice(0, 100);
    const harga = Math.max(0, Math.min(10_000_000, Number(String(body.harga || 0).replace(/\D/g, ""))));
    const estimasiMenit = Math.max(1, Math.min(180, Number(body.estimasi_menit || 8)));
    const kategoriNama = body.kategori_nama || "Rice & Mains";
    const catObj =
      db.categories.find((c) => c.nama_kategori === kategoriNama) || db.categories[0];

    if (!namaMenu) {
      return sendJson(req, res, 422, { success: false, message: "Nama menu wajib diisi." });
    }

    const nextMenuId = Math.max(0, ...db.menus.map((m) => m.id_menu)) + 1;
    const newMenu = {
      id_menu: nextMenuId,
      id_tenant: tenant.id_tenant,
      id_kategori: catObj.id_kategori,
      nama_menu: namaMenu,
      deskripsi: String(body.deskripsi || "Hidangan segar dibuat langsung oleh tenant kantin.").slice(0, 500),
      gambar: String(body.gambar || ""),
      harga,
      estimasi_menit: estimasiMenit,
      status_tersedia: body.status_tersedia !== undefined ? Boolean(body.status_tersedia) : true,
      sold_today: 0,
      ...readPhotoFocus(body),
    };

    if (!tenant.gambar && newMenu.gambar) {
      tenant.gambar = newMenu.gambar;
      tenant.logo = newMenu.gambar;
    }

    db.menus.push(newMenu);
    saveDb(db);

    return sendJson(req, res, 201, {
      success: true,
      message: "Menu baru berhasil ditambahkan.",
      data: enrichMenu(newMenu),
    });
  }

  const menuUpdateMatch = pathname.match(/^\/(?:vendor\/)?menus\/(\d+)$/);
  if (menuUpdateMatch && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const idMenu = Number(menuUpdateMatch[1]);
    const menu = db.menus.find((m) => m.id_menu === idMenu);
    if (!menu) {
      return sendJson(req, res, 404, { success: false, message: "Menu tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || menu.id_tenant !== vendorTenant.id_tenant)) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk mengubah menu milik tenant lain.",
      });
    }
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Payload terlalu besar." });
    }
    if (body.gambar !== undefined && !isSafeImageInput(body.gambar)) {
      return sendJson(req, res, 422, { success: false, message: "Format gambar menu tidak valid." });
    }
    if (body.nama_menu !== undefined) menu.nama_menu = String(body.nama_menu).trim().slice(0, 100);
    if (body.deskripsi !== undefined) menu.deskripsi = String(body.deskripsi).slice(0, 500);
    if (body.gambar !== undefined && !isMediaEndpointRef(body.gambar)) menu.gambar = body.gambar;
    if (body.estimasi_menit !== undefined) menu.estimasi_menit = Math.max(1, Math.min(180, Number(body.estimasi_menit)));
    if (body.kategori_nama !== undefined) {
      const c = db.categories.find((x) => x.nama_kategori === body.kategori_nama);
      if (c) menu.id_kategori = c.id_kategori;
    }
    if (body.harga !== undefined) menu.harga = Math.max(0, Math.min(10_000_000, Number(body.harga)));
    if (body.status_tersedia !== undefined) {
      menu.status_tersedia = Boolean(body.status_tersedia);
    }
    Object.assign(menu, readPhotoFocus(body));
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi menu berhasil diperbarui.",
      data: enrichMenu(menu),
    });
  }

  if (menuUpdateMatch && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const idMenu = Number(menuUpdateMatch[1]);
    const menu = db.menus.find((m) => m.id_menu === idMenu);
    if (!menu) {
      return sendJson(req, res, 404, { success: false, message: "Menu tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || menu.id_tenant !== vendorTenant.id_tenant)) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk menghapus menu milik tenant lain.",
      });
    }
    db.menus = db.menus.filter((m) => m.id_menu !== idMenu);
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Menu berhasil dihapus.",
      data: null,
    });
  }

  const menuAvailMatch = pathname.match(/^\/(?:vendor\/)?menus\/(\d+)\/availability$/);
  if (menuAvailMatch && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const idMenu = Number(menuAvailMatch[1]);
    const menu = db.menus.find((m) => m.id_menu === idMenu);
    if (!menu) {
      return sendJson(req, res, 404, { success: false, message: "Menu tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || menu.id_tenant !== vendorTenant.id_tenant)) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk mengubah ketersediaan menu tenant lain.",
      });
    }
    const body = await parseBody(req);
    menu.status_tersedia = Boolean(body.status_tersedia);
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Status ketersediaan menu berhasil diperbarui.",
      data: enrichMenu(menu),
    });
  }
}