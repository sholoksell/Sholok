import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchArticle } from '../utils/api';

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="reading-progress">
      <div style={{ width: `${progress}%` }} />
    </div>
  );
}

function BackToTop({ isBn, t }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`back-to-top ${isBn ? 'font-bangla text-xs' : 'text-xs'}`}
      aria-label={t('common.backToTop')}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}

function readingTime(text, isBn) {
  if (!text) return null;
  const words = text.split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / (isBn ? 150 : 200)));
  return mins;
}

export default function ArticlePage() {
  const { id: slug } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    fetchArticle(slug).then(r => setData(r)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <ReadingProgress />
      <div className="container-news py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-10 rounded" />
          <div className="skeleton h-6 w-2/3 rounded" />
          <div className="skeleton aspect-[16/7] rounded-2xl" />
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-4 rounded" />)}
        </div>
      </div>
    </>
  );

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
  const mins = readingTime(body, isBn);
  const publishDate = new Date(article.published_at || article.publish_at || article.created_at);

  return (
    <>
      <ReadingProgress />
      <BackToTop isBn={isBn} t={t} />

      <div className="container-news py-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-1.5 text-sm text-gray-400 mb-6 ${isBn ? 'font-bangla' : ''}`}>
          <Link to="/" className="hover:text-primary-800 dark:hover:text-primary-400 transition-colors">{t('nav.home')}</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          {article.category_slug && (
            <>
              <Link to={`/category/${article.category_slug}`} className="hover:text-primary-800 dark:hover:text-primary-400 transition-colors">{article.category_name}</Link>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </>
          )}
          <span className="text-gray-300 line-clamp-1 max-w-xs">{title.substring(0, 50)}{title.length > 50 ? '…' : ''}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main article */}
          <article className="lg:col-span-2 min-w-0">
            {/* Category + Breaking */}
            <div className="flex items-center gap-2 mb-4">
              {article.is_breaking ? (
                <span className="badge-breaking">{t('sections.breakingNews')}</span>
              ) : (
                <span className="badge-category">{article.category_name}</span>
              )}
              {article.is_featured && !article.is_breaking && (
                <span className="badge-category">{t('sections.featured')}</span>
              )}
            </div>

            {/* Title */}
            <h1 className={`font-editorial font-bold leading-tight text-gray-900 dark:text-white mb-4 ${isBn ? 'font-bangla text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
              {title}
            </h1>

            {/* Summary */}
            {summary && (
              <p className={`text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-5 border-l-4 border-primary-800 pl-4 ${isBn ? 'font-bangla' : ''}`}>
                {summary}
              </p>
            )}

            {/* Meta bar */}
            <div className={`flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400 mb-7 pb-5 border-b border-gray-100 dark:border-gray-800 ${isBn ? 'font-bangla' : ''}`}>
              {article.author_name && (
                <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {article.author_name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {publishDate.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              {mins && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {isBn ? `${mins} মিনিট` : `${mins} ${t('common.minutesRead')}`}
                </span>
              )}
              {article.view_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {article.view_count.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                </span>
              )}
            </div>

            {/* Featured image */}
            {article.featured_image && (
              <figure className="mb-8 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={article.featured_image} alt={title} className="w-full object-cover max-h-96" />
                {article.image_credit && (
                  <figcaption className={`text-xs text-gray-400 p-3 ${isBn ? 'font-bangla' : ''}`}>
                    {t('source.imageCredit')} {article.image_credit}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Body */}
            <div
              className={`article-body ${isBn ? 'font-bangla' : ''}`}
              dangerouslySetInnerHTML={{
                __html: body
                  ? body.replace(/\n\n+/g, '</p><p class="article-para">').replace(/^(.+)/, '<p class="article-para">$1').replace(/(.+)$/, '$1</p>')
                  : ''
              }}
            />

            {/* Source credit */}
            {(article.source_credit || article.source_url) && (
              <div className="source-credit mt-8">
                <p className={`text-xs font-bold uppercase tracking-wider text-primary-800 dark:text-primary-400 mb-2 ${isBn ? 'font-bangla text-sm normal-case tracking-normal' : ''}`}>
                  {t('source.label')}
                </p>
                <p className={`text-sm text-gray-600 dark:text-gray-400 mb-2 ${isBn ? 'font-bangla' : ''}`}>{t('source.description')}</p>
                {article.source_url ? (
                  <a href={article.source_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 dark:text-primary-400 hover:underline ${isBn ? 'font-bangla' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {article.source_credit || t('source.viewOriginal')}
                  </a>
                ) : (
                  <span className={`text-sm text-gray-700 dark:text-gray-300 font-medium ${isBn ? 'font-bangla' : ''}`}>{article.source_credit}</span>
                )}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag.id} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 text-xs font-medium rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Share */}
            <div className={`mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 ${isBn ? 'font-bangla' : ''}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{t('common.share')}</p>
              <div className="flex items-center gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-sky-500 text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </a>
                <button onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})} className="w-9 h-9 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 sticky top-28">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className={`font-bold text-gray-900 dark:text-white section-title ${isBn ? 'font-bangla text-sm' : 'text-sm font-editorial'}`}>
                  {t('common.relatedNews')}
                </h3>
              </div>
              <div className="p-4 space-y-1">
                {related.length ? related.map((item, i) => (
                  <Link key={item.id} to={`/article/${item.slug}`} className="card-news flex gap-3 p-2.5 rounded-xl group">
                    {item.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <img src={item.image_url} alt={relTitle(item)} className="w-full h-full object-cover img-hover-zoom" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug line-clamp-3 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla text-sm' : ''}`}>
                        {relTitle(item)}
                      </h4>
                    </div>
                  </Link>
                )) : (
                  <p className={`text-sm text-gray-400 py-4 text-center ${isBn ? 'font-bangla' : ''}`}>
                    {isBn ? 'কোনো সম্পর্কিত সংবাদ নেই' : 'No related articles'}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
