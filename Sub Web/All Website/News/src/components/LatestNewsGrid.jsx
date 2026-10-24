import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getLatestArticles } from '../data/mockNews';
import MostReadSidebar from './MostReadSidebar';

export default function LatestNewsGrid() {
  const { lang, t } = useLanguage();
  const articles = getLatestArticles(lang, 6);
  const isBn = lang === 'bn';

  return (
    <section className="container-news py-8">
      <h2 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.latest')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Grid - 2 columns */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="card-news group cursor-pointer animate-fade-in block">
              <div className="p-4 pb-0">
                <span className={`inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded ${isBn ? 'font-bangla' : ''}`}>
                  {article.categoryLabel}
                </span>
              </div>
              <div className="p-4 pt-2">
                <h3 className={`text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                  {article.title}
                </h3>
                <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${isBn ? 'font-bangla' : ''}`}>
                  {article.summary}
                </p>
                <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                  <span>{article.time}</span>
                  <span className="text-accent-700 font-medium">
                    {t('common.readMore')} →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <MostReadSidebar />
        </div>
      </div>
    </section>
  );
}
