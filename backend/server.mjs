import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "storage", "app", "db.json");
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB limit per request body

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

function constantTimeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function validateFrontendOrigin(candidate) {
  try {
    const parsed = new URL(String(candidate || ""));
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      ALLOWED_ORIGINS.has(parsed.origin)
    ) {
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
  if (trimmed.length > 1_600_000) return false;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
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

function calculateServerPromoDiscount(promoCode, subtotal) {
  const code = String(promoCode || "").trim().toUpperCase();
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
  notifications: [],
  tokens: {},
  passwordResets: {},
};

function saveDb(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      if (parsed && Array.isArray(parsed.users) && parsed.clean_project_v2) {
        if (!parsed.passwordResets || typeof parsed.passwordResets !== "object") {
          parsed.passwordResets = {};
        }
        let migrated = false;
        for (const u of parsed.users) {
          if (u.password && !String(u.password).startsWith("scrypt:")) {
            u.password = hashPassword(u.password);
            migrated = true;
          }
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

function enrichMenu(menu) {
  const tenant = db.tenants.find((t) => t.id_tenant === menu.id_tenant) || null;
  const category = db.categories.find((c) => c.id_kategori === menu.id_kategori) || null;
  return {
    ...menu,
    available: Boolean(menu.status_tersedia),
    tenant_name: tenant?.nama_tenant || menu.tenant_name || "Canteen Tenant",
    kategori_nama: category?.nama_kategori || menu.kategori_nama || "Rice & Mains",
    tenant,
    category,
  };
}

function enrichOrder(order) {
  const tenant = db.tenants.find((t) => t.id_tenant === order.id_tenant) || null;
  const user = db.users.find((u) => u.id_user === order.id_user) || null;
  const details = (order.details || []).map((d) => {
    const m = db.menus.find((x) => x.id_menu === d.id_menu);
    return {
      ...d,
      gambar: m?.gambar || d.gambar || "",
      menu: m || null,
    };
  });
  return {
    ...order,
    tenant,
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
    Vary: "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
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
  if (!token || !db.tokens[token]) return null;
  const userId = db.tokens[token];
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
      rating: "5.0",
      estimasi_menit: "5-10 min",
      kategori_utama: "Rice & Mains",
      logo: "",
      gambar: "",
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
  db.tokens[token] = user.id_user;
  saveDb(db);
  return { token, userPayload: sanitizeUserResponse(user, tenant) };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    const headers = getCorsHeaders(req);
    delete headers["Content-Type"];
    res.writeHead(204, headers);
    return res.end();
  }

  const urlObj = new URL(req.url, "http://127.0.0.1:8000");
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
        if (tokenInfo.aud && tokenInfo.aud !== expectedClientId) {
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
      if (process.env.NODE_ENV !== "production") {
        // Out-of-band local dev log (never returned in HTTP response)
        console.info(`[LetsOrder Local Reset Code] user=${user.username} code=${resetCode} (expires 15m)`);
      }
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
    if (token && db.tokens[token]) {
      delete db.tokens[token];
      saveDb(db);
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
      data: db.tenants,
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
    if (menuTenant && !menuTenant.status_buka) {
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
    if (!tenant || !tenant.status_buka) {
      return sendJson(req, res, 422, {
        success: false,
        message: "Tenant sedang tutup dan tidak dapat menerima pesanan.",
      });
    }

    const subtotal = details.reduce((s, d) => s + d.subtotal, 0);
    const promoDiscount = calculateServerPromoDiscount(body.promo_code, subtotal);
    const totalHarga = Math.max(0, subtotal - promoDiscount);

    const nextOrderId = Math.max(100, ...db.orders.map((o) => o.id_pesanan)) + 1;
    const queueSeq = db.orders.length + 1;
    const queueNum = `A-${String(queueSeq).padStart(3, "0")}`;

    const newOrder = {
      id_pesanan: nextOrderId,
      id_user: user.id_user,
      id_tenant: targetTenantId,
      nomor_antrean: queueNum,
      status_pesanan: "Menunggu Pembayaran",
      total_harga: totalHarga,
      promo_code: promoDiscount > 0 ? String(body.promo_code).toUpperCase() : null,
      catatan: String(body.catatan || "").slice(0, 500),
      waktu_pesan: new Date().toISOString().slice(0, 19).replace("T", " "),
      user_name: user.nama || user.username,
      details,
    };

    db.orders.unshift(newOrder);
    db.carts[user.id_user] = [];

    db.notifications.unshift({
      id_notifikasi: Date.now(),
      id_user: user.id_user,
      id_pesanan: nextOrderId,
      pesan: `Pesanan ${queueNum} berhasil dibuat. Silakan selesaikan pembayaran QRIS.`,
      status_baca: false,
      waktu: newOrder.waktu_pesan,
    });

    if (tenant.id_user && tenant.id_user !== user.id_user) {
      db.notifications.unshift({
        id_notifikasi: Date.now() + 1,
        id_user: tenant.id_user,
        id_pesanan: nextOrderId,
        pesan: `Pesanan baru nomor antrean ${queueNum} telah dibuat oleh ${user.nama || user.username}.`,
        status_baca: false,
        waktu: newOrder.waktu_pesan,
      });
    }

    saveDb(db);

    return sendJson(req, res, 201, {
      success: true,
      message: "Pesanan berhasil dibuat.",
      data: enrichOrder(newOrder),
    });
  }

  const orderPayVerifyMatch = pathname.match(/^\/orders\/(\d+)\/payment\/verify$/);
  if (orderPayVerifyMatch && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    const orderId = Number(orderPayVerifyMatch[1]);
    const ord = db.orders.find((o) => o.id_pesanan === orderId);
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
    ord.status_pesanan = "Sedang Diproses";
    db.notifications.unshift({
      id_notifikasi: Date.now(),
      id_user: ord.id_user,
      id_pesanan: ord.id_pesanan,
      pesan: `Pembayaran pesanan ${ord.nomor_antrean} terverifikasi! Dapur sedang menyiapkan makanan Anda.`,
      status_baca: false,
      waktu: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    saveDb(db);
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
    if (body.status_pesanan === "Siap Diambil") {
      const firstMenu = ord.details?.[0];
      if (firstMenu) {
        const m = db.menus.find((x) => x.id_menu === firstMenu.id_menu);
        if (m) m.sold_today = (m.sold_today || 0) + (firstMenu.jumlah || 1);
      }
    }
    db.notifications.unshift({
      id_notifikasi: Date.now(),
      id_user: ord.id_user,
      id_pesanan: ord.id_pesanan,
      pesan: `Status pesanan ${ord.nomor_antrean} diperbarui menjadi: ${body.status_pesanan}.`,
      status_baca: false,
      waktu: new Date().toISOString().slice(0, 19).replace("T", " "),
    });
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Status pesanan berhasil diperbarui.",
      data: enrichOrder(ord),
    });
  }

  // ---- Protected Vendor Tenant & Menu Management Routes ----

  if (pathname === "/vendor/tenant" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const tenant = ensureTenantForVendor(user);
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi tenant berhasil diambil.",
      data: tenant,
    });
  }

  if (pathname === "/vendor/tenant" && (method === "PUT" || method === "PATCH")) {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Payload terlalu besar." });
    }
    if (body.gambar !== undefined && !isSafeImageInput(body.gambar)) {
      return sendJson(req, res, 422, { success: false, message: "Format gambar tenant tidak valid." });
    }
    const tenant = ensureTenantForVendor(user);
    if (body.nama_tenant !== undefined) tenant.nama_tenant = String(body.nama_tenant).trim().slice(0, 100);
    if (body.deskripsi !== undefined) tenant.deskripsi = String(body.deskripsi).slice(0, 500);
    if (body.booth !== undefined) tenant.booth = String(body.booth).slice(0, 100);
    if (body.gambar !== undefined) {
      tenant.gambar = body.gambar;
      tenant.logo = body.gambar;
    }
    if (body.status_buka !== undefined) tenant.status_buka = Boolean(body.status_buka);
    saveDb(db);
    return sendJson(req, res, 200, {
      success: true,
      message: "Informasi tenant berhasil diperbarui.",
      data: tenant,
    });
  }

  if (pathname === "/vendor/menus" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user || !requireRole(req, res, user, "Vendor", "Administrator")) return;
    const isAdmin = String(user.peran).toLowerCase() === "administrator";
    const tenant = isAdmin ? null : ensureTenantForVendor(user);
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
    const harga = Math.max(0, Number(String(body.harga || 0).replace(/\D/g, "")));
    const estimasiMenit = Math.max(1, Number(body.estimasi_menit || 8));
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
      rating: "5.0",
      reviews: 1,
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
    if (body.estimasi_menit !== undefined) menu.estimasi_menit = Math.max(1, Number(body.estimasi_menit));
    if (body.kategori_nama !== undefined) {
      const c = db.categories.find((x) => x.nama_kategori === body.kategori_nama);
      if (c) menu.id_kategori = c.id_kategori;
    }
    if (body.harga !== undefined) menu.harga = Math.max(0, Number(body.harga));
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
});

const PORT = Number(process.env.PORT || 8000);
server.listen(PORT, "127.0.0.1", () => {
  console.log(`LetsOrder API server running at http://127.0.0.1:${PORT}/api`);
});
