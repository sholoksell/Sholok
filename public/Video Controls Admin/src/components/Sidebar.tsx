import { Home, Flame, Clapperboard, Music2, Gamepad2, Film, Tv, Radio, History, ListVideo, ThumbsUp, User, Upload, Code, Leaf } from "lucide-react";
import { NavLink, useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Clapperboard, label: "Shorts", to: "/shorts" },
  { icon: Flame, label: "Trending", to: "/trending" },
  { icon: Radio, label: "Live", to: "/live" },
];

const libraryItems = [
  { icon: History, label: "History", to: "/history" },
  { icon: ListVideo, label: "Playlists", to: "/playlists" },
  { icon: ThumbsUp, label: "Liked", to: "/liked" },
  { icon: Upload, label: "Upload", to: "/upload" },
];

const exploreItems = [
  { icon: Music2, label: "Music" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Film, label: "Movies" },
  { icon: Tv, label: "K-Drama" },
  { icon: Code, label: "Software Related" },
  { icon: Leaf, label: "Natural Related" },
];

export const Sidebar = () => {
  const { channel } = useAuth();
  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 bg-sidebar border-r border-sidebar-border overflow-y-auto flex-col gap-1 p-3 z-30">
      <Section>
        {mainItems.map((it) => <Item key={it.label} {...it} />)}
      </Section>
      <Divider />
      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">You</p>
      <Section>
        {libraryItems.map((it) => <Item key={it.label} {...it} />)}
        <Item icon={User} label="Your Channel" to={channel ? `/channel/${channel._id}` : "/channel"} />
      </Section>
      <Divider />
      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Explore</p>
      <Section>
        {exploreItems.map((it) => <ExploreItem key={it.label} {...it} />)}
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

const ExploreItem = ({ icon: Icon, label }: { icon: any; label: string }) => {
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
      <span className="truncate">{label}</span>
    </button>
  );
};
