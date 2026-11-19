import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Pencil, RefreshCw, Search, Store } from "lucide-react";
import { api } from "../services/api.js";
import Modal from "../components/Modal.jsx";
import { useI18n } from "../i18n.jsx";

const PER_PAGE = 10;

const emptyForm = {
  nama_tenant: "",
  booth: "",
  deskripsi: "",
  jam_buka: "07:00",
  jam_tutup: "21:00",
  status_buka: true,
  auto_schedule: false,
};

export default function TenantsPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState({ search: "", status_buka: "" });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [tenants, setTenants] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminTenants({ ...filters, page, per_page: PER_PAGE });
      setTenants(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err?.message || t("Gagal memuat tenant."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const openEdit = (tenant) => {
    setEditing(tenant);
    setForm({
      nama_tenant: tenant.nama_tenant || "",
      booth: tenant.booth || "",
      deskripsi: tenant.deskripsi || "",
      jam_buka: tenant.jam_buka || "07:00",
      jam_tutup: tenant.jam_tutup || "21:00",
      status_buka: Boolean(tenant.status_buka),
      auto_schedule: Boolean(tenant.auto_schedule),
    });
    setFormError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    if (String(form.nama_tenant || "").trim().length < 2) {
      setFormError(t("Nama tenant minimal 2 karakter."));
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await api.adminTenantUpdate(editing.id_tenant, {
        nama_tenant: form.nama_tenant.trim(),
        booth: form.booth.trim(),
        deskripsi: form.deskripsi.trim(),
        jam_buka: form.jam_buka,
        jam_tutup: form.jam_tutup,
        status_buka: form.status_buka,
        auto_schedule: form.auto_schedule,
      });
      setNotice(t('Tenant "{name}" diperbarui.', { name: form.nama_tenant.trim() }));
      setEditing(null);
      await loadTenants();
    } catch (err) {
      setFormError(err?.message || t("Gagal menyimpan tenant."));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleOpen = async (tenant) => {
    setTogglingId(String(tenant.id_tenant));
    setError("");
    setNotice("");
    try {
      await api.adminTenantUpdate(tenant.id_tenant, { status_buka: !tenant.status_buka });
      setNotice(
        t('Tenant "{name}" sekarang {state}.', {
          name: tenant.nama_tenant,
          state: t(!tenant.status_buka ? "dibuka" : "ditutup"),
        })
      );
      await loadTenants();
    } catch (err) {
      setError(err?.message || t("Gagal mengubah status tenant."));
    } finally {
      setTogglingId("");
    }
  };

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Data induk")}</div>
          <h1 className="admin-page-title">{t("Tenant kantin")}</h1>
          <p className="admin-page-desc">
            {t("Kelola profil tenant, jam operasional, dan buka/tutup kantin.")}
          </p>
        </div>
        <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadTenants}>
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
            placeholder={t("Cari nama tenant, booth, atau pemilik")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={filters.status_buka}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, status_buka: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Filter status buka")}
        >
          <option value="">{t("Semua status")}</option>
          <option value="1">{t("Buka")}</option>
          <option value="0">{t("Tertutup")}</option>
        </select>

        <button
          type="button"
          className="admin-ghost-btn btn-interactive"
          onClick={() => {
            setFilters({ search: "", status_buka: "" });
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
                <th>{t("Tenant")}</th>
                <th>{t("Pemilik")}</th>
                <th>{t("Jam operasional")}</th>
                <th className="is-right">{t("Menu")}</th>
                <th className="is-right">{t("Pesanan")}</th>
                <th>{t("Status")}</th>
                <th className="is-right">{t("Aksi")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && tenants.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">{t("Memuat tenant…")}</div>
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">{t("Belum ada tenant terdaftar.")}</div>
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => {
                  const ownerName = tenant.owner_name || tenant.user?.nama || "—";
                  const ownerEmail = tenant.owner_email || tenant.user?.email || "—";
                  const menuCount = tenant.menu_count ?? tenant.menus?.length ?? 0;
                  const orderCount = tenant.order_count ?? 0;
                  return (
                  <tr key={tenant.id_tenant} className="admin-table-row">
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-cell-strong">{tenant.nama_tenant}</span>
                        <span className="admin-cell-muted">{tenant.booth || t("Tanpa booth")}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-cell-stack">
                        <span className="admin-cell-strong">{ownerName}</span>
                        <span className="admin-cell-muted">{ownerEmail}</span>
                      </div>
                    </td>
                    <td className="admin-cell-muted">
                      {tenant.jam_buka} – {tenant.jam_tutup}
                      <span className="admin-cell-muted admin-mono-small">
                        {tenant.auto_schedule ? t(" · otomatis") : t(" · manual")}
                      </span>
                    </td>
                    <td className="is-right admin-cell-strong">{menuCount}</td>
                    <td className="is-right admin-cell-strong">{orderCount}</td>
                    <td>
                      <span
                        className={`admin-badge-status ${tenant.status_buka ? "tone-ready" : "tone-cancelled"}`}
                      >
                        {tenant.status_buka ? t("Buka") : t("Tertutup")}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-ghost-btn is-small btn-interactive"
                          onClick={() => handleToggleOpen(tenant)}
                          disabled={togglingId === String(tenant.id_tenant)}
                        >
                          {tenant.status_buka ? t("Tutup") : t("Buka")}
                        </button>
                        <button
                          type="button"
                          className="admin-primary-btn is-small btn-interactive"
                          onClick={() => openEdit(tenant)}
                        >
                          <Pencil size={12} strokeWidth={2.6} />
                          {t("Edit")}
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pager">
          <span className="admin-cell-muted">
            {t("{n} tenant · halaman {a}/{b}", {
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
        <Store size={13} strokeWidth={2.2} />
        {t("Menutup tenant langsung menghentikan penerimaan pesanan baru dari customer.")}
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing ? `${t("Edit tenant")} · ${editing.nama_tenant}` : t("Edit tenant")}
        subtitle={editing?.owner_name ? `${t("Pemilik")}: ${editing.owner_name}` : undefined}
        onClose={() => setEditing(null)}
        maxWidth={620}
        footer={
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-ghost-btn btn-interactive"
              onClick={() => setEditing(null)}
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
              {saving ? t("Menyimpan…") : t("Simpan perubahan")}
            </button>
          </div>
        }
      >
        <div className="admin-form-grid">
          <label className="admin-field">
            <span className="admin-label">{t("Nama tenant")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.nama_tenant}
              maxLength={100}
              onChange={(event) => setForm((prev) => ({ ...prev, nama_tenant: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Nomor booth")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.booth}
              maxLength={60}
              placeholder="A-12"
              onChange={(event) => setForm((prev) => ({ ...prev, booth: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Jam buka")}</span>
            <input
              className="admin-input"
              type="time"
              value={form.jam_buka}
              onChange={(event) => setForm((prev) => ({ ...prev, jam_buka: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Jam tutup")}</span>
            <input
              className="admin-input"
              type="time"
              value={form.jam_tutup}
              onChange={(event) => setForm((prev) => ({ ...prev, jam_tutup: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Deskripsi")}</span>
            <textarea
              className="admin-input admin-textarea"
              rows={3}
              maxLength={1000}
              value={form.deskripsi}
              onChange={(event) => setForm((prev) => ({ ...prev, deskripsi: event.target.value }))}
            />
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.status_buka}
              onChange={(event) => setForm((prev) => ({ ...prev, status_buka: event.target.checked }))}
            />
            <span>{t("Tenant sedang buka")}</span>
          </label>

          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.auto_schedule}
              onChange={(event) => setForm((prev) => ({ ...prev, auto_schedule: event.target.checked }))}
            />
            <span>{t("Ikuti jam operasional otomatis")}</span>
          </label>
        </div>

        {formError && (
          <div className="admin-alert is-error animate-slide-up" role="alert">
            <AlertCircle size={15} strokeWidth={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{formError}</span>
          </div>
        )}
      </Modal>
    </div>
  );
}
