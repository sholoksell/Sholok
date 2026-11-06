import { useState, useEffect, useRef } from "react";
import { Search, Loader2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "@/lib/api";
import { useLang } from "@/store/languageContext";

interface Product {
  _id: string;
  name: string;
  nameBn?: string;
  slug: string;
  thumbnail?: string;
  regularPrice?: number;
  salePrice?: number;
  price?: number;
  categoryId?: { name?: string; slug?: string } | string;
}

// Module-level cache shared across all SearchBar instances
let _cache: Product[] | null = null;
let _loading = false;
const _listeners: Array<() => void> = [];

async function getProducts(): Promise<Product[]> {
  if (_cache) return _cache;
  if (_loading) return new Promise(r => _listeners.push(() => r(_cache!)));
  _loading = true;
  try {
    const res = await productsApi.list({ limit: 200 });
    _cache = Array.isArray(res) ? res : (res.products ?? res.data ?? []);
  } catch {
    _cache = [];
  } finally {
    _loading = false;
    _listeners.splice(0).forEach(fn => fn());
  }
  return _cache!;
}

function filterProducts(all: Product[], q: string): Product[] {
  const lq = q.toLowerCase().trim();
  if (!lq) return [];
  const words = lq.split(/\s+/).filter(Boolean);
  return all
    .filter(p => {
      const name = p.name?.toLowerCase() ?? "";
      const nameBn = p.nameBn ?? "";
      const cat = typeof p.categoryId === "object" ? (p.categoryId?.name?.toLowerCase() ?? "") : "";
      // All words must appear somewhere in name or category
      return words.every(w => name.includes(w) || nameBn.includes(w) || cat.includes(w));
    })
    .slice(0, 10);
}

// Highlight the matched portion of a product name
function highlight(name: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return name;
  const idx = name.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) {
    // Try highlighting first word match
    const word = q.split(/\s+/)[0];
    const wi = name.toLowerCase().indexOf(word.toLowerCase());
    if (wi === -1) return name;
    return (
      <>
        {name.slice(0, wi)}
        <span className="font-semibold text-foreground">{name.slice(wi, wi + word.length)}</span>
        {name.slice(wi + word.length)}
      </>
    );
  }
  return (
    <>
      {name.slice(0, idx)}
      <span className="font-semibold text-foreground">{name.slice(idx, idx + q.length)}</span>
      {name.slice(idx + q.length)}
    </>
  );
}

interface SearchBarProps {
  mobile?: boolean;
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  // Debounced filter
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setSuggestions([]); setOpen(false); setActiveIdx(-1); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      const all = await getProducts();
      setSuggestions(filterProducts(all, query));
      setBusy(false);
      setOpen(true);
      setActiveIdx(-1);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  // Close on click outside
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      pick(suggestions[activeIdx]);
      return;
    }
    setOpen(false);
    setActiveIdx(-1);
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  };

  const pick = (p: Product) => {
    setOpen(false);
    setActiveIdx(-1);
    setQuery(p.name);
    navigate(`/product/${p.slug}`);
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
          onFocus={() => { if (!_cache) getProducts(); }}
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
                {/* Search icon */}
                <Search className="w-[15px] h-[15px] text-muted-foreground shrink-0 group-hover:text-[#5D0096] transition-colors" />

                {/* Product name with highlighted match */}
                <span className="flex-1 text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                  {highlight(p.name, query)}
                </span>

                {/* Arrow redirect icon */}
                <ArrowUpRight className="w-[15px] h-[15px] text-muted-foreground/50 shrink-0 group-hover:text-[#5D0096] transition-colors" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
