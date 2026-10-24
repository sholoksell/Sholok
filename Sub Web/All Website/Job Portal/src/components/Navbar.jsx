import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const { savedJobs } = useSavedJobs();
  const { user, logout, isVendor, isAdmin, isSuperAdmin } = useAuth();
  const { lang, toggleLang, t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path || (path === '/jobs' && location.pathname === '/');

  const getDashboardPath = () => {
    if (isSuperAdmin) return '/super-admin';
    if (isAdmin) return '/admin';
    if (isVendor) return '/vendor';
    return '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const handlePostJob = () => {
    if (isVendor) navigate('/vendor');
    else navigate('/register');
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">💼</span>
          <span>
            <span className="navbar__logo-bd">Sholok</span>
            <span className="navbar__logo-text"> Jobs</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          <Link to="/jobs" className={`navbar__link ${isActive('/jobs') ? 'active' : ''}`}>
            {t('nav_findJobs')}
          </Link>
          <Link to="/saved" className={`navbar__link ${isActive('/saved') ? 'active' : ''}`}>
            {t('nav_savedJobs')}
            {savedJobs.length > 0 && (
              <span className="navbar__badge">{savedJobs.length}</span>
            )}
          </Link>
        </nav>

        {/* CTA */}
        <div className="navbar__actions">
          {/* Language Toggle */}
          <button className="navbar__lang-btn" onClick={toggleLang} title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            {lang === 'bn' ? 'EN' : 'বাং'}
          </button>

          <Link to="/saved" className="btn-saved-nav">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedJobs.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {savedJobs.length > 0 && <span>{savedJobs.length}</span>}
          </Link>
          {user ? (
            <>
              {(isVendor || isAdmin || isSuperAdmin) && (
                <Link to={getDashboardPath()} className="navbar__post-btn" style={{ background: 'var(--secondary)', marginRight: 6 }}>
                  {t('nav_dashboard')}
                </Link>
              )}
              <button className="navbar__post-btn" style={{ background: 'var(--danger)', fontSize: 12, padding: '8px 14px' }} onClick={handleLogout}>
                {t('nav_logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__post-btn" style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', marginRight: 6 }}>
                {t('nav_login')}
              </Link>
              <button className="navbar__post-btn" onClick={handlePostJob}>{t('nav_postJob')}</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu fade-in">
          <button className="navbar__mobile-link navbar__lang-mobile" onClick={() => { toggleLang(); }}>
            🌐 {lang === 'bn' ? 'English' : 'বাংলা'}
          </button>
          <Link to="/jobs" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{t('nav_findJobs')}</Link>
          <Link to="/saved" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
            {t('nav_savedJobs')} {savedJobs.length > 0 && `(${savedJobs.length})`}
          </Link>
          {user ? (
            <>
              {(isVendor || isAdmin || isSuperAdmin) && (
                <Link to={getDashboardPath()} className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>
                  {t('nav_dashboard')}
                </Link>
              )}
              <button className="navbar__post-btn mobile" onClick={handleLogout}>{t('nav_logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{t('nav_login')}</Link>
              <Link to="/register" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>{t('nav_register')}</Link>
              <button className="navbar__post-btn mobile" onClick={() => { setMenuOpen(false); handlePostJob(); }}>{t('nav_postJob')}</button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
