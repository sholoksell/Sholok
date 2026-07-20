import { useMemo, useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/portal/Header";
import { searchSite, SEARCH_INDEX, SearchEntry, CATEGORY_BN } from "@/lib/searchIndex";
import { Search, ArrowRight, ExternalLink, Compass, ShoppingBag, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { searchService, ProductResult, CategoryResult, getLocalizedName } from "@/services/search.service";

// Search type tabs — each has an emoji, EN label, BN label, and where it routes
const SEARCH_TYPES = [
  { key: "all",        emoji: "🔍", en: "All",         bn: "সব",           route: null },
  { key: "web",        emoji: "🌐", en: "Web",         bn: "ওয়েব",         route: null },
  { key: "news",       emoji: "📰", en: "News",        bn: "নিউজ",         route: "/news" },
  { key: "image",      emoji: "🖼️", en: "Images",      bn: "ছবি",          route: null },
  { key: "video",      emoji: "🎬", en: "Video",       bn: "ভিডিও",        route: "/tv" },
  { key: "blog",       emoji: "✍️", en: "Blog",        bn: "ব্লগ",          route: "/blog" },
  { key: "cafe",       emoji: "💬", en: "Community",   bn: "কমিউনিটি",     route: "/cafe" },
  { key: "qna",        emoji: "❓", en: "Q&A",         bn: "প্রশ্ন-উত্তর", route: "/qna" },
  { key: "shopping",   emoji: "🛍️", en: "Shopping",    bn: "কেনাকাটা",     route: "/shopping/" },
  { key: "smartstore", emoji: "🏪", en: "Smart Store", bn: "স্মার্ট স্টোর", route: "/smartstore" },
  { key: "map",        emoji: "🗺️", en: "Maps",        bn: "ম্যাপ",         route: "/maps" },
  { key: "realestate", emoji: "🏠", en: "Real Estate", bn: "রিয়েল এস্টেট", route: "/realestate" },
  { key: "jobs",       emoji: "💼", en: "Jobs",        bn: "চাকরি",         route: "/job-portal/" },
  { key: "finance",    emoji: "📈", en: "Finance",     bn: "ফাইন্যান্স",    route: "/finance" },
  { key: "weather",    emoji: "🌦️", en: "Weather",     bn: "আবহাওয়া",      route: "/weather" },
  { key: "sports",     emoji: "⚽", en: "Sports",      bn: "স্পোর্টস",      route: "/sports" },
  { key: "music",      emoji: "🎵", en: "Music",       bn: "মিউজিক",        route: "/music" },
  { key: "books",      emoji: "📚", en: "Books",       bn: "বই ও সিরিজ",   route: "/series" },
  { key: "dictionary", emoji: "📖", en: "Dictionary",  bn: "ডিকশনারি",     route: "/dictionary" },
  { key: "translate",  emoji: "🌍", en: "Translate",   bn: "অনুবাদ",        route: "/translate" },
  { key: "trending",   emoji: "📊", en: "Trending",    bn: "ট্রেন্ডিং",     route: null },
] as const;

type SearchTypeKey = typeof SEARCH_TYPES[number]["key"];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query    = searchParams.get("q") || "";
  const queryEn  = searchParams.get("qEn") || "";
  const activeTab = (searchParams.get("type") || "all") as SearchTypeKey;
  const { t, language } = useLanguage();
  const displayBn = language === "BN";

  // ── Live MongoDB product results ─────────────────────────────────────────
  const [products,   setProducts]   = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [totalProducts, setTotal]   = useState(0);
  const [prodLoading, setProdLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setProducts([]); setCategories([]); setTotal(0); return; }
    setProdLoading(true);
    searchService.search(query, 1, 12, queryEn || undefined)
      .then(r => { setProducts(r?.products ?? []); setCategories(r?.categories ?? []); setTotal(r?.total ?? 0); })
      .catch(() => { setProducts([]); setCategories([]); setTotal(0); })
      .finally(() => setProdLoading(false));
  }, [query, queryEn]);

  // ── Static portal index results ──────────────────────────────────────────
  const allResults = useMemo(() => searchSite(query, language), [query, language]);
  const results    = useMemo(() => allResults, [allResults]);

  const getTitle    = (entry: SearchEntry) => displayBn ? entry.titleBn        : entry.title;
  const getDesc     = (entry: SearchEntry) => displayBn ? entry.descriptionBn  : entry.description;

  const ResultLink = ({ result, children, className }: { result: SearchEntry; children: React.ReactNode; className?: string }) =>
    result.external
      ? <a href={result.path} className={className}>{children}</a>
      : <Link to={result.path} className={className}>{children}</Link>;

  const handleTabClick = (tab: typeof SEARCH_TYPES[number]) => {
    if (tab.route && query.trim()) {
      // Navigate to the sub-app with search query
      const sep = tab.route.includes("?") ? "&" : "?";
      const searchParam = tab.key === "jobs" ? "q" : "q";
      window.location.href = `${tab.route}${sep}${searchParam}=${encodeURIComponent(query)}`;
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (tab.key === "all") next.delete("type");
    else next.set("type", tab.key);
    setSearchParams(next);
  };

  const tabLabel = (tab: typeof SEARCH_TYPES[number]) => displayBn ? tab.bn : tab.en;

  // For "trending" tab — show popular search suggestions
  const showTrending = activeTab === "trending";
  // For "image" tab — show image placeholder message
  const showImage = activeTab === "image";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Search Type Tabs ── */}
      <div className="border-b border-border bg-card shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
            {SEARCH_TYPES.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                  <span>{tabLabel(tab)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* ── TRENDING TAB ── */}
          {showTrending && (
            <section>
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span>📊</span> {displayBn ? "ট্রেন্ডিং সার্চ" : "Trending Searches"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {SEARCH_INDEX.slice(0, 12).map((s) => (
                  <Link
                    key={s.path}
                    to={`/search?q=${encodeURIComponent(displayBn ? s.titleBn : s.title)}`}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors"
                  >
                    <span className="text-primary">🔥</span>
                    {displayBn ? s.titleBn : s.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── IMAGE TAB ── */}
          {showImage && (
            <section className="text-center py-16">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-lg font-semibold mb-2">{displayBn ? "ছবি সার্চ শীঘ্রই আসছে" : "Image Search Coming Soon"}</h3>
              <p className="text-muted-foreground text-sm">{displayBn ? "এই ফিচারটি近近 যোগ করা হবে।" : "This feature will be added soon."}</p>
            </section>
          )}

          {/* ── PRODUCT RESULTS (MongoDB) ── */}
          {!showTrending && !showImage && query.trim() && (
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

              {prodLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                      <div className="h-36 bg-secondary" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

              {!prodLoading && products.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">
                  {displayBn ? `"${query}" এর জন্য কোনো পণ্য পাওয়া যায়নি` : `No products found for "${query}"`}
                </p>
              )}
            </section>
          )}

          {/* ── PORTAL SERVICES (static index) ── */}
          {!showTrending && !showImage && (
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-1">
                  {query.trim()
                    ? <>{displayBn ? "অনুসন্ধান ফলাফল" : "Results for"} <span className="text-primary">"{query}"</span></>
                    : <>{displayBn ? "সার্চ করুন" : "Start searching"}</>
                  }
                </h2>
                {query.trim() && (
                  <p className="text-sm text-muted-foreground">
                    {results.length} {results.length === 1 ? (displayBn ? "ফলাফল" : "result") : (displayBn ? "ফলাফল" : "results")} {displayBn ? "পাওয়া গেছে" : "on Sholok"}
                  </p>
                )}
              </div>

              {!query.trim() && (
                <div className="text-center py-16 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>{displayBn ? "উপরে সার্চ করুন" : "Type something to search"}</p>
                </div>
              )}

              {query.trim() && results.length === 0 && (
                <div className="text-center py-12">
                  <Compass className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-1">{displayBn ? `"${query}" এর জন্য কোনো ফলাফল নেই` : `No matches for "${query}"`}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{displayBn ? "ভিন্ন কীওয়ার্ড চেষ্টা করুন" : "Try a different keyword"}</p>
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
                        {displayBn ? (CATEGORY_BN[result.category] ?? result.category) : result.category}
                      </span>
                      {result.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <h3 className="text-xl text-primary font-medium group-hover:underline mb-1">
                      {getTitle(result)}
                    </h3>
                    <p className="text-sm text-foreground/80 leading-relaxed">{getDesc(result)}</p>
                    <div className="mt-3 text-xs font-medium text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                      {displayBn ? "খুলুন" : "Open"} {getTitle(result)} <ArrowRight className="w-3 h-3" />
                    </div>
                  </ResultLink>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden lg:block space-y-6">
          {results.length > 0 && !showTrending && !showImage && (
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h3 className="font-semibold mb-2">{displayBn ? "সেরা ফলাফল" : "Top Result"}</h3>
              <ResultLink result={results[0]} className="block group">
                <p className="text-lg font-medium text-primary group-hover:underline">{getTitle(results[0])}</p>
                <p className="text-sm text-muted-foreground mt-1">{getDesc(results[0])}</p>
              </ResultLink>
            </div>
          )}

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-semibold mb-4">{displayBn ? "শোলক অন্বেষণ করুন" : "Explore Sholok"}</h3>
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

          {/* Search type quick links */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="font-semibold mb-4">{displayBn ? "সার্চ ধরন" : "Search Types"}</h3>
            <div className="space-y-1">
              {SEARCH_TYPES.filter(t => t.key !== "all").map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary transition-colors text-left"
                >
                  <span className="text-base">{tab.emoji}</span>
                  <span className="text-muted-foreground">{tabLabel(tab)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
