import { NavLink } from "react-router-dom";
import { LayoutDashboard, Inbox, Search, Users, Settings } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/search", label: "Search", icon: Search },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  return (
    <nav className="glass-strong fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/30 dark:border-white/5 py-2 md:hidden">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
              isActive ? "text-violet-600 dark:text-violet-300" : "text-slate-400"
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
