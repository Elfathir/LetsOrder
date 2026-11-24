// Dipindah verbatim dari backend/server.mjs (src/config.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
const SRC_DIR = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.resolve(SRC_DIR, "..");
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

export { ALLOWED_ORIGINS, ALLOW_PAYMENT_SIMULATION, DB_PATH, DEFAULT_FRONTEND_URL, MAX_BODY_BYTES, SERVER_PROMOS, SESSION_INACTIVITY_DAYS, STATE_SECRET, TOKEN_INACTIVITY_TTL_MS, TOKEN_TOUCH_DEBOUNCE_MS, VALID_ORDER_STATUSES, loadEnvFile };