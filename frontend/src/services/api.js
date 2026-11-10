export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
  // Health
  checkHealth: () => request("/health"),

  // Auth
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
  me: () => request("/auth/me"),
  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  // Categories
  getCategories: () => request("/categories"),
  getCategory: (id) => request(`/categories/${id}`),

  // Tenants
  getTenants: (params) => request(`/tenants${buildQuery(params)}`),
  getTenant: (id, params) => request(`/tenants/${id}${buildQuery(params)}`),
  getTenantMenus: (id, params) =>
    request(`/tenants/${id}/menus${buildQuery(params)}`),

  // Menus
  getMenus: (params) => request(`/menus${buildQuery(params)}`),
  getMenu: (id) => request(`/menus/${id}`),

  // Customer Cart
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

  // Customer Orders & Tracking
  createOrder: (data) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getOrders: (params) => request(`/orders${buildQuery(params)}`),
  getOrder: (id) => request(`/orders/${id}`),
  getOrderStatus: (id) => request(`/orders/${id}/status`),
  getOrderStatusHistory: (id) => request(`/orders/${id}/status-history`),

  // Payment Simulation
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

  // Notifications
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

  // Vendor Portal
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

  // Administrator Portal
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

