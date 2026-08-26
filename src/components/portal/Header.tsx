import { Bell, ShoppingCart, User, Menu } from "lucide-react";
import { useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";
import HamburgerMenu from "@/components/portal/HamburgerMenu";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount }              = useAppSelector((state) => state.notification);
  const { items: cartItems }         = useAppSelector((state) => state.cart);
  const { isAuthenticated }          = useAppSelector((state) => state.auth);
  const [searchParams]               = useSearchParams();
  const urlQuery                     = searchParams.get("q") ?? "";

  const [isMenuOpen, setMenuOpen] = useState(false);
  const openMenu  = useCallback(() => setMenuOpen(true),  []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5 flex items-center gap-2 sm:gap-3">

          {/* ── Left: Hamburger + Logo ──────────────────────────────────── */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hamburger button */}
            <button
              onClick={openMenu}
              aria-label="Open menu"
              className="p-2 rounded-xl hover:bg-secondary transition-colors text-foreground"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Logo */}
            <Link
              to="/home"
              className="flex items-center gap-1.5 group"
              aria-label="Sholok home"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center
                text-primary-foreground font-bold text-base sm:text-xl select-none group-hover:bg-primary/90 transition-colors">
                S
              </span>
              <span className="hidden md:block font-bold text-base sm:text-lg text-foreground tracking-tight leading-none">
                Sholok
              </span>
            </Link>
          </div>

          {/* ── Center: Search bar ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <SearchBar initialQuery={urlQuery} />
          </div>

          {/* ── Right: Controls ────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            {/* Bell */}
            <button className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </button>

            {/* Cart */}
            <a
              href="/shopping/"
              className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </Badge>
              )}
            </a>

            {/* Login / Profile */}
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground
                  rounded-full hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <User className="w-4 h-4" />
                <span>{t("profile")}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full
                  hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap"
              >
                {t("login")}
              </Link>
            )}

            {/* Divider (desktop) */}
            <div className="hidden sm:block h-5 w-px bg-border mx-0.5" />

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language selector */}
            <select
              className="bg-transparent text-xs sm:text-sm font-medium text-muted-foreground
                hover:text-foreground outline-none cursor-pointer px-0.5"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "EN" | "BN")}
              aria-label="Language selector"
            >
              <option value="EN">EN</option>
              <option value="BN">বাং</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hamburger drawer (rendered at root level to avoid stacking-context issues) */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default Header;
