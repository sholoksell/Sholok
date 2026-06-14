import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts, products } from '../data/products';
import { categories } from '../data/categories';
import ProductCard from '../components/Product/ProductCard';
import StarRating from '../components/common/StarRating';
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Avg. Customer Review' },
  { value: 'newest',     label: 'Newest Arrivals' },
];

const PRICE_RANGES = [
  { label: 'Under ৳2,750',          min: 0,    max: 25   },
  { label: '৳2,750 to ৳5,500',      min: 25,   max: 50   },
  { label: '৳5,500 to ৳11,000',     min: 50,   max: 100  },
  { label: '৳11,000 to ৳22,000',    min: 100,  max: 200  },
  { label: '৳22,000 to ৳55,000',    min: 200,  max: 500  },
  { label: '৳55,000 and above',      min: 500,  max: Infinity },
];

const FilterSection = ({ title, open, toggle, children }) => (
  <div className="border-b border-amazon-border pb-3 mb-3">
    <button
      onClick={toggle}
      className="flex items-center justify-between w-full text-left font-bold text-amazon-dark text-sm mb-2"
    >
      {title}
      {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
    </button>
    {open && <div>{children}</div>}
  </div>
);

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q         = searchParams.get('q')        || '';
  const catParam  = searchParams.get('category') || '';
  const tagParam  = searchParams.get('tag')      || '';

  const [sort,          setSort]          = useState('featured');
  const [filterCat,     setFilterCat]     = useState(catParam);
  const [filterRating,  setFilterRating]  = useState(0);
  const [filterPrice,   setFilterPrice]   = useState(null);
  const [filterPrime,   setFilterPrime]   = useState(false);
  const [page,          setPage]          = useState(1);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [openSections,  setOpenSections]  = useState({
    category: true, price: true, rating: true, prime: true,
  });

  const perPage = 24;

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [q, filterCat, filterRating, filterPrice, filterPrime, sort]);

  const toggleSection = (k) =>
    setOpenSections((p) => ({ ...p, [k]: !p[k] }));

  // Base results
  const baseResults = useMemo(() => {
    let list = searchProducts(q, filterCat || null);

    if (tagParam === 'deals')       list = list.filter(p => p.discount >= 20);
    if (tagParam === 'bestsellers') list = list.filter(p => p.badge === 'Best Seller');
    if (filterPrime)                list = list.filter(p => p.isPrime);
    if (filterRating > 0)           list = list.filter(p => p.rating >= filterRating);
    if (filterPrice)                list = list.filter(p => p.price >= filterPrice.min && p.price <= filterPrice.max);

    switch (sort) {
      case 'price_asc':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating':     list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'newest':     list = [...list].sort((a, b) => b.id - a.id); break;
      default: break;
    }
    return list;
  }, [q, filterCat, tagParam, filterPrime, filterRating, filterPrice, sort]);

  const totalPages   = Math.ceil(baseResults.length / perPage);
  const pageResults  = baseResults.slice((page - 1) * perPage, page * perPage);

  const clearFilters = () => {
    setFilterCat('');
    setFilterRating(0);
    setFilterPrice(null);
    setFilterPrime(false);
    setSort('featured');
  };

  const hasFilters = filterCat || filterRating > 0 || filterPrice || filterPrime;

  const pageTitle = q
    ? `Results for "${q}"`
    : filterCat
    ? filterCat
    : tagParam === 'deals'
    ? "Today's Deals"
    : tagParam === 'bestsellers'
    ? 'Best Sellers'
    : 'All Products';

  // Sidebar content (shared between desktop and mobile overlay)
  const SidebarContent = () => (
    <div>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 text-amazon-blue hover:underline text-xs mb-4"
        >
          <FiX size={12} /> Clear all filters
        </button>
      )}

      {/* Category */}
      <FilterSection
        title="Category"
        open={openSections.category}
        toggle={() => toggleSection('category')}
      >
        <ul className="space-y-1">
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setFilterCat(filterCat === c.name ? '' : c.name)}
                className={`text-sm flex items-center gap-1 hover:text-amazon-orange transition-colors w-full text-left ${
                  filterCat === c.name ? 'font-bold text-amazon-orange' : 'text-amazon-dark'
                }`}
              >
                {filterCat === c.name && '✓ '}{c.icon} {c.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price range */}
      <FilterSection
        title="Price"
        open={openSections.price}
        toggle={() => toggleSection('price')}
      >
        <ul className="space-y-1">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <button
                onClick={() => setFilterPrice(filterPrice?.label === r.label ? null : { ...r, label: r.label })}
                className={`text-sm hover:text-amazon-orange transition-colors w-full text-left ${
                  filterPrice?.label === r.label ? 'font-bold text-amazon-orange' : 'text-amazon-dark'
                }`}
              >
                {filterPrice?.label === r.label ? '✓ ' : ''}{r.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Avg. Customer Review"
        open={openSections.rating}
        toggle={() => toggleSection('rating')}
      >
        {[4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(filterRating === r ? 0 : r)}
            className={`flex items-center gap-1 mb-1 hover:text-amazon-orange transition-colors w-full text-left ${
              filterRating === r ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <StarRating rating={r} size="xs" />
            <span className="text-amazon-blue text-xs hover:underline">& Up</span>
          </button>
        ))}
      </FilterSection>

      {/* Prime */}
      <FilterSection
        title="Prime Eligible"
        open={openSections.prime}
        toggle={() => toggleSection('prime')}
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterPrime}
            onChange={(e) => setFilterPrime(e.target.checked)}
            className="w-4 h-4 accent-amazon-orange"
          />
          <span className="text-sm text-amazon-dark">Prime eligible</span>
        </label>
      </FilterSection>
    </div>
  );

  return (
    <div className="max-w-[1800px] mx-auto px-2 sm:px-4 py-4">
      <div className="flex gap-4">

        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded shadow-amazon p-3 sticky top-20">
            <p className="text-amazon-dark font-bold text-base mb-3 border-b border-amazon-border pb-2">
              Filter Results
            </p>
            <SidebarContent />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <button
            className="md:hidden flex items-center gap-2 amazon-btn-secondary px-3 py-2 mb-3 text-sm"
            onClick={() => setSidebarOpen(true)}
          >
            <FiFilter size={14} /> Filter & Sort
          </button>

          {/* Header */}
          <div className="bg-white rounded shadow-amazon p-3 mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-medium text-amazon-dark">{pageTitle}</h1>
              <p className="text-xs text-amazon-text-gray">
                {baseResults.length.toLocaleString()} result{baseResults.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-amazon-dark">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="border border-amazon-border rounded px-2 py-1 text-sm text-amazon-dark bg-white focus:outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-3">
              {filterCat && (
                <span className="flex items-center gap-1 bg-white border border-amazon-orange text-amazon-orange text-xs px-2 py-1 rounded-full">
                  {filterCat} <button onClick={() => setFilterCat('')}><FiX size={11} /></button>
                </span>
              )}
              {filterPrice && (
                <span className="flex items-center gap-1 bg-white border border-amazon-orange text-amazon-orange text-xs px-2 py-1 rounded-full">
                  {filterPrice.label} <button onClick={() => setFilterPrice(null)}><FiX size={11} /></button>
                </span>
              )}
              {filterRating > 0 && (
                <span className="flex items-center gap-1 bg-white border border-amazon-orange text-amazon-orange text-xs px-2 py-1 rounded-full">
                  {filterRating}★ & up <button onClick={() => setFilterRating(0)}><FiX size={11} /></button>
                </span>
              )}
              {filterPrime && (
                <span className="flex items-center gap-1 bg-white border border-amazon-orange text-amazon-orange text-xs px-2 py-1 rounded-full">
                  Prime <button onClick={() => setFilterPrime(false)}><FiX size={11} /></button>
                </span>
              )}
            </div>
          )}

          {/* Results grid */}
          {pageResults.length === 0 ? (
            <div className="bg-white rounded shadow-amazon p-10 text-center">
              <p className="text-lg font-bold text-amazon-dark mb-2">No results found</p>
              <p className="text-amazon-text-gray text-sm mb-4">Try different keywords or remove some filters</p>
              <button onClick={clearFilters} className="amazon-btn px-6">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {pageResults.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-1 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`px-3 py-1.5 rounded text-sm border transition-colors ${
                    page === i + 1
                      ? 'bg-amazon-orange border-amazon-orange text-white font-bold'
                      : 'bg-white border-amazon-border text-amazon-dark hover:bg-amazon-bg'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="bg-black/50 flex-1" onClick={() => setSidebarOpen(false)} />
          <div className="bg-white w-72 h-full overflow-y-auto p-4 shadow-amazon-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-amazon-dark">Filter Results</p>
              <button onClick={() => setSidebarOpen(false)}>
                <FiX size={20} className="text-amazon-dark" />
              </button>
            </div>
            <SidebarContent />
            <button
              onClick={() => setSidebarOpen(false)}
              className="mt-4 w-full amazon-btn-orange py-2"
            >
              Show {baseResults.length} Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
