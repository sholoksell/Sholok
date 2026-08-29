import {
  X,
  Mail,
  Coffee,
  ShoppingCart,
  Newspaper,
  LineChart,
  MapPin,
  BookOpen,
  Music,
  FileText,
  Languages,
  Wallet,
  Store,
  TrendingUp,
  Cloud,
  Trophy,
  Tv,
  BookMarked,
  Building2,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXTERNAL_PATHS = new Set([
  "https://shopping.sholok.com", "https://blog.sholok.com",
  "/shopping/",
  "/job-portal/",
  "/home/admin/",
  "/webtoon/",
  "/mail/",
  "/series/",
  "/sports/",
  "/music/",
]);

const services = [
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

const HamburgerMenu = ({ isOpen, onClose }: HamburgerMenuProps) => {
  const { t, language, setLanguage } = useLanguage();

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer — 85vw on mobile (leaves visible page edge), 320px on desktop */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[85vw] sm:w-80 bg-card border-r border-border
          shadow-2xl flex flex-col transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        role="dialog"
        aria-modal="true"
        aria-label={language === "BN" ? "সকল সেবা" : "All Services"}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg select-none">
              S
            </span>
            <span className="font-bold text-lg text-foreground tracking-tight">Sholok</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 sm:px-5 pt-4 pb-1.5 flex-shrink-0">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            {language === "BN" ? "সকল সেবা" : "All Services"}
          </p>
        </div>

        {/* Services list — scrollable */}
        <div className="flex-1 overflow-y-auto px-2 pb-6 scrollbar-hide">
          <div className="space-y-0.5">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              const isExternal = EXTERNAL_PATHS.has(svc.path);

              const itemContent = (
                <div className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-secondary/60
                  transition-colors group w-full text-left cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${svc.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                    {t(svc.label as Parameters<typeof t>[0])}
                  </span>
                </div>
              );

              return isExternal ? (
                <a key={idx} href={svc.path} onClick={onClose} className="block">
                  {itemContent}
                </a>
              ) : (
                <Link key={idx} to={svc.path} onClick={onClose} className="block">
                  {itemContent}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 sm:px-5 py-4 border-t border-border flex-shrink-0 space-y-3"
          style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Language + Theme toggles — only shown here on mobile (available in header on desktop) */}
          <div className="flex items-center justify-between sm:hidden">
            <span className="text-xs font-medium text-muted-foreground">
              {language === "BN" ? "ভাষা ও থিম" : "Language & Theme"}
            </span>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "EN" | "BN")}
                aria-label="Language"
                className="bg-secondary text-xs font-semibold text-foreground outline-none cursor-pointer
                  px-2 py-1 rounded-lg border border-border/40"
              >
                <option value="EN">EN</option>
                <option value="BN">বাং</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © 2025 Sholok — {language === "BN" ? "সকল অধিকার সংরক্ষিত" : "All rights reserved"}
          </p>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
