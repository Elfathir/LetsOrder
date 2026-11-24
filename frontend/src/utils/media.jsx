import { memo, useEffect, useState } from "react";
import { ShoppingBag, Store } from "lucide-react";
import { resolveMediaUrl } from "../services/api";

// Kompresi gambar di browser + <SafeImage> yang menolak URL tidak aman/rusak.
export function readAndCompressImageFile(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("File tidak ditemukan."));
    if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
      return reject(new Error("Format gambar harus JPG, PNG, WEBP, atau GIF."));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return reject(new Error("File gambar kosong."));
      if (file.size <= 250 * 1024 && !file.type.includes("bmp")) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function isSafeImageSrc(value) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "menu/default.png" || trimmed === "tenant/default.png") {
    return false;
  }
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/i.test(trimmed)) {
    return true;
  }
  if (trimmed.toLowerCase().startsWith("data:")) return false;
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");
  if (!trimmed.includes(":")) return !/[\r\n<>"']/.test(trimmed);
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const SafeImage = memo(function SafeImage({
  src,
  alt,
  className = "",
  style = {},
  fallbackType = "food",
  iconSize = 28,
  focusX = 50,
  focusY = 50,
  zoom = 1,
}) {
  const [failed, setFailed] = useState(false);
  const rawSrc = resolveMediaUrl(typeof src === "string" ? src : "");
  const cleanSrc = isSafeImageSrc(rawSrc) ? rawSrc : "";

  useEffect(() => {
    setFailed(false);
  }, [cleanSrc]);

  if (!cleanSrc || failed) {
    return (
      <div
        aria-label={alt}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-warm-img)",
          color: "var(--maroon)",
          opacity: 0.45,
          ...style,
        }}
      >
        {fallbackType === "store" ? <Store size={iconSize} /> : <ShoppingBag size={iconSize} />}
      </div>
    );
  }

  const fx = Math.min(100, Math.max(0, Number(focusX) || 50));
  const fy = Math.min(100, Math.max(0, Number(focusY) || 50));
  const scale = Math.min(3, Math.max(1, Number(zoom) || 1));
  const objectPosition = `${fx}% ${fy}%`;

  const img = (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      decoding="async"
      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition, ...style }}
      onError={() => setFailed(true)}
    />
  );

  // Zoom diterapkan pada pembungkus agar animasi hover (.img-zoom-child) tetap berjalan.
  if (scale === 1) return img;
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: objectPosition,
        }}
      >
        {img}
      </div>
    </div>
  );
});
