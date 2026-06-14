import { Search, Bell, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { unreadCount } = useAppSelector((state) => state.notification);
  const { items: cartItems } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <span className="font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold text-primary hidden md:block">Sholok</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-11 pl-5 pr-12 rounded-full border border-border bg-secondary/30 focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
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
