import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { api } from "../services/api.js";
import { formatRupiah } from "../utils/format.js";
import Modal from "../components/Modal.jsx";
import { useI18n } from "../i18n.jsx";

const PER_PAGE = 10;

const emptyForm = {
  kode_promo: "",
  judul: "",
  tipe: "fixed",
  diskon: "",
  minimal_belanja: "",
  batas_per_user: "1",
  id_tenant: "",
  aktif: true,
};

function discountLabel(promo) {
  if (promo.tipe === "percentage") return `${promo.diskon}%`;
  return formatRupiah(promo.diskon);
}

export default function CouponsPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState({ status: "All", q: "" });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [promos, setPromos] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggleId, setToggleId] = useState("");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.q === searchInput ? prev : { ...prev, q: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadPromos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminPromos({ ...filters, page, per_page: PER_PAGE });
      setPromos(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err?.message || t("Gagal memuat kupon."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  useEffect(() => {
    api
      .adminTenants({ per_page: 100 })
      .then((response) => setTenants(response?.data || []))
      .catch(() => setTenants([]));
  }, []);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setCreating(false);
    setForm({
      kode_promo: promo.kode_promo || "",
      judul: promo.judul || "",
      tipe: promo.tipe === "percentage" ? "percentage" : "fixed",
      diskon: String(promo.diskon ?? ""),
      minimal_belanja: String(promo.minimal_belanja ?? 0),
      batas_per_user: String(promo.batas_per_user ?? 1),
      id_tenant: promo.id_tenant ? String(promo.id_tenant) : "",
      aktif: promo.aktif !== false,
    });
    setFormError("");
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setFormError("");
  };

  const handleSave = async () => {
    const kode = form.kode_promo.trim().toUpperCase();
    if (kode.length < 3) {
      setFormError(t("Kode kupon minimal 3 karakter (huruf/angka)."));
      return;
    }
    if (form.judul.trim().length < 3) {
      setFormError(t("Judul kupon minimal 3 karakter."));
      return;
    }
    const diskon = Number(form.diskon);
    if (!Number.isFinite(diskon) || diskon <= 0) {
      setFormError(t("Nominal diskon wajib lebih dari 0."));
      return;
    }
    if (form.tipe === "percentage" && diskon > 90) {
      setFormError(t("Diskon persentase maksimal 90%."));
      return;
    }

    const payload = {
      kode_promo: kode,
      judul: form.judul.trim(),
      tipe: form.tipe,
      diskon,
      minimal_belanja: Number(form.minimal_belanja || 0),
      batas_per_user: Number(form.batas_per_user || 1),
      id_tenant: form.id_tenant ? Number(form.id_tenant) : null,
      aktif: form.aktif,
    };

    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await api.adminPromoUpdate(editing.id_promo, payload);
        setNotice(t('Kupon "{code}" diperbarui.', { code: payload.kode_promo }));
      } else {
        await api.adminPromoCreate(payload);
        setNotice(
          t('Kupon "{code}" dibuat dan langsung bisa dipakai customer.', {
            code: payload.kode_promo,
          })
        );
      }
      closeForm();
      await loadPromos();
    } catch (err) {
      setFormError(err?.message || t("Gagal menyimpan kupon."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo) => {
    setToggleId(String(promo.id_promo));
    setError("");
    setNotice("");
    try {
      await api.adminPromoUpdate(promo.id_promo, { aktif: promo.aktif === false });
      setNotice(
        t('Kupon "{code}" {state}.', {
          code: promo.kode_promo,
          state: t(promo.aktif === false ? "diaktifkan" : "dinonaktifkan"),
        })
      );
      await loadPromos();
    } catch (err) {
      setError(err?.message || t("Gagal mengubah status kupon."));
    } finally {
      setToggleId("");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await api.adminPromoDelete(deleting.id_promo);
      setNotice(t('Kupon "{code}" dihapus.', { code: deleting.kode_promo }));
      setDeleting(null);
      await loadPromos();
    } catch (err) {
      setError(err?.message || t("Gagal menghapus kupon."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Promosi")}</div>
          <h1 className="admin-page-title">{t("Kupon & promo")}</h1>
          <p className="admin-page-desc">
            {t(
              "Buat kode kupon untuk semua tenant atau tenant tertentu, atur nominal potongan, minimal belanja, dan jatah pemakaian per akun."
            )}
          </p>
        </div>
        <div className="admin-head-actions">
          <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadPromos}>
            <RefreshCw size={14} strokeWidth={2.4} className={loading ? "admin-spinner" : undefined} />
            {t("Muat ulang")}
          </button>
          <button type="button" className="admin-primary-btn btn-interactive" onClick={openCreate}>
            <Plus size={14} strokeWidth={2.6} />
            {t("Buat kupon")}
          </button>
        </div>
      </div>

      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={15} strokeWidth={2.2} />
          <input
            type="text"
            className="admin-search-input"
            placeholder={t("Cari kode, judul, atau tenant")}
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
          aria-label={t("Filter status kupon")}
        >
          <option value="All">{t("Semua status")}</option>
          <option value="aktif">{t("Aktif")}</option>
          <option value="nonaktif">{t("Nonaktif")}</option>
        </select>

        <button
          type="button"
          className="admin-ghost-btn btn-interactive"
          onClick={() => {
            setFilters({ status: "All", q: "" });
            setSearchInput("");
            setPage(1);
          }}
        >
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
                <th>{t("Kupon")}</th>
                <th>{t("Berlaku untuk")}</th>
                <th className="is-right">{t("Diskon")}</th>
                <th className="is-right">{t("Min. belanja")}</th>
                <th className="is-right">{t("Kuota / dipakai")}</th>
                <th>{t("Status")}</th>
                <th className="is-right">{t("Aksi")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && promos.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">{t("Memuat kupon…")}</div>
                  </td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">
                      {t("Belum ada kupon. Klik “Buat kupon” untuk menambahkan.")}
                    </div>
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id_promo} className="admin-table-row">
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-mono">{promo.kode_promo}</span>
                        <span className="admin-cell-muted">{promo.judul}</span>
                      </div>
                    </td>
                    <td className="admin-cell-muted">{promo.tenant_name}</td>
                    <td className="is-right admin-cell-strong">{discountLabel(promo)}</td>
                    <td className="is-right admin-cell-muted">
                      {formatRupiah(promo.minimal_belanja || 0)}
                    </td>
                    <td className="is-right admin-cell-muted">
                      {promo.batas_per_user > 0 ? `${promo.batas_per_user}x` : "∞"}
                      <span className="admin-cell-muted">
                        {" "}
                        · {t("{n} dipakai", { n: promo.usage_count || 0 })}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge-status ${
                          promo.aktif === false ? "tone-cancelled" : "tone-ready"
                        }`}
                      >
                        {promo.aktif === false ? t("Nonaktif") : t("Aktif")}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-ghost-btn is-small btn-interactive"
                          onClick={() => handleToggle(promo)}
                          disabled={toggleId === String(promo.id_promo)}
                        >
                          {promo.aktif === false ? t("Aktifkan") : t("Nonaktif")}
                        </button>
                        <button
                          type="button"
                          className="admin-primary-btn is-small btn-interactive"
                          onClick={() => openEdit(promo)}
                        >
                          <Pencil size={12} strokeWidth={2.6} />
                          {t("Edit")}
                        </button>
                        <button
                          type="button"
                          className="admin-danger-btn is-small btn-interactive"
                          onClick={() => setDeleting(promo)}
                          aria-label={`${t("Hapus")} ${promo.kode_promo}`}
                        >
                          <Trash2 size={12} strokeWidth={2.6} />
                        </button>
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
            {t("{n} kupon · halaman {a}/{b}", {
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
        <TicketPercent size={13} strokeWidth={2.2} />
        {t("Kupon langsung muncul di halaman promo customer dan bisa dipakai saat checkout.")}
      </div>

      <Modal
        open={creating || Boolean(editing)}
        title={editing ? `${t("Edit")} · ${editing.kode_promo}` : t("Buat kupon baru")}
        subtitle={
          editing
            ? [
                t("{n} kali dipakai", { n: editing.usage_count || 0 }),
                editing.id_tenant ? null : t(" · semua tenant"),
              ]
                .filter(Boolean)
                .join("")
            : t("Kupon bisa dipakai customer selama masih aktif.")
        }
        onClose={closeForm}
        maxWidth={620}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              onClick={closeForm}
              disabled={saving}
            >
              {t("Batal")}
            </button>
            <button
              type="button"
              className="admin-primary-btn btn-interactive"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t("Menyimpan…") : editing ? t("Simpan perubahan") : t("Buat kupon")}
            </button>
          </div>
        }
      >
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">{t("Kode kupon")}</span>
            <input
              className="admin-input admin-mono-input"
              type="text"
              value={form.kode_promo}
              maxLength={24}
              placeholder={t("Contoh: KANTIN10")}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, kode_promo: event.target.value.toUpperCase() }))
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Berlaku untuk")}</span>
            <select
              className="admin-select"
              value={form.id_tenant}
              onChange={(event) => setForm((prev) => ({ ...prev, id_tenant: event.target.value }))}
            >
              <option value="">{t("Semua tenant")}</option>
              {tenants.map((tenant) => (
                <option key={tenant.id_tenant} value={tenant.id_tenant}>
                  {tenant.nama_tenant}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Judul kupon")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.judul}
              maxLength={100}
              placeholder={t("Contoh: Diskon spesial jam makan siang")}
              onChange={(event) => setForm((prev) => ({ ...prev, judul: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Tipe diskon")}</span>
            <select
              className="admin-select"
              value={form.tipe}
              onChange={(event) => setForm((prev) => ({ ...prev, tipe: event.target.value }))}
            >
              <option value="fixed">{t("Nominal (Rp)")}</option>
              <option value="percentage">{t("Persentase (%)")}</option>
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-label">
              {form.tipe === "percentage" ? t("Persentase diskon") : t("Potongan (Rp)")}
            </span>
            <input
              className="admin-input"
              type="number"
              min="1"
              value={form.diskon}
              placeholder={form.tipe === "percentage" ? "10" : "5000"}
              onChange={(event) => setForm((prev) => ({ ...prev, diskon: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Minimal belanja (Rp)")}</span>
            <input
              className="admin-input"
              type="number"
              min="0"
              value={form.minimal_belanja}
              placeholder="0"
              onChange={(event) =>
                setForm((prev) => ({ ...prev, minimal_belanja: event.target.value }))
              }
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Jatah voucher per akun")}</span>
            <input
              className="admin-input"
              type="number"
              min="0"
              max="1000"
              value={form.batas_per_user}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, batas_per_user: event.target.value }))
              }
            />
          </label>

          <label className="admin-check admin-field-full">
            <input
              type="checkbox"
              checked={form.aktif}
              onChange={(event) => setForm((prev) => ({ ...prev, aktif: event.target.checked }))}
            />
            <span>{t("Kupon aktif dan bisa diklaim customer")}</span>
          </label>
        </div>

        {formError && (
          <div className="admin-alert is-error animate-slide-up" role="alert">
            <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{formError}</span>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deleting)}
        title={t("Hapus kupon?")}
        subtitle={deleting ? `${deleting.kode_promo} · ${deleting.judul}` : undefined}
        onClose={() => setDeleting(null)}
        maxWidth={440}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              onClick={() => setDeleting(null)}
              disabled={saving}
            >
              {t("Batal")}
            </button>
            <button
              type="button"
              className="admin-danger-btn btn-interactive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? t("Menghapus…") : t("Hapus kupon")}
            </button>
          </div>
        }
      >
        <p className="admin-empty-text" style={{ padding: 0 }}>
          {t(
            "Kupon yang dihapus tidak bisa diklaim lagi oleh customer. Pemakaian sebelumnya tetap tercatat di riwayat pesanan."
          )}
        </p>
      </Modal>
    </div>
  );
}
