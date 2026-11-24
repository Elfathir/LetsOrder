// Dipindah verbatim dari backend/server.mjs (src/lib/crypto.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { STATE_SECRET } from "../config.mjs";
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


function constantTimeEqualStr(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
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

export { constantTimeEqualStr, hashPassword, hashToken, parseTokenEntry, sha256Hex, signOAuthState, verifyOAuthState, verifyPassword };