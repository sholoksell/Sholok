import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Inbox, Send, FileEdit, Trash2, ShieldAlert,
  Archive, Star, Folder, Users, Paperclip, Bell, ShieldCheck,
  Settings, HardDrive, Plus, Search,
} from "lucide-react";
import { useMail } from "../context/MailContext";
import { useUI } from "../context/UIContext";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/inbox", label: "Inbox", icon: Inbox, badge: "unread" },
      { to: "/search", label: "Search", icon: Search },
    ],
  },
  {
    title: "Mail",
    items: [
      { to: "/folders/sent", label: "Sent", icon: Send },
      { to: "/drafts", label: "Drafts", icon: FileEdit },
      { to: "/starred", label: "Starred", icon: Star },
      { to: "/folders/important", label: "Important", icon: Archive },
      { to: "/spam", label: "Spam", icon: ShieldAlert },
      { to: "/trash", label: "Trash", icon: Trash2 },
    ],
  },
  {
    title: "Workspace",
    items: [
      { to: "/folders", label: "Folders", icon: Folder },
      { to: "/contacts", label: "Contacts", icon: Users },
      { to: "/attachments", label: "Attachments", icon: Paperclip },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/security", label: "Security Center", icon: ShieldCheck },
      { to: "/storage", label: "Storage", icon: HardDrive },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { unreadCount, setComposeOpen } = useMail();
  const { sidebarOpen } = useUI();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 264 : 84 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="glass sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-r border-white/30 dark:border-white/5 p-4 md:flex"
    >
      <div className="mb-5 flex items-center gap-2 px-1">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-white font-bold shadow-lg shadow-violet-500/30 text-[10px] leading-tight tracking-tight text-center">
          Sholok
        </div>
        {sidebarOpen && (
          <span className="text-lg font-bold text-slate-800 dark:text-white">Sholok Mail</span>
        )}
      </div>

      <button
        onClick={() => setComposeOpen(true)}
        className="mb-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-sky-500 py-3 font-medium text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-[1.02] active:scale-95"
      >
        <Plus size={18} />
        {sidebarOpen && <span>Compose</span>}
      </button>

      <nav className="flex-1 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {sidebarOpen && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      isActive
                        ? "bg-violet-600/15 font-semibold text-violet-600 dark:text-violet-300"
                        : "text-slate-600 hover:bg-violet-500/10 dark:text-slate-300"
                    }`
                  }
                >
                  <item.icon size={18} className="shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                  {sidebarOpen && item.badge === "unread" && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
