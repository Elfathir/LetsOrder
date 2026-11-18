export function applyDocumentTheme(nextTheme) {
  const resolved = nextTheme === "dark" ? "dark" : "light";
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-theme") !== resolved) {
      document.documentElement.setAttribute("data-theme", resolved);
    }
    const meta = document.querySelector?.('meta[name="theme-color"]');
    if (meta) {
      const nextColor = resolved === "dark" ? "#171211" : "#FFFFFF";
      if (meta.getAttribute("content") !== nextColor) {
        meta.setAttribute("content", nextColor);
      }
    }
  }
  return resolved;
}
