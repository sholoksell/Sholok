import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchNews } from '../utils/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState(t(`sections.${slug}`) || slug);
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    fetchNews({ category: slug, page, limit }).then(r => {
      setArticles(r.articles || []);
      setTotal(r.total || 0);
      if (r.articles?.[0]?.category_name) setCategoryName(r.articles[0].category_name);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug, page]);

  const getTitle = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;
  const getSummary = (a) => isBn && a.summary_bn ? a.summary_bn : a.summary_en;
  const totalPages = Math.ceil(total / limit);

  return (
    <section className="container-news py-8">
      <nav className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 ${isBn ? 'font-bangla' : ''}`}>
        <Link to="/" className="hover:text-accent-700 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{categoryName}</span>
      </nav>

      <h1 className={`section-title text-2xl mb-6 ${isBn ? 'font-bangla' : ''}`}>{categoryName}</h1>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className={`text-gray-500 dark:text-gray-400 text-lg ${isBn ? 'font-bangla' : ''}`}>
            {isBn ? 'এই বিভাগে কোনো সংবাদ নেই' : 'No articles in this category'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} to={`/article/${article.slug}`} className="card-news group cursor-pointer animate-fade-in block">
                {article.featured_image && (
                  <div className="overflow-hidden rounded-t-xl" style={{ height: 160 }}>
                    <img src={article.featured_image} alt={getTitle(article)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className={`text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                    {getTitle(article)}
                  </h2>
                  <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${isBn ? 'font-bangla' : ''}`}>
                    {getSummary(article)}
                  </p>
                  <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                    <span>{article.author_name || ''}</span>
                    <span>{new Date(article.publish_at || article.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-10">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-5 py-2 rounded-lg border border-primary-800 text-primary-800 disabled:opacity-40 hover:bg-primary-50 transition-colors">←</button>
              <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-5 py-2 rounded-lg border border-primary-800 text-primary-800 disabled:opacity-40 hover:bg-primary-50 transition-colors">→</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
