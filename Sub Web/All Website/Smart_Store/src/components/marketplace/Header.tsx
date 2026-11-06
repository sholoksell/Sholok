import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut, LayoutDashboard, ShieldCheck, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/store/cartContext";
import { useAuth } from "@/store/authContext";

export default function Header() {
  const { count, total, open, wishlist } = useCart();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="container flex items-center gap-3 h-[70px]">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="shrink-0 mr-1">
            <span className="font-logo text-[2rem] font-black text-[#5D0096] tracking-tight leading-none">SHOLOK</span>
          </Link>

          {/* Deliver to */}
          <button className="hidden lg:flex flex-col items-start px-3 py-1 rounded-lg group hover:bg-[#D31710]/10 transition-colors shrink-0">
            <span className="text-xs text-muted-foreground leading-none group-hover:text-[#D31710] transition-colors">Deliver to</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground leading-tight mt-0.5 group-hover:text-[#D31710] transition-colors">
              <MapPin className="w-3.5 h-3.5 text-primary group-hover:text-[#D31710] transition-colors" />
              Dhaka
            </span>
          </button>

          {/* Search */}
          <form onSubmit={submitSearch} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="relative w-full flex">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full h-11 pl-4 pr-0 border border-border border-r-0 rounded-l-lg text-sm focus:outline-none focus:border-[#5D0096] transition-colors bg-background"
              />
              <button
                type="submit"
                className="h-11 px-5 bg-[#5D0096] hover:bg-[#4a0078] text-white rounded-r-lg flex items-center gap-1.5 text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span className="hidden md:inline">Search</span>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            {/* Account */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserOpen((v) => !v)}
                className="flex flex-col items-center px-3 py-1.5 rounded-lg group hover:bg-[#D31710]/10 transition-colors min-w-[64px]"
                aria-label="Account"
              >
                <User className="w-[22px] h-[22px] text-foreground/70 group-hover:text-[#D31710] transition-colors" />
                <span className="text-xs text-muted-foreground leading-tight whitespace-nowrap mt-0.5 group-hover:text-[#D31710] transition-colors">
                  {user ? (user.name?.split(" ")[0] || "Account") : "Sign in"}
                </span>
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-elegant p-1.5 z-50"
                    onMouseLeave={() => setUserOpen(false)}
                  >
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Link to="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded text-sm hover:bg-secondary">
                          <User className="w-3.5 h-3.5" /> My Account
                        </Link>
                        {(user.role === "seller" || user.role === "admin") && (
                          <Link to="/seller" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded text-sm hover:bg-secondary">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Seller Console
                          </Link>
                        )}
                        {user.role === "admin" && (
                          <Link to="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-2 px-3 h-9 rounded text-sm hover:bg-secondary">
                            <ShieldCheck className="w-3.5 h-3.5" /> Admin
                          </Link>
                        )}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={async () => { setUserOpen(false); await logout(); navigate("/"); }}
                            className="w-full flex items-center gap-2 px-3 h-9 rounded text-sm hover:bg-secondary text-destructive"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => setUserOpen(false)} className="flex items-center justify-center h-9 rounded text-sm font-semibold text-white bg-[#5D0096] hover:bg-[#4a0078] transition-colors mb-1">
                          Sign In
                        </Link>
                        <Link to="/register" onClick={() => setUserOpen(false)} className="flex items-center justify-center h-9 rounded text-sm border border-border hover:bg-secondary transition-colors">
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="hidden sm:flex flex-col items-center px-3 py-1.5 rounded-lg group hover:bg-[#D31710]/10 transition-colors relative min-w-[64px]"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="w-[22px] h-[22px] text-foreground/70 group-hover:text-[#D31710] transition-colors" />
                {wishlist.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D31710] text-white text-[9px] font-bold flex items-center justify-center">
                    {wishlist.size}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-tight mt-0.5 group-hover:text-[#D31710] transition-colors">Wishlist</span>
            </Link>

            {/* Cart */}
            <button
              onClick={open}
              className="flex flex-col items-center px-3 py-1.5 rounded-lg group hover:bg-[#D31710]/10 transition-colors relative min-w-[64px]"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingCart className="w-[22px] h-[22px] text-foreground/70 group-hover:text-[#D31710] transition-colors" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D31710] text-white text-[9px] font-bold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground leading-tight mt-0.5 group-hover:text-[#D31710] transition-colors">
                {total > 0 ? `৳${total.toLocaleString()}` : "Cart"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={submitSearch} className="flex">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-10 pl-4 border border-border rounded-l-lg text-sm focus:outline-none focus:border-[#5D0096]"
            />
            <button type="submit" className="h-10 px-4 bg-[#5D0096] text-white rounded-r-lg">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 sm:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-background shadow-elegant flex flex-col sm:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-logo text-xl text-[#5D0096] font-black">SHOLOK</span>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-1 overflow-y-auto">
                {user ? (
                  <div className="px-3 py-3 mb-2 bg-secondary rounded-lg">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-3">
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="h-10 rounded-lg bg-[#5D0096] text-white text-sm font-semibold flex items-center justify-center">Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="h-10 rounded-lg border border-border text-sm flex items-center justify-center">Create Account</Link>
                  </div>
                )}
                {[
                  { to: "/search", label: "All Products" },
                  { to: "/#flash-sale", label: "Flash Sale" },
                  { to: "/account?tab=wishlist", label: "My Wishlist" },
                  { to: "/account?tab=orders", label: "My Orders" },
                  { to: "/account", label: "My Account" },
                  { to: "/seller", label: "Become a Seller" },
                ].map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 h-11 rounded-lg text-sm flex items-center hover:bg-secondary transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
                {user && (
                  <button
                    onClick={async () => { setMobileOpen(false); await logout(); navigate("/"); }}
                    className="px-4 h-11 rounded-lg text-sm flex items-center text-destructive hover:bg-secondary transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
