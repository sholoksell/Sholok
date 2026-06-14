import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';
import { FiSearch, FiFilter, FiUser, FiGrid } from 'react-icons/fi';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'posts';
  const sort = searchParams.get('sort') || 'relevance';

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    setInputValue(q);
    setPage(1);
    if (q) search(1, q);
  }, [q, type, sort, selectedCategory]);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const search = async (p = page, query = q) => {
    if (!query.trim() && sort !== 'trending') return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query || 'trending', type, sort, page: p, limit: 12 });
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await api.get(`/search?${params}`);

      if (type === 'users') {
        setResults(p === 1 ? res.data.users : (prev) => [...prev, ...res.data.users]);
      } else {
        setResults(p === 1 ? res.data.posts : (prev) => [...prev, ...res.data.posts]);
      }
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => { prev.set('q', inputValue); return prev; });
  };

  const setParam = (key, val) => {
    setSearchParams((prev) => { prev.set(key, val); return prev; });
    setPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{q ? `"${q}" - Search` : 'Search'} - Sholok Blog</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-8">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search posts, tags, writers..."
            className="w-full pl-14 pr-16 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 text-base shadow-sm"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm">
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Type toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl gap-1">
            {[{ val: 'posts', icon: FiGrid, label: 'Posts' }, { val: 'users', icon: FiUser, label: 'Bloggers' }].map((t) => (
              <button key={t.val} onClick={() => setParam('type', t.val)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${type === t.val ? 'bg-white dark:bg-gray-900 shadow text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>

          {type === 'posts' && (
            <>
              {/* Sort */}
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary-500">
                <option value="relevance">Most Relevant</option>
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
              </select>

              {/* Category filter */}
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary-500">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </>
          )}

          {q && total > 0 && (
            <span className="text-sm text-gray-500">{total.toLocaleString()} {type === 'users' ? 'bloggers' : 'posts'} found{q ? ` for "${q}"` : ''}</span>
          )}
        </div>

        {/* Results */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{q ? `No results for "${q}"` : 'Search for something'}</h3>
            <p className="text-gray-400">Try different keywords or browse categories</p>
          </div>
        ) : type === 'users' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((user) => (
              <Link key={user._id} to={`/profile/${user.username}`}
                className="card p-5 flex items-center gap-4 hover:-translate-y-1">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=6941ff&color=fff`}
                  alt={user.displayName} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.displayName}</h3>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
                  <p className="text-xs text-primary-500 mt-1">{user.followers?.length || 0} followers</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((post) => <BlogCard key={post._id} post={post} />)}
          </div>
        )}

        {page < pages && !loading && (
          <div className="text-center mt-10">
            <button onClick={() => { const next = page + 1; setPage(next); search(next); }}
              className="btn-outline inline-flex items-center gap-2">
              Load More
            </button>
          </div>
        )}
      </div>
    </>
  );
}
