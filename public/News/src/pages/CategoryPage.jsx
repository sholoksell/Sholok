import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getArticlesByCategory } from '../data/mockNews';

export default function CategoryPage() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const articles = getArticlesByCategory(lang, slug);
  const categoryName = t(`sections.${slug}`) || slug;

  return (
    <section className="container-news py-8">
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 ${isBn ? 'font-bangla' : ''}`}>
        <Link to="/" className="hover:text-accent-700 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{categoryName}</span>
      </nav>

      <h1 className={`section-title text-2xl mb-6 ${isBn ? 'font-bangla' : ''}`}>
        {categoryName}
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className={`text-gray-500 dark:text-gray-400 text-lg ${isBn ? 'font-bangla' : ''}`}>
            {isBn ? 'এই বিভাগে কোনো সংবাদ নেই' : 'No articles in this category'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="card-news group cursor-pointer animate-fade-in">
              <div className="p-4">
                <h2 className={`text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-primary-800 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2 ${isBn ? 'font-bangla' : ''}`}>
                  {article.title}
                </h2>
                <p className={`text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 ${isBn ? 'font-bangla' : ''}`}>
                  {article.summary}
                </p>
                <div className={`flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 ${isBn ? 'font-bangla' : ''}`}>
                  <span>{article.author}</span>
                  <span>{article.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
