import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  KeyRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { api, getStoredUser, setStoredSession } from "../services/api.js";
import { getInitials } from "../utils/format.js";
import { useI18n } from "../i18n.jsx";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = 512;

// Keep the stored avatar small: the API caps the whole request at ~2 MB.
function readAvatarFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("unsupported"));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("too-large"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("decode-failed"));
      image.onload = () => {
        const scale = Math.min(1, AVATAR_SIZE / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage({ user, onUpdated }) {
  const { t } = useI18n();
  const displayName = user?.nama || user?.username || "Administrator";
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nama: user?.nama || "",
    username: user?.username || "",
    email: user?.email || "",
    no_telp: user?.no_telp || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");

  useEffect(() => {
    setAvatar(user?.avatar || "");
  }, [user?.avatar]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (error) setError("");
    if (notice) setNotice("");
  };

  const handlePickAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setNotice("");
    try {
      const dataUrl = await readAvatarFile(file);
      setAvatar(dataUrl);
    } catch (err) {
      if (err?.message === "too-large") {
        setError(t("Ukuran foto maksimal 5 MB."));
      } else {
        setError(t("File foto harus berupa gambar PNG, JPEG, WEBP, atau GIF."));
      }
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    if (form.nama.trim().length < 2) {
      setError(t("Nama minimal 2 karakter."));
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await api.updateProfile({
        nama: form.nama.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        no_telp: form.no_telp.trim(),
        avatar,
      });
      const nextUser = response?.data?.user || response?.data || null;
      if (nextUser) onUpdated(nextUser);
      setNotice(t("Profil diperbarui."));
    } catch (err) {
      setError(err?.message || t("Gagal menyimpan profil."));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (passwordSaving) return;

    if (!passwordForm.current_password) {
      setPasswordError(t("Kata sandi saat ini wajib diisi."));
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError(t("Kata sandi baru minimal 6 karakter."));
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError(t("Konfirmasi kata sandi tidak sama."));
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");
    setPasswordNotice("");
    try {
      const response = await api.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      const nextToken = response?.data?.access_token || response?.data?.token || "";
      if (nextToken) {
        setStoredSession(nextToken, getStoredUser() || user);
      }
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setPasswordNotice(t("Kata sandi diperbarui. Sesi lain otomatis keluar."));
    } catch (err) {
      setPasswordError(err?.message || t("Gagal mengubah kata sandi."));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="animate-fade admin-profile-page">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Akun administrator")}</div>
          <h1 className="admin-page-title">{t("Profil administrator")}</h1>
          <p className="admin-page-desc">
            {t("Kelola data akun yang Anda pakai untuk masuk ke panel admin.")}
          </p>
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

      <div className="admin-profile-layout">
        <section className="admin-card admin-profile-summary" aria-label={t("Informasi akun")}>
          <div className="admin-profile-head">
            <span className="admin-profile-avatar">
              {avatar ? <img src={avatar} alt={displayName} /> : getInitials(displayName)}
            </span>
            <div className="admin-profile-identity">
              <h2 className="admin-profile-name">{displayName}</h2>
              <span className="admin-role-badge role-admin">{user?.peran || "Administrator"}</span>
            </div>
          </div>

          <div className="admin-avatar-actions">
            <button
              type="button"
              className="admin-secondary-btn is-small btn-interactive"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus size={13} strokeWidth={2.4} />
              {t("Ganti foto")}
            </button>
            {avatar ? (
              <button
                type="button"
                className="admin-ghost-btn is-small btn-interactive"
                onClick={() => setAvatar("")}
              >
                <Trash2 size={13} strokeWidth={2.4} />
                {t("Hapus foto")}
              </button>
            ) : null}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="admin-visually-hidden"
              onChange={handlePickAvatar}
            />
          </div>

          <p className="admin-profile-hint">
            {t("PNG, JPEG, WEBP, atau GIF. Foto dikecilkan otomatis sebelum disimpan.")}
          </p>

          <dl className="admin-profile-rows">
            <div className="admin-profile-row">
              <dt>{t("Username")}</dt>
              <dd>{user?.username || "—"}</dd>
            </div>
            <div className="admin-profile-row">
              <dt>{t("ID akun")}</dt>
              <dd>#{user?.id_user ?? "—"}</dd>
            </div>
            <div className="admin-profile-row">
              <dt>
                <Mail size={12} strokeWidth={2.2} />
                {t("Email")}
              </dt>
              <dd>{user?.email || "—"}</dd>
            </div>
            <div className="admin-profile-row">
              <dt>
                <Phone size={12} strokeWidth={2.2} />
                {t("Nomor telepon")}
              </dt>
              <dd>{user?.no_telp || t("Belum diisi")}</dd>
            </div>
          </dl>

          <div className="admin-profile-note">
            <ShieldCheck size={14} strokeWidth={2.4} />
            <span>
              {t(
                "Sesi ini memakai akun Administrator dengan akses penuh ke seluruh data tenant, pengguna, dan transaksi."
              )}
            </span>
          </div>
        </section>

        <div className="admin-profile-forms">
          <section className="admin-card" aria-label={t("Perbarui profil")}>
            <div className="admin-card-head">
              <h2 className="admin-card-title">
                <UserRound size={16} strokeWidth={2.4} />
                {t("Data akun")}
              </h2>
            </div>

            <form className="admin-form" onSubmit={handleSave} noValidate>
              <div className="admin-form-grid">
                <label className="admin-field admin-field-full">
                  <span className="admin-label">{t("Nama lengkap")}</span>
                  <input
                    className="admin-input"
                    type="text"
                    value={form.nama}
                    maxLength={100}
                    onChange={updateField("nama")}
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-label">{t("Username")}</span>
                  <input
                    className="admin-input"
                    type="text"
                    value={form.username}
                    maxLength={50}
                    onChange={updateField("username")}
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-label">{t("Nomor telepon")}</span>
                  <input
                    className="admin-input"
                    type="tel"
                    value={form.no_telp}
                    maxLength={30}
                    placeholder="08xxxxxxxxxx"
                    onChange={updateField("no_telp")}
                  />
                </label>

                <label className="admin-field admin-field-full">
                  <span className="admin-label">{t("Email")}</span>
                  <input
                    className="admin-input"
                    type="email"
                    value={form.email}
                    maxLength={100}
                    onChange={updateField("email")}
                  />
                </label>
              </div>

              <p className="admin-profile-hint">
                {t("Ubah email memerlukan nomor telepon minimal 8 digit.")}
              </p>

              <div className="admin-profile-actions">
                <button type="submit" className="admin-primary-btn btn-interactive" disabled={saving}>
                  <Save size={14} strokeWidth={2.4} />
                  {saving ? t("Menyimpan…") : t("Simpan profil")}
                </button>
              </div>
            </form>
          </section>

          <section className="admin-card" aria-label={t("Ubah kata sandi")}>
            <div className="admin-card-head">
              <h2 className="admin-card-title">
                <KeyRound size={16} strokeWidth={2.4} />
                {t("Ubah kata sandi")}
              </h2>
            </div>

            {passwordError && (
              <div className="admin-alert is-error animate-slide-up" role="alert">
                <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordNotice && (
              <div className="admin-alert is-info animate-slide-up" role="status">
                <CheckCircle2 size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{passwordNotice}</span>
              </div>
            )}

            <form className="admin-form" onSubmit={handleChangePassword} noValidate>
              <div className="admin-form-grid">
                <label className="admin-field admin-field-full">
                  <span className="admin-label">{t("Kata sandi saat ini")}</span>
                  <input
                    className="admin-input"
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.current_password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))
                    }
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-label">{t("Kata sandi baru")}</span>
                  <input
                    className="admin-input"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.new_password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))
                    }
                  />
                </label>

                <label className="admin-field">
                  <span className="admin-label">{t("Ulangi kata sandi baru")}</span>
                  <input
                    className="admin-input"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirm_password}
                    onChange={(event) =>
                      setPasswordForm((prev) => ({ ...prev, confirm_password: event.target.value }))
                    }
                  />
                </label>
              </div>

              <p className="admin-profile-hint">
                {t("Minimal 6 karakter. Semua sesi lain pada akun ini akan keluar otomatis.")}
              </p>

              <div className="admin-profile-actions">
                <button
                  type="submit"
                  className="admin-primary-btn btn-interactive"
                  disabled={passwordSaving}
                >
                  <KeyRound size={14} strokeWidth={2.4} />
                  {passwordSaving ? t("Menyimpan…") : t("Simpan kata sandi")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
