import { memo, useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import {
  applyDocumentTheme,
  getThemeBusySnapshot,
  getThemeSnapshot,
  subscribeTheme,
  toggleAppTheme,
} from "../utils/theme.js";

const ThemeToggleButton = memo(function ThemeToggleButton({
  darkTitle = "Aktifkan mode gelap",
  lightTitle = "Aktifkan mode terang",
  size = 36,
}) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot);
  const isBusy = useSyncExternalStore(subscribeTheme, getThemeBusySnapshot);
  const isDark = theme === "dark";
  const title = isDark ? lightTitle : darkTitle;

  useLayoutEffect(() => {
    if (typeof document === "undefined" || document.documentElement.getAttribute("data-theme") !== theme) {
      applyDocumentTheme(theme);
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={toggleAppTheme}
      disabled={isBusy}
      aria-busy={isBusy}
      title={title}
      aria-label={title}
      aria-pressed={isDark}
      data-testid="theme-toggle-btn"
      className="theme-toggle-btn btn-interactive"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "1px solid var(--border-light)",
        backgroundColor: "var(--bg-card)",
        color: isDark ? "var(--orange)" : "var(--maroon)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: isBusy ? "wait" : "pointer",
        flexShrink: 0,
        boxShadow: "none",
      }}
    >
      {isDark ? (
        <Sun size={size > 34 ? 16 : 15} strokeWidth={2.2} />
      ) : (
        <Moon size={size > 34 ? 16 : 15} strokeWidth={2.2} />
      )}
    </button>
  );
});

export default ThemeToggleButton;
