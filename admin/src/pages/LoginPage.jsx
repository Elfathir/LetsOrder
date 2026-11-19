import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { api, clearStoredSession, setStoredSession } from "../services/api.js";
import { useI18n } from "../i18n.jsx";

export default function LoginPage({ onAuthenticated }) {
  const { lang, setLang, t } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError(t("Username/email dan kata sandi wajib diisi."));
      return;
    }

    setError("");
    setLoading(true);
    try {
      // The login payload intentionally omits "peran": the API rejects role mismatches.
      const response = await api.login(cleanIdentifier, password);
      const payload = response?.data || response || {};
      const token = payload.token || payload.access_token || "";
      const user = payload.user || null;

      if (!token || !user) {
        throw new Error(t("Respons login tidak lengkap. Periksa kembali konfigurasi backend."));
      }

      if (user.peran !== "Administrator") {
        clearStoredSession();
        setError(
          user.peran === "Vendor"
            ? t("Akun ini terdaftar sebagai Vendor. Gunakan portal tenant untuk akun tersebut.")
            : t("Akun ini bukan Administrator. Hanya akun Administrator yang dapat membuka Panel Admin.")
        );
        return;
      }

      setStoredSession(token, user);
      onAuthenticated(user);
    } catch (err) {
      setError(
        err?.status === 0
          ? t("Tidak dapat terhubung ke server API. Pastikan backend berjalan di http://127.0.0.1:8000.")
          : err?.message || t("Login gagal. Silakan coba lagi.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-toolbar">
        <div className="admin-lang-switch" role="group" aria-label={t("Ganti bahasa")}>
          {["ID", "EN"].map((option) => (
            <button
              key={option}
              type="button"
              className={`admin-lang-btn${lang === option ? " is-active" : ""}`}
              onClick={() => setLang(option)}
              aria-pressed={lang === option}
            >
              {option}
            </button>
          ))}
        </div>
        <ThemeToggle />
      </div>

      <main className="admin-auth-main">
        <section className="admin-auth-card animate-modal-zoom" aria-labelledby="admin-login-title">
          <div className="admin-brand-lockup">
            <BrandLogo size={58} />
            <div>
              <h1 id="admin-login-title" className="admin-brand-title">
                Let's Order
              </h1>
              <p className="admin-brand-sub">{t("Sistem pemesanan kantin kampus")}</p>
            </div>
            <span className="admin-badge">
              <ShieldCheck size={12} strokeWidth={2.6} />
              Admin Console
            </span>
          </div>

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-field">
              <label className="admin-label" htmlFor="admin-identifier">
                {t("Username atau Email")}
              </label>
              <div className="admin-input-wrap">
                <input
                  id="admin-identifier"
                  className="admin-input"
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="admin@upnvj.ac.id"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="admin-password">
                {t("Kata Sandi")}
              </label>
              <div className="admin-input-wrap">
                <input
                  id="admin-password"
                  className="admin-input has-action"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder={t("Masukkan kata sandi")}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="admin-input-action btn-interactive"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t("Sembunyikan kata sandi") : t("Tampilkan kata sandi")}
                  title={showPassword ? t("Sembunyikan kata sandi") : t("Tampilkan kata sandi")}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-alert is-error animate-slide-up" role="alert">
                <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="admin-submit btn-interactive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="admin-spinner" />
                  {t("Memeriksa akun…")}
                </>
              ) : (
                <>
                  <LogIn size={16} strokeWidth={2.4} />
                  {t("Masuk ke Panel Admin")}
                </>
              )}
            </button>
          </form>

          <p className="admin-hint">
            {t(
              "Akses ini khusus Administrator. Akun Customer dan Vendor tetap menggunakan aplikasi utama."
            )}
          </p>
          <p className="admin-footer-note">Let's Order · Admin Console</p>
        </section>
      </main>
    </div>
  );
}
