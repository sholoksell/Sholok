import { useState, useEffect } from "react";
import { FileText, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BlogPost {
  id: number;
  title: string;
  titleBn?: string;
  titleEn?: string;
  title_bn?: string;
  title_en?: string;
  slug: string;
  featuredImage?: string | null;
  featured_image?: string | null;
  publishedAt?: string;
  published_at?: string;
  createdAt?: string;
  created_at?: string;
  category?: { name_en?: string; name_bn?: string; nameEn?: string; nameBn?: string };
  category_name_en?: string;
  category_name_bn?: string;
}

const BLOG_BASE = "https://blog.sholok.com";
const API_PATHS = [
  "/api/posts?limit=6&status=published",
  "/api/posts?limit=6",
];

function timeAgo(dateStr: string | null | undefined, isBn: boolean): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const diff = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diff < 1) return isBn ? "এইমাত্র" : "Just now";
  if (diff < 60) return isBn ? `${diff} মিনিট আগে` : `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return isBn ? `${h} ঘণ্টা আগে` : `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return isBn ? "গতকাল" : "Yesterday";
  if (days < 7) return isBn ? `${days} দিন আগে` : `${days}d ago`;
  return date.toLocaleDateString(isBn ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function fetchPosts(): Promise<BlogPost[]> {
  for (const path of API_PATHS) {
    try {
      const r = await fetch(`${BLOG_BASE}${path}`);
      if (!r.ok) continue;
      const data = await r.json();
      const arr: BlogPost[] = Array.isArray(data)
        ? data
        : (data.posts ?? data.data ?? data.articles ?? []);
      if (arr.length > 0) return arr.slice(0, 6);
    } catch {}
  }
  throw new Error("unavailable");
}

const BlogSection = () => {
  const { language } = useLanguage();
  const isBn = language === "BN";
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFailed(false);
    fetchPosts()
      .then(setPosts)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">
            {isBn ? "ব্লগ" : "Blog"}
          </h2>
        </div>
        <a
          href={BLOG_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          {isBn ? "আরও দেখুন" : "View all"}{" "}
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      <div className="p-4">
        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-16 h-14 bg-secondary rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-secondary rounded w-3/4" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                  <div className="h-2.5 bg-secondary rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / CORS fallback */}
        {failed && !loading && (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <AlertCircle className="w-4 h-4" />
              {isBn ? "ব্লগ লোড করা যায়নি" : "Could not load blog posts"}
            </div>
            <a
              href={BLOG_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-primary-foreground transition-colors"
              style={{ backgroundColor: "#5D0096" }}
            >
              {isBn ? "ব্লগ পরিদর্শন করুন" : "Visit Blog"}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Posts list */}
        {!loading && !failed && posts.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            {isBn ? "কোনো পোস্ট পাওয়া যায়নি" : "No posts available"}
          </div>
        )}

        {!loading && !failed && posts.length > 0 && (
          <div className="space-y-1">
            {posts.map((post, i) => {
              const title = isBn
                ? post.titleBn || post.title_bn || post.title
                : post.titleEn || post.title_en || post.title;
              const catName = isBn
                ? post.category?.nameBn || post.category?.name_bn || post.category_name_bn || post.category_name_en || ""
                : post.category?.nameEn || post.category?.name_en || post.category_name_en || "";
              const dateStr = post.publishedAt || post.published_at || post.createdAt || post.created_at;
              const img = post.featuredImage || post.featured_image;
              const href = `${BLOG_BASE}/${post.slug}`;

              return (
                <a
                  key={post.id ?? i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  {img ? (
                    <img
                      src={img.startsWith("http") ? img : `${BLOG_BASE}${img}`}
                      alt={title}
                      className="w-16 h-14 object-cover rounded-lg flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-14 bg-secondary rounded-lg flex-shrink-0 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {catName && (
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-0.5 block">
                        {catName}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo(dateStr, isBn)}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
