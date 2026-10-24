import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getArticleById, getArticlesByCategory } from '../data/mockNews';

export default function ArticlePage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const article = getArticleById(id, lang);

  if (!article) {
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

  const related = getArticlesByCategory(lang, article.category)
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  return (
    <article className="container-news py-8">
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 ${isBn ? 'font-bangla' : ''}`}>
        <Link to="/" className="hover:text-accent-700 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to={`/category/${article.category}`} className="hover:text-accent-700 transition-colors">
          {article.categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-gray-400 line-clamp-1">{article.title.substring(0, 40)}...</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article Content */}
        <div className="lg:col-span-2">
          {/* Category Badge */}
          <span className={`inline-block bg-accent-700 text-white text-xs font-bold px-3 py-1 rounded mb-4 ${isBn ? 'font-bangla' : ''}`}>
            {article.categoryLabel}
          </span>

          {/* Title */}
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 ${isBn ? 'font-bangla' : ''}`}>
            {article.title}
          </h1>

          {/* Meta */}
          <div className={`flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 ${isBn ? 'font-bangla' : ''}`}>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readTime}
            </span>
          </div>

          <div className={`prose prose-lg max-w-none dark:prose-invert ${isBn ? 'font-bangla' : ''}`}>
            {article.body.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-base sm:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share Buttons */}
          <div className={`mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 ${isBn ? 'font-bangla' : ''}`}>
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
              {t('common.share')}
            </h4>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </button>
              <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              </button>
              <button className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.627.616l4.584-1.208A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Related News */}
        <aside className="lg:col-span-1">
          <div className="card-news p-5 sticky top-28">
            <h3 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
              {t('common.relatedNews')}
            </h3>
            <div className="space-y-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/article/${item.id}`}
                  className="group flex gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent-700 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                      {item.title}
                    </h4>
                    <span className={`text-xs text-gray-400 mt-1 inline-block ${isBn ? 'font-bangla' : ''}`}>
                      {item.time}
                    </span>
                  </div>
                </Link>
              ))}
              {related.length === 0 && (
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
