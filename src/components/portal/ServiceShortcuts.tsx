import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  MoreHorizontal, X,
  Mail, Coffee, ShoppingCart, Newspaper, LineChart, MapPin, BookOpen,
  Music, FileText, Languages, Wallet, Store, TrendingUp, Cloud,
  Trophy, Tv, BookMarked, Building2, Briefcase, ShieldCheck,
} from "lucide-react";

const EXTERNAL_PATHS = new Set([
  "https://shopping.sholok.com", "https://blog.sholok.com",
  "/shopping/", "/job-portal/", "/home/admin/",
  "/webtoon/", "/mail/", "/series/", "/sports/", "/music/",
]);

const SHORTCUTS = [
  { icon: ShoppingCart, label: "shopping",  color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",         path: "/shopping/" },
  { icon: Newspaper,    label: "news",      color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",     path: "/news" },
  { icon: Tv,           label: "tv",        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", path: "/tv" },
  { icon: FileText,     label: "blog",      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", path: "https://blog.sholok.com" },
  { icon: Mail,         label: "mail",      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",         path: "/mail/" },
  { icon: Music,        label: "music",     color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", path: "/music/" },
  { icon: Briefcase,    label: "jobPortal", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",     path: "/job-portal/" },
  { icon: MapPin,       label: "maps",      color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",         path: "/maps" },
] as const;

const ALL_SERVICES = [
  { icon: Mail,       label: "mail",        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",         path: "/mail/" },
  { icon: Coffee,     label: "cafe",        color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",     path: "/cafe" },
  { icon: FileText,   label: "blog",        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", path: "https://blog.sholok.com" },
  { icon: ShoppingCart, label: "shopping",  color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",         path: "/shopping/" },
  { icon: Newspaper,  label: "news",        color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",     path: "/news" },
  { icon: MapPin,     label: "maps",        color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",         path: "/maps" },
  { icon: BookOpen,   label: "webtoon",     color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", path: "/webtoon/" },
  { icon: Store,      label: "smartStore",  color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",         path: "/smartstore" },
  { icon: Wallet,     label: "pay",         color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",     path: "/pay" },
  { icon: Music,      label: "music",       color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", path: "/music/" },
  { icon: Tv,         label: "tv",          color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", path: "/tv" },
  { icon: BookMarked, label: "series",      color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",         path: "/series/" },
  { icon: Languages,  label: "translate",   color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", path: "/translate" },
  { icon: BookOpen,   label: "dictionary",  color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400", path: "/dictionary" },
  { icon: TrendingUp, label: "finance",     color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", path: "/finance" },
  { icon: Trophy,     label: "sports",      color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",             path: "/sports/" },
  { icon: Cloud,      label: "weather",     color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",             path: "/weather" },
  { icon: Building2,  label: "realEstate",  color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", path: "/realestate" },
  { icon: LineChart,  label: "knowledgeIn", color: "bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400",         path: "/qna" },
  { icon: Briefcase,  label: "jobPortal",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",         path: "/job-portal/" },
  { icon: ShieldCheck,label: "adminPanel",  color: "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",         path: "/home/admin/" },
];

const ServiceLink = ({
  path, children, onClick,
}: { path: string; children: React.ReactNode; onClick?: () => void }) => {
  const isExt = EXTERNAL_PATHS.has(path);
  if (isExt) return <a href={path} onClick={onClick} className="flex flex-col items-center gap-1.5 group flex-shrink-0">{children}</a>;
  return <Link to={path} onClick={onClick} className="flex flex-col items-center gap-1.5 group flex-shrink-0">{children}</Link>;
};

const ServiceShortcuts = () => {
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close More popup on outside click or ESC
  useEffect(() => {
    if (!moreOpen) return;
    const onKey  = (e: KeyboardEvent) => { if (e.key === "Escape") setMoreOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onDown); };
  }, [moreOpen]);

  // Mobile: w-10 h-10 (40px), Desktop: w-11 h-11 (44px)
  const iconStyle = (color: string) =>
    `w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-200 shadow-sm border border-white/60 dark:border-white/10`;

  const labelStyle = "text-[10px] sm:text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight max-w-[56px] sm:max-w-[60px]";

  return (
    <div className="relative mt-4 sm:mt-5">
      {/* ── Scrollable shortcuts row ──────────────────────────────────────── */}
      {/* Negative margin + padding trick ensures items aren't clipped, scroll fades at edge */}
      <div className="flex items-start gap-2.5 sm:gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 justify-start sm:justify-center">
        {SHORTCUTS.map((svc, i) => {
          const Icon = svc.icon;
          return (
            <ServiceLink key={i} path={svc.path}>
              <div className={iconStyle(svc.color)}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={labelStyle}>{t(svc.label as Parameters<typeof t>[0])}</span>
            </ServiceLink>
          );
        })}

        {/* More (•••) button */}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-1.5 group flex-shrink-0"
          aria-label="More services"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center bg-secondary hover:bg-secondary/70 group-hover:scale-110 transition-transform duration-200 shadow-sm border border-border/40">
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          </div>
          <span className={labelStyle}>{t("all" as Parameters<typeof t>[0]) || "더보기"}</span>
        </button>
      </div>

      {/* Right-edge fade gradient — visible on mobile to signal horizontal scroll */}
      <div
        className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden"
        aria-hidden="true"
      />

      {/* ── More popup ────────────────────────────────────────────────────── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />

          {/* Popup */}
          <div
            ref={popupRef}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60]
              w-[min(92vw,560px)] bg-card border border-border rounded-2xl shadow-2xl
              max-h-[80vh] flex flex-col overflow-hidden
              animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Popup header */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</span>
                <span className="font-semibold text-foreground text-sm sm:text-base">
                  {t("all" as Parameters<typeof t>[0]) || "All"} Services
                </span>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popup grid */}
            <div className="overflow-y-auto p-3 sm:p-4 scrollbar-hide">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                {ALL_SERVICES.map((svc, i) => {
                  const Icon = svc.icon;
                  return (
                    <ServiceLink key={i} path={svc.path} onClick={() => setMoreOpen(false)}>
                      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${svc.color} group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors text-center leading-tight max-w-[60px]">
                        {t(svc.label as Parameters<typeof t>[0])}
                      </span>
                    </ServiceLink>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceShortcuts;
