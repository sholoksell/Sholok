import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const STATUS_COLORS = {
  published: ['#d1fae5', '#059669'],
  draft: ['#fef3c7', '#b45309'],
  scheduled: ['#dbeafe', '#1d4ed8'],
  pending: ['#ede9f5', P],
  archived: ['#f3f4f6', '#6b7280'],
};

export default function NewsList() {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [categories, setCategories] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const limit = 20;

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit });
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      const r = await api.get(`/news?${params}`);
      setArticles(r.articles || []);
      setTotal(r.total || 0);
    } catch {}
    setLoading(false);
  }, [page, filters]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => {
    api.get('/categories?limit=100').then(r => setCategories(r.categories || [])).catch(() => {});
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article permanently?')) return;
    setDeleting(id);
    try { await api.del(`/news/${id}`); fetchArticles(); } catch (e) { alert(e.message); }
    setDeleting(null);
  };

  const handlePublish = async (id, currentStatus) => {
    const endpoint = currentStatus === 'published' ? `/news/${id}/unpublish` : `/news/${id}/publish`;
    try { await api.post(endpoint); fetchArticles(); } catch (e) { alert(e.message); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: 0 }}>All News <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({total})</span></h2>
        <Link to="/news/create" style={{ background: P, color: '#fff', textDecoration: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>+ New Article</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={filters.search} placeholder="Search articles…"
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none' }}
        />
        <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
          style={{ padding: '8px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="pending">Pending</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: P }}>Loading…</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No articles found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f5ff' }}>
                {['Title', 'Category', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a, i) => {
                const [bg, fg] = STATUS_COLORS[a.status] || ['#f3f4f6', '#6b7280'];
                return (
                  <tr key={a.id} style={{ borderTop: i > 0 ? '1px solid #f0eaff' : 'none' }}>
                    <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.is_breaking && <span style={{ color: A, fontSize: 11, fontWeight: 700, marginRight: 6 }}>BREAKING</span>}
                        {a.is_featured && <span style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, marginRight: 6 }}>⭐</span>}
                        {a.title_en || a.title_bn}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.slug}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>{a.category_name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color: fg }}>{a.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#555' }}>{(a.view_count || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/news/${a.id}/edit`} style={{ fontSize: 12, color: P, textDecoration: 'none', fontWeight: 600 }}>Edit</Link>
                        <button onClick={() => handlePublish(a.id, a.status)} style={{ fontSize: 12, color: a.status === 'published' ? '#888' : '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                          {a.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} style={{ fontSize: 12, color: A, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                          {deleting === a.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '7px 14px', border: `1.5px solid ${P}`, borderRadius: 7, background: '#fff', color: P, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '7px 14px', border: `1.5px solid ${P}`, borderRadius: 7, background: p === page ? P : '#fff', color: p === page ? '#fff' : P, cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: '7px 14px', border: `1.5px solid ${P}`, borderRadius: 7, background: '#fff', color: P, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>→</button>
        </div>
      )}
    </div>
  );
}
