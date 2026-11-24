// Potongan gaya layout yang paling sering diulang di seluruh tampilan.
// Pakai dengan disebar: style={{ ...LAYOUT.center, gap: 8 }}.
export const LAYOUT = {
  center: { display: "flex", alignItems: "center", justifyContent: "center" },
  between: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  row: { display: "flex", alignItems: "center" },
  inlineRow: { display: "inline-flex", alignItems: "center" },
};
