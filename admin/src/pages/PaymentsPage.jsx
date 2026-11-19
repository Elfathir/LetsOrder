import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, Search, XCircle } from "lucide-react";
import { api } from "../services/api.js";
import { formatDateTime, formatRupiah } from "../utils/format.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { useI18n } from "../i18n.jsx";

const PER_PAGE = 10;
const VERIFICATION_STATUSES = ["Menunggu", "Terverifikasi", "Gagal", "Kedaluwarsa"];

export default function PaymentsPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState({ status: "All", q: "", from: "", to: "" });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [actionId, setActionId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminPayments({ ...filters, page, per_page: PER_PAGE });
      setPayments(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err?.message || t("Gagal memuat pembayaran."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleVerify = async (payment, status) => {
    setActionId(`${payment.id_pembayaran}-${status}`);
    setError("");
    setNotice("");
    try {
      await api.verifyPaymentByOrder(payment.id_pesanan, status);
      setNotice(
        status === "Terverifikasi"
          ? t("Pembayaran pesanan #{n} ditandai lunas.", { n: payment.nomor_antrean })
          : t("Pembayaran pesanan #{n} ditandai {status}.", {
              n: payment.nomor_antrean,
              status: t(status).toLowerCase(),
            })
      );
      await loadPayments();
    } catch (err) {
      setError(err?.message || t("Gagal memproses pembayaran."));
    } finally {
      setActionId("");
    }
  };

  const resetFilters = () => {
    setFilters({ status: "All", q: "", from: "", to: "" });
    setSearchInput("");
    setPage(1);
  };

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Rekonsiliasi")}</div>
          <h1 className="admin-page-title">{t("Pembayaran")}</h1>
          <p className="admin-page-desc">
            {t("Verifikasi pembayaran QRIS, pantau pembayaran kedaluwarsa, dan cocokkan total.")}
          </p>
        </div>
        <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadPayments}>
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
            placeholder={t("Cari kode QRIS, antrean, atau tenant")}
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
          aria-label={t("Filter status verifikasi")}
        >
          <option value="All">{t("Semua status")}</option>
          {VERIFICATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {t(status)}
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

      {notice && (
        <div className="admin-alert is-info animate-slide-up" role="status">
          <CheckCircle2 size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{notice}</span>
        </div>
      )}

      <div className="admin-table-card animate-slide-up">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("Kode")}</th>
                <th>{t("Pesanan")}</th>
                <th>{t("Tenant")}</th>
                <th>{t("Customer")}</th>
                <th>{t("Metode")}</th>
                <th className="is-right">{t("Total")}</th>
                <th>{t("Status")}</th>
                <th>{t("Batas waktu")}</th>
                <th className="is-right">{t("Aksi")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-table-empty">{t("Memuat pembayaran…")}</div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-table-empty">
                      {t("Belum ada pembayaran yang cocok dengan filter.")}
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id_pembayaran} className="admin-table-row">
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-mono">#{payment.id_pembayaran}</span>
                        <span className="admin-cell-muted admin-mono-small">
                          {payment.kode_qris || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="admin-cell-strong">#{payment.nomor_antrean}</td>
                    <td className="admin-cell-muted">{payment.tenant_name}</td>
                    <td className="admin-cell-muted">{payment.customer_name}</td>
                    <td className="admin-cell-muted">{payment.metode_pembayaran}</td>
                    <td className="is-right admin-cell-strong">{formatRupiah(payment.total_bayar)}</td>
                    <td>
                      <StatusBadge
                        status={payment.is_expired ? "Kedaluwarsa" : payment.status_verifikasi}
                      />
                    </td>
                    <td className="admin-cell-muted">{formatDateTime(payment.batas_waktu)}</td>
                    <td>
                      <div className="admin-row-actions">
                        {payment.status_verifikasi === "Menunggu" && !payment.is_expired ? (
                          <>
                            <button
                              type="button"
                              className="admin-primary-btn is-small btn-interactive"
                              onClick={() => handleVerify(payment, "Terverifikasi")}
                              disabled={actionId.startsWith(String(payment.id_pembayaran))}
                            >
                              <CheckCircle2 size={13} strokeWidth={2.6} />
                              {t("Verifikasi")}
                            </button>
                            <button
                              type="button"
                              className="admin-ghost-btn is-small btn-interactive"
                              onClick={() => handleVerify(payment, "Gagal")}
                              disabled={actionId.startsWith(String(payment.id_pembayaran))}
                            >
                              <XCircle size={13} strokeWidth={2.4} />
                              {t("Gagal")}
                            </button>
                          </>
                        ) : (
                          <span className="admin-cell-muted">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pager">
          <span className="admin-cell-muted">
            {t("{n} pembayaran · halaman {a}/{b}", {
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

      <div className="admin-footnote">
        <AlertCircle size={13} strokeWidth={2.2} />
        {t("Pembayaran berstatus Menunggu otomatis kedaluwarsa 15 menit setelah dibuat.")}
      </div>
    </div>
  );
}
