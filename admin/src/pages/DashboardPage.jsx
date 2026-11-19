import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Package,
  Receipt,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { api } from "../services/api.js";
import {
  formatCompactRupiah,
  formatDayLabel,
  formatRupiah,
  getAdminLocale,
} from "../utils/format.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useI18n } from "../i18n.jsx";

const EMPTY_STATS = {
  today: {
    orders: 0,
    revenue: 0,
    awaiting_payment: 0,
    expired_payments: 0,
    open_tenants: 0,
    total_tenants: 0,
    customers: 0,
    vendors: 0,
  },
  totals: { orders: 0, revenue: 0, users: 0, tenants: 0, menus: 0 },
  series: [],
  top_tenants: [],
  top_menus: [],
  recent_orders: [],
  alerts: { stale_unpaid: 0, expired_payments: 0, closed_tenants: 0, empty_tenants: 0 },
};

// A 30-day range is read per week: a handful of buckets instead of 30 crowded bars.
function buildGroupedSeries(series) {
  const bucketCount = Math.max(1, Math.ceil(series.length / 7));
  const bucketSize = Math.ceil(series.length / bucketCount);
  const buckets = [];
  for (let index = 0; index < series.length; index += bucketSize) {
    buckets.push(series.slice(index, index + bucketSize));
  }
  return buckets.map((rows) => ({
    date: rows[0].date,
    end_date: rows[rows.length - 1].date,
    days: rows.length,
    revenue: rows.reduce((sum, row) => sum + Number(row.revenue || 0), 0),
    orders: rows.reduce((sum, row) => sum + Number(row.orders || 0), 0),
  }));
}

export default function DashboardPage({ user, onNavigate }) {
  const { t } = useI18n();
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loadedDays, setLoadedDays] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .adminStats({ days })
      .then((response) => {
        if (cancelled) return;
        setStats({ ...EMPTY_STATS, ...(response?.data || {}) });
        setLoadedDays(days);
        setError("");
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || t("Gagal memuat statistik."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, t]);

  const displayName = user?.nama || user?.username || "Administrator";
  const isWeekly = days > 7;
  // Never render the previous range while the new one is still loading:
  // the card title would say "7 hari" while the bars still show 30 days.
  const dataReady = loadedDays === days;
  const chartSeries = dataReady
    ? isWeekly
      ? buildGroupedSeries(stats.series || [])
      : stats.series || []
    : [];
  const chartTotal = chartSeries.reduce((sum, row) => sum + Number(row.revenue || 0), 0);
  const bucketDays = chartSeries[0]?.days || 0;
  const maxRevenue = Math.max(1, ...chartSeries.map((row) => Number(row.revenue || 0)));
  const totalAlerts =
    Number(stats.alerts?.stale_unpaid || 0) +
    Number(stats.alerts?.expired_payments || 0) +
    Number(stats.alerts?.empty_tenants || 0);

  const kpis = [
    {
      label: t("Pesanan hari ini"),
      value: stats.today.orders,
      hint: t("Total {n} pesanan", { n: stats.totals.orders }),
      icon: Receipt,
    },
    {
      label: t("Omzet hari ini"),
      value: formatRupiah(stats.today.revenue),
      hint: t("Total {amount}", { amount: formatCompactRupiah(stats.totals.revenue) }),
      icon: TrendingUp,
    },
    {
      label: t("Menunggu pembayaran"),
      value: stats.today.awaiting_payment,
      hint: t("{n} lewat 15 menit", { n: stats.alerts?.stale_unpaid || 0 }),
      icon: CreditCard,
    },
    {
      label: t("Tenant buka"),
      value: `${stats.today.open_tenants}/${stats.today.total_tenants}`,
      hint: t("{n} sedang tutup", { n: stats.alerts?.closed_tenants || 0 }),
      icon: Store,
    },
  ];

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Ringkasan")}</div>
          <h1 className="admin-welcome-title">{t("Halo, {name}", { name: displayName })}</h1>
          <p className="admin-welcome-desc">
            {t("Pantau pesanan, pembayaran, dan tenant kantin dari satu tempat.")}
          </p>
        </div>
        <div className="admin-segmented" role="group" aria-label={t("Rentang hari")}>
          {[7, 30].map((option) => (
            <button
              key={option}
              type="button"
              className={`admin-segmented-btn${days === option ? " is-active" : ""}`}
              onClick={() => setDays(option)}
            >
              {t("{n} hari", { n: option })}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="admin-alert is-error animate-slide-up" role="alert" style={{ marginTop: 14 }}>
          <AlertTriangle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="admin-kpi-card animate-slide-up">
              <div className="admin-kpi-icon">
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <div className="admin-kpi-label">{kpi.label}</div>
              <div className={`admin-kpi-value${loading ? " is-loading" : ""}`}>
                {loading ? "—" : kpi.value}
              </div>
              <div className="admin-kpi-hint">{kpi.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-split-grid">
        <section className="admin-card animate-slide-up" aria-labelledby="chart-title">
          <div className="admin-card-head">
            <h2 id="chart-title" className="admin-card-title">
              <TrendingUp size={16} strokeWidth={2.4} />
              {t("Omzet {n} hari terakhir", { n: days })}
              <span className="admin-chart-note">
                {isWeekly ? t("tiap {n} hari", { n: bucketDays }) : t("tiap hari")}
              </span>
            </h2>
            <span className="admin-card-meta">
              {dataReady ? formatRupiah(chartTotal) : t("Memuat…")}
            </span>
          </div>

          {!dataReady ? (
            <p className="admin-empty-text">{t("Memuat data {n} hari…", { n: days })}</p>
          ) : chartSeries.length === 0 ? (
            <p className="admin-empty-text">{t("Belum ada data pada rentang ini.")}</p>
          ) : (
            <div
              className="admin-chart"
              role="img"
              aria-label={isWeekly ? t("Grafik omzet mingguan") : t("Grafik omzet harian")}
            >
              {chartSeries.map((row) => {
                const revenue = Number(row.revenue || 0);
                const height = Math.round((revenue / maxRevenue) * 100);
                const period = isWeekly
                  ? t("{a} – {b} ({n} hari)", {
                      a: formatDayLabel(row.date),
                      b: formatDayLabel(row.end_date),
                      n: row.days,
                    })
                  : formatDayLabel(row.date);
                return (
                  <div key={row.date} className="admin-chart-col">
                    <div className="admin-chart-track">
                      <div
                        className={`admin-chart-bar${revenue > 0 ? " has-value" : ""}`}
                        style={{ height: `${Math.max(revenue > 0 ? 6 : 2, height)}%` }}
                        title={t("{period} · {amount} · {n} pesanan", {
                          period,
                          amount: formatRupiah(revenue),
                          n: row.orders,
                        })}
                      />
                    </div>
                    <span className="admin-chart-label">{formatDayLabel(row.date)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-card animate-slide-up" aria-labelledby="alerts-title">
          <div className="admin-card-head">
            <h2 id="alerts-title" className="admin-card-title">
              <AlertTriangle size={16} strokeWidth={2.4} />
              {t("Perlu perhatian")}
            </h2>
            <span className="admin-card-meta">{totalAlerts + Number(stats.alerts?.closed_tenants || 0)}</span>
          </div>

          <ul className="admin-alert-list">
            <li>
              <span>{t("Pesanan belum dibayar > 15 menit")}</span>
              <strong>{stats.alerts?.stale_unpaid || 0}</strong>
            </li>
            <li>
              <span>{t("Pembayaran kedaluwarsa")}</span>
              <strong>{stats.alerts?.expired_payments || 0}</strong>
            </li>
            <li>
              <span>{t("Tenant sedang tutup")}</span>
              <strong>{stats.alerts?.closed_tenants || 0}</strong>
            </li>
            <li>
              <span>{t("Tenant tanpa menu")}</span>
              <strong>{stats.alerts?.empty_tenants || 0}</strong>
            </li>
          </ul>

          <button
            type="button"
            className="admin-link-btn btn-interactive"
            onClick={() => onNavigate("orders")}
          >
            {t("Lihat pesanan")} <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </section>
      </div>

      <div className="admin-split-grid">
        <section className="admin-card animate-slide-up" aria-labelledby="recent-title">
          <div className="admin-card-head">
            <h2 id="recent-title" className="admin-card-title">
              <Receipt size={16} strokeWidth={2.4} />
              {t("Pesanan terbaru")}
            </h2>
            <button
              type="button"
              className="admin-link-btn btn-interactive"
              onClick={() => onNavigate("orders")}
            >
              {t("Semua")} <ArrowRight size={13} strokeWidth={2.4} />
            </button>
          </div>

          {(stats.recent_orders || []).length === 0 ? (
            <p className="admin-empty-text">{t("Belum ada pesanan masuk.")}</p>
          ) : (
            <ul className="admin-mini-list">
              {stats.recent_orders.map((order) => (
                <li key={order.id_pesanan}>
                  <div className="admin-mini-main">
                    <span className="admin-mini-strong">#{order.nomor_antrean}</span>
                    <span className="admin-mini-muted">
                      {order.tenant_name} · {order.customer_name}
                    </span>
                  </div>
                  <div className="admin-mini-side">
                    <StatusBadge status={order.status_pesanan} />
                    <span className="admin-mini-muted">{formatRupiah(order.total_harga)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card animate-slide-up" aria-labelledby="top-tenant-title">
          <div className="admin-card-head">
            <h2 id="top-tenant-title" className="admin-card-title">
              <Store size={16} strokeWidth={2.4} />
              {t("Tenant terlaris")}
            </h2>
            <span className="admin-card-meta">
              {t("{n} tenant", { n: (stats.top_tenants || []).length })}
            </span>
          </div>

          {(stats.top_tenants || []).length === 0 ? (
            <p className="admin-empty-text">{t("Belum ada penjualan pada rentang ini.")}</p>
          ) : (
            <ul className="admin-mini-list">
              {(stats.top_tenants || []).map((tenant, index) => (
                <li key={`tenant-${tenant.id_tenant}`}>
                  <div className="admin-mini-main">
                    <span className="admin-mini-strong">
                      {index + 1}. {tenant.nama_tenant}
                    </span>
                    <span className="admin-mini-muted">
                      {t("{n} pesanan", { n: tenant.orders })}
                      {tenant.booth ? ` · ${tenant.booth}` : ""}
                    </span>
                  </div>
                  <span className="admin-mini-side admin-mini-strong">
                    {formatCompactRupiah(tenant.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-card animate-slide-up" aria-labelledby="top-menu-title">
        <div className="admin-card-head">
          <h2 id="top-menu-title" className="admin-card-title">
            <Package size={16} strokeWidth={2.4} />
            {t("Menu terlaris")}
          </h2>
          <span className="admin-card-meta">
            {t("{n} menu", { n: (stats.top_menus || []).length })}
          </span>
        </div>

        {(stats.top_menus || []).length === 0 ? (
          <p className="admin-empty-text">{t("Belum ada menu terjual pada rentang ini.")}</p>
        ) : (
          <ul className="admin-mini-list">
            {(stats.top_menus || []).map((menu, index) => (
              <li key={`menu-${menu.id_menu}`}>
                <div className="admin-mini-main">
                  <span className="admin-mini-strong">
                    {index + 1}. {menu.nama_menu}
                  </span>
                  <span className="admin-mini-muted">
                    {t("{n} terjual", { n: menu.qty })}
                    {menu.tenant_name ? ` · ${menu.tenant_name}` : ""}
                  </span>
                </div>
                <span className="admin-mini-side admin-mini-muted">
                  {formatCompactRupiah(menu.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="admin-meta-strip">
        <span>
          <Users size={13} strokeWidth={2.2} /> {t("{n} pengguna", { n: stats.totals.users })}
        </span>
        <span>
          <Store size={13} strokeWidth={2.2} /> {t("{n} tenant", { n: stats.totals.tenants })}
        </span>
        <span>
          <Package size={13} strokeWidth={2.2} /> {t("{n} menu", { n: stats.totals.menus })}
        </span>
        <span>
          {t("Diperbarui")}{" "}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString(getAdminLocale(), { hour: "2-digit", minute: "2-digit" })
            : "—"}
        </span>
      </div>
    </div>
  );
}
