import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "storage", "app", "db.json");
const MAX_BODY_BYTES = 6 * 1024 * 1024; // 6 MB limit per request body

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
  notifications: [],
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
    parsed.users = (parsed.users || []).filter((u) => !removedUserIds.has(Number(u.id_user)));
    if (parsed.carts && typeof parsed.carts === "object") {
      for (const uid of removedUserIds) delete parsed.carts[String(uid)];
    }
  }
  return changed;
}

function saveDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2));
  fs.renameSync(tmpPath, DB_PATH);
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
        let migrated = purgeDummySeedRecords(parsed);
        for (const u of parsed.users) {
          if (u.password && !String(u.password).startsWith("scrypt:")) {
            u.password = hashPassword(u.password);
            migrated = true;
          }
        }
        if (parsed.tokens && typeof parsed.tokens === "object") {
          const nextTokens = {};
          for (const [rawKey, uid] of Object.entries(parsed.tokens)) {
            if (String(rawKey).startsWith("sha256:")) {
              nextTokens[rawKey] = uid;
            } else {
              nextTokens[hashToken(rawKey)] = uid;
              migrated = true;
            }
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

function enrichTenant(tenant) {
  if (!tenant) return null;
  const owner = db.users.find((u) => u.id_user === tenant.id_user) || null;
  const tenantReviews = (db.reviews || []).filter(
    (r) => Number(r.id_tenant) === Number(tenant.id_tenant)
  );
  const avgRating =
    tenantReviews.length > 0
      ? (
          tenantReviews.reduce((s, r) => s + Number(r.rating || 5), 0) /
          tenantReviews.length
        ).toFixed(1)
      : "0.0";
  const tenantMenus = db.menus.filter((m) => Number(m.id_tenant) === Number(tenant.id_tenant));
  const menuImgFallback = tenantMenus.find((m) => m.gambar)?.gambar || "";
  const effectiveImage = tenant.gambar || tenant.logo || owner?.avatar || menuImgFallback || "";
  return {
    ...tenant,
    logo: tenant.logo || effectiveImage,
    gambar: effectiveImage,
    jam_buka: tenant.jam_buka || "07:00",
    jam_tutup: tenant.jam_tutup || "21:00",
    auto_schedule: Boolean(tenant.auto_schedule),
    status_buka_efektif: isTenantOpenNow(tenant),
    rating: tenantReviews.length > 0 ? avgRating : null,
    reviews_count: tenantReviews.length,
  };
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

function enrichMenu(menu) {
  const rawTenant = db.tenants.find((t) => t.id_tenant === menu.id_tenant) || null;
  const tenant = rawTenant ? enrichTenant(rawTenant) : null;
  const category = db.categories.find((c) => c.id_kategori === menu.id_kategori) || null;
  const menuReviews = (db.reviews || []).filter(
    (r) => Number(r.id_menu) === Number(menu.id_menu)
  );
  const avgRating =
    menuReviews.length > 0
      ? (
          menuReviews.reduce((s, r) => s + Number(r.rating || 5), 0) /
          menuReviews.length
        ).toFixed(1)
      : null;
  return {
    ...menu,
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

function enrichOrder(order) {
  const rawTenant = db.tenants.find((t) => t.id_tenant === order.id_tenant) || null;
  const tenant = rawTenant ? enrichTenant(rawTenant) : null;
  const user = db.users.find((u) => u.id_user === order.id_user) || null;
  const payment =
    db.payments
      .filter((p) => p.id_pesanan === order.id_pesanan)
      .sort((a, b) => b.id_pembayaran - a.id_pembayaran)[0] || null;
  const orderReviews = (db.reviews || []).filter(
    (r) => Number(r.id_pesanan) === Number(order.id_pesanan)
  );
  const details = (order.details || []).map((d) => {
    const m = db.menus.find((x) => x.id_menu === d.id_menu);
    return {
      ...d,
      gambar: m?.gambar || d.gambar || "",
      estimasi_menit: m?.estimasi_menit || d.estimasi_menit || 8,
      menu: m || null,
    };
  });
  return {
    ...order,
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
    Vary: "Origin",
  };
  if (req.headers?.authorization) {
    headers["Cache-Control"] = "no-store, private";
  }
  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

function sendJson(req, res, status, payload) {
  res.writeHead(status, getCorsHeaders(req));
  res.end(JSON.stringify(payload));
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
  const userId = db.tokens[hashToken(token)] ?? db.tokens[token];
  if (!userId) return null;
  return db.users.find((u) => u.id_user === userId) || null;
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
      deskripsi: "Campus Canteen Tenant",
      booth: `Stand #${nextTenantId} · Campus Canteen`,
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
  for (const [tok, uid] of Object.entries(db.tokens)) {
    if (uid === userId) {
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
  db.tokens[hashToken(token)] = user.id_user;
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
    if (body.avatar !== undefined) user.avatar = body.avatar;

    let tenant = null;
    if (user.peran === "Vendor") {
      tenant = ensureTenantForVendor(user);
      if (body.nama_tenant) tenant.nama_tenant = String(body.nama_tenant).trim().slice(0, 100);
      if (body.deskripsi !== undefined) tenant.deskripsi = String(body.deskripsi).slice(0, 500);
      if (body.booth !== undefined) tenant.booth = String(body.booth).slice(0, 100);
      if (body.avatar !== undefined && body.avatar && !tenant.logo) {
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

  // ---- Public Catalog Routes ----

  if (pathname === "/categories" && method === "GET") {
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar kategori berhasil diambil.",
      data: db.categories,
    });
  }

  if (pathname === "/tenants" && method === "GET") {
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar tenant berhasil diambil.",
      data: db.tenants.map(enrichTenant),
    });
  }

  if (pathname === "/promos" && method === "GET") {
    const idTenantParam = urlObj.searchParams.get("id_tenant");
    const list = (db.promos || []).filter((p) => {
      if (!p.aktif) return false;
      if (idTenantParam) {
        return !p.id_tenant || Number(p.id_tenant) === Number(idTenantParam);
      }
      return true;
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
    const menus = db.menus
      .filter((m) => m.id_tenant === idTenant && (includeUnavailable || Boolean(m.status_tersedia)))
      .map(enrichMenu);
    return sendJson(req, res, 200, {
      success: true,
      message: "Daftar menu tenant berhasil diambil.",
      data: menus,
    });
  }

  if (pathname === "/menus" && method === "GET") {
    const includeUnavailable = urlObj.searchParams.get("include_unavailable") === "true";
    const list = db.menus
      .filter((m) => (includeUnavailable ? true : Boolean(m.status_tersedia)))
      .map(enrichMenu);
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
    const rawItems = db.carts[user.id_user] || [];
    const items = rawItems
      .map((ci) => {
        const m = db.menus.find((x) => x.id_menu === ci.id_menu);
        if (!m) return null;
        const enriched = enrichMenu(m);
        return {
          id_item_keranjang: ci.id_item_keranjang,
          id_menu: m.id_menu,
          id_tenant: m.id_tenant,
          nama_menu: m.nama_menu,
          tenant_name: enriched.tenant_name,
          harga: m.harga,
          jumlah: ci.jumlah,
          subtotal: m.harga * ci.jumlah,
          gambar: m.gambar,
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
    const list = db.orders
      .filter((o) => (isAdmin ? true : o.id_user === user.id_user))
      .sort((a, b) => b.id_pesanan - a.id_pesanan)
      .map(enrichOrder);
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
    const list = db.orders
      .filter((o) => (isAdmin ? true : o.id_tenant === tenant.id_tenant))
      .sort((a, b) => b.id_pesanan - a.id_pesanan)
      .map(enrichOrder);
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
    const tenant = ensureTenantForVendor(user);
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi tenant berhasil diambil.",
      data: enrichTenant(tenant),
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
    if (imgInput !== undefined) {
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
    const tenant = isAdmin ? null : ensureTenantForVendor(user);
    if (tenant) saveDb(db);
    const menus = db.menus
      .filter((m) => (isAdmin ? true : m.id_tenant === tenant.id_tenant))
      .map(enrichMenu);
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
    if (body.gambar !== undefined) menu.gambar = body.gambar;
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
server.listen(PORT, "127.0.0.1", () => {
  console.log(`LetsOrder API server running at http://127.0.0.1:${PORT}/api`);
});
