import { useEffect, useState, useRef } from "react";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalize";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/mockData";

export default function TrendingSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    productsApi.list({ limit: 12 } as any)
      .then((r: any) => {
        if (!mounted.current) return;
        const list = normalizeProducts(r);
        if (list.length) setProducts(list);
      })
      .catch(() => {})
      .finally(() => { if (mounted.current) setLoading(false); });
    return () => { mounted.current = false; };
  }, []);

  return (
    <section className="container py-6">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            Trending Items
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">What's hot right now</p>
        </div>
        <Link
          to="/search?sort=popular"
          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))
          : products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
      </div>
    </section>
  );
}
