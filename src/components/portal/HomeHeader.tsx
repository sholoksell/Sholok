import { Bell, ShoppingCart, User, Menu } from "lucide-react";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";
import ServiceShortcuts from "@/components/portal/ServiceShortcuts";
import HamburgerMenu from "@/components/portal/HamburgerMenu";

interface HomeHeaderProps {
  initialQuery?: string;
}

const HomeHeader = ({ initialQuery = "" }: HomeHeaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount }              = useAppSelector((s) => s.notification);
  const { items: cartItems }         = useAppSelector((s) => s.cart);
  const { isAuthenticated }          = useAppSelector((s) => s.auth);

  const [isMenuOpen, setMenuOpen] = useState(false);
  const openMenu  = useCallback(() => setMenuOpen(true),  []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      {/* ── Sticky compact top bar ──────────────────────────────────────── */}
      {/* h-14 = 56px matches the mobile spec; safe-area-inset-top for notched phones */}
      <header
        className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-5 lg:px-8 h-14 flex items-center gap-2 sm:gap-3">

          {/* Hamburger */}
          <button
            onClick={openMenu}
            aria-label="Open menu"
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-foreground flex-shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </button>

          {/* Logo */}
          <Link to="/home" aria-label="Sholok home" className="flex-shrink-0">
            <span className="font-logo text-2xl font-black text-[#5D0096] tracking-tight leading-none select-none">SHOLOK</span>
          </Link>

          {/* Spacer — search bar lives in the hero section below (both mobile & desktop) */}
          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

            {/* Bell — always visible */}
            <button className="p-2 relative hover:bg-secondary rounded-full transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </button>

            {/* Cart — desktop only; accessible via hamburger menu on mobile */}
            <a href="http://shopping.sholok.com" aria-label="Shopping cart"
              className="hidden sm:flex p-2 relative hover:bg-secondary rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </Badge>
              )}
            </a>

            {/* Login / Profile */}
            {isAuthenticated ? (
              <>
                {/* Mobile: icon only to keep header minimal */}
                <Link to="/profile" aria-label="Profile"
                  className="sm:hidden p-2 hover:bg-secondary rounded-full transition-colors">
                  <User className="w-5 h-5 text-muted-foreground" />
                </Link>
                {/* Desktop: icon + label */}
                <Link to="/profile"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm">
                  <User className="w-4 h-4" />
                  <span>{t("profile")}</span>
                </Link>
              </>
            ) : (
              <Link to="/login"
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap">
                {t("login")}
              </Link>
            )}

            {/* Divider + Theme + Language — desktop only; available via hamburger on mobile */}
            <div className="hidden sm:block h-5 w-px bg-border mx-0.5" />
            <div className="hidden sm:block"><ThemeToggle /></div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "EN" | "BN")}
              aria-label="Language"
              className="hidden sm:block bg-transparent text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground outline-none cursor-pointer px-0.5"
            >
              <option value="EN">EN</option>
              <option value="BN">বাং</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── Hero search area — always visible on all screen sizes ────────── */}
      <div className={`w-full bg-background border-b border-border/40 ${initialQuery ? "py-4 sm:py-10 lg:py-12" : "py-6 sm:py-10 lg:py-12"}`}>
        <div className="w-full max-w-[750px] mx-auto px-4 sm:px-6">
          <SearchBar variant="hero" initialQuery={initialQuery} />
          {!initialQuery && <ServiceShortcuts />}
        </div>
      </div>

      {/* Hamburger drawer */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

export default HomeHeader;
