const DEFAULT_API_BASE_URL =
  import.meta.env.DEV ||
  (typeof window !== "undefined" &&
    !["localhost", "127.0.0.1"].includes(window.location.hostname))
    ? "/api"
    : "http://127.0.0.1:8000/api";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

const TOKEN_STORAGE_KEY = "letsorder_auth_token";
const USER_STORAGE_KEY = "letsorder_auth_user";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(token, user) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

export function clearStoredSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke server backend. Pastikan API server sudah dijalankan (cd backend && node server.mjs) pada port 8000."
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const firstValidationError =
      payload?.errors &&
      Object.values(payload.errors)[0] &&
      Array.isArray(Object.values(payload.errors)[0])
        ? Object.values(payload.errors)[0][0]
        : null;

    const message =
      firstValidationError ||
      payload?.message ||
      `Permintaan gagal (HTTP ${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export const api = {
  checkHealth: () => request("/health"),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  googleLogin: (data) =>
    request("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  exchangeGoogleCode: (code) =>
    request("/auth/google/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  getGoogleConfig: () => request("/auth/google/config"),
  getGoogleRedirectUrl: (peran = "Customer", clientId = "") =>
    `${API_BASE_URL}/auth/google/redirect${buildQuery({
      peran,
      origin: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
      client_id: clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
    })}`,
  forgotPassword: (data) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data) =>
    request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePassword: (data) =>
    request("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateProfile: (data) =>
    request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  me: () => request("/auth/me"),
  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  getCategories: () => request("/categories"),
  getCategory: (id) => request(`/categories/${id}`),

  getTenants: (params) => request(`/tenants${buildQuery(params)}`),
  getTenant: (id, params) => request(`/tenants/${id}${buildQuery(params)}`),
  getTenantMenus: (id, params) =>
    request(`/tenants/${id}/menus${buildQuery(params)}`),

  getMenus: (params) => request(`/menus${buildQuery(params)}`),
  getMenu: (id) => request(`/menus/${id}`),

  getCart: () => request("/cart"),
  clearCart: () =>
    request("/cart", {
      method: "DELETE",
    }),
  addCartItem: (data) =>
    request("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCartItem: (id, data) =>
    request(`/cart/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCartItem: (id) =>
    request(`/cart/items/${id}`, {
      method: "DELETE",
    }),

  createOrder: (data) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getOrders: (params) => request(`/orders${buildQuery(params)}`),
  getOrder: (id) => request(`/orders/${id}`),
  getOrderStatus: (id) => request(`/orders/${id}/status`),
  getOrderStatusHistory: (id) => request(`/orders/${id}/status-history`),
  getOrderMessages: (orderId) => request(`/orders/${orderId}/messages`),
  sendOrderMessage: (orderId, data) =>
    request(`/orders/${orderId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  cancelOrder: (id, alasan = "") =>
    request(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ alasan }),
    }),
  getReviews: (params) => request(`/reviews${buildQuery(params)}`),
  submitOrderReview: (orderId, data) =>
    request(`/orders/${orderId}/reviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPromos: (params) => request(`/promos${buildQuery(params)}`),

  createPayment: (orderId, data) =>
    request(`/orders/${orderId}/payment`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPayment: (orderId) => request(`/orders/${orderId}/payment`),
  verifyPayment: (paymentId, status_verifikasi = "Terverifikasi") =>
    request(`/payments/${paymentId}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ status_verifikasi }),
    }),
  verifyPaymentByOrder: (orderId, status_verifikasi = "Terverifikasi") =>
    request(`/orders/${orderId}/payment/verify`, {
      method: "POST",
      body: JSON.stringify({ status_verifikasi }),
    }),

  getNotifications: (params) => request(`/notifications${buildQuery(params)}`),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, {
      method: "PATCH",
      body: JSON.stringify({ status_baca: true }),
    }),
  markAllNotificationsRead: () =>
    request("/notifications/read-all", {
      method: "PATCH",
    }),

  getVendorTenant: () => request("/vendor/tenant"),
  updateVendorTenant: (data) =>
    request("/vendor/tenant", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getVendorMenus: (params) => request(`/vendor/menus${buildQuery(params)}`),
  createVendorMenu: (data) =>
    request("/vendor/menus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateVendorMenu: (id, data) =>
    request(`/vendor/menus/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateMenuAvailability: (id, status_tersedia) =>
    request(`/vendor/menus/${id}/availability`, {
      method: "PATCH",
      body: JSON.stringify({ status_tersedia }),
    }),
  deleteVendorMenu: (id) =>
    request(`/vendor/menus/${id}`, {
      method: "DELETE",
    }),
  getVendorOrders: (params) => request(`/vendor/orders${buildQuery(params)}`),
  updateOrderStatus: (id, status_pesanan) =>
    request(`/vendor/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status_pesanan }),
    }),
  getVendorPromos: () => request("/vendor/promos"),
  createVendorPromo: (data) =>
    request("/vendor/promos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateVendorPromo: (id, data) =>
    request(`/vendor/promos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteVendorPromo: (id) =>
    request(`/vendor/promos/${id}`, {
      method: "DELETE",
    }),

  getAdminUsers: (params) => request(`/admin/users${buildQuery(params)}`),
  updateAdminUser: (id, data) =>
    request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getAdminTenants: (params) => request(`/admin/tenants${buildQuery(params)}`),
  createAdminTenant: (data) =>
    request("/admin/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateAdminTenant: (id, data) =>
    request(`/admin/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteAdminTenant: (id) =>
    request(`/admin/tenants/${id}`, {
      method: "DELETE",
    }),
};
