import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import BlogCard from '../components/BlogCard';
import BloggerCard from '../components/BloggerCard';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowRight, FiTrendingUp, FiStar, FiUsers } from 'react-icons/fi';

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 shimmer rounded w-3/4" />
        <div className="h-3 shimmer rounded w-full" />
        <div className="h-3 shimmer rounded w-2/3" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const CATEGORIES = [
    { name: t('entertainment'), slug: 'entertainment', icon: '🎨', desc: t('entDesc'), color: 'from-pink-500 to-rose-500' },
    { name: t('lifestyle'), slug: 'lifestyle', icon: '🛍️', desc: t('lifeDesc'), color: 'from-purple-500 to-violet-500' },
    { name: t('hobbiesTravel'), slug: 'hobbies-travel', icon: '🧭', desc: t('hobbiesDesc'), color: 'from-blue-500 to-cyan-500' },
    { name: t('knowledge'), slug: 'knowledge', icon: '🧠', desc: t('knowledgeDesc'), color: 'from-green-500 to-emerald-500' },
  ];
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [topBloggers, setTopBloggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes, latestRes, bloggersRes] = await Promise.all([
        api.get('/posts/featured'),
        api.get('/posts/trending'),
        api.get('/posts?limit=12&sort=latest'),
        api.get('/users?limit=6'),
      ]);
      setFeaturedPosts(featuredRes.data.posts);
      setTrendingPosts(trendingRes.data.posts);
      setLatestPosts(latestRes.data.posts);
      setTopBloggers(bloggersRes.data.users);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const heroPost = featuredPosts[0] || trendingPosts[0];

  return (
    <>
      <Helmet>
        <title>Sholok Blog - Discover Amazing Stories</title>
        <meta name="description" content="Discover amazing stories, share your thoughts, connect with bloggers worldwide." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-accent-900/80" />
          {heroPost?.featuredImage && (
            <img src={heroPost.featuredImage} alt="" className="w-full h-full object-cover opacity-20" />
          )}
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="px-3 py-1 bg-accent-500/20 border border-accent-500/30 text-accent-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                {t('featuredPlatform')}
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('heroTitle1')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                {t('heroTitle2')}
              </span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl leading-relaxed">
              {t('heroDescription')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-all duration-300 shadow-2xl hover:shadow-accent-500/30 flex items-center gap-2">
                {t('startWriting')} <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/search?sort=trending" className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4" /> {t('exploreTrending')}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-white/10">
              {[
                { label: t('activeBloggers'), value: '10K+', icon: FiUsers },
                { label: t('blogPosts'), value: '50K+', icon: FiStar },
                { label: t('monthlyReaders'), value: '2M+', icon: FiTrendingUp },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-heading">{stat.value}</p>
                    <p className="text-xs text-white/60">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">{t('exploreCategories')}</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/category/${cat.slug}`}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${cat.color} text-white group hover:scale-105 transition-transform duration-300 shadow-lg`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-4 -translate-y-8" />
              <span className="text-4xl mb-3 block">{cat.icon}</span>
              <h3 className="font-bold font-heading text-lg leading-tight">{cat.name}</h3>
              <p className="text-white/70 text-xs mt-1">{cat.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-white/80 text-xs font-medium">
                {t('explore')} <FiArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Trending */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary-600 to-accent-500 rounded-full" />
                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{t('trendingNow')}</h2>
                </div>
                <Link to="/search?sort=trending" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  {t('seeAll')} <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : trendingPosts.length > 0 ? (
                <div className="space-y-4">
                  {trendingPosts[0] && <BlogCard post={trendingPosts[0]} size="large" />}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {trendingPosts.slice(1, 3).map((post) => <BlogCard key={post._id} post={post} />)}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">{t('noTrendingYet')}</p>
              )}
            </section>

            {/* Latest Posts */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full" />
                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{t('latestPosts')}</h2>
                </div>
                <Link to="/search?sort=latest" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  {t('seeAll')} <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {latestPosts.map((post) => <BlogCard key={post._id} post={post} />)}
                </div>
              )}
              {!loading && (
                <div className="text-center mt-6">
                  <Link to="/search" className="btn-outline inline-flex items-center gap-2">
                    {t('loadMore')} <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Top Bloggers */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-gradient-to-b from-accent-500 to-primary-500 rounded-full" />
                <h3 className="font-bold text-gray-900 dark:text-white">🌟 {t('topBloggers')}</h3>
              </div>
              {loading ? (
                <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 shimmer rounded-xl" />)}</div>
              ) : (
                <div className="space-y-3">
                  {topBloggers.map((blogger) => <BloggerCard key={blogger._id} blogger={blogger} />)}
                </div>
              )}
              <Link to="/search?type=users" className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2">
                {t('seeAll')} {t('bloggersTab')} <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Quick Write CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 p-6 text-white">
              <h3 className="font-heading font-bold text-lg mb-2">{t('startWriting')}</h3>
              <p className="text-white/70 text-sm mb-4">{t('heroDescription').slice(0, 60)}...</p>
              <Link to="/write" className="bg-white text-primary-700 font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition text-sm inline-flex items-center gap-2">
                {t('writePost')} <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Featured Posts Widget */}
            {featuredPosts.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>⭐</span> {t('featuredBadge').replace('⭐ ', '')}  {/* Featured Posts */}
                </h3>
                <div className="space-y-4">
                  {featuredPosts.slice(0, 3).map((post) => (
                    <Link key={post._id} to={`/blog/${post.slug}`} className="flex gap-3 group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-2xl">
                            {post.category?.icon || '📝'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition">{post.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{post.author?.displayName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
