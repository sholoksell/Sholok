import { useState } from 'react'
import { Download, ShieldCheck, ShieldAlert, KeyRound, LogIn, Shield } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill, SettingRow } from '../components/shared.jsx'

const initialAlerts = [
  { type: 'danger', icon: '🛡', title: 'Unusual sign-in activity', desc: 'A sign-in attempt needs security review.', time: '8 minutes ago', status: 'Open' },
  { type: 'warning', icon: '💾', title: 'Backup verification due', desc: 'Review the latest backup restore test.', time: '42 minutes ago', status: 'Review' },
  { type: 'warning', icon: '🔌', title: 'Provider response time elevated', desc: 'A connected data feed is responding slowly.', time: '1 hour ago', status: 'Monitoring' },
]

const signIns = [
  { account: 'admin@sholok.com', event: 'Successful sign-in', location: 'Dhaka, BD', time: 'Today, 10:42 PM', status: 'Active' },
  { account: 'security@sholok.com', event: 'Failed sign-in', location: 'Unknown', time: 'Today, 10:18 PM', status: 'Review' },
  { account: 'ops@sholok.com', event: 'MFA challenge', location: 'Dhaka, BD', time: 'Today, 9:54 PM', status: 'Completed' },
]

export default function Security() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [settings, setSettings] = useState({ mfa: true, sessionTimeout: true, ipAllowlist: false, securityAlerts: true })
  function toggle(k) { setSettings(s => ({ ...s, [k]: !s[k] })) }
  function resolve(i) { setAlerts(a => a.map((x, j) => j === i ? { ...x, status: 'Resolved' } : x)) }

  return (
    <>
      <PageHeading
        title="Security Center"
        desc="Monitor identity protection, suspicious activity and administrative access."
        actions={<>
          <button className="btn"><Download size={14} /> Export logs</button>
          <button className="btn btn-primary"><ShieldCheck size={14} /> Run access review</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Open alerts" value={alerts.filter(a => a.status === 'Open').length} icon={ShieldAlert} foot="Require investigation" kind="red" />
        <StatCard label="MFA coverage" value="96.4%" icon={KeyRound} foot="<span class='positive'>Strong coverage</span>" kind="green" />
        <StatCard label="Failed sign-ins" value="24" icon={LogIn} foot="In the last 24 hours" kind="amber" />
        <StatCard label="Privileged accounts" value="8" icon={Shield} foot="Review access regularly" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHead title="Security alerts" desc="Investigate and resolve events" />
          <div className="panel-body">
            <div className="activity-list">
              {alerts.length === 0 && <div className="empty-state">No security alerts.</div>}
              {alerts.map((a, i) => (
                <div key={i} className="alert-item">
                  <div className={`alert-symbol${a.type === 'warning' ? ' warning' : ''}`} style={{ fontSize: 15 }}>{a.icon}</div>
                  <div className="alert-copy">
                    <strong>{a.title}</strong>
                    <p>{a.desc}</p>
                    <small>{a.time}</small>
                    <div style={{ marginTop: 7 }}><StatusPill status={a.status} /></div>
                  </div>
                  {a.status !== 'Resolved' && (
                    <button className="btn btn-sm" onClick={() => resolve(i)}>Resolve</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel">
          <PanelHead title="Security policies" desc="Organization-wide access safeguards" />
          <div className="panel-body setting-list">
            <SettingRow label="Multi-factor authentication" desc="Require MFA for all privileged accounts." checked={settings.mfa} onChange={v => toggle('mfa')} />
            <SettingRow label="Session timeout" desc="Automatically expire inactive admin sessions." checked={settings.sessionTimeout} onChange={v => toggle('sessionTimeout')} />
            <SettingRow label="IP allowlist" desc="Restrict admin access to approved network ranges." checked={settings.ipAllowlist} onChange={v => toggle('ipAllowlist')} />
            <SettingRow label="Security notifications" desc="Notify administrators about important security events." checked={settings.securityAlerts} onChange={v => toggle('securityAlerts')} />
          </div>
        </section>
      </div>

      <div className="panel" style={{ marginTop: 17 }}>
        <PanelHead title="Recent sign-in events" desc="Illustrative event records from the interface" />
        <div className="table-scroll">
          <table>
            <thead><tr><th>Account</th><th>Event</th><th>Location</th><th>Time</th><th>Result</th></tr></thead>
            <tbody>
              {signIns.map((s, i) => (
                <tr key={i}>
                  <td className="table-primary">{s.account}</td>
                  <td>{s.event}</td>
                  <td>{s.location}</td>
                  <td>{s.time}</td>
                  <td><StatusPill status={s.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
