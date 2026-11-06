import { useEffect, useState, useRef } from "react";
import { Tag, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { productsApi } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalize";
import ProductCard from "@/components/marketplace/ProductCard";
import type { Product } from "@/data/mockData";

const OFFER_TAGS = [
  { label: "20% OFF", color: "bg-[#D31710]" },
  { label: "New Arrivals", color: "bg-[#5D0096]" },
  { label: "Best Sellers", color: "bg-[#D31710]" },
  { label: "Flash Deals", color: "bg-[#5D0096]" },
];

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    productsApi.list({ limit: 20 } as any)
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
    <div className="container py-8">
      {/* Hero strip */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5D0096] to-[#8A00C8] mb-8 px-8 py-10 flex items-center justify-between">
        <div className="relative z-10">
          <span className="text-xs font-bold tracking-widest text-white/70 uppercase">Special Seasonal Offer</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mt-1 mb-3 uppercase leading-tight">
            Everyday<br />Style
          </h1>
          <p className="text-white/80 text-sm mb-4">Discover More, Love More</p>
          <div className="flex flex-wrap gap-2">
            {OFFER_TAGS.map((t) => (
              <span key={t.label} className={`${t.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
        <div className="hidden sm:block absolute right-0 top-0 h-full w-1/3">
          <img
            src="https://images.unsplash.com/photo-1594938298603-c8148c4b4f74?w=600&q=80&auto=format&fit=crop&crop=top"
            alt="Offers"
            className="h-full w-full object-cover object-top opacity-30"
          />
        </div>
      </div>

      {/* Section heading */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground sm:text-2xl">
            <Tag className="h-6 w-6 text-[#D31710]" />
            All Offers
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Special deals just for you</p>
        </div>
        <Link
          to="/search?sort=popular"
          className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))
          : products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
      </div>
    </div>
  );
}
