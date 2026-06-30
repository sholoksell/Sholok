import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, Bell, Sun, Moon, Command } from "lucide-react";
import { useUI } from "../context/UIContext";
import { useTheme } from "../context/ThemeContext";
import { useMail } from "../context/MailContext";
import Avatar from "./Avatar";

export default function Navbar() {
  const { sidebarOpen, setSidebarOpen, setCommandPaletteOpen } = useUI();
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useMail();
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-white/30 dark:border-white/5 px-4 py-3">
      <button
        onClick={() => setSidebarOpen((s) => !s)}
        className="rounded-xl p-2 text-slate-500 hover:bg-violet-500/10"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mail, people, attachments..."
          className="w-full rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 py-2.5 pl-9 pr-16 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-slate-300/50 px-1.5 py-0.5 text-[10px] text-slate-400"
        >
          <Command size={10} /> K
        </button>
      </form>

      <button onClick={toggleTheme} className="rounded-xl p-2 text-slate-500 hover:bg-violet-500/10" aria-label="Toggle theme">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </motion.span>
        </AnimatePresence>
      </button>

      <Link to="/notifications" className="relative rounded-xl p-2 text-slate-500 hover:bg-violet-500/10">
        <Bell size={20} />
        {unreadNotifs > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500 animate-glow" />
        )}
      </Link>

      <div className="relative">
        <button onClick={() => setProfileOpen((o) => !o)}>
          <Avatar name="Maksudul Khan" color="#7C3AED" initials="MK" size={36} />
        </button>
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className="glass-strong absolute right-0 mt-2 w-48 rounded-2xl p-2 shadow-xl"
            >
              <Link to="/settings" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-violet-500/10">
                Profile Settings
              </Link>
              <Link to="/security" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2 text-sm hover:bg-violet-500/10">
                Security Center
              </Link>
              <div className="my-1 border-t border-slate-200/50 dark:border-slate-700/50" />
              <button className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/10">
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
