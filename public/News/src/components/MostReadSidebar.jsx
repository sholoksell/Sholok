import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getMostReadArticles } from '../data/mockNews';

export default function MostReadSidebar() {
  const { lang, t } = useLanguage();
  const items = getMostReadArticles(lang);
  const isBn = lang === 'bn';

  return (
    <aside className="card-news p-5">
      <h3 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.mostRead')}
      </h3>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="group cursor-pointer">
            <Link to={`/article/${item.id}`} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-800 dark:bg-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {isBn ? ['১', '২', '৩', '৪', '৫'][index] : index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent-700 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                  {item.title}
                </h4>
                <span className={`text-xs text-gray-400 mt-1 inline-block ${isBn ? 'font-bangla' : ''}`}>
                  {item.time}
                </span>
              </div>
            </Link>
            {index < items.length - 1 && (
              <hr className="mt-3 border-gray-100 dark:border-gray-700" />
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
