export function StatusPill({ status }) {
  const cls = status === 'Active' || status === 'Resolved' || status === 'Connected' || status === 'Completed' || status === 'Successful'
    ? ''
    : status === 'Pending' || status === 'Review' || status === 'Monitoring' || status === 'In review'
    ? 'warning'
    : status === 'Suspended' || status === 'Blocked' || status === 'Deactive' || status === 'Failed' || status === 'Open'
    ? 'danger'
    : status === 'Maintenance'
    ? 'info'
    : 'neutral'
  return <span className={`status-pill${cls ? ` ${cls}` : ''}`}>{status}</span>
}

export function StatCard({ label, value, icon: Icon, foot, kind = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon${kind ? ` ${kind}` : ''}`}>
          <Icon size={18} strokeWidth={1.8} />
        </div>
        <span className="stat-period">Last 30 days</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot" dangerouslySetInnerHTML={{ __html: foot }} />
    </div>
  )
}

export function PageHeading({ eyebrow = 'SHOLOK CONTROL CENTER', title, desc, actions }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  )
}

export function PanelHead({ title, desc, right }) {
  return (
    <div className="panel-head">
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export function UserCell({ name, sub }) {
  const initials = name.split(' ').map(x => x[0]).slice(0, 2).join('')
  return (
    <div className="user-cell">
      <div className="user-avatar">{initials}</div>
      <div>
        <strong>{name}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}

export function SettingRow({ label, desc, checked, onChange }) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <p>{desc}</p>
      </div>
      <button
        className="toggle"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        aria-label={label}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
