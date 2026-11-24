// Route Routes — dipindah verbatim dari backend/server.mjs (baris 1067-1073).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { sendJson } from "../lib/http.mjs";
export async function handleHealthRoutes({ req, res, pathname, method, urlObj }) {
  if (pathname === "/health" && method === "GET") {
    return sendJson(req, res, 200, {
      success: true,
      application: "LetsOrder.com",
      message: "API is available.",
    });
  }
}