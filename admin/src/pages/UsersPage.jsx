import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Pencil, RefreshCw, Search, Users } from "lucide-react";
import { api } from "../services/api.js";
import Modal from "../components/Modal.jsx";
import { getInitials } from "../utils/format.js";
import { useI18n } from "../i18n.jsx";

const PER_PAGE = 10;
const ROLES = ["Customer", "Vendor", "Administrator"];

const emptyForm = {
  nama: "",
  username: "",
  email: "",
  peran: "Customer",
  password: "",
};

function roleTone(peran) {
  if (peran === "Administrator") return "role-admin";
  if (peran === "Vendor") return "role-vendor";
  return "role-customer";
}

function roleLabel(peran, t) {
  if (peran === "Customer") return t("Customer");
  if (peran === "Vendor") return t("Vendor");
  if (peran === "Administrator") return t("Administrator");
  return peran;
}

export default function UsersPage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState({ peran: "", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminUsers({ ...filters, page, per_page: PER_PAGE });
      setUsers(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      setError(err?.message || t("Gagal memuat pengguna."));
    } finally {
      setLoading(false);
    }
  }, [filters, page, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      nama: user.nama || "",
      username: user.username || "",
      email: user.email || "",
      peran: user.peran || "Customer",
      password: "",
    });
    setFormError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    if (String(form.nama).trim().length < 2) {
      setFormError(t("Nama minimal 2 karakter."));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())) {
      setFormError(t("Format email tidak valid."));
      return;
    }
    if (form.password && form.password.length < 8) {
      setFormError(t("Password baru minimal 8 karakter."));
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const payload = {
        nama: form.nama.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        peran: form.peran,
      };
      if (form.password) payload.password = form.password;

      await api.adminUserUpdate(editing.id_user, payload);
      setNotice(t("Data {name} diperbarui.", { name: payload.nama }));
      setEditing(null);
      await loadUsers();
    } catch (err) {
      setFormError(err?.message || t("Gagal menyimpan pengguna."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="admin-page-head">
        <div>
          <div className="admin-eyebrow">{t("Data induk")}</div>
          <h1 className="admin-page-title">{t("Pengguna")}</h1>
          <p className="admin-page-desc">
            {t("Kelola akun Customer, Vendor, dan Administrator beserta perannya.")}
          </p>
        </div>
        <button type="button" className="admin-secondary-btn btn-interactive" onClick={loadUsers}>
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
            placeholder={t("Cari nama, username, atau email")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={filters.peran}
          onChange={(event) => {
            setFilters((prev) => ({ ...prev, peran: event.target.value }));
            setPage(1);
          }}
          aria-label={t("Filter peran")}
        >
          <option value="">{t("Semua peran")}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role, t)}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="admin-ghost-btn btn-interactive"
          onClick={() => {
            setFilters({ peran: "", search: "" });
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
                <th>{t("Pengguna")}</th>
                <th>{t("Username")}</th>
                <th>{t("Email")}</th>
                <th>{t("Peran")}</th>
                <th>{t("Tenant")}</th>
                <th className="is-right">{t("Pesanan")}</th>
                <th className="is-right">{t("Aksi")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">{t("Memuat pengguna…")}</div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">
                      {t("Tidak ada pengguna yang cocok dengan filter.")}
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const tenantNames = user.tenant_names || (user.tenants || []).map((row) => row.nama_tenant) || [];
                  const tenantCount = user.tenant_count ?? tenantNames.length;
                  const orderCount = user.order_count ?? 0;
                  return (
                  <tr key={user.id_user} className="admin-table-row">
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">{getInitials(user.nama || user.username)}</span>
                        <div className="admin-cell-stack">
                          <span className="admin-cell-strong">{user.nama}</span>
                          <span className="admin-cell-muted">ID #{user.id_user}</span>
                        </div>
                      </div>
                    </td>
                    <td className="admin-cell-muted admin-mono-small">{user.username}</td>
                    <td className="admin-cell-muted">{user.email}</td>
                    <td>
                      <span className={`admin-role-badge ${roleTone(user.peran)}`}>
                        {roleLabel(user.peran, t)}
                      </span>
                    </td>
                    <td className="admin-cell-muted">
                      {tenantCount > 0 ? tenantNames.join(", ") : "—"}
                    </td>
                    <td className="is-right admin-cell-strong">{orderCount}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-primary-btn is-small btn-interactive"
                          onClick={() => openEdit(user)}
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
            {t("{n} pengguna · halaman {a}/{b}", {
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
        <Users size={13} strokeWidth={2.2} />
        {t(
          "Akun baru tetap mendaftar sendiri lewat aplikasi utama; admin hanya mengelola data yang ada."
        )}
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing ? `${t("Edit")} · ${editing.nama}` : t("Edit pengguna")}
        subtitle={editing ? `ID #${editing.id_user} · ${roleLabel(editing.peran, t)}` : undefined}
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
            <span className="admin-label">{t("Nama lengkap")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.nama}
              maxLength={100}
              onChange={(event) => setForm((prev) => ({ ...prev, nama: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Username")}</span>
            <input
              className="admin-input"
              type="text"
              value={form.username}
              maxLength={50}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            />
          </label>

          <label className="admin-field admin-field-full">
            <span className="admin-label">{t("Email")}</span>
            <input
              className="admin-input"
              type="email"
              value={form.email}
              maxLength={100}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Peran")}</span>
            <select
              className="admin-select"
              value={form.peran}
              onChange={(event) => setForm((prev) => ({ ...prev, peran: event.target.value }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role, t)}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-field">
            <span className="admin-label">{t("Password baru (opsional)")}</span>
            <input
              className="admin-input"
              type="password"
              value={form.password}
              placeholder={t("Biarkan kosong jika tidak diubah")}
              autoComplete="new-password"
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
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
