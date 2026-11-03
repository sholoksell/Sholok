import { BookOpen, Plug, Settings, Activity, Lock } from 'lucide-react'
import { PageHeading, PanelHead, StatusPill } from '../components/shared.jsx'

const providers = [
  { name: 'Payment gateway', icon: '💳', desc: 'Payment processing and reconciliation', status: 'Connected' },
  { name: 'Email delivery', icon: '📧', desc: 'Transactional mail and delivery reports', status: 'Connected' },
  { name: 'Maps data provider', icon: '🗺', desc: 'Place and map data feed', status: 'Connected' },
  { name: 'Translation provider', icon: '🌐', desc: 'Translation API and language coverage', status: 'Connected' },
  { name: 'Finance data feed', icon: '📈', desc: 'Market data provider integration', status: 'Review' },
  { name: 'Weather data provider', icon: '⛅', desc: 'Forecast and alert data feed', status: 'Connected' },
  { name: 'Sports data feed', icon: '🏆', desc: 'Fixtures, results and live scores', status: 'Connected' },
  { name: 'Video processing', icon: '🎬', desc: 'Media processing and streaming', status: 'Connected' },
]

export default function Integrations() {
  return (
    <>
      <PageHeading
        title="Integrations & APIs"
        desc="Manage external service providers, API access and connected data feeds."
        actions={<>
          <button className="btn"><BookOpen size={14} /> Integration guide</button>
          <button className="btn btn-primary"><Plug size={14} /> Add integration</button>
        </>}
      />

      <div className="inline-note" style={{ marginBottom: 16 }}>
        <Lock size={15} />
        Provider credentials must be stored securely on the server. This interface never displays secret values or stores API keys in browser storage.
      </div>

      <div className="panel">
        <PanelHead title="Connected providers" desc="Provider status and configuration" />
        <div>
          {providers.map(p => (
            <div key={p.name} className="integration-row">
              <div className="integration-logo" style={{ fontSize: 18 }}>{p.icon}</div>
              <div className="integration-info">
                <strong>{p.name}</strong>
                <small>{p.desc}</small>
              </div>
              <StatusPill status={p.status} />
              <div className="integration-actions">
                <button className="mini-icon-btn" title="Configure provider"><Settings size={13} /></button>
                <button className="mini-icon-btn" title="Test connection"><Activity size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
