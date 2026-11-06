import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productsApi, API_ORIGIN } from "@/lib/api";
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
  return all
    .filter(p => {
      const cat = typeof p.categoryId === "object" ? p.categoryId?.name : "";
      return (
        p.name?.toLowerCase().includes(lq) ||
        (p.nameBn && p.nameBn.includes(lq)) ||
        (cat && cat.toLowerCase().includes(lq))
      );
    })
    .slice(0, 8);
}

function imgSrc(thumbnail?: string) {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${API_ORIGIN}${thumbnail.startsWith("/") ? "" : "/"}${thumbnail}`;
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
  const wrap = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      const all = await getProducts();
      setSuggestions(filterProducts(all, query));
      setBusy(false);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [query]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
  };

  const pick = (p: Product) => {
    setOpen(false);
    setQuery(p.name);
    navigate(`/product/${p.slug}`);
  };

  const h = mobile ? "h-10" : "h-11";

  return (
    <div ref={wrap} className="relative w-full">
      <form onSubmit={submit} className="flex">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (!_cache) getProducts(); }}
          placeholder={mobile ? t("search_ph_mob") : t("search_ph")}
          autoComplete="off"
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

      {open && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-white dark:bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground text-center">No products found</p>
          ) : (
            suggestions.map(p => {
              const sale = p.salePrice;
              const reg = p.regularPrice ?? p.price ?? 0;
              const src = imgSrc(p.thumbnail);
              return (
                <button
                  key={p._id}
                  type="button"
                  onMouseDown={() => pick(p)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#5D0096]/5 transition-colors text-left border-b border-border/50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-md bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                    {src ? (
                      <img src={src} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-secondary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <div className="flex items-center gap-2">
                      {sale && sale < reg ? (
                        <>
                          <span className="text-xs font-semibold text-[#D31710]">৳{sale.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground line-through">৳{reg.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#5D0096]">৳{reg.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
