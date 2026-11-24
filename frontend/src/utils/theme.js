import { flushSync } from "react-dom";
import themeTokens from "../../../theme.json";

const THEME_KEY = "letsorder_theme";

const resolveTheme = (value) => (value === "dark" ? "dark" : "light");

// Menulis atribut data-theme + warna address bar. Token warnanya sendiri berasal dari theme.json.
export function applyDocumentTheme(nextTheme) {
  const resolved = resolveTheme(nextTheme);
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-theme") !== resolved) {
      document.documentElement.setAttribute("data-theme", resolved);
    }
    const meta = document.querySelector?.('meta[name="theme-color"]');
    if (meta) {
      const nextColor =
        resolved === "dark" ? themeTokens.canvas.dark : themeTokens.canvas.light;
      if (meta.getAttribute("content") !== nextColor) {
        meta.setAttribute("content", nextColor);
      }
    }
  }
  return resolved;
}

export function readStoredTheme() {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem("letsorder_theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

let currentThemeState = readStoredTheme();
const themeListeners = new Set();
let cancelActiveThemeWave = null;
let themeAnimatingUntil = 0;
let isThemeTransitionLocked = false;
let themeUnlockTimer = 0;

export function isThemeAnimating() {
  return (
    isThemeTransitionLocked ||
    cancelActiveThemeWave !== null ||
    (typeof performance !== "undefined" && performance.now() < themeAnimatingUntil)
  );
}

export async function waitForThemeTransitionIdle() {
  if (!isThemeAnimating()) return;
  await new Promise((resolve) => {
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const waitMs = Math.min(540, Math.max(16, Math.ceil(themeAnimatingUntil - now) + 80));
    setTimeout(resolve, waitMs);
  });
}

export function getThemeSnapshot() {
  return currentThemeState;
}

export function getThemeBusySnapshot() {
  return isThemeTransitionLocked;
}

export function subscribeTheme(listener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function persistThemePreference(resolved) {
  try {
    localStorage.setItem("letsorder_theme", resolved);
  } catch {
    // ignore storage restrictions
  }
}

function commitAppTheme(nextTheme, deferStorage = false) {
  const resolved = applyDocumentTheme(nextTheme);
  currentThemeState = resolved;
  if (deferStorage) {
    setTimeout(() => persistThemePreference(resolved), 0);
  } else {
    persistThemePreference(resolved);
  }
  themeListeners.forEach((listener) => listener());
}

export function toggleAppTheme(event) {
  // Block repeated clicks until the full circular transition finishes and settles
  if (isThemeAnimating()) {
    return;
  }

  const prevTheme = currentThemeState === "dark" ? "dark" : "light";
  const nextTheme = prevTheme === "dark" ? "light" : "dark";
  const rect = event?.currentTarget?.getBoundingClientRect?.();
  const vw = Math.max(window.innerWidth || 0, document.documentElement?.clientWidth || 0, 1);
  const vh = Math.max(window.innerHeight || 0, document.documentElement?.clientHeight || 0, 1);
  const x = Math.round(rect ? rect.left + rect.width / 2 : vw / 2);
  const y = Math.round(rect ? rect.top + rect.height / 2 : vh / 2);
  const startRadius = Math.max(14, rect && rect.width > 0 ? Math.round(rect.width / 2) : 18);
  const endRadius = Math.max(
    startRadius + 10,
    Math.ceil(Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)))
  );

  const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rootEl = typeof document !== "undefined" ? document.getElementById("root") : null;

  if (
    prefersReduced ||
    typeof document === "undefined" ||
    !document.body ||
    !rootEl ||
    typeof document.createElement("div").animate !== "function"
  ) {
    commitAppTheme(nextTheme);
    return;
  }

  const WAVE_DURATION = 420;

  if (themeUnlockTimer) {
    clearTimeout(themeUnlockTimer);
    themeUnlockTimer = 0;
  }
  isThemeTransitionLocked = true;

  document.documentElement.classList.add("theme-wave-active");
  rootEl.setAttribute("data-theme-scope", prevTheme);

  flushSync(() => {
    commitAppTheme(nextTheme, true);
  });

  // Use the real layout box of #root (excludes scrollbar) so the clone lines up pixel-perfectly
  const rootRect = rootEl.getBoundingClientRect();
  const viewW = document.documentElement.clientWidth || vw;
  const viewH = document.documentElement.clientHeight || vh;

  const clone = rootEl.cloneNode(true);
  clone.removeAttribute("id");
  clone.setAttribute("data-theme-scope", nextTheme);
  clone.setAttribute("aria-hidden", "true");
  clone.style.cssText += `;position:absolute;left:${rootRect.left}px;top:${rootRect.top}px;width:${rootRect.width}px;min-height:${Math.max(rootRect.height, viewH)}px;pointer-events:none;margin:0;`;

  // Note: sticky header needs no special handling — it sticks to the top of the (non-scrolled) inner container natively.

  const origFields = rootEl.querySelectorAll("input, textarea, select");
  const cloneFields = clone.querySelectorAll("input, textarea, select");
  for (let i = 0; i < origFields.length && i < cloneFields.length; i += 1) {
    cloneFields[i].value = origFields[i].value;
  }
  const cloneImgs = clone.querySelectorAll("img");
  for (let i = 0; i < cloneImgs.length; i += 1) {
    cloneImgs[i].setAttribute("decoding", "sync");
    cloneImgs[i].setAttribute("loading", "eager");
  }
  // Preserve scroll positions of inner scrollable areas (e.g. horizontal lists)
  const origAll = rootEl.querySelectorAll("*");
  const cloneAll = clone.querySelectorAll("*");
  const scrollFix = [];
  for (let i = 0; i < origAll.length && i < cloneAll.length; i += 1) {
    if (origAll[i].scrollTop || origAll[i].scrollLeft) {
      scrollFix.push([cloneAll[i], origAll[i].scrollLeft, origAll[i].scrollTop]);
    }
  }

  const host = document.createElement("div");
  host.setAttribute("data-theme-wave-host", "true");
  host.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:99999",
    "pointer-events:none",
    "overflow:hidden",
  ].join(";");

  // Circle grows by real size (width/height/border-radius), NOT by scale().
  // The cloned UI inside is only translated by whole pixels, so it is never resampled -> stays 100% crisp, zero wobble.
  const finalRadius = endRadius + 2;
  const circle = document.createElement("div");
  circle.setAttribute("data-theme-wave-circle", "true");
  const inner = document.createElement("div");
  inner.setAttribute("data-theme-wave-inner", "true");

  const applyRadius = (r) => {
    const left = x - r;
    const top = y - r;
    const d = r * 2;
    circle.style.width = `${d}px`;
    circle.style.height = `${d}px`;
    circle.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    inner.style.transform = `translate3d(${-left}px, ${-top}px, 0)`;
  };

  circle.style.cssText = [
    "position:fixed",
    "left:0",
    "top:0",
    "border-radius:50%",
    "overflow:hidden",
    "box-shadow:none",
    "border:none",
    "outline:none",
    "pointer-events:none",
    "contain:layout paint",
  ].join(";");

  const hasHeader = Boolean(document.querySelector?.("header"));
  const innerBg = nextTheme === "dark" ? "#171211" : hasHeader ? "#FFFFFF" : "#FAF6F2";

  inner.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    `width:${viewW}px`,
    `height:${viewH}px`,
    `background-color:${innerBg}`,
    "overflow:hidden",
    "pointer-events:none",
    "will-change:transform",
  ].join(";");

  applyRadius(startRadius);
  inner.appendChild(clone);
  circle.appendChild(inner);
  host.appendChild(circle);
  document.body.appendChild(host);
  for (let i = 0; i < scrollFix.length; i += 1) {
    const [el, sl, st] = scrollFix[i];
    el.scrollLeft = sl;
    el.scrollTop = st;
  }

  const raf =
    typeof window.requestAnimationFrame === "function"
      ? window.requestAnimationFrame.bind(window)
      : (cb) => setTimeout(() => cb(typeof performance !== "undefined" ? performance.now() : Date.now()), 16);
  const caf =
    typeof window.cancelAnimationFrame === "function"
      ? window.cancelAnimationFrame.bind(window)
      : (id) => clearTimeout(id);

  let aborted = false;
  let rafId = 0;
  let startTs = 0;

  themeAnimatingUntil =
    (typeof performance !== "undefined" ? performance.now() : Date.now()) + WAVE_DURATION + 60;

  const cleanup = () => {
    const isCurrent = cancelActiveThemeWave === abortCurrent;
    // 1. Switch the real UI to the new theme while transitions are still disabled,
    //    and force a style flush so buttons with CSS transitions do NOT animate from old colors (white flash).
    rootEl.removeAttribute("data-theme-scope");
    void rootEl.offsetWidth;
    if (typeof window.getComputedStyle === "function") {
      window.getComputedStyle(rootEl).color;
    }
    if (host.parentNode) host.parentNode.removeChild(host);
    if (isCurrent) {
      cancelActiveThemeWave = null;
      themeAnimatingUntil = 0;
      // 2. Re-enable transitions only after the new colors are committed.
      document.documentElement.classList.remove("theme-wave-active");
      themeUnlockTimer = setTimeout(() => {
        themeUnlockTimer = 0;
        isThemeTransitionLocked = false;
        themeListeners.forEach((listener) => listener());
      }, 60);
    }
  };

  const abortCurrent = () => {
    aborted = true;
    if (rafId) caf(rafId);
    rafId = 0;
    cleanup();
  };

  cancelActiveThemeWave = abortCurrent;

  const step = (ts) => {
    if (aborted) return;
    if (!startTs) startTs = ts;
    const t = Math.min(1, (ts - startTs) / WAVE_DURATION);
    // Linear: one start point (button size) -> one end point (full screen), no intermediate stop
    applyRadius(Math.round(startRadius + (finalRadius - startRadius) * t));
    if (t < 1) {
      rafId = raf(step);
    } else {
      rafId = 0;
      cleanup();
    }
  };
  rafId = raf(step);
}

const TOKEN_STYLE_ID = "letsorder-theme-tokens";

const toCssVars = (tokens) =>
  Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");

// theme.json -> CSS variable di :root (dan di klon transisi tema).
// Dipanggil sekali sebelum React render supaya tidak ada kedip warna.
export function installThemeTokens() {
  if (typeof document === "undefined" || document.getElementById(TOKEN_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = TOKEN_STYLE_ID;
  style.textContent = [
    `:root, [data-theme-scope="light"] { ${toCssVars({
      ...themeTokens.fonts,
      ...themeTokens.radius,
      ...themeTokens.color.light,
      ...themeTokens.shadow.light,
    })} }`,
    `:root[data-theme="dark"], [data-theme-scope="dark"] { ${toCssVars({
      ...themeTokens.color.dark,
      ...themeTokens.shadow.dark,
    })} }`,
  ].join("\n");
  document.head.appendChild(style);
}
