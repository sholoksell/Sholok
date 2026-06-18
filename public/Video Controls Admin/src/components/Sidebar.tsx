import { Home, Flame, Clapperboard, Music2, Gamepad2, Film, Tv, Radio, History, ListVideo, ThumbsUp, User, Upload, Code, Leaf } from "lucide-react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const mainItems = [
  { icon: Home, labelKey: "home", to: "/" },
  { icon: Clapperboard, labelKey: "shorts", to: "/shorts" },
  { icon: Flame, labelKey: "trending", to: "/trending" },
  { icon: Radio, labelKey: "live", to: "/live" },
];

const libraryItems = [
  { icon: History, labelKey: "history", to: "/history" },
  { icon: ListVideo, labelKey: "playlists", to: "/playlists" },
  { icon: ThumbsUp, labelKey: "liked", to: "/liked" },
  { icon: Upload, labelKey: "upload", to: "/upload" },
];

const exploreItems = [
  { icon: Music2, labelKey: "music", label: "Music" },
  { icon: Gamepad2, labelKey: "gaming", label: "Gaming" },
  { icon: Film, labelKey: "movies", label: "Movies" },
  { icon: Tv, labelKey: "k_drama", label: "K-Drama" },
  { icon: Code, labelKey: "software_related", label: "Software Related" },
  { icon: Leaf, labelKey: "natural_related", label: "Natural Related" },
];

export const Sidebar = () => {
  const { channel } = useAuth();
  const { t } = useLanguage();
  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 bg-sidebar border-r border-sidebar-border overflow-y-auto flex-col gap-1 p-3 z-30">
      <Section>
        {mainItems.map((it) => <Item key={it.labelKey} icon={it.icon} label={t(it.labelKey)} to={it.to} />)}
      </Section>
      <Divider />
      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("you")}</p>
      <Section>
        {libraryItems.map((it) => <Item key={it.labelKey} icon={it.icon} label={t(it.labelKey)} to={it.to} />)}
        <Item icon={User} label={t("your_channel")} to={channel ? `/channel/${channel._id}` : "/channel"} />
      </Section>
      <Divider />
      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("explore")}</p>
      <Section>
        {exploreItems.map((it) => <ExploreItem key={it.labelKey} icon={it.icon} label={it.label} translatedLabel={t(it.labelKey)} />)}
      </Section>
    </aside>
  );
};

const Section = ({ children }: { children: React.ReactNode }) => <nav className="flex flex-col gap-0.5">{children}</nav>;
const Divider = () => <div className="my-2 h-px bg-sidebar-border" />;

const Item = ({ icon: Icon, label, to }: { icon: any; label: string; to: string }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth",
        isActive ? "bg-sidebar-accent text-sidebar-primary shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent"
      )
    }
  >
    <Icon className="w-5 h-5 shrink-0" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const StaticItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <button className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-smooth">
    <Icon className="w-5 h-5 shrink-0" />
    <span className="truncate">{label}</span>
  </button>
);

const ExploreItem = ({ icon: Icon, label, translatedLabel }: { icon: any; label: string; translatedLabel: string }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get("category");
  const isActive = currentCategory === label;

  return (
    <button
      onClick={() => navigate(`/?category=${encodeURIComponent(label)}`)}
      className={cn(
        "flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth text-left w-full",
        isActive ? "bg-sidebar-accent text-sidebar-primary shadow-glow" : "text-sidebar-foreground hover:bg-sidebar-accent"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="truncate">{translatedLabel}</span>
    </button>
  );
};
