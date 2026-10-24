import { useLanguage } from '../i18n/LanguageContext';
import { breakingNewsData } from '../data/mockNews';

export default function BreakingNewsTicker() {
  const { lang, t } = useLanguage();
  const items = breakingNewsData[lang];

  return (
    <div className="bg-accent-700 text-white overflow-hidden">
      <div className="container-news flex items-center">
        {/* Label */}
        <div className={`flex-shrink-0 bg-accent-950 px-4 py-2 font-bold text-sm tracking-wide uppercase ${lang === 'bn' ? 'font-bangla' : ''}`}>
          <span className="inline-block animate-pulse mr-2 w-2 h-2 bg-white rounded-full" />
          {t('sections.breakingNews')}
        </div>

        {/* Ticker */}
        <div className="overflow-hidden flex-1 ticker-container">
          <div className="animate-ticker whitespace-nowrap py-2">
            {items.map((item) => (
              <span key={item.id} className={`inline-block mx-8 text-sm ${lang === 'bn' ? 'font-bangla' : ''}`}>
                <span className="text-yellow-300 mr-2">●</span>
                <span>{item.text}</span>
              </span>
            ))}
            {items.map((item) => (
              <span key={`dup-${item.id}`} className={`inline-block mx-8 text-sm ${lang === 'bn' ? 'font-bangla' : ''}`}>
                <span className="text-yellow-300 mr-2">●</span>
                <span>{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
