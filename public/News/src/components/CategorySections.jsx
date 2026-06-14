import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getCategorySections } from '../data/mockNews';

const sectionKeys = ['sports', 'tech', 'lifestyle'];

export default function CategorySections() {
  const { lang, t } = useLanguage();
  const data = getCategorySections(lang);
  const isBn = lang === 'bn';

  return (
    <section className="container-news py-8">
      {sectionKeys.map((section) => (
        <div key={section} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`section-title mb-0 ${isBn ? 'font-bangla' : ''}`}>
              {t(`sections.${section}`)}
            </h2>
            <Link
              to={`/category/${section}`}
              className={`text-sm text-accent-700 hover:underline font-medium ${isBn ? 'font-bangla' : ''}`}
            >
              {t('common.readMore')} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data[section]?.map((article) => (
              <Link key={article.id} to={`/article/${article.id}`} className="card-news group cursor-pointer block">
                <div className="p-4">
                  <h3 className={`text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                    {article.title}
                  </h3>
                  <span className={`text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                    {article.time}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
