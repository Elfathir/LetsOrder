import { Upload, X } from "lucide-react";
import { resolveMediaUrl } from "../services/api";
import { readAndCompressImageFile } from "../utils/media.jsx";
import { LAYOUT } from "../utils/layout.js";
import Modal from "./ui/Modal.jsx";
import DialogCard from "./ui/DialogCard.jsx";

// Modal "Pengaturan Toko" milik portal tenant.
// State form tetap dimiliki App; komponen ini murni presentasional.
export default function StoreSettingsModal({
  open,
  onClose,
  lang,
  form,
  setForm,
  error,
  setError,
  onSave,
  onEditPhoto,
  onClosePhotoEditor,
}) {
  if (!open) return null;

  return (
    <Modal zIndex={1300} onClose={onClose}>
      <DialogCard
        maxWidth={450}
        style={{
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: 0,
          boxShadow: "0 20px 50px rgba(82, 42, 40, 0.24)",
        }}
      >
        {/* Fixed Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 26px 15px",
            borderBottom: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
              {lang === "EN" ? "Tenant Settings" : "Pengaturan Tenant"}
            </h3>
            <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
              {lang === "EN"
                ? "Manage your tenant profile picture, store details & operating hours"
                : "Kelola foto profil, informasi gerai, dan jam operasional tenant"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            style={{
              border: "none",
              background: "var(--bg-cream)",
              borderRadius: "50%",
              width: 34,
              height: 34,
              cursor: "pointer",
              ...LAYOUT.center,
              flexShrink: 0,
            }}
          >
            <X size={16} color="var(--maroon)" />
          </button>
        </div>

        <form
          onSubmit={onSave}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* Scrollable Content Body */}
          <div
            className="modal-scroll-body"
            style={{
              padding: "20px 26px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {error && (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  backgroundColor: "#FDF0EE",
                  color: "#C84336",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {error}
              </div>
            )}

            {/* Tenant Profile Picture (PP) moved from My Profile */}
            <div
              style={{
                ...LAYOUT.row,
                gap: 18,
                padding: "14px 16px",
                borderRadius: 16,
                backgroundColor: "var(--bg-auth-page)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-cream)",
                  border: "3px solid #EDD1B4",
                  overflow: "hidden",
                  ...LAYOUT.center,
                  fontSize: 24,
                  fontWeight: 900,
                  color: "var(--maroon)",
                  flexShrink: 0,
                  boxShadow: "0 6px 16px rgba(82, 42, 40, 0.1)",
                }}
              >
                {form.logo ? (
                  <img
                    src={resolveMediaUrl(form.logo)}
                    alt="Tenant Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: `${form.foto_x ?? 50}% ${form.foto_y ?? 50}%`,
                      transform: `scale(${form.foto_zoom ?? 1})`,
                      transformOrigin: `${form.foto_x ?? 50}% ${form.foto_y ?? 50}%`,
                    }}
                  />
                ) : (
                  <span>{displayInitials}</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)" }}>
                  {lang === "EN" ? "Tenant Profile Picture" : "Foto Profil Tenant"}
                </div>
                {form.logo && (
                  <button
                    type="button"
                    onClick={() =>
                      onEditPhoto({
                        src: resolveMediaUrl(form.logo),
                        aspect: 1,
                        value: {
                          x: form.foto_x,
                          y: form.foto_y,
                          zoom: form.foto_zoom,
                        },
                        lang,
                        title: lang === "EN" ? "Logo position" : "Posisi logo",
                        onSave: ({ x, y, zoom }) => {
                          setForm((p) => ({ ...p, foto_x: x, foto_y: y, foto_zoom: zoom }));
                          onClosePhotoEditor();
                        },
                      })
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--maroon)",
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {lang === "EN" ? "Adjust photo position" : "Atur posisi foto"}
                  </button>
                )}
                <label
                  className="btn-interactive"
                  style={{
                    ...LAYOUT.inlineRow,
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-input)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--maroon)",
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Upload size={13} />
                  <span>{lang === "EN" ? "Choose Image" : "Pilih Gambar"}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const dataUrl = await readAndCompressImageFile(f, 800, 0.85);
                        setForm((p) => ({ ...p, logo: dataUrl, foto_x: 50, foto_y: 50, foto_zoom: 1 }));
                        setError("");
                        onEditPhoto({
                          src: dataUrl,
                          aspect: 1,
                          value: { x: 50, y: 50, zoom: 1 },
                          lang,
                          title: lang === "EN" ? "Logo position" : "Posisi logo",
                          onSave: ({ x, y, zoom }) => {
                            setForm((p) => ({ ...p, foto_x: x, foto_y: y, foto_zoom: zoom }));
                            onClosePhotoEditor();
                          },
                        });
                      } catch (err) {
                        setError(err.message);
                      }
                    }}
                  />
                </label>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  {lang === "EN"
                    ? "Max 1 MB · Format: .JPEG, .PNG"
                    : "Maks. 1 MB · Format: .JPEG, .PNG"}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                {lang === "EN" ? "Tenant Name" : "Nama Tenant"}
              </label>
              <input
                type="text"
                required
                value={form.nama_tenant}
                onChange={(e) => setForm((p) => ({ ...p, nama_tenant: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                {lang === "EN" ? "Booth / Location" : "Lokasi / Stand"}
              </label>
              <input
                type="text"
                value={form.booth}
                onChange={(e) => setForm((p) => ({ ...p, booth: e.target.value }))}
                placeholder={lang === "EN" ? "e.g. Booth #1 · Building A Canteen" : "Contoh: Stand #1 · Kantin Gedung A"}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                {lang === "EN" ? "Description" : "Deskripsi Kantin"}
              </label>
              <textarea
                rows={3}
                value={form.deskripsi}
                onChange={(e) => setForm((p) => ({ ...p, deskripsi: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Opening Time" : "Jam Buka"}
                </label>
                <input
                  type="time"
                  value={form.jam_buka}
                  onChange={(e) => setForm((p) => ({ ...p, jam_buka: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Closing Time" : "Jam Tutup"}
                </label>
                <input
                  type="time"
                  value={form.jam_tutup}
                  onChange={(e) => setForm((p) => ({ ...p, jam_tutup: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--maroon)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.auto_schedule}
                onChange={(e) => setForm((p) => ({ ...p, auto_schedule: e.target.checked }))}
              />
              <span>
                {lang === "EN"
                  ? "Automatically open/close based on schedule hours"
                  : "Buka/tutup otomatis mengikuti jam operasional"}
              </span>
            </label>
          </div>

          {/* Fixed Footer */}
          <div
            style={{
              flexShrink: 0,
              padding: "14px 26px",
              borderTop: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-card)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn-interactive btn-lift"
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: "var(--radius-pill)",
                border: "none",
                backgroundColor: "var(--orange)",
                color: "var(--on-orange-text)",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
              }}
            >
              {lang === "EN" ? "Save" : "Simpan"}
            </button>
          </div>
        </form>
      </DialogCard>
    </Modal>
  );
}
