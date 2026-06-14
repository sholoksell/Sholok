import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiSend, FiHeart, FiTrash2, FiCornerDownRight, FiChevronDown } from 'react-icons/fi';

function CommentItem({ comment, postId, onDelete }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const [liked, setLiked] = useState(comment.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/login');
    try {
      const res = await api.post(`/comments/${comment._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likes);
    } catch (_) {}
  };

  const handleReply = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/comments/${postId}`, { content: replyText.trim(), parentComment: comment._id });
      setReplies((prev) => [...prev, res.data.comment]);
      setReplyText('');
      setShowReplyInput(false);
      toast.success('Reply posted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const avatar = (u) => u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.displayName || 'U')}&background=6941ff&color=fff`;

  return (
    <div className="flex gap-3">
      <Link to={`/profile/${comment.author?.username}`} className="flex-shrink-0">
        <img src={avatar(comment.author)} alt={comment.author?.displayName} className="w-9 h-9 rounded-full object-cover" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${comment.author?.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 transition">
              {comment.author?.displayName}
            </Link>
            <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
        </div>

        <div className="flex items-center gap-4 mt-1.5 ml-2">
          <button onClick={handleLike} className={`flex items-center gap-1 text-xs transition ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
            <FiHeart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} /> {likesCount > 0 && likesCount}
          </button>
          {isAuthenticated && (
            <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-xs text-gray-400 hover:text-primary-500 transition flex items-center gap-1">
              <FiCornerDownRight className="w-3.5 h-3.5" /> Reply
            </button>
          )}
          {(user?._id === comment.author?._id || user?.role === 'admin') && (
            <button onClick={() => onDelete(comment._id)} className="text-xs text-gray-400 hover:text-red-500 transition flex items-center gap-1">
              <FiTrash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="flex gap-2 mt-2">
            <img src={avatar(user)} alt={user?.displayName} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                placeholder="Write a reply..."
                className="input text-sm pr-10 py-2 rounded-full"
                autoFocus
              />
              <button onClick={handleReply} disabled={loading || !replyText.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-600 disabled:opacity-40">
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-3 space-y-3 ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} postId={postId} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentSection({ postId }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId, page]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/comments/${postId}?page=${page}&limit=20`);
      if (page === 1) setComments(res.data.comments);
      else setComments((prev) => [...prev, ...res.data.comments]);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to comment'); navigate('/login'); return; }
    if (!commentText.trim()) return;
    if (commentText.length > 2000) { toast.error('Comment is too long'); return; }
    setSubmitting(true);
    try {
      const res = await api.post(`/comments/${postId}`, { content: commentText.trim() });
      setComments((prev) => [res.data.comment, ...prev]);
      setTotal((t) => t + 1);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.map((c) => c._id === commentId ? { ...c, content: '[Comment deleted]', isDeleted: true } : c));
      toast.success('Comment deleted');
    } catch (_) { toast.error('Failed to delete comment'); }
  };

  const avatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'U')}&background=6941ff&color=fff`;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-6">Comments ({total})</h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        {isAuthenticated ? (
          <img src={avatar} alt={user?.displayName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        )}
        <div className="flex-1 relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isAuthenticated ? 'Share your thoughts...' : 'Sign in to comment'}
            disabled={!isAuthenticated}
            rows={2}
            className="input text-sm resize-none pr-14 rounded-2xl"
            onFocus={() => !isAuthenticated && navigate('/login')}
          />
          <button type="submit" disabled={submitting || !commentText.trim() || !isAuthenticated}
            className="absolute right-3 bottom-3 btn-primary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-50">
            <FiSend className="w-3.5 h-3.5" /> Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading && page === 1 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full shimmer flex-shrink-0" />
              <div className="flex-1"><div className="h-16 shimmer rounded-2xl" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} postId={postId} onDelete={handleDelete} />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-sm">Be the first to comment!</p>
            </div>
          )}
        </div>
      )}

      {page < pages && (
        <button onClick={() => setPage((p) => p + 1)} disabled={loading}
          className="mt-6 w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2">
          <FiChevronDown className="w-4 h-4" /> Load more comments
        </button>
      )}
    </div>
  );
}
