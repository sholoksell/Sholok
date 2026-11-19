import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, ExternalLink, Clock, Eye,
  Zap, Newspaper, RefreshCw, ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  newsService, NewsCategory, NewsArticle,
  getCategoryColor, formatRelativeTime,
} from "@/services/news.service";

// ── Helpers ─────────────────────────────────────────────────────────────────

const ARTICLES_PER_PAGE = 12;

function ArticleImage({ article }: { article: NewsArticle }) {
  const src = newsService.getImageUrl(article.featured_image);
  const color = getCategoryColor(article.category_slug);
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-white/90 font-bold text-xs select-none"
        style={{ background: `linear-gradient(135deg, ${color}cc, ${color})` }}
      >
        {article.category_name?.slice(0, 2).toUpperCase() ?? "NW"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      onError={() => setErr(true)}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 py-3 border-b border-border animate-pulse last:border-0">
      <div className="w-20 h-16 rounded-lg bg-secondary flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2.5 bg-secondary rounded w-1/3" />
        <div className="h-3 bg-secondary rounded w-full" />
        <div className="h-3 bg-secondary rounded w-4/5" />
        <div className="h-2 bg-secondary rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}

function NewsCard({ article, language }: { article: NewsArticle; language: string }) {
  const title   = language === "BN" ? article.title_bn   : article.title_en;
  const summary = language === "BN" ? article.summary_bn : article.summary_en;
  const href    = newsService.articleUrl(article.slug);
  const catColor = getCategoryColor(article.category_slug);
  const time    = formatRelativeTime(article.publish_at, language);

  return (
    <a
      href={href}
      className="group flex gap-3 py-3 border-b border-border last:border-0 hover:bg-secondary/30 px-2 -mx-2 rounded-lg transition-colors cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary relative">
        <ArticleImage article={article} />
        {article.is_breaking === 1 && (
          <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded leading-none">
            LIVE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ color: catColor, backgroundColor: catColor + "15" }}
          >
            {article.category_name}
          </span>
          {article.is_featured === 1 && (
            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">★</span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h4>

        {summary && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{summary}</p>
        )}

        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>{time}</span>
          {article.view_count > 0 && (
            <>
              <Eye className="w-3 h-3 flex-shrink-0 ml-0.5" />
              <span>{article.view_count}</span>
            </>
          )}
          {article.author_name && (
            <span className="ml-auto truncate max-w-[80px] hidden sm:block">{article.author_name}</span>
          )}
        </div>
      </div>
    </a>
  );
}

// ── Breaking ticker ──────────────────────────────────────────────────────────

function BreakingTicker({ articles, language }: { articles: NewsArticle[]; language: string }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (articles.length <= 1 || paused || prefersReduced.current) return;
    const id = setInterval(() => setIdx(i => (i + 1) % articles.length), 5000);
    return () => clearInterval(id);
  }, [articles.length, paused]);

  if (!articles.length) return null;
  const cur = articles[idx];
  const title = language === "BN" ? cur.title_bn : cur.title_en;

  return (
    <div
      className="flex items-center gap-2 bg-red-600/10 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex items-center gap-1 flex-shrink-0">
        <Zap className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest whitespace-nowrap">
          {language === "BN" ? "ব্রেকিং" : "Breaking"}
        </span>
      </div>
      <div className="w-px h-3.5 bg-red-300 dark:bg-red-700 flex-shrink-0" />
      <a
        href={newsService.articleUrl(cur.slug)}
        className="flex-1 min-w-0 text-sm font-medium text-foreground hover:text-primary truncate transition-colors"
      >
        {title}
      </a>
      {articles.length > 1 && (
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIdx(i => (i - 1 + articles.length) % articles.length)}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-3 h-3 text-muted-foreground" />
          </button>
          <span className="text-[10px] text-muted-foreground font-mono">{idx + 1}/{articles.length}</span>
          <button
            type="button"
            onClick={() => setIdx(i => (i + 1) % articles.length)}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Category nav ─────────────────────────────────────────────────────────────

function CategoryNav({
  categories, active, onSelect, language,
}: {
  categories: NewsCategory[];
  active: string;
  onSelect: (slug: string) => void;
  language: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const allLabel = language === "BN" ? "সর্বশেষ" : "Latest";

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5 scroll-smooth"
      style={{ scrollbarWidth: "none" }}
    >
      {/* "All" / Latest tab */}
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
          active === ""
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        {allLabel}
      </button>

      {categories.map(cat => {
        const label = language === "BN" ? cat.name_bn : cat.name_en;
        const isActive = active === cat.slug;
        const color = getCategoryColor(cat.slug);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.slug)}
            className={`whitespace-nowrap flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            style={isActive ? { backgroundColor: color } : {}}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onPage, language,
}: {
  page: number; totalPages: number; onPage: (p: number) => void; language: string;
}) {
  if (totalPages <= 1) return null;
  const bn = language === "BN";
  return (
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {bn ? "আগের" : "Prev"}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {bn ? `পাতা ${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
        </span>
        <a
          href="/news/"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {bn ? "আরও সংবাদ" : "More News"}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {bn ? "পরের" : "Next"}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main NewsStand ────────────────────────────────────────────────────────────

const NewsStand = () => {
  const { language } = useLanguage();
  const bn = language === "BN";

  const [categories, setCategories]     = useState<NewsCategory[]>([]);
  const [activeCategory, setActive]     = useState("");
  const [articles, setArticles]         = useState<NewsArticle[]>([]);
  const [breaking, setBreaking]         = useState<NewsArticle[]>([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [catLoading, setCatLoading]     = useState(true);
  const [error, setError]               = useState(false);
  const [refreshKey, setRefreshKey]     = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Fetch categories once
  useEffect(() => {
    setCatLoading(true);
    newsService.getCategories()
      .then(data => { if (mounted.current) setCategories(data); })
      .catch(() => {})
      .finally(() => { if (mounted.current) setCatLoading(false); });
  }, []);

  // Fetch breaking news
  useEffect(() => {
    newsService.getBreaking()
      .then(data => { if (mounted.current) setBreaking(data); })
      .catch(() => {});
  }, [refreshKey]);

  // Fetch articles when category / page / refreshKey changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    newsService.getNews({ category: activeCategory || undefined, page, limit: ARTICLES_PER_PAGE })
      .then(data => {
        if (!mounted.current) return;
        setArticles(data.articles);
        setTotal(data.total);
      })
      .catch(() => { if (mounted.current) setError(true); })
      .finally(() => { if (mounted.current) setLoading(false); });
  }, [activeCategory, page, refreshKey]);

  const handleCategory = useCallback((slug: string) => {
    setActive(slug);
    setPage(1);
    setArticles([]);
  }, []);

  const handlePage = useCallback((p: number) => {
    setPage(p);
    setArticles([]);
    // Scroll to top of newsstand
    document.getElementById("newsstand-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const totalPages = Math.ceil(total / ARTICLES_PER_PAGE);

  // Split into two columns
  const left  = articles.filter((_, i) => i % 2 === 0);
  const right = articles.filter((_, i) => i % 2 === 1);

  return (
    <section id="newsstand-section" className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-5">

        {/* ── Section header ── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Newspaper className="w-5 h-5 text-primary flex-shrink-0" />
            <h2 className="text-base font-black text-foreground tracking-tight">
              {bn ? "শোলোক নিউজস্ট্যান্ড" : "Sholok Newsstand"}
            </h2>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {bn ? "সরাসরি" : "Live"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setRefreshKey(k => k + 1); }}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title={bn ? "রিফ্রেশ" : "Refresh"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <a
              href="/news/"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              {bn ? "সব সংবাদ" : "All News"}
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* ── Category nav ── */}
        {!catLoading && categories.length > 0 && (
          <div className="mb-3">
            <CategoryNav
              categories={categories}
              active={activeCategory}
              onSelect={handleCategory}
              language={language}
            />
          </div>
        )}

        {/* ── Breaking ticker ── */}
        {breaking.length > 0 && (
          <div className="mb-3">
            <BreakingTicker articles={breaking} language={language} />
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{bn ? "সংবাদ লোড করা যায়নি।" : "Could not load news."}</p>
            <button
              type="button"
              onClick={() => setRefreshKey(k => k + 1)}
              className="mt-2 text-primary hover:underline text-xs"
            >
              {bn ? "আবার চেষ্টা করুন" : "Try again"}
            </button>
          </div>
        )}

        {/* ── Main news grid ── */}
        {!error && (
          <>
            {/* Mobile: single sequential column */}
            <div className="md:hidden">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : articles.map(a => <NewsCard key={a.id} article={a} language={language} />)
              }
            </div>

            {/* Desktop: two balanced columns */}
            <div className="hidden md:grid md:grid-cols-2 gap-x-6 gap-y-0">
              <div className="border-r border-border pr-6">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : left.map(a => <NewsCard key={a.id} article={a} language={language} />)
                }
              </div>
              <div className="pl-6">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i + 6} />)
                  : right.map(a => <NewsCard key={a.id} article={a} language={language} />)
                }
              </div>
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Newspaper className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>{bn ? "এই বিভাগে কোনো সংবাদ নেই।" : "No news in this category."}</p>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && !error && articles.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={handlePage}
            language={language}
          />
        )}

        {/* ── Bottom link ── */}
        <div className="mt-4 text-center">
          <a
            href="/news/"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Newspaper className="w-4 h-4" />
            {bn ? "শোলোক নিউজ ওয়েবসাইট" : "Sholok News Website"}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default NewsStand;
