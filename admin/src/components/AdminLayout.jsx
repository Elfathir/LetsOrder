import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CreditCard,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  ShieldCheck,
  Store,
  TicketPercent,
  UserRound,
  Users,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";
import BrandLogo from "./BrandLogo.jsx";
import { getInitials } from "../utils/format.js";
import { useI18n } from "../i18n.jsx";

export const ADMIN_VIEWS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Ringkasan operasional" },
  { id: "orders", label: "Pesanan", icon: Receipt, description: "Semua pesanan tenant" },
  { id: "payments", label: "Pembayaran", icon: CreditCard, description: "Verifikasi & rekonsiliasi" },
  { id: "tenants", label: "Tenant", icon: Store, description: "Kelola kantin & jam buka" },
  { id: "users", label: "Pengguna", icon: Users, description: "Akun customer & vendor" },
  { id: "banners", label: "Banner", icon: ImageIcon, description: "Slide beranda customer" },
  { id: "coupons", label: "Kupon", icon: TicketPercent, description: "Kode promo & voucher" },
  { id: "profile", label: "Profil saya", icon: UserRound, description: "Akun administrator" },
];

export default function AdminLayout({
  user,
  activeView,
  onNavigate,
  onLogout,
  loggingOut,
  children,
}) {
  const { lang, setLang, t } = useI18n();
  const displayName = user?.nama || user?.username || "Administrator";
  const currentView = ADMIN_VIEWS.find((view) => view.id === activeView) || ADMIN_VIEWS[0];

  // Same sliding pill indicator as the customer/vendor portal nav.
  const navRef = useRef(null);
  const mainRef = useRef(null);
  const itemRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });

  // Mobile drawer: same mount + slide pattern as the customer/vendor portal.
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);
  const drawerCloseTimerRef = useRef(null);

  const openDrawer = useCallback(() => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    setDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrawerActive(true);
      });
    });
    // Fallback for hidden/backgrounded tabs, where requestAnimationFrame is paused.
    window.setTimeout(() => setDrawerActive(true), 80);
  }, []);

  const closeDrawer = useCallback(() => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    setDrawerActive(false);
    drawerCloseTimerRef.current = setTimeout(() => {
      drawerCloseTimerRef.current = null;
      setDrawerMounted(false);
    }, 320);
  }, []);

  useEffect(() => {
    return () => {
      if (drawerCloseTimerRef.current) clearTimeout(drawerCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!drawerActive) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerActive, closeDrawer]);

  const updatePill = useCallback(() => {
    const el = itemRefs.current[activeView];
    const container = navRef.current;
    if (!el || !container || el.offsetWidth === 0) return;
    setPill({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
      ready: true,
    });
  }, [activeView]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeView]);

  useLayoutEffect(() => {
    updatePill();
    const rafId = requestAnimationFrame(updatePill);
    const timerId = setTimeout(updatePill, 60);
    const handleResize = () => updatePill();
    window.addEventListener("resize", handleResize);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updatePill());
      if (navRef.current) observer.observe(navRef.current);
      if (itemRefs.current[activeView]) observer.observe(itemRefs.current[activeView]);
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updatePill()).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [updatePill, activeView]);

  return (
    <div className="admin-shell">
      {drawerMounted && (
        <div
          className={`admin-drawer-backdrop${drawerActive ? " is-open" : ""}`}
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar${drawerActive ? " is-drawer-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <BrandLogo size={36} />
          <div style={{ minWidth: 0 }}>
            <div className="admin-header-title">Let's Order</div>
            <div className="admin-header-sub">Admin Console</div>
          </div>
        </div>

        <nav className="admin-sidebar-nav" aria-label={t("Navigasi admin")} ref={navRef}>
          <span
            className="admin-nav-pill"
            aria-hidden="true"
            style={{
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
              opacity: pill.ready ? 1 : 0,
            }}
          />

          {ADMIN_VIEWS.map((view) => {
            const Icon = view.icon;
            const active = view.id === activeView;
            const label = t(view.label);
            return (
              <button
                key={view.id}
                ref={(el) => {
                  itemRefs.current[view.id] = el;
                }}
                type="button"
                className={`admin-nav-item${active ? " is-active" : ""}`}
                onClick={() => {
                  onNavigate(view.id);
                  closeDrawer();
                }}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2.1} />
                <span className="admin-nav-label" data-label={label}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <span className="admin-sidebar-note">
            <ShieldCheck size={13} strokeWidth={2.4} />
            {t("Sesi Administrator")}
          </span>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <div className="admin-topbar-main">
            <button
              type="button"
              className="admin-menu-btn btn-interactive"
              onClick={openDrawer}
              aria-label={t("Buka menu")}
              aria-expanded={drawerActive}
            >
              <Menu size={20} strokeWidth={2.4} />
            </button>
            <div className="admin-topbar-title-wrap">
              <div className="admin-topbar-title">{t(currentView.label)}</div>
              <div className="admin-topbar-sub">{t(currentView.description)}</div>
            </div>
          </div>

          <div className="admin-header-actions">
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
            <ThemeToggle size={36} />
            <button
              type="button"
              className="admin-chip is-button btn-interactive"
              onClick={() => {
                onNavigate("profile");
                closeDrawer();
              }}
              title={t("Profil saya")}
            >
              <span className="admin-avatar">
                {user?.avatar ? <img src={user.avatar} alt={displayName} /> : getInitials(displayName)}
              </span>
              <span className="admin-chip-name">{displayName}</span>
            </button>
            <button
              type="button"
              className="admin-logout btn-interactive"
              onClick={onLogout}
              disabled={loggingOut}
            >
              <LogOut size={14} strokeWidth={2.4} />
              {loggingOut ? t("Keluar…") : t("Keluar")}
            </button>
          </div>
        </header>

        <main className="admin-main" ref={mainRef}>
          {children}
        </main>
      </div>
    </div>
  );
}
