import { useState } from 'react'
import { BookOpen, Plus, LifeBuoy, Clock, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill, Modal } from '../components/shared.jsx'

let nextTicket = 1043
const initialTickets = [
  ['SUP-1042', 'Login verification issue', 'My Account', 'High', 'Open'],
  ['SUP-1041', 'Seller settlement query', 'Smart Store', 'Normal', 'In progress'],
  ['SUP-1040', 'Content correction request', 'News', 'Normal', 'Open'],
  ['SUP-1039', 'Translation provider errors', 'Translator', 'High', 'Resolved'],
  ['SUP-1038', 'Business listing update', 'Map', 'Low', 'Open'],
]

function priorityPill(p) {
  if (p === 'High') return <span className="status-pill danger">{p}</span>
  if (p === 'Low') return <span className="status-pill">{p}</span>
  return <span className="status-pill warning">{p}</span>
}

export default function Support() {
  const [tickets, setTickets] = useState(initialTickets)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('All statuses')
  const [newModal, setNewModal] = useState(false)
  const [form, setForm] = useState({ subject: '', service: '', priority: 'Normal' })

  const filtered = tickets.filter(t =>
    (!search || [t[0], t[1], t[2]].join(' ').toLowerCase().includes(search.toLowerCase())) &&
    (statusF === 'All statuses' || t[4] === statusF)
  )

  function createTicket() {
    if (!form.subject) return
    const id = `SUP-${nextTicket++}`
    setTickets(t => [[id, form.subject, form.service || 'General', form.priority, 'Open'], ...t])
    setForm({ subject: '', service: '', priority: 'Normal' })
    setNewModal(false)
  }

  return (
    <>
      <PageHeading
        title="Support Center"
        desc="Track escalations, service requests and internal operational tasks."
        actions={<>
          <button className="btn"><BookOpen size={14} /> Help documentation</button>
          <button className="btn btn-primary" onClick={() => setNewModal(true)}><Plus size={14} /> Create ticket</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Open tickets" value={tickets.filter(t => t[4] === 'Open').length} icon={LifeBuoy} foot="Awaiting assignment" kind="amber" />
        <StatCard label="In progress" value={tickets.filter(t => t[4] === 'In progress').length} icon={Clock} foot="Assigned to support" />
        <StatCard label="Resolved this week" value="24" icon={CheckCircle} foot="<span class='positive'>Completed</span>" kind="green" />
        <StatCard label="High priority" value={tickets.filter(t => t[3] === 'High').length} icon={AlertTriangle} foot="Needs faster response" kind="red" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Support tickets" desc="Internal queue and service escalations" />
        <div className="table-tools">
          <label className="table-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <select className="select" value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option>All statuses</option><option>Open</option><option>In progress</option><option>Resolved</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Ticket</th><th>Subject</th><th>Service</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={6}><div className="empty-state">No tickets match your filters.</div></td></tr>}
              {filtered.map((t, i) => (
                <tr key={i}>
                  <td className="table-primary">{t[0]}</td>
                  <td>{t[1]}</td>
                  <td>{t[2]}</td>
                  <td>{priorityPill(t[3])}</td>
                  <td><StatusPill status={t[4] === 'In progress' ? 'Monitoring' : t[4]} /></td>
                  <td>
                    <button className="mini-icon-btn" title="View ticket"><ArrowUpRight size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{filtered.length} ticket(s)</span>
        </div>
      </div>

      <Modal open={newModal} onClose={() => setNewModal(false)} title="Create support ticket"
        footer={<>
          <button className="btn" onClick={() => setNewModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={createTicket}>Create ticket</button>
        </>}
      >
        <div className="form-grid">
          <div className="form-field full">
            <label>Subject</label>
            <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Describe the issue" />
          </div>
          <div className="form-field">
            <label>Service</label>
            <input value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="e.g. Shopping, News" />
          </div>
          <div className="form-field">
            <label>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              <option>Low</option><option>Normal</option><option>High</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
