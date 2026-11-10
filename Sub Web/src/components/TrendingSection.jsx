import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
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
    <section className="bg-primary-soft py-6">
      <div className="container mx-auto px-4 lg:px-6">

        {/* Header row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Trending Items</h2>
              <p className="text-xs text-gray-500 mt-0.5">Popular picks worth discovering</p>
            </div>
          </div>
          <Link to="/category/trending" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="scrollbar-hide -mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1" role="tablist">
            <button
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
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
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="shrink-0 rounded-full bg-white px-3.5 py-1 text-xs font-medium text-gray-400 hover:text-primary"
              >
                Clear ×
              </button>
            )}
          </div>
        )}

        {/* Product Grid — compact cards */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((product, i) => (
            <ProductCard key={product._id || product.id || i} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
