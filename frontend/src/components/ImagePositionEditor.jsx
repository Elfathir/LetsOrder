import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Move, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Editor posisi foto: bingkai rasio tetap, foto digeser & di-zoom di dalamnya.
// Nilai yang disimpan hanya { x, y, zoom } sehingga bisa dibuka dan diubah lagi
// kapan saja tanpa merusak berkas aslinya.
export default function ImagePositionEditor({
  open,
  src,
  aspect = 4 / 3,
  value = null,
  onSave,
  onClose,
  lang = "ID",
  title,
  hint,
}) {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [zoom, setZoom] = useState(1);
  const frameRef = useRef(null);
  const dragRef = useRef(null);

  const isEn = lang === "EN";

  useEffect(() => {
    if (!open) return;
    setX(clamp(Number(value?.x ?? 50) || 50, 0, 100));
    setY(clamp(Number(value?.y ?? 50) || 50, 0, 100));
    setZoom(clamp(Number(value?.zoom ?? 1) || 1, 1, 3));
  }, [open, value?.x, value?.y, value?.zoom, src]);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: x,
      baseY: y,
      width: rect.width || 1,
      height: rect.height || 1,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture tidak wajib; drag tetap berjalan lewat listener window.
    }
  }, [x, y]);

  useEffect(() => {
    if (!open) return undefined;

    const onMove = (event) => {
      const drag = dragRef.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      const nextX = clamp(drag.baseX - (dx / drag.width) * (100 / zoom), 0, 100);
      const nextY = clamp(drag.baseY - (dy / drag.height) * (100 / zoom), 0, 100);
      setX(nextX);
      setY(nextY);
    };

    const onUp = (event) => {
      if (!dragRef.current || event.pointerId !== dragRef.current.pointerId) return;
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [open, zoom]);

  if (!open || !src) return null;

  const objectPosition = `${x}% ${y}%`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1600,
        backgroundColor: "rgba(42, 24, 18, 0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
      className="animate-fade"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="animate-modal-zoom"
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: "var(--radius-xl)",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          boxShadow: "var(--shadow-card)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-light)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <Move size={17} color="var(--orange)" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--maroon)" }}>
              {title || (isEn ? "Adjust photo position" : "Atur posisi foto")}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? "Close" : "Tutup"}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          <div
            ref={frameRef}
            onPointerDown={handlePointerDown}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${aspect}`,
              maxHeight: "52vh",
              margin: "0 auto",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              backgroundColor: "var(--bg-warm-img)",
              border: "1px solid var(--border-light)",
              cursor: dragRef.current ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `scale(${zoom})`,
                transformOrigin: objectPosition,
              }}
            >
              <img
                src={src}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition,
                  pointerEvents: "none",
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxShadow: "inset 0 0 0 2px rgba(248, 163, 75, 0.55)",
                borderRadius: "var(--radius-lg)",
                pointerEvents: "none",
              }}
            />
          </div>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            {hint ||
              (isEn
                ? "Drag the photo to set which part stays visible. Zoom only changes scale, the frame size stays the same."
                : "Geser foto untuk menentukan bagian yang terlihat. Zoom hanya mengubah skala, ukuran bingkai tetap sama.")}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <ZoomOut size={16} color="var(--text-muted)" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(event) => setZoom(clamp(Number(event.target.value), 1, 3))}
              style={{ flex: 1, accentColor: "var(--orange)", cursor: "pointer" }}
              aria-label={isEn ? "Zoom" : "Zoom"}
            />
            <ZoomIn size={16} color="var(--text-muted)" />
            <span
              className="tabular"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--maroon)",
                minWidth: 42,
                textAlign: "right",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 20,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setX(50);
                setY(50);
                setZoom(1);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid var(--border-input)",
                backgroundColor: "var(--bg-card)",
                color: "var(--maroon)",
                borderRadius: "var(--radius-pill)",
                padding: "9px 16px",
                fontSize: 12.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} />
              {isEn ? "Reset" : "Atur ulang"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  border: "1px solid var(--border-input)",
                  backgroundColor: "transparent",
                  color: "var(--maroon)",
                  borderRadius: "var(--radius-pill)",
                  padding: "9px 18px",
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="button"
                onClick={() => onSave?.({ x, y, zoom })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: "none",
                  backgroundColor: "var(--orange)",
                  color: "var(--on-orange-text)",
                  borderRadius: "var(--radius-pill)",
                  padding: "10px 20px",
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                }}
              >
                <Check size={15} />
                {isEn ? "Use photo" : "Pakai foto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
