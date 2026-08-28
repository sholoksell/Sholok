import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { FiEye, FiPlay, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function ShortClips() {
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [playing, setPlaying] = useState(null);

  useEffect(() => {
    fetchClips(1);
  }, []);

  const fetchClips = async (p) => {
    try {
      const res = await api.get(`/posts/short-clips?page=${p}&limit=12`);
      const items = res.data.posts;
      setClips((prev) => (p === 1 ? items : [...prev, ...items]));
      setHasMore(p < res.data.pages);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchClips(next);
  };

  return (
    <>
      <Helmet><title>Short Clips - Sholok Blog</title></Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-500 text-white rounded-full text-sm font-semibold mb-4">
            <FiPlay className="w-4 h-4" /> Short Clips
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3">
            Discover <span className="gradient-text">Short Video Clips</span>
          </h1>
          <p className="text-gray-400">Quick video content from our bloggers</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[9/16] shimmer rounded-2xl" />)}
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No clips yet</h3>
            <p className="text-gray-400 mb-6">Be the first to post a short video clip!</p>
            <Link to="/write" className="btn-primary">Create Post with Clip</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {clips.map((post) => {
                const video = post.videos?.find((v) => v.isShortClip) || post.videos?.[0];
                if (!video) return null;
                return (
                  <div key={post._id} className="relative group rounded-2xl overflow-hidden cursor-pointer bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    style={{ aspectRatio: '9/16' }}
                    onClick={() => setPlaying(playing === post._id ? null : post._id)}>
                    {/* Thumbnail / Video */}
                    {playing === post._id ? (
                      <video src={video.url} autoPlay controls className="w-full h-full object-cover" />
                    ) : (
                      <>
                        {video.thumbnail || post.featuredImage ? (
                          <img src={video.thumbnail || post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                            <FiPlay className="w-12 h-12 text-white opacity-50" />
                          </div>
                        )}
                        {/* Play button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform border border-white/30">
                            <FiPlay className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <Link to={`/blog/${post.slug}`} className="block" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-white text-sm font-semibold line-clamp-2 mb-1 hover:text-primary-300 transition">{post.title}</h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.displayName || 'U')}&background=6941ff&color=fff&size=30`}
                                alt="" className="w-5 h-5 rounded-full object-cover" />
                              <span className="text-white/70 text-xs truncate max-w-[80px]">{post.author?.displayName}</span>
                            </Link>
                            <span className="flex items-center gap-1 text-white/70 text-xs"><FiEye className="w-3 h-3" />{post.views}</span>
                          </div>
                        </div>
                        {/* Duration badge */}
                        {video.title && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FiClock className="w-3 h-3" /> Clip
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button onClick={loadMore} className="btn-outline">Load More Clips</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
