import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchNews } from '../utils/api';
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

function ArticleCard({ article, isBn, t, index }) {
  const [ref, inView] = useInView(0.08);
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;
  const summary = isBn && article.summary_bn ? article.summary_bn : article.summary_en;
  const image = article.image_url || article.featured_image;

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: `${(index % 3) * 70}ms` }}>
      <Link to={`/article/${article.slug}`} className="card-news group block rounded-2xl overflow-hidden bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
        {image && (
          <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
            <img src={image} alt={title} className="w-full h-full object-cover img-hover-zoom" />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            {article.is_breaking && <span className="badge-breaking text-[10px]">{t('sections.breakingNews')}</span>}
            <span className={`text-gray-400 text-[11px] ${isBn ? 'font-bangla' : ''}`}>{timeAgo(article.published_at || article.publish_at || article.created_at, isBn)}</span>
          </div>
          <h2 className={`font-semibold text-gray-900 dark:text-white leading-snug line-clamp-3 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors flex-1 ${isBn ? 'font-bangla text-sm' : 'text-sm font-editorial'}`}>
            {title}
          </h2>
          {summary && (
            <p className={`text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 ${isBn ? 'font-bangla' : ''}`}>{summary}</p>
          )}
          {article.author_name && (
            <p className={`text-[11px] text-gray-400 mt-2 ${isBn ? 'font-bangla' : ''}`}>{article.author_name}</p>
          )}
        </div>
      </Link>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const limit = 12;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setArticles([]);
    fetchNews({ category: slug, page: 1, limit }).then(r => {
      const arr = Array.isArray(r) ? r : (r?.articles || []);
      setArticles(arr);
      setTotal(r?.total || arr.length);
      if (arr[0]?.category_name) setCategoryName(arr[0].category_name);
    }).catch(() => {}).finally(() => setLoading(false));
    setPage(1);
  }, [slug]);

  useEffect(() => {
    if (page === 1) return;
    setLoading(true);
    fetchNews({ category: slug, page, limit }).then(r => {
      const arr = Array.isArray(r) ? r : (r?.articles || []);
      setArticles(arr);
      setTotal(r?.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, slug]);

  const displayName = categoryName || t(`sections.${slug}`) || slug;
  const totalPages = Math.ceil(total / limit);
  const catBg = { background: 'linear-gradient(135deg, #5D0096 0%, #D31710 100%)' };

  return (
    <div>
      {/* Category Hero Banner */}
      <div className="relative overflow-hidden" style={{ ...catBg, minHeight: 140 }}>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="container-news relative py-10">
          <nav className={`flex items-center gap-1.5 text-sm text-white/70 mb-3 ${isBn ? 'font-bangla' : ''}`}>
            <Link to="/" className="hover:text-white transition-colors">{t('nav.home')}</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-white font-medium">{displayName}</span>
          </nav>
          <h1 className={`font-extrabold text-white text-3xl sm:text-4xl font-editorial ${isBn ? 'font-bangla' : ''}`}>
            {displayName}
          </h1>
          {total > 0 && (
            <p className={`text-white/60 text-sm mt-1 ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? `${total} টি সংবাদ` : `${total} articles`}
            </p>
          )}
        </div>
      </div>

      <section className="container-news py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <svg className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className={`text-gray-400 text-base ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? 'এই বিভাগে কোনো সংবাদ নেই' : 'No articles in this category yet'}
            </p>
            <Link to="/" className={`mt-4 inline-block text-sm font-medium text-primary-800 dark:text-primary-400 hover:underline ${isBn ? 'font-bangla' : ''}`}>
              ← {t('nav.home')}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article, i) => (
                <ArticleCard key={article.id} article={article} isBn={isBn} t={t} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-primary-800 hover:text-primary-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${p === page ? 'bg-primary-800 text-white' : 'border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary-800 hover:text-primary-800'}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 disabled:opacity-30 hover:border-primary-800 hover:text-primary-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
