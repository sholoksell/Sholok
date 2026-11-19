import { useState, useEffect, useRef } from "react";
import {
  Bell, ShoppingCart, User, Menu, X,
  Mail, Coffee, ShoppingCart as CartIcon, Newspaper, LineChart, MapPin,
  BookOpen, Music, FileText, Languages, Wallet, Store,
  TrendingUp, Cloud, Trophy, Tv, BookMarked, Building2,
  Briefcase, ShieldCheck, ChevronDown, Home, Briefcase as BriefcaseIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";

const EXTERNAL_PATHS = new Set([
  "/shopping/", "/job-portal/", "/home/admin/", "/webtoon/",
  "/mail/", "/series/", "/sports/", "/music/",
  "https://shopping.sholok.com",
]);

const ALL_SERVICES = [
  { icon: Mail,        label: "mail",        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",             path: "/mail/" },
  { icon: Coffee,      label: "cafe",         color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",         path: "/cafe" },
  { icon: FileText,    label: "blog",         color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",  path: "/blog" },
  { icon: CartIcon,    label: "shopping",     color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",             path: "https://shopping.sholok.com" },
  { icon: Newspaper,   label: "news",         color: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",         path: "/news" },
  { icon: MapPin,      label: "maps",         color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",             path: "/maps" },
  { icon: BookOpen,    label: "webtoon",      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",     path: "/webtoon/" },
  { icon: Store,       label: "smartStore",   color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",             path: "/smartstore" },
  { icon: Wallet,      label: "pay",          color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",         path: "/pay" },
  { icon: Music,       label: "music",        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",     path: "/music/" },
  { icon: Tv,          label: "tv",           color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",     path: "/tv" },
  { icon: BookMarked,  label: "series",       color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",             path: "/series/" },
  { icon: Languages,   label: "translate",    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",     path: "/translate" },
  { icon: BookOpen,    label: "dictionary",   color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400", path: "/dictionary" },
  { icon: TrendingUp,  label: "finance",      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",     path: "/finance" },
  { icon: Trophy,      label: "sports",       color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",                 path: "/sports/" },
  { icon: Cloud,       label: "weather",      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",                 path: "/weather" },
  { icon: Building2,   label: "realEstate",   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", path: "/realestate" },
  { icon: LineChart,   label: "knowledgeIn",  color: "bg-lime-100 text-lime-600 dark:bg-lime-900/40 dark:text-lime-400",             path: "/qna" },
  { icon: Briefcase,   label: "jobPortal",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",             path: "/job-portal/" },
  { icon: ShieldCheck, label: "adminPanel",   color: "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",             path: "/home/admin/" },
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

const HEADER_BRAND = "#1a0028";
const NAV_PURPLE   = "#5D0096";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount }   = useAppSelector((state) => state.notification);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated }  = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [allMenuOpen, setAllMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const isBn = language === "BN";
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!allMenuOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setAllMenuOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [allMenuOpen]);

  useEffect(() => { setAllMenuOpen(false); }, [location.pathname]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

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

  return (
    <>
      {/* ══════════════════════════════════════════
          ROW 1 — Dark brand bar
      ══════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-50 shadow-lg"
        style={{ backgroundColor: HEADER_BRAND }}
      >
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">

          {/* Logo */}
          <Link to="/home" className="flex-shrink-0 select-none group">
            <span className="font-logo text-xl sm:text-2xl font-black text-white tracking-tight leading-none group-hover:text-yellow-300 transition-colors">
              SHOLOK
            </span>
            <span className="hidden lg:block text-[10px] text-white/50 tracking-widest font-normal -mt-0.5">
              {isBn ? "পোর্টাল" : "PORTAL"}
            </span>
          </Link>

          {/* Search bar — central, flex-1 */}
          <div className="flex-1 min-w-0">
            <SearchBar hero />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

            {/* Language selector */}
            <div ref={langRef} className="relative hidden sm:block">
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
            <div className="hidden sm:flex items-center">
              <div className="h-6 w-px bg-white/20 mx-0.5" />
              <div className="[&>button]:text-white [&>button]:hover:bg-white/10">
                <ThemeToggle />
              </div>
              <div className="h-6 w-px bg-white/20 mx-0.5" />
            </div>

            {/* Notifications bell */}
            <button className="p-1.5 relative hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#D31710]">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Account */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight"
              >
                <span className="text-[10px] text-white/50">{isBn ? "আমার" : "My"}</span>
                <span className="text-xs font-bold text-white">{isBn ? "প্রোফাইল" : "Profile"}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex flex-col items-start px-2 py-1 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors leading-tight"
              >
                <span className="text-[10px] text-white/50">{isBn ? "হ্যালো," : "Hello,"}</span>
                <span className="text-xs font-bold text-white">{isBn ? "সাইন ইন" : "Sign In"}</span>
              </Link>
            )}

            {/* Cart → Shopping */}
            <a
              href="https://shopping.sholok.com"
              className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/10 border border-transparent hover:border-white/20 transition-colors"
              aria-label="Shopping Cart"
            >
              <span className="relative">
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartItems.length > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-[#D31710]">
                    {cartItems.length}
                  </Badge>
                )}
              </span>
              <span className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-white/50">{isBn ? "শপিং" : "Shopping"}</span>
                <span className="text-xs font-bold text-yellow-300">{isBn ? "কার্ট" : "Cart"}</span>
              </span>
            </a>
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
              className="flex items-center gap-1.5 px-3 h-full font-semibold text-sm text-white hover:bg-white/15 transition-colors flex-shrink-0 border-r border-white/20 mr-1"
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
          All-services slide-in panel
      ══════════════════════════════════════════ */}
      {allMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
            style={{ top: "89px" }}
            onClick={() => setAllMenuOpen(false)}
          />
          <div
            className="fixed left-0 z-50 bg-card border-r border-b border-border shadow-2xl overflow-y-auto"
            style={{ top: "89px", maxHeight: "calc(100vh - 89px)", width: "min(20rem, 92vw)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-border">
              <span className="text-sm font-bold" style={{ color: NAV_PURPLE }}>
                {isBn ? "সব সার্ভিস" : "All Services"}
              </span>
              <button
                onClick={() => setAllMenuOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Sub-websites section */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isBn ? "শলোক প্ল্যাটফর্ম" : "Sholok Platforms"}
              </p>
              <div className="space-y-0.5">
                {[
                  { label: isBn ? "মেইন হোম"      : "Main Home",   path: "/home",                       external: false },
                  { label: isBn ? "শপিং"            : "Shopping",    path: "https://shopping.sholok.com", external: true  },
                  { label: isBn ? "নিউজ"            : "News",        path: "/news",                       external: false },
                  { label: isBn ? "ব্লগ"            : "Blog",        path: "/blog",                       external: false },
                  { label: isBn ? "জব পোর্টাল"     : "Job Portal",  path: "/job-portal/",                external: false },
                  { label: isBn ? "স্মার্ট স্টোর"  : "Smart Store", path: "/smartstore",                 external: false },
                ].map((item, i) => {
                  const cls = "flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:bg-secondary/60 hover:text-foreground transition-colors";
                  return item.external ? (
                    <a key={i} href={item.path} className={cls} onClick={() => setAllMenuOpen(false)}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: NAV_PURPLE }} />
                      {item.label}
                    </a>
                  ) : (
                    <Link key={i} to={item.path} className={cls} onClick={() => setAllMenuOpen(false)}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: NAV_PURPLE }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* All services grid */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isBn ? "সব সার্ভিস" : "All Services"}
              </p>
              <div className="grid grid-cols-4 gap-0.5">
                {ALL_SERVICES.map((s, i) => renderServiceIcon(s, i))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
