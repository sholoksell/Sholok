import { Bell, ShieldAlert, BellDot, Send } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill } from '../components/shared.jsx'

const notifications = [
  { type: 'Security alert', title: 'Unusual sign-in activity', recipient: 'Security team', status: 'Unread' },
  { type: 'Backup status', title: 'Restore verification due', recipient: 'Platform Ops', status: 'Unread' },
  { type: 'API quota', title: 'Provider quota nearing limit', recipient: 'Integrations', status: 'Monitoring' },
  { type: 'Support update', title: 'Ticket SUP-1042 updated', recipient: 'Support', status: 'Active' },
]

export default function Notifications() {
  return (
    <>
      <PageHeading
        title="Notification Center"
        desc="Review operational alerts and manage delivery preferences by event and severity."
        actions={<>
          <button className="btn"><BellDot size={14} /> Configure alerts</button>
          <button className="btn btn-primary"><Send size={14} /> Send notification</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Unread alerts" value="4" icon={Bell} foot="Pending acknowledgment" kind="amber" />
        <StatCard label="Critical" value="1" icon={ShieldAlert} foot="Immediate attention required" kind="red" />
        <StatCard label="Delivery channels" value="3" icon={Send} foot="Email, in-app, webhook" />
        <StatCard label="Today's notifications" value="12" icon={BellDot} foot="Sent across all channels" kind="green" />
      </div>

      <div className="panel table-panel">
        <PanelHead title="Recent notifications" desc="Platform-wide operational alerts" />
        <div className="table-scroll">
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>Recipient</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {notifications.map((n, i) => (
                <tr key={i}>
                  <td className="table-primary">{n.type}</td>
                  <td>{n.title}</td>
                  <td>{n.recipient}</td>
                  <td><StatusPill status={n.status} /></td>
                  <td>
                    <button className="mini-icon-btn" title="Mark read">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
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
