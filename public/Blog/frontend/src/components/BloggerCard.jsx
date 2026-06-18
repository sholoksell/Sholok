import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText } from 'react-icons/fi';

export default function BloggerCard({ blogger }) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(blogger.followers?.some((f) => f === user?._id || f?._id === user?._id));
  const [followerCount, setFollowerCount] = useState(blogger.followers?.length || 0);
  const [loading, setLoading] = useState(false);

  const avatar = blogger.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blogger.displayName || 'User')}&background=6941ff&color=fff`;

  const handleFollow = async () => {
    if (!isAuthenticated) { toast.error(t('signIn')); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.post(`/users/${blogger._id}/follow`);
      setIsFollowing(res.data.following);
      setFollowerCount((c) => c + (res.data.following ? 1 : -1));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-4 flex items-center gap-3 hover:-translate-y-0.5">
      <Link to={`/profile/${blogger.username}`} className="flex-shrink-0">
        <img src={avatar} alt={blogger.displayName} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${blogger.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-primary-600 transition block truncate">
          {blogger.displayName}
        </Link>
        <p className="text-xs text-gray-400 truncate">@{blogger.username}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400"><FiUsers className="w-3 h-3" />{followerCount}</span>
          {blogger.totalPosts !== undefined && <span className="flex items-center gap-1 text-xs text-gray-400"><FiFileText className="w-3 h-3" />{blogger.totalPosts}</span>}
        </div>
      </div>
      {user?._id !== blogger._id && (
        <button onClick={handleFollow} disabled={loading}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            isFollowing
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
              : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90'
          }`}>
          {loading ? '...' : isFollowing ? t('unfollow') : t('follow')}
        </button>
      )}
    </div>
  );
}
