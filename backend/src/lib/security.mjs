// Dipindah verbatim dari backend/server.mjs (src/lib/security.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
function logSecurityEvent(event, meta = {}) {
  try {
    console.warn(
      JSON.stringify({
        ts: new Date().toISOString(),
        security_event: event,
        ...meta,
      })
    );
  } catch {
    // Ignore logging errors
  }
}

export { logSecurityEvent };