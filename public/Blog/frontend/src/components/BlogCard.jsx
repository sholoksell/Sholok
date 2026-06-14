import { Link } from 'react-router-dom';
import { FiEye, FiHeart, FiMessageCircle, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function BlogCard({ post, size = 'normal' }) {
  if (!post) return null;

  const avatar = post.author?.avatar
    ? post.author.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.displayName || 'User')}&background=6941ff&color=fff`;

  if (size === 'large') {
    return (
      <div className="card overflow-hidden group hover:-translate-y-1">
        <div className="relative overflow-hidden h-56 sm:h-72">
          {post.featuredImage ? (
            <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <span className="text-6xl">{post.category?.icon || '📝'}</span>
            </div>
          )}
          {post.category && (
            <Link to={`/category/${post.category.slug}`}
              className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: post.category.color || '#6941ff' }}>
              {post.category.name}
            </Link>
          )}
          {post.isFeatured && (
            <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold bg-accent-500 text-white">⭐ Featured</span>
          )}
        </div>
        <div className="p-6">
          <Link to={`/blog/${post.slug}`} className="block">
            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition">{post.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
          </Link>
          <div className="flex items-center justify-between">
            <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-2">
              <img src={avatar} alt={post.author?.displayName} className="w-8 h-8 rounded-full object-cover" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{post.author?.displayName}</span>
            </Link>
            <div className="flex items-center gap-3 text-gray-400 text-xs">
              <span className="flex items-center gap-1"><FiEye className="w-3.5 h-3.5" />{post.views || 0}</span>
              <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" />{post.readTime || 1}m</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="card overflow-hidden group hover:-translate-y-1 flex flex-col">
      <Link to={`/blog/${post.slug}`} className="block relative overflow-hidden h-44">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400/20 to-accent-400/20 flex items-center justify-center">
            <span className="text-4xl">{post.category?.icon || '📝'}</span>
          </div>
        )}
        {post.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: post.category.color || '#6941ff' }}>
            {post.category.name}
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/blog/${post.slug}`} className="block flex-1">
          <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-1.5 line-clamp-2 group-hover:text-primary-600 transition text-sm leading-snug">
            {post.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
        </Link>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} to={`/search?q=${tag}`} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-1.5 min-w-0">
            <img src={avatar} alt={post.author?.displayName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">{post.author?.displayName}</span>
          </Link>
          <div className="flex items-center gap-2 text-gray-400 text-xs flex-shrink-0 ml-2">
            <span className="flex items-center gap-0.5"><FiEye className="w-3 h-3" />{post.views || 0}</span>
            <span className="flex items-center gap-0.5"><FiClock className="w-3 h-3" />{post.readTime || 1}m</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : ''}
        </p>
      </div>
    </article>
  );
}
