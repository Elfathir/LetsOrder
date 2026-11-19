#!/usr/bin/env node
/**
 * Membuat / memperbarui akun Administrator pada database development `server.mjs`
 * (backend/storage/app/db.json).
 *
 * Pemakaian:
 *   node scripts/create-admin.mjs
 *   node scripts/create-admin.mjs <username> <email> <password> [nama]
 *   node scripts/create-admin.mjs --username=admin --email=admin@upnvj.ac.id --password=rahasia123
 *
 * PENTING: hentikan dulu `node server.mjs` sebelum menjalankan script ini.
 * Server menyimpan database di memori dan menulis ulang file saat ada perubahan,
 * sehingga akun yang dibuat saat server masih berjalan bisa tertimpa.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, "..");
const DB_PATH = process.env.LETSORDER_DB_PATH
  ? path.resolve(process.env.LETSORDER_DB_PATH)
  : path.join(BACKEND_DIR, "storage", "app", "db.json");

const DEFAULTS = {
  username: "admin",
  email: "admin@upnvj.ac.id",
  password: "password123",
  nama: "Administrator",
};

function readFlag(name) {
  const hit = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : "";
}

const positional = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const username = String(positional[0] || readFlag("username") || DEFAULTS.username).trim();
const email = String(positional[1] || readFlag("email") || DEFAULTS.email)
  .trim()
  .toLowerCase();
const password = String(positional[2] || readFlag("password") || DEFAULTS.password);
const nama = String(positional[3] || readFlag("nama") || DEFAULTS.nama).trim();

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

if (!/^[a-z0-9._-]{3,50}$/i.test(username)) {
  fail("Username 3–50 karakter, hanya huruf, angka, titik, garis bawah, atau strip.");
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  fail("Format email tidak valid.");
}
if (password.length < 8) {
  fail("Password minimal 8 karakter untuk akun Administrator.");
}

// Harus sama persis dengan hashPassword() di server.mjs
function hashPassword(rawPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(rawPassword), salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function emptyDatabase() {
  return {
    users: [],
    categories: [],
    tenants: [],
    menus: [],
    carts: {},
    orders: [],
    payments: [],
    reviews: [],
    promos: [],
    notifications: [],
    messages: [],
    tokens: {},
    passwordResets: {},
  };
}

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.log(`• ${path.relative(process.cwd(), DB_PATH)} belum ada, dibuat database kosong.`);
    return emptyDatabase();
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : emptyDatabase();
  } catch {
    fail(`File database tidak bisa dibaca sebagai JSON: ${DB_PATH}`);
  }
}

function saveDatabase(database) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(database));
  fs.renameSync(tmpPath, DB_PATH);
}

const database = loadDatabase();
database.users = Array.isArray(database.users) ? database.users : [];

const existing = database.users.find(
  (user) =>
    String(user.username || "").toLowerCase() === username.toLowerCase() ||
    String(user.email || "").toLowerCase() === email
);

const passwordHash = hashPassword(password);

if (existing) {
  existing.username = username;
  existing.email = email;
  existing.nama = nama || existing.nama || DEFAULTS.nama;
  existing.password = passwordHash;
  existing.peran = "Administrator";
  existing.avatar = existing.avatar || "";
  saveDatabase(database);
  console.log(`✔ Akun Administrator diperbarui: ${username} <${email}> (id_user ${existing.id_user})`);
} else {
  const nextId =
    Math.max(0, ...database.users.map((user) => Number(user.id_user) || 0)) + 1;
  database.users.push({
    id_user: nextId,
    username,
    nama: nama || DEFAULTS.nama,
    email,
    password: passwordHash,
    peran: "Administrator",
    avatar: "",
  });
  saveDatabase(database);
  console.log(`✔ Akun Administrator dibuat: ${username} <${email}> (id_user ${nextId})`);
}

console.log("");
console.log("Login admin:");
console.log(`  identifier : ${username}  atau  ${email}`);
console.log(`  password   : ${password === DEFAULTS.password ? "(password default — segera ganti!)" : "(password yang Anda tentukan)"}`);
console.log("");
console.log("Langkah selanjutnya:");
console.log("  1. Jalankan backend : cd backend && node server.mjs");
console.log("  2. Jalankan admin   : cd admin && npm run dev");
console.log("  3. Buka             : http://localhost:5174");
