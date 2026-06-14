import { useState, useEffect } from 'react';
import api from '../api';
import { FiTrendingUp, FiEye, FiHeart, FiMessageCircle, FiShare2 } from 'react-icons/fi';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#6941ff', '#ff1fa3', '#3b82f6', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/dashboard?days=${days}`);
      setStats(res.data.stats);
      setChart(res.data.chart || []);
    } catch (_) {} finally { setLoading(false); }
  };

  const deviceData = stats ? [
    { name: 'Desktop', value: stats.deviceDesktop || 45 },
    { name: 'Mobile', value: stats.deviceMobile || 40 },
    { name: 'Tablet', value: stats.deviceTablet || 15 },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-400 text-sm">Platform-wide statistics</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${days === d ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FiEye, label: 'Total Views', value: stats?.views || 0, color: 'text-primary-600' },
          { icon: FiHeart, label: 'Reactions', value: stats?.reactions || 0, color: 'text-accent-500' },
          { icon: FiMessageCircle, label: 'Comments', value: stats?.comments || 0, color: 'text-blue-500' },
          { icon: FiShare2, label: 'Shares', value: stats?.shares || 0, color: 'text-green-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{(s.value || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Views over time */}
      <div className="card p-6">
        <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <FiTrendingUp className="w-5 h-5 text-primary-600" /> Views Over Time
        </h2>
        {loading ? <div className="h-64 bg-gray-100 rounded-xl animate-pulse" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6941ff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6941ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="views" stroke="#6941ff" fill="url(#aGrad)" strokeWidth={2.5} name="Views" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement chart */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Engagement Breakdown</h2>
          {loading ? <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="reactions" fill="#ff1fa3" radius={[4, 4, 0, 0]} name="Reactions" />
                <Bar dataKey="comments" fill="#6941ff" radius={[4, 4, 0, 0]} name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Device breakdown */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Device Breakdown</h2>
          {loading ? <div className="h-48 bg-gray-100 rounded-xl animate-pulse" /> : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {deviceData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {deviceData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-sm text-gray-600">{entry.name}</span>
                    <span className="font-bold text-gray-900 ml-auto">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
