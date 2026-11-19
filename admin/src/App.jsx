import { useCallback, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import AdminLayout, { ADMIN_VIEWS } from "./components/AdminLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import TenantsPage from "./pages/TenantsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import BannersPage from "./pages/BannersPage.jsx";
import CouponsPage from "./pages/CouponsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { LangProvider } from "./i18n.jsx";
import {
  api,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from "./services/api.js";

const DEFAULT_VIEW = "dashboard";
const VALID_VIEWS = ADMIN_VIEWS.map((view) => view.id);

function normalizeUser(response) {
  return response?.data?.user || response?.user || response?.data || null;
}

function readViewFromHash() {
  const raw = String(window.location.hash || "").replace(/^#\/?/, "");
  return VALID_VIEWS.includes(raw) ? raw : DEFAULT_VIEW;
}

function AdminApp() {
  const [user, setUser] = useState(() => {
    const stored = getStoredUser();
    return stored?.peran === "Administrator" ? stored : null;
  });
  const [checkingSession, setCheckingSession] = useState(() => Boolean(getStoredToken()));
  const [view, setView] = useState(readViewFromHash);
  const [loggingOut, setLoggingOut] = useState(false);

  // Validate the stored token against the API so a stale/revoked session never shows the panel
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setCheckingSession(false);
      return undefined;
    }

    let cancelled = false;
    api
      .me()
      .then((response) => {
        if (cancelled) return;
        const freshUser = normalizeUser(response);
        if (!freshUser || freshUser.peran !== "Administrator") {
          clearStoredSession();
          setUser(null);
          return;
        }
        setStoredSession(token, freshUser);
        setUser(freshUser);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.status === 401 || err?.status === 403) {
          clearStoredSession();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => setView(readViewFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleNavigate = useCallback((nextView) => {
    const target = VALID_VIEWS.includes(nextView) ? nextView : DEFAULT_VIEW;
    setView(target);
    if (window.location.hash !== `#${target}`) {
      window.history.replaceState(null, "", `#${target}`);
    }
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Session may already be invalid; clearing locally is enough
    }
    clearStoredSession();
    setUser(null);
    handleNavigate(DEFAULT_VIEW);
    setLoggingOut(false);
  };

  const handleProfileUpdated = useCallback((nextUser) => {
    if (!nextUser) return;
    setStoredSession(getStoredToken(), nextUser);
    setUser(nextUser);
  }, []);

  if (checkingSession) {
    return (
      <div className="admin-splash">
        <div className="admin-brand-mark" aria-hidden="true">
          <span className="admin-spinner" style={{ display: "inline-flex" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        <span>Memeriksa sesi admin…</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onAuthenticated={(nextUser) => setUser(nextUser)} />;
  }

  const renderView = () => {
    switch (view) {
      case "orders":
        return <OrdersPage />;
      case "payments":
        return <PaymentsPage />;
      case "tenants":
        return <TenantsPage />;
      case "users":
        return <UsersPage />;
      case "banners":
        return <BannersPage />;
      case "coupons":
        return <CouponsPage />;
      case "profile":
        return <ProfilePage user={user} onUpdated={handleProfileUpdated} />;
      default:
        return <DashboardPage user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AdminLayout
      user={user}
      activeView={view}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      loggingOut={loggingOut}
    >
      {renderView()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AdminApp />
    </LangProvider>
  );
}
