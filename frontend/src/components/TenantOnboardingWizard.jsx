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
    size: "clamp(130px, 21vw, 270px)",
    style: { top: "-52px", left: "-64px", animationDelay: "0s" },
  },
  {
    src: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=640&q=80",
    size: "clamp(140px, 22vw, 290px)",
    style: { bottom: "-68px", left: "-58px", animationDelay: "1.4s" },
  },
  {
    src: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=640&q=80",
    size: "clamp(120px, 18vw, 235px)",
    style: { top: "24%", right: "-72px", animationDelay: "0.8s" },
  },
  {
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&q=80",
    size: "clamp(135px, 20vw, 260px)",
    style: { bottom: "-62px", right: "-60px", animationDelay: "2.1s" },
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
}) {
  return (
    <div
      data-testid="tenant-onboarding-wizard"
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
      <div
        style={{
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 8,
          padding: "16px 24px 0",
        }}
      >
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
            size={34}
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
            className="animate-float-slow"
            style={{
              position: "absolute",
              width: plate.size,
              height: plate.size,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              boxShadow: "0 20px 48px rgba(82, 42, 40, 0.2)",
              opacity: 0.94,
              ...plate.style,
            }}
          />
        ))}
      </div>

      {/* Centered Open Full-Page Content (No Pop-Up Box) */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: "1 0 auto",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 20px 44px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: tenantOnboardingStep === 1 ? 480 : 600,
            transition: "max-width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Step Progress Bar directly on page */}
          <div style={{ marginBottom: 24 }}>
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
                  padding: "5px 13px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--orange-soft)",
                  color: "var(--orange-dark)",
                  fontSize: 11.5,
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
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--text-muted)" }}>
                {tenantOnboardingStep === 1 ? "50%" : "100%"}
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: 7,
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
                  transition: "width 0.48s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              />
            </div>
          </div>

          {/* Horizontal Sliding Steps Viewport */}
          <div style={{ overflow: "hidden", width: "100%" }}>
            <div
              style={{
                display: "flex",
                width: "200%",
                transform: tenantOnboardingStep === 1 ? "translateX(0%)" : "translateX(-50%)",
                transition: "transform 0.52s cubic-bezier(0.22, 1, 0.36, 1)",
                alignItems: "flex-start",
              }}
            >
              {/* STEP 1: Profile Photo Setup */}
              <div
                style={{
                  width: "50%",
                  padding: "6px 6px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <h1
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: "var(--maroon)",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {lang === "EN" ? "Set up your profile picture" : "Pasang foto profil kantin"}
                </h1>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    maxWidth: 400,
                    lineHeight: 1.55,
                    marginBottom: 28,
                  }}
                >
                  {lang === "EN"
                    ? `Upload a clear profile photo for "${onboardingForm.nama_tenant || "your canteen"}" so customers can easily recognize your stall.`
                    : `Unggah foto profil terbaik untuk "${onboardingForm.nama_tenant || "kantin Anda"}" agar mudah dikenali pembeli.`}
                </p>

                {/* Circular Avatar Preview */}
                <div style={{ position: "relative", marginBottom: 22 }}>
                  <div
                    style={{
                      width: 156,
                      height: 156,
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
                          gap: 6,
                          color: "var(--text-muted)",
                        }}
                      >
                        <Store size={44} color="var(--orange)" />
                        <span style={{ fontSize: 12, fontWeight: 800 }}>
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
                        bottom: 6,
                        right: 6,
                        width: 36,
                        height: 36,
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
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </div>

                <label
                  className="btn-interactive btn-lift"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 24px",
                    borderRadius: "var(--radius-pill)",
                    border: "1.5px solid var(--orange)",
                    backgroundColor: onboardingForm.logo ? "var(--bg-card)" : "var(--orange-soft)",
                    color: "var(--maroon)",
                    fontSize: 13.5,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    marginBottom: 12,
                  }}
                >
                  <Upload size={15} />
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

                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
                  {lang === "EN"
                    ? "Format: .JPEG, .PNG · Use your stall logo or signature dish photo"
                    : "Format: .JPEG, .PNG · Gunakan logo atau foto hidangan andalan Anda"}
                </div>

                {onboardingError && tenantOnboardingStep === 1 && (
                  <div
                    role="alert"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor: "var(--alert-error-bg)",
                      color: "var(--alert-error-text)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    {onboardingError}
                  </div>
                )}

                {/* Next Button appears once photo is uploaded */}
                <div
                  style={{
                    width: "100%",
                    maxWidth: 340,
                    maxHeight: onboardingForm.logo ? 72 : 0,
                    opacity: onboardingForm.logo ? 1 : 0,
                    transform: onboardingForm.logo
                      ? "translateY(0) scale(1)"
                      : "translateY(10px) scale(0.96)",
                    overflow: "hidden",
                    transition: "all 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: onboardingForm.logo ? "auto" : "none",
                  }}
                >
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
                    className="btn-interactive btn-lift"
                    style={{
                      width: "100%",
                      padding: "13px 22px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      backgroundColor: "var(--orange)",
                      color: "var(--on-orange-text)",
                      fontSize: 14.5,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 6px 18px rgba(248, 163, 75, 0.38)",
                    }}
                  >
                    <span>{lang === "EN" ? "Next" : "Selanjutnya"}</span>
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              {/* STEP 2: Complete Store Details */}
              <div
                style={{
                  width: "50%",
                  padding: "4px 6px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
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
                      <Store size={24} color="var(--orange)" />
                    )}
                  </div>
                  <div>
                    <h1 style={{ fontSize: 23, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
                      {lang === "EN" ? "Complete your store details" : "Lengkapi profil toko kantin"}
                    </h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {lang === "EN"
                        ? "All fields marked with * are required before opening your store."
                        : "Semua kolom bertanda * wajib diisi sebelum membuka toko Anda."}
                    </p>
                  </div>
                </div>

                {onboardingError && tenantOnboardingStep === 2 && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor: "var(--alert-error-bg)",
                      color: "var(--alert-error-text)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      marginBottom: 14,
                    }}
                  >
                    {onboardingError}
                  </div>
                )}

                <form
                  onSubmit={handleCompleteTenantOnboarding}
                  style={{ display: "flex", flexDirection: "column", gap: 13 }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
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
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13.5,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
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
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13.5,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
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
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13.5,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
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
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13.5,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
                        {lang === "EN" ? "Opening Time *" : "Jam Buka *"}
                      </label>
                      <input
                        type="time"
                        required
                        value={onboardingForm.jam_buka}
                        onChange={(e) =>
                          setOnboardingForm((p) => ({ ...p, jam_buka: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
                        {lang === "EN" ? "Closing Time *" : "Jam Tutup *"}
                      </label>
                      <input
                        type="time"
                        required
                        value={onboardingForm.jam_tutup}
                        onChange={(e) =>
                          setOnboardingForm((p) => ({ ...p, jam_tutup: e.target.value }))
                        }
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          backgroundColor: "var(--bg-card)",
                          fontSize: 13,
                          color: "var(--maroon)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
                        {lang === "EN" ? "Initial Status *" : "Status Awal *"}
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setOnboardingForm((p) => ({ ...p, status_buka: !p.status_buka }))
                        }
                        style={{
                          width: "100%",
                          padding: "9px 10px",
                          borderRadius: 10,
                          border: onboardingForm.status_buka
                            ? "1.5px solid var(--alert-success-border)"
                            : "1.5px solid var(--border-input)",
                          backgroundColor: onboardingForm.status_buka
                            ? "var(--alert-success-bg)"
                            : "var(--bg-card)",
                          color: onboardingForm.status_buka
                            ? "var(--alert-success-text)"
                            : "var(--maroon)",
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: onboardingForm.status_buka ? "#239B56" : "#C84336",
                          }}
                        />
                        <span>
                          {onboardingForm.status_buka
                            ? lang === "EN"
                              ? "Open"
                              : "Buka"
                            : lang === "EN"
                              ? "Closed"
                              : "Tutup"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--maroon)",
                        marginBottom: 4,
                      }}
                    >
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
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-card)",
                        fontSize: 13.5,
                        color: "var(--maroon)",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setTenantOnboardingStep(1)}
                      className="btn-interactive"
                      style={{
                        padding: "12px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontSize: 13.5,
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
                      className="btn-interactive btn-lift"
                      style={{
                        flex: 1,
                        padding: "13px 22px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        backgroundColor: isOnboardingStep2Valid
                          ? "var(--orange)"
                          : "var(--border-input)",
                        color: isOnboardingStep2Valid
                          ? "var(--on-orange-text)"
                          : "var(--text-muted)",
                        fontSize: 14,
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
