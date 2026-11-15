import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function TrendingSection({ products = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => {
    const seen = new Map();
    products.forEach((p) => {
      const catId = p.categoryId || p.category?._id || p.category;
      const catName = p.categoryName || p.category?.name || (typeof p.category === 'string' ? p.category : '');
      if (catId && catName && !seen.has(catId)) seen.set(catId, catName);
    });
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products.slice(0, 10);
    return products.filter((p) => {
      const catId = p.categoryId || p.category?._id || p.category;
      return catId === activeCategory;
    }).slice(0, 10);
  }, [products, activeCategory]);

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white py-8 border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">Trending Items</h2>
            <p className="text-sm text-gray-500 mt-1">Popular picks worth discovering.</p>
          </div>
          <Link to="/category/trending" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-sale transition-colors mt-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="scrollbar-hide -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
            <button
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'border-primary bg-primary text-white shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-primary"
              >
                Clear ×
              </button>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((product, i) => (
            <ProductCard key={product._id || product.id || i} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
