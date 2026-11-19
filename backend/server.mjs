import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.LETSORDER_DB_PATH
  ? path.resolve(process.env.LETSORDER_DB_PATH)
  : path.join(__dirname, "storage", "app", "db.json");
const MAX_BODY_BYTES = 6 * 1024 * 1024; // 6 MB limit per request body
const SESSION_INACTIVITY_DAYS = Math.max(
  1,
  Number.parseInt(process.env.SESSION_INACTIVITY_DAYS || "5", 10) || 5
);
const TOKEN_INACTIVITY_TTL_MS = SESSION_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;
const TOKEN_TOUCH_DEBOUNCE_MS = 5 * 60 * 1000;

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore .env read errors
  }
}

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, "..", "frontend", ".env"));

const DEFAULT_FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
const ALLOWED_ORIGINS = new Set([
  DEFAULT_FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// Ephemeral HMAC key fallback when APP_KEY is unset; keeps OAuth state verifiable in-memory
const STATE_SECRET = process.env.APP_KEY || crypto.randomBytes(32).toString("hex");
const ALLOW_PAYMENT_SIMULATION =
  process.env.NODE_ENV !== "production" ||
  String(process.env.PAYMENT_SIMULATION_ENABLED || "").toLowerCase() === "true";

const VALID_ORDER_STATUSES = [
  "Menunggu Pembayaran",
  "Sedang Diproses",
  "Diproses",
  "Siap Diambil",
  "Selesai",
  "Dibatalkan",
];

const SERVER_PROMOS = {
  COMBO3K: { discount: 3000, minSpend: 20000, type: "fixed" },
  STUDENT10: { discount: 0.1, minSpend: 25000, type: "percentage" },
  HEMAT5K: { discount: 5000, minSpend: 30000, type: "fixed" },
  EARLYBIRD: { discount: 0.15, minSpend: 15000, type: "percentage" },
};

const googleAuthCodes = new Map();
const rateLimitBuckets = new Map();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== "string") return false;
  if (!stored.startsWith("scrypt:")) return false;
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [, salt, expectedHex] = parts;
  const derivedBuf = crypto.scryptSync(String(password), salt, 64);
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (derivedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, expectedBuf);
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function hashToken(token) {
  return `sha256:${sha256Hex(token)}`;
}

function parseTokenEntry(entry, now = Date.now()) {
  if (typeof entry === "number" || typeof entry === "string") {
    const userId = Number(entry);
    if (!Number.isFinite(userId) || userId <= 0) return null;
    return { userId, createdAt: now, lastActiveAt: now, legacy: true };
  }
  if (entry && typeof entry === "object") {
    const userId = Number(entry.userId);
    if (!Number.isFinite(userId) || userId <= 0) return null;
    const createdAt = Number(entry.createdAt) || now;
    const lastActiveAt = Number(entry.lastActiveAt) || createdAt;
    return { userId, createdAt, lastActiveAt, legacy: false };
  }
  return null;
}

function logSecurityEvent(event, meta = {}) {
  try {
    console.warn(
      JSON.stringify({
        ts: new Date().toISOString(),
        security_event: event,
        ...meta,
      })
    );
  } catch {
    // Ignore logging errors
  }
}

function constantTimeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (process.env.NODE_ENV !== "production") {
    try {
      const parsed = new URL(origin);
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
      ) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function validateFrontendOrigin(candidate) {
  try {
    const parsed = new URL(String(candidate || ""));
    if (isAllowedOrigin(parsed.origin)) {
      return parsed.origin;
    }
  } catch {
    // Fallback below
  }
  return DEFAULT_FRONTEND_URL;
}

function signOAuthState(payload) {
  const data = {
    ...payload,
    nonce: crypto.randomBytes(12).toString("hex"),
    exp: Date.now() + 10 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", STATE_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifyOAuthState(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", STATE_SECRET).update(encoded).digest("base64url");
  if (!constantTimeEqualStr(sig, expectedSig)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isSafeImageInput(value) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > 5_000_000) return false;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/i.test(trimmed)) {
    return true;
  }
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

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

const INITIAL_DB = {
  users: [],
  categories: [
    { id_kategori: 1, nama_kategori: "Rice & Mains" },
    { id_kategori: 2, nama_kategori: "Snacks" },
    { id_kategori: 3, nama_kategori: "Drinks" },
  ],
  tenants: [],
  menus: [],
  carts: {},
  orders: [],
  payments: [],
  reviews: [],
  promos: [],
  banners: [],
  notifications: [],
  messages: [],
  tokens: {},
  passwordResets: {},
};

function purgeDummySeedRecords(parsed) {
  let changed = false;
  const dummyNames = new Set(["tenant dummy", "kantin sejahtera", "warung nusantara"]);
  const isDummyName = (val) => {
    const lower = String(val || "").trim().toLowerCase();
    return dummyNames.has(lower) || /\bdummy\b/i.test(lower);
  };

  const removedTenantIds = new Set(
    (parsed.tenants || [])
      .filter((t) => isDummyName(t.nama_tenant))
      .map((t) => Number(t.id_tenant))
  );
  const removedOwnerIds = new Set(
    (parsed.tenants || [])
      .filter((t) => removedTenantIds.has(Number(t.id_tenant)))
      .map((t) => Number(t.id_user))
  );
  const removedUserIds = new Set(
    (parsed.users || [])
      .filter(
        (u) =>
          removedOwnerIds.has(Number(u.id_user)) ||
          isDummyName(u.username) ||
          isDummyName(u.nama) ||
          /\bdummy\b/i.test(String(u.email || ""))
      )
      .map((u) => Number(u.id_user))
  );

  if (removedTenantIds.size > 0 || removedUserIds.size > 0) {
    changed = true;
    parsed.tenants = (parsed.tenants || []).filter(
      (t) => !removedTenantIds.has(Number(t.id_tenant)) && !removedUserIds.has(Number(t.id_user))
    );
    parsed.menus = (parsed.menus || []).filter((m) => !removedTenantIds.has(Number(m.id_tenant)));
    parsed.promos = (parsed.promos || []).filter((p) => !removedTenantIds.has(Number(p.id_tenant)));
    parsed.reviews = (parsed.reviews || []).filter(
      (r) => !removedTenantIds.has(Number(r.id_tenant)) && !removedUserIds.has(Number(r.id_user))
    );
    const removedOrderIds = new Set(
      (parsed.orders || [])
        .filter((o) => removedTenantIds.has(Number(o.id_tenant)) || removedUserIds.has(Number(o.id_user)))
        .map((o) => Number(o.id_pesanan))
    );
    parsed.orders = (parsed.orders || []).filter((o) => !removedOrderIds.has(Number(o.id_pesanan)));
    parsed.payments = (parsed.payments || []).filter((p) => !removedOrderIds.has(Number(p.id_pesanan)));
    parsed.notifications = (parsed.notifications || []).filter(
      (n) => !removedOrderIds.has(Number(n.id_pesanan)) && !removedUserIds.has(Number(n.id_user))
    );
    parsed.messages = (parsed.messages || []).filter(
      (m) => !removedOrderIds.has(Number(m.id_pesanan)) && !removedUserIds.has(Number(m.id_pengirim))
    );
    parsed.users = (parsed.users || []).filter((u) => !removedUserIds.has(Number(u.id_user)));
    if (parsed.carts && typeof parsed.carts === "object") {
      for (const uid of removedUserIds) delete parsed.carts[String(uid)];
    }
  }
  return changed;
}

let dbRevision = 0;
let pendingSaveTimer = null;
let asyncWriteRunning = false;
let asyncWriteQueuedDb = null;

function writeDbContentSync(content) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmpPath = `${DB_PATH}.tmp`;
  try {
    fs.writeFileSync(tmpPath, content);
    fs.renameSync(tmpPath, DB_PATH);
  } catch (err) {
    if (err?.code === "EPERM" || err?.code === "EBUSY") {
      fs.writeFileSync(DB_PATH, content);
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
    } else {
      throw err;
    }
  }
}

function saveDb(targetDb) {
  dbRevision += 1;
  if (pendingSaveTimer) {
    clearTimeout(pendingSaveTimer);
    pendingSaveTimer = null;
  }
  asyncWriteQueuedDb = null;
  writeDbContentSync(JSON.stringify(targetDb));
}

async function flushScheduledSave() {
  if (asyncWriteRunning) return;
  asyncWriteRunning = true;
  try {
    while (asyncWriteQueuedDb) {
      const target = asyncWriteQueuedDb;
      asyncWriteQueuedDb = null;
      const snapRev = dbRevision;
      const content = JSON.stringify(target);
      const tmpPath = `${DB_PATH}.async.tmp`;
      await fs.promises.mkdir(path.dirname(DB_PATH), { recursive: true });
      if (dbRevision !== snapRev) continue;
      await fs.promises.writeFile(tmpPath, content);
      if (dbRevision !== snapRev) {
        try {
          await fs.promises.unlink(tmpPath);
        } catch {}
        continue;
      }
      try {
        await fs.promises.rename(tmpPath, DB_PATH);
      } catch (err) {
        if (err?.code === "EPERM" || err?.code === "EBUSY") {
          if (dbRevision === snapRev) {
            await fs.promises.writeFile(DB_PATH, content);
          }
          try {
            await fs.promises.unlink(tmpPath);
          } catch {}
        } else {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error("[saveDb async error]", err?.message || err);
  } finally {
    asyncWriteRunning = false;
    if (asyncWriteQueuedDb) {
      void flushScheduledSave();
    }
  }
}

function scheduleSaveDb(targetDb, delayMs = 250) {
  dbRevision += 1;
  asyncWriteQueuedDb = targetDb;
  if (pendingSaveTimer) return;
  pendingSaveTimer = setTimeout(() => {
    pendingSaveTimer = null;
    void flushScheduledSave();
  }, delayMs);
  pendingSaveTimer.unref?.();
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      if (parsed && Array.isArray(parsed.users) && parsed.clean_project_v2) {
        if (!parsed.passwordResets || typeof parsed.passwordResets !== "object") {
          parsed.passwordResets = {};
        }
        if (!Array.isArray(parsed.payments)) {
          parsed.payments = [];
        }
        if (!Array.isArray(parsed.reviews)) {
          parsed.reviews = [];
        }
        if (!Array.isArray(parsed.promos)) {
          parsed.promos = [];
        }
        if (!Array.isArray(parsed.banners)) {
          parsed.banners = [];
        }
        if (!Array.isArray(parsed.messages)) {
          parsed.messages = [];
        }
        let migrated = purgeDummySeedRecords(parsed);
        for (const u of parsed.users) {
          if (u.password && !String(u.password).startsWith("scrypt:")) {
            u.password = hashPassword(u.password);
            migrated = true;
          }
        }
        if (parsed.tokens && typeof parsed.tokens === "object") {
          const nextTokens = {};
          const now = Date.now();
          for (const [rawKey, entry] of Object.entries(parsed.tokens)) {
            const parsedEntry = parseTokenEntry(entry, now);
            if (!parsedEntry) {
              migrated = true;
              continue;
            }
            if (now - parsedEntry.lastActiveAt > TOKEN_INACTIVITY_TTL_MS) {
              migrated = true;
              continue;
            }
            const storeKey = String(rawKey).startsWith("sha256:") ? rawKey : hashToken(rawKey);
            if (storeKey !== rawKey || parsedEntry.legacy) {
              migrated = true;
            }
            nextTokens[storeKey] = {
              userId: parsedEntry.userId,
              createdAt: parsedEntry.createdAt,
              lastActiveAt: parsedEntry.lastActiveAt,
            };
          }
          parsed.tokens = nextTokens;
        }
        if (migrated) saveDb(parsed);
        return parsed;
      }
    }
  } catch {
    // Initialize fresh project database
  }
  const fresh = { ...JSON.parse(JSON.stringify(INITIAL_DB)), clean_project_v2: true };
  saveDb(fresh);
  return fresh;
}

let db = loadDb();

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

function getCorsHeaders(req) {
  const origin = req.headers.origin;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    Vary: "Origin, Accept-Encoding",
  };
  if (req.headers?.authorization) {
    headers["Cache-Control"] = "no-store, private";
  }
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function sendJson(req, res, status, payload, extraHeaders = {}) {
  const headers = { ...getCorsHeaders(req), ...extraHeaders };
  const jsonStr = JSON.stringify(payload);
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  if (jsonStr.length >= 1024 && /\bgzip\b/i.test(acceptEncoding)) {
    const rawBuf = Buffer.from(jsonStr, "utf8");
    zlib.gzip(rawBuf, (err, compressed) => {
      if (res.writableEnded) return;
      if (err) {
        headers["Content-Length"] = String(rawBuf.length);
        res.writeHead(status, headers);
        res.end(rawBuf);
        return;
      }
      headers["Content-Encoding"] = "gzip";
      headers["Content-Length"] = String(compressed.length);
      res.writeHead(status, headers);
      res.end(compressed);
    });
    return;
  }
  const rawBuf = Buffer.from(jsonStr, "utf8");
  headers["Content-Length"] = String(rawBuf.length);
  res.writeHead(status, headers);
  res.end(rawBuf);
}

function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    let totalBytes = 0;
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) return;
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        resolve({ __tooLarge: true });
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) return;
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => {
      if (!tooLarge) resolve({});
    });
  });
}

function getClientIp(req) {
  return req.socket?.remoteAddress || "127.0.0.1";
}

function checkRateLimit(req, res, bucket, maxAttempts = 15, windowMs = 60_000) {
  const key = `${bucket}:${getClientIp(req)}`;
  const now = Date.now();
  const timestamps = (rateLimitBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
  if (timestamps.length >= maxAttempts) {
    logSecurityEvent("auth_rate_limited", { bucket, ip: getClientIp(req) });
    sendJson(req, res, 429, {
      success: false,
      message: "Terlalu banyak percobaan. Silakan tunggu 1 menit lalu coba kembali.",
    });
    return false;
  }
  timestamps.push(now);
  rateLimitBuckets.set(key, timestamps);
  return true;
}

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const hashedKey = hashToken(token);
  const matchedKey = Object.prototype.hasOwnProperty.call(db.tokens, hashedKey)
    ? hashedKey
    : Object.prototype.hasOwnProperty.call(db.tokens, token)
      ? token
      : null;
  if (!matchedKey) return null;

  const now = Date.now();
  const parsed = parseTokenEntry(db.tokens[matchedKey], now);
  if (!parsed) {
    delete db.tokens[matchedKey];
    saveDb(db);
    return null;
  }

  if (now - parsed.lastActiveAt > TOKEN_INACTIVITY_TTL_MS) {
    delete db.tokens[matchedKey];
    saveDb(db);
    return null;
  }

  const user = db.users.find((u) => u.id_user === parsed.userId) || null;
  if (!user) {
    delete db.tokens[matchedKey];
    saveDb(db);
    return null;
  }

  if (parsed.legacy || matchedKey !== hashedKey || now - parsed.lastActiveAt >= TOKEN_TOUCH_DEBOUNCE_MS) {
    db.tokens[hashedKey] = {
      userId: parsed.userId,
      createdAt: parsed.createdAt,
      lastActiveAt: now,
    };
    if (matchedKey !== hashedKey) {
      delete db.tokens[matchedKey];
    }
    saveDb(db);
  }

  return user;
}

function requireAuth(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    sendJson(req, res, 401, { success: false, message: "Unauthenticated." });
    return null;
  }
  return user;
}

function requireRole(req, res, user, ...allowedRoles) {
  const role = String(user?.peran || "").toLowerCase();
  const allowed = allowedRoles.map((r) => r.toLowerCase());
  if (!allowed.includes(role)) {
    logSecurityEvent("access_denied_role", {
      user_id: user?.id_user,
      user_role: role,
      allowed_roles: allowed,
      path: req.url,
      ip: getClientIp(req),
    });
    sendJson(req, res, 403, {
      success: false,
      message: "Anda tidak memiliki hak akses untuk fitur ini.",
    });
    return false;
  }
  return true;
}

function ensureTenantForVendor(user, namaTenantOverride) {
  let tenant = db.tenants.find((t) => t.id_user === user.id_user);
  if (!tenant) {
    const nextTenantId = Math.max(0, ...db.tenants.map((t) => t.id_tenant)) + 1;
    tenant = {
      id_tenant: nextTenantId,
      id_user: user.id_user,
      nama_tenant: namaTenantOverride || user.nama || user.username,
      deskripsi: "",
      booth: "",
      estimasi_menit: "5-10 min",
      kategori_utama: "Rice & Mains",
      logo: user.avatar || "",
      gambar: user.avatar || "",
      jam_buka: "07:00",
      jam_tutup: "21:00",
      auto_schedule: false,
      status_buka: true,
    };
    db.tenants.push(tenant);
  }
  return tenant;
}

function revokeUserTokens(userId) {
  for (const [tok, entry] of Object.entries(db.tokens)) {
    if (parseTokenEntry(entry)?.userId === userId) {
      delete db.tokens[tok];
    }
  }
}

function sanitizeUserResponse(user, tenant = null) {
  const { password: _, ...safeUser } = user;
  return { ...safeUser, tenant };
}

function issueUserSession(user, createTenantName = null) {
  const tenant =
    user.peran === "Vendor" ? ensureTenantForVendor(user, createTenantName || user.nama) : null;
  const token = crypto.randomBytes(24).toString("hex");
  const now = Date.now();
  db.tokens[hashToken(token)] = {
    userId: user.id_user,
    createdAt: now,
    lastActiveAt: now,
  };
  saveDb(db);
  return { token, userPayload: sanitizeUserResponse(user, tenant) };
}

const server = http.createServer(async (req, res) => {
  try {
    await handleApiRequest(req, res);
  } catch (err) {
    logSecurityEvent("unhandled_server_error", {
      method: req.method,
      path: String(req.url || "").slice(0, 120),
      message: err?.message || "unknown",
    });
    if (!res.headersSent) {
      sendJson(req, res, 500, {
        success: false,
        message: "Terjadi kesalahan internal pada server.",
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});

async function handleApiRequest(req, res) {
  if (req.method === "OPTIONS") {
    const headers = getCorsHeaders(req);
    delete headers["Content-Type"];
    res.writeHead(204, headers);
    return res.end();
  }

  let urlObj;
  try {
    urlObj = new URL(req.url || "/", "http://127.0.0.1:8000");
  } catch {
    return sendJson(req, res, 400, { success: false, message: "Format URL tidak valid." });
  }
  const pathname = urlObj.pathname.replace(/^\/api(\/v1)?/, "") || "/";
  const method = req.method.toUpperCase();

  if (pathname === "/health" && method === "GET") {
    return sendJson(req, res, 200, {
      success: true,
      application: "LetsOrder.com",
      message: "API is available.",
    });
  }

  // ---- Authentication Routes ----

  if (pathname === "/auth/login" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_login", 15, 60_000)) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran payload melebihi batas." });
    }
    const identifier = String(body.login || body.username || body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const expectedRole = body.peran;

    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );

    if (!user || !verifyPassword(password, user.password)) {
      logSecurityEvent("auth_login_failed", {
        identifier: identifier.slice(0, 64),
        ip: getClientIp(req),
      });
      return sendJson(req, res, 422, {
        success: false,
        message: "Username/email atau password tidak sesuai. Pastikan Anda sudah mendaftar akun terlebih dahulu.",
      });
    }

    if (expectedRole && user.peran !== expectedRole) {
      return sendJson(req, res, 422, {
        success: false,
        message: `Akun ini terdaftar sebagai ${user.peran === "Vendor" ? "Tenant" : "Pengguna"}. Silakan pilih tab ${user.peran === "Vendor" ? "Tenant" : "Pengguna"}.`,
      });
    }

    const { token, userPayload } = issueUserSession(user);
    return sendJson(req, res, 200, {
      success: true,
      message: "Login berhasil.",
      data: {
        access_token: token,
        token,
        token_type: "Bearer",
        user: userPayload,
      },
    });
  }

  if (pathname === "/auth/check-availability" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_check", 30, 60_000)) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran payload melebihi batas." });
    }
    const username = String(body.username || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!username || !isValidEmail(email)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Username dan format email valid wajib diisi.",
      });
    }
    if (
      db.users.some(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() ||
          u.email.toLowerCase() === email
      )
    ) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Username atau email sudah terdaftar. Silakan gunakan yang lain atau login.",
      });
    }
    return sendJson(req, res, 200, {
      success: true,
      available: true,
    });
  }

  if (pathname === "/auth/register" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_register", 10, 60_000)) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran payload melebihi batas." });
    }
    const username = String(body.username || "").trim();
    const nama = String(body.nama || username).trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const peran = body.peran === "Vendor" ? "Vendor" : "Customer";

    if (!username || !isValidEmail(email) || password.length < 6) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Username, format email valid, dan password (minimal 6 karakter) wajib diisi.",
      });
    }

    if (!isSafeImageInput(body.avatar || "")) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Format foto avatar tidak diizinkan.",
      });
    }

    if (
      db.users.some(
        (u) =>
          u.username.toLowerCase() === username.toLowerCase() ||
          u.email.toLowerCase() === email
      )
    ) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Username atau email sudah terdaftar. Silakan gunakan yang lain atau login.",
      });
    }

    const nextId = Math.max(0, ...db.users.map((u) => u.id_user)) + 1;
    const newUser = {
      id_user: nextId,
      username,
      nama,
      email,
      password: hashPassword(password),
      peran,
      avatar: body.avatar || "",
    };
    db.users.push(newUser);

    const { token, userPayload } = issueUserSession(
      newUser,
      peran === "Vendor" ? body.nama_tenant || nama : null
    );

    return sendJson(req, res, 201, {
      success: true,
      message: "Registrasi berhasil.",
      data: {
        access_token: token,
        token,
        token_type: "Bearer",
        user: userPayload,
      },
    });
  }

  if (pathname === "/auth/google/config" && method === "GET") {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      "";
    return sendJson(req, res, 200, {
      success: true,
      data: {
        client_id: clientId,
        configured: Boolean(clientId && clientId.includes(".apps.googleusercontent.com")),
      },
    });
  }

  if (pathname === "/auth/google/redirect" && method === "GET") {
    const peran = urlObj.searchParams.get("peran") === "Vendor" ? "Vendor" : "Customer";
    const frontendOrigin = validateFrontendOrigin(urlObj.searchParams.get("origin"));
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    if (!clientId || !clientId.includes(".apps.googleusercontent.com")) {
      const errUrl = new URL(frontendOrigin);
      errUrl.searchParams.set(
        "google_error",
        "Google OAuth Client ID belum dikonfigurasi di file .env (VITE_GOOGLE_CLIENT_ID / GOOGLE_CLIENT_ID)."
      );
      res.writeHead(302, { Location: errUrl.toString() });
      return res.end();
    }

    const signedState = signOAuthState({ peran, origin: frontendOrigin });
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    if (clientSecret) {
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        "http://127.0.0.1:8000/api/auth/google/callback";
      googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
      googleAuthUrl.searchParams.set("response_type", "code");
    } else {
      googleAuthUrl.searchParams.set("redirect_uri", frontendOrigin);
      googleAuthUrl.searchParams.set("response_type", "token");
    }
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    googleAuthUrl.searchParams.set("state", signedState);

    res.writeHead(302, { Location: googleAuthUrl.toString() });
    return res.end();
  }

  if (pathname === "/auth/google/callback" && method === "GET") {
    const code = urlObj.searchParams.get("code");
    const error = urlObj.searchParams.get("error");
    const state = verifyOAuthState(urlObj.searchParams.get("state") || "");
    const targetOrigin = validateFrontendOrigin(state?.origin);

    if (!state) {
      const errUrl = new URL(DEFAULT_FRONTEND_URL);
      errUrl.searchParams.set("google_error", "State OAuth Google tidak valid atau sudah kedaluwarsa.");
      res.writeHead(302, { Location: errUrl.toString() });
      return res.end();
    }

    if (error || !code) {
      const errUrl = new URL(targetOrigin);
      errUrl.searchParams.set("google_error", error || "Google login dibatalkan.");
      res.writeHead(302, { Location: errUrl.toString() });
      return res.end();
    }

    try {
      const clientId =
        process.env.GOOGLE_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID ||
        "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
      const redirectUri =
        process.env.GOOGLE_REDIRECT_URI ||
        "http://127.0.0.1:8000/api/auth/google/callback";

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error(tokenData.error_description || "Gagal menukar kode OAuth Google.");
      }

      const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();
      if (profile.email_verified !== true && profile.email_verified !== "true") {
        throw new Error("Email Google belum terverifikasi.");
      }

      const email = String(profile.email || "").trim().toLowerCase();
      const nama = String(profile.name || email.split("@")[0] || "Google User").trim();
      const avatar = isSafeImageInput(profile.picture) ? profile.picture : "";
      const newAccountRole = state.peran === "Vendor" ? "Vendor" : "Customer";

      let user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        const nextId = Math.max(0, ...db.users.map((u) => u.id_user)) + 1;
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || `user${nextId}`;
        user = {
          id_user: nextId,
          username: `${baseUsername}_${crypto.randomBytes(2).toString("hex")}`,
          nama,
          email,
          password: hashPassword(crypto.randomBytes(24).toString("hex")),
          peran: newAccountRole,
          avatar,
          google_linked: true,
        };
        db.users.push(user);
      }

      const { token, userPayload } = issueUserSession(user);
      const exchangeCode = crypto.randomBytes(24).toString("hex");
      googleAuthCodes.set(exchangeCode, {
        token,
        user: userPayload,
        exp: Date.now() + 60_000,
      });

      const successUrl = new URL(targetOrigin);
      successUrl.searchParams.set("google_auth_code", exchangeCode);
      res.writeHead(302, { Location: successUrl.toString() });
      return res.end();
    } catch (err) {
      const errUrl = new URL(targetOrigin);
      errUrl.searchParams.set("google_error", err.message || "Gagal autentikasi Google.");
      res.writeHead(302, { Location: errUrl.toString() });
      return res.end();
    }
  }

  if (pathname === "/auth/google/exchange" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_google_exchange", 15, 60_000)) return;
    const body = await parseBody(req);
    const code = String(body.code || "").trim();
    const record = googleAuthCodes.get(code);
    if (!record) {
      return sendJson(req, res, 401, {
        success: false,
        message: "Kode login Google tidak valid atau sudah digunakan.",
      });
    }
    googleAuthCodes.delete(code);
    if (Date.now() > record.exp) {
      return sendJson(req, res, 401, {
        success: false,
        message: "Kode login Google telah kedaluwarsa. Silakan coba login ulang.",
      });
    }
    return sendJson(req, res, 200, {
      success: true,
      message: "Login dengan Google berhasil.",
      data: {
        access_token: record.token,
        token: record.token,
        token_type: "Bearer",
        user: record.user,
      },
    });
  }

  if (pathname === "/auth/google" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_google", 15, 60_000)) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran payload melebihi batas." });
    }
    const expectedClientId = (
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      ""
    ).trim();
    if (!expectedClientId || !expectedClientId.includes(".apps.googleusercontent.com")) {
      return sendJson(req, res, 503, {
        success: false,
        message: "Google OAuth Client ID belum dikonfigurasi di server.",
      });
    }

    let email = "";
    let nama = "";
    let avatar = "";
    const newAccountRole = body.peran === "Vendor" ? "Vendor" : "Customer";

    if (body.access_token) {
      try {
        const tokenInfoRes = await fetch(
          `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(body.access_token)}`
        );
        if (!tokenInfoRes.ok) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Token akses Google tidak valid atau sudah kedaluwarsa.",
          });
        }
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.aud !== expectedClientId) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Client ID token akses Google tidak sesuai dengan aplikasi ini.",
          });
        }

        const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${body.access_token}` },
        });
        if (!profileRes.ok) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Gagal mengambil profil Google.",
          });
        }
        const profile = await profileRes.json();
        if (profile.email_verified !== true && profile.email_verified !== "true") {
          return sendJson(req, res, 401, {
            success: false,
            message: "Email Google belum terverifikasi.",
          });
        }
        email = String(profile.email || "").trim().toLowerCase();
        nama = String(profile.name || email.split("@")[0] || "Google User").trim();
        avatar = isSafeImageInput(profile.picture) ? profile.picture : "";
      } catch {
        return sendJson(req, res, 502, {
          success: false,
          message: "Gagal menghubungi server Google OAuth.",
        });
      }
    } else if (body.credential || body.id_token) {
      const idToken = body.credential || body.id_token;
      try {
        const tokenInfoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );
        if (!tokenInfoRes.ok) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Token ID Google tidak valid atau tidak terverifikasi.",
          });
        }
        const info = await tokenInfoRes.json();
        if (info.aud !== expectedClientId) {
          return sendJson(req, res, 401, {
            success: false,
            message: "Client ID token Google tidak sesuai dengan konfigurasi aplikasi.",
          });
        }
        if (info.email_verified !== true && info.email_verified !== "true") {
          return sendJson(req, res, 401, {
            success: false,
            message: "Email Google belum terverifikasi.",
          });
        }
        email = String(info.email || "").trim().toLowerCase();
        nama = String(info.name || email.split("@")[0] || "Google User").trim();
        avatar = isSafeImageInput(info.picture) ? info.picture : "";
      } catch {
        return sendJson(req, res, 401, {
          success: false,
          message: "Gagal memverifikasi kredensial Google.",
        });
      }
    } else {
      return sendJson(req, res, 422, {
        success: false,
        message: "Token OAuth Google resmi wajib disertakan.",
      });
    }

    if (!isValidEmail(email)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Email Google tidak valid.",
      });
    }

    let user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      const nextId = Math.max(0, ...db.users.map((u) => u.id_user)) + 1;
      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") || `user${nextId}`;
      user = {
        id_user: nextId,
        username: `${baseUsername}_${crypto.randomBytes(2).toString("hex")}`,
        nama: nama || baseUsername,
        email,
        password: hashPassword(crypto.randomBytes(24).toString("hex")),
        peran: newAccountRole,
        avatar,
        google_linked: true,
      };
      db.users.push(user);
    }

    const { token, userPayload } = issueUserSession(
      user,
      user.peran === "Vendor" ? body.nama_tenant || user.nama : null
    );

    return sendJson(req, res, 200, {
      success: true,
      message: "Login dengan Google berhasil.",
      data: {
        access_token: token,
        token,
        token_type: "Bearer",
        user: userPayload,
      },
    });
  }

  if (pathname === "/auth/forgot-password" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_forgot", 5, 60_000)) return;
    const body = await parseBody(req);
    const identifier = String(body.login || body.username || body.email || "")
      .trim()
      .toLowerCase();

    if (!identifier) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Masukkan username atau email akun Anda.",
      });
    }

    const user = db.users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );

    if (user) {
      const resetCode = String(crypto.randomInt(100000, 1000000));
      db.passwordResets[user.id_user] = {
        hash: sha256Hex(resetCode),
        exp: Date.now() + 15 * 60 * 1000,
        attempts: 0,
      };
      saveDb(db);
      logSecurityEvent("password_reset_requested", {
        user_id: user.id_user,
        ip: getClientIp(req),
      });
    }

    return sendJson(req, res, 200, {
      success: true,
      message:
        "Jika akun terdaftar, kode verifikasi reset password 6 digit telah dikirimkan melalui kanal verifikasi server.",
    });
  }

  if (pathname === "/auth/reset-password" && method === "POST") {
    if (!checkRateLimit(req, res, "auth_reset", 10, 60_000)) return;
    const body = await parseBody(req);
    const identifier = String(body.login || body.username || body.email || "")
      .trim()
      .toLowerCase();
    const resetCode = String(body.reset_token || body.code || "").trim();
    const newPassword = String(body.new_password || body.password || "");

    if (!identifier || !resetCode || newPassword.length < 6) {
      return sendJson(req, res, 422, {
        success: false,
        message:
          "Masukkan username/email, kode verifikasi reset 6 digit, dan password baru minimal 6 karakter.",
      });
    }

    const user = db.users.find(
      (u) => u.username.toLowerCase() === identifier || u.email.toLowerCase() === identifier
    );
    const resetRecord = user ? db.passwordResets[user.id_user] : null;

    if (!user || !resetRecord || Date.now() > resetRecord.exp || resetRecord.attempts >= 5) {
      if (user && resetRecord && (Date.now() > resetRecord.exp || resetRecord.attempts >= 5)) {
        delete db.passwordResets[user.id_user];
        saveDb(db);
      }
      return sendJson(req, res, 422, {
        success: false,
        message: "Kode reset tidak valid atau sudah kedaluwarsa. Silakan minta kode baru.",
      });
    }

    if (!constantTimeEqualStr(sha256Hex(resetCode), resetRecord.hash)) {
      resetRecord.attempts += 1;
      saveDb(db);
      return sendJson(req, res, 422, {
        success: false,
        message: "Kode verifikasi reset password tidak sesuai.",
      });
    }

    user.password = hashPassword(newPassword);
    delete db.passwordResets[user.id_user];
    revokeUserTokens(user.id_user);
    saveDb(db);

    return sendJson(req, res, 200, {
      success: true,
      message: "Password berhasil diperbarui! Silakan login dengan password baru Anda.",
    });
  }

  if (pathname === "/auth/password" && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await parseBody(req);
    const currentPassword = String(body.current_password || "");
    const newPassword = String(body.new_password || "");

    if (!verifyPassword(currentPassword, user.password)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Password saat ini tidak sesuai.",
      });
    }
    if (newPassword.length < 6) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Password baru minimal 6 karakter.",
      });
    }
    user.password = hashPassword(newPassword);
    revokeUserTokens(user.id_user);
    const { token } = issueUserSession(user);
    return sendJson(req, res, 200, {
      success: true,
      message: "Password berhasil diubah.",
      data: { access_token: token, token },
    });
  }

  if (pathname === "/auth/profile" && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran file/payload terlalu besar (maks. 2 MB)." });
    }

    const nextPhone =
      body.no_telp !== undefined ? String(body.no_telp).trim() : String(user.no_telp || "").trim();

    if (body.avatar !== undefined && !isSafeImageInput(body.avatar)) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Format gambar profil harus berupa PNG/JPEG/WEBP/GIF atau URL HTTPS yang valid.",
      });
    }

    if (
      body.email !== undefined &&
      String(body.email).trim().toLowerCase() !== String(user.email || "").trim().toLowerCase()
    ) {
      const nextEmail = String(body.email).trim().toLowerCase();
      if (!isValidEmail(nextEmail)) {
        return sendJson(req, res, 422, {
          success: false,
          message: "Format alamat email baru tidak valid.",
        });
      }
      if (nextPhone.replace(/\D/g, "").length < 8) {
        return sendJson(req, res, 422, {
          success: false,
          message: "Nomor telepon valid (minimal 8 digit) wajib diisi sebelum mengubah email.",
        });
      }
      if (
        db.users.some(
          (u) => u.id_user !== user.id_user && u.email.toLowerCase() === nextEmail
        )
      ) {
        return sendJson(req, res, 422, {
          success: false,
          message: "Alamat email tersebut sudah digunakan oleh akun lain.",
        });
      }
      user.email = nextEmail;
    }

    if (body.nama !== undefined) user.nama = String(body.nama).trim().slice(0, 100);
    if (body.username !== undefined) {
      const nextUsername = String(body.username).trim().slice(0, 50);
      if (
        nextUsername &&
        db.users.some(
          (u) => u.id_user !== user.id_user && u.username.toLowerCase() === nextUsername.toLowerCase()
        )
      ) {
        return sendJson(req, res, 422, {
          success: false,
          message: "Username tersebut sudah digunakan.",
        });
      }
      if (nextUsername) user.username = nextUsername;
    }
    if (body.no_telp !== undefined) user.no_telp = nextPhone.slice(0, 30);
    if (body.jenis_kelamin !== undefined) user.jenis_kelamin = String(body.jenis_kelamin).slice(0, 20);
    if (body.tanggal_lahir !== undefined) user.tanggal_lahir = String(body.tanggal_lahir).slice(0, 20);
    if (body.avatar !== undefined && !isMediaEndpointRef(body.avatar)) user.avatar = body.avatar;

    let tenant = null;
    if (user.peran === "Vendor") {
      tenant = ensureTenantForVendor(user);
      if (body.nama_tenant) tenant.nama_tenant = String(body.nama_tenant).trim().slice(0, 100);
      if (body.deskripsi !== undefined) tenant.deskripsi = String(body.deskripsi).slice(0, 500);
      if (body.booth !== undefined) tenant.booth = String(body.booth).slice(0, 100);
      if (body.avatar !== undefined && body.avatar && !isMediaEndpointRef(body.avatar) && !tenant.logo) {
        tenant.logo = body.avatar;
        tenant.gambar = body.avatar;
      }
      tenant = enrichTenant(tenant);
    }
    saveDb(db);
    const userPayload = sanitizeUserResponse(user, tenant);
    return sendJson(req, res, 200, {
      success: true,
      message: "Profil berhasil diperbarui.",
      data: { ...userPayload, user: userPayload },
    });
  }

  if (pathname === "/auth/me" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    const tenant = user.peran === "Vendor" ? ensureTenantForVendor(user) : null;
    const userPayload = sanitizeUserResponse(user, tenant);
    return sendJson(req, res, 200, {
      success: true,
      message: "Data pengguna berhasil diambil.",
      data: { ...userPayload, user: userPayload },
    });
  }

  if (pathname === "/auth/logout" && method === "POST") {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      const hashed = hashToken(token);
      if (db.tokens[hashed] || db.tokens[token]) {
        delete db.tokens[hashed];
        delete db.tokens[token];
        saveDb(db);
      }
    }
    return sendJson(req, res, 200, {
      success: true,
      message: "Logout berhasil.",
      data: null,
    });
  }

  // ---- Public Catalog & Unified Sync / Cacheable Media Routes ----

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

  // ---- Protected Cart Routes (Customer Only) ----

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

  // ---- Protected Orders & Payment Routes ----

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

  // ---- Protected Vendor Tenant, Promo & Menu Management Routes ----

  if (pathname === "/vendor/tenant" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const hadTenant = db.tenants.some((t) => t.id_user === user.id_user);
    const tenant = ensureTenantForVendor(user);
    if (!hadTenant && tenant) saveDb(db);
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
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
    const compactMedia = urlObj.searchParams.get("compact_media") === "1" || urlObj.searchParams.get("compact_media") === "true";
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

  // ---- Administrator Routes ----
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
      const source = {
        tag: body.tag ?? existing?.tag ?? "",
        judul: String(body.judul ?? existing?.judul ?? "").trim().slice(0, 140),
        deskripsi: String(body.deskripsi ?? existing?.deskripsi ?? "").trim().slice(0, 400),
        gambar: String(body.gambar ?? existing?.gambar ?? "").trim().slice(0, 600),
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
      if (!/^(https?:\/\/|\/)/i.test(source.gambar)) {
        return { error: "URL gambar banner harus diawali http(s):// atau /." };
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

  // ---- Protected Notification Routes ----

  if (pathname === "/notifications" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    const list = db.notifications.filter((n) => n.id_user === user.id_user);
    return sendJson(req, res, 200, {
      success: true,
      data: list,
    });
  }

  const notifReadMatch = pathname.match(/^\/notifications\/(\d+)\/read$/);
  if (notifReadMatch && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    const notifId = Number(notifReadMatch[1]);
    const notif = db.notifications.find((n) => n.id_notifikasi === notifId);
    if (!notif) {
      return sendJson(req, res, 404, { success: false, message: "Notifikasi tidak ditemukan." });
    }
    if (notif.id_user !== user.id_user) {
      return sendJson(req, res, 403, { success: false, message: "Akses ditolak." });
    }
    notif.status_baca = true;
    saveDb(db);
    return sendJson(req, res, 200, { success: true, data: notif });
  }

  if (pathname === "/notifications/read-all" && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    db.notifications.forEach((n) => {
      if (n.id_user === user.id_user) n.status_baca = true;
    });
    saveDb(db);
    return sendJson(req, res, 200, { success: true });
  }

  return sendJson(req, res, 404, {
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
}

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

function flushDbOnShutdown() {
  if (pendingSaveTimer || asyncWriteQueuedDb) {
    try {
      saveDb(db);
    } catch {}
  }
}

process.once("SIGINT", () => {
  flushDbOnShutdown();
  process.exit(0);
});
process.once("SIGTERM", () => {
  flushDbOnShutdown();
  process.exit(0);
});

server.listen(PORT, HOST, () => {
  console.log(`LetsOrder API server running at http://${HOST}:${PORT}/api`);
});
