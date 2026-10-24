import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, Sparkles, Sun, Moon, X, Radio, LayoutDashboard, ShieldCheck, Users2, LogOut, Palette } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cartContext";
import { useTheme } from "@/store/themeContext";
import { useAuth } from "@/store/authContext";

const navItems = [
  { to: "/search",    label: "Shop" },
  { to: "/store/s2",  label: "Stores" },
  { to: "/group-buy", label: "Group buy", icon: Users2 },
  { to: "/live",      label: "Live",      icon: Radio },
];

export default function Header() {
  const { count, open, wishlist } = useCart();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [scrolled,    setScrolled]    = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userOpen,    setUserOpen]    = useState(false);
  const [query,       setQuery]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? "glass shadow-soft" : "bg-background/0"
        }`}
      >
        <div className="container flex items-center gap-4 h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-white font-display font-bold text-lg leading-none">S</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight whitespace-nowrap">Sholok <span className="gradient-text">Smart Store</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-2">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 h-9 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive ? "bg-secondary text-foreground" : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
                  }`
                }
              >
                {n.icon && <n.icon className="w-3.5 h-3.5" />}
                {n.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <motion.div
              animate={{ scale: searchFocus ? 1.01 : 1 }}
              className={`relative w-full transition-all ${
                searchFocus ? "shadow-elegant" : "shadow-soft"
              } rounded-2xl bg-card border border-border/60`}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                placeholder=""
                className="w-full h-11 pl-11 pr-28 bg-transparent rounded-2xl text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-primary text-white text-[10px] font-semibold hover:scale-105 transition-transform">
                <Sparkles className="w-3 h-3" /> Go
              </button>
            </motion.div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <Link to="/account?tab=wishlist" className="hidden sm:flex w-10 h-10 rounded-xl hover:bg-secondary items-center justify-center transition-colors relative">
              <Heart className="w-4 h-4" />
              {wishlist.size > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-pink" />}
            </Link>

            {user ? (
              <div className="relative hidden sm:block">
                <button onClick={() => setUserOpen((v) => !v)} className="w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center transition-colors" aria-label="Account menu">
                  <div className="w-7 h-7 rounded-lg bg-gradient-primary text-white text-xs font-bold flex items-center justify-center">
                    {(user.name?.[0] || "U").toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-elegant p-2 z-50"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm hover:bg-secondary"><User className="w-3.5 h-3.5" /> My account</Link>
                      {(user.role === "seller" || user.role === "admin") && (
                        <>
                          <Link to="/seller" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm hover:bg-secondary"><LayoutDashboard className="w-3.5 h-3.5" /> Seller console</Link>
                          <Link to="/seller/customize" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm hover:bg-secondary"><Palette className="w-3.5 h-3.5" /> Customize store</Link>
                        </>
                      )}
                      {user.role === "admin" && (
                        <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded-xl text-sm hover:bg-secondary"><ShieldCheck className="w-3.5 h-3.5" /> Admin</Link>
                      )}
                      <button
                        onClick={async () => { setUserOpen(false); await logout(); navigate("/"); }}
                        className="w-full flex items-center gap-2 px-3 h-9 rounded-xl text-sm hover:bg-secondary text-destructive"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:flex h-10 px-4 rounded-xl hover:bg-secondary items-center justify-center transition-colors text-sm font-semibold">
                Sign in
              </Link>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={open}
              className="relative w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:bg-accent transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-primary text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <button onClick={() => setMobileOpen(true)} className="lg:hidden w-10 h-10 rounded-xl hover:bg-secondary flex items-center justify-center">
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden" />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-background shadow-elegant flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <span className="font-display font-bold text-lg">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1">
                {[...navItems, { to: "/seller", label: "Seller", icon: LayoutDashboard }, { to: "/admin", label: "Admin", icon: ShieldCheck }].map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 h-12 rounded-2xl text-sm font-medium flex items-center gap-3 transition-colors ${
                        isActive ? "bg-secondary" : "hover:bg-secondary/60"
                      }`
                    }
                  >
                    {n.icon && <n.icon className="w-4 h-4" />}
                    {n.label}
                  </NavLink>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
