// Route Notifications — dipindah verbatim dari backend/server.mjs (baris 4238-4273).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { sendJson } from "../lib/http.mjs";
import { db, saveDb } from "../lib/db.mjs";
import { requireAuth } from "../lib/auth.mjs";
export async function handleNotificationRoutes({ req, res, pathname, method, urlObj }) {
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
}