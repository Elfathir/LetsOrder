// Route Admin — dipindah verbatim dari backend/server.mjs (baris 3412-4234).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { SERVER_PROMOS } from "../config.mjs";
import { hashPassword } from "../lib/crypto.mjs";
import { isSafeImageInput, isValidEmail, parseBody, sendJson } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { formatDbTimestamp, isOrderPaid } from "../lib/enrich.mjs";
import { requireAuth, requireRole } from "../lib/auth.mjs";
export async function handleAdminRoutes({ req, res, pathname, method, urlObj }) {
  if (pathname.startsWith("/admin/")) {
    const adminUser = requireAuth(req, res);
    if (!adminUser) return;
    if (!requireRole(req, res, adminUser, "Administrator")) return;

    const qs = urlObj.searchParams;
    const nowMs = Date.now();
    const parseStamp = (value) => {
      const parsed = new Date(String(value || "").replace(" ", "T"));
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    };
    const page = Math.max(1, Number(qs.get("page") || 1) || 1);
    const perPage = Math.min(100, Math.max(5, Number(qs.get("per_page") || 20) || 20));
    const paginate = (list) => {
      const total = list.length;
      const pages = Math.max(1, Math.ceil(total / perPage));
      const start = (page - 1) * perPage;
      return {
        items: list.slice(start, start + perPage),
        meta: { total, page, per_page: perPage, pages },
      };
    };
    const findTenant = (id) => db.tenants.find((t) => Number(t.id_tenant) === Number(id)) || null;
    const findUserById = (id) => db.users.find((u) => Number(u.id_user) === Number(id)) || null;
    const findLatestPayment = (idPesanan) =>
      (db.payments || [])
        .filter((p) => Number(p.id_pesanan) === Number(idPesanan))
        .sort((a, b) => Number(b.id_pembayaran) - Number(a.id_pembayaran))[0] || null;

    const adminOrderPayload = (order) => {
      const tenant = findTenant(order.id_tenant);
      const customer = findUserById(order.id_user);
      const payment = findLatestPayment(order.id_pesanan);
      const items = (order.details || []).map((detail) => {
        const menu = db.menus.find((m) => Number(m.id_menu) === Number(detail.id_menu)) || null;
        return {
          id_menu: detail.id_menu,
          nama_menu: detail.nama_menu || menu?.nama_menu || "Menu",
          jumlah: Number(detail.jumlah || 0),
          harga: Number(detail.harga || menu?.harga || 0),
          subtotal: Number(detail.subtotal || 0),
          catatan: detail.catatan || "",
          gambar: detail.gambar || menu?.gambar || "",
        };
      });
      return {
        id_pesanan: order.id_pesanan,
        nomor_antrean: order.nomor_antrean,
        status_pesanan: order.status_pesanan,
        total_harga: Number(order.total_harga || 0),
        promo_code: order.promo_code || null,
        catatan: order.catatan || "",
        waktu_pesan: order.waktu_pesan,
        is_paid: isOrderPaid(order, payment),
        tenant: tenant
          ? {
              id_tenant: tenant.id_tenant,
              nama_tenant: tenant.nama_tenant,
              booth: tenant.booth || "",
              logo: tenant.logo || "",
              status_buka: Boolean(tenant.status_buka),
            }
          : null,
        customer: customer
          ? {
              id_user: customer.id_user,
              nama: customer.nama,
              username: customer.username,
              email: customer.email,
            }
          : null,
        items,
        payment: payment
          ? {
              id_pembayaran: payment.id_pembayaran,
              metode_pembayaran: payment.metode_pembayaran,
              kode_qris: payment.kode_qris || "",
              total_bayar: Number(payment.total_bayar || 0),
              status_verifikasi: payment.status_verifikasi,
              batas_waktu: payment.batas_waktu || null,
              waktu_bayar: payment.waktu_bayar || null,
            }
          : null,
        status_history:
          Array.isArray(order.status_history) && order.status_history.length > 0
            ? order.status_history
            : [{ status: order.status_pesanan, waktu: order.waktu_pesan }],
      };
    };

    // GET /admin/stats/overview?days=7
    if (pathname === "/admin/stats/overview" && method === "GET") {
      const days = Math.min(30, Math.max(1, Number(qs.get("days") || 7) || 7));
      const todayPrefix = formatDbTimestamp().slice(0, 10);
      const paidStatuses = ["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"];

      const dayKeys = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }

      const series = dayKeys.map((key) => {
        const dayOrders = db.orders.filter((o) => String(o.waktu_pesan || "").startsWith(key));
        const revenue = dayOrders
          .filter((o) => o.status_pesanan !== "Dibatalkan" && isOrderPaid(o))
          .reduce((sum, o) => sum + Number(o.total_harga || 0), 0);
        return { date: key, orders: dayOrders.length, revenue };
      });

      const ordersToday = db.orders.filter((o) => String(o.waktu_pesan || "").startsWith(todayPrefix));
      const revenueToday = ordersToday
        .filter((o) => o.status_pesanan !== "Dibatalkan" && isOrderPaid(o))
        .reduce((sum, o) => sum + Number(o.total_harga || 0), 0);
      const expiredPayments = (db.payments || []).filter(
        (p) =>
          p.status_verifikasi === "Kedaluwarsa" ||
          (p.status_verifikasi === "Menunggu" && parseStamp(p.batas_waktu) && parseStamp(p.batas_waktu).getTime() < nowMs)
      );
      const staleUnpaid = db.orders.filter((o) => {
        if (o.status_pesanan !== "Menunggu Pembayaran") return false;
        const created = parseStamp(o.waktu_pesan);
        return created ? nowMs - created.getTime() > 15 * 60 * 1000 : false;
      });
      const closedTenants = db.tenants.filter((t) => !t.status_buka);
      const emptyTenants = db.tenants.filter(
        (t) => !db.menus.some((m) => Number(m.id_tenant) === Number(t.id_tenant))
      );

      const revenueByTenant = new Map();
      const revenueByMenu = new Map();
      dayKeys.forEach((key) => {
        db.orders
          .filter((o) => String(o.waktu_pesan || "").startsWith(key) && o.status_pesanan !== "Dibatalkan")
          .forEach((order) => {
            const tenantId = Number(order.id_tenant);
            const current = revenueByTenant.get(tenantId) || { orders: 0, revenue: 0 };
            current.orders += 1;
            if (isOrderPaid(order)) current.revenue += Number(order.total_harga || 0);
            revenueByTenant.set(tenantId, current);
            (order.details || []).forEach((detail) => {
              const menuId = Number(detail.id_menu);
              const entry = revenueByMenu.get(menuId) || {
                id_menu: menuId,
                nama_menu: detail.nama_menu || "Menu",
                qty: 0,
                revenue: 0,
                id_tenant: tenantId,
              };
              entry.qty += Number(detail.jumlah || 0);
              entry.revenue += Number(detail.subtotal || 0);
              revenueByMenu.set(menuId, entry);
            });
          });
      });

      const topTenants = [...revenueByTenant.entries()]
        .map(([idTenant, value]) => {
          const tenant = findTenant(idTenant);
          return {
            id_tenant: idTenant,
            nama_tenant: tenant?.nama_tenant || "Tenant",
            booth: tenant?.booth || "",
            orders: value.orders,
            revenue: value.revenue,
          };
        })
        .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders)
        .slice(0, 5);

      const topMenus = [...revenueByMenu.values()]
        .map((entry) => ({
          ...entry,
          tenant_name: findTenant(entry.id_tenant)?.nama_tenant || "Tenant",
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      const recentOrders = [...db.orders]
        .sort((a, b) => Number(b.id_pesanan) - Number(a.id_pesanan))
        .slice(0, 6)
        .map((order) => ({
          id_pesanan: order.id_pesanan,
          nomor_antrean: order.nomor_antrean,
          status_pesanan: order.status_pesanan,
          total_harga: Number(order.total_harga || 0),
          waktu_pesan: order.waktu_pesan,
          tenant_name: findTenant(order.id_tenant)?.nama_tenant || "Tenant",
          customer_name: findUserById(order.id_user)?.nama || "Pengguna",
        }));

      return sendJson(req, res, 200, {
        success: true,
        message: "Statistik admin berhasil diambil.",
        data: {
          today: {
            orders: ordersToday.length,
            revenue: revenueToday,
            awaiting_payment: db.orders.filter((o) => o.status_pesanan === "Menunggu Pembayaran").length,
            expired_payments: expiredPayments.length,
            open_tenants: db.tenants.filter((t) => t.status_buka).length,
            total_tenants: db.tenants.length,
            customers: db.users.filter((u) => u.peran === "Customer").length,
            vendors: db.users.filter((u) => u.peran === "Vendor").length,
          },
          totals: {
            orders: db.orders.length,
            revenue: db.orders
              .filter((o) => o.status_pesanan !== "Dibatalkan" && isOrderPaid(o))
              .reduce((sum, o) => sum + Number(o.total_harga || 0), 0),
            users: db.users.length,
            tenants: db.tenants.length,
            menus: db.menus.length,
          },
          series,
          top_tenants: topTenants,
          top_menus: topMenus,
          recent_orders: recentOrders,
          alerts: {
            stale_unpaid: staleUnpaid.length,
            expired_payments: expiredPayments.length,
            closed_tenants: closedTenants.length,
            empty_tenants: emptyTenants.length,
          },
        },
      });
    }

    // GET /admin/orders
    if (pathname === "/admin/orders" && method === "GET") {
      const status = String(qs.get("status") || "");
      const idTenant = Number(qs.get("id_tenant") || 0);
      const from = String(qs.get("from") || "");
      const to = String(qs.get("to") || "");
      const keyword = String(qs.get("q") || "").trim().toLowerCase();

      let list = [...db.orders];
      if (status && status !== "All") list = list.filter((o) => o.status_pesanan === status);
      if (idTenant) list = list.filter((o) => Number(o.id_tenant) === idTenant);
      if (from) list = list.filter((o) => String(o.waktu_pesan || "").slice(0, 10) >= from);
      if (to) list = list.filter((o) => String(o.waktu_pesan || "").slice(0, 10) <= to);
      if (keyword) {
        list = list.filter((order) => {
          const tenantName = findTenant(order.id_tenant)?.nama_tenant || "";
          const customer = findUserById(order.id_user);
          const haystack = [order.nomor_antrean, tenantName, customer?.nama, customer?.username, customer?.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(keyword);
        });
      }
      list.sort((a, b) => Number(b.id_pesanan) - Number(a.id_pesanan));

      const { items, meta } = paginate(list);
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar pesanan admin berhasil diambil.",
        data: items.map(adminOrderPayload),
        meta,
      });
    }

    const adminOrderMatch = pathname.match(/^\/admin\/orders\/(\d+)$/);
    if (adminOrderMatch && method === "GET") {
      const order = db.orders.find((o) => Number(o.id_pesanan) === Number(adminOrderMatch[1]));
      if (!order) {
        return sendJson(req, res, 404, { success: false, message: "Pesanan tidak ditemukan." });
      }
      return sendJson(req, res, 200, {
        success: true,
        message: "Detail pesanan berhasil diambil.",
        data: adminOrderPayload(order),
      });
    }

    // GET /admin/payments
    if (pathname === "/admin/payments" && method === "GET") {
      const status = String(qs.get("status") || "");
      const from = String(qs.get("from") || "");
      const to = String(qs.get("to") || "");
      const keyword = String(qs.get("q") || "").trim().toLowerCase();

      let list = [...(db.payments || [])];
      if (status && status !== "All") list = list.filter((p) => p.status_verifikasi === status);
      if (from) list = list.filter((p) => String(p.batas_waktu || "").slice(0, 10) >= from);
      if (to) list = list.filter((p) => String(p.batas_waktu || "").slice(0, 10) <= to);
      if (keyword) {
        list = list.filter((payment) => {
          const order = db.orders.find((o) => Number(o.id_pesanan) === Number(payment.id_pesanan));
          const haystack = [
            payment.kode_qris,
            payment.metode_pembayaran,
            order?.nomor_antrean,
            findTenant(order?.id_tenant)?.nama_tenant,
            findUserById(order?.id_user)?.nama,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(keyword);
        });
      }
      list.sort((a, b) => Number(b.id_pembayaran) - Number(a.id_pembayaran));

      const { items, meta } = paginate(list);
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar pembayaran berhasil diambil.",
        data: items.map((payment) => {
          const order = db.orders.find((o) => Number(o.id_pesanan) === Number(payment.id_pesanan)) || null;
          const limit = parseStamp(payment.batas_waktu);
          return {
            id_pembayaran: payment.id_pembayaran,
            id_pesanan: payment.id_pesanan,
            nomor_antrean: order?.nomor_antrean || "-",
            metode_pembayaran: payment.metode_pembayaran,
            kode_qris: payment.kode_qris || "",
            total_bayar: Number(payment.total_bayar || 0),
            status_verifikasi: payment.status_verifikasi,
            batas_waktu: payment.batas_waktu || null,
            waktu_bayar: payment.waktu_bayar || null,
            order_status: order?.status_pesanan || null,
            tenant_name: findTenant(order?.id_tenant)?.nama_tenant || "-",
            customer_name: findUserById(order?.id_user)?.nama || "-",
            is_expired: Boolean(
              payment.status_verifikasi === "Kedaluwarsa" ||
                (payment.status_verifikasi === "Menunggu" && limit && limit.getTime() < nowMs)
            ),
          };
        }),
        meta,
      });
    }

    // ---- Kupon (promo) ----
    const adminPromoPayload = (promo) => {
      const tenant = promo.id_tenant ? findTenant(promo.id_tenant) : null;
      const usageCount = (db.orders || []).filter(
        (order) =>
          String(order.promo_code || "").toUpperCase() ===
            String(promo.kode_promo || "").toUpperCase() &&
          order.status_pesanan !== "Dibatalkan"
      ).length;
      return {
        ...promo,
        id_tenant: promo.id_tenant ?? null,
        tenant_name: tenant ? tenant.nama_tenant : "Semua tenant",
        usage_count: usageCount,
        batas_per_user: Number(promo.batas_per_user ?? 1),
      };
    };

    const parsePromoPayload = (body, promoCodeToIgnore = "") => {
      const kodePromo = String(body.kode_promo || body.code || "")
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, "")
        .slice(0, 24);
      const judul = String(body.judul || body.title || "").trim().slice(0, 100);
      const tipe = body.tipe === "percentage" ? "percentage" : "fixed";
      const diskon = Math.max(1, Math.floor(Number(body.diskon || body.discount || 0)));
      const minimalBelanja = Math.max(0, Math.floor(Number(body.minimal_belanja ?? body.minSpend ?? 0)));
      const batasPerUser =
        body.batas_per_user !== undefined && body.batas_per_user !== ""
          ? Math.max(0, Math.min(1000, Math.floor(Number(body.batas_per_user))))
          : 1;
      const idTenantRaw = body.id_tenant;
      const idTenant =
        idTenantRaw === null || idTenantRaw === undefined || idTenantRaw === "" || idTenantRaw === "all"
          ? null
          : Number(idTenantRaw);

      if (!kodePromo || kodePromo.length < 3 || !judul || diskon <= 0) {
        return { error: "Kode kupon (min. 3 karakter), judul, dan nominal diskon wajib diisi." };
      }
      if (tipe === "percentage" && diskon > 90) {
        return { error: "Diskon persentase maksimal 90%." };
      }
      if (idTenant !== null) {
        if (!Number.isFinite(idTenant) || !findTenant(idTenant)) {
          return { error: "Tenant untuk kupon ini tidak ditemukan." };
        }
      }
      const duplicate =
        SERVER_PROMOS[kodePromo] ||
        (db.promos || []).some(
          (p) =>
            String(p.kode_promo || "").toUpperCase() === kodePromo &&
            String(p.kode_promo || "").toUpperCase() !== String(promoCodeToIgnore).toUpperCase()
        );
      if (duplicate) {
        return { error: `Kode kupon '${kodePromo}' sudah digunakan.` };
      }

      return {
        promo: {
          kode_promo: kodePromo,
          judul,
          tipe,
          diskon,
          minimal_belanja: minimalBelanja,
          batas_per_user: batasPerUser,
          id_tenant: idTenant,
          aktif: body.aktif !== undefined ? Boolean(body.aktif) : true,
        },
      };
    };

    if (pathname === "/admin/promos" && method === "GET") {
      const status = String(qs.get("status") || "");
      const keyword = String(qs.get("q") || "").trim().toLowerCase();
      let list = [...(db.promos || [])];
      if (status === "aktif") list = list.filter((p) => p.aktif !== false);
      if (status === "nonaktif") list = list.filter((p) => p.aktif === false);
      if (keyword) {
        list = list.filter((promo) => {
          const tenant = promo.id_tenant ? findTenant(promo.id_tenant) : null;
          return [promo.kode_promo, promo.judul, tenant?.nama_tenant]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword);
        });
      }
      list.sort((a, b) => Number(b.id_promo) - Number(a.id_promo));
      const { items, meta } = paginate(list);
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar kupon berhasil diambil.",
        data: items.map(adminPromoPayload),
        meta,
      });
    }

    if (pathname === "/admin/promos" && method === "POST") {
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }
      const parsed = parsePromoPayload(body);
      if (parsed.error) {
        return sendJson(req, res, 422, { success: false, message: parsed.error });
      }
      const nextPromoId = Math.max(0, ...(db.promos || []).map((p) => Number(p.id_promo) || 0)) + 1;
      const newPromo = { id_promo: nextPromoId, ...parsed.promo };
      db.promos = Array.isArray(db.promos) ? db.promos : [];
      db.promos.unshift(newPromo);
      saveDb(db);
      return sendJson(req, res, 201, {
        success: true,
        message: "Kupon berhasil dibuat.",
        data: adminPromoPayload(newPromo),
      });
    }

    const adminPromoMatch = pathname.match(/^\/admin\/promos\/(\d+)$/);
    if (adminPromoMatch && (method === "PATCH" || method === "PUT")) {
      const promo = (db.promos || []).find((p) => Number(p.id_promo) === Number(adminPromoMatch[1]));
      if (!promo) {
        return sendJson(req, res, 404, { success: false, message: "Kupon tidak ditemukan." });
      }
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }
      if (body.aktif !== undefined && Object.keys(body).length === 1) {
        promo.aktif = Boolean(body.aktif);
        saveDb(db);
        return sendJson(req, res, 200, {
          success: true,
          message: "Status kupon berhasil diperbarui.",
          data: adminPromoPayload(promo),
        });
      }
      const parsed = parsePromoPayload(
        {
          kode_promo: body.kode_promo ?? promo.kode_promo,
          judul: body.judul ?? promo.judul,
          tipe: body.tipe ?? promo.tipe,
          diskon: body.diskon ?? promo.diskon,
          minimal_belanja: body.minimal_belanja ?? promo.minimal_belanja,
          batas_per_user: body.batas_per_user ?? promo.batas_per_user,
          id_tenant: body.id_tenant !== undefined ? body.id_tenant : promo.id_tenant,
          aktif: body.aktif !== undefined ? body.aktif : promo.aktif,
        },
        promo.kode_promo
      );
      if (parsed.error) {
        return sendJson(req, res, 422, { success: false, message: parsed.error });
      }
      Object.assign(promo, parsed.promo);
      saveDb(db);
      return sendJson(req, res, 200, {
        success: true,
        message: "Kupon berhasil diperbarui.",
        data: adminPromoPayload(promo),
      });
    }

    if (adminPromoMatch && method === "DELETE") {
      const index = (db.promos || []).findIndex(
        (p) => Number(p.id_promo) === Number(adminPromoMatch[1])
      );
      if (index === -1) {
        return sendJson(req, res, 404, { success: false, message: "Kupon tidak ditemukan." });
      }
      db.promos.splice(index, 1);
      saveDb(db);
      return sendJson(req, res, 200, { success: true, message: "Kupon dihapus." });
    }

    // ---- Banner halaman utama ----
    const parseBannerPayload = (body, existing = null) => {
      // Foto hasil unggahan dikirim sebagai data URL base64 (pola sama dengan avatar
      // dan gambar menu), jadi tidak boleh dipotong seperti URL biasa.
      const rawImage = String(body.gambar ?? existing?.gambar ?? "").trim();
      const isUploadedImage = /^data:image\//i.test(rawImage);
      const source = {
        tag: body.tag ?? existing?.tag ?? "",
        judul: String(body.judul ?? existing?.judul ?? "").trim().slice(0, 140),
        deskripsi: String(body.deskripsi ?? existing?.deskripsi ?? "").trim().slice(0, 400),
        gambar: isUploadedImage ? rawImage : rawImage.slice(0, 600),
        cta_primary: String(body.cta_primary ?? existing?.cta_primary ?? "").trim().slice(0, 40),
        cta_secondary: String(body.cta_secondary ?? existing?.cta_secondary ?? "").trim().slice(0, 40),
        tag_en: String(body.tag_en ?? existing?.tag_en ?? "").trim().slice(0, 60),
        judul_en: String(body.judul_en ?? existing?.judul_en ?? "").trim().slice(0, 140),
        deskripsi_en: String(body.deskripsi_en ?? existing?.deskripsi_en ?? "")
          .trim()
          .slice(0, 400),
        cta_primary_en: String(body.cta_primary_en ?? existing?.cta_primary_en ?? "")
          .trim()
          .slice(0, 40),
        cta_secondary_en: String(body.cta_secondary_en ?? existing?.cta_secondary_en ?? "")
          .trim()
          .slice(0, 40),
        aktif: body.aktif !== undefined ? Boolean(body.aktif) : existing?.aktif !== false,
        urutan: Math.max(
          0,
          Math.floor(Number(body.urutan ?? existing?.urutan ?? 0) || 0)
        ),
      };
      if (source.judul.length < 2) return { error: "Judul banner minimal 2 karakter." };
      if (!source.gambar) return { error: "Foto banner wajib diunggah atau diisi URL-nya." };
      if (!isSafeImageInput(source.gambar)) {
        return {
          error:
            "Foto banner harus berupa file JPG/PNG/WEBP/GIF (maks. 5 MB) atau URL http(s):// yang valid.",
        };
      }
      return { banner: source };
    };

    if (pathname === "/admin/banners" && method === "GET") {
      const list = [...(db.banners || [])].sort(
        (a, b) =>
          (Number(a.urutan) || 0) - (Number(b.urutan) || 0) ||
          Number(a.id_banner) - Number(b.id_banner)
      );
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar banner berhasil diambil.",
        data: list,
      });
    }

    if (pathname === "/admin/banners" && method === "POST") {
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }
      const parsed = parseBannerPayload(body);
      if (parsed.error) {
        return sendJson(req, res, 422, { success: false, message: parsed.error });
      }
      const nextBannerId = Math.max(0, ...(db.banners || []).map((b) => Number(b.id_banner) || 0)) + 1;
      const newBanner = { id_banner: nextBannerId, ...parsed.banner };
      db.banners = Array.isArray(db.banners) ? db.banners : [];
      db.banners.push(newBanner);
      saveDb(db);
      return sendJson(req, res, 201, {
        success: true,
        message: "Banner berhasil dibuat.",
        data: newBanner,
      });
    }

    const adminBannerMatch = pathname.match(/^\/admin\/banners\/(\d+)$/);
    if (adminBannerMatch && (method === "PATCH" || method === "PUT")) {
      const banner = (db.banners || []).find(
        (b) => Number(b.id_banner) === Number(adminBannerMatch[1])
      );
      if (!banner) {
        return sendJson(req, res, 404, { success: false, message: "Banner tidak ditemukan." });
      }
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }
      if (body.aktif !== undefined && Object.keys(body).length === 1) {
        banner.aktif = Boolean(body.aktif);
        saveDb(db);
        return sendJson(req, res, 200, {
          success: true,
          message: "Status banner berhasil diperbarui.",
          data: banner,
        });
      }
      const parsed = parseBannerPayload(body, banner);
      if (parsed.error) {
        return sendJson(req, res, 422, { success: false, message: parsed.error });
      }
      Object.assign(banner, parsed.banner);
      saveDb(db);
      return sendJson(req, res, 200, {
        success: true,
        message: "Banner berhasil diperbarui.",
        data: banner,
      });
    }

    if (adminBannerMatch && method === "DELETE") {
      const index = (db.banners || []).findIndex(
        (b) => Number(b.id_banner) === Number(adminBannerMatch[1])
      );
      if (index === -1) {
        return sendJson(req, res, 404, { success: false, message: "Banner tidak ditemukan." });
      }
      db.banners.splice(index, 1);
      saveDb(db);
      return sendJson(req, res, 200, { success: true, message: "Banner dihapus." });
    }

    // GET /admin/users
    if (pathname === "/admin/users" && method === "GET") {
      const peran = String(qs.get("peran") || "");
      const keyword = String(qs.get("search") || qs.get("q") || "").trim().toLowerCase();

      let list = [...db.users];
      if (peran && peran !== "All") list = list.filter((u) => u.peran === peran);
      if (keyword) {
        list = list.filter((u) =>
          [u.username, u.nama, u.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword)
        );
      }
      list.sort((a, b) => Number(a.id_user) - Number(b.id_user));

      const { items, meta } = paginate(list);
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar pengguna berhasil diambil.",
        data: items.map((user) => {
          const tenants = db.tenants.filter((t) => Number(t.id_user) === Number(user.id_user));
          return {
            id_user: user.id_user,
            username: user.username,
            nama: user.nama,
            email: user.email,
            peran: user.peran,
            avatar: user.avatar || "",
            tenant_count: tenants.length,
            tenant_names: tenants.map((t) => t.nama_tenant),
            order_count: db.orders.filter((o) => Number(o.id_user) === Number(user.id_user)).length,
          };
        }),
        meta,
      });
    }

    // PATCH /admin/users/:id
    const adminUserMatch = pathname.match(/^\/admin\/users\/(\d+)$/);
    if (adminUserMatch && (method === "PUT" || method === "PATCH")) {
      const target = findUserById(adminUserMatch[1]);
      if (!target) {
        return sendJson(req, res, 404, { success: false, message: "Pengguna tidak ditemukan." });
      }
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }

      if (body.username !== undefined) {
        const username = String(body.username || "").trim();
        if (!/^[a-z0-9._-]{3,50}$/i.test(username)) {
          return sendJson(req, res, 422, { success: false, message: "Username 3–50 karakter, hanya huruf, angka, titik, garis bawah, atau strip." });
        }
        if (db.users.some((u) => u.id_user !== target.id_user && String(u.username).toLowerCase() === username.toLowerCase())) {
          return sendJson(req, res, 422, { success: false, message: "Username sudah digunakan pengguna lain." });
        }
        target.username = username;
      }
      if (body.email !== undefined) {
        const email = String(body.email || "").trim().toLowerCase();
        if (!isValidEmail(email)) {
          return sendJson(req, res, 422, { success: false, message: "Format email tidak valid." });
        }
        if (db.users.some((u) => u.id_user !== target.id_user && String(u.email).toLowerCase() === email)) {
          return sendJson(req, res, 422, { success: false, message: "Email sudah digunakan pengguna lain." });
        }
        target.email = email;
      }
      if (body.nama !== undefined) {
        const nama = String(body.nama || "").trim();
        if (nama.length < 2) {
          return sendJson(req, res, 422, { success: false, message: "Nama minimal 2 karakter." });
        }
        target.nama = nama;
      }
      if (body.peran !== undefined) {
        const peran = String(body.peran || "");
        if (!["Customer", "Vendor", "Administrator"].includes(peran)) {
          return sendJson(req, res, 422, { success: false, message: "Peran tidak valid." });
        }
        if (target.id_user === adminUser.id_user && peran !== "Administrator") {
          return sendJson(req, res, 422, { success: false, message: "Anda tidak dapat menurunkan peran akun Anda sendiri." });
        }
        target.peran = peran;
      }
      if (body.password !== undefined && String(body.password).length > 0) {
        const password = String(body.password);
        if (password.length < 8) {
          return sendJson(req, res, 422, { success: false, message: "Password minimal 8 karakter." });
        }
        target.password = hashPassword(password);
      }

      saveDb(db);
      return sendJson(req, res, 200, {
        success: true,
        message: "Data pengguna berhasil diperbarui.",
        data: {
          id_user: target.id_user,
          username: target.username,
          nama: target.nama,
          email: target.email,
          peran: target.peran,
        },
      });
    }

    // GET /admin/tenants
    if (pathname === "/admin/tenants" && method === "GET") {
      const statusBuka = String(qs.get("status_buka") || "");
      const keyword = String(qs.get("search") || qs.get("q") || "").trim().toLowerCase();

      let list = [...db.tenants];
      if (statusBuka === "1" || statusBuka === "true") list = list.filter((t) => Boolean(t.status_buka));
      if (statusBuka === "0" || statusBuka === "false") list = list.filter((t) => !t.status_buka);
      if (keyword) {
        list = list.filter((tenant) => {
          const owner = findUserById(tenant.id_user);
          return [tenant.nama_tenant, tenant.booth, owner?.nama, owner?.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(keyword);
        });
      }
      list.sort((a, b) => Number(a.id_tenant) - Number(b.id_tenant));

      const { items, meta } = paginate(list);
      return sendJson(req, res, 200, {
        success: true,
        message: "Daftar tenant berhasil diambil.",
        data: items.map((tenant) => {
          const owner = findUserById(tenant.id_user);
          return {
            id_tenant: tenant.id_tenant,
            id_user: tenant.id_user,
            nama_tenant: tenant.nama_tenant,
            deskripsi: tenant.deskripsi || "",
            booth: tenant.booth || "",
            logo: tenant.logo || "",
            status_buka: Boolean(tenant.status_buka),
            jam_buka: tenant.jam_buka || "07:00",
            jam_tutup: tenant.jam_tutup || "21:00",
            auto_schedule: Boolean(tenant.auto_schedule),
            owner_name: owner?.nama || "-",
            owner_email: owner?.email || "-",
            menu_count: db.menus.filter((m) => Number(m.id_tenant) === Number(tenant.id_tenant)).length,
            order_count: db.orders.filter((o) => Number(o.id_tenant) === Number(tenant.id_tenant)).length,
          };
        }),
        meta,
      });
    }

    // PATCH /admin/tenants/:id
    const adminTenantMatch = pathname.match(/^\/admin\/tenants\/(\d+)$/);
    if (adminTenantMatch && (method === "PUT" || method === "PATCH")) {
      const tenant = findTenant(adminTenantMatch[1]);
      if (!tenant) {
        return sendJson(req, res, 404, { success: false, message: "Tenant tidak ditemukan." });
      }
      const body = await parseBody(req);
      if (body.__tooLarge) {
        return sendJson(req, res, 413, { success: false, message: "Ukuran payload terlalu besar." });
      }

      if (body.nama_tenant !== undefined) {
        const namaTenant = String(body.nama_tenant || "").trim();
        if (namaTenant.length < 2 || namaTenant.length > 100) {
          return sendJson(req, res, 422, { success: false, message: "Nama tenant 2–100 karakter." });
        }
        tenant.nama_tenant = namaTenant;
      }
      if (body.deskripsi !== undefined) tenant.deskripsi = String(body.deskripsi || "").slice(0, 1000);
      if (body.booth !== undefined) tenant.booth = String(body.booth || "").slice(0, 60);
      if (body.status_buka !== undefined) tenant.status_buka = Boolean(body.status_buka);
      if (body.jam_buka !== undefined) tenant.jam_buka = String(body.jam_buka || "07:00").slice(0, 5);
      if (body.jam_tutup !== undefined) tenant.jam_tutup = String(body.jam_tutup || "21:00").slice(0, 5);
      if (body.auto_schedule !== undefined) tenant.auto_schedule = Boolean(body.auto_schedule);
      if (body.id_user !== undefined && body.id_user !== null && body.id_user !== "") {
        const owner = findUserById(body.id_user);
        if (!owner) {
          return sendJson(req, res, 422, { success: false, message: "Akun pemilik tenant tidak ditemukan." });
        }
        tenant.id_user = owner.id_user;
      }

      saveDb(db);
      return sendJson(req, res, 200, { success: true, message: "Data tenant berhasil diperbarui.", data: tenant });
    }

    return sendJson(req, res, 404, { success: false, message: "Endpoint admin tidak ditemukan." });
  }
}