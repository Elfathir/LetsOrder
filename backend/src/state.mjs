// Dipindah verbatim dari backend/server.mjs (src/state.mjs).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
const rateLimitBuckets = new Map();
export { rateLimitBuckets };
