import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SHOPPING_BASE = "https://shopping.sholok.com";

interface Product {
  id: number;
  name: string;
  name_bn: string;
  slug: string;
  thumbnail: string | null;
  regular_price: number | null;
  sale_price: number | null;
  category_name: string | null;
}

const TABS = [
  { key: "featured",    labelEn: "Featured",    labelBn: "ফিচার্ড",     query: "lawn"        },
  { key: "lawn",        labelEn: "Lawn Suits",  labelBn: "লন সুট",      query: "lawn"        },
  { key: "printed",     labelEn: "Printed",     labelBn: "প্রিন্টেড",   query: "printed"     },
  { key: "embroidered", labelEn: "Embroidered", labelBn: "এমব্রয়ডারি", query: "embroidered" },
  { key: "dupatta",     labelEn: "Dupatta",     labelBn: "দুপাট্টা",    query: "dupatta"     },
];

export default function ShoppingSection() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("featured");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cache = useRef<Record<string, Product[]>>({});

  useEffect(() => {
    const tab = TABS.find(tb => tb.key === activeTab)!;
    if (cache.current[tab.query]) {
      setProducts(cache.current[tab.query]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(tab.query)}&limit=12`)
      .then(r => r.ok ? r.json() : { products: [] })
      .then(data => {
        const list: Product[] = (data.products || []).map((p: any) => ({
          id:            p.id,
          name:          p.name,
          name_bn:       p.name_bn || p.name,
          slug:          p.slug,
          thumbnail:     p.thumbnail || null,
          regular_price: p.regular_price != null ? Number(p.regular_price) : null,
          sale_price:    p.sale_price   != null ? Number(p.sale_price)    : null,
          category_name: p.category_name || null,
        }));
        cache.current[tab.query] = list;
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 240 : -240, behavior: "smooth" });
  };

  const discountPct = (p: Product) => {
    if (p.sale_price && p.regular_price && p.sale_price < p.regular_price)
      return Math.round((1 - p.sale_price / p.regular_price) * 100);
    return null;
  };

  return (
    <div className="w-full py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-foreground" />
          <h2 className="text-lg font-bold text-foreground">{t("shoppingToday")}</h2>
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{t("hot")}</span>
        </div>
        <a
          href={SHOPPING_BASE}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {language === "BN" ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          aria-label="scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-3 bg-card border border-border rounded-full p-1.5 shadow-md hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 bg-card border border-border rounded-xl p-3 animate-pulse">
                  <div className="w-full aspect-square bg-secondary rounded-lg mb-3" />
                  <div className="h-3 bg-secondary rounded mb-2" />
                  <div className="h-3 bg-secondary rounded w-2/3" />
                </div>
              ))
            : products.length === 0
            ? (
                <div className="flex-1 flex items-center justify-center py-10 text-sm text-muted-foreground">
                  <a href={SHOPPING_BASE} className="text-primary hover:underline">
                    {language === "BN" ? "সব প্রোডাক্ট দেখুন →" : "Browse all products →"}
                  </a>
                </div>
              )
            : products.map(p => {
                const disc = discountPct(p);
                const displayPrice = p.sale_price ?? p.regular_price;
                const displayName = language === "BN" ? (p.name_bn || p.name) : p.name;
                return (
                  <a
                    key={p.id}
                    href={`${SHOPPING_BASE}/products/${p.slug}`}
                    className="flex-shrink-0 w-40 group block bg-card rounded-xl border border-border p-3 hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="relative w-full aspect-square mb-3 bg-secondary/40 rounded-lg overflow-hidden">
                      {disc !== null && (
                        <span className="absolute top-1 left-1 z-10 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded leading-none">
                          -{disc}%
                        </span>
                      )}
                      {p.thumbnail
                        ? <img
                            src={p.thumbnail}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        : <ShoppingBag className="w-10 h-10 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      }
                    </div>

                    <h3 className="text-xs font-medium text-foreground line-clamp-2 mb-1.5 min-h-[32px] leading-4">
                      {displayName}
                    </h3>

                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      {displayPrice != null && (
                        <span className="text-sm font-bold text-portal-green">
                          ৳{displayPrice.toLocaleString()}
                        </span>
                      )}
                      {disc !== null && p.regular_price && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          ৳{p.regular_price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {p.category_name && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.category_name}</p>
                    )}
                  </a>
                );
              })
          }
        </div>

        <button
          onClick={() => scroll("right")}
          aria-label="scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-3 bg-card border border-border rounded-full p-1.5 shadow-md hover:bg-secondary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
