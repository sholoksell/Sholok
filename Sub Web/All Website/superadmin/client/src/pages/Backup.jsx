import { Download, Database, CheckCircle, Calendar } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill } from '../components/shared.jsx'

const backups = [
  { name: 'Database snapshot', time: 'Today · 02:00', type: 'Encrypted', status: 'Successful' },
  { name: 'Object storage', time: 'Today · 02:15', type: 'Encrypted', status: 'Successful' },
  { name: 'Configuration bundle', time: 'Yesterday · 02:20', type: 'Encrypted', status: 'Successful' },
  { name: 'Restore verification', time: 'Scheduled review', type: 'Recovery test', status: 'Pending' },
]

export default function Backup() {
  return (
    <>
      <PageHeading
        title="Backup & Recovery"
        desc="Monitor backup schedules, retention, restore points and recovery readiness."
        actions={<>
          <button className="btn"><Download size={14} /> Run backup now</button>
          <button className="btn btn-primary"><CheckCircle size={14} /> Verify restore</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Last backup" value="Today, 02:00" icon={Database} foot="Completed successfully" kind="green" />
        <StatCard label="Restore tests" value="1 due" icon={CheckCircle} foot="Scheduled for review" kind="amber" />
        <StatCard label="Retention policy" value="30 days" icon={Calendar} foot="Rolling backup window" />
        <StatCard label="Total backup size" value="12.4 GB" icon={Database} foot="Across all backup types" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Backup history" desc="Recent backup jobs and restore points" />
        <div className="table-scroll">
          <table>
            <thead><tr><th>Backup type</th><th>Schedule</th><th>Encryption</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {backups.map((b, i) => (
                <tr key={i}>
                  <td className="table-primary">{b.name}</td>
                  <td>{b.time}</td>
                  <td><span className="tag">{b.type}</span></td>
                  <td><StatusPill status={b.status} /></td>
                  <td>
                    <button className="mini-icon-btn" title="View details">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
