import { useState, useEffect, useRef } from "react";
import {
  Bell, User, Menu, X, Search,
  Mail, Coffee, ShoppingCart as CartIcon, Newspaper, LineChart, MapPin,
  BookOpen, Music, FileText, Languages, Wallet, Store,
  TrendingUp, Cloud, Trophy, Tv, BookMarked, Building2,
  Briefcase, ShieldCheck, ChevronDown, Home,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";

const EXTERNAL_PATHS = new Set([
  "/shopping/", "/job-portal/", "/home/admin/", "/webtoon/",
  "/mail/", "/series/", "/sports/", "/music/",
  "https://shopping.sholok.com",
]);

const ALL_SERVICES = [
  { icon: Mail,        label: "mail",        labelBn: "মেইল",           labelEn: "Mail",         status: "live" as const, category: "communication", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",             path: "/mail/" },
  { icon: CartIcon,    label: "shopping",    labelBn: "শপিং",            labelEn: "Shopping",     status: "live" as const, category: "shopping",      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",             path: "https://shopping.sholok.com" },
  { icon: Store,       label: "smartStore",  labelBn: "স্মার্ট স্টোর",   labelEn: "Smart Store",  status: "live" as const, category: "shopping",      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",             path: "/smartstore" },
  { icon: Newspaper,   label: "news",        labelBn: "নিউজ",            labelEn: "News",         status: "live" as const, category: "media",         color: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",         path: "/news" },
  { icon: FileText,    label: "blog",        labelBn: "ব্লগ",             labelEn: "Blog",         status: "live" as const, category: "media",         color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",  path: "/blog" },
  { icon: BookOpen,    label: "webtoon",     labelBn: "ওয়েবটুন",          labelEn: "Webtoon",      status: "beta" as const, category: "media",         color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",     path: "/webtoon/" },
  { icon: BookMarked,  label: "series",      labelBn: "সিরিজ",            labelEn: "Series",       status: "beta" as const, category: "media",         color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",             path: "/series/" },
  { icon: Tv,          label: "tv",          labelBn: "টিভি",             labelEn: "TV",           status: "soon" as const, category: "media",         color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",     path: "/tv" },
  { icon: Wallet,      label: "pay",         labelBn: "পে",               labelEn: "Pay",          status: "live" as const, category: "finance",       color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",         path: "/pay" },
  { icon: TrendingUp,  label: "finance",     labelBn: "ফাইন্যান্স",        labelEn: "Finance",      status: "live" as const, category: "finance",       color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",     path: "/finance" },
  { icon: MapPin,      label: "maps",        labelBn: "ম্যাপস",            labelEn: "Maps",         status: "live" as const, category: "location",      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",             path: "/maps" },
  { icon: Building2,   label: "realEstate",  labelBn: "রিয়েল এস্টেট",     labelEn: "Real Estate",  status: "live" as const, category: "location",      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", path: "/realestate" },
  { icon: Music,       label: "music",       labelBn: "মিউজিক",            labelEn: "Music",        status: "beta" as const, category: "entertainment", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",     path: "/music/" },
  { icon: Trophy,      label: "sports",      labelBn: "স্পোর্টস",          labelEn: "Sports",       status: "soon" as const, category: "entertainment", color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",                 path: "/sports/" },
  { icon: Coffee,      label: "cafe",        labelBn: "ক্যাফে",            labelEn: "Café",         status: "live" as const, category: "entertainment", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",         path: "/cafe" },
  { icon: Languages,   label: "translate",   labelBn: "ট্রান্সলেট",         labelEn: "Translate",    status: "live" as const, category: "knowledge",     color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",     path: "/translate" },
  { icon: BookOpen,    label: "dictionary",  labelBn: "অভিধান",            labelEn: "Dictionary",   status: "live" as const, category: "knowledge",     color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400", path: "/dictionary" },
  { icon: LineChart,   label: "knowledgeIn", labelBn: "জ্ঞান ইন",          labelEn: "Knowledge",    status: "live" as const, category: "knowledge",     color: "bg-lime-100 text-lime-600 dark:bg-lime-900/40 dark:text-lime-400",             path: "/qna" },
  { icon: Cloud,       label: "weather",     labelBn: "আবহাওয়া",           labelEn: "Weather",      status: "live" as const, category: "utility",       color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",                 path: "/weather" },
  { icon: Briefcase,   label: "jobPortal",   labelBn: "জব পোর্টাল",        labelEn: "Job Portal",   status: "live" as const, category: "career",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",             path: "/job-portal/" },
  { icon: ShieldCheck, label: "adminPanel",  labelBn: "অ্যাডমিন",           labelEn: "Admin Panel",  status: "live" as const, category: "system",        color: "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",             path: "/home/admin/" },
];

// Quick nav links for second row
const QUICK_LINKS = [
  { label: "home",     labelBn: "হোম",           path: "/home",                     external: false },
  { label: "shopping", labelBn: "শপিং",          path: "https://shopping.sholok.com", external: true  },
  { label: "news",     labelBn: "নিউজ",           path: "/news",                     external: false },
  { label: "blog",     labelBn: "ব্লগ",            path: "/blog",                     external: false },
  { label: "maps",     labelBn: "ম্যাপস",          path: "/maps",                     external: false },
  { label: "finance",  labelBn: "ফাইন্যান্স",       path: "/finance",                  external: false },
  { label: "jobPortal",labelBn: "জব পোর্টাল",     path: "/job-portal/",              external: false },
  { label: "weather",  labelBn: "আবহাওয়া",         path: "/weather",                  external: false },
];

const DELIVERY_AREAS = [
  { en: "All Bangladesh", bn: "সারা বাংলাদেশ", value: "BD" },
  { en: "Dhaka",          bn: "ঢাকা",           value: "DHA" },
  { en: "Chittagong",     bn: "চট্টগ্রাম",        value: "CTG" },
  { en: "Sylhet",         bn: "সিলেট",           value: "SYL" },
  { en: "Rajshahi",       bn: "রাজশাহী",          value: "RAJ" },
  { en: "Khulna",         bn: "খুলনা",           value: "KHL" },
  { en: "Barishal",       bn: "বরিশাল",          value: "BAR" },
  { en: "Mymensingh",     bn: "ময়মনসিংহ",         value: "MYM" },
  { en: "Rangpur",        bn: "রংপুর",           value: "RAN" },
  { en: "Cumilla",        bn: "কুমিল্লা",          value: "CUM" },
  { en: "Narayanganj",    bn: "নারায়ণগঞ্জ",        value: "NRJ" },
];

const MEGA_MENU_CATEGORIES = [
  { key: "all",           labelBn: "সব",        labelEn: "All" },
  { key: "shopping",      labelBn: "শপিং",       labelEn: "Shopping" },
  { key: "media",         labelBn: "মিডিয়া",     labelEn: "News & Media" },
  { key: "entertainment", labelBn: "বিনোদন",      labelEn: "Entertainment" },
  { key: "finance",       labelBn: "আর্থিক",      labelEn: "Finance" },
  { key: "knowledge",     labelBn: "জ্ঞান",        labelEn: "Knowledge" },
  { key: "location",      labelBn: "অবস্থান",      labelEn: "Location" },
  { key: "career",        labelBn: "ক্যারিয়ার",    labelEn: "Career" },
];

const HEADER_BRAND = "#5D0096";   // brand purple header
const LOGO_BG      = "#ffffff";   // white chip behind SHOLOK text
const LOGO_COLOR   = "#5D0096";   // purple text inside white chip
const NAV_PURPLE   = "#4a0078";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { unreadCount }   = useAppSelector((state) => state.notification);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated }  = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [allMenuOpen, setAllMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCat, setMenuCat] = useState("all");
  const accountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deliveryArea, setDeliveryArea] = useState<string>(() => {
    try { return localStorage.getItem("sholok_delivery_area") || "BD"; } catch { return "BD"; }
  });
  const isBn = language === "BN";
  const langRef = useRef<HTMLDivElement>(null);
  const deliveryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allMenuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setAllMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [allMenuOpen]);

  useEffect(() => { setAllMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!allMenuOpen) { setMenuSearch(""); setMenuCat("all"); }
  }, [allMenuOpen]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close delivery dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (deliveryRef.current && !deliveryRef.current.contains(e.target as Node)) setDeliveryOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleAccountEnter = () => {
    if (accountTimerRef.current) clearTimeout(accountTimerRef.current);
    setAccountOpen(true);
  };
  const handleAccountLeave = () => {
    accountTimerRef.current = setTimeout(() => setAccountOpen(false), 150);
  };

  const renderServiceIcon = (service: typeof ALL_SERVICES[0], index: number) => {
    const cls = "flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary/60 transition-colors no-underline group";
    const inner = (
      <>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}>
          <service.icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight w-12 truncate">
          {t(service.label)}
        </span>
      </>
    );
    return EXTERNAL_PATHS.has(service.path) ? (
      <a key={index} href={service.path} className={cls} onClick={() => setAllMenuOpen(false)}>{inner}</a>
    ) : (
      <Link key={index} to={service.path} className={cls} onClick={() => setAllMenuOpen(false)}>{inner}</Link>
    );
  };

  const renderQuickLink = (link: typeof QUICK_LINKS[0], index: number) => {
    const label = isBn ? link.labelBn : t(link.label);
    const cls = "px-3 py-1 text-sm font-medium text-white/90 hover:text-white hover:bg-white/15 rounded transition-colors whitespace-nowrap";
    return link.external ? (
      <a key={index} href={link.path} className={cls}>{label}</a>
    ) : (
      <Link key={index} to={link.path} className={cls}>{label}</Link>
    );
  };

  const deliveryAreaObj = DELIVERY_AREAS.find(a => a.value === deliveryArea) || DELIVERY_AREAS[0];

  const filteredServices = ALL_SERVICES.filter(s => {
    const matchCat = menuCat === "all" || s.category === menuCat;
    if (!matchCat) return false;
    const q = menuSearch.trim().toLowerCase();
    if (!q) return true;
    return s.labelBn.includes(q) || s.labelEn.toLowerCase().includes(q);
  });

  const DeliveryDropdown = () => (
    <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden min-w-[192px]">
      <div className="px-3 py-2.5 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-800">
          {isBn ? "ডেলিভারি এলাকা" : "Delivery Area"}
        </p>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {DELIVERY_AREAS.map(a => (
          <button
            key={a.value}
            onClick={() => {
              setDeliveryArea(a.value);
              try { localStorage.setItem("sholok_delivery_area", a.value); } catch {}
              setDeliveryOpen(false);
            }}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 flex items-center gap-2 ${deliveryArea === a.value ? "font-bold text-[#5D0096] bg-purple-50/50" : "text-gray-700"}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${deliveryArea === a.value ? "bg-[#5D0096]" : "bg-transparent"}`} />
            {isBn ? a.bn : a.en}
          </button>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => setDeliveryOpen(false)}
          className="w-full py-1.5 rounded text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: NAV_PURPLE }}
        >
          {isBn ? "সম্পন্ন" : "Done"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          ROW 1 — Dark brand bar
      ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: HEADER_BRAND }}
      >
        {/* ── MOBILE top bar (< sm) ── */}
        <div className="sm:hidden flex items-center px-3 py-2 gap-2">
          {/* Hamburger */}
          <button
            onClick={() => setAllMenuOpen(v => !v)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Logo */}
          <Link to="/home" className="flex-shrink-0 select-none group">
            <span
              className="font-logo text-lg font-black tracking-tight leading-none px-2.5 py-1 rounded-md group-hover:opacity-90 transition-all"
              style={{ backgroundColor: LOGO_BG, color: LOGO_COLOR }}
            >
              SHOLOK
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sign In / Profile */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white leading-tight">
                {isBn ? "প্রোফাইল" : "Profile"}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors"
            >
              <User className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white leading-tight">
                {isBn ? "সাইন ইন ›" : "Sign in ›"}
              </span>
            </Link>
          )}

          {/* Bell */}
          <button className="p-1.5 relative hover:bg-white/10 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#D31710]">
                {unreadCount}
              </Badge>
            )}
          </button>
        </div>

        {/* ── MOBILE search row (< sm) ── */}
        <div className="sm:hidden px-3 pb-2">
          <SearchBar amazon />
        </div>

        {/* ── DESKTOP bar (sm+) ── */}
        <div className="hidden sm:flex w-full max-w-screen-xl mx-auto px-4 py-2 items-center gap-3">

          {/* Logo */}
          <Link to="/home" className="flex-shrink-0 select-none group mr-1">
            <span
              className="font-logo text-xl font-black tracking-tight leading-none px-3 py-1 rounded-md group-hover:opacity-90 transition-all"
              style={{ backgroundColor: LOGO_BG, color: LOGO_COLOR }}
            >
              SHOLOK
            </span>
          </Link>

          {/* Search bar */}
          <div className="flex-1 min-w-0">
            <SearchBar amazon />
          </div>

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight select-none"
            >
              <span className="text-[10px] text-white/50">{isBn ? "ভাষা" : "Language"}</span>
              <span className="text-xs font-bold text-white flex items-center gap-0.5">
                {isBn ? "বাংলা" : "English"}
                <ChevronDown className="w-3 h-3 text-white/60" />
              </span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden min-w-[100px]">
                <button
                  onClick={() => { setLanguage("BN"); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 ${language === "BN" ? "font-bold text-[#5D0096]" : "text-gray-700"}`}
                >বাংলা</button>
                <button
                  onClick={() => { setLanguage("EN"); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-purple-50 ${language === "EN" ? "font-bold text-[#5D0096]" : "text-gray-700"}`}
                >English</button>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <div className="flex items-center">
            <div className="h-6 w-px bg-white/20 mx-0.5" />
            <div className="[&>button]:text-white [&>button]:hover:bg-white/10">
              <ThemeToggle />
            </div>
            <div className="h-6 w-px bg-white/20 mx-0.5" />
          </div>

          {/* Bell */}
          <button className="p-1.5 relative hover:bg-white/10 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#D31710]">
                {unreadCount}
              </Badge>
            )}
          </button>

          {/* Account hover dropdown */}
          <div
            className="relative"
            onMouseEnter={handleAccountEnter}
            onMouseLeave={handleAccountLeave}
          >
              {/* Trigger */}
              <div className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight cursor-pointer select-none">
                <span className="text-[10px] text-white/50">{isBn ? "হ্যালো," : "Hello,"}</span>
                <span className="text-xs font-bold text-white flex items-center gap-0.5">
                  {isAuthenticated ? (isBn ? "প্রোফাইল" : "Profile") : (isBn ? "সাইন ইন" : "Sign In")}
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </span>
              </div>

              {/* Dropdown panel */}
              {accountOpen && (
                <div
                  className="absolute right-0 top-full bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-72"
                  style={{ marginTop: "2px" }}
                  onMouseEnter={handleAccountEnter}
                  onMouseLeave={handleAccountLeave}
                >
                  <div className="p-4">
                    {!isAuthenticated ? (
                      <>
                        <Link
                          to="/login"
                          className="block w-full py-2 text-center text-sm font-semibold rounded mb-2 text-gray-900"
                          style={{ backgroundColor: "#f0c14b", border: "1px solid #a88734" }}
                          onClick={() => setAccountOpen(false)}
                        >
                          {isBn ? "সাইন ইন" : "Sign in"}
                        </Link>
                        <p className="text-center text-xs text-gray-600 mb-3">
                          {isBn ? "নতুন গ্রাহক?" : "New customer?"}{" "}
                          <Link to="/register" className="font-medium hover:underline" style={{ color: NAV_PURPLE }} onClick={() => setAccountOpen(false)}>
                            {isBn ? "এখানে শুরু করুন" : "Start here."}
                          </Link>
                        </p>
                      </>
                    ) : (
                      <Link
                        to="/profile"
                        className="block w-full py-2 text-center text-sm font-semibold rounded mb-3 text-white"
                        style={{ backgroundColor: NAV_PURPLE }}
                        onClick={() => setAccountOpen(false)}
                      >
                        {isBn ? "আমার প্রোফাইল" : "My Profile"}
                      </Link>
                    )}

                    <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {/* Column 1 */}
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">
                          {isBn ? "আপনার তালিকা" : "Your Lists"}
                        </p>
                        <div className="space-y-1.5">
                          <Link to="/wishlist" className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "তালিকা তৈরি করুন" : "Create a List"}
                          </Link>
                          <Link to="/wishlist" className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "তালিকা খুঁজুন" : "Find a List or Registry"}
                          </Link>
                        </div>
                      </div>
                      {/* Column 2 */}
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-2">
                          {isBn ? "আপনার অ্যাকাউন্ট" : "Your Account"}
                        </p>
                        <div className="space-y-1.5">
                          <Link to={isAuthenticated ? "/profile" : "/login"} className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "অ্যাকাউন্ট" : "Account"}
                          </Link>
                          <a href="https://shopping.sholok.com/orders" className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "অর্ডার" : "Orders"}
                          </a>
                          <Link to="/home" className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "সুপারিশ" : "Recommendations"}
                          </Link>
                          <a href="https://shopping.sholok.com" className="block text-xs text-gray-700 hover:text-[#5D0096] hover:underline" onClick={() => setAccountOpen(false)}>
                            {isBn ? "শপিং কার্ট" : "Shopping Cart"}
                          </a>
                          {isAuthenticated && (
                            <button
                              onClick={() => { dispatch(logout()); setAccountOpen(false); }}
                              className="block w-full text-left text-xs text-red-600 hover:underline font-medium mt-1"
                            >
                              {isBn ? "সাইন আউট" : "Sign Out"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        {/* ══════════════════════════════════════════
            ROW 2 — Purple navigation bar
        ══════════════════════════════════════════ */}
        <div
          className="w-full"
          style={{ backgroundColor: NAV_PURPLE }}
        >
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 flex items-center gap-0 overflow-x-auto scrollbar-none h-9">
            {/* ☰ All button */}
            <button
              onClick={() => setAllMenuOpen(v => !v)}
              className="hidden sm:flex items-center gap-1.5 px-3 h-full font-semibold text-sm text-white hover:bg-white/15 transition-colors flex-shrink-0 border-r border-white/20 mr-1"
            >
              <Menu className="w-4 h-4" />
              <span>{isBn ? "সব" : "All"}</span>
            </button>

            {/* Quick links */}
            {QUICK_LINKS.map((link, i) => renderQuickLink(link, i))}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          All-services MEGA MENU panel
      ══════════════════════════════════════════ */}
      {allMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
            style={{ top: "89px" }}
            onClick={() => setAllMenuOpen(false)}
          />

          {/* Mega menu panel */}
          <div
            className="fixed left-0 z-50 bg-card shadow-2xl flex flex-col"
            style={{
              top: "89px",
              width: "min(700px, 96vw)",
              maxHeight: "calc(100vh - 100px)",
              borderRight: "1px solid hsl(var(--border))",
              borderBottom: "1px solid hsl(var(--border))",
            }}
          >
            {/* Panel header — title + search + close */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-bold whitespace-nowrap" style={{ color: NAV_PURPLE }}>
                  {isBn ? "সব সার্ভিস" : "All Services"}
                </span>
                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={e => setMenuSearch(e.target.value)}
                    placeholder={isBn ? "সার্ভিস খুঁজুন..." : "Search services..."}
                    className="text-xs border border-border rounded-lg pl-7 py-1.5 bg-background text-foreground w-44 focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/60"
                    style={{ paddingRight: menuSearch ? "1.5rem" : "0.75rem" }}
                  />
                  {menuSearch && (
                    <button
                      onClick={() => setMenuSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setAllMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Category filter chips */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border overflow-x-auto scrollbar-none flex-shrink-0">
              {MEGA_MENU_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setMenuCat(cat.key)}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors flex-shrink-0"
                  style={
                    menuCat === cat.key
                      ? { backgroundColor: NAV_PURPLE, color: "#fff" }
                      : {}
                  }
                  onMouseEnter={e => {
                    if (menuCat !== cat.key)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "hsl(var(--secondary))";
                  }}
                  onMouseLeave={e => {
                    if (menuCat !== cat.key)
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                  }}
                >
                  {isBn ? cat.labelBn : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Service cards grid */}
            <div className="overflow-y-auto flex-1 p-4">
              {filteredServices.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  {isBn ? "কোনো সার্ভিস পাওয়া যায়নি" : "No services found"}
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
                  {filteredServices.map((svc, i) => {
                    const cardContent = (
                      <div className="relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-secondary/60 dark:hover:bg-secondary/40 transition-colors text-center group cursor-pointer h-full">
                        {/* Status badge */}
                        {svc.status !== "live" && (
                          <span
                            className={`absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-tight ${
                              svc.status === "beta"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                : "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
                            }`}
                          >
                            {svc.status === "beta" ? "Beta" : isBn ? "শীঘ্রই" : "Soon"}
                          </span>
                        )}
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${svc.color} group-hover:scale-105 transition-transform flex-shrink-0`}
                        >
                          <svc.icon style={{ width: 18, height: 18 }} />
                        </div>
                        {/* Labels */}
                        <div className="flex flex-col items-center gap-0">
                          <span className="text-[11px] font-bold text-foreground leading-tight text-center">
                            {svc.labelBn}
                          </span>
                          <span className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                            {svc.labelEn}
                          </span>
                        </div>
                      </div>
                    );

                    return EXTERNAL_PATHS.has(svc.path) ? (
                      <a
                        key={i}
                        href={svc.path}
                        className="block no-underline"
                        onClick={() => setAllMenuOpen(false)}
                      >
                        {cardContent}
                      </a>
                    ) : (
                      <Link
                        key={i}
                        to={svc.path}
                        className="block no-underline"
                        onClick={() => setAllMenuOpen(false)}
                      >
                        {cardContent}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
