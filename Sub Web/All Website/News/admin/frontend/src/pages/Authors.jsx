import { useEffect, useState } from 'react';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const empty = { name: '', slug: '', email: '', bio: '', avatar: '', designation: '', social_twitter: '', social_linkedin: '', social_facebook: '' };

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r = await api.get('/authors?limit=100'); setAuthors(r.authors || []); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setError(''); setModal('create'); };
  const openEdit = (a) => { setForm({ ...empty, ...a }); setError(''); setModal(a.id); };
  const closeModal = () => setModal(null);

  const autoSlug = v => v.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (modal === 'create') await api.post('/authors', form);
      else await api.put(`/authors/${modal}`, form);
      load(); closeModal();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this author?')) return;
    try { await api.del(`/authors/${id}`); load(); } catch (e) { alert(e.message); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: '100%', padding: '8px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: 0 }}>Authors</h2>
        <button onClick={openCreate} style={{ background: P, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+ Add Author</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {loading ? <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: P }}>Loading…</div> :
          authors.length === 0 ? <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#888' }}>No authors yet.</div> :
          authors.map(a => (
            <div key={a.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {a.avatar ? (
                  <img src={a.avatar} alt={a.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: `${P}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👤</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{a.name}</div>
                  {a.designation && <div style={{ fontSize: 12, color: P, marginTop: 2 }}>{a.designation}</div>}
                  {a.email && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.email}</div>}
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{a.article_count || 0} articles</div>
                </div>
              </div>
              {a.bio && <p style={{ fontSize: 13, color: '#666', marginTop: 12, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.bio}</p>}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={() => openEdit(a)} style={{ flex: 1, padding: '7px', background: `${P}10`, color: P, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(a.id)} style={{ flex: 1, padding: '7px', background: `${A}10`, color: A, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: P, margin: '0 0 24px' }}>{modal === 'create' ? 'New Author' : 'Edit Author'}</h3>
            {error && <div style={{ background: '#fff0f0', border: `1px solid ${A}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: A, fontSize: 14 }}>{error}</div>}
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Full Name *</label>
                  <input style={inp} required value={form.name} onChange={e => { set('name', e.target.value); if (modal === 'create') set('slug', autoSlug(e.target.value)); }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Slug *</label>
                  <input style={inp} required value={form.slug} onChange={e => set('slug', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Email</label>
                  <input type="email" style={inp} value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Designation</label>
                  <input style={inp} value={form.designation} onChange={e => set('designation', e.target.value)} placeholder="Senior Reporter" />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Bio</label>
                <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={form.bio} onChange={e => set('bio', e.target.value)} />
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 5 }}>Avatar URL</label>
                <input style={inp} value={form.avatar} onChange={e => set('avatar', e.target.value)} placeholder="https://…" />
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 8 }}>Social Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['social_twitter', 'Twitter/X'], ['social_linkedin', 'LinkedIn'], ['social_facebook', 'Facebook']].map(([k, l]) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 80, fontSize: 12, color: '#666' }}>{l}</span>
                      <input style={{ ...inp, flex: 1 }} value={form[k]} onChange={e => set(k, e.target.value)} placeholder="https://…" />
                    </div>
                  ))}
                </div>
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
