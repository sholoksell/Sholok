import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductCard from './ProductCard';

const ProductSection = ({
  title,
  products = [],
  seeMoreLink,
  cols = 6,
  badge,
}) => {
  const { t } = useLanguage();
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

  return (
    <section className="bg-white rounded shadow-amazon p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-amazon-dark">{title}</h2>
          {badge && (
            <span className="bg-amazon-orange text-white text-xs font-bold px-2 py-0.5 rounded-sm">
              {badge}
            </span>
          )}
        </div>
        {seeMoreLink && (
          <Link to={seeMoreLink} className="see-more-link shrink-0">
            {t('seeAll')}
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className={`grid ${colClass} gap-3`}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
