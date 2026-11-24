// Kompresi foto di browser sebelum dikirim ke API sebagai data URL base64.
export function readAndCompressImageFile(file, maxDim = 1600, quality = 0.82) {
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
