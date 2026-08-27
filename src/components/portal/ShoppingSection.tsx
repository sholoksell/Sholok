import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SHOPPING_BASE = "https://shopping.sholok.com";
const PER_PAGE = 10;

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
  { key: "featured",    labelEn: "All Items",   labelBn: "সব আইটেম",    query: "lawn"        },
  { key: "lawn",        labelEn: "Lawn",         labelBn: "লন সুট",      query: "lawn"        },
  { key: "printed",     labelEn: "Printed",      labelBn: "প্রিন্টেড",   query: "printed"     },
  { key: "embroidered", labelEn: "Embroidered",  labelBn: "এমব্রয়ডারি", query: "embroidered" },
  { key: "dupatta",     labelEn: "Dupatta",      labelBn: "দুপাট্টা",    query: "dupatta"     },
];

export default function ShoppingSection() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("featured");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const cache = useRef<Record<string, Product[]>>({});
  const tabScrollRef = useRef<HTMLDivElement>(null);

  const tab = TABS.find(tb => tb.key === activeTab)!;

  useEffect(() => {
    if (cache.current[tab.query]) {
      setAllProducts(cache.current[tab.query]);
      setPage(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(tab.query)}&limit=20`)
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
        setAllProducts(list);
        setPage(1);
      })
      .catch(() => { setAllProducts([]); setPage(1); })
      .finally(() => setLoading(false));
  }, [activeTab]);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PER_PAGE));
  const pageProducts = allProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const disc = (p: Product) =>
    p.sale_price && p.regular_price && p.sale_price < p.regular_price
      ? Math.round((1 - p.sale_price / p.regular_price) * 100)
      : null;

  const switchTab = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">

      {/* ── Top header bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">{t("shoppingToday")}</span>
          <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{t("hot")}</span>
        </div>
        <a href={SHOPPING_BASE} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
          {t("viewAll")} <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* ── Category nav tabs ──────────────────────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div
          ref={tabScrollRef}
          className="flex items-center gap-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {TABS.map((tb, i) => (
            <button
              key={tb.key}
              onClick={() => switchTab(tb.key)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tb.key
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              } ${i > 0 ? "border-l border-l-border/40" : ""}`}
            >
              {language === "BN" ? tb.labelBn : tb.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid ───────────────────────────────────────────────────── */}
      <div className="p-3">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-secondary/30 rounded-lg p-2 animate-pulse">
                <div className="w-full aspect-square bg-secondary rounded mb-2" />
                <div className="h-2.5 bg-secondary rounded mb-1.5 w-full" />
                <div className="h-2.5 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : pageProducts.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <a href={SHOPPING_BASE} className="text-primary hover:underline">
              {language === "BN" ? "সব প্রোডাক্ট দেখুন →" : "Browse all products →"}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {pageProducts.map(p => {
              const d = disc(p);
              const price = p.sale_price ?? p.regular_price;
              const name = language === "BN" ? (p.name_bn || p.name) : p.name;
              return (
                <a
                  key={p.id}
                  href={`${SHOPPING_BASE}/product/${p.slug}`}
                  className="group flex flex-col bg-background rounded-lg border border-border/60 hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="relative w-full aspect-square bg-secondary/30 overflow-hidden">
                    {d !== null && (
                      <span className="absolute top-1 left-1 z-10 px-1 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded leading-none">
                        -{d}%
                      </span>
                    )}
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="p-2 flex flex-col gap-0.5 flex-1">
                    <h3 className="text-[11px] leading-4 font-medium text-foreground line-clamp-2 min-h-[32px]">
                      {name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-auto flex-wrap">
                      {price != null && (
                        <span className="text-xs font-bold text-portal-green">৳{price.toLocaleString()}</span>
                      )}
                      {d !== null && p.regular_price && (
                        <span className="text-[9px] text-muted-foreground line-through">৳{p.regular_price.toLocaleString()}</span>
                      )}
                    </div>
                    {p.category_name && (
                      <p className="text-[9px] text-muted-foreground truncate">{p.category_name}</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Today's Benefits strip ─────────────────────────────────────────── */}
      {!loading && allProducts.length > 0 && (
        <div className="mx-3 mb-3 px-3 py-2 bg-gradient-to-r from-primary/10 to-portal-green/10 rounded-lg border border-primary/20 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-primary whitespace-nowrap">
            {language === "BN" ? "আজকের অফার" : "Today's Benefits"}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-foreground font-medium truncate">
            {language === "BN"
              ? "সেরা দামে লন, প্রিন্টেড ও এমব্রয়ডারি কালেকশন"
              : "Best prices on Lawn, Printed & Embroidered collections"}
          </span>
          <a href={SHOPPING_BASE} className="ml-auto text-[10px] text-primary font-medium hover:underline whitespace-nowrap">
            {language === "BN" ? "শপিং করুন →" : "Shop Now →"}
          </a>
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-border bg-secondary/20">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="p-1.5 rounded-full border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs text-muted-foreground">
          {language === "BN"
            ? `আরও শপিং আইটেম ${page} / ${totalPages}`
            : `More shopping items ${page} / ${totalPages}`}
        </span>

        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || loading}
          className="p-1.5 rounded-full border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
