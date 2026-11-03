import { useState } from 'react'
import { Download, RefreshCw, Eye } from 'lucide-react'
import { PageHeading, PanelHead, StatusPill } from '../components/shared.jsx'

const initialLogs = [
  { text: 'A new service administrator was added to News.', time: '12 minutes ago', actor: 'Super Admin', module: 'Service Admins', category: 'Configuration' },
  { text: 'Multi-factor authentication policy was updated.', time: '38 minutes ago', actor: 'Super Admin', module: 'Security Center', category: 'Security' },
  { text: 'Publisher verification was approved.', time: '1 hour ago', actor: 'Super Admin', module: 'Approval Workflows', category: 'Content' },
  { text: 'Finance data provider completed a sync.', time: '2 hours ago', actor: 'Super Admin', module: 'Integrations & APIs', category: 'Configuration' },
  { text: 'Global settings were reviewed.', time: '3 hours ago', actor: 'Super Admin', module: 'Global Settings', category: 'Configuration' },
  { text: 'Failed sign-in attempt detected from unknown IP.', time: '4 hours ago', actor: 'security@sholok.com', module: 'Security Center', category: 'Security' },
  { text: 'Backup job completed successfully.', time: '5 hours ago', actor: 'System', module: 'Backup & Recovery', category: 'Configuration' },
  { text: 'New user registration pending approval.', time: '6 hours ago', actor: 'System', module: 'User Management', category: 'Access' },
]

export default function Audit() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All events')

  const rows = initialLogs.filter(a =>
    (!search || [a.text, a.time, a.actor, a.module].join(' ').toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'All events' || a.category === filter)
  )

  return (
    <>
      <PageHeading
        title="Audit Logs"
        desc="Trace administrative activity and review changes across the platform."
        actions={<button className="btn"><Download size={14} /> Export CSV</button>}
      />

      <div className="toolbar">
        <div className="toolbar-left">
          <label className="search-control">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search actions, users or modules…" value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <select className="input-control" value={filter} onChange={e => setFilter(e.target.value)}>
            <option>All events</option><option>Access</option><option>Configuration</option><option>Content</option><option>Security</option>
          </select>
        </div>
        <div className="toolbar-right">
          <button className="btn" onClick={() => setSearch('')}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Event</th><th>Actor</th><th>Module</th><th>Timestamp</th><th>Category</th><th>Details</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={6}><div className="empty-state">No audit records match this filter.</div></td></tr>}
              {rows.map((a, i) => (
                <tr key={i}>
                  <td>
                    <div>
                      <strong>{a.text}</strong>
                      <small className="table-sub">Event ID: AUD-{String(i + 1).padStart(5, '0')}</small>
                    </div>
                  </td>
                  <td>{a.actor}</td>
                  <td>{a.module}</td>
                  <td>{a.time}</td>
                  <td><StatusPill status={a.category === 'Security' ? 'Review' : 'Active'} /></td>
                  <td>
                    <button className="mini-icon-btn" title="View details"><Eye size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{rows.length} audit entries</span>
          <span className="keyboard-hint">Records are retained according to the configured audit policy.</span>
        </div>
      </div>
    </>
  )
}
