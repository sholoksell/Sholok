import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProductCache, filterProducts, type CachedProduct } from "@/lib/productCache";
import { useLiveSearch } from "@/store/searchContext";
import { useLang } from "@/store/languageContext";

// Highlight the matched query inside a product name
function highlight(name: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return name;
  // Try to highlight the whole phrase first, then just the first word
  const idx = name.toLowerCase().indexOf(q.toLowerCase());
  if (idx !== -1) {
    return (
      <>
        {name.slice(0, idx)}
        <span className="font-semibold text-foreground">{name.slice(idx, idx + q.length)}</span>
        {name.slice(idx + q.length)}
      </>
    );
  }
  const word = q.split(/\s+/)[0];
  const wi = name.toLowerCase().indexOf(word.toLowerCase());
  if (wi !== -1) {
    return (
      <>
        {name.slice(0, wi)}
        <span className="font-semibold text-foreground">{name.slice(wi, wi + word.length)}</span>
        {name.slice(wi + word.length)}
      </>
    );
  }
  return name;
}

interface SearchBarProps {
  mobile?: boolean;
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const { liveQuery, setLiveQuery } = useLiveSearch();
  const [query, setQueryLocal] = useState(liveQuery);
  const [suggestions, setSuggestions] = useState<CachedProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const liveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Keep local input in sync when liveQuery is cleared externally
  useEffect(() => {
    if (!liveQuery) setQueryLocal("");
  }, [liveQuery]);

  // Debounced suggestion + liveQuery update
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (liveTimer.current) clearTimeout(liveTimer.current);

    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      setActiveIdx(-1);
      setLiveQuery("");
      return;
    }

    timer.current = setTimeout(async () => {
      setBusy(true);
      const all = await getProductCache();
      setSuggestions(filterProducts(all, query).slice(0, 10));
      setBusy(false);
      setOpen(true);
      setActiveIdx(-1);
    }, 300);

    // Set liveQuery with slightly longer debounce so suggestions appear first
    liveTimer.current = setTimeout(() => {
      if (isHome) setLiveQuery(query.trim());
    }, 400);

    return () => {
      clearTimeout(timer.current);
      clearTimeout(liveTimer.current);
    };
  }, [query, isHome]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const setQuery = (v: string) => {
    setQueryLocal(v);
  };

  // Pick a suggestion: update input + liveQuery (stay on homepage) or navigate on other pages
  const pick = (p: CachedProduct) => {
    setOpen(false);
    setActiveIdx(-1);
    setQueryLocal(p.name);
    if (isHome) {
      setLiveQuery(p.name);
    } else {
      navigate(`/search?q=${encodeURIComponent(p.name)}`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      pick(suggestions[activeIdx]);
      return;
    }
    setOpen(false);
    setActiveIdx(-1);
    if (isHome) {
      // liveQuery already set by debounce — just close the dropdown
      setLiveQuery(query.trim());
    } else {
      navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  const h = mobile ? "h-10" : "h-11";

  return (
    <div ref={wrap} className="relative w-full">
      <form onSubmit={submit} className="flex">
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { getProductCache(); }}
          onKeyDown={handleKeyDown}
          placeholder={mobile ? t("search_ph_mob") : t("search_ph")}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          className={`w-full ${h} pl-4 pr-0 border border-border border-r-0 rounded-l-lg text-sm focus:outline-none focus:border-[#5D0096] transition-colors bg-background`}
        />
        <button
          type="submit"
          className={`${h} ${mobile ? "px-4" : "px-5"} bg-[#5D0096] hover:bg-[#4a0078] text-white rounded-r-lg flex items-center gap-1.5 text-sm font-semibold transition-colors whitespace-nowrap`}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {!mobile && <span className="hidden md:inline">{t("search_btn")}</span>}
        </button>
      </form>

      {/* Shwapno-style suggestion dropdown */}
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 z-[60] mt-1 bg-white dark:bg-card border border-border rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.10)] overflow-hidden"
        >
          {suggestions.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">No products found</p>
            </div>
          ) : (
            suggestions.map((p, i) => (
              <button
                key={p._id}
                role="option"
                aria-selected={i === activeIdx}
                type="button"
                onMouseDown={() => pick(p)}
                onMouseEnter={() => setActiveIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-[11px] transition-colors text-left group ${
                  i === activeIdx
                    ? "bg-[#5D0096]/8 dark:bg-[#5D0096]/15"
                    : "hover:bg-[#5D0096]/5 dark:hover:bg-[#5D0096]/10"
                }`}
              >
                <Search className="w-[15px] h-[15px] text-muted-foreground shrink-0 group-hover:text-[#5D0096] transition-colors" />
                <span className="flex-1 text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {highlight(p.name, query)}
                </span>
                <ArrowUpRight className="w-[15px] h-[15px] text-muted-foreground/50 shrink-0 group-hover:text-[#5D0096] transition-colors" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
