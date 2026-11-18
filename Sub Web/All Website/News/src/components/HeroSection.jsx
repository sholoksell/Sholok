import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchFeatured, fetchLatest } from '../utils/api';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    fetchFeatured().then(r => setFeatured(r)).catch(() => {});
    fetchLatest(3).then(r => setLatest(r || [])).catch(() => {});
  }, []);

  if (!featured) return null;

  const title = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;
  const summary = (a) => isBn && a.summary_bn ? a.summary_bn : a.summary_en;

  return (
    <section className="container-news py-6">
      <h2 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.featured')}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured */}
        <div className="lg:col-span-2">
          <Link to={`/article/${featured.slug}`} className="card-news group cursor-pointer block">
            {featured.featured_image && (
              <div className="overflow-hidden rounded-t-xl" style={{ maxHeight: 280 }}>
                <img src={featured.featured_image} alt={title(featured)} className="w-full object-cover group-hover:scale-105 transition-transform duration-300" style={{ height: 280 }} />
              </div>
            )}
            <div className="px-5 pt-4">
              <span className={`inline-block bg-accent-700 text-white text-xs font-bold px-3 py-1 rounded ${isBn ? 'font-bangla' : ''}`}>
                {featured.category_name}
              </span>
            </div>
            <div className="p-5 pt-3">
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors ${isBn ? 'font-bangla' : ''}`}>
                {title(featured)}
              </h3>
              <p className={`text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-4 ${isBn ? 'font-bangla' : ''}`}>
                {summary(featured)}
              </p>
              <div className={`flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                {featured.author_name && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {featured.author_name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {new Date(featured.publish_at || featured.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Latest */}
        <div className="flex flex-col gap-4">
          {latest.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} className="card-news group cursor-pointer flex flex-row lg:flex-col">
              <div className="p-3 flex flex-col justify-center">
                <span className={`inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2 ${isBn ? 'font-bangla' : ''}`}>
                  {article.category_name}
                </span>
                <h4 className={`text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                  {title(article)}
                </h4>
                <span className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isBn ? 'font-bangla' : ''}`}>
                  {new Date(article.publish_at || article.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
