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
  MessageCircle,
  Image as ImageIcon,
  Send,
  CheckCheck,
  UtensilsCrossed,
  Upload,
} from "lucide-react";
import {
  api,
  resolveMediaUrl,
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
} from "./services/api";
import TenantOnboardingWizard from "./components/TenantOnboardingWizard.jsx";
import { TRANSLATIONS } from "./i18n.js";
import { isThemeAnimating, waitForThemeTransitionIdle } from "./utils/theme.js";
import ThemeToggleButton from "./components/ThemeToggleButton.jsx";
import LiveClockText from "./components/LiveClockText.jsx";
import {
  formatPercentDelta,
  formatRupiah,
  getInitials,
  getLocalDateKey,
} from "./utils/format.js";
import {
  CATEGORY_ID_MAP,
  isOrderChatEligible,
  isTenantOpenAt,
  normalizeMenuRecord,
} from "./utils/catalog.js";
import { SafeImage, readAndCompressImageFile } from "./utils/media.jsx";
import { LAYOUT } from "./utils/layout.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const portalMode = currentUser?.peran === "Vendor" ? "tenant" : "customer";

  const [navTab, setNavTab] = useState("home");
  const [tenantNavTab, setTenantNavTab] = useState("dashboard");

  const [lang, setLang] = useState(() => localStorage.getItem("letsorder_lang") || "ID");
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ID;
  const [publicBanners, setPublicBanners] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api
      .getBanners()
      .then((response) => {
        if (!cancelled && Array.isArray(response?.data)) setPublicBanners(response.data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Banner beranda hanya berasal dari database (GET /banners). Tidak ada banner bawaan.
  // Teks mengikuti bahasa aktif; kolom _en kosong berarti memakai teks Indonesia.
  const heroSlides = useMemo(() => {
    const isEnglish = lang === "EN";
    const pick = (banner, field, fallback) => {
      const translated = isEnglish ? banner[`${field}_en`] : "";
      return translated || banner[field] || fallback;
    };
    return publicBanners.map((banner) => ({
      tag: pick(banner, "tag", ""),
      title: pick(banner, "judul", ""),
      desc: pick(banner, "deskripsi", ""),
      image: banner.gambar || "",
      primaryCta: pick(banner, "cta_primary", isEnglish ? "Order now" : "Pesan sekarang"),
      secondaryCta: pick(
        banner,
        "cta_secondary",
        isEnglish ? "Browse canteens" : "Lihat kantin"
      ),
    }));
  }, [publicBanners, lang]);

  const changeLanguage = (nextLang) => {
    setLang(nextLang);
    localStorage.setItem("letsorder_lang", nextLang);
    setIsLangMenuOpen(false);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [tenantSearchQuery, setTenantSearchQuery] = useState("");
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
    batas_per_user: "1",
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
  const [vendorReviews, setVendorReviews] = useState([]);
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
  const detailCloseTimerRef = useRef(null);

  const openFoodDetail = useCallback((menuItem) => {
    if (detailCloseTimerRef.current) {
      clearTimeout(detailCloseTimerRef.current);
      detailCloseTimerRef.current = null;
    }
    setActiveMenuDetail(menuItem);
    setDetailQuantity(1);
    setActiveMenuReviews([]);
    if (menuItem?.id_menu) {
      api
        .getReviews({ id_menu: menuItem.id_menu })
        .then((res) => {
          if (Array.isArray(res?.data)) setActiveMenuReviews(res.data);
        })
        .catch(() => { });
    }
    setDetailMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDetailActive(true);
      });
    });
  }, []);

  const closeFoodDetail = useCallback(() => {
    if (detailCloseTimerRef.current) {
      clearTimeout(detailCloseTimerRef.current);
      detailCloseTimerRef.current = null;
    }
    setDetailActive(false);
    detailCloseTimerRef.current = setTimeout(() => {
      detailCloseTimerRef.current = null;
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
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatImage, setChatImage] = useState("");
  const [chatPreviewImage, setChatPreviewImage] = useState("");
  const [seenChatCounts, setSeenChatCounts] = useState(() => {
    try {
      const uid = getStoredUser()?.id_user || "guest";
      const raw = localStorage.getItem(`letsorder_chat_seen_${uid}`);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });
  const chatListRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const floatingCartBtnRef = useRef(null);
  const [flyingParticles, setFlyingParticles] = useState([]);
  const [cartBumpActive, setCartBumpActive] = useState(false);
  const cartBumpTimerRef = useRef(null);
  const knownLastChatIdMapRef = useRef({});
  const hasSeededChatMapRef = useRef(false);
  const [incomingChatAlert, setIncomingChatAlert] = useState(null);
  const incomingChatTimerRef = useRef(null);
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
  const [deleteAccountMode, setDeleteAccountMode] = useState(false);
  const [deleteAccountForm, setDeleteAccountForm] = useState({ password: "", confirm: "" });
  const [deleteAccountError, setDeleteAccountError] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

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
        setDeleteAccountMode(false);
        setDeleteAccountForm({ password: "", confirm: "" });
        setDeleteAccountError("");
      }
      setActiveDrawerModal(modalId);
    },
    [currentUser]
  );

  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerActive, setDrawerActive] = useState(false);
  const drawerCloseTimerRef = useRef(null);

  const openDrawer = useCallback(() => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    setDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setDrawerActive(true);
      });
    });
  }, []);

  const closeDrawer = useCallback(() => {
    if (drawerCloseTimerRef.current) {
      clearTimeout(drawerCloseTimerRef.current);
      drawerCloseTimerRef.current = null;
    }
    setDrawerActive(false);
    drawerCloseTimerRef.current = setTimeout(() => {
      drawerCloseTimerRef.current = null;
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
      .catch(() => { });

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
      const rawFavs = localStorage.getItem(`letsorder_favs_${uid}`);
      const parsedFavs = rawFavs ? JSON.parse(rawFavs) : [];
      setFavoriteIds(Array.isArray(parsedFavs) ? parsedFavs : []);
      const rawSeen = localStorage.getItem(`letsorder_chat_seen_${uid}`);
      const parsedSeen = rawSeen ? JSON.parse(rawSeen) : {};
      setSeenChatCounts(parsedSeen && typeof parsedSeen === "object" ? parsedSeen : {});
    } catch {
      setFavoriteIds([]);
      setSeenChatCounts({});
    }
  }, [currentUser?.id_user]);

  const markOrderChatSeen = useCallback(
    (orderId, count) => {
      const oid = Number(orderId);
      const nextCount = Number(count || 0);
      if (!oid || nextCount <= 0) return;
      setSeenChatCounts((prev) => {
        if (Number(prev[oid] || 0) >= nextCount) return prev;
        const next = { ...prev, [oid]: nextCount };
        try {
          const uid = currentUser?.id_user || "guest";
          localStorage.setItem(`letsorder_chat_seen_${uid}`, JSON.stringify(next));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });
    },
    [currentUser?.id_user]
  );

  const getOrderUnreadChatCount = useCallback(
    (ord) => {
      const oid = Number(ord?.id_pesanan || ord?.id || 0);
      const total = Number(ord?.chat_count || 0);
      if (!oid || total <= 0) return 0;
      const seen = Number(seenChatCounts[oid] || 0);
      const unread = Math.max(0, total - seen);
      if (unread === 0) return 0;
      if (
        Number(ord?.last_chat?.id_pengirim) === Number(currentUser?.id_user) &&
        unread <= 1
      ) {
        return 0;
      }
      return unread;
    },
    [seenChatCounts, currentUser?.id_user]
  );

  const handleOpenOrderChat = useCallback(
    async (orderObj) => {
      const oid = Number(orderObj?.id_pesanan || orderObj?.id || 0);
      if (!oid) return;
      if (!isOrderChatEligible(orderObj)) {
        notify(
          lang === "EN"
            ? "Chat opens once your order payment is verified."
            : "Fitur chat aktif setelah pesanan dibayar dan terverifikasi.",
          "info"
        );
        return;
      }
      setChatOrder({
        id_pesanan: oid,
        nomor_antrean: orderObj.nomor_antrean || orderObj.code || `#${oid}`,
        tenant_name: orderObj.tenant_name || orderObj.tenant?.nama_tenant || "Kantin",
        booth: orderObj.booth || orderObj.tenant?.booth || "",
        customer_name: orderObj.user_name || orderObj.user?.nama || orderObj.user?.username || "Pembeli",
        items_summary: orderObj.items_breakdown || orderObj.items_summary || orderObj.item_name || "",
        status_pesanan: orderObj.status_pesanan || orderObj.raw_status || orderObj.status || "",
      });
      setChatError("");
      setChatLoading(true);
      try {
        const res = await api.getOrderMessages(oid);
        const msgs = Array.isArray(res?.data?.messages) ? res.data.messages : [];
        if (res?.data?.order) {
          setChatOrder((prev) => ({ ...(prev || {}), ...res.data.order }));
        }
        setChatMessages(msgs);
        markOrderChatSeen(oid, msgs.length);
      } catch (err) {
        setChatError(err?.message || (lang === "EN" ? "Failed to load chat." : "Gagal memuat percakapan."));
      } finally {
        setChatLoading(false);
      }
    },
    [lang, markOrderChatSeen, notify]
  );

  const handleSelectChatImage = useCallback(
    async (file) => {
      if (!file) return;
      setChatError("");
      try {
        const compressed = await readAndCompressImageFile(file, 960, 0.8);
        setChatImage(compressed);
      } catch (err) {
        setChatError(err?.message || (lang === "EN" ? "Invalid image file." : "Gagal memproses gambar."));
      }
    },
    [lang]
  );

  const handleSendChatMessage = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (!chatOrder?.id_pesanan || chatSending) return;
      const trimmed = chatText.trim();
      if (!trimmed && !chatImage) {
        setChatError(
          lang === "EN"
            ? "Write a message or attach an image first."
            : "Tulis pesan teks atau pilih gambar terlebih dahulu."
        );
        return;
      }
      setChatSending(true);
      setChatError("");
      try {
        const res = await api.sendOrderMessage(chatOrder.id_pesanan, {
          teks: trimmed,
          gambar: chatImage,
        });
        const created = res?.data;
        if (created) {
          setChatMessages((prev) => {
            const next = [...prev, created];
            markOrderChatSeen(chatOrder.id_pesanan, next.length);
            return next;
          });
        }
        setChatText("");
        setChatImage("");
        if (chatFileInputRef.current) chatFileInputRef.current.value = "";
      } catch (err) {
        setChatError(err?.message || (lang === "EN" ? "Failed to send message." : "Gagal mengirim pesan."));
      } finally {
        setChatSending(false);
      }
    },
    [chatOrder?.id_pesanan, chatSending, chatText, chatImage, lang, markOrderChatSeen]
  );

  useEffect(() => {
    if (!chatOrder?.id_pesanan || !currentUser) return;
    let active = true;
    const oid = chatOrder.id_pesanan;
    const pollChat = async () => {
      if (isThemeAnimating()) return;
      try {
        const res = await api.getOrderMessages(oid);
        if (!active || !res?.data) return;
        const msgs = Array.isArray(res.data.messages) ? res.data.messages : [];
        setChatMessages((prev) => {
          const prevLast = prev[prev.length - 1]?.id_pesan || 0;
          const nextLast = msgs[msgs.length - 1]?.id_pesan || 0;
          const readSig = (list) =>
            list
              .map((m) => `${m.id_pesan}:${Array.isArray(m.dibaca_oleh) ? m.dibaca_oleh.length : 0}`)
              .join("|");
          if (
            prev.length === msgs.length &&
            prevLast === nextLast &&
            readSig(prev) === readSig(msgs)
          ) {
            return prev;
          }
          return msgs;
        });
        markOrderChatSeen(oid, msgs.length);
      } catch {
        // Keep current thread during transient errors
      }
    };
    const timer = setInterval(pollChat, 2500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [chatOrder?.id_pesanan, currentUser, markOrderChatSeen]);

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages.length, chatOrder?.id_pesanan]);

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
  const lastSyncSigRef = useRef("");
  const syncEpochRef = useRef(0);
  const syncInFlightPromiseRef = useRef(null);
  const syncQueuedPromiseRef = useRef(null);
  const syncFromApiRef = useRef(null);
  const bgSyncTickRef = useRef(0);
  const lastCatalogCacheRef = useRef({
    userId: 0,
    tenantsRes: null,
    menusRes: null,
    vendorTenantRes: null,
    vendorMenusRes: null,
    promosRes: null,
    vendorPromosRes: null,
    vendorRevRes: null,
  });

  const syncFromApi = useCallback((opts = {}) => {
    const isBackground = Boolean(opts?.background);
    if (isBackground && typeof document !== "undefined" && document.hidden) {
      return Promise.resolve();
    }
    if (syncInFlightPromiseRef.current) {
      if (isBackground) {
        return syncInFlightPromiseRef.current;
      }
      if (!syncQueuedPromiseRef.current) {
        syncQueuedPromiseRef.current = syncInFlightPromiseRef.current
          .catch(() => {})
          .then(() => {
            syncQueuedPromiseRef.current = null;
            return syncFromApiRef.current?.();
          });
      }
      return syncQueuedPromiseRef.current;
    }

    const runWithConcurrency = async (tasks, limit = 2) => {
      const results = new Array(tasks.length);
      let nextIdx = 0;
      const workers = Math.min(Math.max(1, limit), tasks.length);
      await Promise.all(
        Array.from({ length: workers }, async () => {
          while (nextIdx < tasks.length) {
            const idx = nextIdx++;
            results[idx] = await tasks[idx]();
          }
        })
      );
      return results;
    };

    const runPromise = (async () => {
      try {
      const epochAtStart = syncEpochRef.current;
      const syncUserId = currentUser?.id_user || 0;
      if (lastCatalogCacheRef.current.userId !== syncUserId) {
        lastCatalogCacheRef.current = {
          userId: syncUserId,
          tenantsRes: null,
          menusRes: null,
          vendorTenantRes: null,
          vendorMenusRes: null,
          promosRes: null,
          vendorPromosRes: null,
          vendorRevRes: null,
        };
        bgSyncTickRef.current = 0;
      }
      const catalogCache = lastCatalogCacheRef.current;
      const fetchCatalog =
        !isBackground ||
        !catalogCache.tenantsRes ||
        bgSyncTickRef.current % 3 === 0;
      if (isBackground) {
        bgSyncTickRef.current += 1;
      }

      const tokenAtStart = getStoredToken() || "";
      let unauthorizedDetected = false;
      const safeApiCall = (fn) => () =>
        fn().catch((err) => {
          if (err?.status === 401) {
            unauthorizedDetected = true;
          }
          return null;
        });

      const isVendor = currentUser?.peran === "Vendor";
      let usedUnifiedSync = false;
      let tenantsRes = null;
      let menusRes = null;
      let vendorTenantRes = null;
      let vendorMenusRes = null;
      let ordersRes = null;
      let cartRes = null;
      let notifRes = null;
      let promosRes = null;
      let vendorPromosRes = null;
      let vendorRevRes = null;

      try {
        const syncRes = await api.sync({
          catalog: fetchCatalog ? 1 : 0,
          compact_media: 1,
        });
        if ((getStoredToken() || "") !== tokenAtStart) {
          return;
        }
        const sData = syncRes?.data;
        if (sData && !Array.isArray(sData) && "authenticated" in sData) {
          if (currentUser && (!sData.authenticated || !sData.user)) {
            clearStoredSession();
            setCurrentUser(null);
            setAuthError(
              "Sesi akun tidak dapat diverifikasi oleh server. Silakan login kembali."
            );
            return;
          }
          usedUnifiedSync = true;
          tenantsRes = fetchCatalog
            ? sData.tenants
              ? { data: sData.tenants }
              : null
            : catalogCache.tenantsRes;
          menusRes = fetchCatalog
            ? sData.menus
              ? { data: sData.menus }
              : null
            : catalogCache.menusRes;
          promosRes = fetchCatalog
            ? sData.promos
              ? { data: sData.promos }
              : null
            : catalogCache.promosRes;
          if (isVendor) {
            vendorTenantRes = sData.vendor_tenant
              ? { data: sData.vendor_tenant }
              : catalogCache.vendorTenantRes;
            vendorMenusRes = fetchCatalog
              ? sData.vendor_menus
                ? { data: sData.vendor_menus }
                : null
              : catalogCache.vendorMenusRes;
            vendorPromosRes = fetchCatalog
              ? sData.vendor_promos
                ? { data: sData.vendor_promos }
                : null
              : catalogCache.vendorPromosRes;
            vendorRevRes = fetchCatalog
              ? sData.vendor_reviews
                ? { data: sData.vendor_reviews }
                : null
              : catalogCache.vendorRevRes;
            ordersRes = sData.vendor_orders ? { data: sData.vendor_orders } : null;
          } else {
            ordersRes = sData.orders ? { data: sData.orders } : null;
            cartRes = sData.cart ? { data: sData.cart } : null;
          }
          notifRes = sData.notifications ? { data: sData.notifications } : null;
        }
      } catch (err) {
        if ((getStoredToken() || "") !== tokenAtStart) {
          return;
        }
        if (err?.status === 401) {
          clearStoredSession();
          setCurrentUser(null);
          setAuthError(
            "Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali."
          );
          return;
        }
      }

      if (!usedUnifiedSync) {
        if (currentUser && (!isBackground || fetchCatalog)) {
          try {
            const meRes = await api.me();
            if ((getStoredToken() || "") !== tokenAtStart) {
              return;
            }
            const validUser =
              meRes?.data?.user || (meRes?.data?.id_user ? meRes.data : null);
            if (!validUser) {
              clearStoredSession();
              setCurrentUser(null);
              setAuthError(
                "Sesi akun tidak dapat diverifikasi oleh server. Silakan login kembali."
              );
              return;
            }
          } catch (err) {
            if ((getStoredToken() || "") !== tokenAtStart) {
              return;
            }
            if (err?.status === 401) {
              clearStoredSession();
              setCurrentUser(null);
              setAuthError(
                "Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali."
              );
              return;
            }
          }
        }
        [
          tenantsRes,
          menusRes,
          vendorTenantRes,
          vendorMenusRes,
          ordersRes,
          cartRes,
          notifRes,
          promosRes,
          vendorPromosRes,
        ] = await runWithConcurrency(
          [
            fetchCatalog
              ? safeApiCall(() => api.getTenants({ compact_media: 1 }))
              : () => Promise.resolve(catalogCache.tenantsRes),
            fetchCatalog
              ? safeApiCall(() => api.getMenus({ include_unavailable: true, compact_media: 1 }))
              : () => Promise.resolve(catalogCache.menusRes),
            isVendor && fetchCatalog
              ? safeApiCall(() => api.getVendorTenant({ compact_media: 1 }))
              : () => Promise.resolve(isVendor ? catalogCache.vendorTenantRes : null),
            isVendor && fetchCatalog
              ? safeApiCall(() => api.getVendorMenus({ compact_media: 1 }))
              : () => Promise.resolve(isVendor ? catalogCache.vendorMenusRes : null),
            currentUser
              ? safeApiCall(() =>
                  isVendor
                    ? api.getVendorOrders({ compact_media: 1 })
                    : api.getOrders({ compact_media: 1 })
                )
              : () => Promise.resolve(null),
            !isVendor && currentUser
              ? safeApiCall(() => api.getCart({ compact_media: 1 }))
              : () => Promise.resolve(null),
            currentUser
              ? safeApiCall(() => api.getNotifications())
              : () => Promise.resolve(null),
            fetchCatalog && (currentUser || !isBackground)
              ? safeApiCall(() => api.getPromos())
              : () => Promise.resolve(catalogCache.promosRes),
            isVendor && fetchCatalog
              ? safeApiCall(() => api.getVendorPromos())
              : () => Promise.resolve(isVendor ? catalogCache.vendorPromosRes : null),
          ],
          isBackground ? 2 : 3
        );
      }

      if (currentUser && unauthorizedDetected && (getStoredToken() || "") === tokenAtStart) {
        clearStoredSession();
        setCurrentUser(null);
        setAuthError(
          "Sesi login tidak valid atau telah kedaluwarsa. Silakan login kembali."
        );
        return;
      }

      if (tenantsRes) catalogCache.tenantsRes = tenantsRes;
      if (menusRes) catalogCache.menusRes = menusRes;
      if (vendorTenantRes) catalogCache.vendorTenantRes = vendorTenantRes;
      if (vendorMenusRes) catalogCache.vendorMenusRes = vendorMenusRes;
      if (promosRes) catalogCache.promosRes = promosRes;
      if (vendorPromosRes) catalogCache.vendorPromosRes = vendorPromosRes;

      await waitForThemeTransitionIdle();

      const myTenant =
        vendorTenantRes?.data ||
        tenantsRes?.data?.find((t) => t.id_user === currentUser?.id_user) ||
        null;
      if (!usedUnifiedSync) {
        vendorRevRes =
          isVendor && fetchCatalog && myTenant?.id_tenant
            ? await api.getReviews({ id_tenant: myTenant.id_tenant }).catch(() => null)
            : isVendor
              ? catalogCache.vendorRevRes
              : null;
      }
      if (vendorRevRes) catalogCache.vendorRevRes = vendorRevRes;

      await waitForThemeTransitionIdle();

      if (syncEpochRef.current !== epochAtStart) {
        return;
      }

      const syncSig = JSON.stringify([
        currentUser?.id_user || 0,
        activeOrderId || 0,
        tenantsRes?.data || null,
        menusRes?.data || null,
        vendorTenantRes?.data || null,
        vendorMenusRes?.data || null,
        ordersRes?.data || null,
        cartRes?.data || null,
        notifRes?.data || null,
        promosRes?.data || null,
        vendorPromosRes?.data || null,
        vendorRevRes?.data || null,
      ]);
      if (lastSyncSigRef.current === syncSig) {
        return;
      }
      lastSyncSigRef.current = syncSig;

      if (tenantsRes?.data) {
        const mappedTenants = tenantsRes.data.map((t) => ({
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
        }));
        setTenantsList(mappedTenants);
        setActiveTenantView((prev) => {
          if (!prev?.id_tenant) return prev;
          const fresh = mappedTenants.find((t) => Number(t.id_tenant) === Number(prev.id_tenant));
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
      if (Array.isArray(promosRes?.data)) {
        setPublicPromos(promosRes.data);
      }
      if (Array.isArray(vendorPromosRes?.data)) {
        setVendorPromos(vendorPromosRes.data);
      }
      if (myTenant) {
        setMyTenantInfo(myTenant);
        setIsStoreOpen(Boolean(myTenant.status_buka ?? true));
        if (Array.isArray(vendorRevRes?.data)) {
          setVendorReviews(vendorRevRes.data);
        }
      } else if (!isVendor) {
        setVendorReviews([]);
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
            is_paid: Boolean(o.is_paid || ["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"].includes(o.status_pesanan)),
            chat_count: Number(o.chat_count || 0),
            last_chat: o.last_chat || null,
            payment: o.payment || null,
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
              is_paid: Boolean(o.is_paid || ["Sedang Diproses", "Diproses", "Siap Diambil", "Selesai"].includes(o.status_pesanan)),
              chat_count: Number(o.chat_count || 0),
              last_chat: o.last_chat || null,
              payment: o.payment || null,
              status:
                o.status_pesanan === "Menunggu Pembayaran"
                  ? "Awaiting payment"
                  : o.status_pesanan === "Siap Diambil"
                    ? "Ready for pickup"
                    : "Preparing",
            };
          });
        setIncomingOrders(activeQueue);

        if (currentUser?.id_user && Array.isArray(ordersRes.data)) {
          const prevMap = knownLastChatIdMapRef.current;
          let newestIncoming = null;
          for (const rawOrd of ordersRes.data) {
            const oid = Number(rawOrd.id_pesanan || 0);
            const lastMsgId = Number(rawOrd.last_chat?.id_pesan || 0);
            if (!oid || !lastMsgId) continue;
            const prevMsgId = Number(prevMap[oid] || 0);
            if (
              hasSeededChatMapRef.current &&
              lastMsgId > prevMsgId &&
              Number(rawOrd.last_chat?.id_pengirim) !== Number(currentUser.id_user)
            ) {
              newestIncoming = {
                order: {
                  ...rawOrd,
                  id_pesanan: oid,
                  is_paid: true,
                },
                senderName: rawOrd.last_chat?.nama_pengirim || (isVendor ? "Pembeli" : "Tenant"),
                queueCode: rawOrd.nomor_antrean || `#${oid}`,
                preview:
                  rawOrd.last_chat?.teks ||
                  (rawOrd.last_chat?.has_image
                    ? lang === "EN"
                      ? "[Sent a photo]"
                      : "[Mengirim gambar]"
                    : ""),
              };
            }
            prevMap[oid] = Math.max(prevMsgId, lastMsgId);
          }
          hasSeededChatMapRef.current = true;
          if (newestIncoming && Number(chatOrder?.id_pesanan) !== Number(newestIncoming.order.id_pesanan)) {
            setIncomingChatAlert(newestIncoming);
            if (incomingChatTimerRef.current) clearTimeout(incomingChatTimerRef.current);
            incomingChatTimerRef.current = setTimeout(() => {
              setIncomingChatAlert(null);
            }, 7000);
          }
        }
      }
      } catch {
        // Keep current state when offline
      } finally {
        syncInFlightPromiseRef.current = null;
      }
    })();

    syncInFlightPromiseRef.current = runPromise;
    return runPromise;
  }, [currentUser, activeOrderId]);

  syncFromApiRef.current = syncFromApi;

  useEffect(() => {
    syncFromApi();
  }, [syncFromApi]);

  useEffect(() => {
    if (!currentUser) return;
    const pollId = setInterval(() => {
      if (!isThemeAnimating()) {
        syncFromApi({ background: true });
      }
    }, 12000);
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden && !isThemeAnimating()) {
        syncFromApi({ background: true });
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    return () => {
      clearInterval(pollId);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [currentUser, syncFromApi]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (isThemeAnimating()) return;
      const now = new Date();
      setLiveClock((prev) =>
        prev.getHours() === now.getHours() && prev.getMinutes() === now.getMinutes()
          ? prev
          : now
      );
    }, 10000);
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
        if (!token || !user) {
          throw new Error(
            res?.message || "Respons login tidak valid. Silakan coba kembali."
          );
        }
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
          reset_token: "",
        });
        if (user?.peran === "Vendor") {
          setTenantNavTab("dashboard");
        } else {
          setNavTab("home");
        }
      } else if (loginRoleTab === "Vendor") {
        const cleanUsername = String(authForm.username || "").trim();
        const cleanTenantName = String(
          authForm.nama_tenant || authForm.nama || cleanUsername
        ).trim();
        const cleanEmail = String(authForm.email || "").trim().toLowerCase();
        const rawPassword = String(authForm.password || "");

        if (!cleanUsername || !cleanTenantName || !cleanEmail || rawPassword.length < 6) {
          throw new Error(
            lang === "EN"
              ? "Please complete username, tenant name, valid email, and password (min. 6 chars)."
              : "Lengkapi username, nama tenant, email valid, dan kata sandi (min. 6 karakter)."
          );
        }

        try {
          await api.checkAvailability({
            username: cleanUsername,
            email: cleanEmail,
          });
        } catch (availErr) {
          if (availErr?.status === 422 || availErr?.status === 409) {
            throw availErr;
          }
        }

        setPendingVendorSignup({
          username: cleanUsername,
          nama: cleanTenantName,
          nama_tenant: cleanTenantName,
          email: cleanEmail,
          password: rawPassword,
        });
        setAuthForm({
          username: "",
          nama: "",
          password: "",
          email: "",
          nama_tenant: "",
          new_password: "",
        });
        setIsAuthOpen(false);
        setOnboardingError("");
        setOnboardingForm({
          logo: "",
          nama_tenant: cleanTenantName,
          email: cleanEmail,
          no_telp: "",
          booth: "",
          deskripsi: "",
          jam_buka: "07:00",
          jam_tutup: "21:00",
          status_buka: true,
          auto_schedule: true,
        });
        setTenantOnboardingStep(1);
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
    setVendorReviews([]);
    setTenantSearchQuery("");
    setOrdersHistory([]);
    setChatOrder(null);
    setChatMessages([]);
    setChatText("");
    setChatImage("");
    setChatPreviewImage("");
    setChatError("");
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

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeleteAccountError("");
    setDeletingAccount(true);
    try {
      const res = await api.deleteAccount({
        password: deleteAccountForm.password,
        confirm: deleteAccountForm.confirm,
      });
      setActiveDrawerModal(null);
      setDeleteAccountMode(false);
      await handleLogout();
      notify(res?.message || "Akun Anda berhasil dihapus.", "success");
    } catch (err) {
      setDeleteAccountError(err.message || "Gagal menghapus akun. Silakan coba lagi.");
    } finally {
      setDeletingAccount(false);
    }
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
      document.fonts.ready.then(() => updatePill()).catch(() => { });
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
    };
  }, [updatePill, activeNavKey, portalMode, currentUser, lang, cartItems]);

  useEffect(() => {
    if (isHeroPaused || heroSlides.length === 0) return;
    const timer = setInterval(() => {
      if (!isThemeAnimating()) {
        setHeroSlide((prev) => (prev + 1) % heroSlides.length);
      }
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
      .filter((p) => {
        if (!p.aktif) return false;
        if (p.id_tenant && cartTenantId && Number(p.id_tenant) !== Number(cartTenantId)) {
          return false;
        }
        const code = String(p.kode_promo || "").trim().toUpperCase();
        const limit = Number(p.batas_per_user ?? 1);
        if (limit > 0) {
          const localUses = (ordersHistory || []).filter(
            (o) =>
              String(o.promo_code || "").trim().toUpperCase() === code &&
              o.status_pesanan !== "Dibatalkan" &&
              o.status !== "Cancelled"
          ).length;
          const usedCount = Math.max(Number(p.used_by_user || 0), localUses);
          if (usedCount >= limit) return false;
        }
        return true;
      })
      .map((p) => {
        const minSpend = Number(p.minimal_belanja || 0);
        const disc = Number(p.diskon || 0);
        const isPct = p.tipe === "percentage";
        const discText = isPct ? `${disc}%` : formatRupiah(disc);
        const code = String(p.kode_promo || "").toUpperCase();
        const limit = Number(p.batas_per_user ?? 1);
        const localUses = (ordersHistory || []).filter(
          (o) =>
            String(o.promo_code || "").trim().toUpperCase() === code &&
            o.status_pesanan !== "Dibatalkan" &&
            o.status !== "Cancelled"
        ).length;
        const usedCount = Math.max(Number(p.used_by_user || 0), localUses);
        const remaining = limit > 0 ? Math.max(0, limit - usedCount) : null;
        return {
          id_promo: p.id_promo,
          id_tenant: p.id_tenant,
          code,
          title: p.judul || `Diskon ${discText}`,
          subtitle: `${code} · ${
            minSpend > 0 ? `Min. ${formatRupiah(minSpend)}` : "Tanpa min. belanja"
          }${remaining !== null ? ` · Sisa ${remaining}x/akun` : ""}`,
          discount: isPct ? (disc > 1 ? disc / 100 : disc) : disc,
          minSpend,
          batas_per_user: limit,
          sisa_klaim: remaining,
          type: isPct ? "percentage" : "fixed",
          isTenantPromo: Boolean(p.id_tenant),
        };
      });
    return normalizedCustom;
  }, [publicPromos, cartTenantId, ordersHistory]);

  useEffect(() => {
    if (selectedPromo?.id_tenant && cartTenantId && Number(selectedPromo.id_tenant) !== Number(cartTenantId)) {
      setSelectedPromo(null);
      return;
    }
    if (selectedPromo?.code && !availablePromos.some((p) => p.code === selectedPromo.code)) {
      setSelectedPromo(null);
    }
  }, [selectedPromo, cartTenantId, availablePromos]);

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

  const triggerFlyToCartAnimation = useCallback((item, sourceEvent = null) => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth || 390;
    const vh = window.innerHeight || 844;
    let startX = Math.round(vw * 0.5);
    let startY = Math.round(vh * 0.55);

    const srcEl =
      sourceEvent?.currentTarget ||
      sourceEvent?.target ||
      (typeof document !== "undefined"
        ? document.querySelector(".food-detail-sheet button.btn-lift")
        : null);
    if (srcEl && typeof srcEl.getBoundingClientRect === "function") {
      const rect = srcEl.getBoundingClientRect();
      if (rect && (rect.width > 0 || rect.height > 0)) {
        startX = Math.round(rect.left + rect.width / 2);
        startY = Math.round(rect.top + rect.height / 2);
      }
    }

    let endX = vw <= 768 ? vw - 56 : vw - 76;
    let endY = vw <= 768 ? vh - 96 : vh - 48;
    const cartEl = floatingCartBtnRef.current;
    if (cartEl && typeof cartEl.getBoundingClientRect === "function") {
      const cRect = cartEl.getBoundingClientRect();
      if (cRect && (cRect.width > 0 || cRect.height > 0)) {
        endX = Math.round(cRect.left + cRect.width / 2);
        endY = Math.round(cRect.top + cRect.height / 2);
      }
    }

    const pid = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setFlyingParticles((prev) => [
      ...prev,
      { id: pid, startX, startY, endX, endY, img: item?.gambar || "" },
    ]);

    setTimeout(() => {
      setCartBumpActive(true);
      if (cartBumpTimerRef.current) clearTimeout(cartBumpTimerRef.current);
      cartBumpTimerRef.current = setTimeout(() => {
        setCartBumpActive(false);
      }, 540);
    }, 440);

    setTimeout(() => {
      setFlyingParticles((prev) => prev.filter((p) => p.id !== pid));
    }, 640);
  }, []);

  const getItemTenantObj = useCallback(
    (item) => {
      if (!item) return null;
      const itemTenantId = Number(item.id_tenant || item.tenant?.id_tenant || 0);
      return (
        tenantsList.find((t) => Number(t.id_tenant) === itemTenantId) ||
        item.tenant ||
        null
      );
    },
    [tenantsList]
  );

  const isItemTenantOpen = useCallback(
    (item) => {
      const tObj = getItemTenantObj(item);
      if (!tObj) return true;
      return isTenantOpenAt(tObj, liveClock);
    },
    [getItemTenantObj, liveClock]
  );

  const handleAddToCart = async (item, qty = 1, sourceEvent = null) => {
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

    if (!isItemTenantOpen(item)) {
      const tObj = getItemTenantObj(item);
      notify(
        lang === "EN"
          ? `Tenant '${item.tenant_name}' is currently closed (Opens at ${tObj?.jam_buka || "07:00"}).`
          : `Tenant '${item.tenant_name}' sedang tutup (Buka pukul ${tObj?.jam_buka || "07:00"}).`,
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
      triggerFlyToCartAnimation(item, sourceEvent);
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

      syncEpochRef.current += 1;
      lastSyncSigRef.current = "";
      setActiveOrder(orderSummaryObj);
      setActiveOrderId(oid);
      setActiveQueueCode(orderSummaryObj.nomor_antrean);
      setOrdersHistory((prev) => {
        const nextStatus = awaitingTenantConfirm ? "Awaiting payment" : "Preparing";
        const nextRaw = orderSummaryObj.status_pesanan;
        let found = false;
        const updated = prev.map((o) => {
          if (Number(o.id_pesanan) !== Number(oid)) return o;
          found = true;
          return {
            ...o,
            status: nextStatus,
            status_pesanan: nextRaw,
            raw_status: nextRaw,
            is_paid: !awaitingTenantConfirm,
          };
        });
        if (found) return updated;
        return [
          {
            ...orderSummaryObj,
            status: nextStatus,
            raw_status: nextRaw,
            is_paid: !awaitingTenantConfirm,
            total: orderSummaryObj.total_harga,
          },
          ...prev,
        ];
      });
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

  const renderOrderChatButton = (orderObj, labelText = "Chat") => {
    if (!isOrderChatEligible(orderObj)) return null;
    const unread = getOrderUnreadChatCount(orderObj);
    return (
      <button
        type="button"
        data-testid={`order-chat-btn-${orderObj.id_pesanan || orderObj.id}`}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenOrderChat(orderObj);
        }}
        className="btn-interactive"
        style={{
          padding: "7px 12px",
          borderRadius: "var(--radius-pill)",
          border: unread > 0 ? "1px solid var(--orange)" : "1px solid var(--border-input)",
          backgroundColor: unread > 0 ? "var(--orange-soft)" : "var(--bg-card)",
          color: "var(--maroon)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          ...LAYOUT.inlineRow,
          gap: 5,
          whiteSpace: "nowrap",
        }}
      >
        <MessageCircle size={13} color={unread > 0 ? "var(--orange)" : "var(--maroon)"} />
        <span>{labelText}</span>
        {unread > 0 && (
          <span
            style={{
              minWidth: 17,
              height: 17,
              padding: "0 5px",
              borderRadius: 999,
              backgroundColor: "var(--orange)",
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: 800,
              ...LAYOUT.inlineRow,
              justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </button>
    );
  };

  const isTenantStoreConfigured = useCallback(
    (tenantObj) => {
      if (!tenantObj) return false;
      if (tenantObj.is_configured !== undefined) return Boolean(tenantObj.is_configured);
      const defaultDescs = ["", "tenant kantin kampus upnvj", "tenant kantin kampus", "campus canteen tenant"];
      const rawDesc = String(tenantObj.deskripsi || tenantObj.tagline || "").trim().toLowerCase();
      const hasCustomDesc = !defaultDescs.includes(rawDesc);
      const hasLogo = Boolean(
        (tenantObj.logo && tenantObj.logo !== "tenant/default.png") ||
          (tenantObj.gambar && tenantObj.gambar !== "tenant/default.png")
      );
      const hasMenus = menusList.some((m) => Number(m.id_tenant) === Number(tenantObj.id_tenant));
      return hasCustomDesc || hasLogo || hasMenus;
    },
    [menusList]
  );

  const isMyStoreConfigured = useMemo(() => {
    if (!myTenantInfo) return false;
    if (myTenantInfo.is_configured !== undefined) return Boolean(myTenantInfo.is_configured);
    const defaultDescs = ["", "tenant kantin kampus upnvj", "tenant kantin kampus", "campus canteen tenant"];
    const rawDesc = String(myTenantInfo.deskripsi || "").trim().toLowerCase();
    const hasCustomDesc = !defaultDescs.includes(rawDesc);
    const hasLogo = Boolean(
      (myTenantInfo.logo && myTenantInfo.logo !== "tenant/default.png") ||
        (myTenantInfo.gambar && myTenantInfo.gambar !== "tenant/default.png")
    );
    return hasCustomDesc || hasLogo || tenantMenus.length > 0;
  }, [myTenantInfo, tenantMenus.length]);

  const openTenantMenuFromItem = useCallback(
    (item) => {
      if (!item) return;
      const itemTenantId = Number(item.id_tenant || item.tenant?.id_tenant || 0);
      const matchedTenant =
        tenantsList.find((t) => Number(t.id_tenant) === itemTenantId) ||
        (item.tenant
          ? {
              ...item.tenant,
              id_tenant: itemTenantId || item.tenant.id_tenant,
              nama_tenant: item.tenant.nama_tenant || item.tenant_name || "Kantin",
              gambar: item.tenant.gambar || item.tenant.logo || "",
              jam_buka: item.tenant.jam_buka || "07:00",
              jam_tutup: item.tenant.jam_tutup || "21:00",
            }
          : {
              id_tenant: itemTenantId,
              nama_tenant: item.tenant_name || "Kantin",
              deskripsi: "",
              logo: "",
              gambar: "",
              jam_buka: "07:00",
              jam_tutup: "21:00",
              status_buka: true,
            });
      closeFoodDetail();
      setTenantMenuQuery("");
      setActiveTenantView(matchedTenant);
      setNavTab("home");
      if (typeof window !== "undefined" && window.scrollTo) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [tenantsList]
  );

  const [pendingVendorSignup, setPendingVendorSignup] = useState(null);
  const [tenantOnboardingStep, setTenantOnboardingStep] = useState(0);
  const [onboardingError, setOnboardingError] = useState("");
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    logo: "",
    nama_tenant: "",
    email: "",
    no_telp: "",
    booth: "",
    deskripsi: "",
    jam_buka: "07:00",
    jam_tutup: "21:00",
    status_buka: true,
    auto_schedule: true,
  });

  useEffect(() => {
    if (!currentUser?.id_user) {
      if (!pendingVendorSignup) {
        setTenantOnboardingStep(0);
      }
      return;
    }
    if (currentUser?.peran === "Vendor") {
      try {
        const pendingStep = localStorage.getItem(`letsorder_tenant_onboarding_${currentUser.id_user}`);
        if (pendingStep === "1" || pendingStep === "2") {
          setTenantOnboardingStep((prev) => (prev > 0 ? prev : Number(pendingStep)));
          setOnboardingForm((prev) => ({
            ...prev,
            nama_tenant: prev.nama_tenant || currentUser.nama_tenant || currentUser.nama || currentUser.username || "",
            email: prev.email || currentUser.email || "",
            no_telp: prev.no_telp || currentUser.no_telp || "",
          }));
        }
      } catch {
        // Ignore storage read errors
      }
    } else {
      setTenantOnboardingStep(0);
    }
  }, [currentUser, pendingVendorSignup]);

  const isOnboardingStep2Valid = useMemo(() => {
    const cleanPhone = String(onboardingForm.no_telp || "").replace(/\D/g, "");
    const cleanEmail = String(onboardingForm.email || "").trim();
    return (
      Boolean(onboardingForm.logo) &&
      String(onboardingForm.nama_tenant || "").trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) &&
      cleanPhone.length >= 8 &&
      String(onboardingForm.booth || "").trim().length >= 2 &&
      String(onboardingForm.deskripsi || "").trim().length >= 5 &&
      Boolean(onboardingForm.jam_buka) &&
      Boolean(onboardingForm.jam_tutup)
    );
  }, [onboardingForm]);

  const handleCompleteTenantOnboarding = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!isOnboardingStep2Valid || onboardingSaving) return;
    setOnboardingError("");
    setOnboardingSaving(true);
    try {
      const cleanName = onboardingForm.nama_tenant.trim();
      const cleanEmail = onboardingForm.email.trim();
      const cleanPhone = String(onboardingForm.no_telp || "").replace(/\D/g, "");
      const cleanBooth = onboardingForm.booth.trim();
      const cleanDesc = onboardingForm.deskripsi.trim();

      let activeUser = currentUser;
      let activeToken = localStorage.getItem("letsorder_auth_token") || "";

      if (pendingVendorSignup && !activeUser?.id_user) {
        const regRes = await api.register({
          username: pendingVendorSignup.username,
          nama: cleanName || pendingVendorSignup.nama,
          email: cleanEmail || pendingVendorSignup.email,
          password: pendingVendorSignup.password,
          peran: "Vendor",
          nama_tenant: cleanName || pendingVendorSignup.nama_tenant,
        });
        activeToken = regRes?.token || regRes?.data?.token || "";
        activeUser = regRes?.user || regRes?.data?.user || regRes?.data || null;
        if (!activeToken || !activeUser?.id_user) {
          const loginRes = await api.login({
            login: pendingVendorSignup.username,
            password: pendingVendorSignup.password,
          });
          activeToken = loginRes?.token || loginRes?.data?.token || "";
          activeUser = loginRes?.user || loginRes?.data?.user || activeUser;
        }
        if (!activeToken || !activeUser) {
          throw new Error(
            lang === "EN"
              ? "Failed to create tenant account. Please try again."
              : "Gagal membuat akun tenant. Silakan coba lagi."
          );
        }
        setStoredSession(activeToken, activeUser);
        setPendingVendorSignup(null);
      }

      const profileRes = await api.updateProfile({
        nama: activeUser?.nama || cleanName,
        email: cleanEmail,
        no_telp: cleanPhone,
        nama_tenant: cleanName,
        avatar: onboardingForm.logo,
      });

      const tenantRes = await api.updateVendorTenant({
        nama_tenant: cleanName,
        deskripsi: cleanDesc,
        booth: cleanBooth,
        logo: onboardingForm.logo,
        gambar: onboardingForm.logo,
        jam_buka: onboardingForm.jam_buka || "07:00",
        jam_tutup: onboardingForm.jam_tutup || "21:00",
        auto_schedule: Boolean(onboardingForm.auto_schedule),
        status_buka: Boolean(onboardingForm.status_buka),
      });

      if (tenantRes?.data) {
        setMyTenantInfo(tenantRes.data);
        setIsStoreOpen(Boolean(tenantRes.data.status_buka ?? onboardingForm.status_buka));
      }

      const updatedUser = {
        ...(activeUser || {}),
        ...(profileRes?.user || {}),
        nama_tenant: cleanName,
        email: cleanEmail,
        no_telp: cleanPhone,
        avatar: onboardingForm.logo,
      };
      setStoredSession(activeToken || localStorage.getItem("letsorder_auth_token") || "session", updatedUser);
      setCurrentUser(updatedUser);

      try {
        if (updatedUser?.id_user) {
          localStorage.removeItem(`letsorder_tenant_onboarding_${updatedUser.id_user}`);
        }
      } catch {
        // Ignore storage errors
      }

      setTenantOnboardingStep(0);
      setTenantNavTab("dashboard");
      notify(
        lang === "EN"
          ? "Your tenant store is now live! Welcome to your Dashboard."
          : "Toko tenant Anda berhasil diluncurkan! Selamat datang di Dasbor.",
        "success"
      );
      await syncFromApi();
    } catch (err) {
      setOnboardingError(
        err?.message ||
          (lang === "EN" ? "Failed to complete tenant setup." : "Gagal menyimpan pengaturan awal tenant.")
      );
    } finally {
      setOnboardingSaving(false);
    }
  };

  const openStoreSettingsModal = () => {
    setStoreSettingsError("");
    const defaultDescs = ["tenant kantin kampus upnvj", "tenant kantin kampus", "campus canteen tenant"];
    const rawDesc = String(myTenantInfo?.deskripsi || "").trim();
    const cleanDesc = defaultDescs.includes(rawDesc.toLowerCase()) ? "" : rawDesc;
    setStoreForm({
      nama_tenant: myTenantInfo?.nama_tenant || displayName || "",
      deskripsi: cleanDesc,
      booth: myTenantInfo?.booth || "",
      logo: myTenantInfo?.logo || myTenantInfo?.gambar || currentUser?.avatar || "",
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
      const cleanTenantName = storeForm.nama_tenant.trim();
      const rawLogoVal = String(storeForm.logo || "").trim();
      const isMediaRefLogo = /^(?:https?:\/\/[^/]+)?\/api\/(?:v1\/)?media\//i.test(rawLogoVal);
      const res = await api.updateVendorTenant({
        nama_tenant: cleanTenantName,
        deskripsi: storeForm.deskripsi.trim(),
        booth: storeForm.booth.trim(),
        ...(isMediaRefLogo ? {} : { logo: storeForm.logo, gambar: storeForm.logo }),
        jam_buka: storeForm.jam_buka,
        jam_tutup: storeForm.jam_tutup,
        auto_schedule: Boolean(storeForm.auto_schedule),
        status_buka: Boolean(storeForm.status_buka),
      });
      if (res?.data) {
        setMyTenantInfo(res.data);
        setIsStoreOpen(Boolean(res.data.status_buka ?? storeForm.status_buka));
      }
      if (currentUser) {
        try {
          const profRes = await api.updateProfile({
            nama: currentUser.nama || cleanTenantName,
            email: currentUser.email || "",
            no_telp: currentUser.no_telp || "",
            nama_tenant: cleanTenantName,
            ...(isMediaRefLogo ? {} : { avatar: storeForm.logo || "" }),
          });
          const updatedUser = {
            ...currentUser,
            ...(profRes?.data?.user || profRes?.user || {}),
            nama_tenant: cleanTenantName,
            avatar: isMediaRefLogo
              ? res?.data?.logo || currentUser.avatar || storeForm.logo || ""
              : storeForm.logo || "",
          };
          setCurrentUser(updatedUser);
          setStoredSession(localStorage.getItem("letsorder_auth_token") || "session", updatedUser);
        } catch {
          const updatedUser = {
            ...currentUser,
            nama_tenant: cleanTenantName,
            avatar: isMediaRefLogo
              ? res?.data?.logo || currentUser.avatar || storeForm.logo || ""
              : storeForm.logo || "",
          };
          setCurrentUser(updatedUser);
          setStoredSession(localStorage.getItem("letsorder_auth_token") || "session", updatedUser);
        }
      }
      setIsStoreSettingsOpen(false);
      notify(
        lang === "EN" ? "Tenant settings updated!" : "Pengaturan tenant berhasil disimpan!",
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
        batas_per_user: Math.max(1, Number(String(promoForm.batas_per_user || "1").replace(/\D/g, "")) || 1),
        aktif: true,
      });
      setIsPromoModalOpen(false);
      setPromoForm({ kode_promo: "", judul: "", tipe: "fixed", diskon: "", minimal_belanja: "0", batas_per_user: "1" });
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
        await api.clearCart().catch(() => { });
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
    const q = tenantSearchQuery.trim().toLowerCase();
    return tenantsList.filter((t) => {
      if (!isTenantStoreConfigured(t)) return false;
      return (
        !q ||
        String(t.nama_tenant || "").toLowerCase().includes(q) ||
        String(t.tagline || t.deskripsi || "").toLowerCase().includes(q)
      );
    });
  }, [tenantsList, tenantSearchQuery, isTenantStoreConfigured]);

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
              backgroundColor: "var(--bg-card)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <div className="container-app header-inner">
              <div className="header-left">
                <button
                  onClick={openDrawer}
                  className="btn-interactive header-menu-btn"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 6,
                    color: "var(--maroon)",
                    ...LAYOUT.row,
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
                    ...LAYOUT.row,
                    gap: 10,
                    cursor: "pointer",
                    userSelect: "none",
                    minWidth: 0,
                  }}
                >
                  <svg className="header-logo-svg" width="38" height="38" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="50" cy="50" r="46" stroke="#D49354" strokeWidth="3" />
                    <circle cx="50" cy="50" r="41" stroke="#E5B888" strokeWidth="1.5" />
                    <path
                      d="M33 26V40C33 44 36 46 39 46V74H43V46C46 46 49 44 49 40V26H46V38H44V26H38V38H36V26H33Z"
                      fill="var(--maroon)"
                    />
                    <path
                      d="M51 32L78 50L51 68V32Z"
                      fill="#F8A34B"
                      stroke="var(--maroon)"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <div style={{ minWidth: 0 }}>
                    <div
                      className="header-brand-title"
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
                          ? "1px solid var(--border-light)"
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
                      <span className="nav-tab-label" data-label={tab.label}>{tab.label}</span>
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
                    className="header-lang-btn"
                    onClick={() => setIsLangMenuOpen((prev) => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={isLangMenuOpen}
                    style={{
                      ...LAYOUT.between,
                      gap: 6,
                      minWidth: 74,
                      padding: "7px 12px",
                      borderRadius: "var(--radius-pill)",
                      border: "1px solid var(--border-light)",
                      backgroundColor: "var(--bg-card)",
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
                          backgroundColor: "var(--bg-card)",
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
                              ...LAYOUT.between,
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

                <ThemeToggleButton
                  darkTitle={t.themeToDark}
                  lightTitle={t.themeToLight}
                  size={36}
                />

                <button
                  onClick={() => openDrawerModal("profile")}
                  className="btn-interactive btn-lift header-profile-btn"
                  style={{
                    ...LAYOUT.row,
                    gap: 8,
                    padding: "6px 12px 6px 8px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-card)",
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
                      backgroundColor: portalMode === "tenant" ? "var(--bg-banner-alt)" : "var(--bg-cream)",
                      ...LAYOUT.center,
                      fontSize: 11,
                      fontWeight: 800,
                      color: "var(--maroon)",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={resolveMediaUrl(currentUser.avatar)}
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
                        ...LAYOUT.between,
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
                        {(() => {
                          const storeEffectiveOpen = isTenantOpenAt(myTenantInfo || { status_buka: isStoreOpen }, liveClock);
                          return (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = !isStoreOpen;
                                  setIsStoreOpen(next);
                                  api.updateVendorTenant({ status_buka: next }).then(() => syncFromApi()).catch(() => { });
                                }}
                                className="btn-interactive"
                                title={
                                  storeEffectiveOpen
                                    ? lang === "EN"
                                      ? "Click to close store"
                                      : "Klik untuk menutup kantin"
                                    : lang === "EN"
                                      ? "Click to open store"
                                      : "Klik untuk membuka kantin"
                                }
                                style={{
                                  ...LAYOUT.inlineRow,
                                  gap: 9,
                                  padding: "7px 15px 7px 9px",
                                  borderRadius: "var(--radius-pill)",
                                  border: storeEffectiveOpen ? "1.5px solid var(--maroon)" : "1.5px solid var(--border-input)",
                                  backgroundColor: storeEffectiveOpen ? "var(--bg-cream)" : "var(--bg-card)",
                                  color: "var(--maroon)",
                                  boxShadow: "var(--shadow-sm)",
                                  cursor: "pointer",
                                  fontSize: 13,
                                }}
                              >
                                <span
                                  style={{
                                    width: 34,
                                    height: 19,
                                    borderRadius: 999,
                                    backgroundColor: storeEffectiveOpen ? "var(--orange)" : "var(--dot-inactive)",
                                    padding: 2,
                                    ...LAYOUT.inlineRow,
                                    transition: "background-color 0.2s ease",
                                    flexShrink: 0,
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 15,
                                      height: 15,
                                      borderRadius: "50%",
                                      backgroundColor: "#FFFFFF",
                                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                                      transform: storeEffectiveOpen ? "translateX(15px)" : "translateX(0px)",
                                      transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                                    }}
                                  />
                                </span>
                                <span style={{ fontWeight: 800, color: "var(--maroon)" }}>
                                  {storeEffectiveOpen ? t.storeOpen : t.storeClosed}
                                </span>
                              </button>

                              <div
                                style={{
                                  ...LAYOUT.inlineRow,
                                  gap: 6,
                                  padding: "9px 14px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid var(--border-light)",
                                  backgroundColor: "var(--bg-subtle)",
                                  color: "var(--text-muted)",
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  boxShadow: "var(--shadow-sm)",
                                }}
                              >
                                <Clock size={13} color="var(--text-muted)" />
                                <span className="tabular">
                                  <LiveClockText /> · {lang === "EN" ? "Until" : "s/d"}{" "}
                                  {myTenantInfo?.jam_tutup || "21:00"}
                                </span>
                              </div>
                            </>
                          );
                        })()}

                        <div
                          style={{
                            ...LAYOUT.inlineRow,
                            gap: 6,
                            padding: "9px 14px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-subtle)",
                            color: "var(--maroon)",
                            fontSize: 13,
                            fontWeight: 800,
                            boxShadow: "var(--shadow-sm)",
                          }}
                          title={lang === "EN" ? "Store rating from customers" : "Rating toko dari pembeli"}
                        >
                          <Star size={14} fill="#F8A34B" color="#F8A34B" />
                          <span className="tabular">
                            {myTenantInfo?.rating ||
                              (vendorReviews.length > 0
                                ? (
                                  vendorReviews.reduce((s, r) => s + Number(r.rating || 0), 0) /
                                  vendorReviews.length
                                ).toFixed(1)
                                : lang === "EN"
                                  ? "New"
                                  : "Baru")}
                          </span>
                          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                            ({myTenantInfo?.reviews_count ?? vendorReviews.length}{" "}
                            {lang === "EN" ? "reviews" : "ulasan"})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={openStoreSettingsModal}
                          className="btn-interactive"
                          style={{
                            ...LAYOUT.inlineRow,
                            gap: 6,
                            padding: "9px 16px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--border-input)",
                            backgroundColor: "var(--bg-card)",
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
                              backgroundColor: "var(--bg-card)",
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
                                ...LAYOUT.between,
                                marginBottom: 16,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 10,
                                  backgroundColor: "var(--bg-cream)",
                                  ...LAYOUT.center,
                                  color: "var(--maroon)",
                                }}
                              >
                                <IconComp size={18} strokeWidth={2.2} />
                              </div>

                              <span
                                style={{
                                  ...LAYOUT.inlineRow,
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
                          backgroundColor: "var(--bg-card)",
                          borderRadius: "var(--radius-xl)",
                          border: "1px solid var(--border-light)",
                          padding: "24px 26px",
                          boxShadow: "var(--shadow-card)",
                        }}
                      >
                        <div
                          style={{
                            ...LAYOUT.between,
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
                              ...LAYOUT.inlineRow,
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
                                  backgroundColor: "var(--bg-card)",
                                  ...LAYOUT.between,
                                  gap: 14,
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                  <div
                                    style={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: 11,
                                      backgroundColor: "var(--btn-solid-bg)",
                                      color: "var(--btn-solid-text)",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      ...LAYOUT.center,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {ord.code}
                                  </div>

                                  <div>
                                    <div
                                      style={{
                                        ...LAYOUT.inlineRow,
                                        gap: 5,
                                        marginBottom: 4,
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        color: isReady ? "#15803D" : isPrep ? "#D97706" : "var(--text-muted)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: "50%",
                                          backgroundColor: isReady ? "#16A34A" : isPrep ? "#F59E0B" : "#9CA3AF",
                                        }}
                                      />
                                      <span>
                                        {lang === "EN"
                                          ? `Status: ${ord.status}`
                                          : `Status: ${
                                              isReady
                                                ? "Siap Diambil"
                                                : isPrep
                                                  ? "Sedang Diproses"
                                                  : "Menunggu Pembayaran"
                                            }`}
                                      </span>
                                    </div>
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

                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
                                      {lang === "EN" ? "View order" : "Lihat pesanan"}
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
                                        color: "var(--on-orange-text)",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                      }}
                                    >
                                      {lang === "EN" ? "Mark ready" : "Siap diambil"}
                                    </button>
                                  )}

                                  {isReady && (
                                    <button
                                      onClick={() => handleVendorAdvanceOrder(ord.id, "Selesai")}
                                      className="btn-interactive btn-lift"
                                      style={{
                                        padding: "8px 18px",
                                        borderRadius: "var(--radius-pill)",
                                        border: "none",
                                        backgroundColor: "#16A34A",
                                        color: "#FFFFFF",
                                        fontSize: 12,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        boxShadow: "0 4px 12px rgba(22, 163, 74, 0.28)",
                                      }}
                                    >
                                      {lang === "EN" ? "Complete pickup" : "Selesaikan"}
                                    </button>
                                  )}

                                  {renderOrderChatButton(ord, "Chat")}

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
                                backgroundColor: "var(--bg-auth-page)",
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
                                backgroundColor: "var(--bg-card)",
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
                                  backgroundColor: "var(--bg-card)",
                                  color: "var(--maroon)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  ...LAYOUT.center,
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
                            backgroundColor: "var(--bg-card)",
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
                                  ...LAYOUT.between,
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
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--border-light)",
                            padding: "22px 24px",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          <div
                            style={{
                              ...LAYOUT.between,
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
                                color: "var(--on-orange-text)",
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
                                    ...LAYOUT.between,
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: "1px solid var(--border-light)",
                                    backgroundColor: vp.aktif ? "var(--bg-auth-page)" : "var(--bg-inactive)",
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
                                      {` · ${
                                        Number(vp.batas_per_user ?? 1) > 0
                                          ? lang === "EN"
                                            ? `Max ${vp.batas_per_user ?? 1}x/account`
                                            : `Maks. ${vp.batas_per_user ?? 1}x/akun`
                                          : lang === "EN"
                                            ? "Unlimited"
                                            : "Tanpa batas"
                                      }`}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePromo(vp)}
                                      style={{
                                        border: "1px solid var(--border-input)",
                                        backgroundColor: vp.aktif ? "var(--btn-solid-bg)" : "var(--bg-card)",
                                        color: vp.aktif ? "var(--btn-solid-text)" : "var(--text-muted)",
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

                        <div
                          style={{
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--border-light)",
                            padding: "22px 24px",
                            boxShadow: "var(--shadow-card)",
                          }}
                        >
                          <div
                            style={{
                              ...LAYOUT.between,
                              marginBottom: 12,
                              gap: 8,
                            }}
                          >
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--maroon)" }}>
                              {lang === "EN" ? "Customer Ratings & Reviews" : "Rating & Ulasan Pembeli"}
                            </h3>
                            <span
                              style={{
                                ...LAYOUT.inlineRow,
                                gap: 4,
                                padding: "4px 10px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: "var(--bg-cream)",
                                color: "var(--maroon)",
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              <Star size={13} fill="#F8A34B" color="#F8A34B" />
                              <span className="tabular">
                                {myTenantInfo?.rating ||
                                  (vendorReviews.length > 0
                                    ? (
                                      vendorReviews.reduce((s, r) => s + Number(r.rating || 0), 0) /
                                      vendorReviews.length
                                    ).toFixed(1)
                                    : "0.0")}
                              </span>
                              <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                                ({vendorReviews.length})
                              </span>
                            </span>
                          </div>

                          {vendorReviews.length === 0 ? (
                            <div
                              style={{
                                fontSize: 13,
                                color: "var(--text-muted)",
                                textAlign: "center",
                                padding: "12px 0",
                              }}
                            >
                              {lang === "EN"
                                ? "No customer ratings or reviews yet."
                                : "Belum ada rating atau ulasan dari pembeli."}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                maxHeight: 240,
                                overflowY: "auto",
                              }}
                            >
                              {vendorReviews.map((rev) => (
                                <div
                                  key={rev.id_review}
                                  style={{
                                    padding: "10px 12px",
                                    borderRadius: 10,
                                    border: "1px solid var(--border-light)",
                                    backgroundColor: "var(--bg-auth-page)",
                                  }}
                                >
                                  <div
                                    style={{
                                      ...LAYOUT.between,
                                      gap: 8,
                                      marginBottom: 3,
                                    }}
                                  >
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)" }}>
                                      {rev.reviewer_name}
                                    </span>
                                    <span
                                      style={{
                                        ...LAYOUT.inlineRow,
                                        gap: 3,
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "var(--maroon)",
                                      }}
                                    >
                                      <Star size={12} fill="#F8A34B" color="#F8A34B" />
                                      <span>{rev.rating}.0</span>
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: rev.komentar ? 4 : 0 }}>
                                    {rev.nama_menu}
                                    {rev.nomor_antrean ? ` · ${rev.nomor_antrean}` : ""}
                                    {rev.dibuat_pada ? ` · ${String(rev.dibuat_pada).slice(0, 16)}` : ""}
                                  </div>
                                  {rev.komentar && (
                                    <div style={{ fontSize: 12, color: "var(--maroon)", lineHeight: 1.4 }}>
                                      "{rev.komentar}"
                                    </div>
                                  )}
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
                        ...LAYOUT.between,
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
                            ...LAYOUT.row,
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "var(--radius-pill)",
                            padding: "5px 6px 5px 18px",
                            border: "1px solid var(--border-input)",
                            width: 290,
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          <input
                            type="text"
                            placeholder={lang === "EN" ? "Search your menu..." : "Cari menu Anda..."}
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
                              backgroundColor: "var(--btn-solid-bg)",
                              color: "var(--btn-solid-text)",
                              ...LAYOUT.center,
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
                            ...LAYOUT.inlineRow,
                            gap: 8,
                            padding: "11px 22px",
                            borderRadius: "var(--radius-pill)",
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "var(--on-orange-text)",
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
                              ...LAYOUT.between,
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
                                      backgroundColor: active ? "var(--btn-solid-bg)" : "var(--bg-card)",
                                      color: active ? "var(--btn-solid-text)" : "var(--maroon)",
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
                                        ...LAYOUT.center,
                                        backgroundColor: "rgba(253, 240, 226, 0.45)",
                                      }}
                                    >
                                      <span
                                        style={{
                                          padding: "6px 18px",
                                          borderRadius: "var(--radius-pill)",
                                          backgroundColor: "var(--btn-solid-bg)",
                                          color: "var(--btn-solid-text)",
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
                                    <div
                                      style={{
                                        ...LAYOUT.inlineRow,
                                        gap: 4,
                                        marginTop: 4,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: "var(--maroon)",
                                      }}
                                    >
                                      <Star size={12} fill="#F8A34B" color="#F8A34B" />
                                      <span>
                                        {dish.rating
                                          ? `${dish.rating} (${dish.reviews_count ?? dish.reviews ?? 0})`
                                          : lang === "EN"
                                            ? "New"
                                            : "Baru"}
                                      </span>
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
                                      backgroundColor: "var(--bg-card)",
                                      color: "var(--maroon)",
                                      ...LAYOUT.center,
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
                                    ...LAYOUT.between,
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
                                        .catch(() => { });
                                    }}
                                    style={{
                                      ...LAYOUT.inlineRow,
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
                                          : "var(--switch-track-off)",
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
                                backgroundColor: "var(--bg-card)",
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
                                  ...LAYOUT.inlineRow,
                                  gap: 8,
                                  padding: "12px 24px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "none",
                                  backgroundColor: "var(--orange)",
                                  color: "var(--on-orange-text)",
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
                          backgroundColor: "var(--bg-card)",
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
                            ...LAYOUT.center,
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
                          backgroundColor: "var(--bg-card)",
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
                                backgroundColor: "var(--bg-card)",
                                ...LAYOUT.between,
                                gap: 14,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 11,
                                    backgroundColor: "var(--btn-solid-bg)",
                                    color: "var(--btn-solid-text)",
                                    fontSize: 12,
                                    fontWeight: 800,
                                    ...LAYOUT.center,
                                    flexShrink: 0,
                                  }}
                                >
                                  {ord.code}
                                </div>
                                <div>
                                  <div
                                    style={{
                                      ...LAYOUT.inlineRow,
                                      gap: 5,
                                      marginBottom: 4,
                                      fontSize: 10.5,
                                      fontWeight: 800,
                                      letterSpacing: "0.06em",
                                      textTransform: "uppercase",
                                      color: isReady ? "#15803D" : isPrep ? "#D97706" : "var(--text-muted)",
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        backgroundColor: isReady ? "#16A34A" : isPrep ? "#F59E0B" : "#9CA3AF",
                                      }}
                                    />
                                    <span>
                                      {lang === "EN"
                                        ? `Status: ${ord.status}`
                                        : `Status: ${
                                            isReady
                                              ? "Siap Diambil"
                                              : isPrep
                                                ? "Sedang Diproses"
                                                : "Menunggu Pembayaran"
                                          }`}
                                    </span>
                                  </div>
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

                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                {isAwaiting && (
                                  <button
                                    onClick={() => handleVendorAdvanceOrder(ord.id, "Sedang Diproses", true)}
                                    className="btn-interactive"
                                    style={{
                                      padding: "8px 16px",
                                      borderRadius: "var(--radius-pill)",
                                      border: "none",
                                      backgroundColor: "var(--btn-solid-bg)",
                                      color: "var(--btn-solid-text)",
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
                                      color: "var(--on-orange-text)",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {lang === "EN" ? "Mark ready" : "Siap diambil"}
                                  </button>
                                )}

                                {isReady && (
                                  <button
                                    onClick={() => handleVendorAdvanceOrder(ord.id, "Selesai")}
                                    className="btn-interactive btn-lift"
                                    style={{
                                      padding: "8px 18px",
                                      borderRadius: "var(--radius-pill)",
                                      border: "none",
                                      backgroundColor: "#16A34A",
                                      color: "#FFFFFF",
                                      fontSize: 12,
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.28)",
                                    }}
                                  >
                                    {lang === "EN" ? "Complete pickup" : "Selesaikan"}
                                  </button>
                                )}

                                {renderOrderChatButton(ord, lang === "EN" ? "Chat Buyer" : "Chat Pembeli")}

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
                              backgroundColor: active ? "var(--btn-solid-bg)" : "var(--bg-card)",
                              color: active ? "var(--btn-solid-text)" : "var(--maroon)",
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
                        backgroundColor: "var(--bg-card)",
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
                                backgroundColor: "var(--bg-card)",
                                ...LAYOUT.between,
                                gap: 12,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                <div
                                  style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 12,
                                    backgroundColor: isCancelled ? "var(--status-cancelled-bg)" : "var(--btn-solid-bg)",
                                    color: isCancelled ? "var(--text-muted)" : "var(--btn-solid-text)",
                                    fontSize: 12,
                                    fontWeight: 900,
                                    ...LAYOUT.center,
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
                                  {Array.isArray(order.reviews) && order.reviews.length > 0 && (
                                    <div
                                      style={{
                                        ...LAYOUT.inlineRow,
                                        gap: 5,
                                        marginTop: 4,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: "var(--maroon)",
                                        backgroundColor: "var(--bg-cream)",
                                        padding: "3px 9px",
                                        borderRadius: "var(--radius-pill)",
                                      }}
                                    >
                                      <Star size={11} fill="#F8A34B" color="#F8A34B" />
                                      <span>
                                        {order.reviews[0].rating}.0
                                        {order.reviews[0].komentar ? ` · "${order.reviews[0].komentar}"` : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="order-row-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span
                                  style={{
                                    ...LAYOUT.inlineRow,
                                    gap: 6,
                                    padding: "5px 12px",
                                    borderRadius: "var(--radius-pill)",
                                    backgroundColor: isCompleted
                                      ? "var(--btn-solid-bg)"
                                      : isPrep
                                        ? "var(--bg-cream)"
                                        : "var(--status-cancelled-bg)",
                                    color: isCompleted
                                      ? "var(--btn-solid-text)"
                                      : isPrep
                                        ? "var(--maroon)"
                                        : "var(--text-muted)",
                                    fontSize: 12,
                                    fontWeight: 700,
                                  }}
                                >
                                  <span>{statusLabels[order.status] || order.status}</span>
                                </span>
                                {renderOrderChatButton(order, "Chat")}
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
                  <div className="container-app animate-fade home-page-container" style={{ paddingTop: 28 }}>
                    {heroSlides.length > 0 && (
                    <div
                      className="hero-banner-card"
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
                        border: "1px solid var(--border-light)",
                        minHeight: 310,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: `${heroSlides.length * 100}%`,
                          transform: `translateX(-${heroSlide * (100 / heroSlides.length)}%)`,
                          transition: "transform 0.65s cubic-bezier(0.25, 1, 0.5, 1)",
                        }}
                      >
                        {heroSlides.map((slide, sIdx) => (
                          <div
                            key={sIdx}
                            className="hero-slide-item"
                            style={{
                              width: `${100 / heroSlides.length}%`,
                              flexShrink: 0,
                              position: "relative",
                              minHeight: 310,
                              ...LAYOUT.row,
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                zIndex: 1,
                                backgroundImage: `linear-gradient(90deg, var(--bg-hero-fade-start) 0%, var(--bg-hero-fade-mid) 48%, var(--bg-hero-fade-end) 100%), url('${slide.image}')`,
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
                                className="hero-slide-tag"
                                style={{
                                  ...LAYOUT.inlineRow,
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
                                className="hero-slide-desc"
                                style={{
                                  fontSize: 15,
                                  color: "var(--text-muted)",
                                  lineHeight: 1.5,
                                  marginBottom: 22,
                                }}
                              >
                                {slide.desc}
                              </p>

                              <div className="hero-cta-row" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <button
                                  className="hero-cta-btn"
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
                                    ...LAYOUT.row,
                                    gap: 8,
                                    boxShadow: "0 4px 14px rgba(248, 163, 75, 0.4)",
                                    transition: "transform 0.15s ease",
                                  }}
                                >
                                  <span>{slide.primaryCta}</span>
                                  <ArrowRight size={16} />
                                </button>

                                <button
                                  className="hero-cta-btn"
                                  onClick={() => {
                                    const el = document.getElementById("tenant-directory");
                                    el?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  style={{
                                    padding: "12px 22px",
                                    borderRadius: "var(--radius-pill)",
                                    border: "1px solid var(--border-light)",
                                    backgroundColor: "var(--bg-card)",
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
                        className="hero-arrow-btn hero-arrow-prev"
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
                          backgroundColor: "var(--bg-overlay-glass)",
                          color: "var(--maroon)",
                          ...LAYOUT.center,
                          cursor: "pointer",
                          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                          transition: "background-color 0.2s ease, transform 0.2s ease",
                        }}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        className="hero-arrow-btn hero-arrow-next"
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
                          backgroundColor: "var(--bg-overlay-glass)",
                          color: "var(--maroon)",
                          ...LAYOUT.center,
                          cursor: "pointer",
                          boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                          transition: "background-color 0.2s ease, transform 0.2s ease",
                        }}
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div
                        className="hero-dots-bar"
                        style={{
                          position: "absolute",
                          bottom: 16,
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 4,
                          padding: "5px 14px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "var(--bg-overlay-glass)",
                          ...LAYOUT.row,
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
                                backgroundColor: active ? "var(--maroon)" : "var(--dot-inactive)",
                                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                              }}
                              aria-label={`Go to slide ${idx + 1}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                    )}
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
                          backgroundColor: "var(--bg-card)",
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
                                  stroke="var(--maroon)"
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
                                  stroke="var(--maroon)"
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
                                  stroke="var(--maroon)"
                                  strokeWidth="2"
                                />
                                <path d="M17 10H19C20.1 10 21 10.9 21 12C21 13.1 20.1 14 19 14H17" stroke="var(--maroon)" strokeWidth="2" />
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
                                ...LAYOUT.between,
                                padding: "16px 20px",
                                borderRadius: "var(--radius-md)",
                                backgroundColor: isSelected ? "var(--orange-soft)" : "var(--bg-auth-page)",
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
                                    backgroundColor: "var(--bg-card)",
                                    border: "1px solid var(--border-light)",
                                    ...LAYOUT.center,
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
                                  backgroundColor: "var(--bg-card)",
                                  border: "1px solid var(--border-light)",
                                  ...LAYOUT.center,
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
                          ...LAYOUT.between,
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
                            ...LAYOUT.row,
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
                        {filteredMenus.map((item) => {
                          const itemTenantObj = getItemTenantObj(item);
                          const itemTenantOpen = isItemTenantOpen(item);
                          return (
                          <div
                            key={item.id_menu}
                            className="card-hover img-zoom-parent"
                            style={{
                              borderRadius: "var(--radius-lg)",
                              backgroundColor: "var(--bg-card)",
                              border: itemTenantOpen ? "1px solid var(--border-light)" : "1px solid #FCA5A5",
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
                                style={{
                                  filter: itemTenantOpen ? "none" : "grayscale(0.28) brightness(0.9)",
                                }}
                                iconSize={36}
                              />
                              {!itemTenantOpen && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 10,
                                    left: 10,
                                    padding: "4px 10px",
                                    borderRadius: "var(--radius-pill)",
                                    backgroundColor: "rgba(220, 38, 38, 0.94)",
                                    color: "#FFFFFF",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    ...LAYOUT.inlineRow,
                                    gap: 5,
                                    boxShadow: "0 2px 8px rgba(220, 38, 38, 0.35)",
                                  }}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#FFFFFF" }} />
                                  <span>
                                    {lang === "EN"
                                      ? `Tenant Closed · Opens ${itemTenantObj?.jam_buka || "07:00"}`
                                      : `Tenant Tutup · Buka ${itemTenantObj?.jam_buka || "07:00"}`}
                                  </span>
                                </div>
                              )}
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
                                  backgroundColor: "var(--bg-overlay-glass)",
                                  ...LAYOUT.center,
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
                                  backgroundColor: "var(--bg-card)",
                                  ...LAYOUT.row,
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
                                    ...LAYOUT.row,
                                    gap: 6,
                                    fontSize: 12,
                                    color: "var(--text-muted)",
                                    marginBottom: 14,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openTenantMenuFromItem(item);
                                    }}
                                    style={{
                                      border: "none",
                                      background: "transparent",
                                      padding: 0,
                                      margin: 0,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "var(--maroon)",
                                      cursor: "pointer",
                                      ...LAYOUT.inlineRow,
                                      gap: 4,
                                      textDecoration: "underline",
                                      textUnderlineOffset: 2,
                                    }}
                                    title={lang === "EN" ? `Go to ${item.tenant_name}` : `Ke menu ${item.tenant_name}`}
                                  >
                                    <Store size={12} color="var(--orange-dark)" />
                                    <span>{item.tenant_name}</span>
                                  </button>
                                  {!itemTenantOpen && (
                                    <span
                                      style={{
                                        padding: "1px 6px",
                                        borderRadius: 999,
                                        backgroundColor: "#FEE2E2",
                                        color: "#B91C1C",
                                        fontSize: 10.5,
                                        fontWeight: 800,
                                      }}
                                    >
                                      {lang === "EN" ? "Closed" : "Tutup"}
                                    </span>
                                  )}
                                  <span>·</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <Clock size={12} />
                                    {item.estimasi_menit} min
                                  </span>
                                </div>
                              </div>
                              <div
                                style={{
                                  ...LAYOUT.between,
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
                                    backgroundColor: itemTenantOpen ? "var(--orange)" : "#9CA3AF",
                                    color: "#FFFFFF",
                                    ...LAYOUT.center,
                                    cursor: "pointer",
                                    boxShadow: itemTenantOpen ? "0 3px 8px rgba(248, 163, 75, 0.4)" : "none",
                                  }}
                                  title={lang === "EN" ? "View menu & add" : "Lihat menu & pesan"}
                                >
                                  <Plus size={18} strokeWidth={2.6} />
                                </button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                      {filteredMenus.length === 0 && (
                        <div
                          style={{
                            padding: "48px 24px",
                            borderRadius: "var(--radius-xl)",
                            backgroundColor: "var(--bg-card)",
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
                {navTab === "home" && !activeTenantView && (
                  <div id="tenant-directory" className="container-app animate-fade" style={{ paddingTop: 32 }}>
                    <div
                      style={{
                        ...LAYOUT.between,
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
                          ...LAYOUT.row,
                          backgroundColor: "var(--bg-card)",
                          borderRadius: "var(--radius-pill)",
                          padding: "5px 6px 5px 18px",
                          border: "1px solid var(--border-input)",
                          boxShadow: "var(--shadow-sm)",
                          width: 320,
                        }}
                      >
                        <input
                          type="text"
                          placeholder={t.searchTenantPlaceholder}
                          value={tenantSearchQuery}
                          onChange={(e) => setTenantSearchQuery(e.target.value)}
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
                            backgroundColor: "var(--btn-solid-bg)",
                            color: "var(--btn-solid-text)",
                            ...LAYOUT.center,
                            cursor: "pointer",
                          }}
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid-4-cols">
                      {filteredTenants.map((tenant) => {
                        const tenantOpen = isTenantOpenAt(tenant, liveClock);
                        return (
                        <div
                          key={tenant.id_tenant}
                          onClick={() => setActiveTenantView(tenant)}
                          className="card-hover img-zoom-parent"
                          style={{
                            borderRadius: "var(--radius-lg)",
                            backgroundColor: "var(--bg-card)",
                            border: tenantOpen ? "1px solid var(--border-light)" : "1.5px solid #FCA5A5",
                            boxShadow: "var(--shadow-sm)",
                            overflow: "hidden",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              height: 190,
                              backgroundColor: "var(--bg-warm-img)",
                              overflow: "hidden",
                              position: "relative",
                              ...LAYOUT.center,
                            }}
                          >
                            <SafeImage
                              src={tenant.gambar || tenant.logo}
                              alt={tenant.nama_tenant}
                              className="img-zoom-child"
                              style={{
                                filter: tenantOpen ? "none" : "grayscale(0.32) brightness(0.86)",
                              }}
                              fallbackType="store"
                              iconSize={42}
                            />
                            {!tenantOpen && (
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  backgroundColor: "rgba(25, 14, 13, 0.32)",
                                  ...LAYOUT.center,
                                  pointerEvents: "none",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: "var(--radius-pill)",
                                    backgroundColor: "rgba(220, 38, 38, 0.94)",
                                    color: "#FFFFFF",
                                    fontSize: 11.5,
                                    fontWeight: 900,
                                    letterSpacing: "0.06em",
                                    textTransform: "uppercase",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.28)",
                                    border: "1.5px solid rgba(255, 255, 255, 0.6)",
                                  }}
                                >
                                  {lang === "EN" ? "Currently Closed" : "Sedang Tutup"}
                                </span>
                              </div>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                top: 10,
                                left: 10,
                                padding: "4px 10px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: tenantOpen
                                  ? "var(--bg-overlay-glass)"
                                  : "#DC2626",
                                color: tenantOpen ? "var(--maroon)" : "#FFFFFF",
                                fontSize: 11,
                                fontWeight: 800,
                                ...LAYOUT.inlineRow,
                                gap: 5,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: tenantOpen ? "#16A34A" : "#FFFFFF",
                                }}
                              />
                              <span>
                                {tenantOpen
                                  ? `${lang === "EN" ? "Open until" : "Buka s/d"} ${tenant.jam_tutup || "21:00"}`
                                  : `${lang === "EN" ? "Closed · Opens" : "Tutup · Buka"} ${tenant.jam_buka || "07:00"}`}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "14px 18px 16px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                ...LAYOUT.between,
                                gap: 10,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                <span
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "var(--maroon)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    minWidth: 0,
                                  }}
                                >
                                  {tenant.nama_tenant}
                                </span>
                                {!tenantOpen && (
                                  <span
                                    style={{
                                      padding: "2px 7px",
                                      borderRadius: 999,
                                      backgroundColor: "#FEE2E2",
                                      color: "#B91C1C",
                                      fontSize: 10.5,
                                      fontWeight: 800,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {lang === "EN" ? "Closed" : "Tutup"}
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  ...LAYOUT.inlineRow,
                                  gap: 4,
                                  fontSize: 13.5,
                                  fontWeight: 700,
                                  color: "var(--maroon)",
                                  flexShrink: 0,
                                }}
                              >
                                <Star size={14} fill="#F8A34B" color="#F8A34B" />
                                <span>{tenant.rating || (lang === "EN" ? "New" : "Baru")}</span>
                              </span>
                            </div>
                            {tenant.deskripsi && (
                              <div
                                style={{
                                  fontSize: 12.5,
                                  color: "var(--text-muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {tenant.deskripsi}
                              </div>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                    {filteredTenants.length === 0 && (
                      <div
                        style={{
                          padding: "48px 24px",
                          borderRadius: "var(--radius-xl)",
                          backgroundColor: "var(--bg-card)",
                          border: "1px dashed var(--border-input)",
                          textAlign: "center",
                          boxShadow: "var(--shadow-sm)",
                        }}
                      >
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                          {tenantsList.length > 0 ? t.emptyTenantSearchTitle : t.emptyTenantTitle}
                        </div>
                        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                          {tenantsList.length > 0 ? t.emptyTenantSearchDesc : t.emptyTenantDesc}
                        </p>
                        {tenantsList.length > 0 && tenantSearchQuery.trim() && (
                          <button
                            type="button"
                            onClick={() => setTenantSearchQuery("")}
                            style={{
                              marginTop: 14,
                              border: "1px solid var(--border-input)",
                              backgroundColor: "var(--bg-card)",
                              color: "var(--maroon)",
                              borderRadius: "var(--radius-pill)",
                              padding: "7px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {lang === "EN" ? "Clear search" : "Reset pencarian"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {navTab === "home" && activeTenantView && (
                  <div className="container-app animate-fade" style={{ paddingTop: 32 }}>
                    <button
                      onClick={() => setActiveTenantView(null)}
                      style={{
                        ...LAYOUT.inlineRow,
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-light)",
                        backgroundColor: "var(--bg-card)",
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
                        ...LAYOUT.between,
                        marginBottom: 24,
                        flexWrap: "wrap",
                        gap: 18,
                        padding: "22px 26px",
                        borderRadius: "var(--radius-xl)",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-light)",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 18, flex: "1 1 300px", minWidth: 0 }}>
                        <div
                          style={{
                            width: 74,
                            height: 74,
                            borderRadius: 18,
                            overflow: "hidden",
                            backgroundColor: "var(--bg-warm-img)",
                            border: "1px solid var(--border-light)",
                            flexShrink: 0,
                            ...LAYOUT.center,
                          }}
                        >
                          <SafeImage
                            src={activeTenantView.gambar || activeTenantView.logo}
                            alt={activeTenantView.nama_tenant}
                            fallbackType="store"
                            iconSize={32}
                          />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                            <span
                              style={{
                                ...LAYOUT.inlineRow,
                                gap: 5,
                                padding: "3px 10px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: "var(--bg-cream)",
                                color: "var(--maroon)",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                              }}
                            >
                              <Store size={12} color="var(--orange-dark)" />
                              <span>{t.navMenu}</span>
                            </span>
                            <span
                              style={{
                                ...LAYOUT.inlineRow,
                                gap: 5,
                                padding: "3px 10px",
                                borderRadius: "var(--radius-pill)",
                                backgroundColor: isTenantOpenAt(activeTenantView, liveClock)
                                  ? "rgba(22, 163, 74, 0.12)"
                                  : "#FEE2E2",
                                border: isTenantOpenAt(activeTenantView, liveClock)
                                  ? "none"
                                  : "1px solid #FCA5A5",
                                color: isTenantOpenAt(activeTenantView, liveClock)
                                  ? "#15803D"
                                  : "#B91C1C",
                                fontSize: 11.5,
                                fontWeight: 800,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  backgroundColor: isTenantOpenAt(activeTenantView, liveClock) ? "#16A34A" : "#DC2626",
                                }}
                              />
                              <span>
                                {isTenantOpenAt(activeTenantView, liveClock)
                                  ? `${lang === "EN" ? "Open until" : "Buka sampai"} ${activeTenantView.jam_tutup || "21:00"}`
                                  : `${lang === "EN" ? "Closed · Opens at" : "Tutup · Buka pukul"} ${activeTenantView.jam_buka || "07:00"}`}
                              </span>
                            </span>
                            <span
                              style={{
                                ...LAYOUT.inlineRow,
                                gap: 4,
                                fontSize: 12.5,
                                fontWeight: 800,
                                color: "var(--maroon)",
                              }}
                            >
                              <Star size={13} fill="#F8A34B" color="#F8A34B" />
                              <span>{activeTenantView.rating || (lang === "EN" ? "New" : "Baru")}</span>
                            </span>
                          </div>
                          <h1
                            style={{
                              fontSize: "clamp(26px, 3.6vw, 36px)",
                              fontWeight: 900,
                              color: "var(--maroon)",
                              letterSpacing: "-0.02em",
                              lineHeight: 1.15,
                              marginBottom: 4,
                            }}
                          >
                            {activeTenantView.nama_tenant}
                          </h1>
                          <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                            {activeTenantView.deskripsi ? `${activeTenantView.deskripsi} · ` : ""}
                            {tenantMenuItems.length} {t.itemsUnit} · <LiveClockText />
                          </p>
                        </div>
                      </div>
                      <div
                        className="search-pill-box"
                        style={{
                          ...LAYOUT.row,
                          backgroundColor: "var(--bg-card)",
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
                            backgroundColor: "var(--btn-solid-bg)",
                            color: "var(--btn-solid-text)",
                            ...LAYOUT.center,
                          }}
                        >
                          <Search size={15} />
                        </button>
                      </div>
                    </div>
                    {!isTenantOpenAt(activeTenantView, liveClock) && (
                      <div
                        role="status"
                        style={{
                          marginBottom: 20,
                          padding: "14px 18px",
                          borderRadius: "var(--radius-lg)",
                          backgroundColor: "#FEF2F2",
                          border: "1.5px solid #FCA5A5",
                          color: "#991B1B",
                          ...LAYOUT.row,
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: "#FEE2E2",
                            color: "#DC2626",
                            ...LAYOUT.center,
                            flexShrink: 0,
                          }}
                        >
                          <Clock size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#991B1B" }}>
                            {lang === "EN"
                              ? `${activeTenantView.nama_tenant} is Currently Closed`
                              : `Tenant ${activeTenantView.nama_tenant} Sedang Tutup`}
                          </div>
                          <div style={{ fontSize: 12.5, color: "#B91C1C" }}>
                            {lang === "EN"
                              ? `Operating hours: ${activeTenantView.jam_buka || "07:00"} – ${activeTenantView.jam_tutup || "21:00"}. You can browse the menu, and place orders once the store reopens.`
                              : `Jam operasional: ${activeTenantView.jam_buka || "07:00"} – ${activeTenantView.jam_tutup || "21:00"}. Anda tetap dapat melihat menu, namun pemesanan baru dapat dilakukan saat tenant kembali buka.`}
                          </div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      {tenantMenuItems.map((item) => {
                        const activeTenantOpen = isTenantOpenAt(activeTenantView, liveClock);
                        return (
                        <div
                          key={item.id_menu}
                          className="card-hover img-zoom-parent"
                          style={{
                            backgroundColor: "var(--bg-surface-muted)",
                            borderRadius: "var(--radius-xl)",
                            border: activeTenantOpen ? "none" : "1px solid #FCA5A5",
                            padding: "18px 24px",
                            ...LAYOUT.between,
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
                                style={{
                                  filter: activeTenantOpen ? "none" : "grayscale(0.28) brightness(0.9)",
                                }}
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
                                  backgroundColor: "var(--bg-overlay-glass)",
                                  ...LAYOUT.center,
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
                                  backgroundColor: "var(--bg-card)",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: "var(--maroon)",
                                  ...LAYOUT.row,
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
                                  ...LAYOUT.row,
                                  gap: 6,
                                  fontSize: 14,
                                  color: "var(--text-muted)",
                                  marginBottom: 10,
                                  flexWrap: "wrap",
                                }}
                              >
                                <span>{item.tenant_name}</span>
                                {!activeTenantOpen && (
                                  <span
                                    style={{
                                      padding: "1px 7px",
                                      borderRadius: 999,
                                      backgroundColor: "#FEE2E2",
                                      color: "#B91C1C",
                                      fontSize: 11,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {lang === "EN" ? "Closed" : "Tutup"}
                                  </span>
                                )}
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
                              backgroundColor: activeTenantOpen ? "var(--orange)" : "#9CA3AF",
                              color: "#FFFFFF",
                              ...LAYOUT.center,
                              cursor: "pointer",
                              boxShadow: activeTenantOpen ? "0 4px 12px rgba(248, 163, 75, 0.4)" : "none",
                            }}
                            title={lang === "EN" ? "View menu & add" : "Lihat menu & pesan"}
                          >
                            <Plus size={22} strokeWidth={2.8} />
                          </button>
                        </div>
                        );
                      })}
                      {tenantMenuItems.length === 0 && (
                        <div
                          style={{
                            padding: "40px 24px",
                            borderRadius: "var(--radius-xl)",
                            backgroundColor: "var(--bg-card)",
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
                          backgroundColor: "var(--bg-card)",
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
                            ...LAYOUT.center,
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
                            ...LAYOUT.inlineRow,
                            gap: 8,
                            padding: "13px 28px",
                            borderRadius: "var(--radius-pill)",
                            border: "none",
                            backgroundColor: "var(--orange)",
                            color: "var(--on-orange-text)",
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
                            backgroundColor: "var(--bg-card)",
                            borderRadius: "var(--radius-xl)",
                            border: "1px solid var(--border-light)",
                            padding: "16px 28px",
                            marginBottom: 32,
                            boxShadow: "var(--shadow-sm)",
                          }}
                        >
                          <div
                            style={{
                              ...LAYOUT.between,
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
                                  backgroundColor: "var(--btn-solid-bg)",
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
                                    ...LAYOUT.row,
                                    gap: 10,
                                    zIndex: 2,
                                    backgroundColor: "var(--bg-card)",
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
                                        ? "var(--btn-solid-bg)"
                                        : isActive
                                          ? "var(--orange)"
                                          : "var(--bg-surface-muted)",
                                      color: isDone ? "var(--btn-solid-text)" : isActive ? "#FFFFFF" : "var(--text-muted)",
                                      ...LAYOUT.center,
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
                                backgroundColor: "var(--bg-card)",
                                borderRadius: "var(--radius-xl)",
                                border: "1px solid var(--border-light)",
                                padding: "24px",
                                boxShadow: "var(--shadow-sm)",
                              }}
                            >
                              <div
                                style={{
                                  ...LAYOUT.between,
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
                                        ...LAYOUT.between,
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
                                            ...LAYOUT.row,
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
                                backgroundColor: "var(--bg-card)",
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
                              <div
                                className="voucher-scroll-list"
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 10,
                                  marginBottom: 24,
                                  maxHeight: 220,
                                  overflowY: "auto",
                                  paddingRight: 4,
                                  overscrollBehavior: "contain",
                                }}
                              >
                                <div
                                  onClick={() => setSelectedPromo(null)}
                                  style={{
                                    padding: "10px 14px",
                                    borderRadius: "var(--radius-md)",
                                    backgroundColor: !selectedPromo ? "var(--bg-cream)" : "var(--bg-card)",
                                    border: !selectedPromo ? "1.5px solid var(--maroon)" : "1px solid var(--border-input)",
                                    cursor: "pointer",
                                    ...LAYOUT.between,
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
                                        backgroundColor: isSelected ? "var(--orange-soft)" : "var(--bg-card)",
                                        border: isSelected ? "1.5px solid var(--orange)" : "1px solid var(--border-input)",
                                        cursor: "pointer",
                                        ...LAYOUT.between,
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                          style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 8,
                                            backgroundColor: isSelected ? "var(--orange)" : "var(--bg-cream)",
                                            ...LAYOUT.center,
                                            color: isSelected ? "#FFFFFF" : "var(--maroon)",
                                          }}
                                        >
                                          <Tag size={16} />
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                            <span>{promo.title}</span>
                                            {promo.isTenantPromo && (
                                              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 999, backgroundColor: "var(--btn-solid-bg)", color: "var(--btn-solid-text)" }}>
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
                                            backgroundColor: "var(--btn-solid-bg)",
                                            ...LAYOUT.center,
                                          }}
                                        >
                                          <Check size={13} color="var(--btn-solid-text)" strokeWidth={3} />
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            width: 22,
                                            height: 22,
                                            borderRadius: "50%",
                                            border: "1px solid var(--border-input)",
                                            ...LAYOUT.center,
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
                                  ...LAYOUT.center,
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
                                backgroundColor: "var(--bg-card)",
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
                                        ...LAYOUT.between,
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
                                  backgroundColor: "var(--bg-card)",
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
                                backgroundColor: "var(--bg-card)",
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
                                  backgroundColor: "var(--brand-cocoa)",
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
                                    ...LAYOUT.row,
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
                                  ...LAYOUT.center,
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
                                backgroundColor: "var(--bg-card)",
                                borderRadius: "var(--radius-xl)",
                                padding: "36px 32px",
                                boxShadow: "var(--shadow-card)",
                                border: "1px solid var(--border-light)",
                                marginBottom: 24,
                              }}
                            >
                              <div
                                style={{
                                  ...LAYOUT.inlineRow,
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
                                      ? "var(--on-orange-text)"
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
                                  ...LAYOUT.inlineRow,
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
                                backgroundColor: "var(--bg-card)",
                                borderRadius: "var(--radius-xl)",
                                padding: "24px",
                                border: "1px solid var(--border-light)",
                                boxShadow: "var(--shadow-sm)",
                                marginBottom: 20,
                              }}
                            >
                              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                                {lang === "EN" ? "Time to pickup" : "Estimasi waktu siap"}
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
                                {lang === "EN"
                                  ? "Come by when the timer ends — no need to wait in line."
                                  : "Datang saat timer berakhir — tidak perlu antre lama."}
                              </div>
                            </div>

                            <button
                              onClick={() => setCheckoutStep(4)}
                              style={{
                                width: "100%",
                                padding: "15px",
                                borderRadius: "var(--radius-pill)",
                                border: "1px solid var(--border-input)",
                                backgroundColor: "var(--bg-card)",
                                color: "var(--maroon)",
                                fontSize: 15,
                                fontWeight: 800,
                                cursor: "pointer",
                                ...LAYOUT.center,
                                gap: 8,
                                boxShadow: "var(--shadow-sm)",
                              }}
                            >
                              <span>{lang === "EN" ? "I'm at the counter" : "Saya sudah di konter"}</span>
                              <ArrowRight size={16} />
                            </button>
                            {isOrderChatEligible(activeOrder) && (
                              <button
                                type="button"
                                data-testid="active-order-chat-btn"
                                onClick={() => handleOpenOrderChat(activeOrder)}
                                className="btn-interactive"
                                style={{
                                  width: "100%",
                                  marginTop: 10,
                                  padding: "13px 16px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid var(--orange-border)",
                                  backgroundColor: "var(--bg-cream)",
                                  color: "var(--maroon)",
                                  fontSize: 14,
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  ...LAYOUT.center,
                                  gap: 8,
                                }}
                              >
                                <MessageCircle size={17} color="var(--orange)" />
                                <span>
                                  {lang === "EN" ? "Chat with Tenant" : "Chat dengan Tenant"}
                                </span>
                                {getOrderUnreadChatCount(activeOrder) > 0 && (
                                  <span
                                    style={{
                                      minWidth: 20,
                                      height: 20,
                                      padding: "0 6px",
                                      borderRadius: 999,
                                      backgroundColor: "var(--orange)",
                                      color: "#FFFFFF",
                                      fontSize: 11,
                                      fontWeight: 800,
                                      ...LAYOUT.inlineRow,
                                      justifyContent: "center",
                                    }}
                                  >
                                    {getOrderUnreadChatCount(activeOrder)}
                                  </span>
                                )}
                              </button>
                            )}
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
                                backgroundColor: "var(--bg-card)",
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
                                  backgroundColor: "var(--brand-cocoa)",
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
                              {lang === "EN"
                                ? "Show this code to the canteen staff. Tap below once you've received your food."
                                : "Tunjukkan kode ini ke kasir kantin. Tekan tombol di bawah setelah pesanan diterima."}
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
                                ...LAYOUT.center,
                                gap: 8,
                                boxShadow: "0 4px 16px rgba(248, 163, 75, 0.4)",
                              }}
                            >
                              <Check size={18} strokeWidth={2.8} />
                              <span>{lang === "EN" ? "Finish order" : "Selesaikan pesanan"}</span>
                            </button>
                            {isOrderChatEligible(activeOrder) && (
                              <button
                                type="button"
                                onClick={() => handleOpenOrderChat(activeOrder)}
                                className="btn-interactive"
                                style={{
                                  width: "100%",
                                  marginTop: 10,
                                  padding: "12px 16px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid var(--border-input)",
                                  backgroundColor: "var(--bg-card)",
                                  color: "var(--maroon)",
                                  fontSize: 14,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  ...LAYOUT.center,
                                  gap: 8,
                                }}
                              >
                                <MessageCircle size={16} color="var(--orange)" />
                                <span>
                                  {lang === "EN" ? "Chat with Tenant" : "Chat dengan Tenant"}
                                </span>
                              </button>
                            )}
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
                              backgroundColor: active ? "var(--btn-solid-bg)" : "var(--bg-card)",
                              color: active ? "var(--btn-solid-text)" : "var(--maroon)",
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
                        backgroundColor: "var(--bg-card)",
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
                                ...LAYOUT.between,
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
                                    backgroundColor: isInProgress ? "var(--btn-solid-bg)" : "var(--bg-surface-muted)",
                                    color: isInProgress ? "var(--btn-solid-text)" : "var(--maroon)",
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
                                    ...LAYOUT.inlineRow,
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

                                {renderOrderChatButton(order, "Chat")}

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
                                        backgroundColor: "var(--bg-card)",
                                        color: "var(--maroon)",
                                        borderRadius: "var(--radius-pill)",
                                        padding: "6px 12px",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        ...LAYOUT.inlineRow,
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
                                          color: "var(--on-orange-text)",
                                          borderRadius: "var(--radius-pill)",
                                          padding: "6px 12px",
                                          fontSize: 12,
                                          fontWeight: 800,
                                          cursor: "pointer",
                                          ...LAYOUT.inlineRow,
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
                                          ...LAYOUT.inlineRow,
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
                                        ...LAYOUT.inlineRow,
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
                backgroundColor: "var(--backdrop)",
                backdropFilter: "blur(5px)",
                ...LAYOUT.center,
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
                  backgroundColor: "var(--bg-card)",
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
                      backgroundColor: "var(--bg-card)",
                      color: "var(--maroon)",
                      ...LAYOUT.center,
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
                    ...LAYOUT.row,
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
                        backgroundColor: "var(--alert-error-bg)",
                        border: "1px solid var(--alert-error-border)",
                        color: "var(--alert-error-text)",
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
                      {lang === "EN" ? "Menu name" : "Nama Menu"}
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
                      {lang === "EN" ? "Price" : "Harga"}
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
                      ...LAYOUT.between,
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
                        {lang === "EN" ? "Availability" : "Ketersediaan"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {lang === "EN"
                          ? "Customers can only order this dish when it is available."
                          : "Pelanggan hanya dapat memesan menu ini saat tersedia."}
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
                        ...LAYOUT.inlineRow,
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
                            : "var(--switch-track-off)",
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
                        {editDishForm.available
                          ? lang === "EN" ? "Available" : "Tersedia"
                          : lang === "EN" ? "Unavailable" : "Habis"}
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
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "Cancel" : "Batal"}
                    </button>

                    <button
                      type="submit"
                      className="btn-interactive btn-lift"
                      style={{
                        padding: "12px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        backgroundColor: "var(--orange)",
                        color: "var(--on-orange-text)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                      }}
                    >
                      {lang === "EN" ? "Save changes" : "Simpan perubahan"}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const idToDelete = editingDish.id_menu;
                      setTenantMenus((prev) => prev.filter((m) => m.id_menu !== idToDelete));
                      setMenusList((prev) => prev.filter((m) => m.id_menu !== idToDelete));
                      setEditingDish(null);
                      await api.deleteVendorMenu(idToDelete).catch(() => { });
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#B91C1C",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      ...LAYOUT.inlineRow,
                      justifyContent: "center",
                      gap: 6,
                      paddingTop: 4,
                    }}
                  >
                    <Trash2 size={14} />
                    <span>{lang === "EN" ? "Delete this dish" : "Hapus menu ini"}</span>
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
                ...LAYOUT.center,
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
                  backgroundColor: "var(--bg-card)",
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
                      {lang === "EN" ? "Upload New Dish" : "Upload Menu Baru"}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {lang === "EN"
                        ? `Add a food or drink item to ${displayName}.`
                        : `Tambahkan makanan atau minuman ke kantin ${displayName}.`}
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
                      ...LAYOUT.center,
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
                        backgroundColor: "var(--alert-error-bg)",
                        border: "1px solid var(--alert-error-border)",
                        color: "var(--alert-error-text)",
                        fontSize: 12,
                        fontWeight: 600,
                        ...LAYOUT.row,
                        gap: 8,
                      }}
                    >
                      <AlertCircle size={15} />
                      <span>{addMenuError}</span>
                    </div>
                  )}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "var(--maroon)", marginBottom: 6 }}>
                      {lang === "EN" ? "Menu Name" : "Nama Menu"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "EN" ? "e.g. Spicy Smashed Chicken Rice" : "Contoh: Ayam Geprek Sambal Bawang"}
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
                        {lang === "EN" ? "Price (Rp)" : "Harga (Rp)"}
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
                        {lang === "EN" ? "Category" : "Kategori"}
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
                          backgroundColor: "var(--bg-card)",
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
                        {lang === "EN" ? "Prep Time (Min)" : "Estimasi Siap (Menit)"}
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
                        {lang === "EN" ? "Upload Dish Photo" : "Upload Foto Menu"}
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
                      {lang === "EN" ? "Or Enter Image URL (Optional)" : "Atau Masukkan URL Gambar (Opsional)"}
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
                      {lang === "EN" ? "Dish Description" : "Deskripsi Menu"}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={
                        lang === "EN"
                          ? "Describe ingredients and highlights of this dish..."
                          : "Jelaskan bahan dan keunggulan menu ini..."
                      }
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
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {lang === "EN" ? "Cancel" : "Batal"}
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
                        color: "var(--on-orange-text)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: isUploadingMenu ? "not-allowed" : "pointer",
                        opacity: isUploadingMenu ? 0.7 : 1,
                        boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                      }}
                    >
                      {isUploadingMenu
                        ? lang === "EN" ? "Saving..." : "Menyimpan..."
                        : lang === "EN" ? "Save & Upload" : "Simpan & Upload"}
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
                  backgroundColor: "var(--bg-card)",
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
                        ...LAYOUT.center,
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
                        ...LAYOUT.center,
                        margin: "0 auto 10px",
                        overflow: "hidden",
                        boxShadow: "0 4px 14px rgba(82, 42, 40, 0.1)",
                        cursor: "pointer",
                      }}
                    >
                      {currentUser?.avatar ? (
                        <img
                          src={resolveMediaUrl(currentUser.avatar)}
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
                      backgroundColor: "var(--bg-card)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-light)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    {[
                      { id: "profile", label: t.drawerProfile, icon: User },
                      portalMode === "tenant"
                        ? {
                            id: "tenant_settings",
                            label: lang === "EN" ? "Tenant Settings" : "Pengaturan Tenant",
                            icon: Store,
                          }
                        : { id: "favorites", label: t.drawerFavorites, icon: Heart },
                      { id: "notifications", label: t.drawerNotifications, icon: Bell },
                      { id: "help", label: t.drawerHelp, icon: HelpCircle },
                    ].map((item, idx, arr) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            closeDrawer();
                            if (item.id === "tenant_settings") {
                              openStoreSettingsModal();
                            } else {
                              openDrawerModal(item.id);
                            }
                          }}
                          className="drawer-item"
                          style={{
                            width: "100%",
                            padding: "16px 18px",
                            border: "none",
                            borderBottom: idx !== arr.length - 1 ? "1px solid var(--border-light)" : "none",
                            backgroundColor: "var(--bg-card)",
                            ...LAYOUT.between,
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
                                ...LAYOUT.center,
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
                      backgroundColor: "var(--btn-solid-bg)",
                      color: "var(--btn-solid-text)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      ...LAYOUT.center,
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
                ...LAYOUT.center,
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
                  maxWidth: activeDrawerModal === "profile" ? (portalMode === "tenant" ? 520 : 760) : 460,
                  maxHeight: "88vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "var(--radius-xl)",
                  padding: 0,
                  boxShadow: "0 20px 50px rgba(82, 42, 40, 0.24)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: activeDrawerModal === "profile" ? "22px 28px 16px" : "20px 26px 14px",
                    borderBottom: "1px solid var(--border-light)",
                    backgroundColor: "var(--bg-card)",
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
                      ...LAYOUT.center,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {activeDrawerModal === "profile" && (
                  <form
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: "1 1 auto",
                      minHeight: 0,
                      overflow: "hidden",
                    }}
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (deleteAccountMode) {
                        await handleDeleteAccount();
                        return;
                      }
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
                        ...(portalMode === "tenant" ||
                        /^(?:https?:\/\/[^/]+)?\/api\/(?:v1\/)?media\//i.test(String(profileForm.avatar || "").trim())
                          ? {}
                          : { avatar: profileForm.avatar }),
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
                    <div className="modal-scroll-body" style={{ padding: "20px 28px" }}>
                      {profileAlert.text && (
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: 12,
                            backgroundColor:
                              profileAlert.type === "error" ? "var(--alert-error-bg)" : "var(--alert-success-bg)",
                            border:
                              profileAlert.type === "error"
                                ? "1px solid var(--alert-error-border)"
                                : "1px solid var(--alert-success-border)",
                            color: profileAlert.type === "error" ? "var(--alert-error-text)" : "var(--alert-success-text)",
                            fontSize: 12,
                            fontWeight: 600,
                            marginBottom: 18,
                            ...LAYOUT.row,
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

                      <div className={portalMode === "tenant" ? "" : "grid-profile-split"}>
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
                            {lang === "EN" ? "Name" : "Nama"}
                          </label>
                          <input
                            type="text"
                            value={profileForm.nama}
                            onChange={(e) =>
                              setProfileForm((p) => ({ ...p, nama: e.target.value }))
                            }
                            placeholder={lang === "EN" ? "Enter your full name" : "Masukkan nama lengkap Anda"}
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
                                {lang === "EN" ? "Done" : "Selesai"}
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
                                      text:
                                        lang === "EN"
                                          ? "Please add your phone number first before changing your email address."
                                          : "Tambahkan Nomor Telepon terlebih dahulu sebelum mengubah alamat Email.",
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
                                {lang === "EN" ? "Edit" : "Ubah"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="profile-field-row">
                          <label className="profile-field-label">
                            {lang === "EN" ? "Phone Number" : "Nomor Telepon"}
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
                                {lang === "EN" ? "Done" : "Selesai"}
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
                                    {lang === "EN" ? "Edit" : "Ubah"}
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
                                  {lang === "EN" ? "Add" : "Tambah"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="profile-field-row">
                          <span className="profile-field-label">
                            {lang === "EN" ? "Gender" : "Jenis Kelamin"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                            {[
                              { val: "Laki-laki", label: lang === "EN" ? "Male" : "Laki-laki" },
                              { val: "Perempuan", label: lang === "EN" ? "Female" : "Perempuan" },
                              { val: "Lainnya", label: lang === "EN" ? "Other" : "Lainnya" },
                            ].map((g) => {
                              const checked = profileForm.jenis_kelamin === g.val;
                              return (
                                <label
                                  key={g.val}
                                  style={{
                                    ...LAYOUT.inlineRow,
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
                                      setProfileForm((p) => ({ ...p, jenis_kelamin: g.val }))
                                    }
                                    style={{ accentColor: "var(--maroon)", cursor: "pointer" }}
                                  />
                                  <span>{g.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div className="profile-field-row">
                          <label className="profile-field-label">
                            {lang === "EN" ? "Date of birth" : "Tanggal lahir"}
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
                      </div>

                      {portalMode !== "tenant" && (
                        <div className="profile-avatar-col">
                          <div
                            style={{
                              width: 108,
                              height: 108,
                              borderRadius: "50%",
                              backgroundColor: "var(--bg-cream)",
                              border: "3px solid #EDD1B4",
                              overflow: "hidden",
                              ...LAYOUT.center,
                              fontSize: 32,
                              fontWeight: 900,
                              color: "var(--maroon)",
                              marginBottom: 16,
                              boxShadow: "0 6px 18px rgba(82, 42, 40, 0.1)",
                            }}
                          >
                            {profileForm.avatar ? (
                              <img
                                src={resolveMediaUrl(profileForm.avatar)}
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
                              backgroundColor: "var(--bg-card)",
                              color: "var(--maroon)",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: "pointer",
                              marginBottom: 12,
                              boxShadow: "var(--shadow-sm)",
                            }}
                          >
                            <span>{lang === "EN" ? "Choose Image" : "Pilih Gambar"}</span>
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
                                    text: err.message || (lang === "EN" ? "Failed to process profile image." : "Gagal memproses foto profil."),
                                  });
                                }
                              }}
                            />
                          </label>

                          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
                            <div>{lang === "EN" ? "File size: max 1 MB" : "Ukuran gambar: maks. 1 MB"}</div>
                            <div>{lang === "EN" ? "Format: .JPEG, .PNG" : "Format gambar: .JPEG, .PNG"}</div>
                          </div>
                        </div>
                      )}
                      </div>

                      <div
                        style={{
                          marginTop: 22,
                          padding: "16px 18px",
                          borderRadius: 14,
                          border: "1px solid var(--alert-error-border)",
                          backgroundColor: "var(--alert-error-bg)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <Trash2 size={16} color="var(--alert-error-text)" />
                          <span style={{ fontSize: 14, fontWeight: 800, color: "var(--alert-error-text)" }}>
                            {lang === "EN" ? "Delete Account" : "Hapus Akun"}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--alert-error-text)", margin: 0 }}>
                          {lang === "EN"
                            ? "Deleting your account is permanent. Your profile, orders, reviews, and chat history will be removed and cannot be restored."
                            : "Menghapus akun bersifat permanen. Profil, pesanan, ulasan, dan riwayat chat Anda akan dihapus dan tidak dapat dikembalikan."}
                        </p>

                        {deleteAccountMode ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                            {!currentUser?.google_linked && (
                              <input
                                type="password"
                                value={deleteAccountForm.password}
                                onChange={(e) =>
                                  setDeleteAccountForm((p) => ({ ...p, password: e.target.value }))
                                }
                                placeholder={lang === "EN" ? "Your account password" : "Password akun Anda"}
                                autoComplete="current-password"
                                style={{
                                  width: "100%",
                                  padding: "10px 14px",
                                  borderRadius: 10,
                                  border: "1px solid var(--alert-error-border)",
                                  backgroundColor: "var(--bg-card)",
                                  fontSize: 13,
                                  color: "var(--maroon)",
                                  outline: "none",
                                }}
                              />
                            )}
                            <input
                              type="text"
                              value={deleteAccountForm.confirm}
                              onChange={(e) =>
                                setDeleteAccountForm((p) => ({ ...p, confirm: e.target.value }))
                              }
                              placeholder={
                                lang === "EN" ? 'Type "DELETE ACCOUNT"' : 'Ketik "HAPUS AKUN"'
                              }
                              style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: 10,
                                border: "1px solid var(--alert-error-border)",
                                backgroundColor: "var(--bg-card)",
                                fontSize: 13,
                                color: "var(--maroon)",
                                outline: "none",
                              }}
                            />
                            {deleteAccountError && (
                              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--alert-error-text)" }}>
                                {deleteAccountError}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteAccountMode(false);
                                  setDeleteAccountForm({ password: "", confirm: "" });
                                  setDeleteAccountError("");
                                }}
                                className="btn-interactive"
                                style={{
                                  padding: "9px 18px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "1px solid var(--alert-error-border)",
                                  backgroundColor: "var(--bg-card)",
                                  color: "var(--alert-error-text)",
                                  fontSize: 13,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                {lang === "EN" ? "Cancel" : "Batal"}
                              </button>
                              <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={
                                  deletingAccount ||
                                  !["HAPUS AKUN", "DELETE ACCOUNT"].includes(
                                    deleteAccountForm.confirm.trim().toUpperCase().replace(/\s+/g, " ")
                                  ) ||
                                  (!currentUser?.google_linked && !deleteAccountForm.password)
                                }
                                className="btn-interactive"
                                style={{
                                  padding: "9px 18px",
                                  borderRadius: "var(--radius-pill)",
                                  border: "none",
                                  backgroundColor: "#C84336",
                                  color: "#FFFFFF",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  cursor: deletingAccount ? "wait" : "pointer",
                                  opacity: deletingAccount ? 0.7 : 1,
                                }}
                              >
                                {deletingAccount
                                  ? lang === "EN"
                                    ? "Deleting..."
                                    : "Menghapus..."
                                  : lang === "EN"
                                    ? "Delete permanently"
                                    : "Hapus permanen"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteAccountMode(true)}
                            className="btn-interactive"
                            style={{
                              marginTop: 12,
                              padding: "9px 18px",
                              borderRadius: "var(--radius-pill)",
                              border: "1px solid var(--alert-error-border)",
                              backgroundColor: "var(--bg-card)",
                              color: "var(--alert-error-text)",
                              fontSize: 13,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {lang === "EN" ? "Delete my account" : "Hapus akun saya"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "14px 28px",
                        borderTop: "1px solid var(--border-light)",
                        backgroundColor: "var(--bg-card)",
                        ...LAYOUT.row,
                        display: deleteAccountMode ? "none" : "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        type="submit"
                        className="btn-interactive btn-lift"
                        style={{
                          padding: "11px 32px",
                          borderRadius: "var(--radius-pill)",
                          border: "none",
                          backgroundColor: "var(--orange)",
                          color: "var(--on-orange-text)",
                          fontSize: 14,
                          fontWeight: 800,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                        }}
                      >
                        {lang === "EN" ? "Save" : "Simpan"}
                      </button>
                    </div>
                  </form>
                )}

                {activeDrawerModal === "favorites" && (
                  <div className="modal-scroll-body" style={{ padding: "18px 26px 24px" }}>
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
                                ...LAYOUT.between,
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
                  <div className="modal-scroll-body" style={{ padding: "18px 26px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {notificationsList.some((n) => !n.status_baca) && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                        <button
                          type="button"
                          onClick={async () => {
                            setNotificationsList((prev) =>
                              prev.map((n) => ({ ...n, status_baca: true }))
                            );
                            await api.markAllNotificationsRead().catch(() => { });
                          }}
                          style={{
                            border: "1px solid var(--border-input)",
                            backgroundColor: "var(--bg-card)",
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
                              await api.markNotificationRead(n.id_notifikasi).catch(() => { });
                            }
                            if (n.id_pesanan && /chat/i.test(String(n.pesan || ""))) {
                              const linkedOrder =
                                ordersHistory.find((o) => Number(o.id_pesanan) === Number(n.id_pesanan)) ||
                                { id_pesanan: n.id_pesanan, nomor_antrean: `#${n.id_pesanan}`, is_paid: true };
                              setActiveDrawerModal(null);
                              handleOpenOrderChat(linkedOrder);
                            }
                          }}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 12,
                            backgroundColor: n.status_baca ? "var(--bg-card)" : "var(--bg-cream)",
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
                  <div className="modal-scroll-body" style={{ padding: "18px 26px 24px", display: "flex", flexDirection: "column", gap: 12, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "var(--bg-auth-page)", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>
                        {lang === "EN" ? "How do I pre-order food?" : "Bagaimana cara memesan makanan?"}
                      </div>
                      {lang === "EN"
                        ? "Choose a dish from Home or Tenant, add it to your cart, and finish QRIS payment to get your pickup queue number."
                        : "Pilih menu dari halaman Beranda atau Kantin, masukkan ke keranjang, lalu selesaikan pembayaran QRIS untuk mendapatkan nomor antrean."}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 12, backgroundColor: "var(--bg-auth-page)", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>
                        {lang === "EN" ? "How can a Tenant upload menu items?" : "Bagaimana cara upload menu bagi Tenant?"}
                      </div>
                      {lang === "EN" ? (
                        <>Sign in as a Tenant (Vendor), open the <strong>Menu</strong> tab, then click <strong>+ Upload Menu</strong>.</>
                      ) : (
                        <>Masuk sebagai Tenant (Penjual), buka tab <strong>Menu</strong>, lalu klik tombol <strong>+ Tambah Menu</strong>.</>
                      )}
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
                  backgroundColor: "var(--bg-card)",
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
                    ...LAYOUT.center,
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
                        backgroundColor: "var(--bg-overlay-glass)",
                        ...LAYOUT.center,
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
                        backgroundColor: "var(--bg-card)",
                        ...LAYOUT.row,
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
                          ? `${activeMenuDetail.rating} (${activeMenuDetail.reviews_count ?? activeMenuDetail.reviews ?? 0} ${lang === "EN" ? "reviews" : "ulasan"
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
                          ...LAYOUT.row,
                          gap: 8,
                          fontSize: 13,
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => openTenantMenuFromItem(activeMenuDetail)}
                          className="btn-interactive"
                          title={lang === "EN" ? `View ${activeMenuDetail.tenant_name} menu` : `Lihat menu ${activeMenuDetail.tenant_name}`}
                          style={{
                            ...LAYOUT.inlineRow,
                            gap: 5,
                            padding: "4px 10px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--border-light)",
                            backgroundColor: "var(--bg-cream)",
                            fontWeight: 800,
                            fontSize: 12.5,
                            color: "var(--maroon)",
                            cursor: "pointer",
                          }}
                        >
                          <Store size={13} color="var(--orange-dark)" />
                          <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>
                            {activeMenuDetail.tenant_name}
                          </span>
                          <ChevronRight size={13} color="var(--maroon)" />
                        </button>
                        <span>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={14} />
                          Ready in {activeMenuDetail.estimasi_menit} min
                        </span>
                        <span>·</span>
                        {isItemTenantOpen(activeMenuDetail) ? (
                          <span>
                            {lang === "EN" ? "Open until" : "Buka s/d"}{" "}
                            {getItemTenantObj(activeMenuDetail)?.jam_tutup || "21:00"}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 999,
                              backgroundColor: "#FEE2E2",
                              color: "#B91C1C",
                              fontSize: 11.5,
                              fontWeight: 800,
                            }}
                          >
                            {lang === "EN"
                              ? `Closed · Opens ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}`
                              : `Tutup · Buka ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}`}
                          </span>
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
                          ...LAYOUT.between,
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
                            ...LAYOUT.row,
                            padding: "5px 12px",
                            borderRadius: "var(--radius-pill)",
                            border: "1px solid var(--border-input)",
                            backgroundColor: "var(--bg-card)",
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
                              ...LAYOUT.center,
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
                              ...LAYOUT.center,
                            }}
                          >
                            <Plus size={15} color="var(--maroon)" />
                          </button>
                        </div>
                      </div>

                      {!isItemTenantOpen(activeMenuDetail) && (
                        <div
                          style={{
                            marginBottom: 12,
                            padding: "10px 14px",
                            borderRadius: 12,
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FCA5A5",
                            color: "#B91C1C",
                            fontSize: 12.5,
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          {lang === "EN"
                            ? `This tenant (${activeMenuDetail.tenant_name}) is currently closed. Opens at ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}.`
                            : `Tenant ${activeMenuDetail.tenant_name} sedang tutup. Buka kembali pukul ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}.`}
                        </div>
                      )}

                      <button
                        onClick={async (e) => {
                          const ok = await handleAddToCart(activeMenuDetail, detailQuantity, e);
                          if (ok) closeFoodDetail();
                        }}
                        className="btn-interactive btn-lift"
                        style={{
                          width: "100%",
                          padding: "14px",
                          borderRadius: "var(--radius-pill)",
                          border: "none",
                          backgroundColor: isItemTenantOpen(activeMenuDetail) ? "var(--orange)" : "#9CA3AF",
                          color: "#FFFFFF",
                          fontSize: 15,
                          fontWeight: 800,
                          cursor: isItemTenantOpen(activeMenuDetail) ? "pointer" : "not-allowed",
                          ...LAYOUT.center,
                          gap: 10,
                          boxShadow: isItemTenantOpen(activeMenuDetail) ? "0 4px 14px rgba(248, 163, 75, 0.4)" : "none",
                        }}
                      >
                        <ShoppingBag size={18} />
                        <span>
                          {isItemTenantOpen(activeMenuDetail)
                            ? `${lang === "EN" ? "Add to cart" : "Tambah ke keranjang"} · ${formatRupiah(activeMenuDetail.harga * detailQuantity)}`
                            : lang === "EN"
                              ? `Tenant Closed · Opens ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}`
                              : `Tenant Sedang Tutup · Buka ${getItemTenantObj(activeMenuDetail)?.jam_buka || "07:00"}`}
                        </span>
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
                        backgroundColor: "var(--bg-auth-page)",
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
                            backgroundColor: "var(--bg-auth-page)",
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
                      ...LAYOUT.between,
                      marginBottom: 12,
                    }}
                  >
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: "var(--maroon)" }}>
                      {lang === "EN" ? "You might also like" : "Menu lain yang mungkin Anda suka"}
                    </h4>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      overflowX: "auto",
                      padding: "12px 12px 20px",
                      margin: "-8px -12px 0",
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
                            backgroundColor: "var(--bg-auth-page)",
                            border: "1px solid var(--border-light)",
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              height: 75,
                              borderRadius: 8,
                              backgroundColor: "#E2E3E2",
                              overflow: "hidden",
                              isolation: "isolate",
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

      {(!currentUser || isAuthOpen) && tenantOnboardingStep === 0 && (
        <div className="auth-page-overlay">
          <div className="auth-header-controls">
            <button
              type="button"
              className="header-lang-btn"
              onClick={() => changeLanguage(lang === "ID" ? "EN" : "ID")}
              style={{
                ...LAYOUT.row,
                gap: 6,
                minWidth: 74,
                justifyContent: "center",
                padding: "7px 12px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-card)",
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
            <ThemeToggleButton
              darkTitle={t.themeToDark}
              lightTitle={t.themeToLight}
              size={34}
            />
          </div>
          <div className="auth-page-scroll">
            <div className="auth-page-inner">
              <div style={{ textAlign: "center", marginBottom: 14, flexShrink: 0 }}>
            <div style={{ display: "inline-block", marginBottom: 6 }}>
              <svg width="54" height="54" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="46" stroke="#D49354" strokeWidth="3" />
                <circle cx="50" cy="50" r="41" stroke="#E5B888" strokeWidth="1.5" />
                <path
                  d="M33 26V40C33 44 36 46 39 46V74H43V46C46 46 49 44 49 40V26H46V38H44V26H38V38H36V26H33Z"
                  fill="var(--maroon)"
                />
                <path
                  d="M51 32L78 50L51 68V32Z"
                  fill="#F8A34B"
                  stroke="var(--maroon)"
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
              {lang === "EN" ? "FROM OUR CANTEEN TO YOUR HANDS" : "DARI KANTIN KAMPUS KE TANGANMU"}
            </div>
          </div>

          <div
            style={{
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 16px 44px rgba(82, 42, 40, 0.1), 0 2px 8px rgba(82, 42, 40, 0.04)",
              border: "1px solid var(--border-light)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
            className="auth-card animate-modal-zoom"
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
                  ...LAYOUT.center,
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
                  {
                    role: "Customer",
                    label: lang === "EN" ? "Customer" : "Pengguna (Pembeli)",
                  },
                  {
                    role: "Vendor",
                    label: lang === "EN" ? "Tenant (Vendor)" : "Tenant (Penjual)",
                  },
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
                  backgroundColor: "var(--alert-error-bg)",
                  border: "1px solid var(--alert-error-border)",
                  color: "var(--alert-error-text)",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  ...LAYOUT.row,
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
                  backgroundColor: "var(--alert-success-bg)",
                  border: "1px solid var(--alert-success-border)",
                  color: "var(--alert-success-text)",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  ...LAYOUT.row,
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
                  {authMode === "forgot"
                    ? lang === "EN"
                      ? "Username or Email"
                      : "Username atau Email"
                    : "Username"}
                </label>
                <div
                  style={{
                    ...LAYOUT.row,
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
                        ? lang === "EN"
                          ? "Enter tenant username"
                          : "Masukkan username tenant"
                        : lang === "EN"
                          ? "Enter your username"
                          : "Masukkan username Anda"
                    }
                    value={authForm.username}
                    onChange={(e) => setAuthForm((prev) => ({ ...prev, username: e.target.value }))}
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
                      {loginRoleTab === "Vendor"
                        ? lang === "EN"
                          ? "Canteen / Tenant Name"
                          : "Nama Kantin / Tenant"
                        : lang === "EN"
                          ? "Full Name"
                          : "Nama Lengkap"}
                    </label>
                    <div
                      style={{
                        ...LAYOUT.row,
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
                            ? lang === "EN"
                              ? "e.g. Campus Nusantara Canteen"
                              : "Contoh: Kantin Nusantara"
                            : lang === "EN"
                              ? "Enter your full name"
                              : "Masukkan nama lengkap Anda"
                        }
                        value={loginRoleTab === "Vendor" ? authForm.nama_tenant : authForm.nama}
                        onChange={(e) =>
                          setAuthForm((prev) => ({
                            ...prev,
                            nama: e.target.value,
                            nama_tenant: e.target.value,
                          }))
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
                        ...LAYOUT.row,
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
                        onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
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
                          ...LAYOUT.row,
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
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, reset_token: e.target.value }))}
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
                        {lang === "EN" ? "New Password" : "Password Baru"}
                      </label>
                      <div
                        style={{
                          ...LAYOUT.row,
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
                          placeholder={lang === "EN" ? "Minimum 6 characters" : "Minimal 6 karakter"}
                          value={authForm.new_password}
                          onChange={(e) => setAuthForm((prev) => ({ ...prev, new_password: e.target.value }))}
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
                            ...LAYOUT.center,
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
                    {lang === "EN" ? "Password" : "Kata Sandi"}
                  </label>
                  <div
                    style={{
                      ...LAYOUT.row,
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
                      placeholder={authMode === "register" ? (lang === "EN" ? "Minimum 6 characters" : "Minimal 6 karakter") : "••••••••"}
                      value={authForm.password}
                      onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
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
                        ...LAYOUT.center,
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
                  color: "var(--on-orange-text)",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  marginTop: 2,
                  boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  opacity: authLoading ? 0.7 : 1,
                }}
              >
                {authLoading
                  ? lang === "EN"
                    ? "Processing..."
                    : "Memproses..."
                  : authMode === "forgot"
                    ? forgotStep === 1
                      ? lang === "EN"
                        ? "Send Reset Code"
                        : "Kirim Kode Reset"
                      : lang === "EN"
                        ? "Save New Password"
                        : "Simpan Password Baru"
                    : authMode === "login"
                      ? lang === "EN"
                        ? "Log in"
                        : "Masuk"
                      : lang === "EN"
                        ? "Sign up"
                        : "Daftar"}
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
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>{lang === "EN" ? "OR" : "ATAU"}</span>
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
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                        ...LAYOUT.center,
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
                        {lang === "EN"
                          ? `Continue with Google (${loginRoleTab === "Vendor" ? "Tenant" : "Customer"})`
                          : `Lanjutkan dengan Google (${loginRoleTab === "Vendor" ? "Tenant" : "Pengguna"})`}
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
                    {lang === "EN" ? "Forgot password?" : "Lupa kata sandi?"}
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
                    {lang === "EN" ? "← Back to Log in" : "← Kembali ke halaman Masuk"}
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
                  {lang === "EN"
                    ? "By signing up you agree to the canteen's terms of service."
                    : "Dengan mendaftar, Anda menyetujui syarat dan ketentuan layanan kantin."}
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
                {lang === "EN" ? "Don't have an account? " : "Belum punya akun? "}
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
                  {lang === "EN" ? "Sign up here" : "Daftar di sini"}
                </button>
              </span>
            ) : (
              <span>
                {lang === "EN" ? "Already have an account? " : "Sudah punya akun? "}
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
                  {lang === "EN" ? "Log in here" : "Masuk di sini"}
                </button>
              </span>
            )}
          </div>
            </div>
          </div>
        </div>
      )}

      {tenantOnboardingStep > 0 && (pendingVendorSignup || portalMode === "tenant") && (
        <TenantOnboardingWizard
          lang={lang}
          t={t}
          handleToggleLang={() => changeLanguage(lang === "ID" ? "EN" : "ID")}
          ThemeToggleButton={ThemeToggleButton}
          tenantOnboardingStep={tenantOnboardingStep}
          setTenantOnboardingStep={setTenantOnboardingStep}
          onboardingForm={onboardingForm}
          setOnboardingForm={setOnboardingForm}
          onboardingError={onboardingError}
          setOnboardingError={setOnboardingError}
          onboardingSaving={onboardingSaving}
          isOnboardingStep2Valid={isOnboardingStep2Valid}
          handleCompleteTenantOnboarding={handleCompleteTenantOnboarding}
          readAndCompressImageFile={readAndCompressImageFile}
          currentUser={currentUser}
          onBackToRegister={() => {
            try {
              if (currentUser?.id_user) {
                localStorage.removeItem(`letsorder_tenant_onboarding_${currentUser.id_user}`);
              }
            } catch {
              // Ignore storage errors
            }
            const restoredUsername =
              pendingVendorSignup?.username || currentUser?.username || "";
            const restoredTenantName =
              onboardingForm.nama_tenant ||
              pendingVendorSignup?.nama_tenant ||
              currentUser?.nama_tenant ||
              "";
            const restoredEmail =
              onboardingForm.email ||
              pendingVendorSignup?.email ||
              currentUser?.email ||
              "";
            const restoredPassword = pendingVendorSignup?.password || "";

            if (currentUser) {
              clearStoredSession();
              setCurrentUser(null);
              setMyTenantInfo(null);
            }
            setPendingVendorSignup(null);
            setTenantOnboardingStep(0);
            setOnboardingError("");
            setLoginRoleTab("Vendor");
            setAuthMode("register");
            setAuthError("");
            setAuthSuccess("");
            setAuthForm({
              username: restoredUsername,
              nama: restoredTenantName,
              password: restoredPassword,
              email: restoredEmail,
              nama_tenant: restoredTenantName,
              new_password: "",
            });
            setIsAuthOpen(true);
          }}
        />
      )}

      {isStoreSettingsOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            backgroundColor: "var(--backdrop)",
            backdropFilter: "blur(5px)",
            ...LAYOUT.center,
            padding: 20,
          }}
          onClick={() => setIsStoreSettingsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-zoom"
            style={{
              width: "100%",
              maxWidth: 450,
              maxHeight: "86vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              padding: 0,
              boxShadow: "0 20px 50px rgba(82, 42, 40, 0.24)",
              border: "1px solid var(--border-light)",
            }}
          >
            {/* Fixed Header */}
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 26px 15px",
                borderBottom: "1px solid var(--border-light)",
                backgroundColor: "var(--bg-card)",
              }}
            >
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 900, color: "var(--maroon)", marginBottom: 2 }}>
                  {lang === "EN" ? "Tenant Settings" : "Pengaturan Tenant"}
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {lang === "EN"
                    ? "Manage your tenant profile picture, store details & operating hours"
                    : "Kelola foto profil, informasi gerai, dan jam operasional tenant"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStoreSettingsOpen(false)}
                style={{
                  border: "none",
                  background: "var(--bg-cream)",
                  borderRadius: "50%",
                  width: 34,
                  height: 34,
                  cursor: "pointer",
                  ...LAYOUT.center,
                  flexShrink: 0,
                }}
              >
                <X size={16} color="var(--maroon)" />
              </button>
            </div>

            <form
              onSubmit={handleSaveStoreSettings}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {/* Scrollable Content Body */}
              <div
                className="modal-scroll-body"
                style={{
                  padding: "20px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {storeSettingsError && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      backgroundColor: "#FDF0EE",
                      color: "#C84336",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {storeSettingsError}
                  </div>
                )}

                {/* Tenant Profile Picture (PP) moved from My Profile */}
                <div
                  style={{
                    ...LAYOUT.row,
                    gap: 18,
                    padding: "14px 16px",
                    borderRadius: 16,
                    backgroundColor: "var(--bg-auth-page)",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-cream)",
                      border: "3px solid #EDD1B4",
                      overflow: "hidden",
                      ...LAYOUT.center,
                      fontSize: 24,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      flexShrink: 0,
                      boxShadow: "0 6px 16px rgba(82, 42, 40, 0.1)",
                    }}
                  >
                    {storeForm.logo ? (
                      <img
                        src={resolveMediaUrl(storeForm.logo)}
                        alt="Tenant Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span>{displayInitials}</span>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--maroon)" }}>
                      {lang === "EN" ? "Tenant Profile Picture" : "Foto Profil Tenant"}
                    </div>
                    <label
                      className="btn-interactive"
                      style={{
                        ...LAYOUT.inlineRow,
                        gap: 6,
                        padding: "8px 16px",
                        borderRadius: "var(--radius-pill)",
                        border: "1px solid var(--border-input)",
                        backgroundColor: "var(--bg-card)",
                        color: "var(--maroon)",
                        fontSize: 12.5,
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      <Upload size={13} />
                      <span>{lang === "EN" ? "Choose Image" : "Pilih Gambar"}</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png,image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const dataUrl = await readAndCompressImageFile(f, 800, 0.85);
                            setStoreForm((p) => ({ ...p, logo: dataUrl }));
                            setStoreSettingsError("");
                          } catch (err) {
                            setStoreSettingsError(err.message);
                          }
                        }}
                      />
                    </label>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {lang === "EN"
                        ? "Max 1 MB · Format: .JPEG, .PNG"
                        : "Maks. 1 MB · Format: .JPEG, .PNG"}
                    </div>
                  </div>
                </div>

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
                    placeholder={lang === "EN" ? "e.g. Booth #1 · Building A Canteen" : "Contoh: Stand #1 · Kantin Gedung A"}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Description" : "Deskripsi Kantin"}
                  </label>
                  <textarea
                    rows={3}
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
              </div>

              {/* Fixed Footer */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "14px 26px",
                  borderTop: "1px solid var(--border-light)",
                  backgroundColor: "var(--bg-card)",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="submit"
                  className="btn-interactive btn-lift"
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    borderRadius: "var(--radius-pill)",
                    border: "none",
                    backgroundColor: "var(--orange)",
                    color: "var(--on-orange-text)",
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(248, 163, 75, 0.35)",
                  }}
                >
                  {lang === "EN" ? "Save" : "Simpan"}
                </button>
              </div>
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
            backgroundColor: "var(--backdrop)",
            backdropFilter: "blur(5px)",
            ...LAYOUT.center,
            padding: 20,
          }}
          onClick={() => setIsPromoModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "var(--bg-card)",
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
                  placeholder={lang === "EN" ? "e.g. CANTEEN10" : "Contoh: KANTIN10"}
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
                  placeholder={lang === "EN" ? "e.g. Lunch Hour Special Discount" : "Contoh: Diskon Spesial Jam Makan Siang"}
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
                    <option value="fixed">{lang === "EN" ? "Fixed (Rp)" : "Nominal (Rp)"}</option>
                    <option value="percentage">{lang === "EN" ? "Percentage (%)" : "Persen (%)"}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {promoForm.tipe === "percentage"
                      ? lang === "EN" ? "Percentage (%)" : "Persentase (%)"
                      : lang === "EN" ? "Discount (Rp)" : "Potongan (Rp)"}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Max Vouchers / Account" : "Jatah Voucher / Akun"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={promoForm.batas_per_user}
                    onChange={(e) => setPromoForm((p) => ({ ...p, batas_per_user: e.target.value }))}
                    placeholder="1"
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-input)", fontSize: 13 }}
                  />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, marginTop: -4 }}>
                {lang === "EN"
                  ? "Once a customer uses this voucher up to the per-account limit, it automatically disappears from their voucher list."
                  : "Jika pembeli sudah memakai voucher sesuai batas per akun (misal 1x), voucher otomatis hilang dari akun pembeli tersebut."}
              </div>
              <button
                type="submit"
                className="btn-interactive btn-lift"
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "var(--orange)", color: "var(--on-orange-text)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
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
            backgroundColor: "var(--backdrop)",
            backdropFilter: "blur(5px)",
            ...LAYOUT.center,
            padding: 20,
          }}
          onClick={() => setCancelTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "var(--bg-card)",
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
                  style={{ flex: 1, padding: "10px", borderRadius: "var(--radius-pill)", border: "1px solid var(--border-input)", backgroundColor: "var(--bg-card)", color: "var(--maroon)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
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
            backgroundColor: "var(--backdrop)",
            backdropFilter: "blur(5px)",
            ...LAYOUT.center,
            padding: 20,
          }}
          onClick={() => setReviewTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "var(--bg-card)",
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
                style={{ width: "100%", padding: "12px", borderRadius: "var(--radius-pill)", border: "none", backgroundColor: "var(--orange)", color: "var(--on-orange-text)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
              >
                {lang === "EN" ? "Submit Rating" : "Kirim Rating & Ulasan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {chatOrder && (
        <div
          data-testid="order-chat-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            backgroundColor: "var(--backdrop)",
            backdropFilter: "blur(5px)",
            ...LAYOUT.center,
            padding: 16,
          }}
          onClick={() => {
            setChatOrder(null);
            setChatError("");
            setChatImage("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-zoom"
            style={{
              width: "100%",
              maxWidth: 480,
              height: "min(84vh, 640px)",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-float)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-light)",
                ...LAYOUT.between,
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <MessageCircle size={17} color="var(--orange)" />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "var(--maroon)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {portalMode === "tenant" ? chatOrder.customer_name : chatOrder.tenant_name}
                  </span>
                  <span
                    className="tabular"
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--bg-cream)",
                      color: "var(--maroon)",
                      flexShrink: 0,
                    }}
                  >
                    {chatOrder.nomor_antrean}
                  </span>
                </div>
                {chatOrder.items_summary && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chatOrder.items_summary}
                    {chatOrder.booth ? ` · ${chatOrder.booth}` : ""}
                  </div>
                )}
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => {
                  setChatOrder(null);
                  setChatError("");
                  setChatImage("");
                }}
                style={{
                  border: "none",
                  background: "var(--bg-cream)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  ...LAYOUT.center,
                  flexShrink: 0,
                }}
              >
                <X size={16} color="var(--maroon)" />
              </button>
            </div>

            <div
              ref={chatListRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 18px",
                backgroundColor: "var(--bg-subtle)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {chatLoading && chatMessages.length === 0 ? (
                <div style={{ margin: "auto", fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                  {lang === "EN" ? "Loading messages..." : "Memuat percakapan..."}
                </div>
              ) : chatMessages.length === 0 ? (
                <div
                  style={{
                    margin: "auto",
                    textAlign: "center",
                    padding: "20px 16px",
                    color: "var(--text-muted)",
                    maxWidth: 300,
                  }}
                >
                  <MessageCircle size={32} color="var(--orange)" style={{ margin: "0 auto 10px", opacity: 0.85 }} />
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--maroon)", marginBottom: 4 }}>
                    {lang === "EN" ? "Start order chat" : "Mulai chat pesanan"}
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                    {lang === "EN"
                      ? "Send text messages or photos about your paid order directly."
                      : "Kirim pesan teks atau gambar terkait pesanan yang sudah dibayar."}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMine = Number(msg.id_pengirim) === Number(currentUser?.id_user);
                  const timeShort = msg.waktu ? String(msg.waktu).slice(11, 16) : "";
                  // Tanda dibaca dua arah: status dihitung dari lawan bicara
                  // (customer melihat tenant, tenant melihat customer).
                  const counterpartId =
                    portalMode === "tenant" ? chatOrder?.customer_id : chatOrder?.tenant_user_id;
                  const isReadByCounterpart =
                    isMine &&
                    Boolean(counterpartId) &&
                    Array.isArray(msg.dibaca_oleh) &&
                    msg.dibaca_oleh.some((id) => Number(id) === Number(counterpartId));
                  return (
                    <div
                      key={msg.id_pesan}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "82%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          marginBottom: 3,
                          padding: "0 4px",
                        }}
                      >
                        {isMine ? (lang === "EN" ? "You" : "Anda") : msg.nama_pengirim}
                      </div>
                      <div
                        style={{
                          padding: msg.gambar && !msg.teks ? "6px" : "10px 13px",
                          borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          backgroundColor: isMine ? "var(--orange)" : "var(--bg-card)",
                          color: isMine ? "#2B1615" : "var(--maroon)",
                          border: isMine ? "none" : "1px solid var(--border-light)",
                          boxShadow: "var(--shadow-sm)",
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.gambar && (
                          <img
                            src={msg.gambar}
                            alt={lang === "EN" ? "Chat attachment" : "Lampiran gambar"}
                            onClick={() => setChatPreviewImage(msg.gambar)}
                            style={{
                              display: "block",
                              maxWidth: 220,
                              maxHeight: 220,
                              width: "100%",
                              borderRadius: 10,
                              objectFit: "cover",
                              cursor: "pointer",
                              marginBottom: msg.teks ? 8 : 0,
                            }}
                          />
                        )}
                        {msg.teks && (
                          <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                            {msg.teks}
                          </div>
                        )}
                      </div>
                      {timeShort && (
                        <div
                          className="tabular"
                          style={{
                            fontSize: 10,
                            color: "var(--text-light)",
                            marginTop: 3,
                            padding: "0 4px",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span>{timeShort}</span>
                          {isMine && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 2,
                                fontWeight: 800,
                                color: isReadByCounterpart ? "var(--orange)" : "var(--text-light)",
                              }}
                            >
                              {isReadByCounterpart ? <CheckCheck size={11} /> : <Check size={11} />}
                              {isReadByCounterpart
                                ? lang === "EN"
                                  ? "Read"
                                  : "Dibaca"
                                : lang === "EN"
                                  ? "Sent"
                                  : "Terkirim"}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {chatError && (
              <div
                role="alert"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "var(--alert-error-bg)",
                  color: "var(--alert-error-text)",
                  fontSize: 12,
                  fontWeight: 700,
                  borderTop: "1px solid var(--alert-error-border)",
                }}
              >
                {chatError}
              </div>
            )}

            {chatImage && (
              <div
                style={{
                  padding: "10px 16px 0",
                  backgroundColor: "var(--bg-card)",
                  borderTop: "1px solid var(--border-light)",
                  ...LAYOUT.row,
                  gap: 10,
                }}
              >
                <div style={{ position: "relative", width: 58, height: 58 }}>
                  <img
                    src={chatImage}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                      objectFit: "cover",
                      border: "1px solid var(--border-light)",
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => {
                      setChatImage("");
                      if (chatFileInputRef.current) chatFileInputRef.current.value = "";
                    }}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "none",
                      backgroundColor: "#C84336",
                      color: "#FFFFFF",
                      ...LAYOUT.center,
                      cursor: "pointer",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                  {lang === "EN" ? "Image ready to send" : "Gambar siap dikirim"}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSendChatMessage}
              style={{
                padding: "12px 14px",
                borderTop: chatImage ? "none" : "1px solid var(--border-light)",
                backgroundColor: "var(--bg-card)",
                ...LAYOUT.row,
                gap: 8,
                flexShrink: 0,
              }}
            >
              <input
                ref={chatFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                data-testid="chat-image-input"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleSelectChatImage(f);
                }}
              />
              <button
                type="button"
                aria-label={lang === "EN" ? "Attach image" : "Kirim gambar"}
                title={lang === "EN" ? "Attach image" : "Pilih gambar"}
                onClick={() => chatFileInputRef.current?.click()}
                className="btn-interactive"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "1px solid var(--border-input)",
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--maroon)",
                  ...LAYOUT.inlineRow,
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <ImageIcon size={17} />
              </button>
              <input
                type="text"
                data-testid="chat-text-input"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (let i = 0; i < items.length; i += 1) {
                    if (items[i].type?.startsWith("image/")) {
                      const f = items[i].getAsFile();
                      if (f) {
                        e.preventDefault();
                        handleSelectChatImage(f);
                        break;
                      }
                    }
                  }
                }}
                maxLength={1000}
                placeholder={
                  lang === "EN"
                    ? "Type a message or paste an image..."
                    : "Tulis pesan atau tempel gambar..."
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border-input)",
                  backgroundColor: "var(--bg-subtle)",
                  color: "var(--maroon)",
                  fontSize: 13.5,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                data-testid="chat-send-btn"
                disabled={chatSending || (!chatText.trim() && !chatImage)}
                aria-label={lang === "EN" ? "Send message" : "Kirim pesan"}
                className="btn-interactive"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor:
                    chatSending || (!chatText.trim() && !chatImage)
                      ? "var(--dot-inactive)"
                      : "var(--orange)",
                  color: "#FFFFFF",
                  ...LAYOUT.inlineRow,
                  justifyContent: "center",
                  cursor: chatSending || (!chatText.trim() && !chatImage) ? "not-allowed" : "pointer",
                  flexShrink: 0,
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {chatPreviewImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1500,
            backgroundColor: "rgba(0, 0, 0, 0.84)",
            ...LAYOUT.center,
            padding: 20,
          }}
          onClick={() => setChatPreviewImage("")}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setChatPreviewImage("")}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "#FFFFFF",
              ...LAYOUT.center,
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
          <img
            src={chatPreviewImage}
            alt="Zoomed attachment"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "86vh",
              borderRadius: 12,
              objectFit: "contain",
            }}
          />
        </div>
      )}

      {flyingParticles.map((pt) => (
        <div
          key={pt.id}
          className="fly-cart-particle"
          style={{
            "--start-x": `${pt.startX}px`,
            "--start-y": `${pt.startY}px`,
            "--end-x": `${pt.endX}px`,
            "--end-y": `${pt.endY}px`,
          }}
        >
          <ShoppingBag size={17} strokeWidth={2.5} />
        </div>
      ))}

      {currentUser &&
        portalMode === "customer" &&
        navTab !== "orders" &&
        (totalCartCount > 0 || flyingParticles.length > 0 || cartBumpActive) && (
          <button
            ref={floatingCartBtnRef}
            type="button"
            data-testid="floating-cart-btn"
            onClick={() => {
              setNavTab("orders");
              setActiveTenantView(null);
              closeFoodDetail();
              if (typeof window !== "undefined" && window.scrollTo) {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={`floating-cart-btn${cartBumpActive ? " cart-bump-anim" : ""}`}
            aria-label={lang === "EN" ? "View cart and checkout" : "Lihat keranjang dan pesanan"}
          >
            <div
              style={{
                position: "relative",
                width: 34,
                height: 34,
                borderRadius: "50%",
                backgroundColor: "var(--orange)",
                color: "#FFFFFF",
                ...LAYOUT.center,
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={18} strokeWidth={2.5} />
              {totalCartCount > 0 && (
                <span
                  key={totalCartCount}
                  className="badge-pop"
                  style={{
                    position: "absolute",
                    top: -5,
                    right: -6,
                    minWidth: 19,
                    height: 19,
                    padding: "0 5px",
                    borderRadius: 999,
                    backgroundColor: "#C84336",
                    color: "#FFFFFF",
                    fontSize: 10.5,
                    fontWeight: 900,
                    ...LAYOUT.inlineRow,
                    justifyContent: "center",
                    border: "2px solid #FFFFFF",
                  }}
                >
                  {totalCartCount}
                </span>
              )}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.85 }}>
                {lang === "EN" ? `${totalCartCount} in cart` : `${totalCartCount} di keranjang`}
              </div>
              <div className="tabular" style={{ fontSize: 13.5, fontWeight: 900 }}>
                {formatRupiah(subtotal)}
              </div>
            </div>
            <ArrowRight size={15} style={{ marginLeft: 2, opacity: 0.9 }} />
          </button>
        )}

      {incomingChatAlert && (
        <div
          role="alert"
          data-testid="incoming-chat-banner"
          style={{
            position: "fixed",
            top: 86,
            right: 20,
            zIndex: 2450,
            width: "min(360px, calc(100vw - 32px))",
            backgroundColor: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--orange)",
            boxShadow: "0 14px 34px rgba(82, 42, 40, 0.22)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: "var(--orange-soft)",
              color: "var(--orange-dark)",
              ...LAYOUT.center,
              flexShrink: 0,
            }}
          >
            <MessageCircle size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--orange-dark)", marginBottom: 2 }}>
              {lang === "EN"
                ? `New Order Chat · ${incomingChatAlert.queueCode}`
                : `Pesan Chat Baru · ${incomingChatAlert.queueCode}`}
            </div>
            <div
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: "var(--maroon)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {incomingChatAlert.senderName}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: 8,
              }}
            >
              {incomingChatAlert.preview}
            </div>
            <button
              type="button"
              onClick={() => {
                const targetOrd = incomingChatAlert.order;
                setIncomingChatAlert(null);
                handleOpenOrderChat(targetOrd);
              }}
              className="btn-interactive"
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-pill)",
                border: "none",
                backgroundColor: "var(--orange)",
                color: "#FFFFFF",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {lang === "EN" ? "Reply Now" : "Balas Chat"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIncomingChatAlert(null)}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <X size={15} />
          </button>
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
            ...LAYOUT.row,
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
