import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchMostRead } from '../utils/api';

export default function MostReadSidebar() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchMostRead(5).then(r => setItems(r || [])).catch(() => {});
  }, []);

  if (!items.length) return null;

  const title = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;

  return (
    <aside className="card-news p-5">
      <h3 className={`section-title ${isBn ? 'font-bangla' : ''}`}>
        {t('sections.mostRead')}
      </h3>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li key={item.id} className="group cursor-pointer">
            <Link to={`/article/${item.slug}`} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-800 dark:bg-primary-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {isBn ? ['১', '২', '৩', '৪', '৫'][index] : index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-accent-700 transition-colors line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                  {title(item)}
                </h4>
                <span className={`text-xs text-gray-400 mt-1 inline-block ${isBn ? 'font-bangla' : ''}`}>
                  {new Date(item.publish_at || item.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
            {index < items.length - 1 && <hr className="mt-3 border-gray-100 dark:border-gray-700" />}
          </li>
        ))}
      </ol>
    </aside>
  );
}
