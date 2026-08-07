import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import api from '@/lib/axios';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'discount', label: 'Biggest Discount' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState({ products: [], total: 0, pages: 0, facets: {} });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    vendor: searchParams.get('vendor') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') || '',
    onSale: searchParams.get('onSale') || '',
    rating: searchParams.get('rating') || '',
    colors: searchParams.get('colors') || '',
    sizes: searchParams.get('sizes') || '',
  });

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        q,
        page,
        sort,
        limit: 24,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      };
      const res = await api.get('/search', { params });
      setResults(res.data);
    } catch (e) {
      console.error(e);
      setResults({ products: [], total: 0, pages: 0, facets: {} });
    } finally {
      setLoading(false);
    }
  }, [q, page, sort, filters]);

  useEffect(() => {
    setPage(1);
  }, [q, filters, sort]);

  useEffect(() => {
    search();
  }, [search]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      vendor: '',
      minPrice: '',
      maxPrice: '',
      inStock: '',
      onSale: '',
      rating: '',
      colors: '',
      sizes: '',
    });
  };

  // Helpers for multi-value color/size filters (comma-separated strings)
  const toggleMultiFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] ? prev[key].split(',') : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next.join(',') };
    });
  };

  const activeFilterCount = Object.entries(filters).reduce((acc, [key, val]) => {
    if (!val) return acc;
    if (key === 'colors') return acc + val.split(',').filter(Boolean).length;
    if (key === 'sizes')  return acc + val.split(',').filter(Boolean).length;
    return acc + 1;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {q ? `Search results for "${q}"` : 'All Products'}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500">{results.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <aside className="w-64 shrink-0 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category filter */}
            {results.facets?.categories?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {results.facets.categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === String(cat.id)}
                        onChange={() =>
                          updateFilter(
                            'category',
                            filters.category === String(cat.id) ? '' : String(cat.id)
                          )
                        }
                      />
                      <span>{language === 'bn' && cat.nameBn ? cat.nameBn : cat.name}</span>
                      <span className="ml-auto text-gray-400 text-xs">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand filter */}
            {results.facets?.brands?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Brand</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.facets.brands.map((brand) => (
                    <label
                      key={brand.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                    >
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === String(brand.id)}
                        onChange={() =>
                          updateFilter(
                            'brand',
                            filters.brand === String(brand.id) ? '' : String(brand.id)
                          )
                        }
                      />
                      <span>{brand.name}</span>
                      <span className="ml-auto text-gray-400 text-xs">({brand.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Vendor filter */}
            {results.facets?.vendors?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Store</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.facets.vendors.map((v) => (
                    <label
                      key={v.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                    >
                      <input
                        type="radio"
                        name="vendor"
                        checked={filters.vendor === String(v.id)}
                        onChange={() =>
                          updateFilter(
                            'vendor',
                            filters.vendor === String(v.id) ? '' : String(v.id)
                          )
                        }
                      />
                      <span>{v.store_name}</span>
                      <span className="ml-auto text-gray-400 text-xs">({v.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                />
              </div>
              {results.facets?.priceRange && (
                <p className="text-xs text-gray-400 mt-1">
                  ৳{results.facets.priceRange.min?.toLocaleString()} –{' '}
                  ৳{results.facets.priceRange.max?.toLocaleString()}
                </p>
              )}
            </div>

            {/* Color filter */}
            {(() => {
              const DEFAULT_COLORS = [
                { name: 'Red', hex: '#ef4444' },
                { name: 'Blue', hex: '#3b82f6' },
                { name: 'Green', hex: '#22c55e' },
                { name: 'Yellow', hex: '#eab308' },
                { name: 'Black', hex: '#111827' },
                { name: 'White', hex: '#f9fafb' },
                { name: 'Pink', hex: '#ec4899' },
                { name: 'Orange', hex: '#f97316' },
                { name: 'Purple', hex: '#a855f7' },
                { name: 'Brown', hex: '#92400e' },
                { name: 'Gray', hex: '#6b7280' },
                { name: 'Multicolor', hex: 'linear-gradient(135deg,#ef4444,#3b82f6,#22c55e)' },
              ];
              const facetColorNames = (results.facets?.colors || []).map((c) => c.value);
              const allColors = [
                ...DEFAULT_COLORS,
                ...facetColorNames
                  .filter((n) => !DEFAULT_COLORS.some((d) => d.name.toLowerCase() === n.toLowerCase()))
                  .map((n) => ({ name: n, hex: '#9ca3af' })),
              ];
              const selectedColors = filters.colors ? filters.colors.split(',') : [];
              return (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((c) => {
                      const active = selectedColors.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          title={c.name}
                          onClick={() => toggleMultiFilter('colors', c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            active ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-gray-400'
                          }`}
                          style={{
                            background: c.hex.startsWith('linear') ? c.hex : c.hex,
                            backgroundColor: c.hex.startsWith('linear') ? undefined : c.hex,
                          }}
                        />
                      );
                    })}
                  </div>
                  {selectedColors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedColors.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5"
                        >
                          {c}
                          <button onClick={() => toggleMultiFilter('colors', c)} className="text-gray-400 hover:text-red-500 leading-none">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Size filter */}
            {(() => {
              const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];
              const facetSizeNames = (results.facets?.sizes || []).map((s) => s.value);
              const allSizes = [
                ...DEFAULT_SIZES,
                ...facetSizeNames.filter((n) => !DEFAULT_SIZES.includes(n)),
              ];
              const selectedSizes = filters.sizes ? filters.sizes.split(',') : [];
              return (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Size</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {allSizes.map((s) => {
                      const active = selectedSizes.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleMultiFilter('sizes', s)}
                          className={`px-2.5 py-1 text-xs border rounded font-medium transition-all ${
                            active
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSizes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedSizes.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 text-xs bg-gray-100 rounded-full px-2 py-0.5"
                        >
                          {s}
                          <button onClick={() => toggleMultiFilter('sizes', s)} className="text-gray-400 hover:text-red-500 leading-none">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock === '1'}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? '1' : '')}
                />
                In Stock Only
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.onSale === '1'}
                  onChange={(e) => updateFilter('onSale', e.target.checked ? '1' : '')}
                />
                On Sale
              </label>
            </div>
          </aside>
        )}

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                ))}
            </div>
          ) : results.products.length === 0 ? (
            <div className="text-center py-20">
              <Search size={48} className="mx-auto text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-600">No products found</h2>
              <p className="text-gray-400 text-sm mt-1">
                Try different keywords or remove some filters
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary hover:underline text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative aspect-square bg-gray-50">
                        <img
                          src={product.thumbnail || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                        {product.on_sale && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                            SALE
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-400 mb-0.5">
                          {product.store_name ||
                            product.brand_name ||
                            product.category_name}
                        </p>
                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="font-bold text-gray-900">
                            ৳
                            {(
                              product.sale_price || product.regular_price
                            ).toLocaleString()}
                          </span>
                          {product.sale_price && (
                            <span className="text-xs text-gray-400 line-through">
                              ৳{product.regular_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {product.stock === 0 && (
                          <p className="text-xs text-red-500 mt-1">Out of stock</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {results.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  {Array.from(
                    { length: Math.min(7, results.pages) },
                    (_, i) => {
                      const p = page <= 4 ? i + 1 : page - 3 + i;
                      return p <= results.pages ? (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1.5 border rounded text-sm ${
                            page === p
                              ? 'bg-primary text-white border-primary'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ) : null;
                    }
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(results.pages, p + 1))}
                    disabled={page === results.pages}
                    className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
