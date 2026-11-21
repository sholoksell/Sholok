import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchFeatured, fetchLatest } from '../utils/api';
import { useInView } from '../hooks/useInView';

function timeAgo(dateStr, isBn) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 1) return isBn ? 'এইমাত্র' : 'Just now';
  if (diff < 60) return isBn ? `${diff} মিনিট আগে` : `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return isBn ? `${h} ঘণ্টা আগে` : `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return isBn ? 'গতকাল' : 'Yesterday';
  if (days < 7) return isBn ? `${days} দিন আগে` : `${days}d ago`;
  return d.toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FeaturedCard({ article, isBn, t }) {
  const [ref, inView] = useInView(0.1);
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;
  const excerpt = isBn && article.summary_bn ? article.summary_bn : article.summary_en;

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`}>
      <Link to={`/article/${article.slug}`} className="block group relative overflow-hidden rounded-2xl bg-gray-900 aspect-[16/10] lg:aspect-[16/9]">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover img-hover-zoom opacity-80 group-hover:opacity-90 transition-opacity duration-500"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #5D0096 0%, #D31710 100%)' }} />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-breaking text-xs">{t('sections.breakingNews')}</span>
            <span className={`text-white/60 text-xs ${isBn ? 'font-bangla' : ''}`}>
              {timeAgo(article.publish_at, isBn)}
            </span>
          </div>
          <h2 className={`font-editorial font-bold text-white leading-tight mb-3 group-hover:underline underline-offset-4 ${isBn ? 'font-bangla text-2xl lg:text-3xl' : 'text-2xl lg:text-4xl'}`}>
            {title}
          </h2>
          {excerpt && (
            <p className={`text-white/70 text-sm line-clamp-2 max-w-2xl ${isBn ? 'font-bangla' : ''}`}>
              {excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-1 text-primary-300 text-sm font-medium">
            <span className={isBn ? 'font-bangla' : ''}>{t('common.readMore')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}

function SecondaryCard({ article, isBn, t, index }) {
  const [ref, inView] = useInView(0.1);
  const title = isBn && article.title_bn ? article.title_bn : article.title_en;

  return (
    <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`} style={{ transitionDelay: `${index * 80}ms` }}>
      <Link to={`/article/${article.slug}`} className="card-news flex gap-3 p-3 rounded-xl group">
        {article.featured_image && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <img src={article.featured_image} alt={title} className="w-full h-full object-cover img-hover-zoom" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="badge-category text-[10px] mb-1 inline-block">{article.category_name}</span>
          <h3 className={`text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-800 dark:group-hover:text-primary-300 transition-colors ${isBn ? 'font-bangla' : ''}`}>
            {title}
          </h3>
          <span className={`text-[11px] text-gray-400 mt-1 block ${isBn ? 'font-bangla' : ''}`}>
            {timeAgo(article.publish_at, isBn)}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function HeroSection() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [featured, setFeatured] = useState(null);
  const [secondary, setSecondary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFeatured(), fetchLatest(6)]).then(([feat, latest]) => {
      setFeatured(feat);
      const latestArr = Array.isArray(latest) ? latest : (latest?.articles || []);
      setSecondary(latestArr.filter(a => !feat || a.id !== feat.id).slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="container-news py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton aspect-[16/9] rounded-2xl" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      </div>
    </section>
  );

  if (!featured) return null;

  return (
    <section className="container-news py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main featured */}
        <div className="lg:col-span-2">
          <FeaturedCard article={featured} isBn={isBn} t={t} />
        </div>

        {/* Secondary sidebar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className={`section-title text-base font-bold ${isBn ? 'font-bangla' : ''}`}>{t('sections.latest')}</h2>
          </div>
          {secondary.map((article, i) => (
            <SecondaryCard key={article.id} article={article} isBn={isBn} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
