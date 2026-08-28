import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';
import { useLanguage } from '../context/LanguageContext';
import { FiChevronRight } from 'react-icons/fi';

export default function CategoryPage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeSubcat, setActiveSubcat] = useState('');

  useEffect(() => {
    setCategory(null);
    setPosts([]);
    setPage(1);
    setActiveSubcat('');
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      setPosts([]);
      setPage(1);
      fetchPosts(1);
    }
  }, [activeSubcat, category]);

  const fetchCategory = async () => {
    try {
      const res = await api.get(`/categories/${slug}`);
      setCategory(res.data.category);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (p = 1) => {
    if (!category) return;
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ category: category._id, page: p, limit: 12, sort: 'latest' });
      if (activeSubcat) params.set('subcategory', activeSubcat);
      const res = await api.get(`/posts?${params}`);
      setPosts((prev) => (p === 1 ? res.data.posts : [...prev, ...res.data.posts]));
      setPages(res.data.pages);
      setTotal(res.data.total);
    } catch (_) {} finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  if (loading && !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-40 shimmer rounded-2xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-64 shimmer" />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-3">🔍</p>
        <p className="text-gray-500">{t('categoryNotFound')}</p>
        <Link to="/" className="btn-primary mt-4 inline-block">{t('goHome')}</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} - Sholok Blog</title>
        <meta name="description" content={category.description} />
      </Helmet>

      {/* Category header */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${category.color}22 0%, ${category.color}11 100%)` }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full" style={{ background: category.color, transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: category.color, transform: 'translate(-30%, 30%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/" className="hover:text-primary-600 transition">{t('home')}</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-gray-600 dark:text-gray-300">{category.name}</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ background: `${category.color}22`, border: `2px solid ${category.color}44` }}>
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white">{category.name}</h1>
              {category.description && <p className="text-gray-500 mt-1">{category.description}</p>}
              <p className="text-sm text-gray-400 mt-1">{total.toLocaleString()} {t('postsCount')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategory filters */}
        {category.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setActiveSubcat('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${!activeSubcat ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              style={!activeSubcat ? { background: category.color } : {}}>
              {t('allFilter')}
            </button>
            {category.subcategories.map((sub) => (
              <button key={sub.slug} onClick={() => setActiveSubcat(sub.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeSubcat === sub.name ? 'text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                style={activeSubcat === sub.name ? { background: category.color } : {}}>
                {sub.icon && <span className="mr-1">{sub.icon}</span>}{sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="card h-64 shimmer" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">{category.icon}</p>
            <p className="text-gray-400">{t('noCategoryPosts')}</p>
            <Link to="/write" className="btn-primary mt-4 inline-block">{t('beFirstToWrite')}</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => <BlogCard key={post._id} post={post} />)}
            </div>
            {page < pages && (
              <div className="text-center mt-10">
                <button onClick={loadMore} disabled={loadingMore} className="btn-outline disabled:opacity-50">
                  {loadingMore ? t('loading') : t('loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
