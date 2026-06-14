import { Search, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar = ({ initialQuery = "" }: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <form onSubmit={handleSearch} className="relative flex items-center">
        {/* Sholok-style S Logo */}
        <div className="absolute left-4 flex items-center">
          <Link to="/">
            <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </span>
          </Link>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, categories, brands..."
          className="search-input pl-14"
        />

        {/* Keyboard Dropdown */}
        <div className="absolute right-14 flex items-center gap-1 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <span className="text-xs hidden sm:inline">EN</span>
          <ChevronDown className="w-3 h-3" />
        </div>

        {/* Search Button */}
        <button type="submit" className="search-button">
          <Search className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
