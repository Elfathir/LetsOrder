import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  Star,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  X,
  User,
  LogOut,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Timer,
  Bell,
  Heart,
  HelpCircle,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Menu,
  Eye,
  EyeOff,
  Globe,
  Store,
  Tag,
  Lock,
  Mail,
  Receipt,
  RotateCcw,
  Pencil,
  TrendingUp,
  Users,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import {
  api,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
} from "./services/api";

const HERO_SLIDES_BY_LANG = {
  EN: [
    {
      tag: "ESTD 2026 · CAMPUS CANTEEN",
      title: "Skip The Line. Pre-Order Your Campus Meal.",
      desc: "Freshly prepared by your favorite campus canteen tenants. Grab it warm between lectures without waiting in queue.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Order now",
      secondaryCta: "Explore tenants",
    },
    {
      tag: "STUDENT SPECIAL PROMO",
      title: "10% Off Every Meal With Code STUDENT10",
      desc: "Enjoy 10% discount on all campus canteen menus for orders above Rp25.000. Apply coupon directly in your cart!",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Claim promo",
      secondaryCta: "View popular menu",
    },
    {
      tag: "SELF-PICKUP DIGITAL",
      title: "Real-Time Cooking & Counter Pickup Tracker",
      desc: "Get your digital queue number directly on your phone and arrive just when your warm food is ready at the counter.",
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Track orders",
      secondaryCta: "Explore menu",
    },
  ],
  ID: [
    {
      tag: "ESTD 2026 · KANTIN KAMPUS",
      title: "Tanpa Antre. Pesan Makanan Kantin Lebih Awal.",
      desc: "Disiapkan langsung oleh tenant kantin favoritmu. Ambil hangat di sela jadwal kuliah tanpa perlu antre lama.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Pesan sekarang",
      secondaryCta: "Lihat kantin",
    },
    {
      tag: "PROMO SPESIAL MAHASISWA",
      title: "Diskon 10% Setiap Pesanan Dengan Kode STUDENT10",
      desc: "Nikmati potongan 10% untuk semua menu kantin dengan minimal belanja Rp25.000. Gunakan promo langsung di keranjang!",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Pakai promo",
      secondaryCta: "Lihat menu populer",
    },
    {
      tag: "AMBIL MANDIRI DIGITAL",
      title: "Pantau Proses Masak & Antrean Secara Real-Time",
      desc: "Dapatkan nomor antrean digital langsung dari HP dan datang ke konter saat makananmu sudah siap.",
      image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1400&auto=format&fit=crop&q=80",
      primaryCta: "Lacak pesanan",
      secondaryCta: "Jelajahi menu",
    },
  ],
};

const TRANSLATIONS = {
  EN: {
    subtitleCustomer: "Campus canteen pre-order",
    subtitleTenant: "Tenant portal",
    navHome: "Home",
    navTenant: "Tenant",
    navOrders: "Orders",
    navHistory: "History",
    navDashboard: "Dashboard",
    navMenu: "Menu",
    categories: "Categories",
    catRice: "Rice & Mains",
    catSnacks: "Snacks",
    catDrinks: "Drinks",
    itemsUnit: "items",
    popularMenu: "Popular menu",
    viewAll: "View all",
    emptyMenuTitle: "No menus uploaded yet",
    emptyMenuDesc: "No campus canteen tenant has uploaded food or beverage menus yet.",
    tenantTitle: "Tenant",
    tenantSubtitle: "Order ahead and skip the line at the counter.",
    searchFoodPlaceholder: "Search food or drinks…",
    emptyTenantTitle: "No tenants registered yet",
    emptyTenantDesc: "Canteen tenants will appear here after signing up with a Tenant account.",
    backTenants: "Back to all tenants",
    emptyCartTitle: "Your order cart is empty",
    emptyCartDesc: "Browse foods or drinks from campus canteen tenants before picking a promo and checking out.",
    browseMenuBtn: "Browse Menu",
    yourOrder: "Your order",
    reviewItems: "Review your items and apply a promo before paying.",
    emptyCartShort: "No meals or drinks selected yet.",
    stepCart: "Cart & promo",
    stepPayment: "Payment",
    stepPreparing: "Preparing",
    stepPickup: "Pickup",
    cartTitle: "Cart",
    addMore: "+ Add more",
    promosTitle: "Promos",
    pickPromo: "Pick one promo for this order.",
    subtotal: "Subtotal",
    serviceFee: "Service fee",
    free: "Free",
    total: "Total",
    continuePayment: "Continue to payment",
    orderSummary: "Order summary",
    cancelEdit: "Cancel & edit order",
    scanToPay: "Scan to pay",
    amountDue: "Amount due",
    paymentTimer: "Payment timer",
    completePaymentBtn: "I've completed payment",
    historyTitle: "Order history",
    historyDesc: "Track active orders and reorder your favorites.",
    filterAll: "All",
    filterInProgress: "In progress",
    filterCompleted: "Completed",
    filterCancelled: "Cancelled",
    welcomeBack: "Welcome back",
    storeOpen: "Open for orders",
    storeClosed: "Closed for orders",
    kpiOrders: "Orders today",
    kpiRevenue: "Revenue today",
    kpiQueue: "In queue now",
    kpiPrep: "Avg. prep time",
    incomingOrders: "Incoming orders",
    incomingDesc: "Manage active orders from your canteen customers.",
    noIncomingOrders: "No active incoming orders yet. New customer orders will appear here automatically.",
    menuAvailability: "Menu availability",
    itemsAvailable: "items available",
    manageMenu: "Manage menu",
    topSellers: "Top sellers today",
    noMenuUploadedShort: "No menus uploaded yet.",
    myMenuTitle: "My menu",
    myMenuDesc: "Upload, edit dishes and control what customers can order.",
    uploadMenuBtn: "Upload Menu",
    drawerProfile: "My Profile",
    drawerFavorites: "Favorites",
    drawerNotifications: "Notifications",
    drawerHelp: "Help Center",
    logout: "Log out",
    authWelcome: "Welcome back",
    authCreate: "Create your account",
    authForgot: "Reset password",
  },
  ID: {
    subtitleCustomer: "Pre-order kantin kampus",
    subtitleTenant: "Portal tenant",
    navHome: "Beranda",
    navTenant: "Kantin",
    navOrders: "Pesanan",
    navHistory: "Riwayat",
    navDashboard: "Dasbor",
    navMenu: "Menu",
    categories: "Kategori",
    catRice: "Makanan Berat",
    catSnacks: "Camilan",
    catDrinks: "Minuman",
    itemsUnit: "menu",
    popularMenu: "Menu populer",
    viewAll: "Lihat semua",
    emptyMenuTitle: "Belum ada menu yang diupload",
    emptyMenuDesc: "Saat ini belum ada tenant kantin yang mengupload menu makanan atau minuman.",
    tenantTitle: "Daftar Kantin",
    tenantSubtitle: "Pesan lebih awal tanpa antre panjang di kasir.",
    searchFoodPlaceholder: "Cari makanan atau minuman…",
    emptyTenantTitle: "Belum ada tenant yang terdaftar",
    emptyTenantDesc: "Tenant kantin akan muncul di sini setelah mendaftar akun Tenant.",
    backTenants: "Kembali ke daftar kantin",
    emptyCartTitle: "Keranjang pesanan Anda masih kosong",
    emptyCartDesc: "Pilih makanan atau minuman dari menu kantin terlebih dahulu sebelum memilih promo dan membayar.",
    browseMenuBtn: "Pilih Menu Makanan",
    yourOrder: "Pesanan Anda",
    reviewItems: "Periksa pesanan Anda dan pilih promo sebelum membayar.",
    emptyCartShort: "Belum ada makanan atau minuman yang Anda pilih.",
    stepCart: "Keranjang",
    stepPayment: "Pembayaran",
    stepPreparing: "Disiapkan",
    stepPickup: "Ambil",
    cartTitle: "Keranjang",
    addMore: "+ Tambah menu",
    promosTitle: "Promo",
    pickPromo: "Pilih satu promo untuk pesanan ini.",
    subtotal: "Subtotal",
    serviceFee: "Biaya layanan",
    free: "Gratis",
    total: "Total",
    continuePayment: "Lanjut ke pembayaran",
    orderSummary: "Ringkasan pesanan",
    cancelEdit: "Batal & ubah pesanan",
    scanToPay: "Scan untuk membayar",
    amountDue: "Total tagihan",
    paymentTimer: "Batas waktu bayar",
    completePaymentBtn: "Saya sudah membayar",
    historyTitle: "Riwayat pesanan",
    historyDesc: "Pantau pesanan aktif dan pesan ulang menu favoritmu.",
    filterAll: "Semua",
    filterInProgress: "Diproses",
    filterCompleted: "Selesai",
    filterCancelled: "Dibatalkan",
    welcomeBack: "Selamat datang kembali",
    storeOpen: "Buka menerima pesanan",
    storeClosed: "Sedang tutup",
    kpiOrders: "Pesanan hari ini",
    kpiRevenue: "Pendapatan hari ini",
    kpiQueue: "Sedang antre",
    kpiPrep: "Rata-rata masak",
    incomingOrders: "Pesanan masuk",
    incomingDesc: "Kelola antrean pesanan aktif yang masuk ke kantin Anda.",
    noIncomingOrders: "Belum ada pesanan masuk saat ini. Pesanan pelanggan akan muncul otomatis di sini.",
    menuAvailability: "Ketersediaan menu",
    itemsAvailable: "menu tersedia",
    manageMenu: "Kelola menu",
    topSellers: "Terlaris hari ini",
    noMenuUploadedShort: "Belum ada menu yang diupload.",
    myMenuTitle: "Menu saya",
    myMenuDesc: "Upload, ubah menu dan atur ketersediaan untuk pelanggan.",
    uploadMenuBtn: "Tambah Menu",
    drawerProfile: "Profil Saya",
    drawerFavorites: "Favorit",
    drawerNotifications: "Notifikasi",
    drawerHelp: "Pusat Bantuan",
    logout: "Keluar",
    authWelcome: "Selamat datang",
    authCreate: "Buat akun baru",
    authForgot: "Reset kata sandi",
  },
};

const PROMOS = [
  {
    code: "COMBO3K",
    title: "Rp3.000 off meal + drink",
    subtitle: "COMBO3K · Min. Rp20.000",
    discount: 3000,
    minSpend: 20000,
    type: "fixed",
  },
  {
    code: "STUDENT10",
    title: "10% off for students",
    subtitle: "STUDENT10 · Add Rp3.000 more to use",
    discount: 0.1,
    minSpend: 25000,
    type: "percentage",
  },
  {
    code: "HEMAT5K",
    title: "Rp5.000 off your order",
    subtitle: "HEMAT5K · Add Rp8.000 more to use",
    discount: 5000,
    minSpend: 30000,
    type: "fixed",
  },
  {
    code: "EARLYBIRD",
    title: "15% off morning orders",
    subtitle: "EARLYBIRD · Min. Rp15.000",
    discount: 0.15,
    minSpend: 15000,
    type: "percentage",
  },
];

const TENANTS = [];
const MENUS = [];
const INITIAL_CART = [];
const INITIAL_ORDERS = [];
const INITIAL_TENANT_MENUS = [];
const INITIAL_INCOMING_ORDERS = [];

const CATEGORY_ID_MAP = {
  "Rice & Mains": 1,
  Snacks: 2,
  Drinks: 3,
};

function readAndCompressImageFile(file, maxDim = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("File tidak ditemukan."));
    if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) {
      return reject(new Error("Format gambar harus JPG, PNG, WEBP, atau GIF."));
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return reject(new Error("File gambar kosong."));
      if (file.size <= 250 * 1024 && !file.type.includes("bmp")) {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(dataUrl);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function normalizeCategoryName(rawName) {
  const name = String(rawName || "").trim();
  if (!name || name === "Makanan") return "Rice & Mains";
  if (name === "Camilan") return "Snacks";
  if (name === "Minuman") return "Drinks";
  return name;
}

function normalizeMenuRecord(m) {
  const revCount = Number(m.reviews_count ?? (Array.isArray(m.reviews) ? m.reviews.length : m.reviews) ?? 0);
  return {
    ...m,
    available: Boolean(m.status_tersedia ?? m.available ?? true),
    kategori_nama: normalizeCategoryName(m.kategori_nama || m.category?.nama_kategori),
    tenant_name: m.tenant_name || m.tenant?.nama_tenant || "Kantin",
    sold_today: Number(m.sold_today || 0),
    rating: revCount > 0 && m.rating ? String(m.rating) : null,
    reviews: revCount,
    reviews_count: revCount,
  };
}

function getLocalDateKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatLiveClock(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function isTenantOpenAt(tenant, nowDate = new Date()) {
  if (!tenant) return false;
  if (!tenant.auto_schedule) return Boolean(tenant.status_buka ?? true);
  if (tenant.status_buka === false) return false;
  const openStr = String(tenant.jam_buka || "07:00").slice(0, 5);
  const closeStr = String(tenant.jam_tutup || "21:00").slice(0, 5);
  const pad = (n) => String(n).padStart(2, "0");
  const cur = `${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`;
  return openStr <= closeStr ? cur >= openStr && cur < closeStr : cur >= openStr || cur < closeStr;
}

function formatPercentDelta(todayVal, yesterdayVal) {
  if (yesterdayVal > 0) {
    const pct = Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  }
  return todayVal > 0 ? "+100%" : "0%";
}

function formatRupiah(num) {
  return "Rp" + Number(num || 0).toLocaleString("id-ID");
}

function getInitials(name) {
  const clean = String(name || "").trim();
  if (!clean) return "LO";
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function SafeImage({ src, alt, className = "", style = {}, fallbackType = "food", iconSize = 28 }) {
  const [failed, setFailed] = useState(false);
  const rawSrc = typeof src === "string" ? src.trim() : "";
  const cleanSrc =
    rawSrc === "menu/default.png" || rawSrc === "tenant/default.png" ? "" : rawSrc;

  useEffect(() => {
    setFailed(false);
  }, [cleanSrc]);

  if (!cleanSrc || failed) {
    return (
      <div
        aria-label={alt}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-warm-img)",
          color: "var(--maroon)",
          opacity: 0.45,
          ...style,
        }}
      >
        {fallbackType === "store" ? <Store size={iconSize} /> : <ShoppingBag size={iconSize} />}
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", ...style }}
      onError={() => setFailed(true)}
    />
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const portalMode = currentUser?.peran === "Vendor" ? "tenant" : "customer";

  const [navTab, setNavTab] = useState("home");
  const [tenantNavTab, setTenantNavTab] = useState("dashboard");

  const [lang, setLang] = useState(() => localStorage.getItem("letsorder_lang") || "ID");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ID;
  const heroSlides = HERO_SLIDES_BY_LANG[lang] || HERO_SLIDES_BY_LANG.ID;

  const changeLanguage = (nextLang) => {
    setLang(nextLang);
    localStorage.setItem("letsorder_lang", nextLang);
    setIsLangMenuOpen(false);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [menusList, setMenusList] = useState([]);
  const [tenantsList, setTenantsList] = useState([]);

  const [liveClock, setLiveClock] = useState(() => new Date());
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [myTenantInfo, setMyTenantInfo] = useState(null);
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);
  const [storeForm, setStoreForm] = useState({
    nama_tenant: "",
    deskripsi: "",
    booth: "",
    logo: "",
    jam_buka: "07:00",
    jam_tutup: "21:00",
    auto_schedule: false,
    status_buka: true,
  });
  const [storeSettingsError, setStoreSettingsError] = useState("");
  const [ordersTodayCount, setOrdersTodayCount] = useState(0);
  const [revenueTodayTotal, setRevenueTodayTotal] = useState(0);
  const [kpiStats, setKpiStats] = useState({
    ordersDelta: "0%",
    revenueDelta: "0%",
    avgPrepText: "0 min",
    prepDelta: "0 min",
  });
  const [topSellersToday, setTopSellersToday] = useState([]);
  const [publicPromos, setPublicPromos] = useState([]);
  const [vendorPromos, setVendorPromos] = useState([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    kode_promo: "",
    judul: "",
    tipe: "fixed",
    diskon: "",
    minimal_belanja: "0",
  });
  const [promoFormError, setPromoFormError] = useState("");
  const [tenantMenus, setTenantMenus] = useState([]);
  const [tenantMenuFilter, setTenantMenuFilter] = useState("All");
  const [tenantMenuSearch, setTenantMenuSearch] = useState("");
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [activeMenuReviews, setActiveMenuReviews] = useState([]);
  const [editingDish, setEditingDish] = useState(null);
  const [editMenuError, setEditMenuError] = useState("");
  const [editDishForm, setEditDishForm] = useState({
    nama_menu: "",
    harga: "",
    kategori_nama: "Rice & Mains",
    deskripsi: "",
    gambar: "",
    estimasi_menit: "8",
    available: true,
  });
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuError, setAddMenuError] = useState("");
  const [isUploadingMenu, setIsUploadingMenu] = useState(false);
  const [newDishForm, setNewDishForm] = useState({
    nama_menu: "",
    kategori_nama: "Rice & Mains",
    harga: "",
    estimasi_menit: "8",
    deskripsi: "",
    gambar: "",
    available: true,
  });

  const openAddMenuModal = () => {
    setAddMenuError("");
    setNewDishForm({
      nama_menu: "",
      harga: "",
      kategori_nama: "Rice & Mains",
      estimasi_menit: "10",
      deskripsi: "",
      gambar: "",
      available: true,
    });
    setIsAddMenuOpen(true);
  };

  const [tenantOrderStep, setTenantOrderStep] = useState(1);
  const [tenantHistoryFilter, setTenantHistoryFilter] = useState("All");

  const [heroSlide, setHeroSlide] = useState(0);
  const [activeTenantView, setActiveTenantView] = useState(null);

  const [activeMenuDetail, setActiveMenuDetail] = useState(null);
  const [detailMounted, setDetailMounted] = useState(false);
  const [detailActive, setDetailActive] = useState(false);
  const [detailQuantity, setDetailQuantity] = useState(1);

  const openFoodDetail = useCallback((menuItem) => {
    setActiveMenuDetail(menuItem);
    setDetailQuantity(1);
    setActiveMenuReviews([]);
    if (menuItem?.id_menu) {
      api
        .getReviews({ id_menu: menuItem.id_menu })
        .then((res) => {
          if (Array.isArray(res?.data)) setActiveMenuReviews(res.data);
        })
        .catch(() => {});
    }
    setDetailMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDetailActive(true);
      });
    });
  }, []);

  const closeFoodDetail = useCallback(() => {
    setDetailActive(false);
    setTimeout(() => {
      setDetailMounted(false);
      setActiveMenuDetail(null);
      setActiveMenuReviews([]);
    }, 320);
  }, []);

  const [cartItems, setCartItems] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [orderNote, setOrderNote] = useState("");

  const [checkoutStep, setCheckoutStep] = useState(1);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [activeQueueCode, setActiveQueueCode] = useState("A-001");
  const [paymentTimerSeconds, setPaymentTimerSeconds] = useState(899);
  const [prepTimerSeconds, setPrepTimerSeconds] = useState(525);
  const [isPaying, setIsPaying] = useState(false);

  const [ordersHistory, setOrdersHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("All");

  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const uid = getStoredUser()?.id_user || "guest";
      const raw = localStorage.getItem(`letsorder_favs_${uid}`);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [tenantMenuQuery, setTenantMenuQuery] = useState("");
  const [toastAlert, setToastAlert] = useState(null);
  const toastTimerRef = useRef(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [activeDrawerModal, setActiveDrawerModal] = useState(null);
  const [profileForm, setProfileForm] = useState({
    nama: "",
    username: "",
    email: "",
    no_telp: "",
    nama_tenant: "",
    jenis_kelamin: "",
    tanggal_lahir: "",
    avatar: "",
  });
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ type: "", text: "" });

  const maskEmail = (rawEmail) => {
    const str = String(rawEmail || "").trim();
    if (!str || !str.includes("@")) return "Belum diatur";
    const [local, domain] = str.split("@");
    const visible = local.slice(0, 2);
    const stars = "*".repeat(Math.max(6, local.length - 2));
    return `${visible}${stars}@${domain}`;
  };

  const openDrawerModal = useCallback(
    (modalId) => {
      if (modalId === "profile") {
        setProfileForm({
          nama: currentUser?.nama || "",
          username: currentUser?.username || "",
          email: currentUser?.email || "",
          no_telp: currentUser?.no_telp || "",
          nama_tenant:
            currentUser?.tenant?.nama_tenant || currentUser?.nama || "",
          jenis_kelamin: currentUser?.jenis_kelamin || "",
          tanggal_lahir: currentUser?.tanggal_lahir || "",
          avatar: currentUser?.avatar || "",
        });
        setIsEditingEmail(false);
        setIsEditingPhone(false);
        setProfileAlert({ type: "", text: "" });
      }
      setActiveDrawerModal(modalId);
    },
    [currentUser]
  );

  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);

  const openDrawer = useCallback(() => {
    setDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrawerActive(true);
      });
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerActive(false);
    setTimeout(() => {
      setDrawerMounted(false);
    }, 320);
  }, []);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [forgotStep, setForgotStep] = useState(1);
  const [loginRoleTab, setLoginRoleTab] = useState("Customer");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authForm, setAuthForm] = useState({
    username: "",
    nama: "",
    password: "",
    email: "",
    nama_tenant: "",
    new_password: "",
    reset_token: "",
  });
  const [googleClientId, setGoogleClientId] = useState(
    () => (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim()
  );

  useEffect(() => {
    api
      .getGoogleConfig()
      .then((res) => {
        if (res?.data?.client_id) {
          setGoogleClientId(String(res.data.client_id).trim());
        }
      })
      .catch(() => {});

    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("google_auth_code");
    const errorParam = params.get("google_error");

    if (codeParam) {
      window.history.replaceState({}, "", window.location.pathname);
      setAuthLoading(true);
      api
        .exchangeGoogleCode(codeParam)
        .then((res) => {
          const user = res?.data?.user;
          const token = res?.data?.access_token || res?.data?.token;
          setStoredSession(token, user);
          setCurrentUser(user);
          setIsAuthOpen(false);
          if (user?.peran === "Vendor") {
            setTenantNavTab("dashboard");
          } else {
            setNavTab("home");
          }
        })
        .catch((err) => {
          setAuthError(err.message || "Gagal login menggunakan Google.");
        })
        .finally(() => {
          setAuthLoading(false);
        });
    } else if (errorParam) {
      setAuthError(errorParam);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (window.location.hash.includes("access_token=")) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const pendingRole = localStorage.getItem("letsorder_pending_role") || "Customer";
      if (accessToken) {
        window.history.replaceState({}, "", window.location.pathname);
        setAuthLoading(true);
        api
          .googleLogin({ access_token: accessToken, peran: pendingRole })
          .then((res) => {
            const user = res?.data?.user;
            const token = res?.data?.access_token || res?.data?.token;
            setStoredSession(token, user);
            setCurrentUser(user);
            setIsAuthOpen(false);
            if (user?.peran === "Vendor") {
              setTenantNavTab("dashboard");
            } else {
              setNavTab("home");
            }
          })
          .catch((err) => {
            setAuthError(err.message || "Gagal login menggunakan Google.");
          })
          .finally(() => {
            setAuthLoading(false);
          });
      }
    }
  }, []);

  const notify = useCallback((text, type = "info") => {
    if (!text) return;
    setToastAlert({ id: Date.now(), text: String(text), type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastAlert(null);
    }, 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      const uid = currentUser?.id_user || "guest";
      const raw = localStorage.getItem(`letsorder_favs_${uid}`);
      const parsed = raw ? JSON.parse(raw) : [];
      setFavoriteIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavoriteIds([]);
    }
  }, [currentUser?.id_user]);

  const toggleFavorite = useCallback(
    (idMenu) => {
      const targetId = Number(idMenu);
      setFavoriteIds((prev) => {
        const exists = prev.includes(targetId);
        const next = exists ? prev.filter((id) => id !== targetId) : [...prev, targetId];
        try {
          const uid = currentUser?.id_user || "guest";
          localStorage.setItem(`letsorder_favs_${uid}`, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });
    },
    [currentUser?.id_user]
  );

  const displayName =
    portalMode === "tenant"
      ? currentUser?.tenant?.nama_tenant || currentUser?.nama || currentUser?.username || "Tenant"
      : currentUser?.nama || currentUser?.username || "Pengguna";
  const displayInitials = getInitials(displayName);

  const syncFromApi = useCallback(async () => {
    try {
      if (currentUser) {
        try {
          const meRes = await api.me();
          const validUser =
            meRes?.data?.user || (meRes?.data?.id_user ? meRes.data : null);
          if (!validUser) {
            clearStoredSession();
            setCurrentUser(null);
            return;
          }
        } catch (err) {
          if (err?.status === 401) {
            clearStoredSession();
            setCurrentUser(null);
            return;
          }
        }
      }
      const isVendor = currentUser?.peran === "Vendor";
      const [
        tenantsRes,
        menusRes,
        vendorTenantRes,
        vendorMenusRes,
        ordersRes,
        cartRes,
        notifRes,
        promosRes,
        vendorPromosRes,
      ] = await Promise.all([
        api.getTenants().catch(() => null),
        api.getMenus({ include_unavailable: true }).catch(() => null),
        isVendor ? api.getVendorTenant().catch(() => null) : Promise.resolve(null),
        isVendor ? api.getVendorMenus().catch(() => null) : Promise.resolve(null),
        isVendor
          ? api.getVendorOrders().catch(() => null)
          : api.getOrders().catch(() => null),
        !isVendor && currentUser ? api.getCart().catch(() => null) : Promise.resolve(null),
        currentUser ? api.getNotifications().catch(() => null) : Promise.resolve(null),
        api.getPromos().catch(() => null),
        isVendor ? api.getVendorPromos().catch(() => null) : Promise.resolve(null),
      ]);

      if (tenantsRes?.data) {
        setTenantsList(
          tenantsRes.data.map((t) => ({
            ...t,
            tagline: t.deskripsi || t.tagline || "",
            gambar: t.gambar || t.logo || t.user?.avatar || "",
            jam_buka: t.jam_buka || "07:00",
            jam_tutup: t.jam_tutup || "21:00",
            auto_schedule: Boolean(t.auto_schedule),
            status_buka_efektif:
              t.status_buka_efektif !== undefined
                ? Boolean(t.status_buka_efektif)
                : isTenantOpenAt(t),
          }))
        );
      }
      if (Array.isArray(promosRes?.data)) {
        setPublicPromos(promosRes.data);
      }
      if (Array.isArray(vendorPromosRes?.data)) {
        setVendorPromos(vendorPromosRes.data);
      }
      const myTenant =
        vendorTenantRes?.data ||
        tenantsRes?.data?.find((t) => t.id_user === currentUser?.id_user) ||
        null;
      if (myTenant) {
        setMyTenantInfo(myTenant);
        setIsStoreOpen(Boolean(myTenant.status_buka ?? true));
      }

      const normalizedMenus = menusRes?.data ? menusRes.data.map(normalizeMenuRecord) : null;
      if (normalizedMenus) {
        setMenusList(normalizedMenus);
      }

      const normalizedVendorMenus = vendorMenusRes?.data
        ? vendorMenusRes.data.map(normalizeMenuRecord)
        : null;
      if (normalizedVendorMenus) {
        setTenantMenus(normalizedVendorMenus);
      }

      if (cartRes?.data?.items) {
        setCartItems(
          cartRes.data.items.map((ci) => ({
            ...ci,
            id_item_keranjang: ci.id_item_keranjang || ci.id_menu,
            id_menu: Number(ci.id_menu),
            id_tenant: Number(ci.id_tenant || ci.menu?.id_tenant || 0),
            tenant_name:
              ci.tenant_name || ci.nama_tenant || ci.menu?.tenant?.nama_tenant || "Kantin",
            harga: Number(ci.harga || 0),
            jumlah: Number(ci.jumlah || 1),
          }))
        );
      }

      if (notifRes?.data) {
        setNotificationsList(notifRes.data);
      }

      if (ordersRes?.data) {
        if (!isVendor && activeOrderId) {
          const live = ordersRes.data.find(
            (o) => Number(o.id_pesanan) === Number(activeOrderId)
          );
          if (live) {
            const firstItem = live.details?.[0]?.nama_menu || "Pesanan Kantin";
            const extra =
              (live.details?.length || 0) > 1
                ? ` + ${live.details.length - 1} more`
                : "";
            setActiveOrder((prev) => ({
              ...(prev || {}),
              ...live,
              items_summary: `${firstItem}${extra}`,
              tenant_name:
                live.tenant?.nama_tenant || prev?.tenant_name || "Kantin",
              booth: live.tenant?.booth || prev?.booth || "",
            }));
          }
        }
        const statusMap = {
          "Menunggu Pembayaran": "Awaiting payment",
          "Sedang Diproses": "Preparing",
          Diproses: "Preparing",
          "Siap Diambil": "Ready for pickup",
          Selesai: "Completed",
          Dibatalkan: "Cancelled",
        };
        const mappedHistory = ordersRes.data.map((o) => {
          const detailsList = o.details || o.order_details || [];
          const firstItem = detailsList[0]?.nama_menu || "Pesanan Kantin";
          const extra =
            detailsList.length > 1 ? ` + ${detailsList.length - 1} more` : "";
          const itemsBreakdown = detailsList
            .map((d) => `${d.jumlah || 1}x ${d.nama_menu || "Menu"}`)
            .join(", ");
          return {
            id_pesanan: o.id_pesanan,
            nomor_antrean: o.nomor_antrean,
            items_summary: `${firstItem}${extra}`,
            items_breakdown: itemsBreakdown || firstItem,
            tenant_name: o.tenant?.nama_tenant || "Kantin",
            booth: o.tenant?.booth || "",
            user_name: o.user_name || o.user?.nama || o.user?.username || "Pelanggan",
            tanggal: o.waktu_pesan ? o.waktu_pesan.slice(0, 16) : "Baru saja",
            jam: o.waktu_pesan ? o.waktu_pesan.slice(11, 16) : "",
            total: Number(o.total_harga || 0),
            total_harga: Number(o.total_harga || 0),
            catatan: o.catatan || "",
            alasan_batal: o.alasan_batal || "",
            promo_code: o.promo_code || null,
            has_reviewed: Boolean(o.has_reviewed || (Array.isArray(o.reviews) && o.reviews.length > 0)),
            reviews: Array.isArray(o.reviews) ? o.reviews : [],
            status: statusMap[o.status_pesanan] || "Preparing",
            status_pesanan: o.status_pesanan,
            raw_status: o.status_pesanan,
            details: detailsList,
          };
        });
        setOrdersHistory(mappedHistory);

        const todayKey = getLocalDateKey(new Date());
        const yDate = new Date();
        yDate.setDate(yDate.getDate() - 1);
        const yesterdayKey = getLocalDateKey(yDate);

        const nonCancelled = (list) => list.filter((o) => o.status_pesanan !== "Dibatalkan");
        const isRevOrder = (o) =>
          ["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"].includes(o.status_pesanan);

        const ordersTodayList = nonCancelled(
          ordersRes.data.filter((o) => String(o.waktu_pesan || "").startsWith(todayKey))
        );
        const ordersYestList = nonCancelled(
          ordersRes.data.filter((o) => String(o.waktu_pesan || "").startsWith(yesterdayKey))
        );

        const revToday = ordersTodayList
          .filter(isRevOrder)
          .reduce((sum, o) => sum + Number(o.total_harga || 0), 0);
        const revYest = ordersYestList
          .filter(isRevOrder)
          .reduce((sum, o) => sum + Number(o.total_harga || 0), 0);

        const sourceMenus = normalizedVendorMenus || normalizedMenus || [];
        const prepValuesToday = ordersTodayList.flatMap((o) =>
          (o.details || o.order_details || []).map((d) => {
            const m = sourceMenus.find((x) => Number(x.id_menu) === Number(d.id_menu));
            return Number(d.estimasi_menit || d.menu?.estimasi_menit || m?.estimasi_menit || 0);
          })
        ).filter((n) => n > 0);
        const baselinePreps = sourceMenus.map((m) => Number(m.estimasi_menit || 0)).filter((n) => n > 0);
        const avgPrepToday = prepValuesToday.length
          ? Math.round(prepValuesToday.reduce((a, b) => a + b, 0) / prepValuesToday.length)
          : baselinePreps.length
          ? Math.round(baselinePreps.reduce((a, b) => a + b, 0) / baselinePreps.length)
          : 0;
        const avgBaselinePrep = baselinePreps.length
          ? Math.round(baselinePreps.reduce((a, b) => a + b, 0) / baselinePreps.length)
          : avgPrepToday;
        const prepDiff = avgPrepToday - avgBaselinePrep;

        setOrdersTodayCount(ordersTodayList.length);
        setRevenueTodayTotal(revToday);
        setKpiStats({
          ordersDelta: formatPercentDelta(ordersTodayList.length, ordersYestList.length),
          revenueDelta: formatPercentDelta(revToday, revYest),
          avgPrepText: avgPrepToday > 0 ? `${avgPrepToday} min` : "—",
          prepDelta:
            avgPrepToday === 0
              ? "—"
              : prepDiff === 0
              ? "On track"
              : `${prepDiff > 0 ? "+" : ""}${prepDiff} min`,
        });

        const sellerMap = new Map();
        for (const ord of ordersTodayList) {
          for (const d of ord.details || ord.order_details || []) {
            const idM = Number(d.id_menu);
            if (!idM) continue;
            const qty = Number(d.jumlah || 1);
            const sub = Number(d.subtotal ?? Number(d.harga || d.menu?.harga || 0) * qty);
            const catalogItem = sourceMenus.find((m) => Number(m.id_menu) === idM);
            const existing = sellerMap.get(idM) || {
              id_menu: idM,
              nama_menu: d.nama_menu || d.menu?.nama_menu || catalogItem?.nama_menu || "Menu",
              gambar: d.gambar || d.menu?.gambar || catalogItem?.gambar || "",
              harga: Number(d.harga || d.menu?.harga || catalogItem?.harga || 0),
              sold_today: 0,
              revenue: 0,
            };
            existing.sold_today += qty;
            existing.revenue += sub;
            sellerMap.set(idM, existing);
          }
        }
        setTopSellersToday(
          Array.from(sellerMap.values())
            .sort((a, b) => b.sold_today - a.sold_today || b.revenue - a.revenue)
            .slice(0, 5)
        );

        const activeQueue = ordersRes.data
          .filter((o) =>
            ["Menunggu Pembayaran", "Sedang Diproses", "Diproses", "Siap Diambil"].includes(
              o.status_pesanan
            )
          )
          .map((o) => {
            const dList = o.details || o.order_details || [];
            return {
              id: o.id_pesanan,
              code: o.nomor_antrean,
              item_name: dList[0]?.nama_menu || "Pesanan",
              items_breakdown: dList
                .map((d) => `${d.jumlah || 1}x ${d.nama_menu || "Menu"}`)
                .join(", "),
              user_name: o.user_name || o.user?.nama || o.user?.username || "Pelanggan",
              items_count: dList.reduce((s, d) => s + (d.jumlah || 1), 0) || 1,
              total: Number(o.total_harga || 0),
              catatan: o.catatan || "",
              promo_code: o.promo_code || null,
              status_pesanan: o.status_pesanan,
              status:
                o.status_pesanan === "Menunggu Pembayaran"
                  ? "Awaiting payment"
                  : o.status_pesanan === "Siap Diambil"
                  ? "Ready for pickup"
                  : "Preparing",
            };
          });
        setIncomingOrders(activeQueue);
      }
    } catch {
      // Keep current state when offline
    }
  }, [currentUser, activeOrderId]);

  useEffect(() => {
    syncFromApi();
  }, [syncFromApi]);

  useEffect(() => {
    if (!currentUser) return;
    const pollId = setInterval(() => {
      syncFromApi();
    }, 6000);
    return () => clearInterval(pollId);
  }, [currentUser, syncFromApi]);

  useEffect(() => {
    const tick = setInterval(() => {
      setLiveClock(new Date());
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);
    try {
      if (authMode === "forgot") {
        if (forgotStep === 1) {
          const res = await api.forgotPassword({
            login: authForm.username,
          });
          setForgotStep(2);
          setAuthSuccess(
            res?.message ||
              "Kode verifikasi 6 digit telah diterbitkan oleh server. Silakan masukkan kode beserta password baru Anda."
          );
        } else {
          const res = await api.resetPassword({
            login: authForm.username,
            reset_token: authForm.reset_token,
            new_password: authForm.new_password,
          });
          setAuthSuccess(
            res?.message ||
              "Password berhasil diperbarui! Silakan login dengan password baru Anda."
          );
          setForgotStep(1);
          setAuthMode("login");
          setAuthForm((prev) => ({
            ...prev,
            password: prev.new_password,
            new_password: "",
            reset_token: "",
          }));
        }
      } else if (authMode === "login") {
        const res = await api.login({
          login: authForm.username,
          password: authForm.password,
          peran: loginRoleTab,
        });
        const user = res?.data?.user;
        const token = res?.data?.access_token || res?.data?.token;
        setStoredSession(token, user);
        setCurrentUser(user);
        setIsAuthOpen(false);
        setAuthForm({
          username: "",
          nama: "",
          password: "",
          email: "",
          nama_tenant: "",
          new_password: "",
        });
        if (user?.peran === "Vendor") {
          setTenantNavTab("dashboard");
        } else {
          setNavTab("home");
        }
      } else {
        await api.register({
          username: authForm.username,
          nama: authForm.nama || authForm.username,
          email: authForm.email,
          password: authForm.password,
          peran: loginRoleTab,
          nama_tenant: authForm.nama_tenant || authForm.username,
        });
        setAuthForm({
          username: "",
          nama: "",
          password: "",
          email: "",
          nama_tenant: "",
          new_password: "",
        });
        setAuthMode("login");
        setAuthSuccess(
          "Pendaftaran berhasil! Silakan login menggunakan username dan password Anda."
        );
      }
    } catch (err) {
      setAuthError(err.message || "Gagal memproses autentikasi.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setAuthError("");
    setAuthSuccess("");
    localStorage.setItem("letsorder_pending_role", loginRoleTab);
    const activeClientId = (googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

    if (!activeClientId || !activeClientId.includes(".apps.googleusercontent.com")) {
      setAuthError(
        "Google OAuth Client ID (VITE_GOOGLE_CLIENT_ID / GOOGLE_CLIENT_ID) belum diisi di file .env."
      );
      return;
    }

    if (window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: "openid email profile",
        prompt: "select_account",
        callback: async (tokenResponse) => {
          if (tokenResponse?.error || !tokenResponse?.access_token) {
            setAuthError(tokenResponse?.error_description || "Login Google dibatalkan.");
            return;
          }
          setAuthLoading(true);
          try {
            const res = await api.googleLogin({
              access_token: tokenResponse.access_token,
              peran: loginRoleTab,
            });
            const user = res?.data?.user;
            const token = res?.data?.access_token || res?.data?.token;
            setStoredSession(token, user);
            setCurrentUser(user);
            setIsAuthOpen(false);
            if (user?.peran === "Vendor") {
              setTenantNavTab("dashboard");
            } else {
              setNavTab("home");
            }
          } catch (err) {
            setAuthError(err.message || "Login dengan Google gagal.");
          } finally {
            setAuthLoading(false);
          }
        },
      });
      tokenClient.requestAccessToken();
      return;
    }

    window.location.href = api.getGoogleRedirectUrl(loginRoleTab, activeClientId);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear local session regardless of network response
    }
    clearStoredSession();
    setCurrentUser(null);
    setCartItems([]);
    setIncomingOrders([]);
    setTenantMenus([]);
    setOrdersHistory([]);
    setAuthForm({
      username: "",
      nama: "",
      password: "",
      email: "",
      nama_tenant: "",
      new_password: "",
    });
    closeDrawer();
  };

  const navContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [pillStyle, setPillStyle] = useState({ left: 0, top: 4, width: 0, height: 0, ready: false });
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  const activeNavKey = portalMode === "tenant" ? `t_${tenantNavTab}` : navTab;

  const updatePill = useCallback(() => {
    const el = tabRefs.current[activeNavKey];
    const container = navContainerRef.current;
    if (el && container && el.offsetWidth > 0) {
      setPillStyle({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        ready: true,
      });
    }
  }, [activeNavKey]);

  useLayoutEffect(() => {
    updatePill();
    const rafId = requestAnimationFrame(updatePill);
    const timerId = setTimeout(updatePill, 60);
    const handleResize = () => updatePill();
    window.addEventListener("resize", handleResize);

    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updatePill());
      if (navContainerRef.current) observer.observe(navContainerRef.current);
      if (tabRefs.current[activeNavKey]) observer.observe(tabRefs.current[activeNavKey]);
    }
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => updatePill()).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [updatePill, activeNavKey, portalMode, currentUser, lang, cartItems]);

  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHeroPaused, heroSlides.length]);

  useEffect(() => {
    let interval = null;
    if (navTab === "orders" && checkoutStep === 2 && paymentTimerSeconds > 0) {
      interval = setInterval(() => {
        setPaymentTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [navTab, checkoutStep, paymentTimerSeconds]);

  useEffect(() => {
    let interval = null;
    if (navTab === "orders" && checkoutStep === 3 && prepTimerSeconds > 0) {
      interval = setInterval(() => {
        setPrepTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [navTab, checkoutStep, prepTimerSeconds]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.harga * item.jumlah, 0);
  }, [cartItems]);

  const cartTenantId = useMemo(() => {
    if (cartItems.length === 0) return null;
    const first = cartItems[0];
    return (
      Number(first.id_tenant || 0) ||
      Number(menusList.find((m) => Number(m.id_menu) === Number(first.id_menu))?.id_tenant || 0) ||
      null
    );
  }, [cartItems, menusList]);

  const availablePromos = useMemo(() => {
    const normalizedCustom = (publicPromos || [])
      .filter((p) => Boolean(p.aktif) && (!p.id_tenant || !cartTenantId || Number(p.id_tenant) === Number(cartTenantId)))
      .map((p) => {
        const minSpend = Number(p.minimal_belanja || 0);
        const disc = Number(p.diskon || 0);
        const isPct = p.tipe === "percentage";
        const discText = isPct ? `${disc}%` : formatRupiah(disc);
        return {
          id_promo: p.id_promo,
          id_tenant: p.id_tenant,
          code: String(p.kode_promo || "").toUpperCase(),
          title: p.judul || `Diskon ${discText}`,
          subtitle: `${String(p.kode_promo || "").toUpperCase()} · ${
            minSpend > 0 ? `Min. ${formatRupiah(minSpend)}` : "Tanpa min. belanja"
          }`,
          discount: isPct ? (disc > 1 ? disc / 100 : disc) : disc,
          minSpend,
          type: isPct ? "percentage" : "fixed",
          isTenantPromo: Boolean(p.id_tenant),
        };
      });
    return [...normalizedCustom, ...PROMOS];
  }, [publicPromos, cartTenantId]);

  useEffect(() => {
    if (selectedPromo?.id_tenant && cartTenantId && Number(selectedPromo.id_tenant) !== Number(cartTenantId)) {
      setSelectedPromo(null);
    }
  }, [selectedPromo, cartTenantId]);

  const promoDiscount = useMemo(() => {
    if (!selectedPromo || subtotal < Number(selectedPromo.minSpend || 0)) return 0;
    const disc = Number(selectedPromo.discount ?? selectedPromo.diskon ?? 0);
    if (selectedPromo.type === "percentage") {
      const pct = disc > 1 ? disc / 100 : disc;
      return Math.min(subtotal, Math.round(subtotal * pct));
    }
    return Math.min(subtotal, disc);
  }, [selectedPromo, subtotal]);

  const orderTotal = useMemo(() => {
    return Math.max(0, subtotal - promoDiscount);
  }, [subtotal, promoDiscount]);

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.jumlah, 0);
  }, [cartItems]);

  const normalizeCartPayload = useCallback(
    (items) =>
      (items || []).map((ci) => ({
        ...ci,
        id_item_keranjang: ci.id_item_keranjang || ci.id_menu,
        id_menu: Number(ci.id_menu),
        id_tenant: Number(ci.id_tenant || ci.menu?.id_tenant || 0),
        tenant_name:
          ci.tenant_name || ci.nama_tenant || ci.menu?.tenant?.nama_tenant || "Canteen Tenant",
        harga: Number(ci.harga || 0),
        jumlah: Number(ci.jumlah || 1),
      })),
    []
  );

  const handleAddToCart = async (item, qty = 1) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      notify(
        lang === "EN"
          ? "Please sign in first to add items to your cart."
          : "Silakan login terlebih dahulu untuk memesan.",
        "error"
      );
      return false;
    }

    const itemTenantId = Number(item.id_tenant || 0);
    const existingTenantId = Number(
      cartItems[0]?.id_tenant ||
        menusList.find((m) => m.id_menu === cartItems[0]?.id_menu)?.id_tenant ||
        0
    );
    if (cartItems.length > 0 && itemTenantId && existingTenantId && itemTenantId !== existingTenantId) {
      notify(
        lang === "EN"
          ? "Your cart contains items from another tenant. Clear your cart first to switch."
          : "Keranjang sudah berisi menu dari tenant lain. Kosongkan keranjang dahulu untuk ganti tenant.",
        "error"
      );
      return false;
    }

    try {
      await api.addCartItem({ id_menu: item.id_menu, jumlah: qty });
      const freshCart = await api.getCart().catch(() => null);
      if (freshCart?.data?.items) {
        setCartItems(normalizeCartPayload(freshCart.data.items));
      } else {
        setCartItems((prev) => {
          const idx = prev.findIndex((i) => i.id_menu === item.id_menu);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], jumlah: copy[idx].jumlah + qty };
            return copy;
          }
          return [
            ...prev,
            {
              id_menu: item.id_menu,
              id_tenant: item.id_tenant,
              nama_menu: item.nama_menu,
              tenant_name: item.tenant_name,
              harga: item.harga,
              jumlah: qty,
              gambar: item.gambar,
            },
          ];
        });
      }
      setCheckoutError("");
      notify(
        lang === "EN"
          ? `Added ${item.nama_menu} to cart`
          : `${item.nama_menu} ditambahkan ke keranjang`,
        "success"
      );
      return true;
    } catch (err) {
      notify(err?.message || "Failed to add item to cart.", "error");
      return false;
    }
  };

  const handleUpdateQty = async (id_menu, delta) => {
    const existing = cartItems.find((i) => i.id_menu === id_menu);
    if (!existing) return;
    const cartTargetId = existing.id_item_keranjang || id_menu;
    const next = existing.jumlah + delta;

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id_menu !== id_menu) return item;
          return next > 0 ? { ...item, jumlah: next } : null;
        })
        .filter(Boolean)
    );

    try {
      if (next > 0) {
        await api.updateCartItem(cartTargetId, { jumlah: next });
      } else {
        await api.deleteCartItem(cartTargetId);
      }
    } catch (err) {
      notify(err?.message || "Failed to update cart.", "error");
      await syncFromApi();
    }
  };

  const handleRemoveItem = async (id_menu) => {
    const existing = cartItems.find((i) => i.id_menu === id_menu);
    const cartTargetId = existing?.id_item_keranjang || id_menu;
    setCartItems((prev) => prev.filter((item) => item.id_menu !== id_menu));
    try {
      await api.deleteCartItem(cartTargetId);
    } catch (err) {
      notify(err?.message || "Failed to remove item.", "error");
      await syncFromApi();
    }
  };

  const handleClearCart = async () => {
    setCartItems([]);
    setCheckoutError("");
    try {
      await api.clearCart();
      notify(lang === "EN" ? "Cart cleared" : "Keranjang dikosongkan", "info");
    } catch {
      // Keep cleared client state when empty
    }
  };

  const handleCompletePayment = async () => {
    const resumingExistingOrder = Boolean(activeOrder?.id_pesanan && cartItems.length === 0);
    if (!resumingExistingOrder && cartItems.length === 0) {
      setCheckoutError(
        lang === "EN" ? "Your cart is empty." : "Keranjang belanja kosong."
      );
      return;
    }
    setCheckoutError("");
    setIsPaying(true);

    const summarySnapshot = resumingExistingOrder
      ? activeOrder.items_summary || "Campus Meal Order"
      : cartItems.length > 0
      ? `${cartItems[0].nama_menu}${cartItems.length > 1 ? ` + ${cartItems.length - 1} more` : ""}`
      : "Campus Meal Order";
    const tenantSnapshot = resumingExistingOrder
      ? activeOrder.tenant_name || "Canteen Tenant"
      : cartItems[0]?.tenant_name || "Canteen Tenant";
    const totalSnapshot = resumingExistingOrder
      ? Number(activeOrder.total_harga ?? activeOrder.total ?? 0)
      : orderTotal;

    try {
      let createdOrder = resumingExistingOrder ? activeOrder : null;
      let oid = createdOrder?.id_pesanan;

      if (!resumingExistingOrder) {
        // Ensure DB cart has any local-only items before Laravel OrderController::store reads it
        const unsynced = cartItems.filter((ci) => !ci.id_item_keranjang);
        if (unsynced.length > 0) {
          for (const u of unsynced) {
            await api.addCartItem({ id_menu: u.id_menu, jumlah: u.jumlah });
          }
        }

        const created = await api.createOrder({
          items: cartItems,
          promo_code: selectedPromo?.code || null,
          catatan: orderNote.trim(),
        });
        createdOrder = created?.data;
        oid = createdOrder?.id_pesanan;

        if (oid) {
          // Record the newly created order immediately so retrying a failed payment
          // resumes this order instead of submitting duplicate orders.
          setActiveOrderId(oid);
          setActiveOrder({
            ...createdOrder,
            id_pesanan: oid,
            nomor_antrean: createdOrder.nomor_antrean || `A-${oid}`,
            items_summary: summarySnapshot,
            tenant_name: createdOrder.tenant?.nama_tenant || tenantSnapshot,
            booth: createdOrder.tenant?.booth || "",
            total_harga: Number(createdOrder.total_harga ?? totalSnapshot),
          });
          setActiveQueueCode(createdOrder.nomor_antrean || `A-${oid}`);
          setCartItems([]);
          setOrderNote("");
          setSelectedPromo(null);
        }
      }

      if (!oid) {
        throw new Error(
          lang === "EN"
            ? "Order could not be created."
            : "Pesanan gagal dibuat."
        );
      }

      try {
        await api.createPayment(oid, { metode_pembayaran: "QRIS" });
      } catch (payErr) {
        if (payErr?.status !== 409) throw payErr;
      }

      let verifiedOrder = createdOrder;
      let awaitingTenantConfirm = false;
      try {
        const verifRes = await api.verifyPaymentByOrder(oid, "Terverifikasi");
        if (verifRes?.data?.id_pesanan) {
          verifiedOrder = verifRes.data;
        } else if (verifRes?.data?.order) {
          verifiedOrder = verifRes.data.order;
        } else {
          verifiedOrder = { ...createdOrder, status_pesanan: "Sedang Diproses" };
        }
      } catch (verifErr) {
        if (verifErr?.status === 403) {
          awaitingTenantConfirm = true;
        } else {
          throw verifErr;
        }
      }

      const orderSummaryObj = {
        ...verifiedOrder,
        id_pesanan: oid,
        nomor_antrean: verifiedOrder.nomor_antrean || createdOrder.nomor_antrean || `A-${oid}`,
        items_summary: summarySnapshot,
        tenant_name: verifiedOrder.tenant?.nama_tenant || tenantSnapshot,
        booth: verifiedOrder.tenant?.booth || createdOrder?.booth || "",
        total_harga: Number(verifiedOrder.total_harga ?? totalSnapshot),
        status_pesanan: awaitingTenantConfirm
          ? "Menunggu Pembayaran"
          : verifiedOrder.status_pesanan || "Sedang Diproses",
      };

      setActiveOrder(orderSummaryObj);
      setActiveOrderId(oid);
      setActiveQueueCode(orderSummaryObj.nomor_antrean);
      setCartItems([]);
      setPrepTimerSeconds(525);
      setCheckoutStep(3);
      notify(
        awaitingTenantConfirm
          ? lang === "EN"
            ? `Order #${orderSummaryObj.nomor_antrean} created! Show QRIS proof at the counter.`
            : `Pesanan #${orderSummaryObj.nomor_antrean} dibuat! Tunjukkan bukti ke kasir tenant.`
          : lang === "EN"
          ? `Payment verified! Queue #${orderSummaryObj.nomor_antrean}`
          : `Pembayaran berhasil! Nomor antrean #${orderSummaryObj.nomor_antrean}`,
        "success"
      );
      await syncFromApi();
    } catch (err) {
      const msg =
        err?.message ||
        (lang === "EN"
          ? "Failed to submit order. Please try again."
          : "Gagal memproses pesanan. Silakan coba lagi.");
      setCheckoutError(msg);
      notify(msg, "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handleResumeOrder = (order) => {
    if (!order?.id_pesanan) return;
    setActiveOrder({
      ...order,
      total_harga: Number(order.total_harga ?? order.total ?? 0),
      status_pesanan: order.raw_status || order.status_pesanan || "Sedang Diproses",
    });
    setActiveOrderId(order.id_pesanan);
    setActiveQueueCode(order.nomor_antrean || `A-${order.id_pesanan}`);
    setCheckoutError("");
    setCheckoutStep(
      order.status === "Awaiting payment" || order.raw_status === "Menunggu Pembayaran"
        ? 2
        : 3
    );
    setNavTab("orders");
  };

  const handleOpenCancelModal = (orderObj) => {
    if (!orderObj) return;
    const oid = orderObj.id_pesanan || orderObj.id;
    const code = orderObj.nomor_antrean || orderObj.code || `#${oid}`;
    setCancelReason("");
    setCancelTarget({ id: oid, code });
  };

  const handleConfirmCancelOrder = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!cancelTarget?.id) return;
    try {
      await api.cancelOrder(cancelTarget.id, cancelReason.trim());
      notify(
        lang === "EN"
          ? `Order ${cancelTarget.code} cancelled.`
          : `Pesanan ${cancelTarget.code} berhasil dibatalkan.`,
        "info"
      );
      if (Number(activeOrderId) === Number(cancelTarget.id)) {
        setActiveOrderId(null);
        setActiveOrder(null);
        setCheckoutStep(1);
        setNavTab("history");
      }
      setCancelTarget(null);
      setCancelReason("");
      await syncFromApi();
    } catch (err) {
      notify(err?.message || "Gagal membatalkan pesanan.", "error");
    }
  };

  const handleOpenReviewModal = (order) => {
    if (!order?.id_pesanan) return;
    setReviewTarget(order);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTarget?.id_pesanan) return;
    setReviewError("");
    try {
      await api.submitOrderReview(reviewTarget.id_pesanan, {
        rating: reviewRating,
        komentar: reviewComment.trim(),
      });
      notify(
        lang === "EN" ? "Thank you for your rating & review!" : "Terima kasih atas rating & ulasan Anda!",
        "success"
      );
      setReviewTarget(null);
      await syncFromApi();
    } catch (err) {
      setReviewError(err?.message || "Gagal menyimpan ulasan.");
    }
  };

  const openStoreSettingsModal = () => {
    setStoreSettingsError("");
    setStoreForm({
      nama_tenant: myTenantInfo?.nama_tenant || displayName || "",
      deskripsi: myTenantInfo?.deskripsi || "",
      booth: myTenantInfo?.booth || "",
      logo: myTenantInfo?.logo || myTenantInfo?.gambar || "",
      jam_buka: myTenantInfo?.jam_buka || "07:00",
      jam_tutup: myTenantInfo?.jam_tutup || "21:00",
      auto_schedule: Boolean(myTenantInfo?.auto_schedule),
      status_buka: Boolean(myTenantInfo?.status_buka ?? isStoreOpen),
    });
    setIsStoreSettingsOpen(true);
  };

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setStoreSettingsError("");
    try {
      const res = await api.updateVendorTenant({
        nama_tenant: storeForm.nama_tenant.trim(),
        deskripsi: storeForm.deskripsi.trim(),
        booth: storeForm.booth.trim(),
        logo: storeForm.logo,
        gambar: storeForm.logo,
        jam_buka: storeForm.jam_buka,
        jam_tutup: storeForm.jam_tutup,
        auto_schedule: Boolean(storeForm.auto_schedule),
        status_buka: Boolean(storeForm.status_buka),
      });
      if (res?.data) {
        setMyTenantInfo(res.data);
        setIsStoreOpen(Boolean(res.data.status_buka ?? storeForm.status_buka));
      }
      setIsStoreSettingsOpen(false);
      notify(
        lang === "EN" ? "Store settings updated!" : "Pengaturan kantin berhasil disimpan!",
        "success"
      );
      await syncFromApi();
    } catch (err) {
      setStoreSettingsError(err?.message || "Gagal menyimpan pengaturan kantin.");
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    setPromoFormError("");
    try {
      await api.createVendorPromo({
        kode_promo: promoForm.kode_promo.trim().toUpperCase(),
        judul: promoForm.judul.trim(),
        tipe: promoForm.tipe,
        diskon: Number(String(promoForm.diskon || "0").replace(/\D/g, "")),
        minimal_belanja: Number(String(promoForm.minimal_belanja || "0").replace(/\D/g, "")),
        aktif: true,
      });
      setIsPromoModalOpen(false);
      setPromoForm({ kode_promo: "", judul: "", tipe: "fixed", diskon: "", minimal_belanja: "0" });
      notify(
        lang === "EN" ? "Tenant promo created!" : "Promo khusus tenant berhasil dibuat!",
        "success"
      );
      await syncFromApi();
    } catch (err) {
      setPromoFormError(err?.message || "Gagal membuat promo.");
    }
  };

  const handleTogglePromo = async (promo) => {
    try {
      await api.updateVendorPromo(promo.id_promo, { aktif: !promo.aktif });
      await syncFromApi();
    } catch (err) {
      notify(err?.message || "Gagal mengubah status promo.", "error");
    }
  };

  const handleDeletePromo = async (promoId) => {
    try {
      await api.deleteVendorPromo(promoId);
      notify(lang === "EN" ? "Promo deleted" : "Promo dihapus", "info");
      await syncFromApi();
    } catch (err) {
      notify(err?.message || "Gagal menghapus promo.", "error");
    }
  };

  const handleFinishOrder = async () => {
    setActiveOrderId(null);
    setActiveOrder(null);
    setCheckoutError("");
    setCheckoutStep(1);
    setNavTab("history");
    await syncFromApi();
  };

  const handleVendorAdvanceOrder = async (orderId, nextStatus, verifyPaymentFirst = false) => {
    try {
      if (verifyPaymentFirst) {
        await api.verifyPaymentByOrder(orderId, "Terverifikasi");
        notify(
          lang === "EN" ? "QRIS payment verified" : "Pembayaran QRIS terverifikasi",
          "success"
        );
      } else {
        await api.updateOrderStatus(orderId, nextStatus);
        notify(
          lang === "EN"
            ? `Order status updated to ${nextStatus}`
            : `Status pesanan diperbarui ke ${nextStatus}`,
          "success"
        );
      }
      await syncFromApi();
    } catch (err) {
      notify(err?.message || "Failed to update order status.", "error");
      await syncFromApi();
    }
  };

  const handleReorder = async (order) => {
    if (!order?.details || order.details.length === 0) {
      notify(
        lang === "EN"
          ? "No menu details available to reorder."
          : "Detail menu tidak tersedia untuk dipesan ulang.",
        "error"
      );
      return;
    }
    try {
      if (cartItems.length > 0) {
        await api.clearCart().catch(() => {});
      }
      let addedCount = 0;
      for (const d of order.details) {
        try {
          await api.addCartItem({ id_menu: d.id_menu, jumlah: d.jumlah || 1 });
          addedCount += 1;
        } catch {
          // Skip unavailable items
        }
      }
      await syncFromApi();
      setCheckoutStep(1);
      setCheckoutError("");
      setNavTab("orders");
      notify(
        addedCount > 0
          ? lang === "EN"
            ? "Items added back to your cart!"
            : "Menu berhasil dimasukkan ke keranjang!"
          : lang === "EN"
          ? "Selected menu items are currently unavailable."
          : "Menu pada pesanan tersebut sedang tidak tersedia.",
        addedCount > 0 ? "success" : "error"
      );
    } catch (err) {
      notify(err?.message || "Failed to reorder items.", "error");
    }
  };

  const filteredMenus = useMemo(() => {
    return menusList.filter((item) => {
      if (item.available === false) return false;
      const matchSearch =
        searchQuery === "" ||
        item.nama_menu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tenant_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "All" || item.kategori_nama === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [menusList, searchQuery, selectedCategory]);

  const filteredTenants = useMemo(() => {
    return tenantsList.filter((t) => {
      return (
        searchQuery === "" ||
        t.nama_tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.tagline || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [tenantsList, searchQuery]);

  const tenantMenuItems = useMemo(() => {
    if (!activeTenantView) return [];
    const q = tenantMenuQuery.trim().toLowerCase();
    return menusList.filter(
      (m) =>
        m.id_tenant === activeTenantView.id_tenant &&
        m.available !== false &&
        (!q || m.nama_menu.toLowerCase().includes(q))
    );
  }, [menusList, activeTenantView, tenantMenuQuery]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-page)", color: "var(--maroon)" }}>
      {currentUser && (
        <>
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              backgroundColor: "#FFFFFF",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
        <div className="container-app header-inner">
          <div className="header-left">
            <button
              onClick={openDrawer}
              className="btn-interactive"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 6,
                color: "var(--maroon)",
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                flexShrink: 0,
              }}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={2.4} />
            </button>

            <div
              onClick={() => {
                if (portalMode === "tenant") {
                  setTenantNavTab("dashboard");
                } else {
                  setNavTab("home");
                  setActiveTenantView(null);
                  setSelectedCategory("All");
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                userSelect: "none",
                minWidth: 0,
              }}
            >
              <svg width="38" height="38" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="50" cy="50" r="46" stroke="#D49354" strokeWidth="3" />
                <circle cx="50" cy="50" r="41" stroke="#E5B888" strokeWidth="1.5" />
                <path
                  d="M33 26V40C33 44 36 46 39 46V74H43V46C46 46 49 44 49 40V26H46V38H44V26H38V38H36V26H33Z"
                  fill="#522A28"
                />
                <path
                  d="M51 32L78 50L51 68V32Z"
                  fill="#F8A34B"
                  stroke="#522A28"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              </svg>

              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--maroon)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Let's Order
                </div>
                <div
                  className="header-subtitle"
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {portalMode === "tenant" ? t.subtitleTenant : t.subtitleCustomer}
                </div>
              </div>
            </div>
          </div>

          <nav
            ref={navContainerRef}
            className="desktop-top-nav"
          >
            {pillStyle.ready && (
              <div
                style={{
                  position: "absolute",
                  left: pillStyle.left,
                  top: pillStyle.top !== undefined ? pillStyle.top : 4,
                  width: pillStyle.width,
                  height: pillStyle.height || 38,
                  boxSizing: "border-box",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--bg-cream)",
                  border:
                    portalMode === "tenant"
                      ? "1px solid #EFE3D8"
                      : "1.5px solid var(--maroon)",
                  transition: "left 0.32s cubic-bezier(0.22, 1, 0.36, 1), width 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
                  pointerEvents: "none",
                  zIndex: 1,
                  boxShadow:
                    portalMode === "tenant"
                      ? "none"
                      : "0 2px 6px rgba(82, 42, 40, 0.08)",
                }}
              />
            )}

            {(portalMode === "tenant"
              ? [
                  { id: "t_dashboard", tab: "dashboard", label: t.navDashboard },
                  { id: "t_menu", tab: "menu", label: t.navMenu },
                  { id: "t_orders", tab: "orders", label: t.navOrders },
                  { id: "t_history", tab: "history", label: t.navHistory },
                ]
              : [
                  { id: "home", tab: "home", label: t.navHome },
                  { id: "tenant", tab: "tenant", label: t.navTenant },
                  {
                    id: "orders",
                    tab: "orders",
                    label: t.navOrders,
                    badge: totalCartCount > 0 ? totalCartCount : null,
                  },
                  { id: "history", tab: "history", label: t.navHistory },
                ]
            ).map((tab) => {
              const active =
                portalMode === "tenant"
                  ? tenantNavTab === tab.tab
                  : navTab === tab.tab;
              return (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  className="nav-tab-btn"
                  onClick={() => {
                    if (portalMode === "tenant") {
                      setTenantNavTab(tab.tab);
                    } else {
                      setNavTab(tab.tab);
                      setActiveTenantView(null);
                      closeFoodDetail();
                    }
                  }}
                  style={{
                    fontWeight: active ? 800 : 500,
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      key={tab.badge}
                      className="badge-pop"
                      style={{
                        padding: "1px 7px",
                        borderRadius: 999,
                        backgroundColor: "var(--orange)",
                        color: "#FFFFFF",
                        fontSize: 11,
                        fontWeight: 700,
                        boxShadow: "0 2px 6px rgba(248, 163, 75, 0.4)",
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="header-right">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isLangMenuOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 6,
                  minWidth: 74,
                  padding: "7px 12px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--maroon)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Globe size={15} color="var(--text-muted)" />
                <span>{lang}</span>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>▼</span>
              </button>

              {isLangMenuOpen && (
                <>
                  <div
                    onClick={() => setIsLangMenuOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 199 }}
                  />
                  <div
                    role="listbox"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: 168,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid var(--border-light)",
                      borderRadius: 14,
                      boxShadow: "0 12px 30px rgba(82, 42, 40, 0.14)",
                      padding: 6,
                      zIndex: 200,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {[
                      { code: "ID", label: "Indonesia (ID)" },
                      { code: "EN", label: "English (EN)" },
                    ].map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => changeLanguage(item.code)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "none",
                          backgroundColor: lang === item.code ? "var(--bg-cream)" : "transparent",
                          color: "var(--maroon)",
                          fontSize: 13,
                          fontWeight: lang === item.code ? 800 : 500,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span>{item.label}</span>
                        {lang === item.code && <Check size={14} color="var(--orange-dark)" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => openDrawerModal("profile")}
              className="btn-interactive btn-lift"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px 6px 8px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-light)",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                minWidth: 0,
              }}
              title={t.drawerProfile}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: portalMode === "tenant" ? "#EFE2D4" : "var(--bg-cream)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--maroon)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  displayInitials
                )}
              </div>
              <span className="header-profile-name">
                {displayName}
              </span>
            </button>
          </div>
        </div>
      </header>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {(portalMode === "tenant"
          ? [
              { id: "t_dashboard", tab: "dashboard", label: t.navDashboard, icon: TrendingUp },
              { id: "t_menu", tab: "menu", label: t.navMenu, icon: Store },
              {
                id: "t_orders",
                tab: "orders",
                label: t.navOrders,
                icon: Receipt,
                badge: incomingOrders.length > 0 ? incomingOrders.length : null,
              },
              { id: "t_history", tab: "history", label: t.navHistory, icon: Clock },
            ]
          : [
              { id: "home", tab: "home", label: t.navHome, icon: Store },
              { id: "tenant", tab: "tenant", label: t.navTenant, icon: MapPin },
              {
                id: "orders",
                tab: "orders",
                label: t.navOrders,
                icon: ShoppingBag,
                badge: totalCartCount > 0 ? totalCartCount : null,
              },
              { id: "history", tab: "history", label: t.navHistory, icon: Clock },
            ]
        ).map((tab) => {
          const active =
            portalMode === "tenant"
              ? tenantNavTab === tab.tab
              : navTab === tab.tab;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (portalMode === "tenant") {
                  setTenantNavTab(tab.tab);
                } else {
                  setNavTab(tab.tab);
                  setActiveTenantView(null);
                  closeFoodDetail();
                }
              }}
              style={{
                position: "relative",
                border: "none",
                backgroundColor: active ? "var(--bg-cream)" : "transparent",
                borderRadius: 14,
                padding: "8px 4px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                color: "var(--maroon)",
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <IconComp size={18} strokeWidth={active ? 2.5 : 2} />
                {tab.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -12,
                      padding: "1px 5px",
                      borderRadius: 999,
                      backgroundColor: "var(--orange)",
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 800 : 600 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <main className="main-content-area" style={{ paddingBottom: 60 }}>
        {portalMode === "tenant" && (
          <>
            {tenantNavTab === "dashboard" && (
              <div className="container-app animate-fade" style={{ paddingTop: 32 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: "var(--maroon)",
                        letterSpacing: "-0.02em",
                        marginBottom: 2,
                      }}
                    >
                      {t.navDashboard}
                    </h1>
                    <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                      {t.welcomeBack}, {displayName}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        const next = !isStoreOpen;
                        setIsStoreOpen(next);
                        api.updateVendorTenant({ status_buka: next }).then(() => syncFromApi()).catch(() => {});
                      }}
                      className="btn-interactive"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-light)",
                        backgroundColor: "#FFFFFF",
                        boxShadow: "var(--shadow-sm)",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: isTenantOpenAt(myTenantInfo || { status_buka: isStoreOpen }, liveClock)
                            ? "var(--orange)"
                            : "#9CA3AF",
                        }}
                      />
                      <span style={{ fontWeight: 800, color: "var(--maroon)" }}>
                        {isTenantOpenAt(myTenantInfo || { status_buka: isStoreOpen }, liveClock)
                          ? t.storeOpen
                          : t.storeClosed}
                      </span>
                      <span className="tabular" style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                        · {formatLiveClock(liveClock)} · {lang === "EN" ? "Until" : "s/d"}{" "}
                        {myTenantInfo?.jam_tutup || "21:00"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={openStoreSettingsModal}
                      className="btn-interactive"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "9px 16px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={13} />
                      <span>{lang === "EN" ? "Store Settings" : "Pengaturan Kantin"}</span>
                    </button>
                  </div>
                </div>
                <div
                  className="grid-kpi-4"
                  style={{
                    marginBottom: 26,
                  }}
                >
                  {[
                    {
                      label: t.kpiOrders,
                      value: String(ordersTodayCount),
                      badge: kpiStats.ordersDelta,
                      icon: Receipt,
                    },
                    {
                      label: t.kpiRevenue,
                      value: formatRupiah(revenueTodayTotal),
                      badge: kpiStats.revenueDelta,
                      icon: Banknote,
                    },
                    {
                      label: t.kpiQueue,
                      value: String(incomingOrders.length),
                      badge:
                        incomingOrders.length > 0
                          ? "Live"
                          : lang === "EN"
                          ? "Clear"
                          : "Kosong",
                      icon: Users,
                    },
                    {
                      label: t.kpiPrep,
                      value: kpiStats.avgPrepText,
                      badge: kpiStats.prepDelta,
                      icon: Timer,
                    },
                  ].map((kpi) => {
                    const IconComp = kpi.icon;
                    return (
                      <div
                        key={kpi.label}
                        className="card-hover"
                        style={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border-light)",
                          padding: "20px 22px",
                          boxShadow: "var(--shadow-card)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          minHeight: 132,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              backgroundColor: "var(--bg-cream)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--maroon)",
                            }}
                          >
                            <IconComp size={18} strokeWidth={2.2} />
                          </div>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "3px 10px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: "var(--bg-cream)",
                              color: "var(--maroon)",
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            <TrendingUp size={11} />
                            <span>{kpi.badge}</span>
                          </span>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "var(--text-muted)",
                              marginBottom: 2,
                              fontWeight: 500,
                            }}
                          >
                            {kpi.label}
                          </div>
                          <div
                            className="tabular"
                            style={{
                              fontSize: 26,
                              fontWeight: 900,
                              color: "var(--maroon)",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {kpi.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="grid-dashboard-split"
                >
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--border-light)",
                      padding: "24px 26px",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 18,
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "var(--maroon)",
                            marginBottom: 2,
                          }}
                        >
                          {t.incomingOrders}
                        </h2>
                        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          {t.incomingDesc}
                        </p>
                      </div>

                      <button
                        onClick={() => setTenantNavTab("orders")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--maroon)",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <span>{t.viewAll}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {incomingOrders.map((ord) => {
                        const isAwaiting = ord.status === "Awaiting payment";
                        const isPrep = ord.status === "Preparing";
                        const isReady = ord.status === "Ready for pickup";

                        return (
                          <div
                            key={ord.id}
                            className="card-hover"
                            style={{
                              borderRadius: "var(--radius-md)",
                              border: "1px solid var(--border-light)",
                              padding: "14px 16px",
                              backgroundColor: "#FFFFFF",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 14,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 11,
                                  backgroundColor: "var(--maroon)",
                                  color: "#FFFFFF",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {ord.code}
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "var(--maroon)",
                                    marginBottom: 2,
                                  }}
                                >
                                  {ord.items_breakdown || ord.item_name}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {ord.user_name} · {ord.items_count}{" "}
                                  {ord.items_count > 1 ? "items" : "item"} ·{" "}
                                  {formatRupiah(ord.total)}
                                  {ord.promo_code ? ` · Promo ${ord.promo_code}` : ""}
                                </div>
                                {ord.catatan && (
                                  <div style={{ fontSize: 11, color: "var(--maroon)", marginTop: 2, fontWeight: 600 }}>
                                    {lang === "EN" ? "Note:" : "Catatan:"} {ord.catatan}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "5px 12px",
                                  borderRadius: "var(--radius-pill)",
                                  backgroundColor: isReady
                                    ? "var(--orange)"
                                    : "var(--bg-cream)",
                                  color: "var(--maroon)",
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    backgroundColor: isReady
                                      ? "var(--maroon)"
                                      : "var(--orange)",
                                  }}
                                />
                                <span>{ord.status}</span>
                              </span>
                              {isAwaiting && (
                                <button
                                  onClick={() => {
                                    setTenantOrderStep(1);
                                    setTenantNavTab("orders");
                                  }}
                                  className="btn-interactive"
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--maroon)",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    padding: "6px 10px",
                                  }}
                                >
                                  View order
                                </button>
                              )}

                              {isPrep && (
                                <button
                                  onClick={() => handleVendorAdvanceOrder(ord.id, "Siap Diambil")}
                                  className="btn-interactive btn-lift"
                                  style={{
                                    padding: "8px 18px",
                                    borderRadius: "var(--radius-pill)",
                                    border: "none",
                                    backgroundColor: "var(--orange)",
                                    color: "var(--maroon)",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                  }}
                                >
                                  Mark ready
                                </button>
                              )}

                              {isReady && (
                                <button
                                  onClick={() => handleVendorAdvanceOrder(ord.id, "Selesai")}
                                  className="btn-interactive"
                                  style={{
                                    padding: "8px 16px",
                                    borderRadius: "var(--radius-pill)",
                                    border: "1px solid var(--border-input)",
                                    backgroundColor: "#FFFFFF",
                                    color: "var(--maroon)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  Complete pickup
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenCancelModal(ord)}
                                className="btn-interactive"
                                style={{
                                  padding: "7px 12px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid #F2CCC7",
                                  backgroundColor: "#FDF0EE",
                                  color: "#C84336",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {lang === "EN" ? "Cancel" : "Batal"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {incomingOrders.length === 0 && (
                        <div
                          style={{
                            padding: "32px 20px",
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "#FAF6F2",
                            border: "1px dashed var(--border-input)",
                            textAlign: "center",
                            color: "var(--text-muted)",
                            fontSize: 14,
                          }}
                        >
                          {t.noIncomingOrders}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                    {(() => {
                      const availList = tenantMenus.filter((m) => m.available);
                      const unavailList = tenantMenus.filter((m) => !m.available);
                      const pct =
                        tenantMenus.length > 0
                          ? (availList.length / tenantMenus.length) * 100
                          : 0;
                      return (
                        <div
                          style={{
                            backgroundColor: "#FFFFFF",
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--border-light)",
                            padding: "22px 24px",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: 17,
                              fontWeight: 800,
                              color: "var(--maroon)",
                              marginBottom: 10,
                            }}
                          >
                            {t.menuAvailability}
                          </h3>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 28,
                                fontWeight: 900,
                                color: "var(--maroon)",
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {availList.length} / {tenantMenus.length}
                            </span>
                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                              {t.itemsAvailable}
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 8,
                              borderRadius: 999,
                              backgroundColor: "#F2EAE4",
                              overflow: "hidden",
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                borderRadius: 999,
                                backgroundColor: "var(--orange)",
                                transition: "width 0.35s ease",
                              }}
                            />
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--text-muted)",
                              marginBottom: 16,
                            }}
                          >
                            {tenantMenus.length === 0
                              ? t.noMenuUploadedShort
                              : unavailList.length > 0
                              ? `${lang === "EN" ? "Unavailable" : "Habis"}: ${unavailList.map((u) => u.nama_menu).join(", ")}`
                              : lang === "EN"
                              ? "All menu items are currently available!"
                              : "Semua menu sedang tersedia!"}
                          </div>

                          <button
                            onClick={() => setTenantNavTab("menu")}
                            className="btn-interactive"
                            style={{
                              width: "100%",
                              padding: "11px 16px",
                              borderRadius: "var(--radius-pill)",
                              border: "1px solid var(--border-input)",
                              backgroundColor: "#FFFFFF",
                              color: "var(--maroon)",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <span>{t.manageMenu}</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      );
                    })()}
                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--border-light)",
                        padding: "22px 24px",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 14,
                        }}
                      >
                        {t.topSellers}
                      </h3>

                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {topSellersToday.slice(0, 3).map((topItem, idx) => (
                          <div
                            key={topItem.id_menu}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingBottom: idx < Math.min(3, topSellersToday.length) - 1 ? 12 : 0,
                              borderBottom:
                                idx < Math.min(3, topSellersToday.length) - 1
                                  ? "1px solid var(--border-light)"
                                  : "none",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div
                                style={{
                                  width: 42,
                                  height: 42,
                                  borderRadius: 10,
                                  backgroundColor: "var(--bg-warm-img)",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <SafeImage
                                  src={topItem.gambar}
                                  alt={topItem.nama_menu}
                                  iconSize={18}
                                />
                              </div>

                              <div>
                                <div
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "var(--maroon)",
                                  }}
                                >
                                  {topItem.nama_menu}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {topItem.sold_today} {lang === "EN" ? "sold" : "terjual"}
                                </div>
                              </div>
                            </div>

                            <div
                              className="tabular"
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "var(--maroon)",
                              }}
                            >
                              {formatRupiah(topItem.revenue)}
                            </div>
                          </div>
                        ))}
                        {topSellersToday.length === 0 && (
                          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                            {lang === "EN"
                              ? "No sales recorded today yet."
                              : "Belum ada penjualan tercatat hari ini."}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "var(--radius-xl)",
                        border: "1px solid var(--border-light)",
                        padding: "22px 24px",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--maroon)" }}>
                          {lang === "EN" ? "Tenant Promos" : "Promo Khusus Tenant"}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setPromoFormError("");
                            setIsPromoModalOpen(true);
                          }}
                          className="btn-interactive"
                          style={{
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "var(--maroon)",
                            borderRadius: "var(--radius-pill)",
                            padding: "6px 12px",
                            fontSize: 12,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          + Promo
                        </button>
                      </div>

                      {vendorPromos.length === 0 ? (
                        <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>
                          {lang === "EN"
                            ? "Create custom discount codes exclusively for your canteen."
                            : "Buat kode diskon khusus untuk pelanggan kantin Anda."}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {vendorPromos.map((vp) => (
                            <div
                              key={vp.id_promo}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                borderRadius: 10,
                                border: "1px solid var(--border-light)",
                                backgroundColor: vp.aktif ? "#FAF6F2" : "#F9FAFB",
                              }}
                            >
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)" }}>
                                  {vp.kode_promo} ·{" "}
                                  {vp.tipe === "percentage" ? `${vp.diskon}%` : formatRupiah(vp.diskon)}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                  {vp.judul}
                                  {Number(vp.minimal_belanja) > 0
                                    ? ` · Min. ${formatRupiah(vp.minimal_belanja)}`
                                    : ""}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePromo(vp)}
                                  style={{
                                    border: "1px solid var(--border-input)",
                                    backgroundColor: vp.aktif ? "var(--maroon)" : "#FFFFFF",
                                    color: vp.aktif ? "#FFFFFF" : "var(--text-muted)",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "3px 10px",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  {vp.aktif ? "Aktif" : "Off"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePromo(vp.id_promo)}
                                  aria-label="Delete promo"
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#C84336",
                                    cursor: "pointer",
                                    padding: 4,
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tenantNavTab === "menu" && (
              <div className="container-app animate-fade" style={{ paddingTop: 32 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 22,
                    flexWrap: "wrap",
                    gap: 16,
                  }}
                >
                  <div>
                    <h1
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: "var(--maroon)",
                        letterSpacing: "-0.02em",
                        marginBottom: 2,
                      }}
                    >
                      {t.myMenuTitle}
                    </h1>
                    <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                      {t.myMenuDesc}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", width: "100%", maxWidth: 460, justifyContent: "flex-end" }}>
                    <div
                      className="search-pill-box"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "var(--radius-pill)",
                        padding: "5px 6px 5px 18px",
                        border: "1px solid var(--border-input)",
                        width: 290,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search your menu..."
                        value={tenantMenuSearch}
                        onChange={(e) => setTenantMenuSearch(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: 13,
                          color: "var(--maroon)",
                          width: "100%",
                        }}
                      />
                      <button
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "var(--maroon)",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                        aria-label="Search menu"
                      >
                        <Search size={14} />
                      </button>
                    </div>

                    <button
                      onClick={openAddMenuModal}
                      className="btn-interactive btn-lift"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "11px 22px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        backgroundColor: "var(--orange)",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                      }}
                    >
                      <Plus size={16} strokeWidth={2.8} />
                      <span>{t.uploadMenuBtn}</span>
                    </button>
                  </div>
                </div>
                {(() => {
                  const availCount = tenantMenus.filter((m) => m.available).length;
                  const unavailCount = tenantMenus.filter((m) => !m.available).length;
                  const displayedMenus = tenantMenus.filter((item) => {
                    const matchFilter =
                      tenantMenuFilter === "All"
                        ? true
                        : tenantMenuFilter === "Available"
                        ? item.available
                        : !item.available;
                    const matchSearch =
                      tenantMenuSearch === "" ||
                      item.nama_menu
                        .toLowerCase()
                        .includes(tenantMenuSearch.toLowerCase());
                    return matchFilter && matchSearch;
                  });

                  return (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 24,
                          flexWrap: "wrap",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          {[
                            { id: "All", label: `${t.filterAll} (${tenantMenus.length})` },
                            { id: "Available", label: `${lang === "EN" ? "Available" : "Tersedia"} (${availCount})` },
                            { id: "Unavailable", label: `${lang === "EN" ? "Unavailable" : "Habis"} (${unavailCount})` },
                          ].map((f) => {
                            const active = tenantMenuFilter === f.id;
                            return (
                              <button
                                key={f.id}
                                onClick={() => setTenantMenuFilter(f.id)}
                                className="btn-interactive"
                                style={{
                                  padding: "8px 18px",
                                  borderRadius: "var(--radius-pill)",
                                  border: active
                                    ? "1px solid var(--maroon)"
                                    : "1px solid var(--border-input)",
                                  backgroundColor: active ? "var(--maroon)" : "#FFFFFF",
                                  color: active ? "#FFFFFF" : "var(--maroon)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {f.label}
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                          Tap the pencil to rename · switch the toggle to change availability
                        </div>
                      </div>
                      <div className="grid-4-cols">
                        {displayedMenus.map((dish) => (
                          <div key={dish.id_menu} style={{ display: "flex", flexDirection: "column" }}>
                            <div
                              className="img-zoom-parent"
                              style={{
                                position: "relative",
                                aspectRatio: "1 / 1",
                                borderRadius: "var(--radius-lg)",
                                backgroundColor: "var(--bg-warm-img)",
                                overflow: "hidden",
                                marginBottom: 12,
                              }}
                            >
                              <SafeImage
                                src={dish.gambar}
                                alt={dish.nama_menu}
                                className="img-zoom-child"
                                style={{
                                  opacity: dish.available ? 1 : 0.35,
                                  transition: "opacity 0.25s ease, transform 0.45s ease",
                                }}
                              />
                              {!dish.available && (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(253, 240, 226, 0.45)",
                                  }}
                                >
                                  <span
                                    style={{
                                      padding: "6px 18px",
                                      borderRadius: "var(--radius-pill)",
                                      backgroundColor: "var(--maroon)",
                                      color: "#FFFFFF",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      boxShadow: "0 4px 12px rgba(82, 42, 40, 0.2)",
                                    }}
                                  >
                                    Unavailable
                                  </span>
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 8,
                                marginBottom: 10,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: "var(--maroon)",
                                    lineHeight: 1.25,
                                  }}
                                >
                                  {dish.nama_menu}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                  {dish.tenant_name}
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setEditMenuError("");
                                  setEditingDish(dish);
                                  setEditDishForm({
                                    nama_menu: dish.nama_menu,
                                    harga: String(dish.harga),
                                    available: dish.available,
                                  });
                                }}
                                className="btn-interactive"
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  border: "1px solid var(--border-light)",
                                  backgroundColor: "#FFFFFF",
                                  color: "var(--maroon)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                }}
                                title="Edit menu item"
                              >
                                <Pencil size={12} />
                              </button>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                className="tabular"
                                style={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "var(--maroon)",
                                }}
                              >
                                {formatRupiah(dish.harga)}
                              </span>

                              <div
                                onClick={() => {
                                  const nextAvail = !dish.available;
                                  setTenantMenus((prev) =>
                                    prev.map((m) =>
                                      m.id_menu === dish.id_menu
                                        ? { ...m, available: nextAvail }
                                        : m
                                    )
                                  );
                                  setMenusList((prev) =>
                                    prev.map((m) =>
                                      m.id_menu === dish.id_menu
                                        ? { ...m, available: nextAvail, status_tersedia: nextAvail }
                                        : m
                                    )
                                  );
                                  api
                                    .updateMenuAvailability(dish.id_menu, nextAvail)
                                    .catch(() => {});
                                }}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                              >
                                <div
                                  style={{
                                    width: 42,
                                    height: 23,
                                    borderRadius: 999,
                                    backgroundColor: dish.available
                                      ? "var(--orange)"
                                      : "#D8D2CE",
                                    position: "relative",
                                    transition: "background-color 0.25s ease",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 17,
                                      height: 17,
                                      borderRadius: "50%",
                                      backgroundColor: "#FFFFFF",
                                      position: "absolute",
                                      top: 3,
                                      left: dish.available ? 22 : 3,
                                      transition:
                                        "left 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                                    }}
                                  />
                                </div>

                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: dish.available ? 700 : 500,
                                    color: dish.available
                                      ? "var(--maroon)"
                                      : "var(--text-muted)",
                                  }}
                                >
                                  {dish.available ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {displayedMenus.length === 0 && (
                        <div
                          style={{
                            padding: "48px 24px",
                            borderRadius: "var(--radius-xl)",
                            backgroundColor: "#FFFFFF",
                            border: "1px dashed var(--border-input)",
                            textAlign: "center",
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                            Belum ada menu di daftar ini
                          </div>
                          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 18 }}>
                            Upload menu makanan atau minuman kantin Anda agar pelanggan bisa langsung memesan.
                          </p>
                          <button
                            onClick={openAddMenuModal}
                            className="btn-interactive btn-lift"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "12px 24px",
                              borderRadius: "var(--radius-pill)",
                              border: "none",
                              backgroundColor: "var(--orange)",
                              color: "var(--maroon)",
                              fontSize: 14,
                              fontWeight: 800,
                              cursor: "pointer",
                              boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                            }}
                          >
                            <Plus size={16} strokeWidth={2.8} />
                            <span>Upload Menu Pertama</span>
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
            {tenantNavTab === "orders" && (
              <div className="container-app animate-fade" style={{ paddingTop: 32, maxWidth: 980 }}>
                <div style={{ marginBottom: 22 }}>
                  <h1
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      letterSpacing: "-0.02em",
                      marginBottom: 4,
                    }}
                  >
                    {t.incomingOrders}
                  </h1>
                  <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                    {t.incomingDesc} ({displayName})
                  </p>
                </div>

                {incomingOrders.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "var(--radius-xl)",
                      border: "1px dashed var(--border-input)",
                      padding: "56px 28px",
                      boxShadow: "var(--shadow-sm)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-cream)",
                        color: "var(--maroon)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                      }}
                    >
                      <Receipt size={26} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                      {lang === "EN" ? "No active incoming orders" : "Belum ada pesanan aktif saat ini"}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 440, margin: "0 auto" }}>
                      {t.noIncomingOrders}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "var(--radius-xl)",
                      border: "1px solid var(--border-light)",
                      padding: "24px",
                      boxShadow: "var(--shadow-card)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {incomingOrders.map((ord) => {
                      const isAwaiting = ord.status === "Awaiting payment";
                      const isPrep = ord.status === "Preparing";
                      const isReady = ord.status === "Ready for pickup";
                      return (
                        <div
                          key={ord.id}
                          className="card-hover"
                          style={{
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-light)",
                            padding: "16px 18px",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 14,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 11,
                                backgroundColor: "var(--maroon)",
                                color: "#FFFFFF",
                                fontSize: 12,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {ord.code}
                            </div>
                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--maroon)", marginBottom: 2 }}>
                                {ord.items_breakdown || ord.item_name}
                              </div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {ord.user_name} · {ord.items_count} item · {formatRupiah(ord.total)}
                                {ord.promo_code ? ` · Promo ${ord.promo_code}` : ""}
                              </div>
                              {ord.catatan && (
                                <div style={{ fontSize: 11, color: "var(--maroon)", marginTop: 2, fontWeight: 600 }}>
                                  {lang === "EN" ? "Note:" : "Catatan:"} {ord.catatan}
                                </div>
                              )}
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 12px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: isReady ? "var(--orange)" : "var(--bg-cream)",
                                color: "var(--maroon)",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {ord.status}
                            </span>

                            {isAwaiting && (
                              <button
                                onClick={() => handleVendorAdvanceOrder(ord.id, "Sedang Diproses", true)}
                                className="btn-interactive"
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "none",
                                  backgroundColor: "var(--maroon)",
                                  color: "#FFFFFF",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {lang === "EN" ? "Verify QRIS" : "Verifikasi QRIS"}
                              </button>
                            )}

                            {isPrep && (
                              <button
                                onClick={() => handleVendorAdvanceOrder(ord.id, "Siap Diambil")}
                                className="btn-interactive btn-lift"
                                style={{
                                  padding: "8px 18px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "none",
                                  backgroundColor: "var(--orange)",
                                  color: "var(--maroon)",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Mark ready
                              </button>
                            )}

                            {isReady && (
                              <button
                                onClick={() => handleVendorAdvanceOrder(ord.id, "Selesai")}
                                className="btn-interactive"
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid var(--border-input)",
                                  backgroundColor: "#FFFFFF",
                                  color: "var(--maroon)",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Complete pickup
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(ord)}
                              className="btn-interactive"
                              style={{
                                padding: "7px 12px",
                                borderRadius: "var(--radius-pill)",
                                border: "1px solid #F2CCC7",
                                backgroundColor: "#FDF0EE",
                                color: "#C84336",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              {lang === "EN" ? "Cancel" : "Batal"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {tenantNavTab === "history" && (
              <div className="container-app animate-fade" style={{ paddingTop: 32, maxWidth: 980 }}>
                <div style={{ marginBottom: 22 }}>
                  <h1
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      letterSpacing: "-0.02em",
                      marginBottom: 4,
                    }}
                  >
                    {t.historyTitle}
                  </h1>
                  <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                    {t.historyDesc}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  {[
                    { key: "All", label: t.filterAll },
                    { key: "In progress", label: t.filterInProgress },
                    { key: "Completed", label: t.filterCompleted },
                    { key: "Cancelled", label: t.filterCancelled },
                  ].map((tab) => {
                    const active = tenantHistoryFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setTenantHistoryFilter(tab.key)}
                        className="btn-interactive"
                        style={{
                          padding: "8px 18px",
                          borderRadius: "var(--radius-pill)",
                          border: active
                            ? "1px solid var(--maroon)"
                            : "1px solid var(--border-input)",
                          backgroundColor: active ? "var(--maroon)" : "#FFFFFF",
                          color: active ? "#FFFFFF" : "var(--maroon)",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "22px",
                    boxShadow: "var(--shadow-card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {(() => {
                    const filteredTenantHist = ordersHistory.filter((ord) => {
                      const inProg = ["Awaiting payment", "Preparing", "Ready for pickup"].includes(ord.status);
                      if (tenantHistoryFilter === "All") return true;
                      if (tenantHistoryFilter === "In progress") return inProg;
                      return ord.status === tenantHistoryFilter;
                    });

                    if (filteredTenantHist.length === 0) {
                      return (
                        <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: 14 }}>
                          {lang === "EN"
                            ? "No tenant orders matching this filter yet."
                            : "Belum ada riwayat pesanan tenant pada kategori ini."}
                        </div>
                      );
                    }

                    const statusLabels = {
                      "Awaiting payment": lang === "EN" ? "Awaiting payment" : "Menunggu bayar",
                      Preparing: lang === "EN" ? "Preparing" : "Diproses",
                      "Ready for pickup": lang === "EN" ? "Ready for pickup" : "Siap diambil",
                      Completed: lang === "EN" ? "Completed" : "Selesai",
                      Cancelled: lang === "EN" ? "Cancelled" : "Dibatalkan",
                    };

                    return filteredTenantHist.map((order) => {
                      const isPrep = ["Awaiting payment", "Preparing", "Ready for pickup"].includes(order.status);
                      const isCompleted = order.status === "Completed";
                      const isCancelled = order.status === "Cancelled";
                      return (
                        <div
                          key={order.id_pesanan}
                          className="card-hover order-row-card"
                          style={{
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--border-light)",
                            padding: "16px 20px",
                            backgroundColor: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div
                              style={{
                                width: 52,
                                height: 52,
                                borderRadius: 12,
                                backgroundColor: isCancelled ? "var(--status-cancelled-bg)" : "var(--maroon)",
                                color: isCancelled ? "var(--text-muted)" : "#FFFFFF",
                                fontSize: 12,
                                fontWeight: 900,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {order.nomor_antrean || `#${order.id_pesanan}`}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "var(--maroon)",
                                  marginBottom: 2,
                                }}
                              >
                                {order.items_breakdown || order.items_summary}
                              </div>
                              <div className="tabular" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {order.user_name} · {order.tanggal} · {formatRupiah(order.total)}
                                {order.promo_code ? ` · Promo ${order.promo_code}` : ""}
                              </div>
                              {(order.catatan || order.alasan_batal) && (
                                <div style={{ fontSize: 11, color: isCancelled ? "#C84336" : "var(--maroon)", marginTop: 3, fontWeight: 600 }}>
                                  {order.alasan_batal
                                    ? `${lang === "EN" ? "Reason:" : "Alasan:"} ${order.alasan_batal}`
                                    : `${lang === "EN" ? "Note:" : "Keterangan:"} ${order.catatan}`}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="order-row-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 12px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: isCompleted
                                  ? "var(--maroon)"
                                  : isPrep
                                  ? "var(--bg-cream)"
                                  : "var(--status-cancelled-bg)",
                                color: isCompleted
                                  ? "#FFFFFF"
                                  : isPrep
                                  ? "var(--maroon)"
                                  : "var(--text-muted)",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              <span>{statusLabels[order.status] || order.status}</span>
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </>
        )}
        {portalMode === "customer" && (
          <>
        {navTab === "home" && !activeTenantView && (
          <div className="container-app animate-fade" style={{ paddingTop: 28 }}>
            <div
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                marginBottom: 36,
                boxShadow: "var(--shadow-card)",
                backgroundColor: "var(--bg-banner)",
                border: "1px solid #EADBCE",
                minHeight: 310,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: `${heroSlides.length * 100}%`,
                  transform: `translateX(-${heroSlide * (100 / heroSlides.length)}%)`,
                  transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)",
                  willChange: "transform",
                }}
              >
                {heroSlides.map((slide, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      width: `${100 / heroSlides.length}%`,
                      flexShrink: 0,
                      position: "relative",
                      minHeight: 310,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 1,
                        backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.80) 48%, rgba(255,255,255,0.18) 100%), url('${slide.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center right",
                      }}
                    />
                    <div
                      className="hero-slide-inner"
                      style={{
                        position: "relative",
                        zIndex: 2,
                        padding: "42px 52px",
                        maxWidth: 620,
                      }}
                    >
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "var(--bg-cream)",
                          color: "var(--maroon)",
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 14,
                        }}
                      >
                        <Tag size={12} color="var(--orange)" />
                        <span>{slide.tag}</span>
                      </div>

                      <h1
                        className="hero-slide-title"
                        style={{
                          fontSize: 34,
                          fontWeight: 900,
                          lineHeight: 1.18,
                          color: "var(--maroon)",
                          letterSpacing: "-0.02em",
                          marginBottom: 12,
                        }}
                      >
                        {slide.title}
                      </h1>

                      <p
                        style={{
                          fontSize: 15,
                          color: "var(--text-muted)",
                          lineHeight: 1.5,
                          marginBottom: 22,
                        }}
                      >
                        {slide.desc}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button
                          onClick={() => {
                            if (sIdx === 0) {
                              const el = document.getElementById("popular-menu-section");
                              el?.scrollIntoView({ behavior: "smooth" });
                            } else {
                              setNavTab("orders");
                            }
                          }}
                          style={{
                            padding: "12px 28px",
                            borderRadius: "var(--radius-pill)",
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "#FFFFFF",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 4px 14px rgba(248, 163, 75, 0.4)",
                            transition: "transform 0.15s ease",
                          }}
                        >
                          <span>{slide.primaryCta}</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          onClick={() => setNavTab("tenant")}
                          style={{
                            padding: "12px 22px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "#FFFFFF",
                            color: "var(--maroon)",
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {slide.secondaryCta}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                aria-label="Previous slide"
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 4,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid rgba(82, 42, 40, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(6px)",
                  color: "var(--maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  transition: "background-color 0.2s ease, transform 0.2s ease",
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setHeroSlide((prev) => (prev + 1) % heroSlides.length)}
                aria-label="Next slide"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 4,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid rgba(82, 42, 40, 0.12)",
                  backgroundColor: "rgba(255, 255, 255, 0.92)",
                  backdropFilter: "blur(6px)",
                  color: "var(--maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  transition: "background-color 0.2s ease, transform 0.2s ease",
                }}
              >
                <ChevronRight size={20} />
              </button>
              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 4,
                  padding: "5px 14px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(6px)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {heroSlides.map((_, idx) => {
                  const active = heroSlide === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setHeroSlide(idx)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        width: active ? 22 : 7,
                        height: 7,
                        borderRadius: 999,
                        backgroundColor: active ? "var(--maroon)" : "#D9CECA",
                        transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--maroon)",
                  letterSpacing: "-0.01em",
                  marginBottom: 16,
                }}
              >
                {t.categories}
              </h2>

              <div
                className="grid-3-cols"
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-light)",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {[
                  {
                    key: "Rice & Mains",
                    label: t.catRice,
                    count: `${menusList.filter((m) => m.kategori_nama === "Rice & Mains" && m.available !== false).length} ${t.itemsUnit}`,
                    iconSvg: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M4 11C4 16 7.5 19 12 19C16.5 19 20 16 20 11H4Z"
                          stroke="#522A28"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path d="M8 7V5M12 7V4M16 7V5" stroke="#F8A34B" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    key: "Snacks",
                    label: t.catSnacks,
                    count: `${menusList.filter((m) => m.kategori_nama === "Snacks" && m.available !== false).length} ${t.itemsUnit}`,
                    iconSvg: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M6 9V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V9H6Z"
                          stroke="#522A28"
                          strokeWidth="2"
                        />
                        <path d="M9 5V3M12 5V3M15 5V3" stroke="#F8A34B" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    key: "Drinks",
                    label: t.catDrinks,
                    count: `${menusList.filter((m) => m.kategori_nama === "Drinks" && m.available !== false).length} ${t.itemsUnit}`,
                    iconSvg: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 8V18C5 19.65 6.35 21 8 21H14C15.65 21 17 19.65 17 18V8H5Z"
                          stroke="#522A28"
                          strokeWidth="2"
                        />
                        <path d="M17 10H19C20.1 10 21 10.9 21 12C21 13.1 20.1 14 19 14H17" stroke="#522A28" strokeWidth="2" />
                      </svg>
                    ),
                  },
                ].map((cat) => {
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <div
                      key={cat.key}
                      onClick={() =>
                        setSelectedCategory((prev) => (prev === cat.key ? "All" : cat.key))
                      }
                      className="card-hover"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelected ? "var(--orange-soft)" : "#FAF6F2",
                        border: isSelected ? "1.5px solid var(--orange)" : "1px solid var(--border-light)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: "#FFFFFF",
                            border: "1px solid var(--border-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {cat.iconSvg}
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "var(--maroon)",
                            }}
                          >
                            {cat.label}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                            {cat.count}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          backgroundColor: "#FFFFFF",
                          border: "1px solid var(--border-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ChevronRight size={16} color="var(--maroon)" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div id="popular-menu-section" style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "var(--maroon)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t.popularMenu}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedCategory("All")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--maroon)",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{t.viewAll}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))",
                  gap: 22,
                }}
              >
                {filteredMenus.map((item) => (
                  <div
                    key={item.id_menu}
                    className="card-hover img-zoom-parent"
                    style={{
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid var(--border-light)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      onClick={() => openFoodDetail(item)}
                      style={{
                        position: "relative",
                        height: 190,
                        backgroundColor: "var(--bg-warm-img)",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                    >
                      <SafeImage
                        src={item.gambar}
                        alt={item.nama_menu}
                        className="img-zoom-child"
                        iconSize={36}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id_menu);
                        }}
                        aria-label="Toggle favorite"
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "rgba(255,255,255,0.92)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Heart
                          size={14}
                          color={favoriteIds.includes(item.id_menu) ? "#C84336" : "var(--maroon)"}
                          fill={favoriteIds.includes(item.id_menu) ? "#C84336" : "none"}
                        />
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          padding: "4px 8px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--maroon)",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                        }}
                      >
                        <Star size={12} fill="#F8A34B" color="#F8A34B" />
                        <span>{item.rating || (lang === "EN" ? "New" : "Baru")}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h3
                          onClick={() => openFoodDetail(item)}
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "var(--maroon)",
                            marginBottom: 4,
                            cursor: "pointer",
                          }}
                        >
                          {item.nama_menu}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginBottom: 14,
                          }}
                        >
                          <span>{item.tenant_name}</span>
                          <span>·</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <Clock size={12} />
                            {item.estimasi_menit} min
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: 10,
                          borderTop: "1px solid var(--border-light)",
                        }}
                      >
                        <div
                          className="tabular"
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: "var(--maroon)",
                          }}
                        >
                          {formatRupiah(item.harga)}
                        </div>
                        <button
                          onClick={() => openFoodDetail(item)}
                          className="btn-interactive"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 3px 8px rgba(248, 163, 75, 0.4)",
                          }}
                          title={lang === "EN" ? "View menu & add" : "Lihat menu & pesan"}
                        >
                          <Plus size={18} strokeWidth={2.6} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredMenus.length === 0 && (
                <div
                  style={{
                    padding: "48px 24px",
                    borderRadius: "var(--radius-xl)",
                    backgroundColor: "#FFFFFF",
                    border: "1px dashed var(--border-input)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                    {t.emptyMenuTitle}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    {t.emptyMenuDesc}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {navTab === "tenant" && !activeTenantView && (
          <div className="container-app animate-fade" style={{ paddingTop: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 28,
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "var(--maroon)",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  {t.tenantTitle}
                </h1>
                <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                  {t.tenantSubtitle}
                </p>
              </div>
              <div
                className="search-pill-box"
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-pill)",
                  padding: "5px 6px 5px 18px",
                  border: "1px solid var(--border-input)",
                  boxShadow: "var(--shadow-sm)",
                  width: 320,
                }}
              >
                <input
                  type="text"
                  placeholder={t.searchFoodPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                    color: "var(--maroon)",
                    width: "100%",
                  }}
                />
                <button
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "var(--maroon)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
            <div className="grid-4-cols">
              {filteredTenants.map((tenant) => (
                <div
                  key={tenant.id_tenant}
                  onClick={() => setActiveTenantView(tenant)}
                  className="card-hover img-zoom-parent"
                  style={{
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "#FFFFFF",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      height: 190,
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--bg-warm-img)",
                      overflow: "hidden",
                      position: "relative",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SafeImage
                      src={tenant.gambar || tenant.logo}
                      alt={tenant.nama_tenant}
                      className="img-zoom-child"
                      fallbackType="store"
                      iconSize={42}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "4px 10px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: isTenantOpenAt(tenant, liveClock)
                          ? "rgba(255,255,255,0.94)"
                          : "rgba(55,65,81,0.88)",
                        color: isTenantOpenAt(tenant, liveClock) ? "var(--maroon)" : "#FFFFFF",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: isTenantOpenAt(tenant, liveClock) ? "#16A34A" : "#D1D5DB",
                        }}
                      />
                      <span>
                        {isTenantOpenAt(tenant, liveClock)
                          ? `${lang === "EN" ? "Open until" : "Buka s/d"} ${tenant.jam_tutup || "21:00"}`
                          : `${lang === "EN" ? "Closed · Opens" : "Tutup · Buka"} ${tenant.jam_buka || "07:00"}`}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "4px 2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: "var(--maroon)",
                      }}
                    >
                      {tenant.nama_tenant}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--maroon)",
                      }}
                    >
                      <Star size={14} fill="#F8A34B" color="#F8A34B" />
                      <span>{tenant.rating || (lang === "EN" ? "New" : "Baru")}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {filteredTenants.length === 0 && (
              <div
                style={{
                  padding: "48px 24px",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "#FFFFFF",
                  border: "1px dashed var(--border-input)",
                  textAlign: "center",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                  {t.emptyTenantTitle}
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  {t.emptyTenantDesc}
                </p>
              </div>
            )}
          </div>
        )}
        {navTab === "tenant" && activeTenantView && (
          <div className="container-app animate-fade" style={{ paddingTop: 32 }}>
            <button
              onClick={() => setActiveTenantView(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-light)",
                backgroundColor: "#FFFFFF",
                color: "var(--maroon)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              <ArrowLeft size={15} />
              <span>{t.backTenants}</span>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "var(--maroon)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {t.navMenu}
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                  {tenantMenuItems.length} {t.itemsUnit} · {activeTenantView.nama_tenant} ·{" "}
                  {isTenantOpenAt(activeTenantView, liveClock)
                    ? `${lang === "EN" ? "Open until" : "Buka sampai"} ${activeTenantView.jam_tutup || "21:00"}`
                    : `${lang === "EN" ? "Closed · Opens at" : "Tutup · Buka pukul"} ${activeTenantView.jam_buka || "07:00"}`}
                  {" · "}
                  <span className="tabular">{formatLiveClock(liveClock)}</span>
                </p>
              </div>
              <div
                className="search-pill-box"
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-pill)",
                  padding: "5px 6px 5px 18px",
                  border: "1px solid var(--border-input)",
                  width: 300,
                }}
              >
                <input
                  type="text"
                  value={tenantMenuQuery}
                  onChange={(e) => setTenantMenuQuery(e.target.value)}
                  placeholder={t.searchFoodPlaceholder}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 14,
                    width: "100%",
                  }}
                />
                <button
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "var(--maroon)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search size={15} />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {tenantMenuItems.map((item) => (
                <div
                  key={item.id_menu}
                  className="card-hover img-zoom-parent"
                  style={{
                    backgroundColor: "#F3ECE8",
                    borderRadius: "var(--radius-xl)",
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <div
                      onClick={() => openFoodDetail(item)}
                      style={{
                        position: "relative",
                        width: 130,
                        height: 130,
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "#E2E3E2",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      <SafeImage
                        src={item.gambar}
                        alt={item.nama_menu}
                        className="img-zoom-child"
                        iconSize={36}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id_menu);
                        }}
                        aria-label="Toggle favorite"
                        style={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: "rgba(255,255,255,0.92)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                        }}
                      >
                        <Heart
                          size={13}
                          color={favoriteIds.includes(item.id_menu) ? "#C84336" : "var(--maroon)"}
                          fill={favoriteIds.includes(item.id_menu) ? "#C84336" : "none"}
                        />
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          right: 8,
                          padding: "3px 8px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--maroon)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star size={12} fill="#F8A34B" color="#F8A34B" />
                        <span>{item.rating || (lang === "EN" ? "New" : "Baru")}</span>
                      </div>
                    </div>

                    <div>
                      <h3
                        onClick={() => openFoodDetail(item)}
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          cursor: "pointer",
                          marginBottom: 6,
                        }}
                      >
                        {item.nama_menu}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 14,
                          color: "var(--text-muted)",
                          marginBottom: 10,
                        }}
                      >
                        <span>{item.tenant_name}</span>
                        <span>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={14} />
                          {item.estimasi_menit} min
                        </span>
                      </div>
                      <div
                        className="tabular"
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: "var(--maroon)",
                        }}
                      >
                        {formatRupiah(item.harga)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openFoodDetail(item)}
                    className="btn-interactive"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "var(--orange)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(248, 163, 75, 0.4)",
                    }}
                    title={lang === "EN" ? "View menu & add" : "Lihat menu & pesan"}
                  >
                    <Plus size={22} strokeWidth={2.8} />
                  </button>
                </div>
              ))}
              {tenantMenuItems.length === 0 && (
                <div
                  style={{
                    padding: "40px 24px",
                    borderRadius: "var(--radius-xl)",
                    backgroundColor: "#FFFFFF",
                    border: "1px dashed var(--border-input)",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  {tenantMenuQuery
                    ? lang === "EN"
                      ? `No menu found matching "${tenantMenuQuery}".`
                      : `Menu dengan kata kunci "${tenantMenuQuery}" tidak ditemukan.`
                    : lang === "EN"
                    ? "This tenant hasn't published available menu items yet."
                    : "Tenant ini belum mempublikasikan menu yang tersedia."}
                </div>
              )}
            </div>
          </div>
        )}
        {navTab === "orders" && (
          <div className="container-app animate-fade" style={{ paddingTop: 28, maxWidth: 1040 }}>
            <div style={{ marginBottom: 20 }}>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "var(--maroon)",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {checkoutStep === 1
                  ? t.yourOrder
                  : checkoutStep === 2
                  ? t.stepPayment
                  : checkoutStep === 3
                  ? t.stepPreparing
                  : t.stepPickup}
              </h1>
              <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                {checkoutStep === 1
                  ? cartItems.length === 0
                    ? t.emptyCartShort
                    : t.reviewItems
                  : checkoutStep === 2
                  ? (lang === "EN"
                      ? "Scan the QRIS code with any e-wallet or mobile banking app."
                      : "Scan kode QRIS dengan e-wallet atau mobile banking apa pun.")
                  : checkoutStep === 3
                  ? (lang === "EN"
                      ? "Your meal is being prepared by the kitchen."
                      : "Pesananmu sedang disiapkan oleh dapur kantin.")
                  : (lang === "EN"
                      ? "Show this code to the canteen staff."
                      : "Tunjukkan kode ini ke petugas kantin saat mengambil pesanan.")}
              </p>
            </div>

            {checkoutStep === 1 && cartItems.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-xl)",
                  border: "1px dashed var(--border-input)",
                  padding: "60px 28px",
                  boxShadow: "var(--shadow-sm)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-cream)",
                    color: "var(--maroon)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <ShoppingBag size={28} />
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "var(--maroon)",
                    marginBottom: 6,
                  }}
                >
                  {t.emptyCartTitle}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-muted)",
                    maxWidth: 440,
                    margin: "0 auto 22px",
                    lineHeight: 1.5,
                  }}
                >
                  {t.emptyCartDesc}
                </p>
                <button
                  onClick={() => setNavTab("home")}
                  className="btn-interactive btn-lift"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "13px 28px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "var(--orange)",
                    color: "var(--maroon)",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  }}
                >
                  <Plus size={16} strokeWidth={2.8} />
                  <span>{t.browseMenuBtn}</span>
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "16px 28px",
                    marginBottom: 32,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "10%",
                    right: "10%",
                    height: 2,
                    backgroundColor: "var(--border-input)",
                    zIndex: 1,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      backgroundColor: "var(--maroon)",
                      width:
                        checkoutStep === 1
                          ? "0%"
                          : checkoutStep === 2
                          ? "33%"
                          : checkoutStep === 3
                          ? "66%"
                          : "100%",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {[
                  { step: 1, label: t.stepCart, icon: ShoppingBag },
                  { step: 2, label: t.stepPayment, icon: QrCode },
                  { step: 3, label: t.stepPreparing, icon: Clock },
                  { step: 4, label: t.stepPickup, icon: Store },
                ].map((s) => {
                  const Icon = s.icon;
                  const isDone = checkoutStep > s.step;
                  const isActive = checkoutStep === s.step;
                  return (
                    <div
                      key={s.step}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        zIndex: 2,
                        backgroundColor: "#FFFFFF",
                        padding: "0 8px",
                      }}
                    >
                      <div
                        onClick={() => {
                          if (s.step < checkoutStep) setCheckoutStep(s.step);
                        }}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          backgroundColor: isDone
                            ? "var(--maroon)"
                            : isActive
                            ? "var(--orange)"
                            : "#F3ECE8",
                          color: isDone || isActive ? "#FFFFFF" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: s.step < checkoutStep ? "pointer" : "default",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isDone ? <Check size={18} strokeWidth={2.8} /> : <Icon size={18} />}
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: isActive ? 800 : 600,
                          color: isActive ? "var(--maroon)" : "var(--text-muted)",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {checkoutStep === 1 && (
              <div className="grid-checkout-split">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "24px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)" }}>
                      {t.cartTitle} ({cartItems.length} {t.itemsUnit})
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {cartItems.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearCart}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--text-muted)",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {lang === "EN" ? "Clear" : "Kosongkan"}
                        </button>
                      )}
                      <button
                        onClick={() => setNavTab("home")}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "var(--maroon)",
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {t.addMore}
                      </button>
                    </div>
                  </div>

                  {cartItems.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text-muted)" }}>
                      Your cart is empty. Click "+ Add more" to choose meals!
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {cartItems.map((item) => (
                        <div
                          key={item.id_menu}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingBottom: 16,
                            borderBottom: "1px solid var(--border-light)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <button
                              onClick={() => handleRemoveItem(item.id_menu)}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                padding: 2,
                              }}
                            >
                              <X size={16} />
                            </button>

                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: "var(--radius-md)",
                                backgroundColor: "var(--bg-warm-img)",
                                overflow: "hidden",
                              }}
                            >
                              <SafeImage
                                src={item.gambar}
                                alt={item.nama_menu}
                                iconSize={20}
                              />
                            </div>

                            <div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--maroon)" }}>
                                {item.nama_menu}
                              </div>
                              <div
                                className="tabular"
                                style={{ fontSize: 13, color: "var(--text-muted)" }}
                              >
                                {formatRupiah(item.harga)} each
                              </div>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "4px 10px",
                                borderRadius: "var(--radius-pill)",
                                border: "1px solid var(--border-input)",
                              }}
                            >
                              <button
                                onClick={() => handleUpdateQty(item.id_menu, -1)}
                                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}
                              >
                                <Minus size={13} color="var(--maroon)" />
                              </button>
                              <span
                                className="tabular"
                                style={{ fontSize: 14, fontWeight: 800, padding: "0 10px", color: "var(--maroon)" }}
                              >
                                {item.jumlah}
                              </span>
                              <button
                                onClick={() => handleUpdateQty(item.id_menu, 1)}
                                style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}
                              >
                                <Plus size={13} color="var(--maroon)" />
                              </button>
                            </div>

                            <div
                              className="tabular"
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "var(--maroon)",
                                minWidth: 80,
                                textAlign: "right",
                              }}
                            >
                              {formatRupiah(item.harga * item.jumlah)}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div style={{ paddingTop: 6 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--maroon)",
                            marginBottom: 6,
                          }}
                        >
                          {lang === "EN" ? "Order note (optional)" : "Keterangan / catatan pesanan (opsional)"}
                        </label>
                        <input
                          type="text"
                          value={orderNote}
                          onChange={(e) => setOrderNote(e.target.value)}
                          placeholder={
                            lang === "EN"
                              ? "e.g. Less spicy, separate sambal, extra spoon..."
                              : "Contoh: Tidak pedas, sambal dipisah, minta sendok..."
                          }
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-input)",
                            fontSize: 13,
                            color: "var(--maroon)",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "24px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>
                    {t.promosTitle}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                    {t.pickPromo}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    <div
                      onClick={() => setSelectedPromo(null)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: !selectedPromo ? "var(--bg-cream)" : "#FFFFFF",
                        border: !selectedPromo ? "1.5px solid var(--maroon)" : "1px solid var(--border-input)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--maroon)",
                      }}
                    >
                      <span>{lang === "EN" ? "Do not use promo" : "Tidak pakai promo"}</span>
                      {!selectedPromo && <Check size={14} strokeWidth={3} />}
                    </div>

                    {availablePromos.map((promo) => {
                      const isSelected = selectedPromo?.code === promo.code;
                      return (
                        <div
                          key={promo.code}
                          onClick={() => setSelectedPromo(isSelected ? null : promo)}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: isSelected ? "var(--orange-soft)" : "#FFFFFF",
                            border: isSelected ? "1.5px solid var(--orange)" : "1px solid var(--border-input)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: isSelected ? "var(--orange)" : "var(--bg-cream)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: isSelected ? "#FFFFFF" : "var(--maroon)",
                              }}
                            >
                              <Tag size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <span>{promo.title}</span>
                                {promo.isTenantPromo && (
                                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, backgroundColor: "var(--maroon)", color: "#FFFFFF" }}>
                                    {lang === "EN" ? "Tenant Promo" : "Khusus Tenant"}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {promo.subtitle}
                              </div>
                            </div>
                          </div>

                          {isSelected ? (
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                backgroundColor: "var(--maroon)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={13} color="#FFFFFF" strokeWidth={3} />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: "1px solid var(--border-input)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Plus size={13} color="var(--text-muted)" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: "var(--text-muted)" }}>{t.subtotal}</span>
                      <span className="tabular font-medium">{formatRupiah(subtotal)}</span>
                    </div>

                    {selectedPromo && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--orange-tag)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          Promo <span style={{ padding: "1px 6px", borderRadius: 4, backgroundColor: "var(--orange-soft)", fontSize: 11, fontWeight: 700 }}>{selectedPromo.code}</span>
                        </span>
                        <span className="tabular font-medium">-{formatRupiah(promoDiscount)}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: "var(--text-muted)" }}>{t.serviceFee}</span>
                      <span style={{ color: "#059669", fontWeight: 700 }}>{t.free}</span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid var(--border-light)",
                        paddingTop: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 17, fontWeight: 900, color: "var(--maroon)" }}>{t.total}</span>
                      <span
                        className="tabular"
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          color: "var(--maroon)",
                        }}
                      >
                        {formatRupiah(orderTotal)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        setIsAuthOpen(true);
                        notify(
                          lang === "EN"
                            ? "Please sign in first to continue payment."
                            : "Silakan login terlebih dahulu untuk melanjutkan pembayaran.",
                          "error"
                        );
                        return;
                      }
                      setCheckoutError("");
                      setPaymentTimerSeconds(899);
                      setCheckoutStep(2);
                    }}
                    disabled={cartItems.length === 0}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      backgroundColor: "var(--orange)",
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(248, 163, 75, 0.4)",
                    }}
                  >
                    <span>{t.continuePayment}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
            {checkoutStep === 2 && (
              <div className="grid-payment-split">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "26px",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 18 }}>
                    {t.orderSummary}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                    {(activeOrder?.id_pesanan && cartItems.length === 0
                      ? activeOrder.details || []
                      : cartItems
                    ).map((item) => {
                      const unitPrice = Number(item.harga ?? item.menu?.harga ?? 0);
                      const qty = Number(item.jumlah || 1);
                      return (
                        <div
                          key={item.id_menu || item.id_detail}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                backgroundColor: "var(--bg-warm-img)",
                                overflow: "hidden",
                              }}
                            >
                              <SafeImage
                                src={item.gambar || item.menu?.gambar}
                                alt={item.nama_menu || item.menu?.nama_menu}
                                iconSize={18}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--maroon)" }}>
                                {item.nama_menu || item.menu?.nama_menu}
                              </div>
                              <div className="tabular" style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {formatRupiah(unitPrice)} each · × {qty}
                              </div>
                            </div>
                          </div>

                          <div className="tabular font-bold" style={{ fontSize: 15, color: "var(--maroon)" }}>
                            {formatRupiah(unitPrice * qty)}
                          </div>
                        </div>
                      );
                    })}

                    <div style={{ borderTop: "1px dashed var(--border-light)", margin: "6px 0" }} />

                    {!(activeOrder?.id_pesanan && cartItems.length === 0) && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                          <span>Subtotal</span>
                          <span className="tabular font-medium">{formatRupiah(subtotal)}</span>
                        </div>

                        {selectedPromo && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--orange-tag)" }}>
                            <span>Promo {selectedPromo.code}</span>
                            <span className="tabular font-medium">-{formatRupiah(promoDiscount)}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)" }}>
                      <span>Service fee</span>
                      <span style={{ color: "#059669", fontWeight: 700 }}>Free</span>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid var(--border-light)",
                        paddingTop: 10,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)" }}>Total</span>
                      <span className="tabular" style={{ fontSize: 19, fontWeight: 900, color: "var(--maroon)" }}>
                        {formatRupiah(
                          activeOrder?.id_pesanan && cartItems.length === 0
                            ? Number(activeOrder.total_harga ?? activeOrder.total ?? 0)
                            : orderTotal
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (activeOrder?.id_pesanan && cartItems.length === 0) {
                        setActiveOrderId(null);
                        setActiveOrder(null);
                        setCheckoutStep(1);
                        setNavTab("history");
                      } else {
                        setCheckoutStep(1);
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "11px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--border-input)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--maroon)",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t.cancelEdit}
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-light)",
                    padding: "32px 28px",
                    boxShadow: "var(--shadow-sm)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 17, fontWeight: 800, color: "var(--maroon)", marginBottom: 2 }}>
                    {t.scanToPay}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    {t.amountDue}
                  </div>
                  <div
                    className="tabular"
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      marginBottom: 20,
                    }}
                  >
                    {formatRupiah(
                      activeOrder?.id_pesanan && cartItems.length === 0
                        ? Number(activeOrder.total_harga ?? activeOrder.total ?? 0)
                        : orderTotal
                    )}
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: 220,
                      height: 220,
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--maroon)",
                      padding: 16,
                      boxShadow: "0 8px 24px rgba(82, 42, 40, 0.15)",
                      overflow: "hidden",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="animate-scan"
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 3,
                        backgroundColor: "var(--orange)",
                        boxShadow: "0 0 10px rgba(248, 163, 75, 0.9)",
                        zIndex: 4,
                      }}
                    />
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", shapeRendering: "crispEdges" }}>
                      <rect x="0" y="0" width="30" height="30" fill="#FFFFFF" />
                      <rect x="5" y="5" width="20" height="20" fill="#522A28" />
                      <rect x="10" y="10" width="10" height="10" fill="#FFFFFF" />

                      <rect x="70" y="0" width="30" height="30" fill="#FFFFFF" />
                      <rect x="75" y="5" width="20" height="20" fill="#522A28" />
                      <rect x="80" y="10" width="10" height="10" fill="#FFFFFF" />

                      <rect x="0" y="70" width="30" height="30" fill="#FFFFFF" />
                      <rect x="5" y="75" width="20" height="20" fill="#522A28" />
                      <rect x="10" y="80" width="10" height="10" fill="#FFFFFF" />

                      <rect x="38" y="12" width="8" height="18" fill="#FFFFFF" />
                      <rect x="52" y="8" width="10" height="10" fill="#FFFFFF" />
                      <rect x="42" y="42" width="16" height="16" fill="#F8A34B" />
                      <rect x="68" y="42" width="12" height="12" fill="#FFFFFF" />
                      <rect x="85" y="55" width="10" height="10" fill="#FFFFFF" />
                      <rect x="38" y="72" width="12" height="20" fill="#FFFFFF" />
                      <rect x="55" y="82" width="15" height="10" fill="#FFFFFF" />
                      <rect x="75" y="75" width="20" height="15" fill="#FFFFFF" />
                    </svg>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                      marginBottom: 18,
                    }}
                  >
                    QRIS · LET'S ORDER CANTEEN
                  </div>
                  <div
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--bg-cream)",
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                      <Timer size={15} />
                      <span>{t.paymentTimer}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                      {lang === "EN"
                        ? "Your order is held until the timer runs out."
                        : "Pesanan Anda ditahan hingga batas waktu pembayaran berakhir."}
                    </div>
                    <div
                      className="tabular"
                      style={{
                        fontSize: 34,
                        fontWeight: 900,
                        color: "var(--maroon)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {formatTimer(paymentTimerSeconds)}
                    </div>
                  </div>

                  {checkoutError && (
                    <div
                      role="alert"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "left",
                        padding: "11px 14px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "#FDF0EE",
                        border: "1px solid #F2CCC7",
                        color: "#C84336",
                        fontSize: 13,
                        fontWeight: 700,
                        marginBottom: 14,
                        width: "100%",
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleCompletePayment}
                    disabled={isPaying}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      backgroundColor: "var(--orange)",
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 14px rgba(248, 163, 75, 0.4)",
                    }}
                  >
                    <Check size={18} strokeWidth={2.8} />
                    <span>
                      {isPaying
                        ? lang === "EN"
                          ? "Verifying QRIS payment…"
                          : "Memverifikasi pembayaran QRIS…"
                        : t.completePaymentBtn}
                    </span>
                  </button>
                  {activeOrder?.id_pesanan && (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(activeOrder)}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "11px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid #F2CCC7",
                        backgroundColor: "#FDF0EE",
                        color: "#C84336",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "Cancel order" : "Batalkan pesanan"}
                    </button>
                  )}
                </div>
              </div>
            )}
            {checkoutStep === 3 && (
              <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }} className="animate-fade">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    padding: "36px 32px",
                    boxShadow: "var(--shadow-card)",
                    border: "1px solid var(--border-light)",
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "4px 14px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor:
                        activeOrder?.status_pesanan === "Siap Diambil" ||
                        activeOrder?.status_pesanan === "Selesai"
                          ? "var(--orange)"
                          : "var(--status-preparing-bg)",
                      color:
                        activeOrder?.status_pesanan === "Siap Diambil" ||
                        activeOrder?.status_pesanan === "Selesai"
                          ? "var(--maroon)"
                          : "var(--status-preparing-text)",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 16,
                    }}
                  >
                    <span>●</span>
                    <span>
                      {activeOrder?.status_pesanan === "Siap Diambil"
                        ? lang === "EN"
                          ? "Ready for pickup!"
                          : "Siap diambil!"
                        : activeOrder?.status_pesanan === "Selesai"
                        ? lang === "EN"
                          ? "Completed"
                          : "Selesai"
                        : activeOrder?.status_pesanan === "Menunggu Pembayaran"
                        ? lang === "EN"
                          ? "Awaiting confirmation"
                          : "Menunggu konfirmasi"
                        : lang === "EN"
                        ? "Preparing"
                        : "Sedang disiapkan"}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 8 }}>
                    {lang === "EN" ? "Your queue number" : "Nomor antrean Anda"}
                  </div>
                  <div
                    className="tabular"
                    style={{
                      fontSize: 72,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                      marginBottom: 14,
                    }}
                  >
                    {activeOrder?.nomor_antrean || activeQueueCode}
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)", marginBottom: 16 }}>
                    {activeOrder?.items_summary || "Campus Meal Order"}
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 18px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--bg-footer-drawer)",
                      color: "var(--maroon)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <MapPin size={15} color="var(--orange)" />
                    <span>
                      {lang === "EN" ? "Pick up at " : "Ambil di "}
                      {activeOrder?.tenant_name || "Campus Canteen"}
                      {activeOrder?.booth ? `, ${activeOrder.booth}` : ""}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    padding: "24px",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow-sm)",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                    Time to pickup
                  </div>
                  <div
                    className="tabular"
                    style={{
                      fontSize: 48,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      lineHeight: 1,
                      marginBottom: 10,
                    }}
                  >
                    {formatTimer(prepTimerSeconds)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Come by when the timer ends — no need to wait in line.
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutStep(4)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-input)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--maroon)",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <span>I'm at the counter</span>
                  <ArrowRight size={16} />
                </button>
                {activeOrder?.id_pesanan &&
                  activeOrder?.status_pesanan !== "Siap Diambil" &&
                  activeOrder?.status_pesanan !== "Selesai" && (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(activeOrder)}
                      style={{
                        width: "100%",
                        marginTop: 10,
                        padding: "11px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid #F2CCC7",
                        backgroundColor: "#FDF0EE",
                        color: "#C84336",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "Cancel order" : "Batalkan pesanan"}
                    </button>
                  )}
              </div>
            )}
            {checkoutStep === 4 && (
              <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }} className="animate-fade">
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    padding: "36px 32px",
                    boxShadow: "var(--shadow-card)",
                    border: "1px solid var(--border-light)",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                    {lang === "EN" ? "Pickup code" : "Kode pengambilan"}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "var(--maroon)", marginBottom: 20 }}>
                    {lang === "EN" ? "Queue " : "Antrean "}
                    {activeOrder?.nomor_antrean || activeQueueCode}
                  </div>
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      margin: "0 auto 20px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "var(--maroon)",
                      padding: 16,
                      boxShadow: "0 6px 18px rgba(82, 42, 40, 0.12)",
                    }}
                  >
                    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", shapeRendering: "crispEdges" }}>
                      <rect x="0" y="0" width="30" height="30" fill="#FFFFFF" />
                      <rect x="5" y="5" width="20" height="20" fill="#522A28" />
                      <rect x="10" y="10" width="10" height="10" fill="#FFFFFF" />

                      <rect x="70" y="0" width="30" height="30" fill="#FFFFFF" />
                      <rect x="75" y="5" width="20" height="20" fill="#522A28" />
                      <rect x="80" y="10" width="10" height="10" fill="#FFFFFF" />

                      <rect x="0" y="70" width="30" height="30" fill="#FFFFFF" />
                      <rect x="5" y="75" width="20" height="20" fill="#522A28" />
                      <rect x="10" y="80" width="10" height="10" fill="#FFFFFF" />

                      <rect x="40" y="15" width="10" height="20" fill="#FFFFFF" />
                      <rect x="45" y="45" width="18" height="18" fill="#F8A34B" />
                      <rect x="70" y="50" width="15" height="15" fill="#FFFFFF" />
                      <rect x="40" y="75" width="20" height="15" fill="#FFFFFF" />
                      <rect x="75" y="75" width="20" height="15" fill="#FFFFFF" />
                    </svg>
                  </div>

                  <div style={{ borderTop: "1px dashed var(--border-light)", margin: "16px 0" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 15, color: "var(--text-muted)" }}>Total</span>
                    <span className="tabular font-bold" style={{ fontSize: 16, color: "var(--maroon)" }}>
                      {formatRupiah(activeOrder?.total_harga ?? orderTotal)}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
                  Show this code to the canteen staff. Tap below once you've received your food.
                </p>

                <button
                  onClick={handleFinishOrder}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "var(--orange)",
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: "0 4px 16px rgba(248, 163, 75, 0.4)",
                  }}
                >
                  <Check size={18} strokeWidth={2.8} />
                  <span>Finish order</span>
                </button>
              </div>
            )}
              </>
            )}
          </div>
        )}
        {navTab === "history" && (
          <div className="container-app animate-fade" style={{ paddingTop: 32, maxWidth: 960 }}>
            <div style={{ marginBottom: 24 }}>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "var(--maroon)",
                  letterSpacing: "-0.02em",
                  marginBottom: 4,
                }}
              >
                {t.historyTitle}
              </h1>
              <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
                {t.historyDesc}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                { key: "All", label: t.filterAll },
                { key: "In progress", label: t.filterInProgress },
                { key: "Completed", label: t.filterCompleted },
                { key: "Cancelled", label: t.filterCancelled },
              ].map((tab) => {
                const active = historyFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setHistoryFilter(tab.key)}
                    style={{
                      padding: "8px 22px",
                      borderRadius: "var(--radius-pill)",
                      border: active ? "none" : "1px solid var(--border-input)",
                      backgroundColor: active ? "var(--maroon)" : "#FFFFFF",
                      color: active ? "#FFFFFF" : "var(--maroon)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
                overflow: "hidden",
              }}
            >
              {(() => {
                const filteredHistory = ordersHistory.filter((order) => {
                  const isInProgress =
                    ["Awaiting payment", "Preparing", "Ready for pickup", "Ready"].includes(
                      order.status
                    ) ||
                    ["Menunggu Pembayaran", "Sedang Diproses", "Diproses", "Siap Diambil"].includes(
                      order.raw_status
                    );
                  if (historyFilter === "All") return true;
                  if (historyFilter === "In progress") return isInProgress;
                  return order.status === historyFilter;
                });

                if (filteredHistory.length === 0) {
                  return (
                    <div
                      style={{
                        padding: "44px 24px",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "var(--maroon)",
                          marginBottom: 4,
                        }}
                      >
                        {lang === "EN" ? "No orders found" : "Belum ada riwayat pesanan"}
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {historyFilter === "All"
                          ? lang === "EN"
                            ? "Your past and active canteen orders will appear here."
                            : "Pesanan aktif maupun selesai akan tampil di sini."
                          : lang === "EN"
                          ? "There are no orders with this status right now."
                          : "Tidak ada pesanan dengan status ini saat ini."}
                      </div>
                    </div>
                  );
                }

                const statusLabelMap = {
                  "Awaiting payment": lang === "EN" ? "Awaiting payment" : "Menunggu bayar",
                  Preparing: lang === "EN" ? "Preparing" : "Diproses",
                  "Ready for pickup": lang === "EN" ? "Ready for pickup" : "Siap diambil",
                  Ready: lang === "EN" ? "Ready for pickup" : "Siap diambil",
                  Completed: lang === "EN" ? "Completed" : "Selesai",
                  Cancelled: lang === "EN" ? "Cancelled" : "Dibatalkan",
                };

                return filteredHistory.map((order, idx, arr) => {
                  const isInProgress =
                    ["Awaiting payment", "Preparing", "Ready for pickup", "Ready"].includes(
                      order.status
                    ) ||
                    ["Menunggu Pembayaran", "Sedang Diproses", "Diproses", "Siap Diambil"].includes(
                      order.raw_status
                    );
                  const isReadyStatus =
                    order.status === "Ready for pickup" || order.status === "Ready";

                  return (
                    <div
                      key={order.id_pesanan}
                      onClick={() => {
                        if (isInProgress) handleResumeOrder(order);
                      }}
                      className="order-row-card"
                      style={{
                        padding: "18px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                        borderBottom: idx !== arr.length - 1 ? "1px solid var(--border-light)" : "none",
                        cursor: isInProgress ? "pointer" : "default",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: "var(--radius-md)",
                            backgroundColor: isInProgress ? "var(--maroon)" : "#F3ECE8",
                            color: isInProgress ? "#FFFFFF" : "var(--maroon)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {order.nomor_antrean ? (
                            <span style={{ fontSize: 12, fontWeight: 900 }}>
                              {order.nomor_antrean}
                            </span>
                          ) : (
                            <Store size={20} color="var(--maroon)" />
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)" }}>
                            {order.items_breakdown || order.items_summary}
                          </div>
                          <div
                            className="tabular"
                            style={{ fontSize: 13, color: "var(--text-muted)" }}
                          >
                            {order.tenant_name} · {order.tanggal} · {formatRupiah(order.total)}
                            {order.promo_code ? ` · Promo ${order.promo_code}` : ""}
                          </div>
                          {(order.catatan || order.alasan_batal) && (
                            <div
                              style={{
                                fontSize: 12,
                                color: order.status === "Cancelled" ? "#C84336" : "var(--maroon)",
                                marginTop: 3,
                                fontWeight: 600,
                              }}
                            >
                              {order.alasan_batal
                                ? `${lang === "EN" ? "Cancelled:" : "Alasan batal:"} ${order.alasan_batal}`
                                : `${lang === "EN" ? "Note:" : "Keterangan:"} ${order.catatan}`}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="order-row-actions"
                        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "5px 14px",
                            borderRadius: "var(--radius-pill)",
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor:
                              order.status === "Completed"
                                ? "var(--maroon)"
                                : order.status === "Cancelled"
                                ? "var(--status-cancelled-bg)"
                                : isReadyStatus
                                ? "var(--orange)"
                                : "var(--status-preparing-bg)",
                            color:
                              order.status === "Completed"
                                ? "#FFFFFF"
                                : order.status === "Cancelled"
                                ? "var(--text-muted)"
                                : isReadyStatus
                                ? "var(--maroon)"
                                : "var(--status-preparing-text)",
                          }}
                        >
                          <span>●</span>
                          <span>{statusLabelMap[order.status] || order.status}</span>
                        </span>

                        {isInProgress ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResumeOrder(order);
                              }}
                              style={{
                                border: "1px solid var(--border-input)",
                                backgroundColor: "#FFFFFF",
                                color: "var(--maroon)",
                                borderRadius: "var(--radius-pill)",
                                padding: "6px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <span>{lang === "EN" ? "Track" : "Lihat"}</span>
                              <ChevronRight size={14} />
                            </button>
                            {!isReadyStatus && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCancelModal(order);
                                }}
                                style={{
                                  border: "1px solid #F2CCC7",
                                  backgroundColor: "#FDF0EE",
                                  color: "#C84336",
                                  borderRadius: "var(--radius-pill)",
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {lang === "EN" ? "Cancel" : "Batal"}
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            {order.status === "Completed" && !order.has_reviewed && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReviewModal(order);
                                }}
                                style={{
                                  border: "none",
                                  backgroundColor: "var(--orange)",
                                  color: "var(--maroon)",
                                  borderRadius: "var(--radius-pill)",
                                  padding: "6px 12px",
                                  fontSize: 12,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Star size={12} fill="var(--maroon)" color="var(--maroon)" />
                                <span>{lang === "EN" ? "Rate" : "Beri Rating"}</span>
                              </button>
                            )}
                            {order.status === "Completed" && order.has_reviewed && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--orange-tag)",
                                }}
                              >
                                <Star size={12} fill="#F8A34B" color="#F8A34B" />
                                <span>
                                  {order.reviews?.[0]?.rating || 5}.0 ·{" "}
                                  {lang === "EN" ? "Reviewed" : "Sudah diulas"}
                                </span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(order);
                              }}
                              title={lang === "EN" ? "Reorder items" : "Pesan ulang"}
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "var(--text-muted)",
                                padding: 4,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              <RotateCcw size={14} />
                              <ChevronRight size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
          </>
        )}
      </main>
      {editingDish && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1250,
            backgroundColor: "rgba(82, 42, 40, 0.38)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          className="animate-fade"
          onClick={() => setEditingDish(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-zoom"
            style={{
              width: "100%",
              maxWidth: 460,
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "26px 28px",
              boxShadow: "var(--shadow-float)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: "var(--maroon)",
                    marginBottom: 2,
                  }}
                >
                  Edit menu
                </h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Changes appear to customers right away.
                </p>
              </div>

              <button
                onClick={() => setEditingDish(null)}
                className="btn-interactive"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--border-light)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Close edit modal"
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>
            <div
              style={{
                backgroundColor: "var(--bg-subtle)",
                borderRadius: 16,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "var(--bg-warm-img)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <SafeImage
                  src={editingDish.gambar}
                  alt={editingDish.nama_menu}
                  iconSize={18}
                />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--maroon)",
                    marginBottom: 2,
                  }}
                >
                  {editDishForm.nama_menu || editingDish.nama_menu}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {editingDish.kategori_nama} ·{" "}
                  {formatRupiah(Number(editDishForm.harga) || editingDish.harga)}
                </div>
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditMenuError("");
                const parsedPrice =
                  Number(String(editDishForm.harga).replace(/\D/g, "")) ||
                  editingDish.harga;
                const nextName = editDishForm.nama_menu || editingDish.nama_menu;
                try {
                  await api.updateVendorMenu(editingDish.id_menu, {
                    nama_menu: nextName,
                    harga: parsedPrice,
                    status_tersedia: editDishForm.available,
                  });
                  setTenantMenus((prev) =>
                    prev.map((m) =>
                      m.id_menu === editingDish.id_menu
                        ? {
                            ...m,
                            nama_menu: nextName,
                            harga: parsedPrice,
                            available: editDishForm.available,
                            status_tersedia: editDishForm.available,
                          }
                        : m
                    )
                  );
                  setMenusList((prev) =>
                    prev.map((m) =>
                      m.id_menu === editingDish.id_menu
                        ? {
                            ...m,
                            nama_menu: nextName,
                            harga: parsedPrice,
                            available: editDishForm.available,
                            status_tersedia: editDishForm.available,
                          }
                        : m
                    )
                  );
                  setEditingDish(null);
                  syncFromApi();
                } catch (err) {
                  setEditMenuError(err.message || "Gagal menyimpan perubahan menu.");
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {editMenuError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {editMenuError}
                </div>
              )}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--maroon)",
                    marginBottom: 6,
                  }}
                >
                  Menu name
                </label>
                <input
                  type="text"
                  required
                  value={editDishForm.nama_menu}
                  onChange={(e) =>
                    setEditDishForm((prev) => ({
                      ...prev,
                      nama_menu: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-input)",
                    fontSize: 14,
                    color: "var(--maroon)",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--maroon)",
                    marginBottom: 6,
                  }}
                >
                  Price
                </label>
                <input
                  type="text"
                  required
                  value={editDishForm.harga}
                  onChange={(e) =>
                    setEditDishForm((prev) => ({
                      ...prev,
                      harga: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-input)",
                    fontSize: 14,
                    color: "var(--maroon)",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  borderRadius: 16,
                  border: "1px solid var(--border-light)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "var(--maroon)",
                      marginBottom: 2,
                    }}
                  >
                    Availability
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      lineHeight: 1.4,
                    }}
                  >
                    Customers can only order this dish when it is available.
                  </div>
                </div>

                <div
                  onClick={() =>
                    setEditDishForm((prev) => ({
                      ...prev,
                      available: !prev.available,
                    }))
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    userSelect: "none",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 999,
                      backgroundColor: editDishForm.available
                        ? "var(--orange)"
                        : "#D8D2CE",
                      position: "relative",
                      transition: "background-color 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        position: "absolute",
                        top: 3,
                        left: editDishForm.available ? 23 : 3,
                        transition: "left 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--maroon)",
                    }}
                  >
                    {editDishForm.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="btn-interactive"
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-input)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--maroon)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-interactive btn-lift"
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "var(--orange)",
                    color: "var(--maroon)",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  }}
                >
                  Save changes
                </button>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const idToDelete = editingDish.id_menu;
                  setTenantMenus((prev) => prev.filter((m) => m.id_menu !== idToDelete));
                  setMenusList((prev) => prev.filter((m) => m.id_menu !== idToDelete));
                  setEditingDish(null);
                  await api.deleteVendorMenu(idToDelete).catch(() => {});
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#B91C1C",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  paddingTop: 4,
                }}
              >
                <Trash2 size={14} />
                <span>Hapus menu ini</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1150,
            backgroundColor: "rgba(42, 24, 18, 0.45)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setIsAddMenuOpen(false)}
          className="animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-zoom"
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "26px 28px 24px",
              boxShadow: "0 20px 50px rgba(82, 42, 40, 0.24)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
                  Upload Menu Baru
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Tambahkan makanan atau minuman ke kantin {displayName}.
                </p>
              </div>
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="btn-interactive"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "var(--bg-cream)",
                  color: "var(--maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setAddMenuError("");
                setIsUploadingMenu(true);
                const kategoriNama = newDishForm.kategori_nama || "Rice & Mains";
                const parsedPrice = Number(String(newDishForm.harga).replace(/\D/g, "")) || 10000;
                const payload = {
                  nama_menu: newDishForm.nama_menu,
                  harga: parsedPrice,
                  id_kategori: CATEGORY_ID_MAP[kategoriNama] || 1,
                  kategori_nama: kategoriNama,
                  estimasi_menit: Number(newDishForm.estimasi_menit) || 10,
                  deskripsi: newDishForm.deskripsi || `Menu segar dari ${displayName}.`,
                  gambar:
                    newDishForm.gambar ||
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&auto=format&fit=crop&q=80",
                  status_tersedia: true,
                };
                try {
                  const res = await api.createVendorMenu(payload);
                  const created = res?.data;
                  if (created) {
                    const normalized = normalizeMenuRecord(created);
                    setTenantMenus((prev) =>
                      prev.some((m) => m.id_menu === normalized.id_menu)
                        ? prev
                        : [...prev, normalized]
                    );
                    setMenusList((prev) =>
                      prev.some((m) => m.id_menu === normalized.id_menu)
                        ? prev
                        : [...prev, normalized]
                    );
                  }
                  setTenantMenuFilter("All");
                  setTenantMenuSearch("");
                  await syncFromApi();
                  setIsAddMenuOpen(false);
                } catch (err) {
                  setAddMenuError(
                    err.message || "Gagal menyimpan menu baru. Periksa koneksi backend atau ukuran foto."
                  );
                } finally {
                  setIsUploadingMenu(false);
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {addMenuError && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <AlertCircle size={15} />
                  <span>{addMenuError}</span>
                </div>
              )}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                  Nama Menu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ayam Geprek Sambal Bawang"
                  value={newDishForm.nama_menu}
                  onChange={(e) => setNewDishForm((p) => ({ ...p, nama_menu: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-input)",
                    fontSize: 14,
                    color: "var(--maroon)",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="18000"
                    value={newDishForm.harga}
                    onChange={(e) => setNewDishForm((p) => ({ ...p, harga: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-input)",
                      fontSize: 14,
                      color: "var(--maroon)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                    Kategori
                  </label>
                  <select
                    value={newDishForm.kategori_nama}
                    onChange={(e) => setNewDishForm((p) => ({ ...p, kategori_nama: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-input)",
                      fontSize: 14,
                      color: "var(--maroon)",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                    }}
                  >
                    <option value="Rice & Mains">Rice & Mains</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                    Estimasi Siap (Menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newDishForm.estimasi_menit}
                    onChange={(e) => setNewDishForm((p) => ({ ...p, estimasi_menit: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-input)",
                      fontSize: 14,
                      color: "var(--maroon)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                    Upload Foto Menu
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAddMenuError("");
                      try {
                        const compressed = await readAndCompressImageFile(file, 900, 0.82);
                        setNewDishForm((p) => ({ ...p, gambar: compressed }));
                      } catch (err) {
                        setAddMenuError(err.message || "Gagal memproses foto menu.");
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 12,
                      border: "1px solid var(--border-input)",
                      fontSize: 12,
                      color: "var(--maroon)",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                  Atau Masukkan URL Gambar (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newDishForm.gambar?.startsWith("data:") ? "" : newDishForm.gambar}
                  onChange={(e) => setNewDishForm((p) => ({ ...p, gambar: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-input)",
                    fontSize: 13,
                    color: "var(--maroon)",
                    outline: "none",
                  }}
                />
              </div>

              {newDishForm.gambar && (
                <div
                  style={{
                    height: 120,
                    borderRadius: 12,
                    overflow: "hidden",
                    backgroundColor: "var(--bg-warm-img)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <img
                    src={newDishForm.gambar}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                  Deskripsi Menu
                </label>
                <textarea
                  rows={2}
                  placeholder="Jelaskan bahan dan keunggulan menu ini..."
                  value={newDishForm.deskripsi}
                  onChange={(e) => setNewDishForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--border-input)",
                    fontSize: 13,
                    color: "var(--maroon)",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setIsAddMenuOpen(false)}
                  className="btn-interactive"
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-input)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--maroon)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMenu}
                  className="btn-interactive btn-lift"
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "var(--orange)",
                    color: "var(--maroon)",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: isUploadingMenu ? "not-allowed" : "pointer",
                    opacity: isUploadingMenu ? 0.7 : 1,
                    boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  }}
                >
                  {isUploadingMenu ? "Menyimpan..." : "Simpan & Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {drawerMounted && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(5px)",
            opacity: drawerActive ? 1 : 0,
            transition: "opacity 0.3s ease",
            pointerEvents: drawerActive ? "auto" : "none",
          }}
          onClick={closeDrawer}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: "100%",
              maxWidth: 350,
              backgroundColor: "#FFFFFF",
              borderTopRightRadius: "24px",
              borderBottomRightRadius: "24px",
              boxShadow: "0 20px 48px rgba(82, 42, 40, 0.18)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              transform: drawerActive ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <div style={{ padding: "24px 22px 0" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  onClick={closeDrawer}
                  className="btn-interactive"
                  style={{
                    border: "none",
                    background: "var(--bg-cream)",
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    cursor: "pointer",
                    color: "var(--maroon)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Close menu"
                >
                  <X size={18} strokeWidth={2.4} />
                </button>
              </div>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div
                  onClick={() => {
                    closeDrawer();
                    openDrawerModal("profile");
                  }}
                  className="btn-interactive"
                  style={{
                    position: "relative",
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    backgroundColor: "var(--bg-cream)",
                    border: "3px solid #EDD1B4",
                    color: "var(--maroon)",
                    fontSize: 24,
                    fontWeight: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(82, 42, 40, 0.1)",
                    cursor: "pointer",
                  }}
                >
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={displayName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>{displayInitials}</span>
                  )}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--maroon)" }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                  {currentUser?.email || (portalMode === "tenant" ? "Tenant Portal · Let's Order" : "Pengguna · Let's Order")}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-light)",
                  overflow: "hidden",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {[
                  { id: "profile", label: t.drawerProfile, icon: User },
                  { id: "favorites", label: t.drawerFavorites, icon: Heart },
                  { id: "notifications", label: t.drawerNotifications, icon: Bell },
                  { id: "help", label: t.drawerHelp, icon: HelpCircle },
                ].map((item, idx, arr) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        closeDrawer();
                        openDrawerModal(item.id);
                      }}
                      className="drawer-item"
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        border: "none",
                        borderBottom: idx !== arr.length - 1 ? "1px solid var(--border-light)" : "none",
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            backgroundColor: "var(--bg-cream)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--maroon)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--maroon)" }}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight size={16} color="var(--text-light)" className="drawer-chevron" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-footer-drawer)",
                padding: "20px 22px",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <button
                onClick={handleLogout}
                className="btn-interactive btn-lift"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  backgroundColor: "var(--maroon)",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(82, 42, 40, 0.25)",
                }}
              >
                <LogOut size={16} />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeDrawerModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1150,
            backgroundColor: "rgba(42, 24, 18, 0.45)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setActiveDrawerModal(null)}
          className="animate-fade"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-zoom"
            style={{
              width: "100%",
              maxWidth: activeDrawerModal === "profile" ? 760 : 460,
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: activeDrawerModal === "profile" ? "30px 34px" : "26px 28px",
              boxShadow: "0 20px 50px rgba(82, 42, 40, 0.24)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                paddingBottom: activeDrawerModal === "profile" ? 16 : 0,
                marginBottom: activeDrawerModal === "profile" ? 22 : 18,
                borderBottom:
                  activeDrawerModal === "profile" ? "1px solid var(--border-light)" : "none",
              }}
            >
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 900, color: "var(--maroon)", marginBottom: 4 }}>
                  {activeDrawerModal === "profile" && t.drawerProfile}
                  {activeDrawerModal === "favorites" && t.drawerFavorites}
                  {activeDrawerModal === "notifications" && t.drawerNotifications}
                  {activeDrawerModal === "help" && t.drawerHelp}
                </h3>
                {activeDrawerModal === "profile" && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {lang === "EN"
                      ? "Manage your profile details to protect and secure your account"
                      : "Kelola informasi profil Anda untuk mengontrol, melindungi dan mengamankan akun"}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveDrawerModal(null)}
                className="btn-interactive"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "var(--bg-cream)",
                  color: "var(--maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {activeDrawerModal === "profile" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setProfileAlert({ type: "", text: "" });
                  const emailChanged =
                    String(profileForm.email || "").trim().toLowerCase() !==
                    String(currentUser?.email || "").trim().toLowerCase();
                  const phoneDigits = String(profileForm.no_telp || "").replace(/\D/g, "");
                  if (emailChanged && phoneDigits.length < 8) {
                    setProfileAlert({
                      type: "error",
                      text: "Anda wajib menambahkan Nomor Telepon valid (min. 8 digit) terlebih dahulu sebelum mengubah alamat Email.",
                    });
                    setIsEditingPhone(true);
                    return;
                  }

                  const payload = {
                    nama: profileForm.nama,
                    email: profileForm.email,
                    no_telp: profileForm.no_telp,
                    jenis_kelamin: profileForm.jenis_kelamin,
                    tanggal_lahir: profileForm.tanggal_lahir,
                    avatar: profileForm.avatar,
                    ...(portalMode === "tenant"
                      ? { nama_tenant: profileForm.nama_tenant }
                      : {}),
                  };

                  try {
                    const res = await api.updateProfile(payload);
                    const updatedUser = res?.data?.user || res?.data || {
                      ...currentUser,
                      ...payload,
                    };
                    setCurrentUser(updatedUser);
                    localStorage.setItem("letsorder_auth_user", JSON.stringify(updatedUser));
                    setIsEditingEmail(false);
                    setIsEditingPhone(false);
                    setProfileAlert({
                      type: "success",
                      text: "Profil Anda berhasil disimpan.",
                    });
                    await syncFromApi();
                  } catch (err) {
                    setProfileAlert({
                      type: "error",
                      text: err.message || "Gagal menyimpan perubahan profil.",
                    });
                  }
                }}
              >
                {profileAlert.text && (
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 12,
                      backgroundColor:
                        profileAlert.type === "error" ? "#FEF2F2" : "#ECFDF5",
                      border:
                        profileAlert.type === "error"
                          ? "1px solid #FECACA"
                          : "1px solid #A7F3D0",
                      color: profileAlert.type === "error" ? "#991B1B" : "#065F46",
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {profileAlert.type === "error" ? (
                      <AlertCircle size={15} />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    <span>{profileAlert.text}</span>
                  </div>
                )}

                <div className="grid-profile-split">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="profile-field-row">
                      <span className="profile-field-label">
                        Username
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "var(--maroon)",
                        }}
                      >
                        {currentUser?.username || "-"}
                      </span>
                    </div>

                    <div className="profile-field-row">
                      <label className="profile-field-label">
                        Nama
                      </label>
                      <input
                        type="text"
                        value={profileForm.nama}
                        onChange={(e) =>
                          setProfileForm((p) => ({ ...p, nama: e.target.value }))
                        }
                        placeholder="Masukkan nama lengkap Anda"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          fontSize: 14,
                          color: "var(--maroon)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div className="profile-field-row">
                      <label className="profile-field-label">
                        Email
                      </label>
                      {isEditingEmail ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm((p) => ({ ...p, email: e.target.value }))
                            }
                            placeholder="nama@email.com"
                            style={{
                              flex: 1,
                              padding: "9px 12px",
                              borderRadius: 10,
                              border: "1px solid var(--border-input)",
                              fontSize: 13,
                              color: "var(--maroon)",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingEmail(false)}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid var(--border-input)",
                              backgroundColor: "var(--bg-cream)",
                              color: "var(--maroon)",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Selesai
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14, color: "var(--maroon)", fontWeight: 600 }}>
                            {maskEmail(profileForm.email || currentUser?.email)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (!String(profileForm.no_telp || "").trim()) {
                                setProfileAlert({
                                  type: "error",
                                  text: "Tambahkan Nomor Telepon terlebih dahulu sebelum mengubah alamat Email.",
                                });
                                setIsEditingPhone(true);
                                return;
                              }
                              setProfileAlert({ type: "", text: "" });
                              setIsEditingEmail(true);
                            }}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "var(--orange-tag)",
                              fontSize: 13,
                              fontWeight: 700,
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                          >
                            Ubah
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="profile-field-row">
                      <label className="profile-field-label">
                        Nomor Telepon
                      </label>
                      {isEditingPhone ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="tel"
                            value={profileForm.no_telp}
                            onChange={(e) =>
                              setProfileForm((p) => ({ ...p, no_telp: e.target.value }))
                            }
                            placeholder="0812xxxxxxxx"
                            style={{
                              flex: 1,
                              padding: "9px 12px",
                              borderRadius: 10,
                              border: "1px solid var(--border-input)",
                              fontSize: 13,
                              color: "var(--maroon)",
                              outline: "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (String(profileForm.no_telp || "").trim()) {
                                setIsEditingPhone(false);
                                setProfileAlert({ type: "", text: "" });
                              }
                            }}
                            style={{
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "1px solid var(--border-input)",
                              backgroundColor: "var(--bg-cream)",
                              color: "var(--maroon)",
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Selesai
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {profileForm.no_telp ? (
                            <>
                              <span style={{ fontSize: 14, color: "var(--maroon)", fontWeight: 600 }}>
                                {profileForm.no_telp}
                              </span>
                              <button
                                type="button"
                                onClick={() => setIsEditingPhone(true)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "var(--orange-tag)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  textDecoration: "underline",
                                  cursor: "pointer",
                                }}
                              >
                                Ubah
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsEditingPhone(true)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "var(--orange-tag)",
                                fontSize: 13,
                                fontWeight: 700,
                                textDecoration: "underline",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Tambah
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {portalMode === "tenant" && (
                      <div className="profile-field-row">
                        <label className="profile-field-label">
                          Nama Tenant
                        </label>
                        <input
                          type="text"
                          value={profileForm.nama_tenant}
                          onChange={(e) =>
                            setProfileForm((p) => ({
                              ...p,
                              nama_tenant: e.target.value,
                            }))
                          }
                          placeholder="Masukkan nama tenant kantin"
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "1px solid var(--border-input)",
                            fontSize: 14,
                            color: "var(--maroon)",
                            outline: "none",
                          }}
                        />
                      </div>
                    )}

                    <div className="profile-field-row">
                      <span className="profile-field-label">
                        Jenis Kelamin
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                        {["Laki-laki", "Perempuan", "Lainnya"].map((g) => {
                          const checked = profileForm.jenis_kelamin === g;
                          return (
                            <label
                              key={g}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                fontSize: 13,
                                color: "var(--maroon)",
                                fontWeight: checked ? 700 : 500,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="jenis_kelamin"
                                checked={checked}
                                onChange={() =>
                                  setProfileForm((p) => ({ ...p, jenis_kelamin: g }))
                                }
                                style={{ accentColor: "var(--maroon)", cursor: "pointer" }}
                              />
                              <span>{g}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="profile-field-row">
                      <label className="profile-field-label">
                        Tanggal lahir
                      </label>
                      <input
                        type="date"
                        value={profileForm.tanggal_lahir}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            tanggal_lahir: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          maxWidth: 210,
                          padding: "9px 12px",
                          borderRadius: 10,
                          border: "1px solid var(--border-input)",
                          fontSize: 13,
                          color: "var(--maroon)",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div className="profile-field-row" style={{ marginTop: 6 }}>
                      <div />
                      <div>
                        <button
                          type="submit"
                          className="btn-interactive btn-lift"
                          style={{
                            padding: "11px 30px",
                            borderRadius: "var(--radius-pill)",
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "var(--maroon)",
                            fontSize: 14,
                            fontWeight: 800,
                            cursor: "pointer",
                            boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                          }}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="profile-avatar-col">
                    <div
                      style={{
                        width: 108,
                        height: 108,
                        borderRadius: "50%",
                        backgroundColor: "var(--bg-cream)",
                        border: "3px solid #EDD1B4",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        fontWeight: 900,
                        color: "var(--maroon)",
                        marginBottom: 16,
                        boxShadow: "0 6px 18px rgba(82, 42, 40, 0.1)",
                      }}
                    >
                      {profileForm.avatar ? (
                        <img
                          src={profileForm.avatar}
                          alt="Profile Avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{displayInitials}</span>
                      )}
                    </div>

                    <label
                      className="btn-interactive"
                      style={{
                        display: "inline-block",
                        padding: "9px 20px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginBottom: 12,
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <span>Pilih Gambar</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const compressed = await readAndCompressImageFile(file, 512, 0.85);
                            setProfileForm((p) => ({ ...p, avatar: compressed }));
                            setProfileAlert({ type: "", text: "" });
                          } catch (err) {
                            setProfileAlert({
                              type: "error",
                              text: err.message || "Gagal memproses foto profil.",
                            });
                          }
                        }}
                      />
                    </label>

                    <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      <div>Ukuran gambar: maks. 1 MB</div>
                      <div>Format gambar: .JPEG, .PNG</div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeDrawerModal === "favorites" && (
              <div>
                {menusList.filter((m) => favoriteIds.includes(m.id_menu)).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--text-muted)", fontSize: 14 }}>
                    {lang === "EN"
                      ? "No saved favorite dishes yet. Tap the heart icon on any menu item!"
                      : "Belum ada menu favorit yang disimpan."}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {menusList
                      .filter((m) => favoriteIds.includes(m.id_menu))
                      .map((fav) => (
                        <div
                          key={fav.id_menu}
                          onClick={() => {
                            openFoodDetail(fav);
                            setActiveDrawerModal(null);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: 12,
                            border: "1px solid var(--border-light)",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontWeight: 700, color: "var(--maroon)" }}>{fav.nama_menu}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{fav.tenant_name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span className="tabular" style={{ fontWeight: 800, color: "var(--maroon)" }}>
                              {formatRupiah(fav.harga)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(fav.id_menu);
                              }}
                              aria-label="Remove favorite"
                              style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: 4,
                                display: "flex",
                              }}
                            >
                              <Heart size={15} color="#C84336" fill="#C84336" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeDrawerModal === "notifications" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {notificationsList.some((n) => !n.status_baca) && (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                    <button
                      type="button"
                      onClick={async () => {
                        setNotificationsList((prev) =>
                          prev.map((n) => ({ ...n, status_baca: true }))
                        );
                        await api.markAllNotificationsRead().catch(() => {});
                      }}
                      style={{
                        border: "1px solid var(--border-input)",
                        backgroundColor: "#FFFFFF",
                        color: "var(--maroon)",
                        borderRadius: "var(--radius-pill)",
                        padding: "5px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "Mark all as read" : "Tandai semua sudah dibaca"}
                    </button>
                  </div>
                )}
                {notificationsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 12px", color: "var(--text-muted)", fontSize: 14 }}>
                    {lang === "EN" ? "No notifications yet." : "Belum ada notifikasi baru saat ini."}
                  </div>
                ) : (
                  notificationsList.map((n, idx) => (
                    <div
                      key={n.id_notifikasi || idx}
                      onClick={async () => {
                        if (!n.status_baca && n.id_notifikasi) {
                          setNotificationsList((prev) =>
                            prev.map((item) =>
                              item.id_notifikasi === n.id_notifikasi
                                ? { ...item, status_baca: true }
                                : item
                            )
                          );
                          await api.markNotificationRead(n.id_notifikasi).catch(() => {});
                        }
                      }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        backgroundColor: n.status_baca ? "#FFFFFF" : "var(--bg-cream)",
                        border: n.status_baca ? "1px solid var(--border-light)" : "1px solid #EDD1B4",
                        fontSize: 13,
                        fontWeight: n.status_baca ? 500 : 700,
                        color: "var(--maroon)",
                        cursor: n.id_notifikasi && !n.status_baca ? "pointer" : "default",
                      }}
                    >
                      <div>{n.pesan || n.title}</div>
                      {n.waktu && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>
                          {n.waktu}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeDrawerModal === "help" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#FAF6F2", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>Bagaimana cara memesan makanan?</div>
                  Pilih menu dari halaman Home atau Tenant, masukkan ke keranjang, lalu selesaikan pembayaran QRIS untuk mendapatkan nomor antrean.
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "#FAF6F2", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>Bagaimana cara upload menu bagi Tenant?</div>
                  Login sebagai Tenant (Vendor), buka tab <strong>Menu</strong>, lalu klik tombol <strong>+ Upload Menu</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detailMounted && activeMenuDetail && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            opacity: detailActive ? 1 : 0,
            transition: "opacity 0.32s ease",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: detailActive ? "auto" : "none",
          }}
          onClick={closeFoodDetail}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="food-detail-sheet"
            style={{
              width: "100%",
              maxWidth: 820,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: "28px",
              borderTopRightRadius: "28px",
              boxShadow: "0 -16px 50px rgba(82, 42, 40, 0.22)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
              transform: detailActive ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.35s cubic-bezier(0.18, 1, 0.32, 1)",
              padding: "16px 32px 32px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: "#E2D7D0",
                }}
              />
            </div>

            <button
              onClick={closeFoodDetail}
              className="btn-interactive"
              style={{
                position: "absolute",
                top: 18,
                right: 22,
                zIndex: 10,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                backgroundColor: "var(--bg-cream)",
                cursor: "pointer",
                color: "var(--maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.4} />
            </button>

            <div
              className="grid-detail-split"
              style={{
                marginTop: 8,
                marginBottom: 28,
              }}
            >
              <div
                className="img-zoom-parent food-detail-media"
                style={{
                  height: 290,
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "var(--bg-warm-img)",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <SafeImage
                  src={activeMenuDetail.gambar}
                  alt={activeMenuDetail.nama_menu}
                  className="img-zoom-child"
                  iconSize={48}
                />
                <button
                  type="button"
                  onClick={() => toggleFavorite(activeMenuDetail.id_menu)}
                  aria-label="Toggle favorite"
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: "rgba(255,255,255,0.92)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <Heart
                    size={16}
                    color={favoriteIds.includes(activeMenuDetail.id_menu) ? "#C84336" : "var(--maroon)"}
                    fill={favoriteIds.includes(activeMenuDetail.id_menu) ? "#C84336" : "none"}
                  />
                </button>
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    padding: "4px 10px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--maroon)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  <Star size={13} fill="#F8A34B" color="#F8A34B" />
                  <span>
                    {activeMenuDetail.rating
                      ? `${activeMenuDetail.rating} (${activeMenuDetail.reviews_count ?? activeMenuDetail.reviews ?? 0} ${
                          lang === "EN" ? "reviews" : "ulasan"
                        })`
                      : lang === "EN"
                      ? "New"
                      : "Baru"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginBottom: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, color: "var(--maroon)" }}>
                      <Store size={14} />
                      {activeMenuDetail.tenant_name}
                    </span>
                    <span>·</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Clock size={14} />
                      Ready in {activeMenuDetail.estimasi_menit} min
                    </span>
                    {activeMenuDetail.tenant?.jam_tutup && (
                      <>
                        <span>·</span>
                        <span>
                          {lang === "EN" ? "Open until" : "Buka s/d"}{" "}
                          {activeMenuDetail.tenant.jam_tutup}
                        </span>
                      </>
                    )}
                  </div>

                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      lineHeight: 1.2,
                      marginBottom: 10,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {activeMenuDetail.nama_menu}
                  </h2>

                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-muted)",
                      lineHeight: 1.55,
                      marginBottom: 16,
                    }}
                  >
                    {activeMenuDetail.deskripsi}
                  </p>
                </div>

                <div>
                  <div
                    style={{
                      borderTop: "1px solid var(--border-light)",
                      paddingTop: 14,
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Price</div>
                      <div
                        className="tabular"
                        style={{
                          fontSize: 24,
                          fontWeight: 900,
                          color: "var(--maroon)",
                        }}
                      >
                        {formatRupiah(activeMenuDetail.harga)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "5px 12px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <button
                        onClick={() => setDetailQuantity((prev) => Math.max(1, prev - 1))}
                        className="btn-interactive"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Minus size={15} color="var(--maroon)" />
                      </button>
                      <span
                        className="tabular"
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          padding: "0 14px",
                          color: "var(--maroon)",
                        }}
                      >
                        {detailQuantity}
                      </span>
                      <button
                        onClick={() => setDetailQuantity((prev) => prev + 1)}
                        className="btn-interactive"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={15} color="var(--maroon)" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      const ok = await handleAddToCart(activeMenuDetail, detailQuantity);
                      if (ok) closeFoodDetail();
                    }}
                    className="btn-interactive btn-lift"
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "var(--radius-pill)",
                      border: "none",
                      backgroundColor: "var(--orange)",
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 4px 14px rgba(248, 163, 75, 0.4)",
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Add to cart · {formatRupiah(activeMenuDetail.harga * detailQuantity)}</span>
                  </button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 16, marginBottom: 18 }}>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)", marginBottom: 10 }}>
                {lang === "EN" ? "Customer Reviews" : "Rating & Ulasan Pembeli"} (
                {activeMenuReviews.length})
              </h4>
              {activeMenuReviews.length === 0 ? (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    backgroundColor: "#FAF6F2",
                    padding: "12px 14px",
                    borderRadius: 12,
                  }}
                >
                  {lang === "EN"
                    ? "No reviews yet for this dish. Order and be the first to rate it!"
                    : "Belum ada ulasan untuk menu ini."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 160, overflowY: "auto" }}>
                  {activeMenuReviews.map((rev) => (
                    <div
                      key={rev.id_review}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        backgroundColor: "#FAF6F2",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)" }}>
                          {rev.reviewer_name}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 800, color: "var(--maroon)" }}>
                          <Star size={12} fill="#F8A34B" color="#F8A34B" />
                          <span>{rev.rating}.0</span>
                        </span>
                      </div>
                      {rev.komentar && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
                          {rev.komentar}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)" }}>
                  You might also like
                </h4>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 6,
                  scrollSnapType: "x proximity",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {menusList
                  .filter((m) => m.id_menu !== activeMenuDetail.id_menu && m.available !== false)
                  .slice(0, 6)
                  .map((rec) => (
                    <div
                      key={rec.id_menu}
                      onClick={() => openFoodDetail(rec)}
                      className="card-hover img-zoom-parent"
                      style={{
                        flex: "0 0 132px",
                        minWidth: 132,
                        scrollSnapAlign: "start",
                        cursor: "pointer",
                        borderRadius: "var(--radius-md)",
                        padding: 6,
                        backgroundColor: "#FAF6F2",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <div
                        style={{
                          height: 75,
                          borderRadius: 8,
                          backgroundColor: "#E2E3E2",
                          overflow: "hidden",
                          marginBottom: 6,
                        }}
                      >
                        <SafeImage
                          src={rec.gambar}
                          alt={rec.nama_menu}
                          className="img-zoom-child"
                          iconSize={22}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--maroon)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {rec.nama_menu}
                      </div>
                      <div
                        className="tabular"
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontWeight: 700,
                        }}
                      >
                        {formatRupiah(rec.harga)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {(!currentUser || isAuthOpen) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            backgroundColor: "#FAF6F2",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 20px",
            overflow: "hidden",
          }}
          className="animate-fade"
        >
          <div style={{ position: "absolute", top: 16, right: 20, zIndex: 10 }}>
            <button
              type="button"
              onClick={() => changeLanguage(lang === "ID" ? "EN" : "ID")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 74,
                justifyContent: "center",
                padding: "7px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-light)",
                backgroundColor: "#FFFFFF",
                color: "var(--maroon)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Globe size={14} color="var(--text-muted)" />
              <span>{lang}</span>
            </button>
          </div>
          <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
            <div style={{ display: "inline-block", marginBottom: 6 }}>
              <svg width="54" height="54" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" stroke="#D49354" strokeWidth="3" />
                <circle cx="50" cy="50" r="41" stroke="#E5B888" strokeWidth="1.5" />
                <path
                  d="M33 26V40C33 44 36 46 39 46V74H43V46C46 46 49 44 49 40V26H46V38H44V26H38V38H36V26H33Z"
                  fill="#522A28"
                />
                <path
                  d="M51 32L78 50L51 68V32Z"
                  fill="#F8A34B"
                  stroke="#522A28"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "var(--orange-tag)",
                letterSpacing: "0.22em",
                marginBottom: 2,
              }}
            >
              E S T D &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2 0 2 6
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "var(--maroon)",
                letterSpacing: "-0.01em",
                marginBottom: 2,
              }}
            >
              LETSORDER.COM
            </div>

            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              FROM OUR CANTEEN TO YOUR HANDS
            </div>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 436,
              maxHeight: "calc(100vh - 170px)",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "24px 28px 20px",
              boxShadow: "0 16px 44px rgba(82, 42, 40, 0.1), 0 2px 8px rgba(82, 42, 40, 0.04)",
              border: "1px solid var(--border-light)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            className="animate-modal-zoom"
          >
            {currentUser && (
              <button
                onClick={() => setIsAuthOpen(false)}
                className="btn-interactive"
                style={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  border: "none",
                  background: "var(--bg-subtle)",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            )}

            <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
                {authMode === "forgot"
                  ? t.authForgot
                  : authMode === "login"
                  ? t.authWelcome
                  : t.authCreate}
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {authMode === "forgot"
                  ? lang === "EN"
                    ? "Enter your username or email to set a new password."
                    : "Masukkan username atau email Anda untuk membuat password baru."
                  : authMode === "login"
                  ? loginRoleTab === "Vendor"
                    ? lang === "EN"
                      ? "Log in to manage your canteen tenant & orders."
                      : "Masuk untuk mengelola tenant kantin & pesanan."
                    : lang === "EN"
                    ? "Log in to pre-order and track your meals."
                    : "Masuk untuk memesan dan memantau pesanan kantin."
                  : loginRoleTab === "Vendor"
                  ? lang === "EN"
                    ? "Register your campus canteen tenant account."
                    : "Daftarkan akun tenant kantin kampus Anda."
                  : lang === "EN"
                  ? "For students, lecturers and campus staff."
                  : "Untuk mahasiswa, dosen, dan staf kampus."}
              </p>
            </div>

            {authMode !== "forgot" && (
              <div
                style={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  padding: 4,
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "var(--bg-subtle)",
                  border: "1px solid var(--border-light)",
                  marginBottom: 14,
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    bottom: 4,
                    left: 4,
                    width: "calc(50% - 4px)",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "var(--bg-cream)",
                    border: "1.5px solid var(--maroon)",
                    boxShadow: "0 3px 10px rgba(82, 42, 40, 0.12)",
                    transform: loginRoleTab === "Vendor" ? "translateX(100%)" : "translateX(0%)",
                    transition: "transform 0.38s cubic-bezier(0.22, 1, 0.36, 1)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
                {[
                  { role: "Customer", label: "Pengguna (Customer)" },
                  { role: "Vendor", label: "Tenant (Vendor)" },
                ].map((r) => {
                  const active = loginRoleTab === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => {
                        setLoginRoleTab(r.role);
                        setAuthError("");
                        setAuthSuccess("");
                        setAuthForm({
                          username: "",
                          nama: "",
                          password: "",
                          email: "",
                          nama_tenant: "",
                          new_password: "",
                        });
                      }}
                      style={{
                        position: "relative",
                        zIndex: 2,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "var(--maroon)",
                        fontSize: 12,
                        fontWeight: active ? 800 : 600,
                        cursor: "pointer",
                        transition: "color 0.25s ease, transform 0.2s ease",
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            )}

            {authError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#991B1B",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={15} />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  backgroundColor: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={15} />
                <span>{authSuccess}</span>
              </div>
            )}

            <form
              key={`${authMode}-${loginRoleTab}`}
              onSubmit={handleAuthSubmit}
              className="animate-fade"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                  {authMode === "forgot" ? "Username atau Email" : "Username"}
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-input)",
                  }}
                >
                  <User size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder={
                      loginRoleTab === "Vendor"
                        ? "Masukkan username tenant"
                        : "Masukkan username Anda"
                    }
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontSize: 14,
                      color: "var(--maroon)",
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {authMode === "register" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                      {loginRoleTab === "Vendor" ? "Nama Kantin / Tenant" : "Nama Lengkap"}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-input)",
                      }}
                    >
                      <Store size={16} color="var(--text-muted)" />
                      <input
                        type="text"
                        required
                        autoComplete="off"
                        placeholder={
                          loginRoleTab === "Vendor"
                            ? "Contoh: Kantin Nusantara"
                            : "Masukkan nama lengkap Anda"
                        }
                        value={loginRoleTab === "Vendor" ? authForm.nama_tenant : authForm.nama}
                        onChange={(e) =>
                          setAuthForm({
                            ...authForm,
                            nama: e.target.value,
                            nama_tenant: e.target.value,
                          })
                        }
                        style={{
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: 14,
                          color: "var(--maroon)",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                      Email
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-input)",
                      }}
                    >
                      <Mail size={16} color="var(--text-muted)" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="nama@email.com"
                        value={authForm.email}
                        onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                        style={{
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: 14,
                          color: "var(--maroon)",
                          width: "100%",
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {authMode === "forgot" ? (
                forgotStep === 1 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      backgroundColor: "var(--bg-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "10px 12px",
                    }}
                  >
                    {lang === "EN"
                      ? "We will generate a 6-digit verification code on the server before allowing a password change."
                      : "Server akan menerbitkan kode verifikasi 6 digit terlebih dahulu sebelum Anda membuat password baru."}
                  </div>
                ) : (
                  <>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                        {lang === "EN" ? "6-Digit Verification Code" : "Kode Verifikasi (6 Digit)"}
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-input)",
                        }}
                      >
                        <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <input
                          type="text"
                          required
                          autoComplete="one-time-code"
                          placeholder="123456"
                          value={authForm.reset_token || ""}
                          onChange={(e) => setAuthForm({ ...authForm, reset_token: e.target.value })}
                          style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: 14,
                            color: "var(--maroon)",
                            width: "100%",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                        Password Baru
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-input)",
                        }}
                      >
                        <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          placeholder="Minimal 6 karakter"
                          value={authForm.new_password}
                          onChange={(e) => setAuthForm({ ...authForm, new_password: e.target.value })}
                          style={{
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: 14,
                            color: "var(--maroon)",
                            width: "100%",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          style={{
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            flexShrink: 0,
                          }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 5 }}>
                    Password
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-input)",
                    }}
                  >
                    <Lock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                      placeholder={authMode === "register" ? "Minimal 6 karakter" : "••••••••"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        fontSize: 14,
                        color: "var(--maroon)",
                        width: "100%",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        flexShrink: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="btn-interactive btn-lift"
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "var(--radius-pill)",
                  border: "none",
                  backgroundColor: "var(--orange)",
                  color: "var(--maroon)",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginTop: 2,
                  boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  opacity: authLoading ? 0.7 : 1,
                }}
              >
                {authLoading
                  ? "Processing..."
                  : authMode === "forgot"
                  ? forgotStep === 1
                    ? lang === "EN"
                      ? "Send Reset Code"
                      : "Kirim Kode Reset"
                    : lang === "EN"
                    ? "Save New Password"
                    : "Simpan Password Baru"
                  : authMode === "login"
                  ? "Log in"
                  : "Sign up"}
              </button>

              {authMode !== "forgot" &&
                Boolean(
                  (googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || "")
                    .trim()
                    .includes(".apps.googleusercontent.com")
                ) && (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "2px 0" }}>
                    <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-light)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>OR</span>
                    <div style={{ flex: 1, height: 1, backgroundColor: "var(--border-light)" }} />
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="btn-interactive"
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--border-input)",
                      backgroundColor: "#FFFFFF",
                      color: "var(--maroon)",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 20.4 7.4 23 12 23z"
                      />
                    </svg>
                    <span>
                      Continue with Google ({loginRoleTab === "Vendor" ? "Tenant" : "Pengguna"})
                    </span>
                  </button>
                </>
              )}

              {authMode === "login" ? (
                <div style={{ textAlign: "center", marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot");
                      setForgotStep(1);
                      setAuthError("");
                      setAuthSuccess("");
                      setAuthForm({
                        username: "",
                        nama: "",
                        password: "",
                        email: "",
                        nama_tenant: "",
                        new_password: "",
                        reset_token: "",
                      });
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: "var(--maroon)",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              ) : authMode === "forgot" ? (
                <div style={{ textAlign: "center", marginTop: 2 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setForgotStep(1);
                      setAuthError("");
                      setAuthForm({
                        username: "",
                        nama: "",
                        password: "",
                        email: "",
                        nama_tenant: "",
                        new_password: "",
                        reset_token: "",
                      });
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
                      color: "var(--maroon)",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    ← Kembali ke halaman Log in
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 2,
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  By signing up you agree to the canteen's terms of service.
                </div>
              )}
            </form>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 14,
              fontSize: 13,
              color: "var(--text-muted)",
              flexShrink: 0,
            }}
          >
            {authMode === "login" ? (
              <span>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthForm({
                      username: "",
                      nama: "",
                      password: "",
                      email: "",
                      nama_tenant: "",
                      new_password: "",
                    });
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--maroon)",
                    fontWeight: 800,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Sign up here
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthSuccess("");
                    setAuthForm({
                      username: "",
                      nama: "",
                      password: "",
                      email: "",
                      nama_tenant: "",
                      new_password: "",
                    });
                  }}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--maroon)",
                    fontWeight: 800,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Log in here
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {isStoreSettingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            backgroundColor: "rgba(82, 42, 40, 0.38)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setIsStoreSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "26px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 19, fontWeight: 900, color: "var(--maroon)" }}>
                {lang === "EN" ? "Canteen Store Settings" : "Pengaturan Kantin & Jam Buka"}
              </h3>
              <button
                type="button"
                onClick={() => setIsStoreSettingsOpen(false)}
                style={{ border: "none", background: "var(--bg-cream)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={16} color="var(--maroon)" />
              </button>
            </div>
            {storeSettingsError && (
              <div role="alert" style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "#FDF0EE", color: "#C84336", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {storeSettingsError}
              </div>
            )}
            <form onSubmit={handleSaveStoreSettings} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Tenant Name" : "Nama Tenant"}
                </label>
                <input
                  type="text"
                  required
                  value={storeForm.nama_tenant}
                  onChange={(e) => setStoreForm((p) => ({ ...p, nama_tenant: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Booth / Location" : "Lokasi / Stand"}
                </label>
                <input
                  type="text"
                  value={storeForm.booth}
                  onChange={(e) => setStoreForm((p) => ({ ...p, booth: e.target.value }))}
                  placeholder="Contoh: Stand #1 · Kantin Gedung A"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Description" : "Deskripsi Kantin"}
                </label>
                <textarea
                  rows={2}
                  value={storeForm.deskripsi}
                  onChange={(e) => setStoreForm((p) => ({ ...p, deskripsi: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Opening Time" : "Jam Buka"}
                  </label>
                  <input
                    type="time"
                    value={storeForm.jam_buka}
                    onChange={(e) => setStoreForm((p) => ({ ...p, jam_buka: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Closing Time" : "Jam Tutup"}
                  </label>
                  <input
                    type="time"
                    value={storeForm.jam_tutup}
                    onChange={(e) => setStoreForm((p) => ({ ...p, jam_tutup: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--maroon)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={storeForm.auto_schedule}
                  onChange={(e) => setStoreForm((p) => ({ ...p, auto_schedule: e.target.checked }))}
                />
                <span>
                  {lang === "EN"
                    ? "Automatically open/close based on schedule hours"
                    : "Buka/tutup otomatis mengikuti jam operasional"}
                </span>
              </label>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 6 }}>
                  {lang === "EN" ? "Store Banner / Logo Photo" : "Foto / Logo Kantin"}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", backgroundColor: "var(--bg-warm-img)", flexShrink: 0 }}>
                    <SafeImage src={storeForm.logo} alt="Tenant preview" fallbackType="store" iconSize={24} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const dataUrl = await readAndCompressImageFile(f, 900, 0.8);
                        setStoreForm((p) => ({ ...p, logo: dataUrl }));
                      } catch (err) {
                        setStoreSettingsError(err.message);
                      }
                    }}
                    style={{ fontSize: 12 }}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-interactive btn-lift"
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "var(--orange)", color: "var(--maroon)", fontSize: 14, fontWeight: 800, cursor: "pointer", marginTop: 4 }}
              >
                {lang === "EN" ? "Save Store Settings" : "Simpan Pengaturan Kantin"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isPromoModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            backgroundColor: "rgba(82, 42, 40, 0.38)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setIsPromoModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "26px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--maroon)" }}>
                {lang === "EN" ? "Create Tenant Promo" : "Buat Promo Khusus Tenant"}
              </h3>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                style={{ border: "none", background: "var(--bg-cream)", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={16} color="var(--maroon)" />
              </button>
            </div>
            {promoFormError && (
              <div role="alert" style={{ padding: "10px 12px", borderRadius: 10, backgroundColor: "#FDF0EE", color: "#C84336", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {promoFormError}
              </div>
            )}
            <form onSubmit={handleCreatePromo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Promo Code" : "Kode Promo"}
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.kode_promo}
                  onChange={(e) => setPromoForm((p) => ({ ...p, kode_promo: e.target.value.toUpperCase() }))}
                  placeholder="Contoh: KANTIN10"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Promo Title" : "Judul Promo"}
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.judul}
                  onChange={(e) => setPromoForm((p) => ({ ...p, judul: e.target.value }))}
                  placeholder="Contoh: Diskon Spesial Jam Makan Siang"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Discount Type" : "Tipe Diskon"}
                  </label>
                  <select
                    value={promoForm.tipe}
                    onChange={(e) => setPromoForm((p) => ({ ...p, tipe: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  >
                    <option value="fixed">Nominal (Rp)</option>
                    <option value="percentage">Persen (%)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {promoForm.tipe === "percentage" ? "Persentase (%)" : "Potongan (Rp)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={promoForm.diskon}
                    onChange={(e) => setPromoForm((p) => ({ ...p, diskon: e.target.value }))}
                    placeholder={promoForm.tipe === "percentage" ? "10" : "5000"}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                  {lang === "EN" ? "Minimum Spend (Rp)" : "Minimal Belanja (Rp)"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={promoForm.minimal_belanja}
                  onChange={(e) => setPromoForm((p) => ({ ...p, minimal_belanja: e.target.value }))}
                  placeholder="0"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                />
              </div>
              <button
                type="submit"
                className="btn-interactive btn-lift"
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "var(--orange)", color: "var(--maroon)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
              >
                {lang === "EN" ? "Publish Promo" : "Simpan Promo"}
              </button>
            </form>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1350,
            backgroundColor: "rgba(82, 42, 40, 0.42)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setCancelTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--maroon)", marginBottom: 6 }}>
              {lang === "EN" ? `Cancel Order ${cancelTarget.code}?` : `Batalkan Pesanan ${cancelTarget.code}?`}
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              {lang === "EN"
                ? "Add an optional reason so the other party knows why this order was cancelled."
                : "Tuliskan alasan pembatalan (opsional) sebagai keterangan di riwayat."}
            </p>
            <form onSubmit={handleConfirmCancelOrder} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={lang === "EN" ? "e.g. Changed my mind / Out of stock" : "Contoh: Salah pesan / Bahan habis"}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-input)", backgroundColor: "#FFFFFF", color: "var(--maroon)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {lang === "EN" ? "Keep order" : "Kembali"}
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "#C84336", color: "#FFFFFF", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                >
                  {lang === "EN" ? "Confirm cancel" : "Ya, Batalkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reviewTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1350,
            backgroundColor: "rgba(82, 42, 40, 0.42)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setReviewTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--maroon)" }}>
                {lang === "EN" ? `Rate Order ${reviewTarget.nomor_antrean}` : `Beri Rating ${reviewTarget.nomor_antrean}`}
              </h3>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                style={{ border: "none", background: "var(--bg-cream)", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={15} color="var(--maroon)" />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14 }}>
              {reviewTarget.items_breakdown || reviewTarget.items_summary} · {reviewTarget.tenant_name}
            </p>
            {reviewError && (
              <div role="alert" style={{ padding: "8px 12px", borderRadius: 10, backgroundColor: "#FDF0EE", color: "#C84336", fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                {reviewError}
              </div>
            )}
            <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "6px 0" }}>
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setReviewRating(starVal)}
                    aria-label={`Rate ${starVal} stars`}
                    style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4 }}
                  >
                    <Star
                      size={30}
                      fill={starVal <= reviewRating ? "#F8A34B" : "none"}
                      color={starVal <= reviewRating ? "#F8A34B" : "#D1D5DB"}
                    />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={
                  lang === "EN"
                    ? "Share your experience with the food & service..."
                    : "Tulis ulasan rasa makanan atau kecepatan layanan..."
                }
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
              />
              <button
                type="submit"
                className="btn-interactive btn-lift"
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "var(--orange)", color: "var(--maroon)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
              >
                {lang === "EN" ? "Submit Rating" : "Kirim Rating & Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {toastAlert && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2500,
            maxWidth: "calc(100% - 32px)",
            padding: "12px 18px",
            borderRadius: "var(--radius-pill)",
            backgroundColor:
              toastAlert.type === "error"
                ? "#C84336"
                : toastAlert.type === "success"
                ? "#276749"
                : "var(--maroon)",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: "0 10px 28px rgba(0, 0, 0, 0.22)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span>{toastAlert.text}</span>
          <button
            type="button"
            onClick={() => setToastAlert(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              padding: 2,
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
