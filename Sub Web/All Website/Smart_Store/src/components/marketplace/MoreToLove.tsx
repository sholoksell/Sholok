import { useEffect, useState, useRef } from "react";
import { RefreshCw, ChevronRight, Flame } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { productsApi } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalize";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/mockData";

export default function MoreToLove() {
  const location = useLocation();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("Popular picks for you");
  const mounted = useRef(true);

  const load = (extra?: Record<string, unknown>) => {
    setLoading(true);
    productsApi.list({ limit: 8, ...(extra || {}) } as any)
      .then((r: any) => {
        if (!mounted.current) return;
        const list = normalizeProducts(r);
        if (list.length) setItems(list);
      })
      .catch(() => {})
      .finally(() => { if (mounted.current) setLoading(false); });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setLabel(`Results for "${q}"`);
      load({ search: q });
    } else {
      setLabel("Popular picks for you");
      load();
    }
  }, [location.search]);

  useEffect(() => () => { mounted.current = false; }, []);

  return (
    <section className="container py-8" id="more-love">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3 border-b border-border pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-foreground sm:text-2xl">
            <Flame className="h-6 w-6 text-[#D31710]" /> More to Love
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setLabel("Popular picks for you"); load(); }}
            className="flex items-center gap-1.5 px-3 h-9 rounded border border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            to="/search"
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-8 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
