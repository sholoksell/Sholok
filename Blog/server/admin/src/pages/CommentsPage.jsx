import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiTrash2, FiSearch, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [spamOnly, setSpamOnly] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchComments = useCallback(async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20 });
      if (spamOnly) params.set('isSpam', 'true');
      const res = await api.get(`/admin/comments?${params}`);
      setComments(res.data.comments || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (_) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [spamOnly, page]);

  useEffect(() => { fetchComments(1); setPage(1); }, [spamOnly]);
  useEffect(() => { fetchComments(page); }, [page]);

  const markSpam = async (comment) => {
    setActionId(comment._id + '-spam');
    try {
      await api.put(`/admin/comments/${comment._id}/spam`);
      setComments((prev) => prev.map((c) => c._id === comment._id ? { ...c, isSpam: true, isDeleted: true } : c));
      toast.success('Marked as spam');
    } catch (_) { toast.error('Failed'); } finally { setActionId(null); }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    setActionId(comment._id + '-delete');
    try {
      await api.delete(`/admin/comments/${comment._id}`);
      setComments((prev) => prev.filter((c) => c._id !== comment._id));
      setTotal((t) => t - 1);
      toast.success('Comment deleted');
    } catch (_) { toast.error('Failed'); } finally { setActionId(null); }
  };

  const filtered = search
    ? comments.filter((c) =>
        c.content.toLowerCase().includes(search.toLowerCase()) ||
        c.author?.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : comments;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Comments</h1>
          <p className="text-gray-400 text-sm">{total} total comments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comments..."
            className="input pl-10 py-2"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={spamOnly}
            onChange={(e) => setSpamOnly(e.target.checked)}
            className="w-4 h-4 accent-red-500 rounded"
          />
          <span className="text-sm text-gray-600 font-medium">Spam only</span>
        </label>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Comment</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Author</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Post</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.map((comment) => (
                <tr key={comment._id} className={`hover:bg-gray-50/50 transition ${comment.isSpam ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-gray-800 line-clamp-2 leading-snug">{comment.content}</p>
                    {comment.isSpam && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">Spam</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    {comment.author?.displayName || comment.author?.username || '—'}
                  </td>
                  <td className="px-5 py-4 max-w-[160px]">
                    <p className="text-gray-600 text-xs line-clamp-2">{comment.post?.title}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                    {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {comment.post?.slug && (
                        <a
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition"
                          title="View post"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {!comment.isSpam && (
                        <button
                          onClick={() => markSpam(comment)}
                          disabled={actionId === comment._id + '-spam'}
                          className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition"
                          title="Mark as spam"
                        >
                          <FiAlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(comment)}
                        disabled={actionId === comment._id + '-delete'}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">No comments found</div>
          )}
        </div>

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
