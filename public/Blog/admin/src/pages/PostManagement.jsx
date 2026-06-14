import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FiSearch, FiEye, FiEdit3, FiTrash2, FiStar, FiFilter } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-yellow-50 text-yellow-700',
  scheduled: 'bg-blue-50 text-blue-700',
  deleted: 'bg-red-50 text-red-600',
};

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPosts = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/admin/posts?${params}`);
      setPosts(res.data.posts);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (_) {} finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchPosts(1); setPage(1); }, [search, statusFilter]);
  useEffect(() => { fetchPosts(page); }, [page]);

  const toggleFeatured = async (post) => {
    setActionLoading(post._id + '-featured');
    try {
      const res = await api.put(`/admin/posts/${post._id}`, { isFeatured: !post.isFeatured });
      setPosts((prev) => prev.map((p) => p._id === post._id ? { ...p, isFeatured: res.data.post.isFeatured } : p));
      toast.success(res.data.post.isFeatured ? 'Post featured!' : 'Removed from featured');
    } catch (_) { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const changeStatus = async (post, status) => {
    setActionLoading(post._id + '-status');
    try {
      await api.put(`/admin/posts/${post._id}`, { status });
      setPosts((prev) => prev.map((p) => p._id === post._id ? { ...p, status } : p));
      toast.success('Status updated');
    } catch (_) { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const deletePost = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    setActionLoading(post._id + '-delete');
    try {
      await api.delete(`/admin/posts/${post._id}`);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success('Post deleted');
    } catch (_) { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Post Management</h1>
          <p className="text-gray-400 text-sm">{total} total posts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." className="input pl-10 py-2" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto py-2">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Post</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Author</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Views</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                        {post.featuredImage ? <img src={post.featuredImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-base">{post.category?.icon || '📝'}</div>}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                        <p className="text-xs text-gray-400">{post.category?.name}</p>
                      </div>
                      {post.isFeatured && <FiStar className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{post.author?.displayName}</td>
                  <td className="px-5 py-4">
                    <select value={post.status} onChange={(e) => changeStatus(post, e.target.value)}
                      disabled={actionLoading === post._id + '-status'}
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_COLORS[post.status] || 'bg-gray-50 text-gray-600'}`}>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="deleted">Deleted</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{(post.views || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : '-'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`http://localhost:5173/blog/${post.slug}`} target="_blank" rel="noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition" title="View">
                        <FiEye className="w-4 h-4" />
                      </a>
                      <button onClick={() => toggleFeatured(post)} disabled={actionLoading === post._id + '-featured'}
                        className={`p-2 rounded-lg transition ${post.isFeatured ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`} title="Toggle Featured">
                        <FiStar className={`w-4 h-4 ${post.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                      <button onClick={() => deletePost(post)} disabled={actionLoading === post._id + '-delete'}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Delete">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">No posts found</div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
