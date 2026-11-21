import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchNews } from '../utils/api';
import { useInView } from '../hooks/useInView';

const CATEGORIES = [
  { key: 'national',      slug: 'national' },
  { key: 'international', slug: 'international' },
  { key: 'economy',       slug: 'economy' },
  { key: 'sports',        slug: 'sports' },
  { key: 'tech',          slug: 'technology' },
  { key: 'health',        slug: 'health' },
];

function ArticleRow({ article, isBn, rank }) {
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;
  return (
    <Link to={`/article/${article.slug}`} className="flex items-start gap-3 group py-2.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
      {article.featured_image ? (
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          <img src={article.featured_image} alt={title} className="w-full h-full object-cover img-hover-zoom" />
        </div>
      ) : (
        <span className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-800 dark:text-primary-400 flex-shrink-0 mt-0.5">{rank}</span>
      )}
      <h4 className={`text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla' : ''}`}>
        {title}
      </h4>
    </Link>
  );
}

function CategoryBlock({ catKey, slug, isBn, t }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView(0.06);

  useEffect(() => {
    fetchNews({ category: slug, limit: 5 }).then(data => {
      const arr = Array.isArray(data) ? data : (data?.articles || []);
      setArticles(arr.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  const featured = articles[0];
  const rest = articles.slice(1);
  const catTitle = isBn && articles[0]?.category_name_bn ? articles[0].category_name_bn : (articles[0]?.category_name || t(`sections.${catKey}`));

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''} bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800`}>
      {/* Category header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className={`section-title font-bold text-gray-900 dark:text-white ${isBn ? 'font-bangla text-sm' : 'text-sm font-editorial'}`}>
          {t(`sections.${catKey}`)}
        </h3>
        <Link
          to={`/category/${slug}`}
          className={`text-xs font-medium text-primary-800 dark:text-primary-400 hover:underline flex items-center gap-0.5 ${isBn ? 'font-bangla' : ''}`}
        >
          {t('common.viewAll')}
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : !featured ? (
          <p className={`text-sm text-gray-400 py-4 text-center ${isBn ? 'font-bangla' : ''}`}>{t('common.noResults')}</p>
        ) : (
          <>
            {/* Featured article */}
            {featured.featured_image && (
              <Link to={`/article/${featured.slug}`} className="block group mb-3">
                <div className="aspect-[16/7] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 mb-2.5">
                  <img src={featured.featured_image} alt={isBn && featured.title_bn ? featured.title_bn : featured.title_en} className="w-full h-full object-cover img-hover-zoom" />
                </div>
                <h4 className={`font-semibold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla' : 'font-editorial'}`}>
                  {isBn && featured.title_bn ? featured.title_bn : featured.title_en}
                </h4>
              </Link>
            )}
            {/* List */}
            <div>
              {rest.map((a, i) => (
                <ArticleRow key={a.id} article={a} isBn={isBn} rank={i + 2} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CategorySections() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <section className="container-news py-8">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CATEGORIES.map(({ key, slug }) => (
          <CategoryBlock key={key} catKey={key} slug={slug} isBn={isBn} t={t} />
        ))}
      </div>
    </section>
  );
}
