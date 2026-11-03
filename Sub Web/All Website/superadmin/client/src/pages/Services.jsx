import { useState } from 'react'
import { Download, Settings, RefreshCw, ExternalLink, Layers, CheckCircle, AlertCircle } from 'lucide-react'
import { PageHeading, StatCard, StatusPill, Modal } from '../components/shared.jsx'
import { SERVICES, SERVICE_URLS } from '../lib/constants.js'

const ICON_MAP = { MessagesSquare: '💬', NotebookPen: '📝', ShoppingBag: '🛍', Newspaper: '📰', Store: '🏪', MapPinned: '📍', CircleHelp: '❓', BookOpen: '📖', LibraryBig: '📚', Clapperboard: '🎬', Music2: '🎵', Languages: '🌐', BookA: '📗', ChartNoAxesCombined: '📈', Trophy: '🏆', CloudSun: '⛅', House: '🏠' }

export default function Services() {
  const [services, setServices] = useState(SERVICES.map(s => ({ ...s })))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [status, setStatus] = useState('All statuses')
  const [modal, setModal] = useState(null)

  const categories = ['All categories', ...new Set(services.map(s => s.category))]
  const filtered = services.filter(s =>
    (category === 'All categories' || s.category === category) &&
    (status === 'All statuses' || s.status === status) &&
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const active = services.filter(s => s.status === 'Active').length
  const inactive = services.filter(s => s.status !== 'Active').length

  function toggleStatus(name) {
    setServices(prev => prev.map(s => s.name === name ? { ...s, status: s.status === 'Active' ? 'Deactive' : 'Active' } : s))
    setModal(null)
  }

  const sel = modal ? services.find(s => s.name === modal) : null

  return (
    <>
      <PageHeading
        title="Service Management"
        desc="Manage availability, configuration and health across all 17 Sholok services."
        actions={<>
          <button className="btn"><Download size={14} /> Export list</button>
          <button className="btn btn-primary"><Settings size={14} /> Global service settings</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Total services" value={services.length} icon={Layers} foot="All registered service modules" />
        <StatCard label="Active" value={active} icon={CheckCircle} foot="Enabled services" kind="green" />
        <StatCard label="Deactive" value={inactive} icon={AlertCircle} foot="Disabled or offline services" kind="red" />
        <StatCard label="Service categories" value={new Set(services.map(s => s.category)).size} icon={Layers} foot="Grouped service domains" kind="amber" />
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <label className="search-control">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <select className="input-control" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input-control" value={status} onChange={e => setStatus(e.target.value)}>
            <option>All statuses</option><option>Active</option><option>Deactive</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="section-grid">
        {filtered.length === 0 && (
          <div className="panel empty-state" style={{ gridColumn: '1/-1' }}>No services match your filters.</div>
        )}
        {filtered.map(s => (
          <article key={s.name} className="service-card">
            <div className="service-card-top">
              <div className="service-logo" style={{ fontSize: 18 }}>{ICON_MAP[s.icon] || '🔧'}</div>
              <StatusPill status={s.status} />
            </div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <p className="service-url-line">
              <a href={SERVICE_URLS[s.name]} target="_blank" rel="noopener noreferrer">
                {(SERVICE_URLS[s.name] || '').replace('https://', '')} <ExternalLink size={12} />
              </a>
            </p>
            <div className="service-card-bottom">
              <span className="service-meta">{s.category}</span>
              <button onClick={() => setModal(s.name)}>
                Manage <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
              </button>
            </div>
          </article>
        ))}
      </div>

      <Modal
        open={!!sel}
        onClose={() => setModal(null)}
        title={sel?.name || ''}
        footer={<>
          <button className="btn" onClick={() => setModal(null)}>Cancel</button>
          <button
            className={`btn ${sel?.status === 'Active' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => toggleStatus(sel?.name)}
          >
            {sel?.status === 'Active' ? 'Deactivate service' : 'Activate service'}
          </button>
        </>}
      >
        {sel && (
          <div>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 14 }}>{sel.desc}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <StatusPill status={sel.status} />
              <span className="tag">{sel.category}</span>
            </div>
            <p style={{ fontSize: 13 }}>
              URL: <a href={SERVICE_URLS[sel.name]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)' }}>
                {SERVICE_URLS[sel.name]}
              </a>
            </p>
          </div>
        )}
      </Modal>
    </>
  )
}
