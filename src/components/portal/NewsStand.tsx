import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Newspaper, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  newsService, NewsCategory, NewsArticle,
  getCategoryColor, formatRelativeTime,
} from "@/services/news.service";

const BRAND_PURPLE = "#5D0096";

// ── Safe time formatter ──────────────────────────────────────────────────────
function safeTime(isoStr: string, language: string): string {
  if (!isoStr) return "";
  const ms = new Date(isoStr).getTime();
  if (isNaN(ms)) return "";
  return formatRelativeTime(isoStr, language);
}

// ── ArticleImage ─────────────────────────────────────────────────────────────
function ArticleImg({
  article,
  className = "w-full h-full object-cover",
  hover = true,
}: {
  article: NewsArticle;
  className?: string;
  hover?: boolean;
}) {
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
      className={`${className}${hover ? " group-hover:scale-105 transition-transform duration-300" : ""}`}
      onError={() => setErr(true)}
    />
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function FeaturedSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/9] rounded-xl bg-secondary mb-4" />
      <div className="h-3 bg-secondary rounded w-20 mb-2.5" />
      <div className="h-5 bg-secondary rounded w-full mb-1.5" />
      <div className="h-5 bg-secondary rounded w-4/5 mb-3" />
      <div className="h-3 bg-secondary rounded w-28" />
    </div>
  );
}

function SideItemSkeleton() {
  return (
    <div className="flex gap-3 py-3 border-b border-border animate-pulse last:border-0">
      <div className="w-20 h-16 rounded-lg bg-secondary flex-shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3.5 bg-secondary rounded w-full" />
        <div className="h-3.5 bg-secondary rounded w-4/5" />
        <div className="h-2.5 bg-secondary rounded w-24 mt-1" />
      </div>
    </div>
  );
}

// ── Featured Article ──────────────────────────────────────────────────────────
function FeaturedArticle({ article, language }: { article: NewsArticle; language: string }) {
  const title   = language === "BN" ? article.title_bn   : article.title_en;
  const summary = language === "BN" ? article.summary_bn : article.summary_en;
  const href    = newsService.articleUrl(article.slug);
  const catColor = getCategoryColor(article.category_slug);
  const time    = safeTime(article.publish_at, language);

  return (
    <a href={href} className="group block">
      {/* Image */}
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-secondary mb-3">
        <ArticleImg article={article} />
        {article.is_breaking === 1 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded leading-tight z-10">
            LIVE
          </span>
        )}
      </div>

      {/* Category badge */}
      <span
        className="inline-block text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded mb-2"
        style={{ color: catColor, backgroundColor: catColor + "15" }}
      >
        {article.category_name}
      </span>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
        {title}
      </h3>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {summary}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {article.author_name && (
          <span className="font-medium truncate max-w-[140px]">{article.author_name}</span>
        )}
        {article.author_name && time && <span>·</span>}
        {time && (
          <span className="flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        )}
      </div>
    </a>
  );
}

// ── Side list item ───────────────────────────────────────────────────────────
function SideNewsItem({ article, language }: { article: NewsArticle; language: string }) {
  const title = language === "BN" ? article.title_bn : article.title_en;
  const href  = newsService.articleUrl(article.slug);
  const time  = safeTime(article.publish_at, language);

  return (
    <a
      href={href}
      className="group flex gap-3 py-3 border-b border-border last:border-0 hover:bg-secondary/30 px-1.5 -mx-1.5 rounded-lg transition-colors"
    >
      {/* Thumbnail */}
      <div className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-secondary relative">
        <ArticleImg article={article} />
        {article.is_breaking === 1 && (
          <span className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded leading-none">
            LIVE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1.5">
          {title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {article.author_name && (
            <span className="truncate max-w-[100px] font-medium">{article.author_name}</span>
          )}
          {article.author_name && time && <span className="flex-shrink-0">·</span>}
          {time && <span className="flex-shrink-0">{time}</span>}
        </div>
      </div>
    </a>
  );
}

// ── Category Tabs ─────────────────────────────────────────────────────────────
function CategoryTabs({
  categories, active, onSelect, language,
}: {
  categories: NewsCategory[];
  active: string;
  onSelect: (slug: string) => void;
  language: string;
}) {
  const bn = language === "BN";
  const tabCls = (isActive: boolean) =>
    `px-3 sm:px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0 -mb-px ${
      isActive
        ? "text-primary border-primary"
        : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
    }`;

  return (
    <div className="flex items-center overflow-x-auto border-b border-border mb-5"
      style={{ scrollbarWidth: "none" }}
    >
      <button type="button" onClick={() => onSelect("")} className={tabCls(active === "")}>
        {bn ? "সর্বশেষ" : "Latest"}
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={tabCls(active === cat.slug)}
        >
          {bn ? cat.name_bn : cat.name_en}
        </button>
      ))}
    </div>
  );
}

// ── Main NewsStand ─────────────────────────────────────────────────────────────
const NewsStand = () => {
  const { language } = useLanguage();
  const bn = language === "BN";

  const [categories,    setCategories]  = useState<NewsCategory[]>([]);
  const [activeCategory, setActive]     = useState("");
  const [articles,      setArticles]    = useState<NewsArticle[]>([]);
  const [loading,       setLoading]     = useState(true);
  const [catLoading,    setCatLoading]  = useState(true);
  const [error,         setError]       = useState(false);
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

  // Fetch articles when category changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    newsService.getNews({ category: activeCategory || undefined, page: 1, limit: 5 })
      .then(data => {
        if (!mounted.current) return;
        setArticles(data.articles);
      })
      .catch(() => { if (mounted.current) setError(true); })
      .finally(() => { if (mounted.current) setLoading(false); });
  }, [activeCategory]);

  const handleCategory = useCallback((slug: string) => {
    setActive(slug);
    setArticles([]);
  }, []);

  const featured  = articles[0] ?? null;
  const sideList  = articles.slice(1, 5);

  return (
    <section id="newsstand-section" className="w-full border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-6">

        {/* ── Section header ── */}
        <div className="flex items-start sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight leading-tight">
              {bn ? "আজকের গুরুত্বপূর্ণ খবর" : "Today's Highlights"}
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground border border-border rounded px-1.5 py-0.5 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {bn ? "সরাসরি খবর" : "Live news"}
            </span>
          </div>
          <a
            href="/news/"
            className="flex items-center gap-1 text-sm font-semibold flex-shrink-0 hover:underline"
            style={{ color: BRAND_PURPLE }}
          >
            {bn ? "সব খবর দেখুন" : "View all news"}
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* ── Category Tabs ── */}
        {!catLoading && categories.length > 0 && (
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onSelect={handleCategory}
            language={language}
          />
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex flex-col items-center py-10 text-muted-foreground text-sm gap-2">
            <AlertCircle className="w-8 h-8 opacity-40" />
            <p>{bn ? "সংবাদ লোড করা যায়নি।" : "Could not load news."}</p>
            <button
              type="button"
              onClick={() => { setError(false); setLoading(true); setArticles([]); setActive(activeCategory); }}
              className="text-xs font-semibold hover:underline"
              style={{ color: BRAND_PURPLE }}
            >
              {bn ? "আবার চেষ্টা করুন" : "Try again"}
            </button>
          </div>
        )}

        {/* ── Main layout ── */}
        {!error && (
          <>
            {/* Mobile: featured → list (single column) */}
            <div className="md:hidden space-y-4">
              {loading ? (
                <>
                  <FeaturedSkeleton />
                  <div className="border-t border-border pt-4">
                    {Array.from({ length: 4 }).map((_, i) => <SideItemSkeleton key={i} />)}
                  </div>
                </>
              ) : (
                <>
                  {featured && <FeaturedArticle article={featured} language={language} />}
                  {sideList.length > 0 && (
                    <div className="border-t border-border pt-3">
                      {sideList.map(a => <SideNewsItem key={a.id} article={a} language={language} />)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Desktop: left featured (3/5) + right list (2/5) */}
            <div className="hidden md:grid md:grid-cols-5 gap-6">
              {/* Left column – featured */}
              <div className="col-span-3">
                {loading
                  ? <FeaturedSkeleton />
                  : featured
                    ? <FeaturedArticle article={featured} language={language} />
                    : null
                }
              </div>

              {/* Right column – side list */}
              <div className="col-span-2 border-l border-border pl-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SideItemSkeleton key={i} />)
                  : sideList.map(a => <SideNewsItem key={a.id} article={a} language={language} />)
                }
              </div>
            </div>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && articles.length === 0 && (
          <div className="flex flex-col items-center py-10 text-muted-foreground text-sm gap-2">
            <Newspaper className="w-8 h-8 opacity-30" />
            <p>{bn ? "এই বিভাগে কোনো সংবাদ নেই।" : "No news in this category."}</p>
          </div>
        )}

        {/* ── Bottom link ── */}
        {!loading && !error && articles.length > 0 && (
          <div className="mt-5 pt-4 border-t border-border flex justify-end">
            <a
              href="/news/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              style={{ color: BRAND_PURPLE }}
            >
              <Newspaper className="w-4 h-4" />
              {bn ? "শোলোক নিউজ ওয়েবসাইট" : "Sholok News Website"}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsStand;
