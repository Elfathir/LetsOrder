// Dipindah verbatim dari backend/server.mjs (src/lib/db.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { DB_PATH, TOKEN_INACTIVITY_TTL_MS } from "../config.mjs";
import { hashPassword, hashToken, parseTokenEntry } from "./crypto.mjs";
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

// Menulis perubahan tertunda sebelum proses berhenti (dipakai handler shutdown).
export function flushPendingWrites() {
  if (pendingSaveTimer || asyncWriteQueuedDb) {
    try {
      saveDb(db);
    } catch {}
  }
}

export { INITIAL_DB, db, flushScheduledSave, loadDb, purgeDummySeedRecords, saveDb, scheduleSaveDb, writeDbContentSync };