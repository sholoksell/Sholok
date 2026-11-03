import { RefreshCw, BarChart2, Activity, Timer, List, Database } from 'lucide-react'
import { useState } from 'react'
import { PageHeading, StatCard, PanelHead, StatusPill, SettingRow } from '../components/shared.jsx'

const metrics = [['CPU utilization', '42%', 42], ['Memory utilization', '68%', 68], ['Storage utilization', '64%', 64], ['Queue capacity', '28%', 28], ['API rate limit', '51%', 51]]
const components = [
  ['Admin API', 'Healthy'], ['Identity & SSO', 'Healthy'], ['Job workers', 'Healthy'],
  ['Search indexing', 'Healthy'], ['Notification queue', 'Healthy'], ['Backup scheduler', 'Review'],
]

export default function System() {
  const [settings, setSettings] = useState({ maintenance: false, backupAlerts: true })
  function toggle(k) { setSettings(s => ({ ...s, [k]: !s[k] })) }

  return (
    <>
      <PageHeading
        title="System Health"
        desc="Review infrastructure metrics, background processing and service availability."
        actions={<>
          <button className="btn"><RefreshCw size={14} /> Refresh metrics</button>
          <button className="btn btn-primary"><BarChart2 size={14} /> System report</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="API availability" value="99.97%" icon={Activity} foot="<span class='positive'>Healthy</span> in the last 30 days" kind="green" />
        <StatCard label="Average response" value="42 ms" icon={Timer} foot="Within configured target" />
        <StatCard label="Queue backlog" value="128" icon={List} foot="Jobs awaiting processing" kind="amber" />
        <StatCard label="Storage utilization" value="64%" icon={Database} foot="Within capacity threshold" kind="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHead title="Resource utilization" desc="Current monitored resource indicators" />
          <div className="panel-body">
            {metrics.map(([n, v, p]) => (
              <div key={n} className="system-metric">
                <div className="system-metric-head"><strong>{n}</strong><span>{v}</span></div>
                <div className="metric-bar"><span style={{ width: `${p}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <PanelHead title="Platform components" desc="Operational status" />
          <div className="panel-body service-health-list">
            {components.map(([n, s]) => (
              <div key={n} className="health-row">
                <div className="service-logo" style={{ fontSize: 14 }}>⚙️</div>
                <div className="health-info"><strong>{n}</strong><small>Health check</small></div>
                <StatusPill status={s} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="panel" style={{ marginTop: 17 }}>
        <PanelHead title="Maintenance controls" desc="Changes should be reviewed and logged" />
        <div className="panel-body setting-list">
          <SettingRow label="Maintenance mode" desc="Restrict public access while approved maintenance is underway." checked={settings.maintenance} onChange={v => toggle('maintenance')} />
          <SettingRow label="Backup alerts" desc="Notify administrators when a backup job fails." checked={settings.backupAlerts} onChange={v => toggle('backupAlerts')} />
        </div>
      </div>
    </>
  )
}
