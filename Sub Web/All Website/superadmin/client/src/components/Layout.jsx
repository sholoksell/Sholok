import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { ToastProvider } from './Toast.jsx'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="app-shell">
        <div
          className={`sidebar-scrim${sidebarOpen ? ' show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-area">
          <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />
          <main className="page-content">
            <Outlet />
          </main>
          <footer className="footer">
            <span>© 2026 Sholok · Super Admin Control Center</span>
            <span>
              <span className="status-dot" />
              <span className="footer-sep">·</span>
              All systems operational
              <span className="footer-sep">·</span>
              <button type="button">Help</button>
            </span>
          </footer>
        </div>
      </div>
    </ToastProvider>
  )
}
