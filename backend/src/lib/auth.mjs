// Dipindah verbatim dari backend/server.mjs (src/lib/auth.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { TOKEN_INACTIVITY_TTL_MS, TOKEN_TOUCH_DEBOUNCE_MS } from "../config.mjs";
import { hashToken, parseTokenEntry } from "./crypto.mjs";
import { logSecurityEvent } from "./security.mjs";
import { getClientIp, sendJson } from "./http.mjs";
import { db, saveDb } from "./db.mjs";
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

// Menghapus akun beserta seluruh data miliknya (tenant, menu, pesanan, ulasan, notifikasi, chat).
function deleteUserAccount(user) {
  const userId = Number(user.id_user);
  const removedTenantIds = new Set(
    db.tenants.filter((t) => Number(t.id_user) === userId).map((t) => Number(t.id_tenant))
  );
  const removedOrderIds = new Set(
    db.orders
      .filter((o) => Number(o.id_user) === userId || removedTenantIds.has(Number(o.id_tenant)))
      .map((o) => Number(o.id_pesanan))
  );

  db.users = db.users.filter((u) => Number(u.id_user) !== userId);
  db.tenants = db.tenants.filter((t) => Number(t.id_user) !== userId);
  db.menus = db.menus.filter((m) => !removedTenantIds.has(Number(m.id_tenant)));
  db.promos = (db.promos || []).filter((p) => !removedTenantIds.has(Number(p.id_tenant)));
  db.orders = db.orders.filter((o) => !removedOrderIds.has(Number(o.id_pesanan)));
  db.payments = (db.payments || []).filter((p) => !removedOrderIds.has(Number(p.id_pesanan)));
  db.reviews = (db.reviews || []).filter(
    (r) => !removedTenantIds.has(Number(r.id_tenant)) && Number(r.id_user) !== userId
  );
  db.notifications = (db.notifications || []).filter(
    (n) => Number(n.id_user) !== userId && !removedOrderIds.has(Number(n.id_pesanan))
  );
  db.messages = (db.messages || []).filter(
    (m) => !removedOrderIds.has(Number(m.id_pesanan)) && Number(m.id_pengirim) !== userId
  );
  if (db.carts && typeof db.carts === "object") delete db.carts[String(userId)];
  delete db.passwordResets[userId];
  revokeUserTokens(userId);
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

export { deleteUserAccount, ensureTenantForVendor, getAuthUser, issueUserSession, requireAuth, requireRole, revokeUserTokens, sanitizeUserResponse };