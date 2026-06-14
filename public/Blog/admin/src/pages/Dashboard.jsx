import { useState, useEffect } from 'react';
import api from '../api';
import { FiUsers, FiFileText, FiEye, FiMessageCircle, FiTrendingUp, FiStar } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color, change }) => (
  <div className="card p-6 flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {change !== undefined && (
        <p className={`text-xs font-medium mt-0.5 ${change >= 0 ? 'text-green-500' : 'text-red-400'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)} today
        </p>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [dashRes, postsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/posts?limit=5&sort=newest'),
      ]);
      setStats(dashRes.data.stats);
      setChart(dashRes.data.chart || []);
      setRecentPosts(postsRes.data.posts || []);
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 bg-gray-100" />)}
        </div>
        <div className="card h-64 bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome to Sholok Blog admin panel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiUsers} label="Total Users" value={stats?.users || 0} color="bg-primary-600" change={stats?.usersToday} />
        <StatCard icon={FiFileText} label="Total Posts" value={stats?.posts || 0} color="bg-accent-500" change={stats?.postsToday} />
        <StatCard icon={FiEye} label="Total Views" value={stats?.views || 0} color="bg-blue-500" />
        <StatCard icon={FiMessageCircle} label="Comments" value={stats?.comments || 0} color="bg-green-500" />
      </div>

      {/* Views chart */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><FiTrendingUp className="w-5 h-5 text-primary-600" />Daily Views (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chart}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6941ff" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6941ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="views" stroke="#6941ff" fill="url(#viewsGradient)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Posts */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Recent Posts</h2>
          <Link to="/posts" className="text-sm text-primary-600 hover:underline">View All →</Link>
        </div>
        <div className="space-y-3">
          {recentPosts.map((post) => (
            <div key={post._id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-lg">
                    {post.category?.icon || '📝'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-400">{post.author?.displayName} · {post.publishedAt ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true }) : 'Draft'}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full font-medium ${post.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{post.status}</span>
                {post.isFeatured && <FiStar className="w-4 h-4 text-yellow-500 fill-current" />}
                <span className="flex items-center gap-1"><FiEye className="w-3 h-3" />{post.views}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
