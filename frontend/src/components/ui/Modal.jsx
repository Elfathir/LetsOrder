import { useEffect } from "react";

// Latar gelap + blur untuk seluruh modal/dialog. Sebelumnya blok ini disalin
// manual di 10 tempat dengan nilai yang sedikit berbeda-beda.
const BACKDROP_STYLE = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--backdrop)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

/**
 * @param {number} zIndex  lapisan modal (default 1200)
 * @param {() => void} [onClose]  dipanggil saat backdrop diklik atau Escape ditekan
 * @param {object} [style]  override gaya backdrop (mis. padding, alignItems)
 */
export default function Modal({ zIndex = 1200, onClose, style, className, children, ...rest }) {
  useEffect(() => {
    if (!onClose) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={["animate-fade", className].filter(Boolean).join(" ")}
      style={{ ...BACKDROP_STYLE, zIndex, ...style }}
      onClick={
        onClose
          ? (event) => {
              // Klik di dalam dialog tidak menutup; klik backdrop menutup.
              if (event.target === event.currentTarget) onClose();
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}
