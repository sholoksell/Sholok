import { useEffect, useState, useRef } from 'react';
import api from '../api';

const P = '#5D0096', A = '#D31710';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef(null);
  const limit = 24;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const r = await api.get(`/media?page=${p}&limit=${limit}`);
      setMedia(r.media || []);
      setTotal(r.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        await api.postForm('/media/upload', form);
      }
      setPage(1);
      await load(1);
    } catch (err) { alert(err.message); }
    setUploading(false);
    e.target.value = '';
  };

  const del = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try { await api.del(`/media/${id}`); if (selected?.id === id) setSelected(null); load(); } catch (e) { alert(e.message); }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P, margin: 0 }}>Media Library <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({total})</span></h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current.click()} disabled={uploading} style={{ background: P, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {uploading ? 'Uploading…' : '+ Upload Images'}
          </button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const dt = e.dataTransfer; if (dt.files?.length) { fileRef.current.files = dt.files; handleUpload({ target: { files: dt.files, value: '' } }); } }}
        style={{ border: `2px dashed #e0d6f5`, borderRadius: 12, padding: '20px', textAlign: 'center', marginBottom: 24, background: '#faf8ff', color: '#888', fontSize: 14, cursor: 'pointer' }}
        onClick={() => fileRef.current.click()}
      >
        {uploading ? '⏳ Uploading…' : 'Drag & drop images here, or click to browse'}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: P }}>Loading…</div>
      ) : media.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>No media files yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {media.map(m => (
            <div key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)}
              style={{
                background: '#fff', borderRadius: 10, overflow: 'hidden',
                boxShadow: selected?.id === m.id ? `0 0 0 3px ${P}` : '0 2px 8px rgba(93,0,150,0.07)',
                cursor: 'pointer', transition: 'box-shadow 0.15s',
              }}>
              <div style={{ aspectRatio: '4/3', background: '#f0eaff', overflow: 'hidden' }}>
                <img src={m.url} alt={m.alt_text || m.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.original_name || m.filename}</div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{m.size ? (m.size / 1024).toFixed(0) + ' KB' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '7px 14px', border: `1.5px solid ${P}`, borderRadius: 7, background: '#fff', color: P, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>←</button>
          <span style={{ padding: '7px 14px', fontSize: 14, color: '#555' }}>{page} / {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: '7px 14px', border: `1.5px solid ${P}`, borderRadius: 7, background: '#fff', color: P, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>→</button>
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 300, background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,0.12)', zIndex: 100, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: P, margin: 0 }}>File Details</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>×</button>
          </div>
          <img src={selected.url} alt={selected.alt_text} style={{ width: '100%', borderRadius: 8, marginBottom: 16, background: '#f0eaff' }} onError={e => { e.target.style.display = 'none'; }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 4, wordBreak: 'break-all' }}>{selected.original_name || selected.filename}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{selected.size ? (selected.size / 1024).toFixed(0) + ' KB' : ''} · {selected.mime_type || ''}</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 4 }}>URL</div>
            <div style={{ background: '#f8f5ff', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: '#555', wordBreak: 'break-all', marginBottom: 6 }}>{selected.url}</div>
            <button onClick={() => copyUrl(selected.url)} style={{ width: '100%', padding: '8px', background: copied === selected.url ? '#d1fae5' : `${P}10`, color: copied === selected.url ? '#059669' : P, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {copied === selected.url ? '✓ Copied!' : 'Copy URL'}
            </button>
          </div>
          <button onClick={() => del(selected.id)} style={{ width: '100%', padding: '8px', background: `${A}10`, color: A, border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Delete File
          </button>
        </div>
      )}
    </div>
  );
}
