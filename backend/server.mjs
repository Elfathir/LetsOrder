// Entry point tipis: membangun server HTTP + dispatcher, seluruh route ada di src/routes/*.
import http from "node:http";
// Config harus dievaluasi lebih dulu supaya .env sudah termuat sebelum modul lain membacanya.
import "./src/config.mjs";
import { sendJson, getCorsHeaders } from "./src/lib/http.mjs";
import { logSecurityEvent } from "./src/lib/security.mjs";
import { flushPendingWrites } from "./src/lib/db.mjs";
import { handleHealthRoutes } from "./src/routes/health.mjs";
import { handleAuthRoutes } from "./src/routes/auth.mjs";
import { handleCatalogRoutes } from "./src/routes/catalog.mjs";
import { handleCartRoutes } from "./src/routes/cart.mjs";
import { handleOrdersRoutes } from "./src/routes/orders.mjs";
import { handleVendorRoutes } from "./src/routes/vendor.mjs";
import { handleAdminRoutes } from "./src/routes/admin.mjs";
import { handleNotificationRoutes } from "./src/routes/notifications.mjs";

const API_ROUTE_HANDLERS = [
  handleHealthRoutes,
  handleAuthRoutes,
  handleCatalogRoutes,
  handleCartRoutes,
  handleOrdersRoutes,
  handleVendorRoutes,
  handleAdminRoutes,
  handleNotificationRoutes,
];

async function handleApiRequest(req, res) {
  if (req.method === "OPTIONS") {
    const headers = getCorsHeaders(req);
    delete headers["Content-Type"];
    res.writeHead(204, headers);
    return res.end();
  }

  let urlObj;
  try {
    urlObj = new URL(req.url || "/", "http://127.0.0.1:8000");
  } catch {
    return sendJson(req, res, 400, { success: false, message: "Format URL tidak valid." });
  }
  const pathname = urlObj.pathname.replace(/^\/api(\/v1)?/, "") || "/";
  const method = req.method.toUpperCase();
  const ctx = { req, res, urlObj, pathname, method };

  // Respons bisa terkirim asinkron (gzip di sendJson), jadi tandai lewat writeHead/end,
  // bukan headersSent — kalau tidak, dispatcher bisa mengirim 404 susulan.
  let responded = false;
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = (...args) => {
    responded = true;
    return originalWriteHead(...args);
  };
  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    responded = true;
    return originalEnd(...args);
  };

  for (const handleRoutes of API_ROUTE_HANDLERS) {
    await handleRoutes(ctx);
    if (responded || res.__loResponded) return;
  }

  return sendJson(req, res, 404, {
    success: false,
    message: "Endpoint tidak ditemukan.",
  });
}

const server = http.createServer(async (req, res) => {
  try {
    await handleApiRequest(req, res);
  } catch (err) {
    logSecurityEvent("unhandled_server_error", {
      method: req.method,
      path: String(req.url || "").slice(0, 120),
      message: err?.message || "unknown",
    });
    if (!res.headersSent) {
      sendJson(req, res, 500, {
        success: false,
        message: "Terjadi kesalahan internal pada server.",
      });
    } else if (!res.writableEnded) {
      res.end();
    }
  }
});


const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");


function flushDbOnShutdown() {
  flushPendingWrites();
}

process.once("SIGINT", () => {
  flushDbOnShutdown();
  process.exit(0);
});
process.once("SIGTERM", () => {
  flushDbOnShutdown();
  process.exit(0);
});

server.listen(PORT, HOST, () => {
  console.log(`LetsOrder API server running at http://${HOST}:${PORT}/api`);
});
