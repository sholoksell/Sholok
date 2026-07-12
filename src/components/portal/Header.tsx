import { Bell, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount }              = useAppSelector((state) => state.notification);
  const { items: cartItems }         = useAppSelector((state) => state.cart);
  const { isAuthenticated }          = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">

        {/* SearchBar — flex-1 so it fills available width */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Notification bell */}
          <button className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>

          {/* Cart */}
          <a href="/shopping/" className="p-1.5 sm:p-2 relative hover:bg-secondary rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
            {cartItems.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs">
                {cartItems.length}
              </Badge>
            )}
          </a>

          {/* Login / Profile */}
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <User className="w-4 h-4" />
              <span>{t("profile")}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium text-sm whitespace-nowrap"
            >
              {t("login")}
            </Link>
          )}

          <div className="hidden sm:block h-5 w-px bg-border mx-0.5" />
          <ThemeToggle />

          <select
            className="bg-transparent text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "EN" | "BN")}
          >
            <option value="EN">EN</option>
            <option value="BN">বাং</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
