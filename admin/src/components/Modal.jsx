import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, subtitle, onClose, children, footer, maxWidth = 640 }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop animate-fade" onMouseDown={onClose} role="presentation">
      <div
        className="admin-modal animate-modal-zoom"
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-head">
          <div style={{ minWidth: 0 }}>
            <h2 className="admin-modal-title">{title}</h2>
            {subtitle ? <p className="admin-modal-subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="admin-icon-btn btn-interactive"
            onClick={onClose}
            aria-label="Tutup"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer ? <div className="admin-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
