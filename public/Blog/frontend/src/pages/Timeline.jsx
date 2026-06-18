import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InfiniteScroll from 'react-infinite-scroll-component';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiUsers } from 'react-icons/fi';

export default function Timeline() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      const res = await api.get(`/posts?sort=following&page=${p}&limit=10`);
      const newPosts = res.data.posts;
      setPosts((prev) => (p === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(p < res.data.pages);
    } catch (_) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  const followingCount = user?.following?.length || 0;

  return (
    <>
      <Helmet><title>Timeline - Sholok Blog</title></Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{t('myTimeline')}</h1>
            <p className="text-gray-400 text-sm mt-1">{t('timelineSubtitle')}</p>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <FiUsers className="w-4 h-4" /> {t('followingCount')} {followingCount}
          </span>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-44 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-3 shimmer rounded w-full" />
                  <div className="h-3 shimmer rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('timelineEmpty')}</h3>
            <p className="text-gray-400 mb-6">{t('timelineEmptyDesc')}</p>
            <Link to="/search?type=users" className="btn-primary inline-flex items-center gap-2">
              <FiUsers className="w-4 h-4" /> {t('discoverBloggers')}
            </Link>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            }
            endMessage={<p className="text-center text-gray-400 py-6 text-sm">{t('timelineEnd')}</p>}>
            <div className="space-y-6">
              {posts.map((post) => <BlogCard key={post._id} post={post} size="large" />)}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </>
  );
}
