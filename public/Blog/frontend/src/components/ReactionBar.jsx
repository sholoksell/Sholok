import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiThumbsUp, FiHeart, FiSmile, FiStar, FiFrown, FiAlertCircle, FiUsers } from 'react-icons/fi';

const REACTIONS = [
  { type: 'like', emoji: '👍', label: 'Like', icon: FiThumbsUp, color: 'text-blue-500' },
  { type: 'heart', emoji: '❤️', label: 'Heart', icon: FiHeart, color: 'text-red-500' },
  { type: 'funny', emoji: '😂', label: 'Funny', icon: FiSmile, color: 'text-yellow-500' },
  { type: 'amazing', emoji: '🤩', label: 'Amazing', icon: FiStar, color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', icon: FiFrown, color: 'text-indigo-500' },
  { type: 'support', emoji: '🙌', label: 'Support', icon: FiUsers, color: 'text-green-500' },
  { type: 'angry', emoji: '😠', label: 'Angry', icon: FiAlertCircle, color: 'text-red-600' },
];

export default function ReactionBar({ postId }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ like: 0, heart: 0, funny: 0, amazing: 0, sad: 0, angry: 0, support: 0, total: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [postId]);

  const fetchReactions = async () => {
    try {
      const res = await api.get(`/reactions/${postId}`);
      setSummary(res.data.summary);
      setUserReaction(res.data.userReaction);
    } catch (_) {}
  };

  const handleReact = async (type) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to react to posts');
      navigate('/login');
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/reactions/${postId}`, { type });
      setSummary(res.data.summary);
      setUserReaction(res.data.removed ? null : type);
      setShowPicker(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to react');
    } finally {
      setLoading(false);
    }
  };

  const currentReaction = REACTIONS.find((r) => r.type === userReaction);
  const topReactions = REACTIONS.filter((r) => summary[r.type] > 0).sort((a, b) => summary[b.type] - summary[a.type]).slice(0, 3);

  return (
    <div className="flex items-center gap-4">
      {/* Reaction Picker */}
      <div className="relative">
        <button
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          onClick={() => currentReaction ? handleReact(currentReaction.type) : setShowPicker(!showPicker)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 ${
            userReaction
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600'
          }`}
        >
          {currentReaction ? (
            <><span>{currentReaction.emoji}</span> {currentReaction.label}</>
          ) : (
            <><span>👍</span> React</>
          )}
        </button>

        {showPicker && (
          <div
            onMouseEnter={() => setShowPicker(true)}
            onMouseLeave={() => setShowPicker(false)}
            className="absolute bottom-full left-0 mb-2 flex items-center gap-1 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 px-3 py-2 z-50 animate-slide-up"
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                onClick={() => handleReact(r.type)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 hover:scale-125 hover:bg-gray-50 dark:hover:bg-gray-800 ${userReaction === r.type ? 'bg-primary-50 dark:bg-primary-900/30 scale-110' : ''}`}
                title={r.label}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-xs text-gray-500">{summary[r.type] > 0 ? summary[r.type] : ''}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary.total > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {topReactions.map((r) => (
              <span key={r.type} className="text-lg">{r.emoji}</span>
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{summary.total.toLocaleString()} reactions</span>
        </div>
      )}
    </div>
  );
}
