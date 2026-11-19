const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").trim();
export const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, "") || "/api";

const TOKEN_KEY = "letsorder_admin_token";
const USER_KEY = "letsorder_admin_user";

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore storage restrictions
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage restrictions
  }
}

function buildUrl(endpoint) {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${path}`;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request(endpoint, options = {}) {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const token = auth ? getStoredToken() : "";

  let response;
  try {
    response = await fetch(buildUrl(endpoint), {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const networkError = new Error(
      "Tidak dapat terhubung ke server API. Pastikan backend berjalan di http://127.0.0.1:8000."
    );
    networkError.status = 0;
    throw networkError;
  }

  let payload = null;
  const rawText = await response.text();
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { message: rawText.slice(0, 300) };
    }
  }

  if (!response.ok) {
    const firstValidationError =
      payload?.errors && typeof payload.errors === "object"
        ? Object.values(payload.errors).flat().filter(Boolean)[0]
        : null;
    const error = new Error(
      firstValidationError || payload?.message || `Permintaan gagal (${response.status}).`
    );
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  checkHealth: () => request("/health", { auth: false }),

  // Important: do NOT send a "peran" field when logging in as admin —
  // the API only accepts Customer|Vendor in that field and rejects mismatches.
  login: (identifier, password) =>
    request("/auth/login", {
      method: "POST",
      auth: false,
      body: { login: identifier, password },
    }),

  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  updateProfile: (data) => request("/auth/profile", { method: "PATCH", body: data }),
  changePassword: (data) => request("/auth/password", { method: "PUT", body: data }),

  // Administrator
  adminStats: (params) => request(`/admin/stats/overview${buildQuery(params)}`),
  adminOrders: (params) => request(`/admin/orders${buildQuery(params)}`),
  adminOrder: (id) => request(`/admin/orders/${id}`),
  adminPayments: (params) => request(`/admin/payments${buildQuery(params)}`),
  adminUsers: (params) => request(`/admin/users${buildQuery(params)}`),
  adminUserUpdate: (id, data) => request(`/admin/users/${id}`, { method: "PATCH", body: data }),
  adminTenants: (params) => request(`/admin/tenants${buildQuery(params)}`),
  adminTenantUpdate: (id, data) => request(`/admin/tenants/${id}`, { method: "PATCH", body: data }),
  adminPromos: (params) => request(`/admin/promos${buildQuery(params)}`),
  adminPromoCreate: (data) => request("/admin/promos", { method: "POST", body: data }),
  adminPromoUpdate: (id, data) => request(`/admin/promos/${id}`, { method: "PATCH", body: data }),
  adminPromoDelete: (id) => request(`/admin/promos/${id}`, { method: "DELETE" }),
  adminBanners: () => request("/admin/banners"),
  adminBannerCreate: (data) => request("/admin/banners", { method: "POST", body: data }),
  adminBannerUpdate: (id, data) => request(`/admin/banners/${id}`, { method: "PATCH", body: data }),
  adminBannerDelete: (id) => request(`/admin/banners/${id}`, { method: "DELETE" }),

  // Aksi operasional (backend mengizinkan Administrator)
  updateOrderStatus: (id, status_pesanan) =>
    request(`/vendor/orders/${id}/status`, { method: "PATCH", body: { status_pesanan } }),
  cancelOrder: (id, alasan = "") =>
    request(`/orders/${id}/cancel`, { method: "POST", body: { alasan } }),
  verifyPaymentByOrder: (orderId, status_verifikasi = "Terverifikasi") =>
    request(`/orders/${orderId}/payment/verify`, { method: "POST", body: { status_verifikasi } }),
};
