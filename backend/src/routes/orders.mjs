// Route Orders — dipindah verbatim dari backend/server.mjs (baris 2291-3077).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { ALLOW_PAYMENT_SIMULATION, VALID_ORDER_STATUSES } from "../config.mjs";
import { logSecurityEvent } from "../lib/security.mjs";
import { getClientIp, isSafeImageInput, parseBody, sendJson } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { createEnrichContext, enrichOrder, formatDbTimestamp, isOrderPaid, isTenantOpenNow, pushNotification } from "../lib/enrich.mjs";
import { requireAuth, requireRole } from "../lib/auth.mjs";
import { calculateServerPromoDiscount } from "../lib/promo.mjs";
export async function handleOrdersRoutes({ req, res, pathname, method, urlObj }) {
  if (pathname === "/orders" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer", "Administrator")) return;
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const ctx = createEnrichContext(compactMedia);
    const list = db.orders
      .filter((o) => (isAdmin ? true : o.id_user === user.id_user))
      .sort((a, b) => b.id_pesanan - a.id_pesanan)
      .map((o) => enrichOrder(o, ctx));
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar pesanan berhasil diambil.",
      data: list,
    });
  }

  const singleOrderMatch = pathname.match(/^\/orders\/(\d+)$/);
  if (singleOrderMatch && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(singleOrderMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const allowed =
      isAdmin ||
      ord.id_user === user.id_user ||
      (vendorTenant && ord.id_tenant === vendorTenant.id_tenant);
    if (!allowed) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    return sendJson(req, res, 200, { success: true, data: enrichOrder(ord) });
  }

  const orderStatusReadMatch = pathname.match(/^\/orders\/(\d+)\/(status|status-history)$/);
  if (orderStatusReadMatch && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderStatusReadMatch[1]);
    const subRoute = orderStatusReadMatch[2];
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const allowed =
      isAdmin ||
      ord.id_user === user.id_user ||
      (vendorTenant && ord.id_tenant === vendorTenant.id_tenant);
    if (!allowed) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    if (subRoute === "status") {
      return sendJson(req, res, 200, {
        success: true,
        data: {
          id_pesanan: ord.id_pesanan,
          nomor_antrean: ord.nomor_antrean,
          status_pesanan: ord.status_pesanan,
          waktu_pesan: ord.waktu_pesan,
        },
      });
    }
    return sendJson(req, res, 200, {
      success: true,
      data: ord.status_history || [{ status: ord.status_pesanan, waktu: ord.waktu_pesan }],
    });
  }

  const orderMessagesMatch = pathname.match(/^\/(?:vendor\/)?orders\/(\d+)\/messages$/);
  if (orderMessagesMatch && (method === "GET" || method === "POST")) {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderMessagesMatch[1]);
    const ord = db.orders.find((o) => Number(o.id_pesanan) === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => Number(t.id_user) === Number(user.id_user));
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const isCustomerOwner = Number(ord.id_user) === Number(user.id_user);
    const isVendorOwner = Boolean(vendorTenant && Number(ord.id_tenant) === Number(vendorTenant.id_tenant));
    if (!isAdmin && !isCustomerOwner && !isVendorOwner) {
      logSecurityEvent("access_denied_order_chat", {
        user_id: user.id_user,
        id_pesanan: orderId,
        ip: getClientIp(req),
      });
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses ke chat pesanan ini.",
      });
    }
    if (!isOrderPaid(ord)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Fitur chat hanya tersedia setelah pesanan dibayar dan terverifikasi.",
      });
    }

    const orderTenant = db.tenants.find((t) => Number(t.id_tenant) === Number(ord.id_tenant)) || null;
    const orderCustomer = db.users.find((u) => Number(u.id_user) === Number(ord.id_user)) || null;

    if (method === "GET") {
      const messages = (db.messages || [])
        .filter((m) => Number(m.id_pesanan) === orderId)
        .sort((a, b) => Number(a.id_pesan) - Number(b.id_pesan));
      // Tanda dibaca dua arah: membuka percakapan menandai semua pesan pihak lain
      // sudah dibaca oleh user ini; pengirim melihat perubahannya lewat polling.
      let readStateChanged = false;
      messages.forEach((msg) => {
        if (!Array.isArray(msg.dibaca_oleh)) {
          msg.dibaca_oleh = [];
          readStateChanged = true;
        }
        if (
          Number(msg.id_pengirim) !== Number(user.id_user) &&
          !msg.dibaca_oleh.some((id) => Number(id) === Number(user.id_user))
        ) {
          msg.dibaca_oleh.push(Number(user.id_user));
          readStateChanged = true;
        }
      });
      if (readStateChanged) saveDb(db);
      return sendJson(req, res, 200, {
        success: true,
        data: {
          order: {
            id_pesanan: ord.id_pesanan,
            nomor_antrean: ord.nomor_antrean,
            status_pesanan: ord.status_pesanan,
            is_paid: true,
            tenant_name: orderTenant?.nama_tenant || "Kantin",
            booth: orderTenant?.booth || "",
            customer_name: orderCustomer?.nama || orderCustomer?.username || "Pembeli",
            customer_id: orderCustomer?.id_user ?? null,
            tenant_user_id: orderTenant?.id_user ?? null,
          },
          messages,
        },
      });
    }

    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, {
        success: false,
        message: "Ukuran gambar/payload terlalu besar (maks. 5 MB).",
      });
    }
    const teks = String(body.teks ?? body.message ?? "").trim();
    const gambar = body.gambar ? String(body.gambar).trim() : "";
    if (!teks && !gambar) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Pesan teks atau gambar wajib diisi.",
      });
    }
    if (teks.length > 1000) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Pesan teks maksimal 1000 karakter.",
      });
    }
    if (gambar && !isSafeImageInput(gambar)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Format gambar tidak diizinkan (gunakan JPG, PNG, WEBP, atau GIF).",
      });
    }

    const actingAsVendor = isVendorOwner && (String(user.peran).toLowerCase() === "vendor" || !isCustomerOwner);
    const senderRole = actingAsVendor
      ? "Vendor"
      : isAdmin && !isCustomerOwner
        ? "Administrator"
        : "Customer";
    const senderName = actingAsVendor
      ? orderTenant?.nama_tenant || user.nama || user.username || "Tenant"
      : user.nama || user.username || "Pembeli";

    const nextMsgId =
      Math.max(0, ...(db.messages || []).map((m) => Number(m.id_pesan) || 0)) + 1;
    const msgRecord = {
      id_pesan: nextMsgId,
      id_pesanan: orderId,
      id_pengirim: user.id_user,
      peran_pengirim: senderRole,
      nama_pengirim: senderName,
      teks,
      gambar,
      dibaca_oleh: [],
      waktu: formatDbTimestamp(),
    };
    db.messages.push(msgRecord);

    const preview = teks
      ? teks.length > 60
        ? `${teks.slice(0, 60)}...`
        : teks
      : "[Mengirim gambar]";
    if (actingAsVendor) {
      if (orderCustomer?.id_user && orderCustomer.id_user !== user.id_user) {
        pushNotification(
          orderCustomer.id_user,
          orderId,
          `Chat baru dari ${senderName} (${ord.nomor_antrean}): ${preview}`
        );
      }
    } else if (orderTenant?.id_user && orderTenant.id_user !== user.id_user) {
      pushNotification(
        orderTenant.id_user,
        orderId,
        `Chat baru dari ${senderName} (${ord.nomor_antrean}): ${preview}`
      );
    }

    saveDb(db);
    return sendJson(req, res, 201, {
      success: true,
      message: "Pesan chat berhasil dikirim.",
      data: msgRecord,
    });
  }

  if (pathname === "/vendor/orders" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const tenant = db.tenants.find((t) => t.id_user === user.id_user);
    if (!isAdmin && !tenant) {
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar pesanan tenant berhasil diambil.",
        data: [],
      });
    }
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
    const ctx = createEnrichContext(compactMedia);
    const list = db.orders
      .filter((o) => (isAdmin ? true : o.id_tenant === tenant.id_tenant))
      .sort((a, b) => b.id_pesanan - a.id_pesanan)
      .map((o) => enrichOrder(o, ctx));
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar pesanan tenant berhasil diambil.",
      data: list,
    });
  }

  if (pathname === "/orders" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const body = await parseBody(req);
    const rawItems = Array.isArray(body.items) && body.items.length > 0
      ? body.items
      : db.carts[user.id_user] || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Keranjang belanja kosong.",
      });
    }

    const details = [];
    const tenantIds = new Set();

    for (let idx = 0; idx < rawItems.length; idx += 1) {
      const ci = rawItems[idx];
      const menu = db.menus.find((x) => x.id_menu === Number(ci.id_menu));
      if (!menu) {
        return sendJson(req, res, 422, {
          success: false,
          message: "Terdapat item menu yang tidak valid.",
        });
      }
      if (!menu.status_tersedia) {
        return sendJson(req, res, 422, {
          success: false,
          message: `Menu '${menu.nama_menu}' sedang tidak tersedia.`,
        });
      }
      const qty = Math.max(1, Math.min(100, Math.floor(Number(ci.jumlah || 1))));
      tenantIds.add(menu.id_tenant);
      details.push({
        id_detail: idx + 1,
        id_menu: menu.id_menu,
        id_tenant: menu.id_tenant,
        nama_menu: menu.nama_menu,
        harga: Number(menu.harga),
        jumlah: qty,
        subtotal: Number(menu.harga) * qty,
        gambar: menu.gambar || "",
      });
    }

    if (tenantIds.size !== 1) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Satu pesanan hanya boleh berisi menu dari satu tenant yang sama.",
      });
    }

    const targetTenantId = Array.from(tenantIds)[0];
    const tenant = db.tenants.find((t) => t.id_tenant === targetTenantId);
    if (!tenant || !isTenantOpenNow(tenant)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Tenant sedang tutup dan tidak dapat menerima pesanan.",
      });
    }

    const subtotal = details.reduce((s, d) => s + d.subtotal, 0);
    const reqPromoCode = String(body.promo_code || "").trim().toUpperCase();
    if (reqPromoCode) {
      const matchedCustomPromo = (db.promos || []).find(
        (p) =>
          String(p.kode_promo || "").trim().toUpperCase() === reqPromoCode &&
          Boolean(p.aktif) &&
          (!p.id_tenant || Number(p.id_tenant) === Number(targetTenantId))
      );
      if (matchedCustomPromo) {
        const limitPerUser = Number(matchedCustomPromo.batas_per_user ?? 1);
        if (limitPerUser > 0) {
          const usedCount = (db.orders || []).filter(
            (o) =>
              Number(o.id_user) === Number(user.id_user) &&
              String(o.promo_code || "").toUpperCase() === reqPromoCode &&
              o.status_pesanan !== "Dibatalkan"
          ).length;
          if (usedCount >= limitPerUser) {
            return sendJson(req, res, 422, {
              success: false,
              message: `Voucher '${reqPromoCode}' sudah mencapai batas pemakaian (${limitPerUser}x) untuk akun Anda.`,
            });
          }
        }
      }
    }
    const promoDiscount = calculateServerPromoDiscount(body.promo_code, subtotal, targetTenantId);
    const totalHarga = Math.max(0, subtotal - promoDiscount);

    const nextOrderId = Math.max(100, ...db.orders.map((o) => o.id_pesanan)) + 1;
    const todayPrefix = formatDbTimestamp().slice(0, 10);
    const todayTenantOrders = db.orders.filter(
      (o) => Number(o.id_tenant) === Number(targetTenantId) && String(o.waktu_pesan || "").startsWith(todayPrefix)
    );
    let queueSeq = todayTenantOrders.length + 1;
    let queueNum = `A-${String(queueSeq).padStart(3, "0")}`;
    while (todayTenantOrders.some((o) => o.nomor_antrean === queueNum)) {
      queueSeq += 1;
      queueNum = `A-${String(queueSeq).padStart(3, "0")}`;
    }

    const newOrder = {
      id_pesanan: nextOrderId,
      id_user: user.id_user,
      id_tenant: targetTenantId,
      nomor_antrean: queueNum,
      status_pesanan: "Menunggu Pembayaran",
      total_harga: totalHarga,
      promo_code: promoDiscount > 0 ? String(body.promo_code).toUpperCase() : null,
      catatan: String(body.catatan || "").slice(0, 500),
      waktu_pesan: formatDbTimestamp(),
      user_name: user.nama || user.username,
      details,
      sales_counted: false,
      status_history: [
        {
          status: "Menunggu Pembayaran",
          waktu: formatDbTimestamp(),
          oleh: user.nama || user.username,
        },
      ],
    };

    db.orders.unshift(newOrder);
    db.carts[user.id_user] = [];

    pushNotification(
      user.id_user,
      nextOrderId,
      `Pesanan ${queueNum} berhasil dibuat. Silakan selesaikan pembayaran QRIS.`
    );

    if (tenant.id_user && tenant.id_user !== user.id_user) {
      pushNotification(
        tenant.id_user,
        nextOrderId,
        `Pesanan baru nomor antrean ${queueNum} telah dibuat oleh ${user.nama || user.username}.`
      );
    }

    saveDb(db);

    return sendJson(req, res, 201, {
      success: true,
      message: "Pesanan berhasil dibuat.",
      data: enrichOrder(newOrder),
    });
  }

  const orderPaymentMatch = pathname.match(/^\/orders\/(\d+)\/payment$/);
  if (orderPaymentMatch && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderPaymentMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const allowed =
      isAdmin ||
      ord.id_user === user.id_user ||
      (vendorTenant && ord.id_tenant === vendorTenant.id_tenant);
    if (!allowed) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    const payment =
      db.payments
        .filter((p) => p.id_pesanan === orderId)
        .sort((a, b) => b.id_pembayaran - a.id_pembayaran)[0] || null;
    if (!payment) {
      return sendJson(req, res, 404, {
        success: false,
        message: "Data pembayaran untuk pesanan ini belum dibuat.",
      });
    }
    return sendJson(req, res, 200, { success: true, data: payment });
  }

  if (orderPaymentMatch && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderPaymentMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && ord.id_user !== user.id_user) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk membuat pembayaran pesanan ini.",
      });
    }
    if (ord.status_pesanan === "Dibatalkan" || ord.status_pesanan === "Selesai") {
      return sendJson(req, res, 422, {
        success: false,
        message: `Pesanan berstatus '${ord.status_pesanan}' tidak dapat dibayar.`,
      });
    }
    const body = await parseBody(req);
    const existing = db.payments.find(
      (p) => p.id_pesanan === orderId && p.status_verifikasi === "Menunggu"
    );
    if (existing) {
      return sendJson(req, res, 200, {
        success: true,
        message: "Data pembayaran sudah tersedia.",
        data: existing,
      });
    }
    const nextPaymentId =
      Math.max(0, ...db.payments.map((p) => Number(p.id_pembayaran) || 0)) + 1;
    const payment = {
      id_pembayaran: nextPaymentId,
      id_pesanan: orderId,
      metode_pembayaran: body.metode_pembayaran || "QRIS",
      kode_qris: `QRIS-LO-${ord.nomor_antrean}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      total_bayar: Number(ord.total_harga || 0),
      status_verifikasi: "Menunggu",
      batas_waktu: formatDbTimestamp(new Date(Date.now() + 15 * 60_000)),
      dibuat_pada: formatDbTimestamp(),
    };
    db.payments.push(payment);
    saveDb(db);
    return sendJson(req, res, 201, {
      success: true,
      message: "Data pembayaran QRIS berhasil dibuat.",
      data: payment,
    });
  }

  const orderPayVerifyMatch = pathname.match(/^\/orders\/(\d+)\/payment\/verify$/);
  const paymentDirectVerifyMatch = pathname.match(/^\/payments\/(\d+)\/verification$/);
  if ((orderPayVerifyMatch && method === "POST") || (paymentDirectVerifyMatch && method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user) return;
    let ord = null;
    let payment = null;
    if (orderPayVerifyMatch) {
      const orderId = Number(orderPayVerifyMatch[1]);
      ord = db.orders.find((o) => o.id_pesanan === orderId);
      payment =
        db.payments
          .filter((p) => p.id_pesanan === orderId)
          .sort((a, b) => b.id_pembayaran - a.id_pembayaran)[0] || null;
    } else {
      const paymentId = Number(paymentDirectVerifyMatch[1]);
      payment = db.payments.find((p) => p.id_pembayaran === paymentId) || null;
      ord = payment ? db.orders.find((o) => o.id_pesanan === payment.id_pesanan) : null;
    }
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const isVendorOwner = Boolean(vendorTenant && ord.id_tenant === vendorTenant.id_tenant);
    const isCustomerOwner = ord.id_user === user.id_user && ALLOW_PAYMENT_SIMULATION;

    if (!isAdmin && !isVendorOwner && !isCustomerOwner) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk memverifikasi pembayaran pesanan ini.",
      });
    }
    if (ord.status_pesanan === "Dibatalkan" || ord.status_pesanan === "Selesai") {
      return sendJson(req, res, 422, {
        success: false,
        message: `Pesanan berstatus '${ord.status_pesanan}' tidak dapat diverifikasi.`,
      });
    }
    const body = await parseBody(req);
    const nextStatusVerif = body.status_verifikasi || "Terverifikasi";
    const allowedVerif = ["Menunggu", "Terverifikasi", "Gagal", "Kedaluwarsa"];
    if (!allowedVerif.includes(nextStatusVerif)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Status verifikasi pembayaran tidak valid.",
      });
    }
    if (!payment) {
      const nextPaymentId =
        Math.max(0, ...db.payments.map((p) => Number(p.id_pembayaran) || 0)) + 1;
      payment = {
        id_pembayaran: nextPaymentId,
        id_pesanan: ord.id_pesanan,
        metode_pembayaran: "QRIS",
        kode_qris: `QRIS-LO-${ord.nomor_antrean}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        total_bayar: Number(ord.total_harga || 0),
        status_verifikasi: nextStatusVerif,
        batas_waktu: formatDbTimestamp(new Date(Date.now() + 15 * 60_000)),
        dibuat_pada: formatDbTimestamp(),
      };
      db.payments.push(payment);
    } else {
      payment.status_verifikasi = nextStatusVerif;
      payment.diverifikasi_pada = formatDbTimestamp();
    }

    if (nextStatusVerif === "Terverifikasi") {
      ord.status_pesanan = "Sedang Diproses";
      ord.status_history = ord.status_history || [];
      ord.status_history.push({
        status: "Sedang Diproses",
        waktu: formatDbTimestamp(),
        oleh: user.nama || user.username,
      });
      pushNotification(
        ord.id_user,
        ord.id_pesanan,
        `Pembayaran pesanan ${ord.nomor_antrean} terverifikasi! Dapur sedang menyiapkan makanan Anda.`
      );
      const orderTenant = db.tenants.find((t) => t.id_tenant === ord.id_tenant);
      if (orderTenant?.id_user && orderTenant.id_user !== ord.id_user) {
        pushNotification(
          orderTenant.id_user,
          ord.id_pesanan,
          `Pembayaran pesanan ${ord.nomor_antrean} lunas! Segera siapkan pesanan.`
        );
      }
    } else if (nextStatusVerif === "Gagal" || nextStatusVerif === "Kedaluwarsa") {
      pushNotification(
        ord.id_user,
        ord.id_pesanan,
        `Verifikasi pembayaran pesanan ${ord.nomor_antrean} berstatus '${nextStatusVerif}'. Silakan coba kembali.`
      );
    }

    saveDb(db);
    logSecurityEvent("payment_verified", {
      id_pembayaran: payment.id_pembayaran,
      id_pesanan: ord.id_pesanan,
      actor_id: user.id_user,
      actor_role: user.peran,
      status_verifikasi: nextStatusVerif,
    });
    return sendJson(req, res, 200, {
      success: true,
      message: "Pembayaran berhasil diverifikasi.",
      data: enrichOrder(ord),
    });
  }

  const orderStatusMatch = pathname.match(/^\/(?:vendor\/)?orders\/(\d+)\/status$/);
  if (orderStatusMatch && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const orderId = Number(orderStatusMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    if (!isAdmin && (!vendorTenant || ord.id_tenant !== vendorTenant.id_tenant)) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses terhadap pesanan milik tenant lain.",
      });
    }
    const body = await parseBody(req);
    if (!VALID_ORDER_STATUSES.includes(body.status_pesanan)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Status pesanan tidak valid.",
      });
    }
    if (
      (ord.status_pesanan === "Selesai" || ord.status_pesanan === "Dibatalkan") &&
      ord.status_pesanan !== body.status_pesanan
    ) {
      return sendJson(req, res, 422, {
        success: false,
        message: `Pesanan berstatus '${ord.status_pesanan}' tidak dapat diubah lagi.`,
      });
    }
    ord.status_pesanan = body.status_pesanan;
    ord.status_history = ord.status_history || [];
    ord.status_history.push({
      status: body.status_pesanan,
      waktu: formatDbTimestamp(),
      oleh: user.nama || user.username,
    });
    if ((body.status_pesanan === "Siap Diambil" || body.status_pesanan === "Selesai") && !ord.sales_counted) {
      for (const item of ord.details || []) {
        const m = db.menus.find((x) => x.id_menu === item.id_menu);
        if (m) m.sold_today = (m.sold_today || 0) + (item.jumlah || 1);
      }
      ord.sales_counted = true;
    }
    pushNotification(
      ord.id_user,
      ord.id_pesanan,
      `Status pesanan ${ord.nomor_antrean} diperbarui menjadi: ${body.status_pesanan}.`
    );
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Status pesanan berhasil diperbarui.",
      data: enrichOrder(ord),
    });
  }

  const orderCancelMatch = pathname.match(/^\/(?:vendor\/)?orders\/(\d+)\/cancel$/);
  if (orderCancelMatch && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderCancelMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    const vendorTenant = db.tenants.find((t) => t.id_user === user.id_user);
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const isVendorOwner = Boolean(vendorTenant && ord.id_tenant === vendorTenant.id_tenant);
    const isCustomerOwner = ord.id_user === user.id_user;

    if (!isAdmin && !isVendorOwner && !isCustomerOwner) {
      return sendJson(req, res, 403, {
        success: false,
        message: "Anda tidak memiliki hak akses untuk membatalkan pesanan ini.",
      });
    }
    if (ord.status_pesanan === "Selesai" || ord.status_pesanan === "Dibatalkan") {
      return sendJson(req, res, 422, {
        success: false,
        message: `Pesanan berstatus '${ord.status_pesanan}' tidak dapat dibatalkan.`,
      });
    }
    if (isCustomerOwner && !isVendorOwner && !isAdmin && ord.status_pesanan === "Siap Diambil") {
      return sendJson(req, res, 422, {
        success: false,
        message: "Pesanan sudah siap diambil dan tidak dapat dibatalkan oleh pelanggan.",
      });
    }

    const body = await parseBody(req);
    const reason = String(body.alasan || body.reason || "").trim().slice(0, 300);
    const actorRole = isVendorOwner ? "Tenant" : isAdmin ? "Admin" : "Pelanggan";
    ord.status_pesanan = "Dibatalkan";
    ord.alasan_batal = reason || `Dibatalkan oleh ${actorRole}`;
    ord.status_history = ord.status_history || [];
    ord.status_history.push({
      status: "Dibatalkan",
      waktu: formatDbTimestamp(),
      oleh: user.nama || user.username,
      catatan: ord.alasan_batal,
    });

    const reasonSuffix = reason ? ` Alasan: ${reason}` : "";
    pushNotification(
      ord.id_user,
      ord.id_pesanan,
      `Pesanan ${ord.nomor_antrean} dibatalkan (${actorRole}).${reasonSuffix}`
    );
    const orderTenant = db.tenants.find((t) => t.id_tenant === ord.id_tenant);
    if (orderTenant?.id_user && orderTenant.id_user !== user.id_user) {
      pushNotification(
        orderTenant.id_user,
        ord.id_pesanan,
        `Pesanan ${ord.nomor_antrean} dibatalkan oleh ${actorRole}.${reasonSuffix}`
      );
    }

    saveDb(db);
    logSecurityEvent("order_cancelled", {
      id_pesanan: ord.id_pesanan,
      actor_id: user.id_user,
      actor_role: user.peran,
    });
    return sendJson(req, res, 200, {
      success: true,
      message: "Pesanan berhasil dibatalkan.",
      data: enrichOrder(ord),
    });
  }

  const orderReviewMatch = pathname.match(/^\/orders\/(\d+)\/reviews$/);
  if (orderReviewMatch && method === "POST") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Customer")) return;
    const orderId = Number(orderReviewMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
    if (!ord) {
      return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
    }
    if (ord.id_user !== user.id_user) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    if (ord.status_pesanan !== "Selesai") {
      return sendJson(req, res, 422, {
        success: false,
        message: "Rating & ulasan hanya dapat diberikan setelah pesanan selesai.",
      });
    }
    const body = await parseBody(req);
    const ratingVal = Math.max(1, Math.min(5, Math.round(Number(body.rating || 5))));
    const komentar = String(body.komentar || body.comment || "").trim().slice(0, 500);
    const targetMenus = body.id_menu
      ? [Number(body.id_menu)]
      : Array.from(new Set((ord.details || []).map((d) => Number(d.id_menu))));

    const existing = (db.reviews || []).some((r) => Number(r.id_pesanan) === orderId);
    if (existing) {
      return sendJson(req, res, 409, {
        success: false,
        message: "Pesanan ini sudah diberi ulasan sebelumnya.",
      });
    }

    const createdReviews = [];
    for (const mid of targetMenus) {
      const nextReviewId =
        Math.max(0, ...(db.reviews || []).map((r) => Number(r.id_review) || 0)) + 1;
      const itemInfo = (ord.details || []).find((d) => Number(d.id_menu) === mid);
      const rev = {
        id_review: nextReviewId,
        id_pesanan: orderId,
        id_user: user.id_user,
        id_tenant: ord.id_tenant,
        id_menu: mid,
        nama_menu: itemInfo?.nama_menu || "Menu",
        reviewer_name: user.nama || user.username,
        rating: ratingVal,
        komentar,
        dibuat_pada: formatDbTimestamp(),
      };
      db.reviews.push(rev);
      createdReviews.push(rev);
    }

    const orderTenant = db.tenants.find((t) => t.id_tenant === ord.id_tenant);
    if (orderTenant?.id_user) {
      pushNotification(
        orderTenant.id_user,
        orderId,
        `${user.nama || user.username} memberi rating ${ratingVal}/5 untuk pesanan ${ord.nomor_antrean}.`
      );
    }

    saveDb(db);
    return sendJson(req, res, 201, {
      success: true,
      message: "Terima kasih atas rating & ulasan Anda.",
      data: createdReviews,
    });
  }
}