import { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/portal/Header";
import { searchSite, SEARCH_INDEX, SearchEntry, CATEGORY_BN } from "@/lib/searchIndex";
import {
  Search, ArrowRight, ExternalLink, Compass, ShoppingBag, Star,
  Briefcase, MapPin, Clock, Building2, FileText, ChevronRight,
  Loader2, TrendingUp, Play, Store, Eye,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  universalSearchService,
  ProductResult, JobResult, BlogPost, VideoResult,
  StoreResult, MultivendorProduct,
  getLocalizedName, formatDuration, getProductPrice,
} from "@/services/universalSearch.service";

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",        emoji: "🔍", en: "All",           bn: "সব",            searchable: true },
  { key: "products",   emoji: "🛍️", en: "Shopping",      bn: "কেনাকাটা",      searchable: true },
  { key: "smartstore", emoji: "🏪", en: "Smart Store",   bn: "স্মার্ট স্টোর",  searchable: true },
  { key: "jobs",       emoji: "💼", en: "Jobs",           bn: "চাকরি",          searchable: true },
  { key: "blog",       emoji: "✍️", en: "Blog",           bn: "ব্লগ",           searchable: true },
  { key: "video",      emoji: "🎬", en: "Video",          bn: "ভিডিও",          searchable: true },
  { key: "news",       emoji: "📰", en: "News",           bn: "নিউজ",           searchable: false, href: "/news" },
  { key: "music",      emoji: "🎵", en: "Music",          bn: "মিউজিক",         searchable: false, href: "/music" },
  { key: "books",      emoji: "📚", en: "Books/Series",   bn: "বই ও সিরিজ",    searchable: false, href: "/series" },
  { key: "webtoon",    emoji: "🎨", en: "Webtoon",        bn: "ওয়েবটুন",        searchable: false, href: "/webtoon" },
  { key: "sports",     emoji: "⚽", en: "Sports",         bn: "স্পোর্টস",       searchable: false, href: "/sports" },
  { key: "community",  emoji: "☕", en: "Cafe/Community", bn: "ক্যাফে",          searchable: false, href: "/cafe" },
  { key: "maps",       emoji: "🗺️", en: "Maps",           bn: "ম্যাপ",           searchable: false, href: "/maps" },
  { key: "realestate", emoji: "🏠", en: "Real Estate",    bn: "রিয়েল এস্টেট",  searchable: false, href: "/realestate" },
  { key: "finance",    emoji: "📈", en: "Finance",        bn: "ফাইন্যান্স",     searchable: false, href: "/finance" },
  { key: "qna",        emoji: "❓", en: "Q&A",            bn: "প্রশ্ন-উত্তর",   searchable: false, href: "/qna" },
  { key: "dictionary", emoji: "📖", en: "Dictionary",     bn: "ডিকশনারি",       searchable: false, href: "/dictionary" },
  { key: "translate",  emoji: "🌍", en: "Translate",      bn: "অনুবাদ",          searchable: false, href: "/translate" },
  { key: "mail",       emoji: "✉️", en: "Mail",           bn: "মেইল",           searchable: false, href: "/mail" },
  { key: "trending",   emoji: "📊", en: "Trending",       bn: "ট্রেন্ডিং",       searchable: true },
] as const;

type TabKey = typeof TABS[number]["key"];
type NavigateTab = Extract<typeof TABS[number], { href: string }>;
const NAVIGATE_SERVICES = TABS.filter((t): t is NavigateTab => "href" in t);

// ─── UI primitives ────────────────────────────────────────────────────────────
const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
    {children}
  </span>
);

const Loader = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="w-7 h-7 animate-spin text-primary" />
  </div>
);

const SectionHeader = ({ emoji, title, total, href, btnLabel }: {
  emoji: string; title: string; total?: number; href?: string; btnLabel?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-base flex items-center gap-2">
      <span className="text-xl">{emoji}</span> {title}
      {total != null && total > 0 && (
        <span className="text-xs text-muted-foreground font-normal ml-1">({total.toLocaleString()})</span>
      )}
    </h2>
    {href && total != null && total > 0 && (
      <a href={href} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
        {btnLabel ?? "সব দেখুন"} <ChevronRight className="w-3 h-3" />
      </a>
    )}
  </div>
);

// ─── Product card (Shopping) ──────────────────────────────────────────────────
const ProductCard = ({ p, lang }: { p: ProductResult; lang: "EN" | "BN" }) => {
  const name  = getLocalizedName({ name: p.name, nameBn: p.nameBn }, lang);
  const cat   = p.categoryId ? getLocalizedName(p.categoryId, lang) : "";
  const { display, original } = getProductPrice(p);
  const disc  = original ? Math.round((1 - display / original) * 100) : 0;
  return (
    <a href={`/shopping/product/${p.slug}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="relative h-36 bg-secondary overflow-hidden">
        {p.thumbnail
          ? <img src={p.thumbnail} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 opacity-20" /></div>}
        {disc > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{disc}%</span>}
      </div>
      <div className="p-3">
        {cat && <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{cat}</p>}
        <p className="text-sm font-medium line-clamp-2 leading-snug mb-2">{name}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm">৳{display.toLocaleString()}</span>
          {original && <span className="line-through text-muted-foreground text-xs">৳{original.toLocaleString()}</span>}
        </div>
        {(p.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{p.rating!.toFixed(1)}</span>
          </div>
        )}
      </div>
    </a>
  );
};

// ─── Smart Store product card ─────────────────────────────────────────────────
const MvProductCard = ({ p, lang }: { p: MultivendorProduct; lang: "EN" | "BN" }) => {
  const name = getLocalizedName({ name: p.name, nameBn: p.nameBn }, lang);
  const disc = (p.originalPrice && p.price < p.originalPrice)
    ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  const img  = p.images?.[0];
  return (
    <a href={p.store?.smartStore ? `/smart-store/store/${p.store.smartStore}` : "/smart-store"}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="relative h-36 bg-secondary overflow-hidden">
        {img
          ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><Store className="w-8 h-8 opacity-20" /></div>}
        {disc > 0 && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">-{disc}%</span>}
        {p.badge && <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{p.badge}</span>}
      </div>
      <div className="p-3">
        {p.categoryName && <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{p.categoryName}</p>}
        <p className="text-sm font-medium line-clamp-2 leading-snug mb-2">{name}</p>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm">৳{p.price.toLocaleString()}</span>
          {p.originalPrice && p.originalPrice > p.price && (
            <span className="line-through text-muted-foreground text-xs">৳{p.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {p.store?.name && <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1"><Store className="w-3 h-3" />{p.store.name}</p>}
      </div>
    </a>
  );
};

// ─── Job card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, lang }: { job: JobResult; lang: "EN" | "BN" }) => {
  const title  = (lang === "BN" && job.titleBn) ? job.titleBn : job.title;
  const salary = job.salaryMin && job.salaryMax
    ? `৳${job.salaryMin.toLocaleString()} – ৳${job.salaryMax.toLocaleString()}`
    : job.salary ?? "";
  return (
    <a href={`/job-portal/jobs/${job._id}`}
      className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 rounded-xl bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
        {job.companyLogo
          ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain p-1" />
          : <Building2 className="w-6 h-6 opacity-30" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          {job.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{job.location}</span>}
          {job.jobType  && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{job.jobType}</span>}
          {salary       && <span className="text-xs text-primary font-medium">{salary}</span>}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center transition-colors" />
    </a>
  );
};

// ─── Blog card ────────────────────────────────────────────────────────────────
const BlogCard = ({ post, lang }: { post: BlogPost; lang: "EN" | "BN" }) => {
  const title   = (lang === "BN" && post.titleBn)   ? post.titleBn   : post.title;
  const excerpt = (lang === "BN" && post.excerptBn) ? post.excerptBn : (post.excerpt ?? "");
  const thumb   = post.coverImage?.thumbnail ?? post.coverImage?.url;
  return (
    <a href={`/blog/post/${post.slug}`}
      className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200">
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
            <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" />{post.author.displayName}</span>
          )}
          {post.category && <Badge>{post.category}</Badge>}
        </div>
      </div>
    </a>
  );
};

// ─── Video card ───────────────────────────────────────────────────────────────
const VideoCard = ({ video, lang }: { video: VideoResult; lang: "EN" | "BN" }) => {
  const title = (lang === "BN" && (video.titleBn ?? video.titleEn))
    ? (video.titleBn ?? video.titleEn ?? video.title) : video.title;
  const dur = formatDuration(video.duration);
  return (
    <a href={`/tv/watch/${video._id}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="relative h-32 bg-secondary overflow-hidden">
        {video.thumbnailPath
          ? <img src={video.thumbnailPath} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><Play className="w-8 h-8 opacity-20" /></div>}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <Play className="w-8 h-8 text-white fill-white" />
        </div>
        {dur && <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">{dur}</span>}
        {video.isShort && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">Short</span>}
      </div>
      <div className="p-3">
        {video.channel?.name && <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{video.channel.name}</p>}
        <p className="text-sm font-medium line-clamp-2 leading-snug">{title}</p>
        {(video.views ?? 0) > 0 && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Eye className="w-3 h-3" />{video.views!.toLocaleString()} views
          </p>
        )}
      </div>
    </a>
  );
};

// ─── Store card ───────────────────────────────────────────────────────────────
const StoreCard = ({ store, lang }: { store: StoreResult; lang: "EN" | "BN" }) => {
  const name = getLocalizedName({ name: store.name, nameBn: store.nameBn, nameEn: store.nameEn }, lang);
  const desc = (lang === "BN" && store.descriptionBn) ? store.descriptionBn : (store.description ?? "");
  return (
    <a href={`/smart-store/store/${store.smartStore ?? store._id}`}
      className="group flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200">
      <div className="w-14 h-14 rounded-xl bg-secondary flex-shrink-0 overflow-hidden flex items-center justify-center">
        {store.logo
          ? <img src={store.logo} alt={name} className="w-full h-full object-contain p-1" />
          : <Store className="w-7 h-7 opacity-30" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{name}</h3>
        {store.category && <Badge>{store.category}</Badge>}
        {desc && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>}
        {(store.stats?.rating ?? 0) > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{store.stats!.rating!.toFixed(1)}</span>
            {store.stats?.totalProducts != null && (
              <span className="text-xs text-muted-foreground ml-2">{store.stats.totalProducts} পণ্য</span>
            )}
          </div>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 self-center transition-colors" />
    </a>
  );
};

// ─── Portal result card ───────────────────────────────────────────────────────
const PortalCard = ({ result, lang }: { result: SearchEntry; lang: "EN" | "BN" }) => {
  const title = lang === "BN" ? result.titleBn : result.title;
  const desc  = lang === "BN" ? result.descriptionBn : result.description;
  const cls   = "group block p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200";
  const inner = (
    <>
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
    </>
  );
  return result.external
    ? <a href={result.path} className={cls}>{inner}</a>
    : <Link to={result.path} className={cls}>{inner}</Link>;
};

// ─── Service routing card (frontend-only services) ────────────────────────────
const ServiceRouteCard = ({ tab, query, lang }: {
  tab: NavigateTab; query: string; lang: "EN" | "BN";
}) => {
  const label = lang === "BN" ? tab.bn : tab.en;
  return (
    <a href={`${tab.href}?q=${encodeURIComponent(query)}`}
      className="group flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
      <span className="text-2xl">{tab.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground truncate">
          {lang === "BN" ? `"${query}" সার্চ করুন` : `Search "${query}"`}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ query, lang }: { query: string; lang: "EN" | "BN" }) => (
  <div className="text-center py-12">
    <Compass className="w-12 h-12 mx-auto mb-4 opacity-25" />
    <h3 className="text-lg font-semibold mb-1">
      {lang === "BN" ? `"${query}" এর জন্য কোনো ফলাফল নেই` : `No results for "${query}"`}
    </h3>
    <p className="text-sm text-muted-foreground">{lang === "BN" ? "ভিন্ন কীওয়ার্ড চেষ্টা করুন" : "Try a different keyword"}</p>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query     = searchParams.get("q") ?? "";
  const activeTab = (searchParams.get("type") ?? "all") as TabKey;
  const { language } = useLanguage();
  const lang = language as "EN" | "BN";
  const bn   = lang === "BN";

  type AllResults = Awaited<ReturnType<typeof universalSearchService.search>>;
  const [results, setResults] = useState<AllResults>({
    products: [], categories: [], totalProducts: 0,
    jobs: [], totalJobs: 0,
    blogPosts: [], totalBlogPosts: 0,
    videos: [], totalVideos: 0,
    stores: [], multivendorProducts: [], totalStores: 0, totalMultivendorProducts: 0,
    errors: {},
  });
  const [loading, setLoading] = useState(false);

  interface MoreItems {
    jobs: JobResult[]; blog: BlogPost[]; products: ProductResult[];
    videos: VideoResult[]; stores: StoreResult[]; mvProducts: MultivendorProduct[];
  }
  const [more, setMore]             = useState<MoreItems>({ jobs: [], blog: [], products: [], videos: [], stores: [], mvProducts: [] });
  const [moreTotal, setMoreTotal]   = useState(0);
  const [moreLoading, setMoreLoading] = useState(false);

  const portalResults = useMemo(() => searchSite(query, language), [query, language]);

  // All-tab fetch
  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    universalSearchService.search(query, 5).then(setResults).finally(() => setLoading(false));
  }, [query]);

  // Per-tab fetch
  useEffect(() => {
    const tab = TABS.find(t => t.key === activeTab);
    if (!query.trim() || !tab || !("searchable" in tab && tab.searchable) || activeTab === "all" || activeTab === "trending") return;
    setMoreLoading(true);
    setMore({ jobs: [], blog: [], products: [], videos: [], stores: [], mvProducts: [] });

    const fetches: [string, Promise<any>][] = [];
    if (activeTab === "jobs")       fetches.push(["jobs",      universalSearchService.searchJobs(query, 1, 12)]);
    if (activeTab === "blog")       fetches.push(["blog",      universalSearchService.searchBlog(query, 1, 12)]);
    if (activeTab === "products")   fetches.push(["products",  universalSearchService.searchProducts(query, 1, 12)]);
    if (activeTab === "video")      fetches.push(["videos",    universalSearchService.searchVideos(query, 1, 12)]);
    if (activeTab === "smartstore") {
      fetches.push(["stores",     universalSearchService.searchStores(query, 1, 8)]);
      fetches.push(["mvProducts", universalSearchService.searchMultivendorProducts(query, 1, 12)]);
    }

    Promise.allSettled(fetches.map(([, p]) => p)).then(settled => {
      const out: MoreItems = { jobs: [], blog: [], products: [], videos: [], stores: [], mvProducts: [] };
      let total = 0;
      fetches.forEach(([k], i) => {
        const r = settled[i];
        if (r.status !== "fulfilled") return;
        const v = r.value;
        if (k === "jobs")       { out.jobs      = v.jobs     ?? []; total = v.total ?? 0; }
        if (k === "blog")       { out.blog      = v.posts    ?? []; total = v.total ?? 0; }
        if (k === "products")   { out.products  = v.products ?? []; total = v.total ?? 0; }
        if (k === "videos")     { out.videos    = v.videos   ?? []; total = v.total ?? 0; }
        if (k === "stores")     { out.stores    = v.stores   ?? []; }
        if (k === "mvProducts") { out.mvProducts = v.products ?? []; total += v.total ?? 0; }
      });
      setMore(out);
      setMoreTotal(total);
    }).finally(() => setMoreLoading(false));
  }, [query, activeTab]);

  const handleTab = useCallback((tab: typeof TABS[number]) => {
    if ("href" in tab) {
      const sep = tab.href.includes("?") ? "&" : "?";
      window.location.href = `${tab.href}${sep}q=${encodeURIComponent(query)}`;
      return;
    }
    const next = new URLSearchParams(searchParams);
    if (tab.key === "all") next.delete("type"); else next.set("type", tab.key);
    setSearchParams(next);
  }, [query, searchParams, setSearchParams]);

  const totalHits = results.totalProducts + results.totalJobs + results.totalBlogPosts
    + results.totalVideos + results.totalStores + results.totalMultivendorProducts;

  // ─── Render sections ────────────────────────────────────────────────────────
  const GridCards = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{children}</div>
  );

  const renderAllTab = () => {
    // Service cards render FIRST — immediately, no waiting for APIs
    return (
      <div className="space-y-10">

        {/* ── Loading strip (shown while APIs are fetching) ── */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-4 py-3 rounded-xl">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-primary" />
            <span>{bn ? `"${query}" সব সার্ভিসে খোঁজা হচ্ছে…` : `Searching "${query}" across all services…`}</span>
          </div>
        )}

        {/* ── API results (appear after loading) ── */}
        {!loading && results.products.length > 0 && (
          <section>
            <SectionHeader emoji="🛍️" title={bn ? "কেনাকাটা — পণ্য" : "Shopping Products"}
              total={results.totalProducts} href={`/shopping/?search=${encodeURIComponent(query)}`}
              btnLabel={bn ? "সব পণ্য" : "All products"} />
            <GridCards>{results.products.map(p => <ProductCard key={p._id} p={p} lang={lang} />)}</GridCards>
          </section>
        )}
        {!loading && results.multivendorProducts.length > 0 && (
          <section>
            <SectionHeader emoji="🏪" title={bn ? "স্মার্ট স্টোর পণ্য" : "Smart Store Products"}
              total={results.totalMultivendorProducts} href={`/smart-store?q=${encodeURIComponent(query)}`}
              btnLabel={bn ? "Smart Store এ দেখুন" : "View in Smart Store"} />
            <GridCards>{results.multivendorProducts.map(p => <MvProductCard key={p._id} p={p} lang={lang} />)}</GridCards>
          </section>
        )}
        {!loading && results.stores.length > 0 && (
          <section>
            <SectionHeader emoji="🏬" title={bn ? "স্টোর" : "Stores"}
              total={results.totalStores} href={`/smart-store?q=${encodeURIComponent(query)}`}
              btnLabel={bn ? "সব স্টোর" : "All stores"} />
            <div className="space-y-3">{results.stores.map(s => <StoreCard key={s._id} store={s} lang={lang} />)}</div>
          </section>
        )}
        {!loading && results.jobs.length > 0 && (
          <section>
            <SectionHeader emoji="💼" title={bn ? "চাকরি" : "Jobs"}
              total={results.totalJobs} href={`/job-portal/?search=${encodeURIComponent(query)}`}
              btnLabel={bn ? "সব চাকরি" : "All jobs"} />
            <div className="space-y-3">{results.jobs.map(j => <JobCard key={j._id} job={j} lang={lang} />)}</div>
          </section>
        )}
        {!loading && results.videos.length > 0 && (
          <section>
            <SectionHeader emoji="🎬" title={bn ? "ভিডিও" : "Videos"}
              total={results.totalVideos} href={`/tv?q=${encodeURIComponent(query)}`}
              btnLabel={bn ? "সব ভিডিও" : "All videos"} />
            <GridCards>{results.videos.map(v => <VideoCard key={v._id} video={v} lang={lang} />)}</GridCards>
          </section>
        )}
        {!loading && results.blogPosts.length > 0 && (
          <section>
            <SectionHeader emoji="✍️" title={bn ? "ব্লগ পোস্ট" : "Blog Posts"}
              total={results.totalBlogPosts} href={`/blog?search=${encodeURIComponent(query)}`}
              btnLabel={bn ? "সব পোস্ট" : "All posts"} />
            <div className="space-y-3">{results.blogPosts.map(p => <BlogCard key={p._id} post={p} lang={lang} />)}</div>
          </section>
        )}
        {!loading && portalResults.length > 0 && (
          <section>
            <SectionHeader emoji="🔍" title={bn ? "শোলক সার্ভিস" : "Sholok Services"} />
            <div className="space-y-4">{portalResults.map(r => <PortalCard key={r.path} result={r} lang={lang} />)}</div>
          </section>
        )}
        {!loading && totalHits === 0 && portalResults.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="font-medium">{bn ? `"${query}" — কোনো পণ্য, চাকরি বা পোস্ট পাওয়া যায়নি` : `No products, jobs or posts found for "${query}"`}</p>
            <p className="text-sm mt-1">{bn ? "নিচের সার্ভিসগুলো থেকে সার্চ করুন" : "Try one of the services below"}</p>
          </div>
        )}

        {/* ── Service routing — ALWAYS VISIBLE immediately ── */}
        <section>
          <SectionHeader emoji="🌐" title={bn ? "সার্ভিসে সরাসরি সার্চ করুন" : "Search directly in a service"} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAVIGATE_SERVICES.map(tab => <ServiceRouteCard key={tab.key} tab={tab} query={query} lang={lang} />)}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Tabs ── */}
      <div className="border-b border-border bg-card/80 backdrop-blur sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-1.5">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key;
              const label    = bn ? tab.bn : tab.en;
              const isNav    = "href" in tab;
              return (
                <button key={tab.key} onClick={() => handleTab(tab as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isNav
                        ? "text-muted-foreground/60 hover:text-foreground hover:bg-secondary/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }`}>
                  <span className="text-base leading-none">{tab.emoji}</span>
                  <span>{label}</span>
                  {isNav && <ExternalLink className="w-2.5 h-2.5 opacity-40" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left/Main ── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Empty query */}
          {!query.trim() && activeTab !== "trending" && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">{bn ? "উপরে সার্চ করুন" : "Type something to search"}</p>
              <p className="text-sm mt-1 opacity-60">{bn ? "পণ্য, চাকরি, ভিডিও, ব্লগ — সব এক জায়গায়" : "Products, jobs, videos, blog — all in one place"}</p>
            </div>
          )}

          {/* Trending */}
          {activeTab === "trending" && (
            <section>
              <SectionHeader emoji="📊" title={bn ? "ট্রেন্ডিং বিষয়" : "Trending Topics"} />
              <div className="flex flex-wrap gap-2">
                {SEARCH_INDEX.map(s => {
                  const label = bn ? s.titleBn : s.title;
                  return s.external
                    ? <a key={s.path} href={s.path} className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-all"><TrendingUp className="w-3 h-3" />{label}</a>
                    : <Link key={s.path} to={`/search?q=${encodeURIComponent(label)}`} className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-all"><TrendingUp className="w-3 h-3" />{label}</Link>;
                })}
              </div>
            </section>
          )}

          {/* All tab */}
          {query.trim() && activeTab === "all" && renderAllTab()}

          {/* Products tab */}
          {query.trim() && activeTab === "products" && (
            <section>
              <SectionHeader emoji="🛍️" title={bn ? "কেনাকাটা — পণ্য" : "Shopping Products"} total={moreTotal}
                href={`/shopping/?search=${encodeURIComponent(query)}`} btnLabel={bn ? "Shopping এ দেখুন" : "View in Shopping"} />
              {moreLoading ? <Loader /> : more.products.length > 0
                ? <GridCards>{more.products.map(p => <ProductCard key={p._id} p={p} lang={lang} />)}</GridCards>
                : <EmptyState query={query} lang={lang} />}
            </section>
          )}

          {/* Smart Store tab */}
          {query.trim() && activeTab === "smartstore" && (
            <div className="space-y-8">
              {moreLoading && <Loader />}
              {!moreLoading && more.stores.length > 0 && (
                <section>
                  <SectionHeader emoji="🏬" title={bn ? "স্টোর" : "Stores"} total={more.stores.length} />
                  <div className="space-y-3">{more.stores.map(s => <StoreCard key={s._id} store={s} lang={lang} />)}</div>
                </section>
              )}
              {!moreLoading && more.mvProducts.length > 0 && (
                <section>
                  <SectionHeader emoji="🏪" title={bn ? "স্মার্ট স্টোর পণ্য" : "Smart Store Products"} total={moreTotal} />
                  <GridCards>{more.mvProducts.map(p => <MvProductCard key={p._id} p={p} lang={lang} />)}</GridCards>
                </section>
              )}
              {!moreLoading && more.stores.length === 0 && more.mvProducts.length === 0 && <EmptyState query={query} lang={lang} />}
            </div>
          )}

          {/* Jobs tab */}
          {query.trim() && activeTab === "jobs" && (
            <section>
              <SectionHeader emoji="💼" title={bn ? "চাকরি" : "Jobs"} total={moreTotal}
                href={`/job-portal/?search=${encodeURIComponent(query)}`} btnLabel={bn ? "Job Portal এ দেখুন" : "View in Job Portal"} />
              {moreLoading ? <Loader /> : more.jobs.length > 0
                ? <div className="space-y-3">{more.jobs.map(j => <JobCard key={j._id} job={j} lang={lang} />)}</div>
                : <EmptyState query={query} lang={lang} />}
            </section>
          )}

          {/* Blog tab */}
          {query.trim() && activeTab === "blog" && (
            <section>
              <SectionHeader emoji="✍️" title={bn ? "ব্লগ পোস্ট" : "Blog Posts"} total={moreTotal}
                href={`/blog?search=${encodeURIComponent(query)}`} btnLabel={bn ? "Blog এ দেখুন" : "View in Blog"} />
              {moreLoading ? <Loader /> : more.blog.length > 0
                ? <div className="space-y-3">{more.blog.map(p => <BlogCard key={p._id} post={p} lang={lang} />)}</div>
                : <EmptyState query={query} lang={lang} />}
            </section>
          )}

          {/* Video tab */}
          {query.trim() && activeTab === "video" && (
            <section>
              <SectionHeader emoji="🎬" title={bn ? "ভিডিও" : "Videos"} total={moreTotal}
                href={`/tv?q=${encodeURIComponent(query)}`} btnLabel={bn ? "TV Platform এ দেখুন" : "View in TV Platform"} />
              {moreLoading ? <Loader /> : more.videos.length > 0
                ? <GridCards>{more.videos.map(v => <VideoCard key={v._id} video={v} lang={lang} />)}</GridCards>
                : <EmptyState query={query} lang={lang} />}
            </section>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden lg:flex flex-col gap-5">

          {/* Top portal result */}
          {portalResults.length > 0 && activeTab === "all" && query.trim() && (
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">{bn ? "সেরা ফলাফল" : "Top Result"}</p>
              {(() => {
                const r = portalResults[0];
                const title = bn ? r.titleBn : r.title;
                const desc  = bn ? r.descriptionBn : r.description;
                const cls   = "group block";
                const inner = <><p className="text-base font-semibold text-primary group-hover:underline">{title}</p><p className="text-sm text-muted-foreground mt-1">{desc}</p></>;
                return r.external
                  ? <a href={r.path} className={cls}>{inner}</a>
                  : <Link to={r.path} className={cls}>{inner}</Link>;
              })()}
            </div>
          )}

          {/* Result counts */}
          {query.trim() && !loading && totalHits > 0 && (
            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">{bn ? "ফলাফলের সংখ্যা" : "Result counts"}</p>
              <div className="space-y-1">
                {[
                  { key: "products",   emoji: "🛍️", label: bn ? "শপিং পণ্য" : "Shopping",       n: results.totalProducts },
                  { key: "smartstore", emoji: "🏪", label: bn ? "স্মার্ট স্টোর পণ্য" : "Smart Store", n: results.totalMultivendorProducts },
                  { key: "smartstore", emoji: "🏬", label: bn ? "স্টোর" : "Stores",               n: results.totalStores },
                  { key: "jobs",       emoji: "💼", label: bn ? "চাকরি" : "Jobs",                 n: results.totalJobs },
                  { key: "video",      emoji: "🎬", label: bn ? "ভিডিও" : "Videos",               n: results.totalVideos },
                  { key: "blog",       emoji: "✍️", label: bn ? "ব্লগ পোস্ট" : "Blog Posts",     n: results.totalBlogPosts },
                ].filter(r => r.n > 0).map((r, i) => (
                  <button key={i} onClick={() => {
                    const t = TABS.find(t => t.key === r.key);
                    if (t) handleTab(t as any);
                  }} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary text-sm transition-colors">
                    <span className="flex items-center gap-2">{r.emoji} {r.label}</span>
                    <span className="font-bold text-primary">{r.n.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All services */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">{bn ? "সব সার্ভিস" : "All Services"}</p>
            <div className="flex flex-wrap gap-1.5">
              {TABS.filter(t => t.key !== "all" && t.key !== "trending").map(t => {
                const label = bn ? t.bn : t.en;
                if ("href" in t) {
                  return <a key={t.key} href={t.href} className="flex items-center gap-1 px-2.5 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full text-xs transition-all">{t.emoji} {label}</a>;
                }
                return (
                  <button key={t.key} onClick={() => handleTab(t as any)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-primary hover:text-primary-foreground"}`}>
                    {t.emoji} {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchResults;
