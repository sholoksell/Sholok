import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getFeaturedArticle, getLatestArticles } from '../data/mockNews';

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const featured = getFeaturedArticle(lang);
  const latest = getLatestArticles(lang, 3);
  const isBn = lang === 'bn';

  if (!featured) return null;

  return (
    <section className="container-news py-6">
      <h2 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.featured')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Story */}
        <div className="lg:col-span-2">
          <Link to={`/article/${featured.id}`} className="card-news group cursor-pointer block">
            <div className="px-5 pt-5">
              <span className={`inline-block bg-accent-700 text-white text-xs font-bold px-3 py-1 rounded ${isBn ? 'font-bangla' : ''}`}>
                {featured.categoryLabel}
              </span>
            </div>
            <div className="p-5 pt-3">
              <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-3 group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors ${isBn ? 'font-bangla' : ''}`}>
                {featured.title}
              </h3>
              <p className={`text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed mb-4 ${isBn ? 'font-bangla' : ''}`}>
                {featured.summary}
              </p>
              <div className={`flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {featured.author}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {featured.time}
                </span>
                <span>·</span>
                <span>{featured.readTime}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Side Latest Stories */}
        <div className="flex flex-col gap-4">
          {latest.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="card-news group cursor-pointer flex flex-row lg:flex-col">
              <div className="p-3 flex flex-col justify-center">
                <span className={`inline-block bg-primary-800 text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2 ${isBn ? 'font-bangla' : ''}`}>
                  {article.categoryLabel}
                </span>
                <h4 className={`text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                  {article.title}
                </h4>
                <span className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isBn ? 'font-bangla' : ''}`}>
                  {article.time}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
