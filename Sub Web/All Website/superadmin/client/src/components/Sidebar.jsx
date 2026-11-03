import { NavLink } from 'react-router-dom'
import { X, ChevronRight, HelpCircle } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { NAV_ITEMS } from '../lib/constants.js'
import * as Icons from 'lucide-react'

function NavIcon({ name }) {
  const Comp = Icons[name]
  return Comp ? <Comp size={17} strokeWidth={1.8} /> : null
}

const GROUPS = ['MAIN', 'ACCESS', 'OPERATIONS', 'INTELLIGENCE', 'INFRASTRUCTURE', 'PLATFORM']

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const initials = user ? user.name.split(' ').map(x => x[0]).slice(0, 2).join('') : 'SA'

  const grouped = GROUPS.map(g => ({
    label: g,
    items: NAV_ITEMS.filter(i => i.group === g),
  }))

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">S</div>
        <div className="brand-copy">
          <strong>SHOLOK</strong>
          <span>CONTROL CENTER</span>
        </div>
        <button className="sidebar-close icon-btn" onClick={onClose} aria-label="Close menu">
          <X size={16} />
        </button>
      </div>

      <div className="workspace-switch">
        <div className="workspace-icon"><Icons.Globe size={16} /></div>
        <div>
          <strong>Sholok Platform</strong>
          <small>Super Admin</small>
        </div>
        <ChevronRight size={14} className="switch-icon" />
      </div>

      <nav>
        {grouped.map(({ label, items }) => (
          <div key={label}>
            <div className={`nav-label${label !== 'MAIN' ? ' nav-label-spaced' : ''}`}>{label}</div>
            {items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><HelpCircle size={15} /></div>
          <strong>Need help?</strong>
          <p>Check the admin guide or contact platform support.</p>
          <button type="button">
            Open documentation <Icons.ArrowUpRight size={13} />
          </button>
        </div>
        <button
          type="button"
          className="profile-mini"
          onClick={logout}
          title="Sign out"
        >
          <div className="avatar">{initials}</div>
          <div className="profile-text">
            <strong>{user?.name || 'Super Admin'}</strong>
            <small>Sign out</small>
          </div>
          <Icons.LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
