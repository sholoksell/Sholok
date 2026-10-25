import { useState, useEffect } from "react";
import {
  Bell, ShoppingCart, User, Menu, X,
  Mail, Coffee, ShoppingCart as CartIcon, Newspaper, LineChart, MapPin,
  BookOpen, Music, FileText, Languages, Wallet, Store,
  TrendingUp, Cloud, Trophy, Tv, BookMarked, Building2,
  Briefcase, ShieldCheck,
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
]);

const ALL_SERVICES = [
  { icon: Mail,        label: "mail",        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",             path: "/mail/" },
  { icon: Coffee,      label: "cafe",         color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",         path: "/cafe" },
  { icon: FileText,    label: "blog",         color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",  path: "/blog" },
  { icon: CartIcon,    label: "shopping",     color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",             path: "/shopping/" },
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

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount }   = useAppSelector((state) => state.notification);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated }  = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    if (!servicesOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setServicesOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [servicesOpen]);

  useEffect(() => { setServicesOpen(false); }, [location.pathname]);

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
      <a key={index} href={service.path} className={cls} onClick={() => setServicesOpen(false)}>{inner}</a>
    ) : (
      <Link key={index} to={service.path} className={cls} onClick={() => setServicesOpen(false)}>{inner}</Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2">

          {/* ── All-services hamburger — far left ── */}
          <button
            onClick={() => setServicesOpen((v) => !v)}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors flex-shrink-0"
            aria-label="সব সার্ভিস"
          >
            {servicesOpen
              ? <X    className="w-5 h-5 text-muted-foreground" />
              : <Menu className="w-5 h-5 text-muted-foreground" />
            }
          </button>

          {/* ── Logo (home) | SearchBar (other pages) ── */}
          {isHome ? (
            <>
              <Link to="/home" className="flex items-center gap-1.5 flex-shrink-0 select-none">
                <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl leading-none">
                  S
                </span>
                <span className="font-black text-lg text-primary tracking-tight hidden sm:block">Sholok</span>
              </Link>
              {/* flex-1 spacer — pushes right-side actions to the edge */}
              <div className="flex-1" />
            </>
          ) : (
            <div className="flex-1 min-w-0">
              <SearchBar />
            </div>
          )}

          {/* ── Right-side actions ── */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

            {/* Bell */}
            <button className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Cart */}
            <a href="/shopping/" className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {cartItems.length}
                </Badge>
              )}
            </a>

            {/* Login / Profile */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("profile")}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Link>
            )}

            {/* Theme toggle — hidden on xs, visible sm+ */}
            <div className="hidden sm:flex items-center gap-1">
              <div className="h-5 w-px bg-border" />
              <ThemeToggle />
            </div>

            {/* Language selector — hidden on mobile (SearchBar has its own mode toggle) */}
            <select
              className="hidden sm:block bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground outline-none cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "EN" | "BN")}
            >
              <option value="EN">EN</option>
              <option value="BN">বাং</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── All-services slide-in panel ── */}
      {servicesOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
            style={{ top: "49px" }}
            onClick={() => setServicesOpen(false)}
          />
          <div
            className="fixed left-0 z-50 bg-card border-r border-b border-border shadow-2xl overflow-y-auto"
            style={{ top: "49px", maxHeight: "calc(100vh - 49px)", width: "min(17rem, 90vw)" }}
          >
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <span className="text-sm font-semibold text-foreground">সব সার্ভিস</span>
              <button
                onClick={() => setServicesOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-0.5 px-2 pb-4">
              {ALL_SERVICES.map((s, i) => renderServiceIcon(s, i))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
