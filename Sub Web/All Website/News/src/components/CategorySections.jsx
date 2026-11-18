import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchNews } from '../utils/api';

const SECTIONS = ['sports', 'tech', 'lifestyle'];

function useCategoryNews(slug) {
  const [articles, setArticles] = useState([]);
  useEffect(() => {
    fetchNews({ category: slug, limit: 3 }).then(r => setArticles(r.articles || [])).catch(() => {});
  }, [slug]);
  return articles;
}

function CategoryRow({ slug, isBn, t, title }) {
  const articles = useCategoryNews(slug);
  if (!articles.length) return null;
  const getTitle = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`section-title mb-0 ${isBn ? 'font-bangla' : ''}`}>{title}</h2>
        <Link to={`/category/${slug}`} className={`text-sm text-accent-700 hover:underline font-medium ${isBn ? 'font-bangla' : ''}`}>
          {t('common.readMore')} →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <Link key={article.id} to={`/article/${article.slug}`} className="card-news group cursor-pointer block">
            {article.featured_image && (
              <div className="overflow-hidden rounded-t-xl" style={{ height: 140 }}>
                <img src={article.featured_image} alt={getTitle(article)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="p-4">
              <h3 className={`text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                {getTitle(article)}
              </h3>
              <span className={`text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                {new Date(article.publish_at || article.created_at).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CategorySections() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <section className="container-news py-8">
      {SECTIONS.map((slug) => (
        <CategoryRow key={slug} slug={slug} isBn={isBn} t={t} title={t(`sections.${slug}`)} />
      ))}
    </section>
  );
}
