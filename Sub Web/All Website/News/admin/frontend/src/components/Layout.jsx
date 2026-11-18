import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const P = '#5D0096', A = '#D31710';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/news', label: 'All News', icon: '📰' },
  { to: '/news/create', label: 'Create News', icon: '✏️' },
  { to: '/categories', label: 'Categories', icon: '🗂️' },
  { to: '/authors', label: 'Authors', icon: '👤' },
  { to: '/media', label: 'Media Library', icon: '🖼️' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile }) => (
    <aside style={{
      width: 240, background: `linear-gradient(180deg, ${P} 0%, #3a005e 100%)`,
      display: 'flex', flexDirection: 'column', minHeight: mobile ? 'auto' : '100vh',
      position: mobile ? 'fixed' : 'sticky', top: 0, zIndex: mobile ? 200 : 1,
      left: 0, height: mobile ? '100vh' : undefined,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📰</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, lineHeight: 1 }}>SHOLOK</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>News Admin</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map(({ to, label, icon }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} onClick={() => setSidebarOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', textDecoration: 'none',
              color: active ? '#fff' : 'rgba(255,255,255,0.7)',
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderLeft: active ? `3px solid ${A}` : '3px solid transparent',
              fontSize: 14, fontWeight: active ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Signed in as</div>
        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{user?.name}</div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '7px 12px', background: A, color: '#fff',
          border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600,
        }}>Logout</button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none', '@media(min-width:768px)': { display: 'block' } }} className="sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />
          <Sidebar mobile />
        </>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: '#fff', borderBottom: '1px solid #ede9f5',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
          position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <button onClick={() => setSidebarOpen(v => !v)} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: P,
          }}>☰</button>
          <span style={{ fontWeight: 700, color: P, fontSize: 15 }}>Sholok News Admin</span>
          <div style={{ flex: 1 }} />
          <a href="https://sholok.com/news/" target="_blank" rel="noreferrer" style={{ color: A, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
            View Site ↗
          </a>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, background: '#f8f5ff', overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) { .sidebar-desktop { display: block !important; } }
      `}</style>
    </div>
  );
}
