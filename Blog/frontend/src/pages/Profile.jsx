import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BlogCard from '../components/BlogCard';
import toast from 'react-hot-toast';
import { FiEdit3, FiUsers, FiFileText, FiEye, FiGlobe, FiMapPin, FiUserCheck, FiUserPlus } from 'react-icons/fi';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    window.scrollTo(0, 0);
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${username}`);
      setProfile(res.data.user);
      setPosts(res.data.posts);
      setIsFollowing(res.data.isFollowing);
      setFollowerCount(res.data.user.followers?.length || 0);
    } catch (error) {
      if (error.response?.status === 404) { toast.error('User not found'); navigate('/'); }
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await api.get(`/users/${profile._id}/followers`);
      setFollowers(res.data.followers);
    } catch (_) {}
  };

  const fetchFollowing = async () => {
    try {
      const res = await api.get(`/users/${profile._id}/following`);
      setFollowing(res.data.following);
    } catch (_) {}
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'followers' && followers.length === 0) fetchFollowers();
    if (tab === 'following' && following.length === 0) fetchFollowing();
  };

  const handleFollow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setFollowLoading(true);
    try {
      const res = await api.post(`/users/${profile._id}/follow`);
      setIsFollowing(res.data.following);
      setFollowerCount((c) => c + (res.data.following ? 1 : -1));
      toast.success(res.data.following ? 'Following!' : 'Unfollowed');
    } catch (_) { toast.error('Failed'); } finally { setFollowLoading(false); }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 shimmer" />
        <div className="max-w-5xl mx-auto px-4 -mt-16 pb-16">
          <div className="w-32 h-32 rounded-full shimmer mb-4" />
          <div className="h-8 shimmer rounded w-48 mb-2" />
          <div className="h-4 shimmer rounded w-64" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const avatar = profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=6941ff&color=fff&size=200`;
  const isOwn = currentUser?._id === profile._id;

  return (
    <>
      <Helmet><title>{profile.displayName} - Sholok Blog</title></Helmet>

      {/* Cover */}
      <div className="h-48 lg:h-64 relative overflow-hidden">
        {profile.coverImage ? (
          <img src={profile.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 via-primary-700 to-accent-700" />
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 sm:-mt-20 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <img src={avatar} alt={profile.displayName}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover ring-4 ring-white dark:ring-gray-950 shadow-xl" />
              <div className="sm:pb-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{profile.displayName}</h1>
                <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {profile.location && <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" />{profile.location}</span>}
                  {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-500 hover:underline"><FiGlobe className="w-4 h-4" />{profile.website}</a>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:pb-2">
              {isOwn ? (
                <Link to="/dashboard" className="btn-outline flex items-center gap-2 text-sm py-2">
                  <FiEdit3 className="w-4 h-4" /> {t('editProfile')}
                </Link>
              ) : (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'
                      : 'bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90 shadow-lg'
                  }`}>
                  {isFollowing ? <FiUserCheck className="w-4 h-4" /> : <FiUserPlus className="w-4 h-4" />}
                  {followLoading ? '...' : isFollowing ? t('followingStatus') : t('followBtn')}
                </button>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4">
            {[
              { label: t('postsLabel'), value: posts.length, icon: FiFileText },
              { label: t('followersLabel'), value: followerCount, icon: FiUsers },
              { label: t('followingLabel'), value: profile.following?.length || 0, icon: FiUserCheck },
              { label: t('totalViews'), value: (profile.totalViews || 0).toLocaleString(), icon: FiEye },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2">
                <stat.icon className="w-4 h-4 text-primary-500" />
                <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800 mt-6 overflow-x-auto">
          {[
            { key: 'posts', label: t('postsLabel'), count: posts.length },
            { key: 'followers', label: t('followersLabel'), count: followerCount },
            { key: 'following', label: t('followingLabel'), count: profile.following?.length || 0 },
          ].map((tab) => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-8">
          {activeTab === 'posts' && (
            posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => <BlogCard key={post._id} post={post} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">✍️</p>
                <p className="text-gray-500">{isOwn ? t('noPostsOwn') : `${profile.displayName} ${t('noPostsOwn')}`}</p>
                {isOwn && <Link to="/write" className="btn-primary mt-4 inline-flex items-center gap-2">{t('writeFirstPostBtn')}</Link>}
              </div>
            )
          )}

          {(activeTab === 'followers' || activeTab === 'following') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'followers' ? followers : following).map((u) => (
                <Link key={u._id} to={`/profile/${u.username}`}
                  className="card p-4 flex items-center gap-3 hover:-translate-y-0.5">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=6941ff&color=fff`}
                    alt={u.displayName} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{u.displayName}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                    {u.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{u.bio}</p>}
                  </div>
                </Link>
              ))}
              {((activeTab === 'followers' ? followers : following).length === 0) && (
                <div className="col-span-full text-center py-8 text-gray-400">
                  {activeTab === 'followers' ? t('noFollowersYet') : t('noFollowingYet')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
