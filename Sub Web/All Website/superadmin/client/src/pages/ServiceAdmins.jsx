import { useState } from 'react'
import { Download, UserPlus, KeyRound, Shield, UserCheck, UserX, Layers, Eye, Pencil, Trash2 } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, UserCell, StatusPill, Modal } from '../components/shared.jsx'
import { ADMIN_ROLES, SERVICES } from '../lib/constants.js'
import { useNavigate } from 'react-router-dom'

let nextId = 1020
const initialAdmins = [
  { id: 1001, name: 'Ayesha Rahman', mobile: '01710000001', email: 'ayesha.rahman@sholok.com', role: 'Service Administrator', services: ['News'], status: 'Active', joined: 'Oct 21, 2026' },
  { id: 1002, name: 'Tanvir Hasan', mobile: '01710000002', email: 'tanvir.hasan@sholok.com', role: 'Content Moderator', services: ['Cafe'], status: 'Active', joined: 'Oct 20, 2026' },
  { id: 1003, name: 'Nusrat Jahan', mobile: '01710000003', email: 'nusrat.jahan@sholok.com', role: 'Finance Administrator', services: ['Finance'], status: 'Pending', joined: 'Oct 19, 2026' },
  { id: 1004, name: 'Mahmud Karim', mobile: '01710000004', email: 'mahmud.karim@sholok.com', role: 'Data Provider', services: ['Finance'], status: 'Active', joined: 'Oct 18, 2026' },
  { id: 1005, name: 'Farhana Akter', mobile: '01710000005', email: 'farhana.akter@sholok.com', role: 'Support Agent', services: ['My Account'], status: 'Suspended', joined: 'Oct 16, 2026' },
  { id: 1006, name: 'Rafi Ahmed', mobile: '01710000006', email: 'rafi.ahmed@sholok.com', role: 'System Administrator', services: SERVICES.map(s => s.name), status: 'Active', joined: 'Oct 14, 2026' },
  { id: 1007, name: 'Samira Chowdhury', mobile: '01710000007', email: 'samira.chowdhury@sholok.com', role: 'Publisher', services: ['News'], status: 'Active', joined: 'Oct 12, 2026' },
  { id: 1008, name: 'Imran Hossain', mobile: '01710000008', email: 'imran.hossain@sholok.com', role: 'Content Moderator', services: ['Webtoon'], status: 'Pending', joined: 'Oct 10, 2026' },
]

export default function ServiceAdmins() {
  const navigate = useNavigate()
  const [admins, setAdmins] = useState(initialAdmins)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All statuses')
  const [addModal, setAddModal] = useState(false)
  const [accessModal, setAccessModal] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', role: ADMIN_ROLES[0], services: [] })

  const filtered = admins.filter(a =>
    (!search || [a.name, a.email, a.mobile || '', a.role, ...a.services].join(' ').toLowerCase().includes(search.toLowerCase())) &&
    (statusF === 'All statuses' || a.status === statusF)
  )

  function toggle(id) { setAdmins(a => a.map(x => x.id === id ? { ...x, status: x.status === 'Suspended' ? 'Active' : 'Suspended' } : x)) }
  function del(id) { setAdmins(a => a.filter(x => x.id !== id)) }

  function addAdmin() {
    if (!form.name || !form.email) return
    setAdmins(a => [...a, { id: nextId++, ...form, status: 'Active', joined: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) }])
    setForm({ name: '', email: '', mobile: '', role: ADMIN_ROLES[0], services: [] })
    setAddModal(false)
  }

  function toggleService(name) {
    setForm(f => ({ ...f, services: f.services.includes(name) ? f.services.filter(x => x !== name) : [...f.services, name] }))
  }

  const viewAdmin = accessModal ? admins.find(a => a.id === accessModal) : null

  return (
    <>
      <PageHeading
        title="Service Admins"
        desc="Create staff administrators and grant access to one or multiple Sholok service admin panels."
        actions={<>
          <button className="btn"><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}><UserPlus size={14} /> Create Admin</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Total admins" value={admins.length} icon={Shield} foot="Service administrator accounts" />
        <StatCard label="Active admins" value={admins.filter(a => a.status === 'Active').length} icon={UserCheck} foot="Can sign in" kind="green" />
        <StatCard label="Services assigned" value={new Set(admins.flatMap(a => a.services)).size} icon={Layers} foot="Unique service coverage" />
        <StatCard label="Suspended admins" value={admins.filter(a => a.status === 'Suspended').length} icon={UserX} foot="Access disabled" kind="red" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Service administrator directory" desc="Each admin can manage only assigned services and permitted actions"
          right={<button className="btn btn-sm" onClick={() => navigate('/roles')}><KeyRound size={13} /> Configure roles</button>}
        />
        <div className="table-tools">
          <label className="table-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search name, email or mobile…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <select className="select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option>All statuses</option><option>Active</option><option>Suspended</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Administrator</th><th>Mobile Number</th><th>Role</th><th>Assigned services</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state">No administrators found.</div></td></tr>}
              {filtered.map(a => (
                <tr key={a.id}>
                  <td><UserCell name={a.name} sub={`${a.email} · #${a.id}`} /></td>
                  <td>{a.mobile || 'Not provided'}</td>
                  <td>{a.role}</td>
                  <td>
                    <div className="service-chip-list">
                      {a.services.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                      {a.services.length > 3 && <span className="tag">+{a.services.length - 3} more</span>}
                    </div>
                    <small>{a.services.length} service(s)</small>
                  </td>
                  <td><StatusPill status={a.status} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-icon-btn" title="View access" onClick={() => setAccessModal(a.id)}><Eye size={13} /></button>
                      <button className="mini-icon-btn" title="Edit"><Pencil size={13} /></button>
                      <button className="mini-icon-btn" title={a.status === 'Suspended' ? 'Reactivate' : 'Suspend'} onClick={() => toggle(a.id)}>
                        {a.status === 'Suspended' ? <UserCheck size={13} /> : <UserX size={13} />}
                      </button>
                      <button className="mini-icon-btn" title="Delete" onClick={() => del(a.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filtered.length} of {admins.length} administrators</span>
        </div>
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Create service admin"
        footer={<>
          <button className="btn" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addAdmin}>Create admin</button>
        </>}
      >
        <div className="form-grid">
          <div className="form-field">
            <label>Full name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div className="form-field">
            <label>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@sholok.com" />
          </div>
          <div className="form-field">
            <label>Mobile number</label>
            <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="01700000000" />
          </div>
          <div className="form-field">
            <label>Admin role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ADMIN_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-field full">
            <label>Assign services</label>
            <div className="service-assignment-grid">
              {SERVICES.map(s => (
                <label key={s.name} className="service-check">
                  <input type="checkbox" checked={form.services.includes(s.name)} onChange={() => toggleService(s.name)} />
                  <span><strong>{s.name}</strong><small>{s.category}</small></span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewAdmin} onClose={() => setAccessModal(null)} title="Effective access">
        {viewAdmin && (
          <div>
            <p style={{ margin: '0 0 14px' }}><strong>{viewAdmin.name}</strong> — {viewAdmin.role}</p>
            <div className="service-chip-list" style={{ marginBottom: 12 }}>
              {viewAdmin.services.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>Access is limited to the assigned services and the permissions defined for their role.</p>
          </div>
        )}
      </Modal>
    </>
  )
}
