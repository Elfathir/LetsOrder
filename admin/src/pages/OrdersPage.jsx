import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, Search, Store, XCircle } from "lucide-react";
import { api } from "../services/api.js";
import { formatDateTime, formatRupiah, ORDER_STATUSES } from "../utils/format.js";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import { useI18n } from "../i18n.jsx";

const PER_PAGE = 10;

const initialFilters = {
  status: "All",
  id_tenant: "",
  q: "",
  from: "",
  to: "",
};

export default function OrdersPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusDraft, setStatusDraft] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    api
      .adminTenants({ per_page: 100 })
      .then((response) => {
        if (!cancelled) setTenants(response?.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminOrders({ ...filters, page, per_page: PER_PAGE });
      setOrders(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err?.message || t("Gagal memuat pesanan."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openDetail = async (orderId) => {
    setDetail({ id_pesanan: orderId });
    setDetailLoading(true);
    setCancelReason("");
    setNotice("");
    try {
      const response = await api.adminOrder(orderId);
      setDetail(response?.data || null);
      setStatusDraft(response?.data?.status_pesanan || "");
    } catch (err) {
      setError(err?.message || t("Gagal memuat detail pesanan."));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async (orderId) => {
    const response = await api.adminOrder(orderId);
    setDetail(response?.data || null);
    setStatusDraft(response?.data?.status_pesanan || "");
    await loadOrders();
  };

  const handleStatusChange = async () => {
    if (!detail?.id_pesanan || !statusDraft || statusDraft === detail.status_pesanan) return;
    setActionLoading("status");
    setNotice("");
    try {
      await api.updateOrderStatus(detail.id_pesanan, statusDraft);
      setNotice(t('Status diubah menjadi "{status}".', { status: t(statusDraft) }));
      await refreshDetail(detail.id_pesanan);
    } catch (err) {
      setError(err?.message || t("Gagal mengubah status pesanan."));
    } finally {
      setActionLoading("");
    }
  };

  const handleCancel = async () => {
    if (!detail?.id_pesanan) return;
    setActionLoading("cancel");
    setNotice("");
    try {
      await api.cancelOrder(detail.id_pesanan, cancelReason.trim());
      setNotice(t("Pesanan dibatalkan."));
      setCancelReason("");
      await refreshDetail(detail.id_pesanan);
    } catch (err) {
      setError(err?.message || t("Gagal membatalkan pesanan."));
    } finally {
      setActionLoading("");
    }
  };

  const handleVerifyPayment = async () => {
    if (!detail?.id_pesanan) return;
    setActionLoading("verify");
    setNotice("");
    try {
      await api.verifyPaymentByOrder(detail.id_pesanan, "Terverifikasi");
      setNotice(t("Pembayaran ditandai terverifikasi."));
      await refreshDetail(detail.id_pesanan);
    } catch (err) {
      setError(err?.message || t("Gagal memverifikasi pembayaran."));
    } finally {
      setActionLoading("");
    }
  };

  const tenantOptions = useMemo(
    () => tenants.slice().sort((a, b) => String(a.nama_tenant).localeCompare(String(b.nama_tenant))),
    [tenants]
  );

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchInput("");
    setPage(1);
  };

  const canCancel = detail && !["Selesai", "Dibatalkan"].includes(detail.status_pesanan);
  const canVerify = detail?.payment && detail.payment.status_verifikasi === "Menunggu";

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Operasional")}</div>
          <h1 className="admin-page-title">{t("Pesanan semua tenant")}</h1>
          <p className="admin-page-desc">
            {t("Pantau alur pesanan self-pickup, ubah status, atau batalkan pesanan bermasalah.")}
          </p>
        </div>
        <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadOrders}>
          <RefreshCw size={14} strokeWidth={2.4} className={loading ? "admin-spinner" : undefined} />
          {t("Muat ulang")}
        </button>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={15} strokeWidth={2.2} />
          <input
            type="text"
            className="admin-search-input"
            placeholder={t("Cari nomor antrean, tenant, atau customer")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={filters.status}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, status: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Filter status")}
        >
          <option value="All">{t("Semua status")}</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(status)}
            </option>
          ))}
        </select>

        <select
          className="admin-select"
          value={filters.id_tenant}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, id_tenant: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Filter tenant")}
        >
          <option value="">{t("Semua tenant")}</option>
          {tenantOptions.map((tenant) => (
            <option key={tenant.id_tenant} value={tenant.id_tenant}>
              {tenant.nama_tenant}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="admin-input admin-date"
          value={filters.from}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, from: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Tanggal mulai")}
        />
        <input
          type="date"
          className="admin-input admin-date"
          value={filters.to}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, to: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Tanggal akhir")}
        />

        <button type="button" className="admin-ghost-btn btn-interactive" onClick={resetFilters}>
          {t("Reset")}
        </button>
      </div>

      {error && (
        <div className="admin-alert is-error animate-slide-up" role="alert">
          <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{error}</span>
        </div>
      )}

      <div className="admin-table-card animate-slide-up">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("Antrean")}</th>
                <th>{t("Waktu")}</th>
                <th>{t("Tenant")}</th>
                <th>{t("Customer")}</th>
                <th className="is-right">{t("Total")}</th>
                <th>{t("Status")}</th>
                <th>{t("Bayar")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="admin-table-empty">{t("Memuat pesanan…")}</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="admin-table-empty">
                      {t("Tidak ada pesanan yang cocok dengan filter.")}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id_pesanan} className="admin-table-row">
                    <td>
                      <span className="admin-mono">#{order.nomor_antrean}</span>
                    </td>
                    <td className="admin-cell-muted">{formatDateTime(order.waktu_pesan)}</td>
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-cell-strong">{order.tenant?.nama_tenant || "—"}</span>
                        <span className="admin-cell-muted">{order.tenant?.booth || t("Tanpa booth")}</span>
                      </div>
                    </td>
                    <td className="admin-cell-muted">{order.customer?.nama || "—"}</td>
                    <td className="is-right admin-cell-strong">{formatRupiah(order.total_harga)}</td>
                    <td>
                      <StatusBadge status={order.status_pesanan} />
                    </td>
                    <td>
                      <StatusBadge
                        status={order.is_paid ? "Terverifikasi" : order.payment?.status_verifikasi || "Menunggu"}
                        label={order.is_paid ? t("Lunas") : order.payment?.status_verifikasi || t("Belum bayar")}
                      />
                    </td>
                    <td className="is-right">
                      <button
                        type="button"
                        className="admin-ghost-btn btn-interactive"
                        onClick={() => openDetail(order.id_pesanan)}
                      >
                        {t("Detail")}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pager">
          <span className="admin-cell-muted">
            {t("{n} pesanan · halaman {a}/{b}", {
              n: meta.total,
              a: meta.page,
              b: meta.pages,
            })}
          </span>
          <div className="admin-pager-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              disabled={meta.page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              {t("Sebelumnya")}
            </button>
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              disabled={meta.page >= meta.pages || loading}
              onClick={() => setPage((prev) => Math.min(meta.pages, prev + 1))}
            >
              {t("Berikutnya")}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(detail)}
        title={
          detail?.nomor_antrean
            ? t("Pesanan #{n}", { n: detail.nomor_antrean })
            : t("Detail pesanan")
        }
        subtitle={detail?.tenant?.nama_tenant ? `${detail.tenant.nama_tenant} · ${detail.customer?.nama || t("Customer")}` : undefined}
        onClose={() => setDetail(null)}
        maxWidth={720}
        footer={
          <div className="admin-modal-actions">
            <button type="button" className="admin-ghost-btn btn-interactive" onClick={() => setDetail(null)}>
              {t("Tutup")}
            </button>
          </div>
        }
      >
        {detailLoading ? (
          <p className="admin-empty-text">{t("Memuat detail…")}</p>
        ) : !detail ? (
          <p className="admin-empty-text">{t("Detail tidak tersedia.")}</p>
        ) : (
          <div className="admin-detail-stack">
            <div className="admin-detail-head">
              <StatusBadge status={detail.status_pesanan} />
              <span className="admin-mono">{formatRupiah(detail.total_harga)}</span>
            </div>

            <div className="admin-info-grid">
              <div className="admin-info-item">
                <div className="admin-info-label">{t("Tenant")}</div>
                <div className="admin-info-value">{detail.tenant?.nama_tenant || "—"}</div>
              </div>
              <div className="admin-info-item">
                <div className="admin-info-label">{t("Customer")}</div>
                <div className="admin-info-value">{detail.customer?.nama || "—"}</div>
              </div>
              <div className="admin-info-item">
                <div className="admin-info-label">{t("Waktu pesan")}</div>
                <div className="admin-info-value">{formatDateTime(detail.waktu_pesan)}</div>
              </div>
              <div className="admin-info-item">
                <div className="admin-info-label">{t("Promo")}</div>
                <div className="admin-info-value">{detail.promo_code || t("Tidak ada")}</div>
              </div>
            </div>

            <div>
              <h3 className="admin-detail-section">{t("Item pesanan")}</h3>
              <ul className="admin-item-list">
                {(detail.items || []).map((item) => (
                  <li key={`${item.id_menu}-${item.nama_menu}`}>
                    <span className="admin-item-qty">{item.jumlah}×</span>
                    <div className="admin-mini-main">
                      <span className="admin-cell-strong">{item.nama_menu}</span>
                      {item.catatan ? <span className="admin-mini-muted">{item.catatan}</span> : null}
                    </div>
                    <span className="admin-cell-strong">{formatRupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              {detail.catatan ? (
                <p className="admin-detail-note">{t("Catatan: {text}", { text: detail.catatan })}</p>
              ) : null}
            </div>

            <div>
              <h3 className="admin-detail-section">{t("Pembayaran")}</h3>
              {detail.payment ? (
                <div className="admin-payment-box">
                  <div>
                    <StatusBadge status={detail.payment.status_verifikasi} />
                    <p className="admin-mini-muted">
                      {detail.payment.metode_pembayaran} · {detail.payment.kode_qris || "—"}
                    </p>
                    <p className="admin-mini-muted">
                      {t("Batas {time}", { time: formatDateTime(detail.payment.batas_waktu) })}
                      {detail.payment.waktu_bayar
                        ? ` · ${t("Dibayar {time}", { time: formatDateTime(detail.payment.waktu_bayar) })}`
                        : ""}
                    </p>
                  </div>
                  {canVerify ? (
                    <button
                      type="button"
                      className="admin-primary-btn btn-interactive"
                      onClick={handleVerifyPayment}
                      disabled={actionLoading === "verify"}
                    >
                      <CheckCircle2 size={14} strokeWidth={2.4} />
                      {actionLoading === "verify" ? t("Memproses…") : t("Verifikasi")}
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="admin-empty-text">{t("Pembayaran belum dibuat untuk pesanan ini.")}</p>
              )}
            </div>

            <div>
              <h3 className="admin-detail-section">{t("Riwayat status")}</h3>
              <ol className="admin-timeline">
                {(detail.status_history || []).map((row, index) => (
                  <li key={`${row.status}-${index}`}>
                    <span className="admin-timeline-dot" />
                    <div>
                      <div className="admin-cell-strong">{t(row.status)}</div>
                      <div className="admin-mini-muted">{formatDateTime(row.waktu)}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {notice ? (
              <div className="admin-alert is-info animate-slide-up" role="status">
                <CheckCircle2 size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{notice}</span>
              </div>
            ) : null}

            <div className="admin-action-block">
              <h3 className="admin-detail-section">{t("Ubah status")}</h3>
              <div className="admin-inline-form">
                <select
                  className="admin-select"
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value)}
                  disabled={["Selesai", "Dibatalkan"].includes(detail.status_pesanan)}
                >
                  {ORDER_STATUSES.filter((status) => status !== "Dibatalkan").map((status) => (
                    <option key={status} value={status}>
                      {t(status)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="admin-primary-btn btn-interactive"
                  onClick={handleStatusChange}
                  disabled={
                    actionLoading === "status" ||
                    statusDraft === detail.status_pesanan ||
                    ["Selesai", "Dibatalkan"].includes(detail.status_pesanan)
                  }
                >
                  {t("Simpan")}
                </button>
              </div>

              {canCancel ? (
                <>
                  <h3 className="admin-detail-section">{t("Batalkan pesanan")}</h3>
                  <div className="admin-inline-form">
                    <input
                      type="text"
                      className="admin-input"
                      placeholder={t("Alasan pembatalan (opsional)")}
                      value={cancelReason}
                      maxLength={300}
                      onChange={(event) => setCancelReason(event.target.value)}
                    />
                    <button
                      type="button"
                      className="admin-danger-btn btn-interactive"
                      onClick={handleCancel}
                      disabled={actionLoading === "cancel"}
                    >
                      <XCircle size={14} strokeWidth={2.4} />
                      {actionLoading === "cancel" ? t("Membatalkan…") : t("Batalkan")}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}
      </Modal>

      <div className="admin-footnote">
        <Store size={13} strokeWidth={2.2} />
        {t("Satu pesanan selalu milik satu tenant. Perubahan status memicu notifikasi ke customer.")}
      </div>
    </div>
  );
}
