// Dipindah verbatim dari backend/server.mjs (src/lib/http.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { ALLOWED_ORIGINS, DEFAULT_FRONTEND_URL, MAX_BODY_BYTES } from "../config.mjs";
import { rateLimitBuckets } from "../state.mjs";
import { logSecurityEvent } from "./security.mjs";
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

// Gambar dikirim sebagai URL ringkas (/api/media/...) secara default.
// ?compact_media=0 atau ?compact_media=false memaksa base64 penuh.
function readCompactMedia(urlObj) {
  const raw = urlObj?.searchParams?.get("compact_media");
  return !(raw === "0" || raw === "false");
}
function sendJson(req, res, status, payload, extraHeaders = {}) {
  // Tandai respons sejak dipanggil: jalur gzip mengirim asinkron lewat callback zlib.
  res.__loResponded = true;
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

export { checkRateLimit, getClientIp, getCorsHeaders, isAllowedOrigin, isSafeImageInput, isValidEmail, parseBody, readCompactMedia, sendJson, validateFrontendOrigin };