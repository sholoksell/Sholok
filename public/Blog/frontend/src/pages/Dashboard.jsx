import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiEdit3, FiTrash2, FiEye, FiBarChart2, FiMessageCircle, FiHeart, FiStar, FiUser, FiCamera, FiSave } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`card p-5 flex items-center gap-4 border-l-4 ${color}`}>
    <div className={`p-3 rounded-xl ${color.replace('border-l-', 'bg-').replace('-500', '-100')} dark:${color.replace('border-l-', 'bg-').replace('-500', '-900/30')}`}>
      <Icon className={`w-6 h-6 ${color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ displayName: '', bio: '', website: '', location: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ displayName: user.displayName || '', bio: user.bio || '', website: user.website || '', location: user.location || '' });
      setAvatarPreview(user.avatar || '');
    }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, postsRes] = await Promise.all([
        api.get('/analytics/my-stats?days=30'),
        api.get('/posts/my-posts'),
      ]);
      setStats(statsRes.data.stats);
      setPosts(postsRes.data.posts);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post permanently?')) return;
    setDeletingId(postId);
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (_) {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => formData.append(k, v));
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (_) { toast.error('Failed to update profile'); } finally { setSaving(false); }
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'posts', label: '📝 My Posts' },
    { key: 'profile', label: '👤 Edit Profile' },
  ];

  return (
    <>
      <Helmet><title>Dashboard - Sholok Blog</title></Helmet>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.displayName}!</p>
          </div>
          <Link to="/write" className="btn-primary flex items-center gap-2 text-sm">
            <FiEdit3 className="w-4 h-4" /> Write Post
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="card h-24 shimmer" />)}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FiEye} label="Total Views (30d)" value={stats?.views || 0} color="border-l-primary-500" />
                <StatCard icon={FiHeart} label="Total Reactions" value={stats?.reactions || 0} color="border-l-accent-500" />
                <StatCard icon={FiMessageCircle} label="Comments" value={stats?.comments || 0} color="border-l-blue-500" />
                <StatCard icon={FiBarChart2} label="Published Posts" value={posts.filter(p => p.status === 'published').length} color="border-l-green-500" />
              </div>

              {/* Top posts */}
              <div className="card p-6">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Top Performing Posts</h2>
                {posts.slice(0, 5).sort((a, b) => b.views - a.views).map((post) => (
                  <div key={post._id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="flex-1 min-w-0 mr-4">
                      <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">{post.title}</Link>
                      <p className="text-xs text-gray-400">{post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : 'Draft'}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FiEye className="w-3 h-3" />{post.views}</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <p className="text-gray-400 text-center py-4">No posts yet. <Link to="/write" className="text-primary-600 hover:underline">Write your first post!</Link></p>}
              </div>
            </div>
          )
        )}

        {/* Posts management */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="card h-16 shimmer" />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-3">📝</p>
                <p className="text-gray-400 mb-4">No posts yet</p>
                <Link to="/write" className="btn-primary">Write First Post</Link>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">{posts.length} posts total</div>
                <div className="space-y-3">
                  {posts.map((post) => (
                    <div key={post._id} className="card p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-lg">
                            {post.category?.icon || '📝'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{post.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            post.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : post.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}>{post.status}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1"><FiEye className="w-3 h-3" />{post.views || 0}</span>
                          {post.isFeatured && <span className="flex items-center gap-1 text-xs text-yellow-500"><FiStar className="w-3 h-3" />Featured</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/blog/${post.slug}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/write/${post._id}`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Edit">
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(post._id)} disabled={deletingId === post._id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Profile editing */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            {/* Avatar */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=6941ff&color=fff&size=100`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-2xl object-cover"
                  />
                  <label className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-xl cursor-pointer hover:bg-primary-700 transition shadow-lg">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                    }} />
                    <FiCamera className="w-3.5 h-3.5" />
                  </label>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.displayName}</p>
                  <p className="text-sm text-gray-400">@{user?.username}</p>
                  <p className="text-xs text-gray-400 mt-1">Click camera icon to change photo</p>
                </div>
              </div>
            </div>

            {/* Profile form */}
            <div className="card p-6 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Profile Information</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Display Name</label>
                <input type="text" value={profileForm.displayName} onChange={(e) => setProfileForm(f => ({ ...f, displayName: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Bio</label>
                <textarea value={profileForm.bio} onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))} rows={3} maxLength={300} className="input resize-none" placeholder="Write a short bio..." />
                <p className="text-xs text-gray-400 mt-1">{profileForm.bio.length}/300</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Location</label>
                  <input type="text" value={profileForm.location} onChange={(e) => setProfileForm(f => ({ ...f, location: e.target.value }))} className="input" placeholder="Dhaka, Bangladesh" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Website</label>
                  <input type="url" value={profileForm.website} onChange={(e) => setProfileForm(f => ({ ...f, website: e.target.value }))} className="input" placeholder="https://..." />
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={saving}
                className="flex items-center gap-2 btn-primary disabled:opacity-50">
                <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
