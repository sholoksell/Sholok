import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/portal/Header";
import { searchSite, SEARCH_INDEX, SearchEntry, CATEGORY_BN } from "@/lib/searchIndex";
import {
  Search, ArrowRight, ExternalLink, Compass, ShoppingBag, Star,
  Briefcase, MapPin, Clock, Building2, FileText, ChevronRight,
  Loader2, TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  universalSearchService,
  ProductResult, JobResult, BlogPost,
  getLocalizedName,
} from "@/services/universalSearch.service";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { key: "all",        emoji: "🔍", en: "All",          bn: "সব" },
  { key: "products",   emoji: "🛍️", en: "Shopping",     bn: "কেনাকাটা" },
  { key: "jobs",       emoji: "💼", en: "Jobs",          bn: "চাকরি" },
  { key: "blog",       emoji: "✍️", en: "Blog",          bn: "ব্লগ" },
  { key: "news",       emoji: "📰", en: "News",          bn: "নিউজ",       href: "/news" },
  { key: "video",      emoji: "🎬", en: "Video",         bn: "ভিডিও",      href: "/tv" },
  { key: "community",  emoji: "💬", en: "Community",     bn: "কমিউনিটি",   href: "/cafe" },
  { key: "maps",       emoji: "🗺️", en: "Maps",          bn: "ম্যাপ",       href: "/maps" },
  { key: "realestate", emoji: "🏠", en: "Real Estate",   bn: "রিয়েল এস্টেট", href: "/realestate" },
  { key: "smartstore", emoji: "🏪", en: "Smart Store",   bn: "স্মার্ট স্টোর", href: "/smartstore" },
  { key: "finance",    emoji: "📈", en: "Finance",       bn: "ফাইন্যান্স",  href: "/finance" },
  { key: "weather",    emoji: "🌦️", en: "Weather",       bn: "আবহাওয়া",    href: "/weather" },
  { key: "sports",     emoji: "⚽", en: "Sports",        bn: "স্পোর্টস",    href: "/sports" },
  { key: "music",      emoji: "🎵", en: "Music",         bn: "মিউজিক",      href: "/music" },
  { key: "books",      emoji: "📚", en: "Books",         bn: "বই ও সিরিজ", href: "/series" },
  { key: "dictionary", emoji: "📖", en: "Dictionary",    bn: "ডিকশনারি",   href: "/dictionary" },
  { key: "translate",  emoji: "🌍", en: "Translate",     bn: "অনুবাদ",      href: "/translate" },
  { key: "qna",        emoji: "❓", en: "Q&A",           bn: "প্রশ্ন-উত্তর", href: "/qna" },
  { key: "trending",   emoji: "📊", en: "Trending",      bn: "ট্রেন্ডিং" },
] as const;

type TabKey = typeof TABS[number]["key"];

// ─── Small reusable pieces ────────────────────────────────────────────────────
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
    {children}
  </span>
);

const SectionHeader = ({ emoji, title, total, href, btnLabel }: {
  emoji: string; title: string; total?: number; href?: string; btnLabel?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-base flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      {title}
      {total != null && total > 0 && (
        <span className="text-xs text-muted-foreground font-normal">({total})</span>
      )}
    </h2>
    {href && total != null && total > 0 && (
      <a href={href} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
        {btnLabel ?? "সব দেখুন"} <ChevronRight className="w-3 h-3" />
      </a>
    )}
  </div>
);

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-secondary rounded ${className ?? ""}`} />
);

// ─── Product card ─────────────────────────────────────────────────────────────
const ProductCard = ({ p, lang }: { p: ProductResult; lang: "EN" | "BN" }) => {
  const name = getLocalizedName(p, lang);
  const cat  = p.categoryId ? getLocalizedName(p.categoryId, lang) : "";
  const disc = p.salePrice ? Math.round((1 - p.salePrice / p.regularPrice) * 100) : 0;
  return (
    <a
      href={`/shopping/product/${p.slug}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="relative h-36 bg-secondary overflow-hidden">
        {p.thumbnail
          ? <img src={p.thumbnail} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted-foreground/30" /></div>
        }
        {disc > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{disc}%
          </span>
        )}
      </div>
      <div className="p-3">
        {cat && <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{cat}</p>}
        <p className="text-sm font-medium line-clamp-2 leading-snug mb-2">{name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-primary font-bold text-sm">৳{p.salePrice ?? p.regularPrice}</span>
          {p.salePrice && <span className="line-through text-muted-foreground text-xs">৳{p.regularPrice}</span>}
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
};

// ─── Job card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, lang }: { job: JobResult; lang: "EN" | "BN" }) => {
  const title = (lang === "BN" && job.titleBn) ? job.titleBn : job.title;
  const salary = job.salaryMin && job.salaryMax
    ? `৳${job.salaryMin.toLocaleString()} – ৳${job.salaryMax.toLocaleString()}`
    : job.salary ?? "";
  return (
    <a
      href={`/job-portal/jobs/${job._id}`}
      className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
        {job.companyLogo
          ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" />
          : <Building2 className="w-6 h-6 text-muted-foreground/40" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {job.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />{job.location}
            </span>
          )}
          {job.jobType && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />{job.jobType}
            </span>
          )}
          {salary && (
            <span className="text-xs text-primary font-medium">{salary}</span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center transition-colors" />
    </a>
  );
};

// ─── Blog card ────────────────────────────────────────────────────────────────
const BlogCard = ({ post, lang }: { post: BlogPost; lang: "EN" | "BN" }) => {
  const title   = (lang === "BN" && post.titleBn) ? post.titleBn : post.title;
  const excerpt = (lang === "BN" && post.excerptBn) ? post.excerptBn : (post.excerpt ?? "");
  const thumb   = post.coverImage?.thumbnail ?? post.coverImage?.url;
  return (
    <a
      href={`/blog/post/${post.slug}`}
      className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      {thumb && (
        <div className="w-20 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
          <img src={thumb} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2 leading-snug">{title}</h3>
        {excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{excerpt}</p>}
        <div className="flex items-center gap-2 mt-2">
          {post.author?.displayName && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />{post.author.displayName}
            </span>
          )}
          {post.category && <Badge>{post.category}</Badge>}
        </div>
      </div>
    </a>
  );
};

// ─── Portal service result card ───────────────────────────────────────────────
const PortalCard = ({
  result, lang,
}: {
  result: SearchEntry; lang: "EN" | "BN";
}) => {
  const title = lang === "BN" ? result.titleBn : result.title;
  const desc  = lang === "BN" ? result.descriptionBn : result.description;
  const Wrapper = result.external
    ? ({ children, className }: any) => <a href={result.path} className={className}>{children}</a>
    : ({ children, className }: any) => <Link to={result.path} className={className}>{children}</Link>;
  return (
    <Wrapper className="group block p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs text-muted-foreground">sholok{result.path}</span>
        <Badge>{lang === "BN" ? (CATEGORY_BN[result.category] ?? result.category) : result.category}</Badge>
        {result.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
      </div>
      <h3 className="text-lg text-primary font-semibold group-hover:underline mb-1">{title}</h3>
      <p className="text-sm text-foreground/75 leading-relaxed">{desc}</p>
      <span className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
        {lang === "BN" ? "খুলুন" : "Open"} {title} <ArrowRight className="w-3 h-3" />
      </span>
    </Wrapper>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, lang, portalResults }: { query: string; lang: "EN" | "BN"; portalResults: SearchEntry[] }) => (
  <div className="text-center py-12">
    <Compass className="w-12 h-12 mx-auto mb-4 opacity-30 text-muted-foreground" />
    <h3 className="text-lg font-semibold mb-1">
      {lang === "BN" ? `"${query}" এর জন্য কোনো ফলাফল নেই` : `No results for "${query}"`}
    </h3>
    <p className="text-sm text-muted-foreground mb-6">
      {lang === "BN" ? "ভিন্ন কীওয়ার্ড চেষ্টা করুন" : "Try a different keyword"}
    </p>
    <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
      {SEARCH_INDEX.slice(0, 8).map((s) => {
        const label = lang === "BN" ? s.titleBn : s.title;
        return s.external
          ? <a key={s.path} href={s.path} className="px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80">{label}</a>
          : <Link key={s.path} to={s.path} className="px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-secondary/80">{label}</Link>;
      })}
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query    = searchParams.get("q") ?? "";
  const queryEn  = searchParams.get("qEn") ?? "";
  const activeTab = (searchParams.get("type") ?? "all") as TabKey;
  const { language } = useLanguage();
  const lang = language as "EN" | "BN";
  const displayBn = lang === "BN";

  // Universal results
  const [results, setResults]   = useState({ products: [], categories: [], jobs: [], blogPosts: [], totalProducts: 0, totalJobs: 0, totalBlogPosts: 0, errors: {} } as Awaited<ReturnType<typeof universalSearchService.search>>);
  const [loading, setLoading]   = useState(false);

  // Full-page results for specific tabs
  const [moreJobs,   setMoreJobs]   = useState<JobResult[]>([]);
  const [moreBlog,   setMoreBlog]   = useState<BlogPost[]>([]);
  const [moreProd,   setMoreProd]   = useState<ProductResult[]>([]);
  const [moreLoading, setMoreLoading] = useState(false);
  const [moreTotal, setMoreTotal]   = useState(0);

  // Static portal search
  const portalResults = useMemo(() => searchSite(query, language), [query, language]);

  // All-tab: fetch from all services
  useEffect(() => {
    if (!query.trim()) { setResults(r => ({ ...r, products: [], jobs: [], blogPosts: [], totalProducts: 0, totalJobs: 0, totalBlogPosts: 0 })); return; }
    setLoading(true);
    universalSearchService.search(query, 6)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  // Specific tabs: fetch full data
  useEffect(() => {
    if (!query.trim() || activeTab === "all" || activeTab === "trending") return;
    setMoreLoading(true);
    setMoreJobs([]); setMoreBlog([]); setMoreProd([]);

    if (activeTab === "jobs") {
      universalSearchService.searchJobs(query, 1, 12)
        .then(r => { setMoreJobs(r.jobs); setMoreTotal(r.total); })
        .finally(() => setMoreLoading(false));
    } else if (activeTab === "blog") {
      universalSearchService.searchBlog(query, 1, 12)
        .then(r => { setMoreBlog(r.posts); setMoreTotal(r.total); })
        .finally(() => setMoreLoading(false));
    } else if (activeTab === "products") {
      universalSearchService.searchProducts(query, 1, 12)
        .then(r => { setMoreProd(r.products); setMoreTotal(r.total); })
        .finally(() => setMoreLoading(false));
    } else {
      setMoreLoading(false);
    }
  }, [query, activeTab]);

  const handleTab = useCallback((tab: typeof TABS[number]) => {
    if ("href" in tab && tab.href) {
      const sep = tab.href.includes("?") ? "&" : "?";
      window.location.href = `${tab.href}${sep}q=${encodeURIComponent(query)}`;
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (tab.key === "all") next.delete("type"); else next.set("type", tab.key);
    setSearchParams(next);
  }, [query, searchParams, setSearchParams]);

  const noResults = !loading && !moreLoading && query.trim()
    && results.products.length === 0 && results.jobs.length === 0
    && results.blogPosts.length === 0 && portalResults.length === 0;

  const LoaderRow = () => (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Tabs ── */}
      <div className="border-b border-border bg-card/80 backdrop-blur sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1.5">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const label = displayBn ? tab.bn : tab.en;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTab(tab as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left / Main column ── */}
        <div className="lg:col-span-2 space-y-10">

          {/* No query */}
          {!query.trim() && activeTab !== "trending" && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg">{displayBn ? "উপরে সার্চ করুন" : "Type something to search"}</p>
              <p className="text-sm mt-1 opacity-60">{displayBn ? "পণ্য, চাকরি, ব্লগ সব এক জায়গায়" : "Products, jobs, blog posts — all in one place"}</p>
            </div>
          )}

          {/* ── TRENDING ── */}
          {activeTab === "trending" && (
            <section>
              <SectionHeader emoji="📊" title={displayBn ? "ট্রেন্ডিং বিষয়" : "Trending Topics"} />
              <div className="flex flex-wrap gap-2">
                {SEARCH_INDEX.map((s) => {
                  const label = displayBn ? s.titleBn : s.title;
                  return s.external
                    ? <a key={s.path} href={`${s.path}?q=${encodeURIComponent(label)}`} className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-all"><TrendingUp className="w-3 h-3" />{label}</a>
                    : <Link key={s.path} to={`/search?q=${encodeURIComponent(label)}`} className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-all"><TrendingUp className="w-3 h-3" />{label}</Link>;
                })}
              </div>
            </section>
          )}

          {/* ── ALL TAB ── */}
          {activeTab === "all" && query.trim() && (
            <>
              {loading && <LoaderRow />}

              {/* Products */}
              {!loading && (results.products.length > 0 || results.categories.length > 0) && (
                <section>
                  <SectionHeader emoji="🛍️" title={displayBn ? "পণ্য" : "Products"} total={results.totalProducts}
                    href={`/shopping/?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "সব পণ্য" : "All products"} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.products.map(p => <ProductCard key={p._id} p={p} lang={lang} />)}
                  </div>
                  {results.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {results.categories.map(c => (
                        <a key={c._id} href={`/shopping/?category=${c.slug}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full text-sm transition-colors">
                          {c.icon && <span>{c.icon}</span>}{getLocalizedName(c, lang)}
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Jobs */}
              {!loading && results.jobs.length > 0 && (
                <section>
                  <SectionHeader emoji="💼" title={displayBn ? "চাকরি" : "Jobs"} total={results.totalJobs}
                    href={`/job-portal/?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "সব চাকরি" : "All jobs"} />
                  <div className="space-y-3">
                    {results.jobs.map(j => <JobCard key={j._id} job={j} lang={lang} />)}
                  </div>
                </section>
              )}

              {/* Blog Posts */}
              {!loading && results.blogPosts.length > 0 && (
                <section>
                  <SectionHeader emoji="✍️" title={displayBn ? "ব্লগ পোস্ট" : "Blog Posts"} total={results.totalBlogPosts}
                    href={`/blog?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "সব পোস্ট" : "All posts"} />
                  <div className="space-y-3">
                    {results.blogPosts.map(p => <BlogCard key={p._id} post={p} lang={lang} />)}
                  </div>
                </section>
              )}

              {/* Portal services */}
              {!loading && portalResults.length > 0 && (
                <section>
                  <SectionHeader emoji="🔍" title={displayBn ? "শোলক সার্ভিস" : "Sholok Services"} />
                  <div className="space-y-4">
                    {portalResults.map(r => <PortalCard key={r.path} result={r} lang={lang} />)}
                  </div>
                </section>
              )}

              {noResults && <EmptyState query={query} lang={lang} portalResults={portalResults} />}
            </>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === "products" && query.trim() && (
            <section>
              <SectionHeader emoji="🛍️" title={displayBn ? "পণ্য" : "Products"} total={moreTotal}
                href={`/shopping/?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "Shopping এ দেখুন" : "View in Shopping"} />
              {moreLoading && <LoaderRow />}
              {!moreLoading && moreProd.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {moreProd.map(p => <ProductCard key={p._id} p={p} lang={lang} />)}
                </div>
              )}
              {!moreLoading && moreProd.length === 0 && (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  {displayBn ? `"${query}" এর জন্য কোনো পণ্য পাওয়া যায়নি` : `No products found for "${query}"`}
                </p>
              )}
            </section>
          )}

          {/* ── JOBS TAB ── */}
          {activeTab === "jobs" && query.trim() && (
            <section>
              <SectionHeader emoji="💼" title={displayBn ? "চাকরি" : "Jobs"} total={moreTotal}
                href={`/job-portal/?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "Job Portal এ দেখুন" : "View in Job Portal"} />
              {moreLoading && <LoaderRow />}
              {!moreLoading && moreJobs.length > 0 && (
                <div className="space-y-3">
                  {moreJobs.map(j => <JobCard key={j._id} job={j} lang={lang} />)}
                </div>
              )}
              {!moreLoading && moreJobs.length === 0 && (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  {displayBn ? `"${query}" এর জন্য কোনো চাকরি পাওয়া যায়নি` : `No jobs found for "${query}"`}
                </p>
              )}
            </section>
          )}

          {/* ── BLOG TAB ── */}
          {activeTab === "blog" && query.trim() && (
            <section>
              <SectionHeader emoji="✍️" title={displayBn ? "ব্লগ পোস্ট" : "Blog Posts"} total={moreTotal}
                href={`/blog?search=${encodeURIComponent(query)}`} btnLabel={displayBn ? "Blog এ দেখুন" : "View in Blog"} />
              {moreLoading && <LoaderRow />}
              {!moreLoading && moreBlog.length > 0 && (
                <div className="space-y-3">
                  {moreBlog.map(p => <BlogCard key={p._id} post={p} lang={lang} />)}
                </div>
              )}
              {!moreLoading && moreBlog.length === 0 && (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  {displayBn ? `"${query}" এর জন্য কোনো ব্লগ পোস্ট পাওয়া যায়নি` : `No blog posts found for "${query}"`}
                </p>
              )}
            </section>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="hidden lg:flex flex-col gap-6">

          {/* Top result */}
          {portalResults.length > 0 && activeTab === "all" && query.trim() && (
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
                {displayBn ? "সেরা ফলাফল" : "Top Result"}
              </p>
              {(() => {
                const r = portalResults[0];
                const title = displayBn ? r.titleBn : r.title;
                const desc  = displayBn ? r.descriptionBn : r.description;
                return r.external
                  ? <a href={r.path} className="group block"><p className="text-base font-semibold text-primary group-hover:underline">{title}</p><p className="text-sm text-muted-foreground mt-1">{desc}</p></a>
                  : <Link to={r.path} className="group block"><p className="text-base font-semibold text-primary group-hover:underline">{title}</p><p className="text-sm text-muted-foreground mt-1">{desc}</p></Link>;
              })()}
            </div>
          )}

          {/* Quick stats */}
          {query.trim() && !loading && (results.totalProducts > 0 || results.totalJobs > 0 || results.totalBlogPosts > 0) && (
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
                {displayBn ? "সার্চ সংখ্যা" : "Results summary"}
              </p>
              <div className="space-y-2">
                {results.totalProducts > 0 && (
                  <button onClick={() => handleTab(TABS.find(t => t.key === "products")!)} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary text-sm transition-colors">
                    <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-primary" />{displayBn ? "পণ্য" : "Products"}</span>
                    <span className="font-bold text-primary">{results.totalProducts}</span>
                  </button>
                )}
                {results.totalJobs > 0 && (
                  <button onClick={() => handleTab(TABS.find(t => t.key === "jobs")!)} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary text-sm transition-colors">
                    <span className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" />{displayBn ? "চাকরি" : "Jobs"}</span>
                    <span className="font-bold text-primary">{results.totalJobs}</span>
                  </button>
                )}
                {results.totalBlogPosts > 0 && (
                  <button onClick={() => handleTab(TABS.find(t => t.key === "blog")!)} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary text-sm transition-colors">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{displayBn ? "ব্লগ পোস্ট" : "Blog Posts"}</span>
                    <span className="font-bold text-primary">{results.totalBlogPosts}</span>
                  </button>
                )}
                {portalResults.length > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><Search className="w-4 h-4" />{displayBn ? "সার্ভিস" : "Services"}</span>
                    <span className="font-bold text-muted-foreground">{portalResults.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Explore Sholok */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
              {displayBn ? "শোলক অন্বেষণ করুন" : "Explore Sholok"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_INDEX.slice(0, 12).map((s) => {
                const label = displayBn ? s.titleBn : s.title;
                return s.external
                  ? <a key={s.path} href={s.path} className="px-2.5 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-xs transition-all">{label}</a>
                  : <Link key={s.path} to={s.path} className="px-2.5 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-xs transition-all">{label}</Link>;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
