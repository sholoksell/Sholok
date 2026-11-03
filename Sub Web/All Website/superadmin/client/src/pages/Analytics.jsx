import { useRef, useEffect } from 'react'
import { Clock, Download, Users, Activity, Timer, ShieldCheck } from 'lucide-react'
import { PageHeading, StatCard, PanelHead } from '../components/shared.jsx'

function TrafficChart() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const rect = c.getBoundingClientRect()
    c.width = rect.width * dpr
    c.height = rect.height * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    const w = c.width / dpr, h = c.height / dpr
    const pad = { l: 31, r: 8, t: 12, b: 25 }
    const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b
    ctx.font = '9px Manrope, system-ui'
    for (let i = 0; i < 5; i++) {
      const y = pad.t + ch * i / 4
      ctx.strokeStyle = '#eee8f2'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke()
      ctx.fillStyle = '#a095a8'; ctx.fillText((100 - i * 20) + 'k', 1, y + 3)
    }
    const visits = [39,48,44,58,52,66,61,74,69,83,76,91]
    const active = [21,26,23,33,30,39,36,45,42,50,47,58]
    const drawLine = (data, color, fill) => {
      ctx.beginPath()
      data.forEach((v, i) => { const x = pad.l + cw * i / (data.length - 1), y = pad.t + ch * (1 - v / 100); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
      if (fill) {
        ctx.lineTo(pad.l + cw, pad.t + ch); ctx.lineTo(pad.l, pad.t + ch); ctx.closePath()
        ctx.fillStyle = color; ctx.globalAlpha = 0.08; ctx.fill(); ctx.globalAlpha = 1
        ctx.beginPath(); data.forEach((v, i) => { const x = pad.l + cw * i / (data.length - 1), y = pad.t + ch * (1 - v / 100); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()
    }
    drawLine(visits, '#5D0096', true)
    drawLine(active, '#D31710', false)
  }, [])
  return (
    <>
      <div className="chart-wrap"><canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} /></div>
      <div className="chart-legend" style={{ marginTop: 8 }}>
        <span><i className="legend-dot" />Platform visits</span>
        <span><i className="legend-dot red" />Active users</span>
      </div>
    </>
  )
}

const serviceUsage = [['Search', 92], ['My Account', 76], ['Shopping', 68], ['Mail', 57], ['Map', 49], ['Music', 37]]

const reports = [
  { title: 'Platform usage', icon: '📊', desc: 'Visits, sessions, active users and engagement.' },
  { title: 'Service health', icon: '⚡', desc: 'Availability, response time, errors and uptime.' },
  { title: 'Security activity', icon: '🛡', desc: 'Sign-in events, alerts and privileged actions.' },
  { title: 'Commerce summary', icon: '💼', desc: 'Orders, settlements, refunds and commissions.' },
  { title: 'Content operations', icon: '📄', desc: 'Publishing, moderation and approval activity.' },
  { title: 'Provider usage', icon: '🔌', desc: 'API usage, quotas, errors and provider costs.' },
]

export default function Analytics() {
  return (
    <>
      <PageHeading
        title="Analytics & Reports"
        desc="Explore platform usage, service performance and operational trends."
        actions={<>
          <button className="btn"><Clock size={14} /> Schedule report</button>
          <button className="btn btn-primary"><Download size={14} /> Export report</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Monthly active users" value="142,580" icon={Users} foot="<span class='positive'>↑ 12.8%</span> month over month" />
        <StatCard label="Service sessions" value="2.84M" icon={Activity} foot="<span class='positive'>↑ 8.4%</span> month over month" kind="green" />
        <StatCard label="Avg. response time" value="42 ms" icon={Timer} foot="<span class='positive'>Within target</span>" kind="amber" />
        <StatCard label="Platform availability" value="99.97%" icon={ShieldCheck} foot="Across monitored services" kind="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHead title="Usage trends" desc="Platform visits and active users"
            right={<select className="select"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select>}
          />
          <div className="panel-body"><TrafficChart /></div>
        </section>
        <section className="panel">
          <PanelHead title="Service usage" desc="Highest activity by service" />
          <div className="panel-body">
            {serviceUsage.map(([n, v]) => (
              <div key={n} className="system-metric">
                <div className="system-metric-head"><strong>{n}</strong><span>{v}% of index</span></div>
                <div className="metric-bar"><span style={{ width: `${v}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="report-cards" style={{ marginTop: 17 }}>
        {reports.map(r => (
          <article key={r.title} className="report-card">
            <div className="stat-icon" style={{ marginBottom: 15 }}>{r.icon}</div>
            <h3>{r.title}</h3>
            <p>{r.desc}</p>
            <button className="btn btn-sm">
              Generate report <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </article>
        ))}
      </div>
    </>
  )
}
