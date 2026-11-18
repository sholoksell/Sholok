import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const P = '#5D0096', A = '#D31710';

const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 }}>
      {label}{required && <span style={{ color: A }}> *</span>}
    </label>
    {children}
  </div>
);

const Input = ({ style, ...props }) => (
  <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', ...style }} {...props} />
);

const Textarea = ({ style, ...props }) => (
  <textarea style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical', ...style }} {...props} />
);

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title_en: '', title_bn: '', slug: '', summary_en: '', summary_bn: '',
    body_en: '', body_bn: '', featured_image: '', category_id: '',
    author_id: '', source_id: '', source_url: '', source_credit: '',
    status: 'draft', is_featured: false, is_breaking: false,
    publish_at: '', tags: '', meta_title: '', meta_description: '',
  });
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [sources, setSources] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('en');

  useEffect(() => {
    Promise.all([
      api.get('/categories?limit=100'),
      api.get('/authors?limit=100'),
      api.get('/sources?limit=100').catch(() => ({ sources: [] })),
    ]).then(([cats, auths, srcs]) => {
      setCategories(cats.categories || []);
      setAuthors(auths.authors || []);
      setSources(srcs.sources || []);
    });
    if (isEdit) {
      api.get(`/news/${id}`).then(r => {
        const a = r.article;
        setForm({
          title_en: a.title_en || '', title_bn: a.title_bn || '',
          slug: a.slug || '', summary_en: a.summary_en || '', summary_bn: a.summary_bn || '',
          body_en: a.body_en || '', body_bn: a.body_bn || '',
          featured_image: a.featured_image || '', category_id: a.category_id || '',
          author_id: a.author_id || '', source_id: a.source_id || '',
          source_url: a.source_url || '', source_credit: a.source_credit || '',
          status: a.status || 'draft', is_featured: !!a.is_featured, is_breaking: !!a.is_breaking,
          publish_at: a.publish_at ? a.publish_at.slice(0, 16) : '',
          tags: (r.tags || []).map(t => t.name).join(', '),
          meta_title: a.meta_title || '', meta_description: a.meta_description || '',
        });
      }).catch(() => navigate('/news')).finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = (title) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100);

  const handleSubmit = async (e, status) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        status: status || form.status,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await api.put(`/news/${id}`, payload);
      } else {
        await api.post('/news', payload);
      }
      navigate('/news');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: P }}>Loading…</div>;

  const sel = { padding: '9px 12px', border: '1.5px solid #e0d6f5', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', background: '#fff' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: 0 }}>{isEdit ? 'Edit Article' : 'New Article'}</h2>
        <button onClick={() => navigate('/news')} style={{ background: 'none', border: `1.5px solid #e0d6f5`, borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14, color: '#555' }}>← Back</button>
      </div>

      {error && <div style={{ background: '#fff0f0', border: `1px solid ${A}`, borderRadius: 8, padding: '10px 14px', marginBottom: 20, color: A, fontSize: 14 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Main */}
          <div>
            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1.5px solid #e0d6f5', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
              {[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTab(k)} style={{
                  padding: '8px 20px', background: tab === k ? P : '#fff', color: tab === k ? '#fff' : P,
                  border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}>{l}</button>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)', marginBottom: 24 }}>
              <Field label={`Title (${tab === 'en' ? 'English' : 'Bengali'})`} required>
                <Input value={form[`title_${tab}`]} onChange={e => {
                  set(`title_${tab}`, e.target.value);
                  if (tab === 'en' && !isEdit) set('slug', autoSlug(e.target.value));
                }} />
              </Field>
              <Field label="Slug" required>
                <Input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated from title" />
              </Field>
              <Field label={`Summary (${tab === 'en' ? 'English' : 'Bengali'})`}>
                <Textarea rows={3} value={form[`summary_${tab}`]} onChange={e => set(`summary_${tab}`, e.target.value)} />
              </Field>
              <Field label={`Body (${tab === 'en' ? 'English' : 'Bengali'})`} required>
                <Textarea rows={16} value={form[`body_${tab}`]} onChange={e => set(`body_${tab}`, e.target.value)} placeholder="Article content (HTML supported)" />
              </Field>
            </div>

            {/* Source */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)', marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: '0 0 16px' }}>Source Credit</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Source Name (Credit)">
                  <Input value={form.source_credit} onChange={e => set('source_credit', e.target.value)} placeholder="e.g. Prothom Alo, BBC" />
                </Field>
                <Field label="Source URL">
                  <Input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://…" />
                </Field>
              </div>
            </div>

            {/* SEO */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: '0 0 16px' }}>SEO</h3>
              <Field label="Meta Title"><Input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} /></Field>
              <Field label="Meta Description"><Textarea rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} /></Field>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Publish Actions */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: P, margin: '0 0 14px' }}>Publish</h3>
              <Field label="Status">
                <select value={form.status} onChange={e => set('status', e.target.value)} style={sel}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="pending">Pending Review</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
              {form.status === 'scheduled' && (
                <Field label="Publish At">
                  <Input type="datetime-local" value={form.publish_at} onChange={e => set('publish_at', e.target.value)} />
                </Field>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {[['is_featured', '⭐ Featured'], ['is_breaking', '🔴 Breaking News']].map(([k, l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#444' }}>
                    <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} style={{ accentColor: P }} />
                    {l}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="submit" disabled={saving} style={{ padding: '10px', background: P, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : (isEdit ? 'Update' : 'Save')}
                </button>
                {!isEdit && (
                  <button type="button" disabled={saving} onClick={e => handleSubmit(e, 'published')} style={{ padding: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Publish Now
                  </button>
                )}
              </div>
            </div>

            {/* Category & Author */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <Field label="Category">
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={sel}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </Field>
              <Field label="Author">
                <select value={form.author_id} onChange={e => set('author_id', e.target.value)} style={sel}>
                  <option value="">Select author</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </Field>
            </div>

            {/* Featured Image */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: P, margin: '0 0 14px' }}>Featured Image</h3>
              <Input value={form.featured_image} onChange={e => set('featured_image', e.target.value)} placeholder="Image URL or /news-uploads/…" />
              {form.featured_image && (
                <img src={form.featured_image} alt="" style={{ marginTop: 10, width: '100%', borderRadius: 8, maxHeight: 160, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              )}
            </div>

            {/* Tags */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(93,0,150,0.07)' }}>
              <Field label="Tags (comma separated)">
                <Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="politics, economy, sports" />
              </Field>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
