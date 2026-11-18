import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchLatest } from '../utils/api';
import MostReadSidebar from './MostReadSidebar';

export default function LatestNewsGrid() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchLatest(6).then(r => setArticles(r || [])).catch(() => {});
  }, []);

  const title = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;
  const summary = (a) => isBn && a.summary_bn ? a.summary_bn : a.summary_en;

  return (
    <section className="container-news py-8">
      <h2 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.latest')}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} className="card-news group cursor-pointer animate-fade-in block">
              {article.featured_image && (
                <div className="overflow-hidden rounded-t-xl" style={{ height: 160 }}>
                  <img src={article.featured_image} alt={title(article)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4 pb-0">
                <span className={`inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded ${isBn ? 'font-bangla' : ''}`}>
                  {article.category_name}
                </span>
              </div>
              <div className="p-4 pt-2">
                <h3 className={`text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                  {title(article)}
                </h3>
                <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${isBn ? 'font-bangla' : ''}`}>
                  {summary(article)}
                </p>
                <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                  <span>{new Date(article.publish_at || article.created_at).toLocaleDateString()}</span>
                  <span className="text-accent-700 font-medium">{t('common.readMore')} →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="lg:col-span-1">
          <MostReadSidebar />
        </div>
      </div>
    </section>
  );
}
