import { Bell, ShoppingCart, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/portal/SearchBar";

const Header = () => {
  const { language, setLanguage, t }    = useLanguage();
  const { unreadCount }                 = useAppSelector((state) => state.notification);
  const { items: cartItems }            = useAppSelector((state) => state.cart);
  const { isAuthenticated }             = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        {/* SearchBar (with বাং/EN toggle) */}
        <div className="flex-1">
          <SearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button className="p-2 relative hover:bg-secondary rounded-full transition-colors">
            <Bell className="w-6 h-6 text-muted-foreground" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>
          <a href="/shopping/" className="p-2 relative hover:bg-secondary rounded-full transition-colors">
            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
            {cartItems.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {cartItems.length}
              </Badge>
            )}
          </a>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
            >
              <User className="w-4 h-4" />
              <span>{t("profile")}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
            >
              <span>{t("login")}</span>
            </Link>
          )}

          <div className="h-6 w-px bg-border mx-1"></div>
          <ThemeToggle />

          <select
            className="bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground outline-none cursor-pointer"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'EN' | 'BN')}
          >
            <option value="EN">EN</option>
            <option value="BN">বাংলা</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;

