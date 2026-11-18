import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchMostRead } from '../utils/api';
import { useInView } from '../hooks/useInView';

export default function MostReadSidebar() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [articles, setArticles] = useState([]);
  const [ref, inView] = useInView(0.08);

  useEffect(() => {
    fetchMostRead(5).then(data => {
      setArticles(Array.isArray(data) ? data : (data?.articles || []));
    }).catch(() => {});
  }, []);

  if (!articles.length) return null;

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`}>
      <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className={`section-title font-bold text-gray-900 dark:text-white ${isBn ? 'font-bangla text-base' : 'text-base font-editorial'}`}>
            {t('sections.mostRead')}
          </h3>
        </div>

        {/* List */}
        <ul className="divide-y divide-gray-50 dark:divide-gray-800">
          {articles.map((article, i) => {
            const title = isBn && article.title_bn ? article.title_bn : article.title_en;
            return (
              <li key={article.id}>
                <Link
                  to={`/article/${article.slug}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  {/* Rank number */}
                  <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                    i === 0 ? 'bg-primary-800 text-white' :
                    i === 1 ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla' : ''}`}>
                      {title}
                    </h4>
                    <span className={`text-[11px] text-gray-400 mt-1 block ${isBn ? 'font-bangla' : ''}`}>
                      {article.category_name}
                      {article.view_count ? ` · ${article.view_count.toLocaleString(isBn ? 'bn-BD' : 'en-US')} ${isBn ? 'বার পড়া হয়েছে' : 'reads'}` : ''}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
