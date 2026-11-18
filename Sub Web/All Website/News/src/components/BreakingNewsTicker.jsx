import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchBreaking } from '../utils/api';

export default function BreakingNewsTicker() {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchBreaking().then(r => setItems(r || [])).catch(() => {});
  }, []);

  if (!items.length) return null;

  return (
    <div className="bg-accent-700 text-white overflow-hidden">
      <div className="container-news flex items-center">
        <div className={`flex-shrink-0 bg-accent-950 px-4 py-2 font-bold text-sm tracking-wide uppercase ${lang === 'bn' ? 'font-bangla' : ''}`}>
          <span className="inline-block animate-pulse mr-2 w-2 h-2 bg-white rounded-full" />
          {t('sections.breakingNews')}
        </div>
        <div className="overflow-hidden flex-1 ticker-container">
          <div className="animate-ticker whitespace-nowrap py-2">
            {[...items, ...items].map((item, i) => (
              <Link key={i} to={`/article/${item.slug}`} className={`inline-block mx-8 text-sm hover:text-yellow-200 transition-colors ${lang === 'bn' ? 'font-bangla' : ''}`}>
                <span className="text-yellow-300 mr-2">●</span>
                <span>{lang === 'bn' && item.title_bn ? item.title_bn : item.title_en}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
