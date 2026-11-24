import { flushSync } from "react-dom";
import themeTokens from "../../../theme.json";

const THEME_KEY = "letsorder_theme";
const TOKEN_STYLE_ID = "letsorder-theme-tokens";

export function applyDocumentTheme(nextTheme) {
  const resolved = nextTheme === "dark" ? "dark" : "light";
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-theme") !== resolved) {
      document.documentElement.setAttribute("data-theme", resolved);
    }
    const meta = document.querySelector?.('meta[name="theme-color"]');
    if (meta) {
      const nextColor = resolved === "dark" ? themeTokens.canvas.dark : themeTokens.canvas.light;
      if (meta.getAttribute("content") !== nextColor) {
        meta.setAttribute("content", nextColor);
      }
    }
  }
  return resolved;
}

export function readStoredTheme() {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

let currentThemeState = readStoredTheme();
const themeListeners = new Set();
const WAVE_DURATION = 420;
// If the circular wave is interrupted (HMR, tab switch, thrown error) the lock must never stick.
const WAVE_SAFETY_MS = WAVE_DURATION + 600;
let cancelActiveThemeWave = null;
let themeAnimatingUntil = 0;
let isThemeTransitionLocked = false;
let themeUnlockTimer = 0;
let themeWaveStartedAt = 0;
let themeLockSafetyTimer = 0;

function clearWaveSafetyTimer() {
  if (themeLockSafetyTimer) {
    clearTimeout(themeLockSafetyTimer);
    themeLockSafetyTimer = 0;
  }
}

function releaseThemeLock() {
  clearWaveSafetyTimer();
  cancelActiveThemeWave = null;
  themeAnimatingUntil = 0;
  themeWaveStartedAt = 0;
  isThemeTransitionLocked = false;
  if (typeof document !== "undefined") {
    document.documentElement.classList.remove("theme-wave-active");
    document.querySelectorAll?.("[data-theme-wave-host]").forEach((node) => node.remove());
  }
  themeListeners.forEach((listener) => listener());
}

export function isThemeAnimating() {
  return (
    isThemeTransitionLocked ||
    cancelActiveThemeWave !== null ||
    (typeof performance !== "undefined" && performance.now() < themeAnimatingUntil)
  );
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
    localStorage.setItem(THEME_KEY, resolved);
  } catch {
    // ignore storage restrictions
  }
}

export function commitAppTheme(nextTheme, deferStorage = false) {
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
  // Block repeated clicks until the full circular transition finishes and settles,
  // but never stay blocked: if a wave is interrupted the lock self-heals instead.
  if (isThemeAnimating()) {
    const stuck =
      themeWaveStartedAt > 0 &&
      typeof performance !== "undefined" &&
      performance.now() - themeWaveStartedAt > WAVE_SAFETY_MS;
    if (!stuck) return;
    const pendingWave = cancelActiveThemeWave;
    releaseThemeLock();
    if (pendingWave) pendingWave();
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

  if (themeUnlockTimer) {
    clearTimeout(themeUnlockTimer);
    themeUnlockTimer = 0;
  }
  isThemeTransitionLocked = true;
  themeWaveStartedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
  clearWaveSafetyTimer();
  themeLockSafetyTimer = setTimeout(() => {
    themeLockSafetyTimer = 0;
    if (isThemeTransitionLocked) releaseThemeLock();
  }, WAVE_SAFETY_MS);

  document.documentElement.classList.add("theme-wave-active");
  rootEl.setAttribute("data-theme-scope", prevTheme);

  try {
    flushSync(() => {
      commitAppTheme(nextTheme, true);
    });
  } catch {
    rootEl.removeAttribute("data-theme-scope");
    commitAppTheme(nextTheme);
    releaseThemeLock();
    return;
  }

  // Use the real layout box of #root (excludes scrollbar) so the clone lines up pixel-perfectly
  const rootRect = rootEl.getBoundingClientRect();
  const viewW = document.documentElement.clientWidth || vw;
  const viewH = document.documentElement.clientHeight || vh;

  const clone = rootEl.cloneNode(true);
  clone.removeAttribute("id");
  clone.setAttribute("data-theme-scope", nextTheme);
  clone.setAttribute("aria-hidden", "true");
  clone.style.cssText += `;position:absolute;left:${rootRect.left}px;top:${rootRect.top}px;width:${rootRect.width}px;min-height:${Math.max(rootRect.height, viewH)}px;pointer-events:none;margin:0;`;

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
  // Preserve scroll positions of inner scrollable areas
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
  const innerBg =
    nextTheme === "dark"
      ? themeTokens.canvas.dark
      : hasHeader
        ? themeTokens.canvas.light
        : themeTokens.canvas.lightAlt;

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
    clearWaveSafetyTimer();
    // 1. Switch the real UI to the new theme while transitions are still disabled,
    //    and force a style flush so buttons with CSS transitions do NOT animate from old colors.
    rootEl.removeAttribute("data-theme-scope");
    void rootEl.offsetWidth;
    if (typeof window.getComputedStyle === "function") {
      window.getComputedStyle(rootEl).color;
    }
    if (host.parentNode) host.parentNode.removeChild(host);
    if (isCurrent) {
      cancelActiveThemeWave = null;
      themeAnimatingUntil = 0;
      themeWaveStartedAt = 0;
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
