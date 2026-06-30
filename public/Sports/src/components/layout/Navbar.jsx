import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Sun, Moon, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useApp } from "../../context/AppContext";

const navLinks = [
  { to: "/", label: "হোম" },
  { to: "/live-score", label: "লাইভ স্কোর" },
  { to: "/schedule", label: "সময়সূচি" },
  { to: "/league-table", label: "লিগ টেবিল" },
  { to: "/teams", label: "দলসমূহ" },
  { to: "/players", label: "খেলোয়াড়" },
  { to: "/news", label: "সংবাদ" },
  { to: "/videos", label: "ভিডিও" },
  { to: "/analysis", label: "বিশ্লেষণ" },
  { to: "/fan-zone", label: "ফ্যান জোন" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { addSearchTerm } = useApp();
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    addSearchTerm(query.trim());
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50 glass shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐯</span>
            <span className="text-xl font-bold text-gradient-bd">খেলারবাংলা</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#006A4E] to-[#F2B705] text-white shadow"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="সার্চ করুন"
            >
              <Search size={19} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="থিম পরিবর্তন"
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="hidden sm:flex p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="নোটিফিকেশন">
              <Bell size={19} />
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-full hover:bg-white/10"
              aria-label="মেনু"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <form onSubmit={submitSearch} className="max-w-7xl mx-auto px-4 py-3 flex gap-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="দল, খেলোয়াড়, টুর্নামেন্ট সার্চ করুন..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-[#F2B705] text-sm"
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#F2B705] text-black font-semibold text-sm">
                খুঁজুন
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-white/10"
          >
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive ? "bg-[#006A4E] text-white" : "text-gray-300 hover:bg-white/10"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
