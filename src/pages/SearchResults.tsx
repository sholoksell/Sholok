import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/portal/Header";
import SearchBar from "@/components/portal/SearchBar";
import { searchSite, SEARCH_INDEX, SearchEntry, CATEGORY_BN, isBengaliScript } from "@/lib/searchIndex";
import { Search, ArrowRight, ExternalLink, Compass, ShoppingBag, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchService, ProductResult, CategoryResult, getLocalizedName } from "@/services/search.service";

const CATEGORIES = ["All", "Apps", "Media", "Shopping", "Info", "Tools", "Finance"] as const;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query     = searchParams.get("q") || "";
  const queryEn   = searchParams.get("qEn") || "";   // original English (BN-mode search)
  const activeCat = searchParams.get("cat") || "All";
  const { t, language } = useLanguage();

  // ── Live MongoDB product results ──────────────────────────────────────────
  const [products,   setProducts]   = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [totalProducts, setTotal]   = useState(0);
  const [prodLoading, setProdLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setProducts([]); setCategories([]); setTotal(0); return; }
    setProdLoading(true);
    searchService.search(query, 1, 12, queryEn || undefined)
      .then(r => { setProducts(r.products); setCategories(r.categories); setTotal(r.total); })
      .catch(() => { setProducts([]); setCategories([]); setTotal(0); })
      .finally(() => setProdLoading(false));
  }, [query, queryEn]);

  // Display language: site language controls result language regardless of query script
  // Site language controls result display — query language does NOT matter
  const displayBn = language === "BN";

  // Pass language to static portal search
  const allResults = useMemo(() => searchSite(query, language), [query, language]);
  const results = useMemo(
    () => (activeCat === "All" ? allResults : allResults.filter((r) => r.category === activeCat)),
    [allResults, activeCat]
  );

  const setCat = (cat: string) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "All") next.delete("cat");
    else next.set("cat", cat);
    setSearchParams(next);
  };

  const availableCats = new Set(allResults.map((r) => r.category));

  // Helpers for portal service results
  const getTitle    = (entry: SearchEntry) => displayBn ? entry.titleBn    : entry.title;
  const getDesc     = (entry: SearchEntry) => displayBn ? entry.descriptionBn : entry.description;
  const getCatLabel = (cat: string)        => displayBn ? (CATEGORY_BN[cat] ?? cat) : cat;

  const ResultLink = ({ result, children, className }: { result: SearchEntry; children: React.ReactNode; className?: string }) =>
    result.external ? (
      <a href={result.path} className={className}>{children}</a>
    ) : (
      <Link to={result.path} className={className}>{children}</Link>
    );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-0">
          <SearchBar initialQuery={query} />

          <div className="flex items-center gap-6 mt-4 overflow-x-auto scrollbar-hide">
            {CATEGORIES.filter((c) => c === "All" || availableCats.has(c)).map((tab) => (
              <button
                key={tab}
                onClick={() => setCat(tab)}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCat === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {getCatLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* ── LIVE PRODUCT RESULTS (MongoDB) ── */}
          {query.trim() && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  {displayBn ? 'পণ্য' : 'Products'}
                  {!prodLoading && totalProducts > 0 && (
                    <span className="text-xs text-muted-foreground font-normal">
                      ({totalProducts} {displayBn ? 'টি পাওয়া গেছে' : 'found'})
                    </span>
                  )}
                </h2>
                {totalProducts > 12 && (
                  <a
                    href={`/shopping/?search=${encodeURIComponent(query)}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    {displayBn ? 'সব দেখুন' : 'View all'} <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Loading skeleton */}
              {prodLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="h-36 bg-secondary shimmer" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Product grid */}
              {!prodLoading && products.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map(p => {
                    const displayName = getLocalizedName(p, language);
                    const catName = p.categoryId ? getLocalizedName(p.categoryId, language) : '';
                    return (
                      <a
                        key={p._id}
                        href={`/shopping/product/${p.slug}`}
                        className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-sm transition-all"
                      >
                        <div className="relative h-36 bg-secondary overflow-hidden">
                          {p.thumbnail
                            ? <img src={p.thumbnail} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ShoppingBag className="w-8 h-8 opacity-30" /></div>
                          }
                          {p.salePrice && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {Math.round((1 - p.salePrice / p.regularPrice) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-xs text-muted-foreground truncate mb-0.5">{catName}</p>
                          <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug mb-1">{displayName}</p>
                          <div className="flex items-center gap-1 flex-wrap">
                            {p.salePrice
                              ? <>
                                  <span className="text-primary font-bold text-sm">৳{p.salePrice}</span>
                                  <span className="line-through text-muted-foreground text-xs">৳{p.regularPrice}</span>
                                </>
                              : <span className="font-bold text-sm">৳{p.regularPrice}</span>
                            }
                          </div>
                          {p.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{p.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Category matches */}
              {!prodLoading && categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {categories.map(c => (
                    <a
                      key={c._id}
                      href={`/shopping/?category=${c.slug}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
                    >
                      {c.icon && <span>{c.icon}</span>}
                      {getLocalizedName(c, language)}
                    </a>
                  ))}
                </div>
              )}

              {/* No products found */}
              {!prodLoading && products.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">
                  {displayBn
                    ? `"${query}" এর জন্য কোনো পণ্য পাওয়া যায়নি`
                    : `No products found for "${query}"`
                  }
                </p>
              )}
            </section>
          )}

          {/* ── PORTAL SERVICES (static index) ── */}
          <section>
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {t("searchResultsFor")} <span className="text-primary">"{query}"</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? t("result") : t("results")} {t("onSholok")}
            </p>
          </div>

          {/* No query */}
          {!query.trim() && (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>{t("typeToSearch")}</p>
            </div>
          )}

          {/* No results */}
          {query.trim() && results.length === 0 && (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-1">{t("noMatchesFor")} "{query}"</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t("tryDifferentKeyword")}
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                {SEARCH_INDEX.slice(0, 8).map((s) => (
                  <ResultLink
                    key={s.path}
                    result={s}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                  >
                    {getTitle(s)}
                  </ResultLink>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="space-y-5">
            {results.map((result) => (
              <ResultLink
                key={result.path}
                result={result}
                className="block group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">sholok{result.path}</span>
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                    {getCatLabel(result.category)}
                  </span>
                  {result.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                </div>
                <h3 className="text-xl text-primary font-medium group-hover:underline mb-1 flex items-center gap-2">
                  {getTitle(result)}
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{getDesc(result)}</p>
                <div className="mt-3 text-xs font-medium text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                  {t("open")} {getTitle(result)} <ArrowRight className="w-3 h-3" />
                </div>
              </ResultLink>
            ))}
          </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {results.length > 0 && (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold mb-2">{t("topResult")}</h3>
              <ResultLink result={results[0]} className="block group">
                <p className="text-lg font-medium text-primary group-hover:underline">{getTitle(results[0])}</p>
                <p className="text-sm text-muted-foreground mt-1">{getDesc(results[0])}</p>
              </ResultLink>
            </div>
          )}

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-semibold mb-4">{t("exploreSholok")}</h3>
            <div className="flex flex-wrap gap-2">
              {SEARCH_INDEX.slice(0, 10).map((s) => (
                <ResultLink
                  key={s.path}
                  result={s}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-secondary/80 transition-colors"
                >
                  {getTitle(s)}
                </ResultLink>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
