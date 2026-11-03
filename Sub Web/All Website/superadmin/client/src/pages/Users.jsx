import { useState } from 'react'
import { Download, UserPlus, RefreshCw, Users as UsersIcon, Clock, UserCheck, UserX, ShieldOff } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, UserCell, StatusPill, Modal } from '../components/shared.jsx'
import { USER_TYPES } from '../lib/constants.js'

let nextId = 2010
const initialAccounts = [
  { id: 2001, name: 'Sadia Islam', mobile: '01711000001', email: 'sadia.islam@example.com', type: 'Customer', status: 'Pending', joined: 'Oct 30, 2026' },
  { id: 2002, name: 'Mehedi Hasan', mobile: '01711000002', email: 'mehedi.shop@example.com', type: 'Seller', status: 'Active', joined: 'Oct 28, 2026' },
  { id: 2003, name: 'Nabila Ahmed', mobile: '01711000003', email: 'nabila.blog@example.com', type: 'Blogger', status: 'Pending', joined: 'Oct 27, 2026' },
  { id: 2004, name: 'Arif Hossain', mobile: '01711000004', email: 'arif.buyer@example.com', type: 'Customer', status: 'Suspended', joined: 'Oct 25, 2026' },
  { id: 2005, name: 'Tania Rahman', mobile: '01711000005', email: 'tania.creator@example.com', type: 'Creator', status: 'Active', joined: 'Oct 22, 2026' },
]

export default function Users() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All statuses')
  const [typeF, setTypeF] = useState('All account types')
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', type: 'Customer' })

  const filtered = accounts.filter(u =>
    (!search || [u.name, u.email, u.mobile, String(u.id)].some(x => x.toLowerCase().includes(search.toLowerCase()))) &&
    (statusF === 'All statuses' || u.status === statusF) &&
    (typeF === 'All account types' || u.type === typeF)
  )

  function approve(id) { setAccounts(a => a.map(u => u.id === id ? { ...u, status: 'Active' } : u)) }
  function reject(id) { setAccounts(a => a.map(u => u.id === id ? { ...u, status: 'Rejected' } : u)) }
  function toggle(id) { setAccounts(a => a.map(u => u.id === id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u)) }
  function block(id) { setAccounts(a => a.map(u => u.id === id ? { ...u, status: u.status === 'Blocked' ? 'Active' : 'Blocked' } : u)) }

  function addAccount() {
    if (!form.name || !form.email) return
    setAccounts(a => [...a, { id: nextId++, ...form, status: 'Pending', joined: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) }])
    setForm({ name: '', email: '', mobile: '', type: 'Customer' })
    setAddModal(false)
  }

  return (
    <>
      <PageHeading
        title="User Management"
        desc="Manage people who register on Sholok frontend: customers, sellers, bloggers and other account types."
        actions={<>
          <button className="btn"><Download size={14} /> Export CSV</button>
          <button className="btn btn-primary" onClick={() => setAddModal(true)}><UserPlus size={14} /> Add account</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Total accounts" value={accounts.length} icon={UsersIcon} foot="Frontend registrations" />
        <StatCard label="Pending approval" value={accounts.filter(x => x.status === 'Pending').length} icon={Clock} foot="Awaiting review" kind="red" />
        <StatCard label="Active accounts" value={accounts.filter(x => x.status === 'Active').length} icon={UserCheck} foot="Approved accounts" kind="green" />
        <StatCard label="Suspended" value={accounts.filter(x => x.status === 'Suspended').length} icon={UserX} foot="Restricted accounts" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Frontend user directory" desc="Approve registrations and manage customer, seller, blogger and other accounts"
          right={<button className="btn btn-sm"><RefreshCw size={13} /> Refresh</button>}
        />
        <div className="table-tools">
          <label className="table-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search name, email, mobile or ID…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <select className="select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option>All statuses</option><option>Pending</option><option>Active</option><option>Suspended</option><option>Blocked</option><option>Rejected</option>
          </select>
          <select className="select" value={typeF} onChange={e => setTypeF(e.target.value)}>
            <option>All account types</option>
            {USER_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Frontend User</th><th>Mobile Number</th><th>Account Type</th><th>Registration Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6}><div className="empty-state">No accounts match your filters.</div></td></tr>
              )}
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><UserCell name={u.name} sub={`${u.email} · #${u.id}`} /></td>
                  <td>{u.mobile || 'Not provided'}</td>
                  <td>{u.type}</td>
                  <td>{u.joined}</td>
                  <td><StatusPill status={u.status} /></td>
                  <td>
                    <div className="row-actions">
                      {u.status === 'Pending' && <>
                        <button className="mini-icon-btn" title="Approve" onClick={() => approve(u.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button className="mini-icon-btn" title="Reject" onClick={() => reject(u.id)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </>}
                      <button className="mini-icon-btn" title={u.status === 'Suspended' ? 'Reactivate' : 'Suspend'} onClick={() => toggle(u.id)}>
                        {u.status === 'Suspended'
                          ? <UserCheck size={13} />
                          : <UserX size={13} />
                        }
                      </button>
                      <button className="mini-icon-btn" title={u.status === 'Blocked' ? 'Unblock' : 'Block'} onClick={() => block(u.id)}>
                        <ShieldOff size={13} />
                      </button>
                      <button className="mini-icon-btn" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {filtered.length} of {accounts.length} accounts</span>
        </div>
      </div>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add account"
        footer={<>
          <button className="btn" onClick={() => setAddModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={addAccount}>Create account</button>
        </>}
      >
        <div className="form-grid">
          <div className="form-field">
            <label>Full name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div className="form-field">
            <label>Email address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div className="form-field">
            <label>Mobile number</label>
            <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="01700000000" />
          </div>
          <div className="form-field">
            <label>Account type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {USER_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
