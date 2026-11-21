import { useEffect, useState } from 'react';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const empty = { name_en: '', name_bn: '', slug: '', description_en: '', description_bn: '', color: P, sort_order: 0, is_active: true };

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | {id}
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/categories?limit=100'); setCats(Array.isArray(r) ? r : (r.categories || [])); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (c) => { setForm({ ...c, is_active: !!c.is_active }); setError(''); setModal(c.id); };
  const closeModal = () => setModal(null);

  const autoSlug = v => v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (modal === 'create') await api.post('/categories', form);
      else await api.put(`/categories/${modal}`, form);
      load(); closeModal();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this category? Articles in it will become uncategorized.')) return;
    try { await api.del(`/categories/${id}`); load(); } catch (e) { alert(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: '100%', padding: '8px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: 0 }}>Categories</h2>
        <button onClick={openCreate} style={{ background: P, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ Add Category</button>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: P }}>Loading…</div> :
          cats.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No categories yet.</div> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f5ff' }}>
                  {['Color', 'Name (EN)', 'Name (BN)', 'Slug', 'Articles', 'Active', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cats.map((c, i) => (
                  <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #f0eaff' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: c.color || P }} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{c.name_en}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#555' }}>{c.name_bn || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#888', fontFamily: 'monospace' }}>{c.slug}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: '#555' }}>{c.article_count || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: c.is_active ? '#d1fae5' : '#f3f4f6', color: c.is_active ? '#059669' : '#6b7280' }}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => openEdit(c)} style={{ fontSize: 13, color: P, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Edit</button>
                        <button onClick={() => del(c.id)} style={{ fontSize: 13, color: A, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: P, margin: '0 0 24px' }}>{modal === 'create' ? 'New Category' : 'Edit Category'}</h3>
            {error && <div style={{ background: '#fff0f0', border: `1px solid ${A}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: A, fontSize: 14 }}>{error}</div>}
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Name (English) *</label>
                  <input style={inp} required value={form.name_en} onChange={e => { set('name_en', e.target.value); if (modal === 'create') set('slug', autoSlug(e.target.value)); }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Name (Bengali)</label>
                  <input style={inp} value={form.name_bn} onChange={e => set('name_bn', e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Slug *</label>
                <input style={inp} required value={form.slug} onChange={e => set('slug', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px', gap: 16, marginTop: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.color || P} onChange={e => set('color', e.target.value)} style={{ width: 40, height: 36, border: '1.5px solid #e0d6f5', borderRadius: 8, padding: 2, cursor: 'pointer' }} />
                    <input style={{ ...inp, flex: 1 }} value={form.color || P} onChange={e => set('color', e.target.value)} placeholder="#5D0096" />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Sort Order</label>
                  <input type="number" style={inp} value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Active</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginTop: 10 }}>
                    <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ accentColor: P, width: 16, height: 16 }} />
                    <span style={{ fontSize: 14 }}>Yes</span>
                  </label>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Description (English)</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={form.description_en} onChange={e => set('description_en', e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeModal} style={{ padding: '9px 20px', border: '1.5px solid #e0d6f5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 20px', background: P, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
