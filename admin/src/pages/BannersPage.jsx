import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";
import { api } from "../services/api.js";
import { readAndCompressImageFile } from "../utils/image.js";
import Modal from "../components/Modal.jsx";
import ImagePositionEditor from "../components/ImagePositionEditor.jsx";
import { useI18n } from "../i18n.jsx";

const emptyForm = {
  tag: "",
  judul: "",
  deskripsi: "",
  gambar: "",
  cta_primary: "Pesan sekarang",
  cta_secondary: "Lihat kantin",
  tag_en: "",
  judul_en: "",
  deskripsi_en: "",
  cta_primary_en: "",
  cta_secondary_en: "",
  urutan: "1",
  aktif: true,
  foto_x: 50,
  foto_y: 50,
  foto_zoom: 1,
};

export default function BannersPage() {
  const { t, lang } = useI18n();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef(null);
  const [photoEditor, setPhotoEditor] = useState(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminBanners();
      setBanners(response?.data || []);
    } catch (err) {
      setError(err?.message || t("Gagal memuat banner."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm, urutan: String(banners.length + 1) });
    setFormError("");
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setCreating(false);
    setForm({
      tag: banner.tag || "",
      judul: banner.judul || "",
      deskripsi: banner.deskripsi || "",
      gambar: banner.gambar || "",
      cta_primary: banner.cta_primary || "",
      cta_secondary: banner.cta_secondary || "",
      tag_en: banner.tag_en || "",
      judul_en: banner.judul_en || "",
      deskripsi_en: banner.deskripsi_en || "",
      cta_primary_en: banner.cta_primary_en || "",
      cta_secondary_en: banner.cta_secondary_en || "",
      urutan: String(banner.urutan ?? 1),
      aktif: banner.aktif !== false,
      foto_x: Number(banner.foto_x ?? 50),
      foto_y: Number(banner.foto_y ?? 50),
      foto_zoom: Number(banner.foto_zoom ?? 1) || 1,
    });
    setFormError("");
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setFormError("");
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormError("");
    setUploadingImage(true);
    try {
      const dataUrl = await readAndCompressImageFile(file, 1600, 0.82);
      setForm((prev) => ({ ...prev, gambar: dataUrl, foto_x: 50, foto_y: 50, foto_zoom: 1 }));
      setPhotoEditor({
        src: dataUrl,
        aspect: 16 / 6,
        value: { x: 50, y: 50, zoom: 1 },
        lang,
        title: t("Atur posisi foto banner"),
        onSave: ({ x, y, zoom }) => {
          setForm((prev) => ({ ...prev, foto_x: x, foto_y: y, foto_zoom: zoom }));
          setPhotoEditor(null);
        },
      });
    } catch (err) {
      setFormError(err?.message || t("Gagal memproses gambar."));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (form.judul.trim().length < 2) {
      setFormError(t("Judul banner minimal 2 karakter."));
      return;
    }
    const imageValue = form.gambar.trim();
    if (!imageValue) {
      setFormError(t("Foto banner wajib diunggah atau diisi URL-nya."));
      return;
    }
    if (!/^(https?:\/\/|\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(imageValue)) {
      setFormError(
        t("Foto banner harus berupa file JPG/PNG/WEBP/GIF atau URL http(s):// yang valid.")
      );
      return;
    }

    const payload = {
      tag: form.tag.trim(),
      judul: form.judul.trim(),
      deskripsi: form.deskripsi.trim(),
      gambar: imageValue,
      cta_primary: form.cta_primary.trim(),
      cta_secondary: form.cta_secondary.trim(),
      tag_en: form.tag_en.trim(),
      judul_en: form.judul_en.trim(),
      deskripsi_en: form.deskripsi_en.trim(),
      cta_primary_en: form.cta_primary_en.trim(),
      cta_secondary_en: form.cta_secondary_en.trim(),
      urutan: Number(form.urutan || 1),
      aktif: form.aktif,
      foto_x: Number(form.foto_x ?? 50),
      foto_y: Number(form.foto_y ?? 50),
      foto_zoom: Number(form.foto_zoom ?? 1) || 1,
    };

    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await api.adminBannerUpdate(editing.id_banner, payload);
        setNotice(t("Banner diperbarui."));
      } else {
        await api.adminBannerCreate(payload);
        setNotice(t("Banner ditambahkan dan tampil di halaman utama customer."));
      }
      closeForm();
      await loadBanners();
    } catch (err) {
      setFormError(err?.message || t("Gagal menyimpan banner."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (banner) => {
    setToggleId(String(banner.id_banner));
    setError("");
    setNotice("");
    try {
      await api.adminBannerUpdate(banner.id_banner, { aktif: banner.aktif === false });
      setNotice(
        t('Banner "{title}" {state}.', {
          title: banner.judul,
          state: t(banner.aktif === false ? "diaktifkan" : "dinonaktifkan"),
        })
      );
      await loadBanners();
    } catch (err) {
      setError(err?.message || t("Gagal mengubah status banner."));
    } finally {
      setToggleId("");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await api.adminBannerDelete(deleting.id_banner);
      setNotice(t("Banner dihapus."));
      setDeleting(null);
      await loadBanners();
    } catch (err) {
      setError(err?.message || t("Gagal menghapus banner."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Halaman utama")}</div>
          <h1 className="admin-page-title">{t("Banner promo")}</h1>
          <p className="admin-page-desc">
            {t(
              "Atur slide banner yang tampil di beranda customer: judul, deskripsi, gambar, dan tombol ajakan."
            )}
          </p>
        </div>
        <div className="admin-head-actions">
          <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadBanners}>
            <RefreshCw size={14} strokeWidth={2.4} className={loading ? "admin-spinner" : undefined} />
            {t("Muat ulang")}
          </button>
          <button type="button" className="admin-primary-btn btn-interactive" onClick={openCreate}>
            <Plus size={14} strokeWidth={2.6} />
            {t("Tambah banner")}
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert is-error animate-slide-up" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div className="admin-alert is-info animate-slide-up" role="status">
          <CheckCircle2 size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{notice}</span>
        </div>
      )}

      {loading && banners.length === 0 ? (
        <div className="admin-table-card animate-slide-up">
          <div className="admin-table-empty">{t("Memuat banner…")}</div>
        </div>
      ) : banners.length === 0 ? (
        <div className="admin-table-card animate-slide-up">
          <div className="admin-table-empty">
            {t("Belum ada banner di database. Tambahkan satu untuk menampilkannya di beranda customer.")}
          </div>
        </div>
      ) : (
        <div className="admin-banner-grid">
          {banners.map((banner) => (
            <article key={banner.id_banner} className="admin-banner-card animate-slide-up">
              <div
                className="admin-banner-media"
                style={
                  banner.gambar
                    ? { backgroundImage: `linear-gradient(120deg, rgba(23, 18, 17, 0.55), rgba(23, 18, 17, 0.15)), url('${banner.gambar}')` }
                    : undefined
                }
              >
                {!banner.gambar && <ImageIcon size={26} strokeWidth={1.8} />}
                <span className="admin-banner-order">#{banner.urutan ?? 0}</span>
                <span
                  className={`admin-badge-status ${
                    banner.aktif === false ? "tone-cancelled" : "tone-ready"
                  }`}
                >
                  {banner.aktif === false ? t("Nonaktif") : t("Tampil")}
                </span>
              </div>

              <div className="admin-banner-body">
                {banner.tag ? <div className="admin-banner-tag">{banner.tag}</div> : null}
                <h2 className="admin-banner-title">{banner.judul}</h2>
                {banner.deskripsi ? (
                  <p className="admin-banner-desc">{banner.deskripsi}</p>
                ) : null}
                <div className="admin-banner-ctas">
                  {banner.cta_primary ? <span>{banner.cta_primary}</span> : null}
                  {banner.cta_secondary ? <span className="is-ghost">{banner.cta_secondary}</span> : null}
                </div>

                <div className="admin-banner-actions">
                  <button
                    type="button"
                    className="admin-ghost-btn is-small btn-interactive"
                    onClick={() => handleToggle(banner)}
                    disabled={toggleId === String(banner.id_banner)}
                  >
                    {banner.aktif === false ? t("Tampilkan") : t("Sembunyikan")}
                  </button>
                  <button
                    type="button"
                    className="admin-primary-btn is-small btn-interactive"
                    onClick={() => openEdit(banner)}
                  >
                    <Pencil size={12} strokeWidth={2.6} />
                    {t("Edit")}
                  </button>
                  <button
                    type="button"
                    className="admin-danger-btn is-small btn-interactive"
                    onClick={() => setDeleting(banner)}
                    aria-label={`${t("Hapus")} ${banner.judul}`}
                  >
                    <Trash2 size={12} strokeWidth={2.6} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="admin-footnote">
        <ImageIcon size={13} strokeWidth={2.2} />
        {t("Banner aktif tampil bergantian otomatis di beranda customer setiap 5 detik.")}
      </div>

      <Modal
        open={creating || Boolean(editing)}
        title={editing ? t("Edit banner") : t("Tambah banner")}
        subtitle={
          editing
            ? t("Urutan #{n}", { n: editing.urutan ?? 0 })
            : t("Banner tampil paling atas di beranda customer.")
        }
        onClose={closeForm}
        maxWidth={680}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              onClick={closeForm}
              disabled={saving}
            >
              {t("Batal")}
            </button>
            <button
              type="button"
              className="admin-primary-btn btn-interactive"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t("Menyimpan…") : editing ? t("Simpan perubahan") : t("Tambah banner")}
            </button>
          </div>
        }
      >
        <div className="admin-form-grid">
          <label className="admin-field admin-field-full">
            <span className="admin-preview-label">{t("Pratinjau gambar")}</span>
            <div
              className="admin-banner-preview"
              style={
                form.gambar
                  ? {
                    backgroundImage: `url('${form.gambar}')`,
                    backgroundPosition: `${form.foto_x ?? 50}% ${form.foto_y ?? 50}%`,
                    backgroundSize:
                      Number(form.foto_zoom ?? 1) > 1
                        ? `${Number(form.foto_zoom) * 100}% auto`
                        : "cover",
                  }
                  : undefined
              }
            >
              {!form.gambar && <span>{t("Unggah foto atau tempel URL untuk melihat pratinjau")}</span>}
            </div>
            {form.gambar ? (
              <button
                type="button"
                className="admin-ghost-btn btn-interactive"
                style={{ marginTop: 8 }}
                onClick={() =>
                  setPhotoEditor({
                    src: form.gambar,
                    aspect: 16 / 6,
                    value: {
                      x: form.foto_x,
                      y: form.foto_y,
                      zoom: form.foto_zoom,
                    },
                    lang,
                    title: t("Atur posisi foto banner"),
                    onSave: ({ x, y, zoom }) => {
                      setForm((prev) => ({ ...prev, foto_x: x, foto_y: y, foto_zoom: zoom }));
                      setPhotoEditor(null);
                    },
                  })
                }
              >
                <ImageIcon size={13} strokeWidth={2.4} />
                {t("Atur posisi foto")}
              </button>
            ) : null}
          </label>

          <div className="admin-field admin-field-full">
            <span className="admin-label">{t("Foto banner")}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                data-testid="banner-image-input"
                style={{ display: "none" }}
                onChange={handleImageFile}
              />
              <button
                type="button"
                className="admin-secondary-btn btn-interactive"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage || saving}
              >
                <Upload size={14} strokeWidth={2.4} />
                {uploadingImage ? t("Memproses foto…") : t("Unggah foto")}
              </button>
              {form.gambar ? (
                <button
                  type="button"
                  className="admin-ghost-btn btn-interactive"
                  onClick={() => setForm((prev) => ({ ...prev, gambar: "" }))}
                  disabled={uploadingImage || saving}
                >
                  <Trash2 size={13} strokeWidth={2.4} />
                  {t("Hapus foto")}
                </button>
              ) : null}
            </div>
            <p className="admin-empty-text" style={{ padding: 0, margin: 0 }}>
              {t(
                "Unggah file JPG, PNG, WEBP, atau GIF dari perangkat. Foto otomatis dikompres agar ringan."
              )}
            </p>
          </div>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("atau tempel URL gambar")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.gambar.startsWith("data:image/") ? "" : form.gambar}
              placeholder="https://images.unsplash.com/..."
              onChange={(event) => setForm((prev) => ({ ...prev, gambar: event.target.value }))}
            />
            {form.gambar.startsWith("data:image/") ? (
              <p className="admin-empty-text" style={{ padding: 0, margin: 0 }}>
                {t("Foto dari perangkat sudah terpasang. Isi kolom ini untuk menggantinya dengan URL.")}
              </p>
            ) : null}
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Label kecil (opsional)")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.tag}
              maxLength={60}
              placeholder="PROMO SPESIAL MAHASISWA"
              onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Urutan tampil")}</span>
            <input
              className="admin-input"
              type="number"
              min="0"
              value={form.urutan}
              onChange={(event) => setForm((prev) => ({ ...prev, urutan: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Judul banner")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.judul}
              maxLength={140}
              placeholder="Diskon 10% Setiap Pesanan Dengan Kode STUDENT10"
              onChange={(event) => setForm((prev) => ({ ...prev, judul: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Deskripsi")}</span>
            <textarea
              className="admin-input admin-textarea"
              rows={3}
              maxLength={400}
              value={form.deskripsi}
              onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Tombol utama")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.cta_primary}
              maxLength={40}
              onChange={(event) => setForm((prev) => ({ ...prev, cta_primary: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Tombol kedua")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.cta_secondary}
              maxLength={40}
              onChange={(event) => setForm((prev) => ({ ...prev, cta_secondary: event.target.value }))}
            />
          </label>

          <div className="admin-field admin-field-full admin-banner-lang-head">
            <span className="admin-label">{t("Terjemahan bahasa Inggris")}</span>
            <p className="admin-empty-text" style={{ padding: 0, margin: 0 }}>
              {t(
                "Dipakai otomatis saat pengunjung memilih bahasa EN. Kosongkan untuk memakai teks Indonesia."
              )}
            </p>
          </div>

          <label className="admin-field">
            <span className="admin-label">{t("Label kecil (English)")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.tag_en}
              maxLength={60}
              placeholder="STUDENT SPECIAL PROMO"
              onChange={(event) => setForm((prev) => ({ ...prev, tag_en: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Judul banner (English)")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.judul_en}
              maxLength={140}
              placeholder="10% Off Every Order With Code STUDENT10"
              onChange={(event) => setForm((prev) => ({ ...prev, judul_en: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Deskripsi (English)")}</span>
            <textarea
              className="admin-input admin-textarea"
              rows={3}
              maxLength={400}
              value={form.deskripsi_en}
              onChange={(event) => setForm((prev) => ({ ...prev, deskripsi_en: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Tombol utama (English)")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.cta_primary_en}
              maxLength={40}
              placeholder="Order now"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, cta_primary_en: event.target.value }))
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Tombol kedua (English)")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.cta_secondary_en}
              maxLength={40}
              placeholder="Browse canteens"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, cta_secondary_en: event.target.value }))
              }
            />
          </label>

          <label className="admin-check admin-field-full">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(event) => setForm((prev) => ({ ...prev, aktif: event.target.checked }))}
            />
            <span>{t("Tampilkan banner ini di beranda customer")}</span>
          </label>
        </div>

        {formError && (
          <div className="admin-alert is-error animate-slide-up" role="alert">
            <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{formError}</span>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title={t("Hapus banner?")}
        subtitle={deleting?.judul}
        onClose={() => setDeleting(null)}
        maxWidth={440}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              onClick={() => setDeleting(null)}
              disabled={saving}
            >
              {t("Batal")}
            </button>
            <button
              type="button"
              className="admin-danger-btn btn-interactive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? t("Menghapus…") : t("Hapus banner")}
            </button>
          </div>
        }
      >
        <p className="admin-empty-text" style={{ padding: 0 }}>
          {t("Banner yang dihapus langsung hilang dari beranda customer. Slide lain tetap tampil.")}
        </p>
      </Modal>

      <ImagePositionEditor
        open={Boolean(photoEditor)}
        src={photoEditor?.src}
        aspect={photoEditor?.aspect}
        value={photoEditor?.value}
        onSave={photoEditor?.onSave}
        onClose={() => setPhotoEditor(null)}
        lang={lang}
        title={photoEditor?.title}
      />
    </div>
  );
}
