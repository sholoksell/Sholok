import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Filter, Search, ShoppingBag, ShoppingCart, Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/portal/Header";
import Footer from "@/components/portal/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const SHOPPING_BASE = "https://shopping.sholok.com";
const PER_PAGE = 20;

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

const CATEGORIES = [
  { key: "all",          labelEn: "All Items",    labelBn: "সব আইটেম",       query: "suit"        },
  { key: "lawn",         labelEn: "Lawn",          labelBn: "লন সুট",         query: "lawn"        },
  { key: "printed",      labelEn: "Printed",       labelBn: "প্রিন্টেড",      query: "printed"     },
  { key: "embroidered",  labelEn: "Embroidered",   labelBn: "এমব্রয়ডারি",    query: "embroidered" },
  { key: "dupatta",      labelEn: "Dupatta",       labelBn: "দুপাট্টা",       query: "dupatta"     },
  { key: "katan",        labelEn: "Katan Silk",    labelBn: "কাতান সিল্ক",    query: "katan"       },
  { key: "georgette",    labelEn: "Georgette",     labelBn: "জর্জেট",         query: "georgette"   },
  { key: "cotton",       labelEn: "Cotton",        labelBn: "কটন",            query: "cotton"      },
];

const Shopping = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const cache = useRef<Record<string, Product[]>>({});
  const tabScrollRef = useRef<HTMLDivElement>(null);

  const t = (en: string, bn: string) => language === "BN" ? bn : en;

  const activeCategory = CATEGORIES.find(c => c.key === activeTab)!;

  const fetchProducts = (query: string) => {
    const cacheKey = query;
    if (cache.current[cacheKey]) {
      setAllProducts(cache.current[cacheKey]);
      setPage(1);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}&limit=40`)
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
        cache.current[cacheKey] = list;
        setAllProducts(list);
        setPage(1);
      })
      .catch(() => { setAllProducts([]); setPage(1); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts(activeCategory.query);
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchProducts(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchProducts(activeCategory.query);
  };

  const disc = (p: Product) =>
    p.sale_price && p.regular_price && p.sale_price < p.regular_price
      ? Math.round((1 - p.sale_price / p.regular_price) * 100)
      : null;

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PER_PAGE));
  const pageProducts = allProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">

        {/* Page title + back link */}
        <div className="flex items-center gap-3 mb-5">
          <a href="/home" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("Home", "হোম")}
          </a>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{t("Shopping", "শপিং")}</h1>
          </div>
          <a
            href={SHOPPING_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-primary hover:underline font-medium"
          >
            {t("Open Full Store →", "পূর্ণ স্টোর খুলুন →")}
          </a>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t("Search products…", "পণ্য খুঁজুন…")}
            className="w-full pl-9 pr-20 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-16 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("Search", "খুঁজুন")}
          </button>
        </form>

        {/* Category tabs */}
        <div className="mb-4 border-b border-border">
          <div
            ref={tabScrollRef}
            className="flex items-center gap-0 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.key}
                onClick={() => { setActiveTab(cat.key); setSearchQuery(""); }}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === cat.key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                } ${i > 0 ? "border-l border-l-border/30" : ""}`}
              >
                {language === "BN" ? cat.labelBn : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-muted-foreground mb-3">
            {allProducts.length > 0
              ? t(`${allProducts.length} products found`, `${allProducts.length}টি পণ্য পাওয়া গেছে`)
              : t("No products found", "কোনো পণ্য পাওয়া যায়নি")}
          </p>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-2 animate-pulse">
                <div className="w-full aspect-square bg-secondary rounded-lg mb-2" />
                <div className="h-2.5 bg-secondary rounded mb-1.5 w-full" />
                <div className="h-2.5 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : pageProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {t("No products found. Try a different search.", "কোনো পণ্য পাওয়া যায়নি। অন্য কিছু খোঁজ করুন।")}
            </p>
            <a
              href={SHOPPING_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("Browse Full Store", "সম্পূর্ণ স্টোর দেখুন")}
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {pageProducts.map(p => {
              const d = disc(p);
              const price = p.sale_price ?? p.regular_price;
              const name = language === "BN" ? (p.name_bn || p.name) : p.name;
              return (
                <a
                  key={p.id}
                  href={`${SHOPPING_BASE}/product/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="relative w-full aspect-square bg-secondary/30 overflow-hidden">
                    {d !== null && (
                      <span className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded leading-none">
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
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col gap-1 flex-1">
                    <h3 className="text-xs leading-4 font-medium text-foreground line-clamp-2 min-h-[32px]">
                      {name}
                    </h3>
                    {p.category_name && (
                      <p className="text-[10px] text-muted-foreground truncate">{p.category_name}</p>
                    )}
                    <div className="flex items-baseline gap-1 mt-auto flex-wrap">
                      {price != null && (
                        <span className="text-sm font-bold text-primary">৳{price.toLocaleString()}</span>
                      )}
                      {d !== null && p.regular_price && (
                        <span className="text-[10px] text-muted-foreground line-through">৳{p.regular_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("Previous", "আগের")}
            </button>
            <span className="text-sm text-muted-foreground">
              {t(`Page ${page} of ${totalPages}`, `পেজ ${page} / ${totalPages}`)}
            </span>
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t("Next", "পরের")}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Link to full store */}
        {!loading && allProducts.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-portal-green/10 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-foreground">
                {t("Explore more on our full store", "আমাদের সম্পূর্ণ স্টোরে আরও দেখুন")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("Thousands of products available at shopping.sholok.com", "হাজারো পণ্য পাওয়া যাচ্ছে shopping.sholok.com এ")}
              </p>
            </div>
            <a
              href={SHOPPING_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {t("Visit Full Store", "সম্পূর্ণ স্টোর দেখুন")}
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shopping;
