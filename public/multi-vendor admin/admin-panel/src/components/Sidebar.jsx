import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, Package, ShoppingCart,
  Tag, BarChart3, Settings, ChevronLeft, ShoppingBag,
} from "lucide-react";

const links = [
  { to: "/",           icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users",      icon: Users,           label: "Users" },
  { to: "/stores",     icon: Store,           label: "Smart Stores" },
  { to: "/products",   icon: Package,         label: "Products" },
  { to: "/orders",     icon: ShoppingCart,    label: "Orders" },
  { to: "/categories", icon: Tag,             label: "Categories" },
  { to: "/analytics",  icon: BarChart3,       label: "Analytics" },
  { to: "/settings",   icon: Settings,        label: "Settings" },
];

export default function Sidebar({ open, setOpen }) {
  return (
    <aside className={`fixed top-0 left-0 h-screen bg-[#16162a] border-r border-[#2a2a4a] flex flex-col transition-all duration-300 z-40 ${open ? "w-64" : "w-16"}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#2a2a4a]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">Sholok Admin</p>
            <p className="text-xs text-slate-500">Smart Store</p>
          </div>
        )}
        <button onClick={() => setOpen(!open)} className={`ml-auto text-slate-500 hover:text-slate-300 transition-transform ${open ? "" : "rotate-180"}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group ${
                isActive
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                  : "text-slate-400 hover:bg-[#2a2a4a] hover:text-slate-200"
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {open && (
        <div className="px-4 py-3 border-t border-[#2a2a4a]">
          <p className="text-xs text-slate-600">Smart_Store_New DB</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-emerald-400">Connected</p>
          </div>
        </div>
      )}
    </aside>
  );
}
