// Route Auth — dipindah verbatim dari backend/server.mjs (baris 1077-1794).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { DEFAULT_FRONTEND_URL } from "../config.mjs";
import { constantTimeEqualStr, hashPassword, hashToken, sha256Hex, verifyPassword } from "../lib/crypto.mjs";
import { logSecurityEvent } from "../lib/security.mjs";
import { checkRateLimit, getClientIp, isSafeImageInput, isValidEmail, parseBody, sendJson, validateFrontendOrigin } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { enrichTenant, isMediaEndpointRef, readPhotoFocus } from "../lib/enrich.mjs";
import { deleteUserAccount, ensureTenantForVendor, issueUserSession, requireAuth, revokeUserTokens, sanitizeUserResponse } from "../lib/auth.mjs";
export async function handleAuthRoutes({ req, res, pathname, method, urlObj }) {
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
    Object.assign(user, readPhotoFocus(body));

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
      Object.assign(tenant, readPhotoFocus(body));
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

  if (pathname === "/auth/account" && method === "DELETE") {
    if (!checkRateLimit(req, res, "auth_delete_account", 5, 60_000)) return;
    const user = requireAuth(req, res);
    if (!user) return;

    if (user.peran === "Administrator") {
      return sendJson(req, res, 403, {
        success: false,
        message: "Akun administrator tidak dapat dihapus dari halaman ini.",
      });
    }

    const body = await parseBody(req);
    if (body.__tooLarge) {
      return sendJson(req, res, 413, { success: false, message: "Ukuran payload melebihi batas." });
    }

    const confirmText = String(body.confirm || "").trim().toUpperCase().replace(/\s+/g, " ");
    if (confirmText !== "HAPUS AKUN" && confirmText !== "DELETE ACCOUNT") {
      return sendJson(req, res, 422, {
        success: false,
        message: "Ketik \"HAPUS AKUN\" pada kolom konfirmasi untuk melanjutkan.",
      });
    }

    // Login Google sudah dihapus, jadi semua akun punya password lokal.
    if (!verifyPassword(String(body.password || ""), user.password)) {
      logSecurityEvent("account_delete_failed", { user_id: user.id_user, ip: getClientIp(req) });
      return sendJson(req, res, 422, {
        success: false,
        message: "Password tidak sesuai. Akun Anda tidak dihapus.",
      });
    }

    const ownTenantIds = new Set(
      db.tenants
        .filter((t) => Number(t.id_user) === Number(user.id_user))
        .map((t) => Number(t.id_tenant))
    );
    if (ownTenantIds.size > 0) {
      const activeOrder = db.orders.find(
        (o) =>
          ownTenantIds.has(Number(o.id_tenant)) &&
          !["Selesai", "Dibatalkan"].includes(String(o.status_pesanan || ""))
      );
      if (activeOrder) {
        return sendJson(req, res, 409, {
          success: false,
          message:
            "Akun tenant tidak dapat dihapus selama masih ada pesanan yang belum selesai. Selesaikan atau batalkan pesanan tersebut terlebih dahulu.",
        });
      }
    }

    deleteUserAccount(user);
    saveDb(db);
    logSecurityEvent("account_deleted", {
      user_id: user.id_user,
      peran: user.peran,
      ip: getClientIp(req),
    });

    return sendJson(req, res, 200, {
      success: true,
      message: "Akun Anda berhasil dihapus. Terima kasih telah menggunakan LetsOrder.",
      data: null,
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
}
