// Dipindah verbatim dari backend/server.mjs (src/lib/crypto.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
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


export { constantTimeEqualStr, hashPassword, hashToken, parseTokenEntry, sha256Hex, verifyPassword };
