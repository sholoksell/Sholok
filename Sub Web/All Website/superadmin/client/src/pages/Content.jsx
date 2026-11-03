import { useState } from 'react'
import { SlidersHorizontal, ListCheck, FileClock, Flag, CheckCircle, ShieldAlert } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, StatusPill, SettingRow } from '../components/shared.jsx'

const contentServices = [
  { name: 'News', icon: '📰', desc: 'Articles, publisher submissions and corrections', pending: 12 },
  { name: 'Blog', icon: '📝', desc: 'Posts, comments and user reports', pending: 8 },
  { name: 'Cafe', icon: '💬', desc: 'Community posts, discussions and reports', pending: 23 },
  { name: 'Knowledge', icon: '❓', desc: 'Questions, answers and expert responses', pending: 17 },
  { name: 'Webtoon', icon: '📖', desc: 'Episodes, creator submissions and copyright claims', pending: 4 },
  { name: 'Series', icon: '📚', desc: 'Novels, comics, releases and rights claims', pending: 6 },
  { name: 'TV / Videos', icon: '🎬', desc: 'Videos, channels and copyright reports', pending: 9 },
  { name: 'Music', icon: '🎵', desc: 'Tracks, metadata and rights reports', pending: 3 },
]

export default function Content() {
  const [settings, setSettings] = useState({ moderation: true, securityAlerts: true })
  function toggle(k) { setSettings(s => ({ ...s, [k]: !s[k] })) }

  return (
    <>
      <PageHeading
        title="Content & Moderation"
        desc="Review submissions, reports and policy issues across content services."
        actions={<>
          <button className="btn"><SlidersHorizontal size={14} /> Moderation policy</button>
          <button className="btn btn-primary"><ListCheck size={14} /> Review queue</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Awaiting review" value="82" icon={FileClock} foot="Across content services" kind="amber" />
        <StatCard label="Reports to review" value="31" icon={Flag} foot="User-submitted reports" kind="red" />
        <StatCard label="Approved today" value="246" icon={CheckCircle} foot="<span class='positive'>Reviewed</span> content" kind="green" />
        <StatCard label="Policy violations" value="7" icon={ShieldAlert} foot="Require follow-up" kind="red" />
      </div>

      <div className="section-grid">
        {contentServices.map(s => (
          <article key={s.name} className="service-card">
            <div className="service-card-top">
              <div className="service-logo" style={{ fontSize: 18 }}>{s.icon}</div>
              <span className={`status-pill${s.pending > 15 ? ' warning' : ' neutral'}`}>{s.pending} pending</span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.desc}</p>
            <div className="service-card-bottom">
              <span className="service-meta">{s.pending} items awaiting review</span>
              <button>Review <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></button>
            </div>
          </article>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 17 }}>
        <PanelHead title="Moderation policy" desc="Platform-wide rules; service-specific queues remain separate" />
        <div className="panel-body setting-list">
          <SettingRow label="Automated content screening" desc="Flag suspicious content for human review." checked={settings.moderation} onChange={v => toggle('moderation')} />
          <SettingRow label="Escalate severe reports" desc="Notify Security Center when a severe report is received." checked={settings.securityAlerts} onChange={v => toggle('securityAlerts')} />
        </div>
      </div>
    </>
  )
}
