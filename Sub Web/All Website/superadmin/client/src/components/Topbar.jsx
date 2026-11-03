import { useLocation } from 'react-router-dom'
import { Menu, Search, Bell, ChevronRight, ChevronDown, Settings } from 'lucide-react'
import { useAuth } from '../lib/auth.jsx'
import { NAV_ITEMS } from '../lib/constants.js'

export default function Topbar({ onMenuToggle }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find(i => i.path === pathname)
  const initials = user ? user.name.split(' ').map(x => x[0]).slice(0, 2).join('') : 'SA'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn menu-toggle" onClick={onMenuToggle} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <div className="breadcrumb">
          <span>Control Center</span>
          <ChevronRight size={13} />
          <strong>{current?.label || 'Overview'}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="global-search" aria-label="Global search">
          <Search size={15} />
          <input placeholder="Search…" />
          <kbd>⌘K</kbd>
        </label>
        <div className="top-action">
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <span className="notification-pip" />
        </div>
        <button className="icon-btn" aria-label="Settings">
          <Settings size={16} />
        </button>
        <button className="profile-top" aria-label="Profile">
          <div className="avatar">{initials}</div>
          <div className="profile-top-copy">
            <strong>{user?.name || 'Super Admin'}</strong>
            <small>Super Admin</small>
          </div>
          <ChevronDown size={13} />
        </button>
      </div>
    </header>
  )
}
