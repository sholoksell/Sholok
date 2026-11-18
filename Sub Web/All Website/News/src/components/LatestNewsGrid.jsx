import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchLatest, fetchNews } from '../utils/api';
import { useInView } from '../hooks/useInView';

function timeAgo(dateStr, isBn) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1) return isBn ? 'এইমাত্র' : 'Just now';
  if (diff < 60) return isBn ? `${diff} মিনিট আগে` : `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return isBn ? `${h} ঘণ্টা আগে` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return isBn ? `${d} দিন আগে` : `${d}d ago`;
}

function NewsCard({ article, isBn, t, large, delay }) {
  const [ref, inView] = useInView(0.08);
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;
  const excerpt = isBn && article.excerpt_bn ? article.excerpt_bn : article.excerpt_en;

  if (large) {
    return (
      <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
        <Link to={`/article/${article.slug}`} className="card-news block rounded-2xl overflow-hidden group bg-white dark:bg-surface-dark">
          {article.image_url && (
            <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={article.image_url} alt={title} className="w-full h-full object-cover img-hover-zoom" />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-category text-xs">{article.category_name}</span>
              <span className={`text-gray-400 text-xs ${isBn ? 'font-bangla' : ''}`}>{timeAgo(article.published_at, isBn)}</span>
            </div>
            <h3 className={`font-editorial font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla text-lg' : 'text-xl'}`}>
              {title}
            </h3>
            {excerpt && (
              <p className={`text-sm text-gray-500 dark:text-gray-400 line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>{excerpt}</p>
            )}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      <Link to={`/article/${article.slug}`} className="card-news flex gap-3 p-3 rounded-xl group">
        {article.image_url && (
          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <img src={article.image_url} alt={title} className="w-full h-full object-cover img-hover-zoom" />
          </div>
        )}
        <div className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="badge-category text-[10px]">{article.category_name}</span>
          </div>
          <h3 className={`text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-3 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla' : ''}`}>
            {title}
          </h3>
          <span className={`text-[11px] text-gray-400 mt-1.5 block ${isBn ? 'font-bangla' : ''}`}>
            {timeAgo(article.published_at, isBn)}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function LatestNewsGrid({ sidebarSlot } = {}) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    fetchLatest(LIMIT).then(data => {
      const arr = Array.isArray(data) ? data : (data?.articles || []);
      setArticles(arr);
      setHasMore(arr.length === LIMIT);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchNews({ page: nextPage, limit: LIMIT });
      const arr = Array.isArray(data) ? data : (data?.articles || []);
      setArticles(prev => [...prev, ...arr]);
      setPage(nextPage);
      setHasMore(arr.length === LIMIT);
    } catch { setHasMore(false); }
    finally { setLoadingMore(false); }
  };

  if (loading) return (
    <section className="container-news py-8">
      <div className="skeleton h-6 w-32 rounded mb-6" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />)}
      </div>
    </section>
  );

  if (!articles.length) return null;

  const featured = articles.slice(0, 3);
  const list = articles.slice(3);

  const content = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`section-title text-xl font-bold ${isBn ? 'font-bangla' : 'font-editorial'}`}>{t('sections.latest')}</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {featured.map((a, i) => (
          <NewsCard key={a.id} article={a} isBn={isBn} t={t} large delay={i * 80} />
        ))}
      </div>

      {list.length > 0 && (
        <div className="grid md:grid-cols-2 gap-1 mt-2">
          {list.map((a, i) => (
            <NewsCard key={a.id} article={a} isBn={isBn} t={t} delay={i * 50} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className={`inline-flex items-center gap-2 px-6 py-2.5 border-2 border-primary-800 text-primary-800 dark:border-primary-400 dark:text-primary-400 rounded-full font-semibold text-sm hover:bg-primary-800 hover:text-white dark:hover:bg-primary-800 transition-colors disabled:opacity-50 ${isBn ? 'font-bangla' : ''}`}
          >
            {loadingMore && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {t('common.loadMore')}
          </button>
        </div>
      )}
    </>
  );

  if (sidebarSlot) {
    return (
      <section className="container-news py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">{content}</div>
          <div className="lg:col-span-1">{sidebarSlot}</div>
        </div>
      </section>
    );
  }

  return <section className="container-news py-8">{content}</section>;
}
