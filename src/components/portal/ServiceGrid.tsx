import { useState, useEffect } from "react";
import {
  Mail, Coffee, ShoppingCart, Newspaper, LineChart, MapPin,
  BookOpen, Music, FileText, Languages, Wallet, Store,
  TrendingUp, Cloud, Trophy, Tv, BookMarked, Building2,
  Briefcase, ShieldCheck, MoreHorizontal, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const EXTERNAL_PATHS = new Set([
  "https://shopping.sholok.com", "/job-portal/", "/home/admin/", "/webtoon/",
  "/mail/", "/series/", "/sports/", "/music/", "/VideoPlatform/",
]);

// First 8 are shown as shortcuts; the rest live only in the "আরও" panel
const PRIMARY_COUNT = 8;

const ServiceGrid = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const services = [
    // ── Primary 8 (visible shortcuts) ──
    { icon: ShoppingCart, label: "shopping",     color: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",             path: "https://shopping.sholok.com" },
    { icon: Newspaper,    label: "news",         color: "bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400",         path: "/news" },
    { icon: MapPin,       label: "maps",         color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400",             path: "/maps" },
    { icon: Store,        label: "smartStore",   color: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",             path: "/smartstore" },
    { icon: Briefcase,    label: "jobPortal",    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",             path: "/job-portal/" },
    { icon: Languages,    label: "translate",    color: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",     path: "/translate" },
    { icon: Tv,           label: "tv",           color: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400",     path: "/VideoPlatform/" },
    { icon: Building2,    label: "realEstate",   color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", path: "/realestate" },
    // ── Inside "আরও" only ──
    { icon: Mail,         label: "mail",        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",             path: "/mail/" },
    { icon: Coffee,       label: "cafe",         color: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400",         path: "/cafe" },
    { icon: FileText,     label: "blog",         color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",  path: "/blog" },
    { icon: BookOpen,     label: "webtoon",      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400",     path: "/webtoon/" },
    { icon: Wallet,       label: "pay",          color: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400",         path: "/pay" },
    { icon: Music,        label: "music",        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400",     path: "/music/" },
    { icon: BookMarked,   label: "series",       color: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400",             path: "/series/" },
    { icon: BookOpen,     label: "dictionary",   color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/40 dark:text-fuchsia-400", path: "/dictionary" },
    { icon: TrendingUp,   label: "finance",      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400",     path: "/finance" },
    { icon: Trophy,       label: "sports",       color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",                 path: "/sports/" },
    { icon: Cloud,        label: "weather",      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400",                 path: "/weather" },
    { icon: LineChart,    label: "knowledgeIn",  color: "bg-lime-100 text-lime-600 dark:bg-lime-900/40 dark:text-lime-400",             path: "/qna" },
    { icon: ShieldCheck,  label: "adminPanel",   color: "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",             path: "/home/admin/" },
  ];

  const primary = services.slice(0, PRIMARY_COUNT);

  const renderIcon = (service: typeof services[0], index: number) => {
    const cls = "flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl hover:bg-secondary/60 flex-shrink-0 group transition-colors no-underline";
    const inner = (
      <>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform`}>
          <service.icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight w-12 truncate">
          {t(service.label)}
        </span>
      </>
    );
    return EXTERNAL_PATHS.has(service.path) ? (
      <a key={index} href={service.path} className={cls}>{inner}</a>
    ) : (
      <Link key={index} to={service.path} className={cls} onClick={() => setOpen(false)}>{inner}</Link>
    );
  };

  return (
    <div className="w-full border-b border-border/50 pb-1 relative">
      {/* ── Service shortcuts row: icons + More at end, all centered ── */}
      <div
        className="flex items-center justify-start sm:justify-center overflow-x-auto py-1 scrollbar-hide"
        style={{ msOverflowStyle: "none" }}
      >
        {primary.map((s, i) => renderIcon(s, i))}

        {/* More — last item, styled as a service icon */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl hover:bg-secondary/60 flex-shrink-0 group transition-colors"
          aria-label="সব সার্ভিস"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary dark:bg-secondary/60 group-hover:scale-110 transition-transform">
            {open
              ? <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              : <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
            }
          </div>
          <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight w-12">
            {open ? "বন্ধ" : "আরও"}
          </span>
        </button>
      </div>

      {/* ── All services panel ── */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl shadow-2xl mt-1 p-4 w-[92vw] max-w-[44rem] max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">সব সার্ভিস</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}
            >
              {services.map((s, i) => renderIcon(s, i))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceGrid;
