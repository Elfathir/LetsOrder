import { useEffect, useRef, useState } from "react";
import {
  Store,
  Upload,
  CheckCircle2,
  ChevronRight,
  Globe,
} from "lucide-react";

const FLOATING_PLATES = [
  {
    src: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=640&q=80",
    className: "onboarding-plate onboarding-plate-1 animate-float-slow",
    delay: "0s",
  },
  {
    src: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=640&q=80",
    className: "onboarding-plate onboarding-plate-2 animate-float-slow",
    delay: "1.4s",
  },
  {
    src: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=80",
    className: "onboarding-plate onboarding-plate-3 animate-float-slow",
    delay: "0.8s",
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80",
    className: "onboarding-plate onboarding-plate-4 animate-float-slow",
    delay: "2.1s",
  },
];

export default function TenantOnboardingWizard({
  lang,
  t,
  handleToggleLang,
  ThemeToggleButton,
  tenantOnboardingStep,
  setTenantOnboardingStep,
  onboardingForm,
  setOnboardingForm,
  onboardingError,
  setOnboardingError,
  onboardingSaving,
  isOnboardingStep2Valid,
  handleCompleteTenantOnboarding,
  readAndCompressImageFile,
  currentUser,
  onBackToRegister,
}) {
  const rootRef = useRef(null);
  const [renderedStep, setRenderedStep] = useState(tenantOnboardingStep);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (tenantOnboardingStep === renderedStep) return;
    setIsFading(true);
    const timer = setTimeout(() => {
      setRenderedStep(tenantOnboardingStep);
      if (rootRef.current) rootRef.current.scrollTop = 0;
      setIsFading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [tenantOnboardingStep, renderedStep]);

  return (
    <div
      ref={rootRef}
      data-testid="tenant-onboarding-wizard"
      className="onboarding-wizard-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1450,
        backgroundColor: "var(--bg-auth-page)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Top Bar: Language Switcher & Dark Mode Toggle */}
      <div className="onboarding-header-bar">
        <button
          type="button"
          className="header-lang-btn btn-interactive"
          onClick={handleToggleLang}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            minWidth: 74,
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
        {ThemeToggleButton && (
          <ThemeToggleButton
            darkTitle={t?.themeToDark}
            lightTitle={t?.themeToLight}
            size={36}
          />
        )}
      </div>

      {/* Floating Corner Food Plate Photos Only (Zero Text, Zero Card Box) */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 22%, rgba(248, 163, 75, 0.14) 0%, transparent 45%), radial-gradient(circle at 82% 78%, rgba(168, 219, 232, 0.16) 0%, transparent 48%)",
          }}
        />
        {FLOATING_PLATES.map((plate, idx) => (
          <img
            key={idx}
            src={plate.src}
            alt=""
            className={plate.className}
            style={{ animationDelay: plate.delay }}
          />
        ))}
      </div>

      {/* Centered Open Full-Page Content (No Pop-Up Box) */}
      <div className="onboarding-body-wrap">
        <div
          className={`onboarding-content-box${renderedStep === 2 ? " is-step-2" : ""}`}
        >
          {/* Step Progress Bar directly on page */}
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--orange-soft)",
                  color: "var(--orange-dark)",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                }}
              >
                <Store size={14} />
                <span>
                  {lang === "EN"
                    ? `STORE SETUP · STEP ${tenantOnboardingStep} OF 2`
                    : `PENGATURAN TOKO · LANGKAH ${tenantOnboardingStep} DARI 2`}
                </span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)" }}>
                {tenantOnboardingStep === 1 ? "50%" : "100%"}
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: 8,
                borderRadius: 999,
                backgroundColor: "var(--border-light)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: tenantOnboardingStep === 1 ? "50%" : "100%",
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg, var(--orange) 0%, #E07A2E 100%)",
                  transition: "width 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>

          {/* Smooth Dissolve / Fade Stage (No Horizontal Sliding) */}
          <div className={`onboarding-step-stage${isFading ? " is-fading" : ""}`}>
            {renderedStep === 1 ? (
              <div
                style={{
                  width: "100%",
                  padding: "4px 2px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <h1
                  className="onboarding-title-1"
                  style={{
                    fontWeight: 900,
                    color: "var(--maroon)",
                    marginBottom: 10,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {lang === "EN" ? "Set up your profile picture" : "Pasang foto profil kantin"}
                </h1>
                <p
                  className="onboarding-subtitle"
                  style={{
                    color: "var(--text-muted)",
                    lineHeight: 1.55,
                    marginBottom: 30,
                  }}
                >
                  {lang === "EN"
                    ? `Upload a clear profile photo for "${onboardingForm.nama_tenant || "your canteen"}" so customers can easily recognize your stall.`
                    : `Unggah foto profil terbaik untuk "${onboardingForm.nama_tenant || "kantin Anda"}" agar mudah dikenali pembeli.`}
                </p>

                {/* Circular Avatar Preview */}
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <div
                    className="onboarding-avatar-circle"
                    style={{
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-cream)",
                      border: onboardingForm.logo
                        ? "4px solid var(--orange)"
                        : "3px dashed var(--border-input)",
                      boxShadow: onboardingForm.logo
                        ? "0 16px 36px rgba(248, 163, 75, 0.28)"
                        : "0 10px 26px rgba(82, 42, 40, 0.08)",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.35s ease",
                    }}
                  >
                    {onboardingForm.logo ? (
                      <img
                        src={onboardingForm.logo}
                        alt={lang === "EN" ? "Store photo preview" : "Pratinjau foto kantin"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Store size={48} color="var(--orange)" />
                        <span style={{ fontSize: 13, fontWeight: 800 }}>
                          {lang === "EN" ? "No photo yet" : "Belum ada foto"}
                        </span>
                      </div>
                    )}
                  </div>

                  {onboardingForm.logo && (
                    <div
                      className="animate-fade"
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        backgroundColor: "#1F7A4C",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(31, 122, 76, 0.35)",
                        border: "3px solid var(--bg-auth-page)",
                      }}
                    >
                      <CheckCircle2 size={19} />
                    </div>
                  )}
                </div>

                <label
                  className="btn-interactive btn-lift onboarding-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "12px 26px",
                    borderRadius: "var(--radius-pill)",
                    border: "1.5px solid var(--orange)",
                    backgroundColor: onboardingForm.logo ? "var(--bg-card)" : "var(--orange-soft)",
                    color: "var(--maroon)",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    marginBottom: 12,
                  }}
                >
                  <Upload size={16} />
                  <span>
                    {onboardingForm.logo
                      ? lang === "EN"
                        ? "Change Profile Photo"
                        : "Ganti Foto Profil"
                      : lang === "EN"
                        ? "Upload Profile Photo"
                        : "Pilih Foto Profil"}
                  </span>
                  <input
                    data-testid="onboarding-photo-input"
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const compressed = await readAndCompressImageFile(file, 720, 0.85);
                        setOnboardingForm((p) => ({ ...p, logo: compressed }));
                        setOnboardingError("");
                      } catch (err) {
                        setOnboardingError(
                          err?.message ||
                            (lang === "EN"
                              ? "Failed to process image."
                              : "Gagal memproses gambar.")
                        );
                      }
                    }}
                  />
                </label>

                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                  {lang === "EN"
                    ? "Format: .JPEG, .PNG · Use your stall logo or signature dish photo"
                    : "Format: .JPEG, .PNG · Gunakan logo atau foto hidangan andalan Anda"}
                </div>

                {onboardingError && (
                  <div
                    role="alert"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor: "var(--alert-error-bg)",
                      color: "var(--alert-error-text)",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    {onboardingError}
                  </div>
                )}

                {/* Action Stack (Overflow visible — no hidden clipping box around Next button) */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: 400,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    alignItems: "stretch",
                  }}
                >
                  {Boolean(onboardingForm.logo) && (
                    <div className="onboarding-next-reveal">
                      <button
                        type="button"
                        data-testid="onboarding-next-btn"
                        onClick={() => {
                          if (!onboardingForm.logo) return;
                          setOnboardingError("");
                          setTenantOnboardingStep(2);
                          try {
                            if (currentUser?.id_user) {
                              localStorage.setItem(
                                `letsorder_tenant_onboarding_${currentUser.id_user}`,
                                "2"
                              );
                            }
                          } catch {
                            // Ignore storage errors
                          }
                        }}
                        className="btn-interactive btn-lift onboarding-btn"
                        style={{
                          width: "100%",
                          padding: "14px 24px",
                          borderRadius: "var(--radius-pill)",
                          border: "none",
                          backgroundColor: "var(--orange)",
                          color: "var(--on-orange-text)",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          boxShadow: "0 6px 20px rgba(248, 163, 75, 0.38)",
                        }}
                      >
                        <span>{lang === "EN" ? "Next" : "Selanjutnya"}</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {onBackToRegister && (
                    <button
                      type="button"
                      data-testid="onboarding-back-register-btn"
                      onClick={onBackToRegister}
                      className="btn-interactive onboarding-btn"
                      style={{
                        width: "100%",
                        padding: "12px 22px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {lang === "EN" ? "← Back to Sign Up" : "← Kembali ke Halaman Daftar"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ width: "100%", padding: "2px 2px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                  <div
                    style={{
                      width: 62,
                      height: 62,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2.5px solid var(--orange)",
                      backgroundColor: "var(--bg-cream)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {onboardingForm.logo ? (
                      <img
                        src={onboardingForm.logo}
                        alt={lang === "EN" ? "Store photo" : "Foto kantin"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Store size={26} color="var(--orange)" />
                    )}
                  </div>
                  <div>
                    <h1
                      className="onboarding-title-2"
                      style={{
                        fontWeight: 900,
                        color: "var(--maroon)",
                        marginBottom: 3,
                      }}
                    >
                      {lang === "EN" ? "Complete your store details" : "Lengkapi profil toko kantin"}
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.45 }}>
                      {lang === "EN"
                        ? "All fields marked with * are required before opening your store."
                        : "Semua kolom bertanda * wajib diisi sebelum membuka toko Anda."}
                    </p>
                  </div>
                </div>

                {onboardingError && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor: "var(--alert-error-bg)",
                      color: "var(--alert-error-text)",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    {onboardingError}
                  </div>
                )}

                <form
                  onSubmit={handleCompleteTenantOnboarding}
                  style={{ display: "flex", flexDirection: "column", gap: 15 }}
                >
                  <div>
                    <label className="onboarding-label">
                      {lang === "EN" ? "Canteen / Tenant Name *" : "Nama Kantin / Tenant *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={onboardingForm.nama_tenant}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, nama_tenant: e.target.value }))
                      }
                      placeholder={lang === "EN" ? "e.g. Bu Sari Canteen" : "Contoh: Kantin Bu Sari"}
                      className="onboarding-input"
                    />
                  </div>

                  <div>
                    <label className="onboarding-label">
                      {lang === "EN" ? "Phone / WhatsApp *" : "Nomor Telepon / WhatsApp *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={onboardingForm.no_telp}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, no_telp: e.target.value }))
                      }
                      placeholder="081234567890"
                      className="onboarding-input"
                    />
                  </div>

                  <div>
                    <label className="onboarding-label">
                      {lang === "EN" ? "Email Address *" : "Alamat Email *"}
                    </label>
                    <input
                      type="email"
                      required
                      value={onboardingForm.email}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="tenant@upnvj.ac.id"
                      className="onboarding-input"
                    />
                  </div>

                  <div>
                    <label className="onboarding-label">
                      {lang === "EN" ? "Booth / Location *" : "Lokasi / Stand *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={onboardingForm.booth}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, booth: e.target.value }))
                      }
                      placeholder={
                        lang === "EN"
                          ? "e.g. Booth #3 · Building A"
                          : "Contoh: Stand #3 · Kantin Gedung A"
                      }
                      className="onboarding-input"
                    />
                  </div>

                  {/* Opening & Closing hours side-by-side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="onboarding-label">
                        {lang === "EN" ? "Opening Time *" : "Jam Buka *"}
                      </label>
                      <input
                        type="time"
                        required
                        value={onboardingForm.jam_buka}
                        onChange={(e) =>
                          setOnboardingForm((p) => ({ ...p, jam_buka: e.target.value }))
                        }
                        className="onboarding-input"
                      />
                    </div>

                    <div>
                      <label className="onboarding-label">
                        {lang === "EN" ? "Closing Time *" : "Jam Tutup *"}
                      </label>
                      <input
                        type="time"
                        required
                        value={onboardingForm.jam_tutup}
                        onChange={(e) =>
                          setOnboardingForm((p) => ({ ...p, jam_tutup: e.target.value }))
                        }
                        className="onboarding-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="onboarding-label">
                      {lang === "EN" ? "Store Description *" : "Deskripsi Kantin *"}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={onboardingForm.deskripsi}
                      onChange={(e) =>
                        setOnboardingForm((p) => ({ ...p, deskripsi: e.target.value }))
                      }
                      placeholder={
                        lang === "EN"
                          ? "Describe your signature dishes, specialties, or canteen service..."
                          : "Ceritakan menu andalan, spesialisasi masakan, atau layanan kantin Anda..."
                      }
                      className="onboarding-input"
                      style={{
                        minHeight: 96,
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div className="onboarding-actions">
                    <button
                      type="button"
                      onClick={() => setTenantOnboardingStep(1)}
                      className="btn-interactive onboarding-btn"
                      style={{
                        padding: "12px 22px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "← Back" : "← Kembali"}
                    </button>

                    <button
                      type="submit"
                      data-testid="onboarding-launch-btn"
                      disabled={!isOnboardingStep2Valid || onboardingSaving}
                      className="btn-interactive btn-lift onboarding-btn"
                      style={{
                        flex: 1,
                        padding: "13px 24px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        backgroundColor: isOnboardingStep2Valid
                          ? "var(--orange)"
                          : "var(--border-input)",
                        color: isOnboardingStep2Valid
                          ? "var(--on-orange-text)"
                          : "var(--text-muted)",
                        fontWeight: 800,
                        cursor:
                          isOnboardingStep2Valid && !onboardingSaving
                            ? "pointer"
                            : "not-allowed",
                        boxShadow: isOnboardingStep2Valid
                          ? "0 6px 18px rgba(248, 163, 75, 0.36)"
                          : "none",
                        opacity: onboardingSaving ? 0.7 : 1,
                        transition: "all 0.25s ease",
                      }}
                    >
                      {onboardingSaving
                        ? lang === "EN"
                          ? "Opening Store..."
                          : "Menyiapkan Toko..."
                        : lang === "EN"
                          ? "Open Store & Go to Dashboard →"
                          : "Buka Toko & Masuk ke Dasbor →"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
