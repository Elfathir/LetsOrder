import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Store,
  User,
  X,
} from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";
import ThemeToggleButton from "./ThemeToggleButton.jsx";
import { LAYOUT } from "../utils/layout.js";
import { BUTTON_PILL_PRIMARY } from "../styles/surfaces.js";

// Halaman auth (login / daftar / lupa kata sandi) untuk Customer dan Vendor.
// Seluruh state tetap dimiliki App; komponen ini presentasional.
export default function AuthPage({
  lang,
  t,
  authMode,
  setAuthMode,
  loginRoleTab,
  setLoginRoleTab,
  forgotStep,
  setForgotStep,
  authForm,
  setAuthForm,
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess,
  authLoading,
  showPassword,
  setShowPassword,
  onSubmit,
  onClose,
  onChangeLanguage,
  currentUser,
}) {
  return (
    <div className="auth-page-overlay">
      <div className="auth-header-controls">
        <button
          type="button"
          className="header-lang-btn"
          onClick={() => onChangeLanguage(lang === "ID" ? "EN" : "ID")}
          style={{
            ...LAYOUT.row,
            gap: 6,
            minWidth: 74,
            justifyContent: "center",
            padding: "7px 12px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--border-light)",
            backgroundColor: "var(--bg-card)",
            color: "var(--maroon)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <Globe size={14} color="var(--text-muted)" />
          <span>{lang}</span>
        </button>
        <ThemeToggleButton
          darkTitle={t.themeToDark}
          lightTitle={t.themeToLight}
          size={34}
        />
      </div>
      <div className="auth-page-scroll">
        <div className="auth-page-inner">
          <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
        <div style={{ display: "inline-block", marginBottom: 6 }}>
          <BrandLogo size={54} />
        </div>

        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: "var(--orange-tag)",
            letterSpacing: "0.22em",
            marginBottom: 2,
          }}
        >
          E S T D &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2 0 2 6
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "var(--maroon)",
            letterSpacing: "-0.01em",
            marginBottom: 2,
          }}
        >
          LETSORDER.COM
        </div>

        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          {lang === "EN" ? "FROM OUR CANTEEN TO YOUR HANDS" : "DARI KANTIN KAMPUS KE TANGANMU"}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 16px 44px rgba(82, 42, 40, 0.1), 0 2px 8px rgba(82, 42, 40, 0.04)",
          border: "1px solid var(--border-light)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        className="auth-card animate-modal-zoom"
      >
        {currentUser && (
          <button
            onClick={() => onClose(false)}
            className="btn-interactive"
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              border: "none",
              background: "var(--bg-subtle)",
              width: 30,
              height: 30,
              borderRadius: "50%",
              cursor: "pointer",
              color: "var(--text-muted)",
              ...LAYOUT.center,
            }}
          >
            <X size={16} />
          </button>
        )}

        <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
            {authMode === "forgot"
              ? t.authForgot
              : authMode === "login"
                ? t.authWelcome
                : t.authCreate}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {authMode === "forgot"
              ? lang === "EN"
                ? "Enter your username or email to set a new password."
                : "Masukkan username atau email Anda untuk membuat password baru."
              : authMode === "login"
                ? loginRoleTab === "Vendor"
                  ? lang === "EN"
                    ? "Log in to manage your canteen tenant & orders."
                    : "Masuk untuk mengelola tenant kantin & pesanan."
                  : lang === "EN"
                    ? "Log in to pre-order and track your meals."
                    : "Masuk untuk memesan dan memantau pesanan kantin."
                : loginRoleTab === "Vendor"
                  ? lang === "EN"
                    ? "Register your campus canteen tenant account."
                    : "Daftarkan akun tenant kantin kampus Anda."
                  : lang === "EN"
                    ? "For students, lecturers and campus staff."
                    : "Untuk mahasiswa, dosen, dan staf kampus."}
          </p>
        </div>

        {authMode !== "forgot" && (
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: 4,
              borderRadius: "var(--radius-pill)",
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border-light)",
              marginBottom: 14,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 4,
                bottom: 4,
                left: 4,
                width: "calc(50% - 4px)",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "var(--bg-cream)",
                border: "1.5px solid var(--maroon)",
                boxShadow: "0 3px 10px rgba(82, 42, 40, 0.12)",
                transform: loginRoleTab === "Vendor" ? "translateX(100%)" : "translateX(0%)",
                transition: "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
            {[
              {
                role: "Customer",
                label: lang === "EN" ? "Customer" : "Pengguna (Pembeli)",
              },
              {
                role: "Vendor",
                label: lang === "EN" ? "Tenant (Vendor)" : "Tenant (Penjual)",
              },
            ].map((r) => {
              const active = loginRoleTab === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => {
                    setLoginRoleTab(r.role);
                    setAuthError("");
                    setAuthSuccess("");
                  }}
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--maroon)",
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    cursor: "pointer",
                    transition: "color 0.25s ease, transform 0.2s ease",
                  }}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        )}

        {authError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              backgroundColor: "var(--alert-error-bg)",
              border: "1px solid var(--alert-error-border)",
              color: "var(--alert-error-text)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              ...LAYOUT.row,
              gap: 8,
              flexShrink: 0,
            }}
          >
            <AlertCircle size={15} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              backgroundColor: "var(--alert-success-bg)",
              border: "1px solid var(--alert-success-border)",
              color: "var(--alert-success-text)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              ...LAYOUT.row,
              gap: 8,
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={15} />
            <span>{authSuccess}</span>
          </div>
        )}

        <form
          key={`${authMode}-${loginRoleTab}`}
          onSubmit={onSubmit}
          className="animate-fade"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
              {authMode === "forgot"
                ? lang === "EN"
                  ? "Username or Email"
                  : "Username atau Email"
                : "Username"}
            </label>
            <div
              style={{
                ...LAYOUT.row,
                gap: 10,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-input)",
              }}
            >
              <User size={16} color="var(--text-muted)" />
              <input
                type="text"
                required
                autoComplete="off"
                placeholder={
                  loginRoleTab === "Vendor"
                    ? lang === "EN"
                      ? "Enter tenant username"
                      : "Masukkan username tenant"
                    : lang === "EN"
                      ? "Enter your username"
                      : "Masukkan username Anda"
                }
                value={authForm.username}
                onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 14,
                  color: "var(--maroon)",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {authMode === "register" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                  {loginRoleTab === "Vendor"
                    ? lang === "EN"
                      ? "Canteen / Tenant Name"
                      : "Nama Kantin / Tenant"
                    : lang === "EN"
                      ? "Full Name"
                      : "Nama Lengkap"}
                </label>
                <div
                  style={{
                    ...LAYOUT.row,
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-input)",
                  }}
                >
                  <Store size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder={
                      loginRoleTab === "Vendor"
                        ? lang === "EN"
                          ? "e.g. Campus Nusantara Canteen"
                          : "Contoh: Kantin Nusantara"
                        : lang === "EN"
                          ? "Enter your full name"
                          : "Masukkan nama lengkap Anda"
                    }
                    value={loginRoleTab === "Vendor" ? authForm.nama_tenant : authForm.nama}
                    onChange={(e) =>
                      setAuthForm((prev) => ({
                        ...prev,
                        nama: e.target.value,
                        nama_tenant: e.target.value,
                      }))
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 14,
                      color: "var(--maroon)",
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                  Email
                </label>
                <div
                  style={{
                    ...LAYOUT.row,
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-input)",
                  }}
                >
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="nama@email.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 14,
                      color: "var(--maroon)",
                      width: "100%",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {authMode === "forgot" ? (
            forgotStep === 1 ? (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  backgroundColor: "var(--bg-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                }}
              >
                {lang === "EN"
                  ? "We will generate a 6-digit verification code on the server before allowing a password change."
                  : "Server akan menerbitkan kode verifikasi 6 digit terlebih dahulu sebelum Anda membuat password baru."}
              </div>
            ) : (
              <>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                    {lang === "EN" ? "6-Digit Verification Code" : "Kode Verifikasi (6 Digit)"}
                  </label>
                  <div
                    style={{
                      ...LAYOUT.row,
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-input)",
                    }}
                  >
                    <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      required
                      autoComplete="one-time-code"
                      placeholder="123456"
                      value={authForm.reset_token || ""}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, reset_token: e.target.value }))}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        color: "var(--maroon)",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                    {lang === "EN" ? "New Password" : "Password Baru"}
                  </label>
                  <div
                    style={{
                      ...LAYOUT.row,
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-input)",
                    }}
                  >
                    <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder={lang === "EN" ? "Minimum 6 characters" : "Minimal 6 karakter"}
                      value={authForm.new_password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, new_password: e.target.value }))}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        color: "var(--maroon)",
                        width: "100%",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        ...LAYOUT.center,
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )
          ) : (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                {lang === "EN" ? "Password" : "Kata Sandi"}
              </label>
              <div
                style={{
                  ...LAYOUT.row,
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-input)",
                }}
              >
                <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  placeholder={authMode === "register" ? (lang === "EN" ? "Minimum 6 characters" : "Minimal 6 karakter") : "••••••••"}
                  value={authForm.password}
                  onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                    color: "var(--maroon)",
                    width: "100%",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    ...LAYOUT.center,
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="btn-interactive btn-lift"
            style={{
              width: "100%",
              padding: "13px",
              ...BUTTON_PILL_PRIMARY,
              color: "var(--on-orange-text)",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              marginTop: 2,
              boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
              opacity: authLoading ? 0.7 : 1,
            }}
          >
            {authLoading
              ? lang === "EN"
                ? "Processing..."
                : "Memproses..."
              : authMode === "forgot"
                ? forgotStep === 1
                  ? lang === "EN"
                    ? "Send Reset Code"
                    : "Kirim Kode Reset"
                  : lang === "EN"
                    ? "Save New Password"
                    : "Simpan Password Baru"
                : authMode === "login"
                  ? lang === "EN"
                    ? "Log in"
                    : "Masuk"
                  : lang === "EN"
                    ? "Sign up"
                    : "Daftar"}
          </button>

          {authMode === "login" ? (
            <div style={{ textAlign: "center", marginTop: 2 }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("forgot");
                  setForgotStep(1);
                  setAuthError("");
                  setAuthSuccess("");
                  setAuthForm({
                    username: "",
                    nama: "",
                    password: "",
                    email: "",
                    nama_tenant: "",
                    new_password: "",
                    reset_token: "",
                  });
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "var(--maroon)",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {lang === "EN" ? "Forgot password?" : "Lupa kata sandi?"}
              </button>
            </div>
          ) : authMode === "forgot" ? (
            <div style={{ textAlign: "center", marginTop: 2 }}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setForgotStep(1);
                  setAuthError("");
                  setAuthForm({
                    username: "",
                    nama: "",
                    password: "",
                    email: "",
                    nama_tenant: "",
                    new_password: "",
                    reset_token: "",
                  });
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: "var(--maroon)",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {lang === "EN" ? "← Back to Log in" : "← Kembali ke halaman Masuk"}
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                marginTop: 2,
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              {lang === "EN"
                ? "By signing up you agree to the canteen's terms of service."
                : "Dengan mendaftar, Anda menyetujui syarat dan ketentuan layanan kantin."}
            </div>
          )}
        </form>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 14,
          fontSize: 13,
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {authMode === "login" ? (
          <span>
            {lang === "EN" ? "Don't have an account? " : "Belum punya akun? "}
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setAuthError("");
                setAuthSuccess("");
                setAuthForm({
                  username: "",
                  nama: "",
                  password: "",
                  email: "",
                  nama_tenant: "",
                  new_password: "",
                });
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--maroon)",
                fontWeight: 800,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {lang === "EN" ? "Sign up here" : "Daftar di sini"}
            </button>
          </span>
        ) : (
          <span>
            {lang === "EN" ? "Already have an account? " : "Sudah punya akun? "}
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
                setAuthSuccess("");
                setAuthForm({
                  username: "",
                  nama: "",
                  password: "",
                  email: "",
                  nama_tenant: "",
                  new_password: "",
                });
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--maroon)",
                fontWeight: 800,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {lang === "EN" ? "Log in here" : "Masuk di sini"}
            </button>
          </span>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}