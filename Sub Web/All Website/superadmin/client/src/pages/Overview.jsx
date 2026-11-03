import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Zap, Users, Layers, TrendingUp, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react'
import { PageHeading, StatCard, PanelHead, UserCell, StatusPill } from '../components/shared.jsx'
import { SERVICES } from '../lib/constants.js'

const initialAdmins = [
  { id: 1001, name: 'Ayesha Rahman', email: 'ayesha.rahman@sholok.com', mobile: '01710000001', role: 'Service Administrator', services: ['News'], status: 'Active', joined: 'Oct 21, 2026' },
  { id: 1002, name: 'Tanvir Hasan', email: 'tanvir.hasan@sholok.com', mobile: '01710000002', role: 'Content Moderator', services: ['Cafe'], status: 'Active', joined: 'Oct 20, 2026' },
  { id: 1003, name: 'Nusrat Jahan', email: 'nusrat.jahan@sholok.com', mobile: '01710000003', role: 'Finance Administrator', services: ['Finance'], status: 'Pending', joined: 'Oct 19, 2026' },
  { id: 1004, name: 'Mahmud Karim', email: 'mahmud.karim@sholok.com', mobile: '01710000004', role: 'Data Provider', services: ['Finance'], status: 'Active', joined: 'Oct 18, 2026' },
  { id: 1005, name: 'Rafi Ahmed', email: 'rafi.ahmed@sholok.com', mobile: '01710000006', role: 'System Administrator', services: ['All services'], status: 'Active', joined: 'Oct 14, 2026' },
]

const initialActivity = [
  { icon: '👤', text: '<strong>A new service administrator</strong> was added to News.', time: '12 minutes ago' },
  { icon: '🛡', text: '<strong>Multi-factor authentication</strong> policy was updated.', time: '38 minutes ago' },
  { icon: '✅', text: '<strong>Publisher verification</strong> was approved.', time: '1 hour ago' },
  { icon: '🔌', text: '<strong>Finance data provider</strong> completed a sync.', time: '2 hours ago' },
  { icon: '⚙️', text: '<strong>Global settings</strong> were reviewed.', time: '3 hours ago' },
]

const initialAlerts = [
  { type: 'danger', title: 'Unusual sign-in activity', desc: 'A sign-in attempt needs security review.', time: '8 minutes ago', status: 'Open' },
  { type: 'warning', title: 'Backup verification due', desc: 'Review the latest backup restore test.', time: '42 minutes ago', status: 'Review' },
  { type: 'warning', title: 'Provider response time elevated', desc: 'A connected data feed is responding slowly.', time: '1 hour ago', status: 'Monitoring' },
]

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
    ctx.fillStyle = '#a095a8'
    ctx.strokeStyle = '#eee8f2'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = pad.t + ch * i / 4
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke()
      ctx.fillText((100 - i * 20) + 'k', 1, y + 3)
    }
    const visits = [39,48,44,58,52,66,61,74,69,83,76,91]
    const active = [21,26,23,33,30,39,36,45,42,50,47,58]
    function line(data, color, fill) {
      ctx.beginPath()
      data.forEach((v, i) => {
        const x = pad.l + cw * i / (data.length - 1), y = pad.t + ch * (1 - v / 100)
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
      })
      if (fill) {
        ctx.lineTo(pad.l + cw, pad.t + ch); ctx.lineTo(pad.l, pad.t + ch); ctx.closePath()
        ctx.fillStyle = color; ctx.globalAlpha = 0.08; ctx.fill(); ctx.globalAlpha = 1
        ctx.beginPath(); data.forEach((v, i) => { const x = pad.l + cw * i / (data.length - 1), y = pad.t + ch * (1 - v / 100); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
      }
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke()
      const last = data.length - 1
      ctx.beginPath(); ctx.arc(pad.l + cw, pad.t + ch * (1 - data[last] / 100), 3.2, 0, Math.PI * 2)
      ctx.fillStyle = color; ctx.fill()
    }
    line(visits, '#5D0096', true); line(active, '#D31710', false)
    const ticks = ['1 Oct','4 Oct','7 Oct','10 Oct','13 Oct','16 Oct','19 Oct','22 Oct','25 Oct','28 Oct']
    ticks.forEach((t, i) => { ctx.fillStyle = '#a095a8'; ctx.fillText(t, pad.l + cw * i / 9 - 10, h - 6) })
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

export default function Overview() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState(initialAlerts)
  const activeCount = SERVICES.filter(s => s.status === 'Active').length

  return (
    <>
      <PageHeading
        title="Sholok Super Admin"
        desc="The central console for managing Sholok's services, users, content, e-commerce, security, and system operations."
        actions={<>
          <button className="btn"><Download size={14} /> Export report</button>
          <button className="btn btn-primary"><Zap size={14} /> Quick actions</button>
        </>}
      />

      <div className="stats-grid">
        <StatCard label="Registered users" value="142,580" icon={Users} foot="<span class='positive'>↑ 12.8%</span> vs previous period" />
        <StatCard label="Active services" value={`${activeCount} / 17`} icon={Layers} foot="<span class='positive'></span> across the platform" kind="green" />
        <StatCard label="Platform visits" value="2.84M" icon={TrendingUp} foot="<span class='positive'>↑ 8.4%</span> this month" />
        <StatCard label="Open security alerts" value={alerts.filter(a => a.status === 'Open').length} icon={ShieldAlert} foot="<span class='negative'>Needs attention</span> review alerts" kind="red" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <PanelHead title="Platform activity" desc="Traffic and active users over time"
            right={<select className="select"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select>}
          />
          <div className="panel-body"><TrafficChart /></div>
        </section>
        <section className="panel">
          <PanelHead title="Service health" desc="Live operational overview"
            right={<button className="btn btn-sm" onClick={() => navigate('/services')}>View all</button>}
          />
          <div className="panel-body">
            <div className="service-health-list">
              {SERVICES.slice(0, 5).map(s => (
                <div key={s.name} className="health-row">
                  <div className="service-logo" style={{ fontSize: 16 }}>
                    {s.name[0]}
                  </div>
                  <div className="health-info">
                    <strong>{s.name}</strong>
                    <small>{s.category}</small>
                  </div>
                  <span className={`health-status${s.status !== 'Active' ? ' down' : ''}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
          <a className="panel-link" href="#" onClick={e => { e.preventDefault(); navigate('/services') }}>
            View all 17 services <ArrowRight size={13} />
          </a>
        </section>
      </div>

      <div className="panel table-panel">
        <PanelHead title="Recently added administrators" desc="Manage users and service access"
          right={<button className="btn btn-sm" onClick={() => navigate('/users')}>Manage users <ArrowRight size={12} /></button>}
        />
        <div className="table-tools">
          <label className="table-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input placeholder="Search users by name or email" />
          </label>
          <select className="select"><option>All statuses</option><option>Active</option><option>Pending</option><option>Suspended</option></select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Administrator</th><th>Mobile Number</th><th>Role</th><th>Service</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialAdmins.map(u => (
                <tr key={u.id}>
                  <td><UserCell name={u.name} sub={u.email} /></td>
                  <td>{u.mobile}</td>
                  <td>{u.role}</td>
                  <td>{u.services.slice(0, 2).join(', ')}{u.services.length > 2 ? ` +${u.services.length - 2}` : ''}</td>
                  <td><StatusPill status={u.status} /></td>
                  <td>{u.joined}</td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-icon-btn" title="Edit"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button className="mini-icon-btn" title="View access"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{initialAdmins.length} records shown</span>
          <button className="btn btn-sm" onClick={() => navigate('/users')}>Open user directory</button>
        </div>
      </div>

      <div className="bottom-grid">
        <section className="panel">
          <PanelHead title="Recent activity" desc="Latest administrative actions"
            right={<button className="btn btn-sm" onClick={() => navigate('/audit')}>Audit logs</button>}
          />
          <div className="panel-body">
            <div className="activity-list">
              {initialActivity.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon" style={{ fontSize: 14 }}>{a.icon}</div>
                  <div className="activity-copy">
                    <p dangerouslySetInnerHTML={{ __html: a.text }} />
                    <small>{a.time}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="panel">
          <PanelHead title="Needs your attention" desc="Alerts and pending actions"
            right={<button className="btn btn-sm" onClick={() => navigate('/security')}>View center</button>}
          />
          <div className="panel-body">
            <div className="activity-list">
              {alerts.filter(a => a.status !== 'Resolved').map((a, i) => (
                <div key={i} className="alert-item">
                  <div className={`alert-symbol${a.type === 'warning' ? ' warning' : ''}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  </div>
                  <div className="alert-copy">
                    <strong>{a.title}</strong>
                    <p>{a.desc}</p>
                    <small>{a.time}</small>
                  </div>
                  <button
                    className="mini-icon-btn"
                    title="Resolve"
                    onClick={() => setAlerts(prev => prev.map((x, j) => j === i ? { ...x, status: 'Resolved' } : x))}
                  >
                    <CheckCircle size={13} />
                  </button>
                </div>
              ))}
              {alerts.every(a => a.status === 'Resolved') && (
                <div className="empty-state">No open alerts.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
