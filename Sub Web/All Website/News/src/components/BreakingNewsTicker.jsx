import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchBreaking } from '../utils/api';

export default function BreakingNewsTicker() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchBreaking().catch(() => null).then(data => {
      if (Array.isArray(data) && data.length) setItems(data);
    });
  }, []);

  if (!items.length) return null;

  const title = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;
  const tickerContent = items.map(a => title(a)).join('  ·  ');

  return (
    <div className="bg-accent-700 text-white overflow-hidden">
      <div className="container-news flex items-center gap-0 h-9">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-1.5 bg-black/20 px-3 h-full font-bold text-xs tracking-widest uppercase whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className={isBn ? 'font-bangla text-sm tracking-normal' : ''}>{t('sections.breakingNews')}</span>
        </div>

        {/* Ticker */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          <div className="ticker-track whitespace-nowrap text-sm font-medium">
            {[...items, ...items].map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                to={`/article/${item.slug}`}
                className={`inline-block hover:underline underline-offset-2 mx-8 ${isBn ? 'font-bangla' : ''}`}
              >
                {title(item)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
