import {
  Mail,
  Coffee,
  ShoppingCart,
  Newspaper,
  LineChart,
  MapPin,
  BookOpen,
  Clapperboard,
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
import { useLanguage } from "@/contexts/LanguageContext";

// Services that open as external sub-apps (full page navigation)
const EXTERNAL_PATHS = new Set(["/shopping/", "/job-portal/", "/home/admin/", "/webtoon/", "/mail/"]);

const ServiceGrid = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Mail, label: "mail", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", path: "/mail/" },
    { icon: Coffee, label: "cafe", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400", path: "/cafe" },
    { icon: FileText, label: "blog", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", path: "/blog" },
    { icon: ShoppingCart, label: "shopping", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400", path: "/shopping/" },
    { icon: Newspaper, label: "news", color: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400", path: "/news" },
    { icon: MapPin, label: "maps", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400", path: "/maps" },
    { icon: BookOpen, label: "webtoon", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", path: "/webtoon/" },
    { icon: Store, label: "smartStore", color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", path: "/smartstore" },
    { icon: Wallet, label: "pay", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", path: "/pay" },
    { icon: Music, label: "music", color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400", path: "/music" },
    { icon: Tv, label: "tv", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", path: "/tv" },
    { icon: BookMarked, label: "series", color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", path: "/series" },
    { icon: Languages, label: "translate", color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400", path: "/translate" },
    { icon: BookOpen, label: "dictionary", color: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400", path: "/dictionary" },
    { icon: TrendingUp, label: "finance", color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", path: "/finance" },
    { icon: Trophy, label: "sports", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", path: "/sports" },
    { icon: Cloud, label: "weather", color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400", path: "/weather" },
    { icon: Building2, label: "realEstate", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", path: "/realestate" },
    { icon: LineChart, label: "knowledgeIn", color: "bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400", path: "/qna" },
    { icon: Briefcase, label: "jobPortal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", path: "/job-portal/" },
    { icon: ShieldCheck, label: "adminPanel", color: "bg-gray-200 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300", path: "/home/admin/" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
        {services.map((service, index) =>
          EXTERNAL_PATHS.has(service.path) ? (
            // External sub-app: full page navigation
            <a
              key={index}
              href={service.path}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <service.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center line-clamp-2">
                {t(service.label)}
              </span>
            </a>
          ) : (
            <Link
              key={index}
              to={service.path}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${service.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <service.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center line-clamp-2">
                {t(service.label)}
              </span>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default ServiceGrid;
