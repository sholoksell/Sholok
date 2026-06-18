import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ReactionBar from '../components/ReactionBar';
import CommentSection from '../components/CommentSection';
import BlogCard from '../components/BlogCard';
import toast from 'react-hot-toast';
import { FiEye, FiClock, FiShare2, FiBookmark, FiUsers, FiArrowLeft, FiCalendar } from 'react-icons/fi';

export default function BlogDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { getLocalizedField, t } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/posts/${slug}`);
      setPost(res.data.post);
      setRelated(res.data.related);
      setFollowerCount(res.data.post.author?.followers?.length || 0);
      if (user && res.data.post.author?.followers) {
        setIsFollowing(res.data.post.author.followers.some((f) => f === user._id || f?._id === user._id));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/');
        toast.error('Post not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const res = await api.post(`/users/${post.author._id}/follow`);
      setIsFollowing(res.data.following);
      setFollowerCount((c) => c + (res.data.following ? 1 : -1));
    } catch (_) { toast.error('Failed to follow'); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: getLocalizedField(post, 'title'), url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSaving(true);
    try {
      const res = await api.post(`/users/${user._id}/save-post`, { postId: post._id });
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Post saved!' : 'Post unsaved');
    } catch (_) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 shimmer rounded-2xl mb-8" />
        <div className="space-y-3">
          <div className="h-8 shimmer rounded w-3/4" />
          <div className="h-4 shimmer rounded w-1/2" />
          <div className="h-4 shimmer rounded w-full" />
          <div className="h-4 shimmer rounded w-full" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  const avatar = post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.displayName || 'User')}&background=6941ff&color=fff`;
  const postTitle = getLocalizedField(post, 'title');
  const postContent = getLocalizedField(post, 'content');
  const postExcerpt = getLocalizedField(post, 'excerpt');
  const categoryName = post.category ? getLocalizedField(post.category, 'name') : '';

  return (
    <>
      <Helmet>
        <title>{post.seoTitle || postTitle} - Sholok Blog</title>
        <meta name="description" content={post.seoDescription || postExcerpt} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-2">
            {/* Back button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition mb-6 text-sm font-medium">
              <FiArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
                <img src={post.featuredImage} alt={postTitle} className="w-full max-h-96 object-cover" />
              </div>
            )}

            {/* Category & tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {post.category && (
                <Link to={`/category/${post.category.slug}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: post.category.color || '#6941ff' }}>
                  {categoryName}
                </Link>
              )}
              {post.subcategory && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {post.subcategory}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {postTitle}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </span>
              <span className="flex items-center gap-1.5"><FiEye className="w-4 h-4" />{post.views?.toLocaleString()} views</span>
              <span className="flex items-center gap-1.5"><FiClock className="w-4 h-4" />{post.readTime || 1} min read</span>
            </div>

            {/* Author */}
            <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-8">
              <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3">
                <img src={avatar} alt={post.author?.displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/30" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{post.author?.displayName}</p>
                  <p className="text-sm text-gray-500">@{post.author?.username}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <FiUsers className="w-3 h-3" /> {followerCount} followers
                  </p>
                </div>
              </Link>
              <div className="flex gap-2">
                {user?._id !== post.author?._id && (
                  <button onClick={handleFollow}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      isFollowing
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
                        : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90'
                    }`}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: postContent }} />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                {post.tags.map((tag) => (
                  <Link key={tag} to={`/search?q=${tag}`}
                    className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Reaction & Share bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <ReactionBar postId={post._id} />
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving}
                  className={`p-2.5 rounded-xl transition ${saved ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'}`}>
                  <FiBookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShare} className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition">
                  <FiShare2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Videos */}
            {post.videos && post.videos.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">📹 Videos</h3>
                <div className="space-y-4">
                  {post.videos.map((video, i) => (
                    <video key={i} controls className="w-full rounded-xl" src={video.url} />
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="mt-10">
              <CommentSection postId={post._id} />
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Author card */}
            <div className="card p-6 text-center">
              <Link to={`/profile/${post.author?.username}`}>
                <img src={avatar} alt={post.author?.displayName} className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-primary-500/20 mb-3" />
                <h3 className="font-bold font-heading text-gray-900 dark:text-white">{post.author?.displayName}</h3>
                <p className="text-sm text-gray-500 mb-1">@{post.author?.username}</p>
              </Link>
              {post.author?.bio && <p className="text-sm text-gray-500 mb-4 line-clamp-3">{post.author.bio}</p>}
              <div className="flex justify-center gap-6 mb-4 text-center">
                <div><p className="font-bold text-gray-900 dark:text-white">{followerCount}</p><p className="text-xs text-gray-400">Followers</p></div>
              </div>
              {user?._id !== post.author?._id && (
                <button onClick={handleFollow}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
                      : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white'
                  }`}>
                  {isFollowing ? t('unfollow') : t('followBlogger')}
                </button>
              )}
            </div>

            {/* Related posts */}
            {related.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('relatedPosts')}</h3>
                <div className="space-y-4">
                  {related.map((p) => (
                    <Link key={p._id} to={`/blog/${p.slug}`} className="flex gap-3 group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        {p.featuredImage ? (
                          <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xl">
                            {p.category?.icon || '📝'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition">{p.title}</h4>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiEye className="w-3 h-3" />{p.views}</p>
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
