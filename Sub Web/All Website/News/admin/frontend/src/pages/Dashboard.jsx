import { useEffect, useState } from 'react';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 2px 8px rgba(93,0,150,0.07)', display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: P, padding: 40, textAlign: 'center' }}>Loading dashboard…</div>;
  if (!data) return <div style={{ color: A, padding: 40, textAlign: 'center' }}>Failed to load dashboard.</div>;

  const s = data.stats || {};

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: '0 0 24px' }}>Dashboard</h2>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Articles" value={s.total} icon="📰" color={P} />
        <StatCard label="Published" value={s.published} icon="✅" color="#22c55e" />
        <StatCard label="Drafts" value={s.draft} icon="✏️" color="#f59e0b" />
        <StatCard label="Scheduled" value={s.scheduled} icon="🕐" color="#3b82f6" />
        <StatCard label="Pending Review" value={s.pending} icon="⏳" color="#8b5cf6" />
        <StatCard label="Featured" value={s.featured} icon="⭐" color="#f59e0b" />
        <StatCard label="Breaking News" value={s.breaking} icon="🔴" color={A} />
        <StatCard label="Total Views" value={s.total_views?.toLocaleString()} icon="👁️" color={P} />
        <StatCard label="Today Published" value={s.today_published} icon="📅" color="#22c55e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Most Viewed */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: '0 0 16px' }}>Most Viewed</h3>
          {(data.most_viewed || []).map((a, i) => (
            <div key={a.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f0eaff' : 'none' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: P + '18', color: P, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title_en || a.title_bn}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{(a.view_count || 0).toLocaleString()} views</div>
              </div>
            </div>
          ))}
          {!data.most_viewed?.length && <p style={{ color: '#aaa', fontSize: 13 }}>No data yet.</p>}
        </div>

        {/* Recent Articles */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: '0 0 16px' }}>Recent Articles</h3>
          {(data.recent_articles || []).map((a, i) => (
            <div key={a.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < (data.recent_articles.length - 1) ? '1px solid #f0eaff' : 'none', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title_en || a.title_bn}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{a.category_name || 'Uncategorized'} · {new Date(a.created_at).toLocaleDateString()}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: a.status === 'published' ? '#d1fae5' : a.status === 'draft' ? '#fef3c7' : '#ede9f5',
                color: a.status === 'published' ? '#059669' : a.status === 'draft' ? '#b45309' : P,
              }}>{a.status}</span>
            </div>
          ))}
          {!data.recent_articles?.length && <p style={{ color: '#aaa', fontSize: 13 }}>No articles yet.</p>}
        </div>
      </div>

      {/* Category Stats */}
      {data.category_stats?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)', marginTop: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: '0 0 16px' }}>Articles by Category</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {data.category_stats.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: '#f8f5ff' }}>
                <span style={{ fontSize: 13, color: '#444' }}>{c.name_en}</span>
                <span style={{ fontWeight: 700, color: P, fontSize: 14 }}>{c.article_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
