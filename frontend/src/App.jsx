import { useCallback, useEffect, useMemo, useState } from "react";
import {
  api,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from "./services/api";

const FALLBACK_CATEGORIES = [
  { id_kategori: 1, nama_kategori: "Makanan", icon: "categories/bowl.png" },
  { id_kategori: 2, nama_kategori: "Minuman", icon: "categories/cup.png" },
  { id_kategori: 3, nama_kategori: "Camilan", icon: "categories/snack.png" },
];

const FALLBACK_TENANTS = [
  {
    id_tenant: 1,
    id_user: 2,
    nama_tenant: "Kantin Sejahtera",
    deskripsi:
      "Menyediakan hidangan nasi, ayam penyet, mie ayam, dan minuman segar favorit mahasiswa UPNVJ.",
    logo: "tenant/kantin-sejahtera.png",
    status_buka: true,
  },
  {
    id_tenant: 2,
    id_user: 3,
    nama_tenant: "Warung Nusantara",
    deskripsi:
      "Aneka soto, nasi goreng spesial, camilan hangat, serta kopi dan teh dingin.",
    logo: "tenant/warung-nusantara.png",
    status_buka: true,
  },
];

const FALLBACK_MENUS = [
  {
    id_menu: 1,
    id_tenant: 1,
    id_kategori: 1,
    nama_menu: "Nasi Ayam Geprek Sambal Bawang",
    deskripsi:
      "Ayam crispy geprek dengan sambal bawang segar, nasi hangat, dan lalapan.",
    gambar: "menu/ayam-geprek.png",
    harga: 18000,
    estimasi_menit: 8,
    status_tersedia: true,
    tenant: FALLBACK_TENANTS[0],
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id_menu: 2,
    id_tenant: 1,
    id_kategori: 1,
    nama_menu: "Mie Ayam Bakso Spesial",
    deskripsi:
      "Mie ayam kenyal dengan topping ayam manis gurih dan dua bakso sapi.",
    gambar: "menu/mie-ayam-bakso.png",
    harga: 16000,
    estimasi_menit: 7,
    status_tersedia: true,
    tenant: FALLBACK_TENANTS[0],
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id_menu: 3,
    id_tenant: 1,
    id_kategori: 2,
    nama_menu: "Es Teh Manis",
    deskripsi: "Minuman teh melati dingin yang menyegarkan.",
    gambar: "menu/es-teh.png",
    harga: 5000,
    estimasi_menit: 2,
    status_tersedia: true,
    tenant: FALLBACK_TENANTS[0],
    category: FALLBACK_CATEGORIES[1],
  },
  {
    id_menu: 4,
    id_tenant: 2,
    id_kategori: 1,
    nama_menu: "Nasi Goreng Kampung Telur Dadar",
    deskripsi:
      "Nasi goreng bumbu rempah tradisional disajikan dengan telur dadar dan kerupuk.",
    gambar: "menu/nasi-goreng.png",
    harga: 17000,
    estimasi_menit: 9,
    status_tersedia: true,
    tenant: FALLBACK_TENANTS[1],
    category: FALLBACK_CATEGORIES[0],
  },
  {
    id_menu: 5,
    id_tenant: 2,
    id_kategori: 3,
    nama_menu: "Pisang Goreng Keju Cokelat",
    deskripsi:
      "Pisang kepok goreng hangat dengan parutan keju dan susu kental manis cokelat.",
    gambar: "menu/pisang-keju.png",
    harga: 12000,
    estimasi_menit: 5,
    status_tersedia: true,
    tenant: FALLBACK_TENANTS[1],
    category: FALLBACK_CATEGORIES[2],
  },
];

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export default function App() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [user, setUser] = useState(() => getStoredUser());
  const [activeTab, setActiveTab] = useState("catalog");
  const [bannerMessage, setBannerMessage] = useState(null);

  // Catalog State
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [tenants, setTenants] = useState(FALLBACK_TENANTS);
  const [menus, setMenus] = useState(FALLBACK_MENUS);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuDetail, setSelectedMenuDetail] = useState(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailNotes, setDetailNotes] = useState("");

  // Auth Form State
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    login: "",
    username: "",
    nama: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Customer Cart, Orders, Payment, Notifications State
  const [cart, setCart] = useState({
    id_keranjang: null,
    items: [],
    total_harga: 0,
    tenant: null,
  });
  const [orderNotes, setOrderNotes] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [activePayment, setActivePayment] = useState(null);
  const [orderHistoryList, setOrderHistoryList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Vendor State
  const [vendorTenant, setVendorTenant] = useState(null);
  const [vendorMenus, setVendorMenus] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [vendorMenuForm, setVendorMenuForm] = useState({
    id_menu: null,
    id_kategori: 1,
    nama_menu: "",
    deskripsi: "",
    gambar: "menu/default.png",
    harga: "",
    estimasi_menit: 5,
    status_tersedia: true,
  });

  // Administrator State
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTenants, setAdminTenants] = useState([]);
  const [adminNewTenant, setAdminNewTenant] = useState({
    id_user: "",
    nama_tenant: "",
    deskripsi: "",
    logo: "tenant/default.png",
    status_buka: true,
  });

  const notify = useCallback((type, text) => {
    setBannerMessage({ type, text });
  }, []);

  const loadCatalog = useCallback(async () => {
    try {
      const [catRes, tenantRes, menuRes] = await Promise.all([
        api.getCategories(),
        api.getTenants(),
        api.getMenus({
          id_tenant: selectedTenantId || undefined,
          id_kategori: selectedCategoryId || undefined,
          search: searchQuery || undefined,
        }),
      ]);

      setApiStatus("connected");
      if (Array.isArray(catRes?.data) && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
      if (Array.isArray(tenantRes?.data)) {
        setTenants(tenantRes.data);
      }
      if (Array.isArray(menuRes?.data)) {
        setMenus(menuRes.data);
      }
    } catch {
      setApiStatus("unavailable");
    }
  }, [selectedTenantId, selectedCategoryId, searchQuery]);

  const loadCustomerData = useCallback(async () => {
    if (!user || user.peran !== "Customer") return;
    try {
      const [cartRes, ordersRes, notifRes] = await Promise.all([
        api.getCart(),
        api.getOrders(),
        api.getNotifications(),
      ]);
      if (cartRes?.data) setCart(cartRes.data);
      if (Array.isArray(ordersRes?.data)) setOrders(ordersRes.data);
      if (Array.isArray(notifRes?.data)) setNotifications(notifRes.data);
    } catch {
      // Ignore when offline
    }
  }, [user]);

  const loadVendorData = useCallback(async () => {
    if (!user || user.peran !== "Vendor") return;
    try {
      const [tenantRes, menusRes, ordersRes, notifRes] = await Promise.all([
        api.getVendorTenant(),
        api.getVendorMenus(),
        api.getVendorOrders(),
        api.getNotifications(),
      ]);
      if (tenantRes?.data) setVendorTenant(tenantRes.data);
      if (Array.isArray(menusRes?.data)) setVendorMenus(menusRes.data);
      if (Array.isArray(ordersRes?.data)) setVendorOrders(ordersRes.data);
      if (Array.isArray(notifRes?.data)) setNotifications(notifRes.data);
    } catch (err) {
      notify("error", err.message);
    }
  }, [user, notify]);

  const loadAdminData = useCallback(async () => {
    if (!user || user.peran !== "Administrator") return;
    try {
      const [usersRes, tenantsRes] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminTenants(),
      ]);
      if (Array.isArray(usersRes?.data)) setAdminUsers(usersRes.data);
      if (Array.isArray(tenantsRes?.data)) setAdminTenants(tenantsRes.data);
    } catch (err) {
      notify("error", err.message);
    }
  }, [user, notify]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    api
      .me()
      .then((res) => {
        if (res?.data) {
          setUser(res.data);
          setStoredSession(token, res.data);
        }
      })
      .catch(() => {
        clearStoredSession();
        setUser(null);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.peran === "Customer") {
      loadCustomerData();
    } else if (user.peran === "Vendor") {
      loadVendorData();
      setActiveTab("vendor");
    } else if (user.peran === "Administrator") {
      loadAdminData();
      setActiveTab("admin");
    }
  }, [user, loadCustomerData, loadVendorData, loadAdminData]);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      if (
        selectedTenantId &&
        Number(menu.id_tenant) !== Number(selectedTenantId)
      ) {
        return false;
      }
      if (
        selectedCategoryId &&
        Number(menu.id_kategori) !== Number(selectedCategoryId)
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = menu.nama_menu?.toLowerCase().includes(q);
        const matchDesc = menu.deskripsi?.toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [menus, selectedTenantId, selectedCategoryId, searchQuery]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setBannerMessage(null);
    try {
      if (authMode === "login") {
        const res = await api.login({
          login: authForm.login,
          password: authForm.password,
        });
        const token = res?.data?.access_token || res?.data?.token;
        const loggedUser = res?.data?.user;
        setStoredSession(token, loggedUser);
        setUser(loggedUser);
        notify("success", `Selamat datang, ${loggedUser.nama}!`);
        if (loggedUser.peran === "Vendor") setActiveTab("vendor");
        else if (loggedUser.peran === "Administrator") setActiveTab("admin");
        else setActiveTab("catalog");
      } else {
        await api.register({
          username: authForm.username,
          nama: authForm.nama,
          email: authForm.email,
          password: authForm.password,
          password_confirmation:
            authForm.password_confirmation || authForm.password,
        });
        notify("success", "Registrasi berhasil! Silakan login.");
        setAuthMode("login");
        setAuthForm((prev) => ({ ...prev, login: prev.username }));
      }
    } catch (err) {
      notify("error", err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Ignore network error on logout
    }
    clearStoredSession();
    setUser(null);
    setCart({ id_keranjang: null, items: [], total_harga: 0, tenant: null });
    setOrders([]);
    setNotifications([]);
    setActiveTab("catalog");
    notify("success", "Anda telah keluar dari sesi.");
  }

  async function handleAddToCart(menu, jumlah = 1, catatan = "") {
    if (!user) {
      setActiveTab("auth");
      notify(
        "error",
        "Silakan login sebagai Customer terlebih dahulu untuk memesan."
      );
      return;
    }
    if (user.peran !== "Customer") {
      notify("error", "Fitur keranjang khusus untuk akun Customer.");
      return;
    }

    try {
      const res = await api.addCartItem({
        id_menu: menu.id_menu,
        jumlah: Number(jumlah),
        catatan,
      });
      if (res?.data) setCart(res.data);
      setSelectedMenuDetail(null);
      setDetailQuantity(1);
      setDetailNotes("");
      notify("success", `${menu.nama_menu} ditambahkan ke keranjang.`);
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleUpdateCartItem(item, newQty, newNotes) {
    try {
      if (newQty <= 0) {
        await api.deleteCartItem(item.id_item_keranjang);
      } else {
        await api.updateCartItem(item.id_item_keranjang, {
          jumlah: newQty,
          catatan: newNotes ?? item.catatan ?? "",
        });
      }
      await loadCustomerData();
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleClearCart() {
    try {
      await api.clearCart();
      await loadCustomerData();
      notify("success", "Keranjang berhasil dikosongkan.");
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    try {
      const res = await api.createOrder({ catatan: orderNotes });
      setOrderNotes("");
      await loadCustomerData();
      if (res?.data) {
        await handleOpenOrderDetail(res.data);
        setActiveTab("orders");
      }
      notify(
        "success",
        `Pesanan berhasil dibuat dengan Nomor Antrean ${res?.data?.nomor_antrean}!`
      );
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleOpenOrderDetail(order) {
    try {
      const [detailRes, historyRes] = await Promise.all([
        api.getOrder(order.id_pesanan),
        api.getOrderStatusHistory(order.id_pesanan),
      ]);
      const fullOrder = detailRes?.data || order;
      setSelectedOrder(fullOrder);
      setActivePayment(fullOrder.payment || null);
      setOrderHistoryList(historyRes?.data || fullOrder.status_histories || []);
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleCreatePayment(orderId) {
    try {
      const res = await api.createPayment(orderId, {
        metode_pembayaran: paymentMethod,
      });
      setActivePayment(res?.data);
      await loadCustomerData();
      notify(
        "success",
        `Kode pembayaran simulasi (${paymentMethod}) berhasil dibuat.`
      );
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleSimulateVerifyPayment(payment) {
    try {
      const res = await api.verifyPayment(
        payment.id_pembayaran,
        "Terverifikasi"
      );
      setActivePayment(res?.data);
      if (selectedOrder) {
        await handleOpenOrderDetail(selectedOrder);
      }
      await loadCustomerData();
      notify(
        "success",
        "Pembayaran simulasi berhasil diverifikasi! Status pesanan kini Sedang Diproses."
      );
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleMarkNotificationRead(id) {
    try {
      await api.markNotificationRead(id);
      const res = await api.getNotifications();
      if (Array.isArray(res?.data)) setNotifications(res.data);
    } catch (err) {
      notify("error", err.message);
    }
  }

  // Vendor Handlers
  async function handleToggleTenantOpen() {
    if (!vendorTenant) return;
    try {
      const res = await api.updateVendorTenant({
        status_buka: !vendorTenant.status_buka,
      });
      setVendorTenant(res?.data);
      await loadCatalog();
      notify("success", "Status operasional tenant berhasil diperbarui.");
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleSaveVendorMenu(e) {
    e.preventDefault();
    try {
      const payload = {
        id_kategori: Number(vendorMenuForm.id_kategori),
        nama_menu: vendorMenuForm.nama_menu,
        deskripsi: vendorMenuForm.deskripsi,
        gambar: vendorMenuForm.gambar || "menu/default.png",
        harga: Number(vendorMenuForm.harga),
        estimasi_menit: Number(vendorMenuForm.estimasi_menit),
        status_tersedia: Boolean(vendorMenuForm.status_tersedia),
      };

      if (vendorMenuForm.id_menu) {
        await api.updateVendorMenu(vendorMenuForm.id_menu, payload);
        notify("success", "Menu berhasil diperbarui.");
      } else {
        await api.createVendorMenu(payload);
        notify("success", "Menu baru berhasil ditambahkan.");
      }

      setVendorMenuForm({
        id_menu: null,
        id_kategori: categories[0]?.id_kategori || 1,
        nama_menu: "",
        deskripsi: "",
        gambar: "menu/default.png",
        harga: "",
        estimasi_menit: 5,
        status_tersedia: true,
      });
      await loadVendorData();
      await loadCatalog();
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleToggleMenuAvailability(menu) {
    try {
      await api.updateMenuAvailability(menu.id_menu, !menu.status_tersedia);
      await loadVendorData();
      await loadCatalog();
      notify("success", `Ketersediaan ${menu.nama_menu} berhasil diubah.`);
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleDeleteVendorMenu(menuId) {
    try {
      await api.deleteVendorMenu(menuId);
      await loadVendorData();
      await loadCatalog();
      notify("success", "Menu berhasil dihapus.");
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleVendorOrderStatus(orderId, nextStatus) {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      await loadVendorData();
      notify(
        "success",
        `Status pesanan berhasil diperbarui menjadi '${nextStatus}'.`
      );
    } catch (err) {
      notify("error", err.message);
    }
  }

  // Admin Handlers
  async function handleAdminRoleChange(targetUser, newRole) {
    try {
      await api.updateAdminUser(targetUser.id_user, { peran: newRole });
      await loadAdminData();
      notify(
        "success",
        `Peran ${targetUser.username} diperbarui menjadi ${newRole}.`
      );
    } catch (err) {
      notify("error", err.message);
    }
  }

  async function handleAdminCreateTenant(e) {
    e.preventDefault();
    try {
      await api.createAdminTenant({
        ...adminNewTenant,
        id_user: Number(adminNewTenant.id_user),
      });
      setAdminNewTenant({
        id_user: "",
        nama_tenant: "",
        deskripsi: "",
        logo: "tenant/default.png",
        status_buka: true,
      });
      await loadAdminData();
      await loadCatalog();
      notify("success", "Tenant baru berhasil ditambahkan.");
    } catch (err) {
      notify("error", err.message);
    }
  }

  const unreadCount = notifications.filter((n) => !n.status_baca).length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <a
            href="#catalog"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("catalog");
            }}
            style={styles.brand}
          >
            LetsOrder<span style={styles.brandAccent}>.com</span>
          </a>
          <span style={styles.tag}>Self-Pickup Kantin UPNVJ</span>
        </div>

        <nav style={styles.nav}>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            style={
              activeTab === "catalog" ? styles.navBtnActive : styles.navBtn
            }
          >
            Katalog Menu
          </button>

          {(!user || user.peran === "Customer") && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("cart")}
                style={
                  activeTab === "cart" ? styles.navBtnActive : styles.navBtn
                }
              >
                Keranjang ({cart?.total_item || cart?.items?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                style={
                  activeTab === "orders" ? styles.navBtnActive : styles.navBtn
                }
              >
                Pesanan Saya ({orders.length})
              </button>
            </>
          )}

          {user?.peran === "Vendor" && (
            <button
              type="button"
              onClick={() => setActiveTab("vendor")}
              style={
                activeTab === "vendor" ? styles.navBtnActive : styles.navBtn
              }
            >
              Portal Vendor
            </button>
          )}

          {user?.peran === "Administrator" && (
            <button
              type="button"
              onClick={() => setActiveTab("admin")}
              style={
                activeTab === "admin" ? styles.navBtnActive : styles.navBtn
              }
            >
              Portal Admin
            </button>
          )}

          {user && (
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              style={
                activeTab === "notifications"
                  ? styles.navBtnActive
                  : styles.navBtn
              }
            >
              Notifikasi {unreadCount > 0 ? `(${unreadCount})` : ""}
            </button>
          )}

          {user ? (
            <div style={styles.userBadge}>
              <span>
                <strong>{user.nama}</strong> ({user.peran})
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutBtn}
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab("auth")}
              style={styles.primaryBtn}
            >
              Masuk / Daftar
            </button>
          )}
        </nav>
      </header>

      <div style={styles.statusBar}>
        <span
          style={{
            ...styles.statusDot,
            background:
              apiStatus === "connected"
                ? "#15803d"
                : apiStatus === "unavailable"
                  ? "#b45309"
                  : "#64748b",
          }}
        />
        <span>
          {apiStatus === "connected"
            ? "Terhubung ke Backend API Laravel"
            : apiStatus === "unavailable"
              ? "Mode Pratinjau Katalog (Pastikan server Laravel berjalan di http://127.0.0.1:8000 untuk transaksi penuh)"
              : "Memeriksa koneksi backend..."}
        </span>
      </div>

      {bannerMessage && (
        <div
          style={{
            ...styles.alertBanner,
            background:
              bannerMessage.type === "error" ? "#fef2f2" : "#f0fdf4",
            borderColor:
              bannerMessage.type === "error" ? "#fecaca" : "#bbf7d0",
            color: bannerMessage.type === "error" ? "#991b1b" : "#166534",
          }}
        >
          <span>{bannerMessage.text}</span>
          <button
            type="button"
            onClick={() => setBannerMessage(null)}
            style={styles.closeAlertBtn}
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB: CATALOG */}
      {activeTab === "catalog" && (
        <div>
          <section style={styles.heroCompact}>
            <div>
              <p style={styles.eyebrow}>PEMESANAN & SELF-PICKUP DIGITAL</p>
              <h1 style={styles.heroTitle}>
                Pesan makanan kantin tanpa antre panjang.
              </h1>
              <p style={styles.heroSubtitle}>
                Pilih menu dari satu tenant, lakukan simulasi pembayaran QRIS
                atau dompet digital, dan ambil pesanan langsung di tenant dengan{" "}
                <strong>Nomor Antrean</strong>.
              </p>
            </div>
          </section>

          {/* Daftar Tenant */}
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Daftar Tenant Kantin</h2>
              {selectedTenantId && (
                <button
                  type="button"
                  onClick={() => setSelectedTenantId("")}
                  style={styles.linkBtn}
                >
                  Tampilkan Semua Tenant
                </button>
              )}
            </div>
            <div style={styles.tenantGrid}>
              {tenants.map((tenant) => {
                const isSelected =
                  Number(selectedTenantId) === Number(tenant.id_tenant);
                return (
                  <div
                    key={tenant.id_tenant}
                    onClick={() =>
                      setSelectedTenantId(isSelected ? "" : tenant.id_tenant)
                    }
                    style={{
                      ...styles.tenantCard,
                      borderColor: isSelected ? "#2563eb" : "#e2e8f0",
                      background: isSelected ? "#eff6ff" : "#ffffff",
                    }}
                  >
                    <div style={styles.cardTopRow}>
                      <h3 style={styles.cardTitle}>{tenant.nama_tenant}</h3>
                      <span
                        style={{
                          ...styles.badge,
                          background: tenant.status_buka
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: tenant.status_buka ? "#166534" : "#991b1b",
                        }}
                      >
                        {tenant.status_buka ? "Buka" : "Tutup"}
                      </span>
                    </div>
                    <p style={styles.cardDesc}>{tenant.deskripsi}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Filter Kategori & Pencarian */}
          <section style={styles.section}>
            <div style={styles.filterBar}>
              <div style={styles.categoryPills}>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("")}
                  style={
                    selectedCategoryId === ""
                      ? styles.pillActive
                      : styles.pill
                  }
                >
                  Semua Kategori
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id_kategori}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id_kategori)}
                    style={
                      Number(selectedCategoryId) === Number(cat.id_kategori)
                        ? styles.pillActive
                        : styles.pill
                    }
                  >
                    {cat.nama_kategori}
                  </button>
                ))}
              </div>
              <input
                type="search"
                placeholder="Cari makanan atau minuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Daftar Menu */}
            {filteredMenus.length === 0 ? (
              <div style={styles.emptyBox}>
                Belum ada menu yang sesuai dengan filter pencarian.
              </div>
            ) : (
              <div style={styles.menuGrid}>
                {filteredMenus.map((menu) => {
                  const tenantOpen = menu.tenant
                    ? menu.tenant.status_buka
                    : true;
                  const canOrder = menu.status_tersedia && tenantOpen;
                  return (
                    <article key={menu.id_menu} style={styles.menuCard}>
                      <div style={styles.cardTopRow}>
                        <span style={styles.categoryTag}>
                          {menu.category?.nama_kategori || "Menu"}
                        </span>
                        <span style={styles.timeTag}>
                          ⏱ ~{menu.estimasi_menit} menit
                        </span>
                      </div>
                      <h3 style={styles.menuTitle}>{menu.nama_menu}</h3>
                      <p style={styles.tenantLabel}>
                        🏪 {menu.tenant?.nama_tenant || `Tenant #${menu.id_tenant}`}
                      </p>
                      <p style={styles.cardDesc}>{menu.deskripsi}</p>
                      <div style={styles.menuFooter}>
                        <strong style={styles.priceText}>
                          {formatRupiah(menu.harga)}
                        </strong>
                        <div style={styles.actionGroup}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMenuDetail(menu);
                              setDetailQuantity(1);
                              setDetailNotes("");
                            }}
                            style={styles.secondaryBtn}
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            disabled={!canOrder}
                            onClick={() => handleAddToCart(menu, 1, "")}
                            style={
                              canOrder
                                ? styles.primaryBtn
                                : styles.disabledBtn
                            }
                          >
                            {canOrder ? "+ Keranjang" : "Habis / Tutup"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* MODAL: DETAIL MENU */}
      {selectedMenuDetail && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.cardTopRow}>
              <h2 style={{ margin: 0 }}>{selectedMenuDetail.nama_menu}</h2>
              <button
                type="button"
                onClick={() => setSelectedMenuDetail(null)}
                style={styles.closeAlertBtn}
              >
                ✕
              </button>
            </div>
            <p style={styles.tenantLabel}>
              🏪 {selectedMenuDetail.tenant?.nama_tenant} • ⏱ Estimasi{" "}
              {selectedMenuDetail.estimasi_menit} menit
            </p>
            <p style={styles.cardDesc}>{selectedMenuDetail.deskripsi}</p>
            <p style={styles.priceLarge}>
              {formatRupiah(selectedMenuDetail.harga)}
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Jumlah Pesanan</label>
              <input
                type="number"
                min="1"
                value={detailQuantity}
                onChange={(e) =>
                  setDetailQuantity(Math.max(1, Number(e.target.value)))
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Catatan Item (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Tanpa es / Sambal pisah"
                value={detailNotes}
                onChange={(e) => setDetailNotes(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.cardTopRow}>
              <button
                type="button"
                onClick={() => setSelectedMenuDetail(null)}
                style={styles.secondaryBtn}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedMenuDetail.status_tersedia}
                onClick={() =>
                  handleAddToCart(
                    selectedMenuDetail,
                    detailQuantity,
                    detailNotes
                  )
                }
                style={styles.primaryBtn}
              >
                Tambahkan ({formatRupiah(selectedMenuDetail.harga * detailQuantity)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUTH */}
      {activeTab === "auth" && (
        <section style={styles.authContainer}>
          <div style={styles.authCard}>
            <div style={styles.tabSwitch}>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                style={
                  authMode === "login" ? styles.pillActive : styles.pill
                }
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                style={
                  authMode === "register" ? styles.pillActive : styles.pill
                }
              >
                Registrasi Customer
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={styles.formStack}>
              {authMode === "login" ? (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username atau Email</label>
                    <input
                      type="text"
                      required
                      placeholder="customer01 / vendor01 / admin"
                      value={authForm.login}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, login: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, password: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username</label>
                    <input
                      type="text"
                      required
                      value={authForm.username}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, username: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={authForm.nama}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, nama: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, email: e.target.value })
                      }
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password (Min. 8 karakter)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm({
                          ...authForm,
                          password: e.target.value,
                          password_confirmation: e.target.value,
                        })
                      }
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={authLoading}
                style={styles.primaryBtn}
              >
                {authLoading
                  ? "Memproses..."
                  : authMode === "login"
                    ? "Masuk Sekarang"
                    : "Daftar Akun"}
              </button>
            </form>

            <div style={styles.demoAccountBox}>
              <strong>Akun Seeder Pengujian (Password: password123):</strong>
              <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                <li>Customer: <code>customer01</code></li>
                <li>Vendor 1: <code>vendor01</code> (Kantin Sejahtera)</li>
                <li>Vendor 2: <code>vendor02</code> (Warung Nusantara)</li>
                <li>Admin: <code>admin</code></li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* TAB: CART */}
      {activeTab === "cart" && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Keranjang Belanja (Self-Pickup)</h2>
            {cart?.items?.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                style={styles.dangerBtn}
              >
                Kosongkan Keranjang
              </button>
            )}
          </div>

          {!cart?.items || cart.items.length === 0 ? (
            <div style={styles.emptyBox}>
              Keranjang belanja Anda masih kosong. Silakan pilih menu dari
              katalog.
            </div>
          ) : (
            <div style={styles.twoColGrid}>
              <div style={styles.formStack}>
                {cart.tenant && (
                  <div style={styles.infoBox}>
                    <strong>Tenant Tujuan: {cart.tenant.nama_tenant}</strong>
                    <span>
                      Satu pesanan hanya berlaku untuk satu tenant yang sama.
                    </span>
                  </div>
                )}

                {cart.items.map((item) => (
                  <div key={item.id_item_keranjang} style={styles.cartItemCard}>
                    <div>
                      <h4 style={{ margin: "0 0 4px" }}>{item.nama_menu}</h4>
                      <div style={{ fontSize: 14, color: "#475569" }}>
                        {formatRupiah(item.harga)} x {item.jumlah} ={" "}
                        <strong>{formatRupiah(item.subtotal)}</strong>
                      </div>
                      {item.catatan && (
                        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                          Catatan: {item.catatan}
                        </div>
                      )}
                    </div>
                    <div style={styles.actionGroup}>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCartItem(item, item.jumlah - 1)
                        }
                        style={styles.secondaryBtn}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 700, padding: "0 8px" }}>
                        {item.jumlah}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateCartItem(item, item.jumlah + 1)
                        }
                        style={styles.secondaryBtn}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartItem(item, 0)}
                        style={styles.dangerBtn}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateOrder} style={styles.summaryCard}>
                <h3 style={{ marginTop: 0 }}>Ringkasan Pesanan</h3>
                <div style={styles.summaryRow}>
                  <span>Total Item</span>
                  <strong>{cart.total_item || cart.items.length}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Total Harga</span>
                  <strong style={styles.priceLarge}>
                    {formatRupiah(cart.total_harga)}
                  </strong>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Catatan Pesanan</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Diambil saat jam istirahat siang"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button type="submit" style={styles.primaryBtn}>
                  Buat Pesanan & Dapatkan Nomor Antrean
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {/* TAB: CUSTOMER ORDERS & PAYMENT SIMULATION */}
      {activeTab === "orders" && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Pesanan Saya & Pelacakan Self-Pickup
          </h2>

          {orders.length === 0 ? (
            <div style={styles.emptyBox}>Belum ada riwayat pesanan.</div>
          ) : (
            <div style={styles.twoColGrid}>
              <div style={styles.formStack}>
                {orders.map((ord) => (
                  <div
                    key={ord.id_pesanan}
                    onClick={() => handleOpenOrderDetail(ord)}
                    style={{
                      ...styles.tenantCard,
                      borderColor:
                        selectedOrder?.id_pesanan === ord.id_pesanan
                          ? "#2563eb"
                          : "#e2e8f0",
                    }}
                  >
                    <div style={styles.cardTopRow}>
                      <span style={styles.queueBadge}>
                        Antrean #{ord.nomor_antrean}
                      </span>
                      <span style={styles.badge}>{ord.status_pesanan}</span>
                    </div>
                    <h4 style={{ margin: "8px 0 4px" }}>
                      {ord.tenant?.nama_tenant || `Tenant #${ord.id_tenant}`}
                    </h4>
                    <div style={styles.cardTopRow}>
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        {ord.waktu_pesan}
                      </span>
                      <strong>{formatRupiah(ord.total_harga)}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder && (
                <div style={styles.summaryCard}>
                  <div style={styles.cardTopRow}>
                    <h3 style={{ margin: 0 }}>
                      Detail Pesanan #{selectedOrder.id_pesanan}
                    </h3>
                    <span style={styles.queueBadge}>
                      Nomor Antrean: {selectedOrder.nomor_antrean}
                    </span>
                  </div>

                  <p style={{ color: "#475569", fontSize: 14 }}>
                    Status Saat Ini:{" "}
                    <strong>{selectedOrder.status_pesanan}</strong> • Tenant:{" "}
                    <strong>{selectedOrder.tenant?.nama_tenant}</strong>
                  </p>

                  <h4>Rincian Menu:</h4>
                  <ul style={{ paddingLeft: 18, margin: "8px 0 16px" }}>
                    {(selectedOrder.details || []).map((det) => (
                      <li key={det.id_detail} style={{ marginBottom: 4 }}>
                        {det.nama_menu || `Menu #${det.id_menu}`} x {det.jumlah}{" "}
                        — <strong>{formatRupiah(det.subtotal)}</strong>
                      </li>
                    ))}
                  </ul>

                  <div style={styles.summaryRow}>
                    <span>Total Pembayaran</span>
                    <strong style={styles.priceText}>
                      {formatRupiah(selectedOrder.total_harga)}
                    </strong>
                  </div>

                  {/* Bagian Simulasi Pembayaran */}
                  <div style={styles.paymentBox}>
                    <h4 style={{ marginTop: 0 }}>
                      Simulasi Pembayaran Digital
                    </h4>
                    {!activePayment ? (
                      <div style={styles.formStack}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>
                            Pilih Metode Pembayaran Simulasi
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={styles.input}
                          >
                            <option value="QRIS">QRIS Simulasi</option>
                            <option value="Dompet Digital">
                              Dompet Digital Simulasi
                            </option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleCreatePayment(selectedOrder.id_pesanan)
                          }
                          style={styles.primaryBtn}
                        >
                          Buat Kode Pembayaran Simulasi
                        </button>
                      </div>
                    ) : (
                      <div style={styles.formStack}>
                        <div>
                          Metode:{" "}
                          <strong>{activePayment.metode_pembayaran}</strong>
                        </div>
                        <div>
                          Kode Referensi Simulasi:{" "}
                          <code>{activePayment.kode_qris}</code>
                        </div>
                        <div>
                          Status Verifikasi:{" "}
                          <strong>{activePayment.status_verifikasi}</strong>
                        </div>
                        <div>
                          Batas Waktu: {activePayment.batas_waktu || "-"}
                        </div>
                        {activePayment.status_verifikasi !==
                          "Terverifikasi" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSimulateVerifyPayment(activePayment)
                            }
                            style={styles.primaryBtn}
                          >
                            Simulasikan Pembayaran Berhasil (Verifikasi)
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Riwayat Status */}
                  <h4>Riwayat Status Pesanan:</h4>
                  <ul style={{ paddingLeft: 18, fontSize: 13 }}>
                    {orderHistoryList.map((hist) => (
                      <li key={hist.id_riwayat}>
                        <strong>{hist.status}</strong> — {hist.waktu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB: NOTIFICATIONS */}
      {activeTab === "notifications" && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Notifikasi Pesanan</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await api.markAllNotificationsRead();
                  const res = await api.getNotifications();
                  if (Array.isArray(res?.data)) setNotifications(res.data);
                }}
                style={styles.secondaryBtn}
              >
                Tandai Semua Sudah Dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={styles.emptyBox}>Belum ada notifikasi.</div>
          ) : (
            <div style={styles.formStack}>
              {notifications.map((notif) => (
                <div
                  key={notif.id_notifikasi}
                  style={{
                    ...styles.cartItemCard,
                    background: notif.status_baca ? "#ffffff" : "#eff6ff",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: notif.status_baca ? 400 : 700 }}>
                      {notif.pesan}
                    </p>
                    <small style={{ color: "#64748b" }}>
                      Pesanan #{notif.id_pesanan}
                    </small>
                  </div>
                  {!notif.status_baca && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkNotificationRead(notif.id_notifikasi)
                      }
                      style={styles.secondaryBtn}
                    >
                      Tandai Dibaca
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB: VENDOR PORTAL */}
      {activeTab === "vendor" && user?.peran === "Vendor" && (
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Portal Vendor — {vendorTenant?.nama_tenant || "Tenant Anda"}
              </h2>
              <p style={{ margin: 0, color: "#64748b" }}>
                {vendorTenant?.deskripsi}
              </p>
            </div>
            {vendorTenant && (
              <button
                type="button"
                onClick={handleToggleTenantOpen}
                style={
                  vendorTenant.status_buka
                    ? styles.dangerBtn
                    : styles.primaryBtn
                }
              >
                {vendorTenant.status_buka
                  ? "Tutup Sementara Tenant"
                  : "Buka Tenant Sekarang"}
              </button>
            )}
          </div>

          <div style={styles.twoColGrid}>
            {/* Pengelolaan Menu Vendor */}
            <div style={styles.summaryCard}>
              <h3 style={{ marginTop: 0 }}>
                {vendorMenuForm.id_menu ? "Edit Menu" : "Tambah Menu Baru"}
              </h3>
              <form onSubmit={handleSaveVendorMenu} style={styles.formStack}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Menu</label>
                  <input
                    type="text"
                    required
                    value={vendorMenuForm.nama_menu}
                    onChange={(e) =>
                      setVendorMenuForm({
                        ...vendorMenuForm,
                        nama_menu: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Kategori</label>
                  <select
                    value={vendorMenuForm.id_kategori}
                    onChange={(e) =>
                      setVendorMenuForm({
                        ...vendorMenuForm,
                        id_kategori: e.target.value,
                      })
                    }
                    style={styles.input}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id_kategori} value={cat.id_kategori}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Harga (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={vendorMenuForm.harga}
                    onChange={(e) =>
                      setVendorMenuForm({
                        ...vendorMenuForm,
                        harga: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimasi Penyajian (Menit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vendorMenuForm.estimasi_menit}
                    onChange={(e) =>
                      setVendorMenuForm({
                        ...vendorMenuForm,
                        estimasi_menit: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deskripsi</label>
                  <textarea
                    rows={2}
                    value={vendorMenuForm.deskripsi}
                    onChange={(e) =>
                      setVendorMenuForm({
                        ...vendorMenuForm,
                        deskripsi: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.actionGroup}>
                  <button type="submit" style={styles.primaryBtn}>
                    {vendorMenuForm.id_menu ? "Simpan Perubahan" : "+ Tambah Menu"}
                  </button>
                  {vendorMenuForm.id_menu && (
                    <button
                      type="button"
                      onClick={() =>
                        setVendorMenuForm({
                          id_menu: null,
                          id_kategori: categories[0]?.id_kategori || 1,
                          nama_menu: "",
                          deskripsi: "",
                          gambar: "menu/default.png",
                          harga: "",
                          estimasi_menit: 5,
                          status_tersedia: true,
                        })
                      }
                      style={styles.secondaryBtn}
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              <h4>Daftar Menu Tenant ({vendorMenus.length})</h4>
              <div style={styles.formStack}>
                {vendorMenus.map((m) => (
                  <div key={m.id_menu} style={styles.cartItemCard}>
                    <div>
                      <strong>{m.nama_menu}</strong> — {formatRupiah(m.harga)}
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Status:{" "}
                        {m.status_tersedia ? "Tersedia" : "Tidak Tersedia"}
                      </div>
                    </div>
                    <div style={styles.actionGroup}>
                      <button
                        type="button"
                        onClick={() => handleToggleMenuAvailability(m)}
                        style={styles.secondaryBtn}
                      >
                        {m.status_tersedia ? "Set Habis" : "Set Tersedia"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setVendorMenuForm({
                            id_menu: m.id_menu,
                            id_kategori: m.id_kategori,
                            nama_menu: m.nama_menu,
                            deskripsi: m.deskripsi,
                            gambar: m.gambar,
                            harga: m.harga,
                            estimasi_menit: m.estimasi_menit,
                            status_tersedia: m.status_tersedia,
                          })
                        }
                        style={styles.secondaryBtn}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVendorMenu(m.id_menu)}
                        style={styles.dangerBtn}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pesanan Masuk Vendor */}
            <div style={styles.summaryCard}>
              <h3 style={{ marginTop: 0 }}>
                Pesanan Masuk ({vendorOrders.length})
              </h3>
              {vendorOrders.length === 0 ? (
                <p style={{ color: "#64748b" }}>Belum ada pesanan masuk.</p>
              ) : (
                <div style={styles.formStack}>
                  {vendorOrders.map((ord) => (
                    <div key={ord.id_pesanan} style={styles.cartItemCard}>
                      <div>
                        <div style={styles.actionGroup}>
                          <span style={styles.queueBadge}>
                            {ord.nomor_antrean}
                          </span>
                          <strong>{ord.user?.nama || "Customer"}</strong>
                          <span style={styles.badge}>{ord.status_pesanan}</span>
                        </div>
                        <div style={{ fontSize: 13, marginTop: 6 }}>
                          {(ord.details || []).map((d) => (
                            <div key={d.id_detail}>
                              • {d.nama_menu} x {d.jumlah}
                            </div>
                          ))}
                        </div>
                        <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
                          Total: <strong>{formatRupiah(ord.total_harga)}</strong>{" "}
                          • Pembayaran:{" "}
                          <strong>
                            {ord.payment?.status_verifikasi || "Belum Dibuat"}
                          </strong>
                        </div>
                      </div>
                      <div style={styles.formStack}>
                        {ord.status_pesanan !== "Selesai" &&
                          ord.status_pesanan !== "Dibatalkan" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleVendorOrderStatus(
                                    ord.id_pesanan,
                                    "Sedang Diproses"
                                  )
                                }
                                style={styles.secondaryBtn}
                              >
                                Diproses
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleVendorOrderStatus(
                                    ord.id_pesanan,
                                    "Siap Diambil"
                                  )
                                }
                                style={styles.primaryBtn}
                              >
                                Siap Diambil
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleVendorOrderStatus(
                                    ord.id_pesanan,
                                    "Selesai"
                                  )
                                }
                                style={styles.secondaryBtn}
                              >
                                Selesai Diambil
                              </button>
                            </>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB: ADMINISTRATOR PORTAL */}
      {activeTab === "admin" && user?.peran === "Administrator" && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Portal Administrator — Pengelolaan Pengguna & Tenant
          </h2>
          <div style={styles.twoColGrid}>
            <div style={styles.summaryCard}>
              <h3 style={{ marginTop: 0 }}>
                Daftar Pengguna ({adminUsers.length})
              </h3>
              <div style={styles.formStack}>
                {adminUsers.map((u) => (
                  <div key={u.id_user} style={styles.cartItemCard}>
                    <div>
                      <strong>{u.nama}</strong> (@{u.username})
                      <div style={{ fontSize: 13, color: "#64748b" }}>
                        {u.email}
                      </div>
                    </div>
                    <select
                      value={u.peran}
                      onChange={(e) => handleAdminRoleChange(u, e.target.value)}
                      style={{ ...styles.input, width: "auto" }}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.summaryCard}>
              <h3 style={{ marginTop: 0 }}>Tambah Tenant Baru</h3>
              <form onSubmit={handleAdminCreateTenant} style={styles.formStack}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Pemilik Tenant (User Vendor)</label>
                  <select
                    required
                    value={adminNewTenant.id_user}
                    onChange={(e) =>
                      setAdminNewTenant({
                        ...adminNewTenant,
                        id_user: e.target.value,
                      })
                    }
                    style={styles.input}
                  >
                    <option value="">-- Pilih Pengguna --</option>
                    {adminUsers.map((u) => (
                      <option key={u.id_user} value={u.id_user}>
                        {u.nama} ({u.peran})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Tenant</label>
                  <input
                    type="text"
                    required
                    value={adminNewTenant.nama_tenant}
                    onChange={(e) =>
                      setAdminNewTenant({
                        ...adminNewTenant,
                        nama_tenant: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Deskripsi</label>
                  <input
                    type="text"
                    value={adminNewTenant.deskripsi}
                    onChange={(e) =>
                      setAdminNewTenant({
                        ...adminNewTenant,
                        deskripsi: e.target.value,
                      })
                    }
                    style={styles.input}
                  />
                </div>
                <button type="submit" style={styles.primaryBtn}>
                  + Simpan Tenant
                </button>
              </form>

              <h4>Daftar Tenant ({adminTenants.length})</h4>
              <div style={styles.formStack}>
                {adminTenants.map((t) => (
                  <div key={t.id_tenant} style={styles.cartItemCard}>
                    <div>
                      <strong>{t.nama_tenant}</strong>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Pengelola: {t.user?.nama || `User #${t.id_user}`} •{" "}
                        {t.status_buka ? "Buka" : "Tutup"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <footer style={styles.footer}>
        <p>
          LetsOrder.com — Sistem Pemesanan dan Self-Pickup Digital untuk Kantin
          UPNVJ. Pembayaran QRIS & dompet digital bersifat simulasi.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "0 5vw 48px",
    color: "#0f172a",
    background: "#f8fafc",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    minHeight: 74,
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e2e8f0",
    padding: "12px 0",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brand: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.8px",
    textDecoration: "none",
  },
  brandAccent: { color: "#2563eb" },
  tag: {
    color: "#1e40af",
    background: "#dbeafe",
    padding: "5px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  navBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid transparent",
    background: "transparent",
    color: "#475569",
    fontWeight: 600,
    cursor: "pointer",
  },
  navBtnActive: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingLeft: 8,
    fontSize: 13,
  },
  statusBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 0",
    fontSize: 13,
    color: "#475569",
  },
  statusDot: { width: 8, height: 8, borderRadius: "50%" },
  alertBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid",
    marginBottom: 16,
    fontSize: 14,
  },
  closeAlertBtn: {
    background: "transparent",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
  },
  heroCompact: {
    padding: "28px 0 16px",
    maxWidth: 740,
  },
  eyebrow: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "1.4px",
    margin: 0,
  },
  heroTitle: {
    margin: "8px 0 10px",
    fontSize: "clamp(26px, 4vw, 40px)",
    letterSpacing: "-1px",
  },
  heroSubtitle: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 20,
  },
  tenantGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  tenantCard: {
    padding: 18,
    borderRadius: 14,
    border: "2px solid #e2e8f0",
    background: "#ffffff",
    cursor: "pointer",
  },
  cardTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
  },
  cardDesc: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.5,
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#334155",
  },
  queueBadge: {
    padding: "4px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 800,
    background: "#dbeafe",
    color: "#1e40af",
  },
  filterBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  categoryPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },
  pillActive: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  searchInput: {
    minWidth: 260,
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
    gap: 16,
  },
  menuCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: 700,
    color: "#2563eb",
    background: "#eff6ff",
    padding: "3px 8px",
    borderRadius: 6,
  },
  timeTag: {
    fontSize: 12,
    color: "#64748b",
  },
  menuTitle: {
    margin: "10px 0 4px",
    fontSize: 17,
  },
  tenantLabel: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
  },
  menuFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
  },
  priceText: {
    fontSize: 16,
    color: "#0f172a",
  },
  priceLarge: {
    fontSize: 20,
    fontWeight: 800,
    color: "#2563eb",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  primaryBtn: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 12px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },
  dangerBtn: {
    padding: "8px 12px",
    borderRadius: 9,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 600,
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
  },
  disabledBtn: {
    padding: "9px 14px",
    borderRadius: 9,
    border: "none",
    background: "#cbd5e1",
    color: "#64748b",
    fontWeight: 600,
    cursor: "not-allowed",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontWeight: 600,
    cursor: "pointer",
  },
  emptyBox: {
    padding: 32,
    textAlign: "center",
    background: "#ffffff",
    borderRadius: 14,
    border: "1px dashed #cbd5e1",
    color: "#64748b",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 50,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    display: "grid",
    gap: 12,
  },
  authContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "32px 0",
  },
  authCard: {
    width: "100%",
    maxWidth: 440,
    background: "#ffffff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
  },
  tabSwitch: {
    display: "flex",
    gap: 8,
    marginBottom: 18,
  },
  formStack: {
    display: "grid",
    gap: 12,
  },
  formGroup: {
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14,
  },
  demoAccountBox: {
    marginTop: 18,
    padding: 12,
    background: "#f8fafc",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 13,
    color: "#475569",
  },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
    alignItems: "start",
  },
  cartItemCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 14,
    background: "#ffffff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
  },
  summaryCard: {
    padding: 20,
    background: "#ffffff",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    display: "grid",
    gap: 14,
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoBox: {
    display: "grid",
    gap: 4,
    padding: 12,
    borderRadius: 10,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e3a8a",
    fontSize: 13,
  },
  paymentBox: {
    padding: 14,
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 13,
  },
};
