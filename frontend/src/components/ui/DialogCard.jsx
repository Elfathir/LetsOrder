// Kartu putih di dalam <Modal>. Menyatukan "resep" panel dialog yang sebelumnya
// ditulis ulang di setiap modal (radius, padding, shadow, border).
const BASE_STYLE = {
  width: "100%",
  backgroundColor: "var(--bg-card)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
  border: "1px solid var(--border-light)",
};

export default function DialogCard({ maxWidth = 420, padding = 24, style, className, children, ...rest }) {
  return (
    <div
      className={["animate-modal-zoom", className].filter(Boolean).join(" ")}
      style={{ ...BASE_STYLE, maxWidth, padding, ...style }}
      // Menahan klik agar tidak dianggap sebagai klik backdrop oleh <Modal>.
      onClick={(event) => event.stopPropagation()}
      {...rest}
    >
      {children}
    </div>
  );
}
