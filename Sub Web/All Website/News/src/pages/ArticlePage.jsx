import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchArticle } from '../utils/api';

export default function ArticlePage() {
  const { id: slug } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchArticle(slug).then(r => setData(r)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container-news py-20 text-center text-gray-500">Loading…</div>;

  if (!data?.article) {
    return (
      <div className="container-news py-20 text-center">
        <h2 className={`text-2xl font-bold text-gray-800 dark:text-white mb-4 ${isBn ? 'font-bangla' : ''}`}>
          {isBn ? 'সংবাদটি পাওয়া যায়নি' : 'Article Not Found'}
        </h2>
        <Link to="/" className={`text-accent-700 hover:underline font-medium ${isBn ? 'font-bangla' : ''}`}>
          ← {t('nav.home')}
        </Link>
      </div>
    );
  }

  const { article, related = [], tags = [] } = data;
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;
  const summary = isBn && article.summary_bn ? article.summary_bn : article.summary_en;
  const body = isBn && article.body_bn ? article.body_bn : article.body_en;
  const relTitle = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;

  return (
    <article className="container-news py-8">
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 ${isBn ? 'font-bangla' : ''}`}>
        <Link to="/" className="hover:text-accent-700 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        {article.category_slug && (
          <>
            <Link to={`/category/${article.category_slug}`} className="hover:text-accent-700 transition-colors">{article.category_name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-400 line-clamp-1">{title.substring(0, 40)}…</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article Content */}
        <div className="lg:col-span-2">
          {article.category_name && (
            <span className={`inline-block bg-accent-700 text-white text-xs font-bold px-3 py-1 rounded mb-4 ${isBn ? 'font-bangla' : ''}`}>
              {article.category_name}
            </span>
          )}
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 ${isBn ? 'font-bangla' : ''}`}>
            {title}
          </h1>

          {summary && (
            <p className={`text-lg text-gray-600 dark:text-gray-400 mb-5 leading-relaxed ${isBn ? 'font-bangla' : ''}`}>{summary}</p>
          )}

          {/* Meta */}
          <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 ${isBn ? 'font-bangla' : ''}`}>
            {article.author_name && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {article.author_name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {new Date(article.publish_at || article.created_at).toLocaleDateString()}
            </span>
            {article.view_count > 0 && (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {article.view_count.toLocaleString()}
              </span>
            )}
          </div>

          {article.featured_image && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img src={article.featured_image} alt={title} className="w-full object-cover" style={{ maxHeight: 400 }} />
            </div>
          )}

          {/* Body */}
          <div className={`prose prose-lg max-w-none dark:prose-invert ${isBn ? 'font-bangla' : ''}`}
            dangerouslySetInnerHTML={{ __html: body?.replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>') || '' }}
          />

          {/* Source Credit */}
          {article.source_credit && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Source: </span>
              {article.source_url ? (
                <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-accent-700 hover:underline">{article.source_credit}</a>
              ) : article.source_credit}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag.id} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 text-xs font-medium rounded-full">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 ${isBn ? 'font-bangla' : ''}`}>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">{t('common.share')}</h4>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </button>
              <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Related */}
        <aside className="lg:col-span-1">
          <div className="card-news p-5 sticky top-28">
            <h3 className={`section-title ${isBn ? 'font-bangla' : ''}`}>{t('common.relatedNews')}</h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Link key={item.id} to={`/article/${item.slug}`} className="group flex gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent-700 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                      {relTitle(item)}
                    </h4>
                    <span className={`text-xs text-gray-400 mt-1 inline-block ${isBn ? 'font-bangla' : ''}`}>
                      {new Date(item.publish_at || item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
              {!related.length && (
                <p className={`text-sm text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                  {isBn ? 'কোনো সম্পর্কিত সংবাদ নেই' : 'No related articles'}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
