import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import {
  FiSearch, FiPenTool, FiBell, FiUser, FiLogOut, FiLogIn, FiMenu, FiX,
  FiHome, FiTrendingUp, FiClock, FiVideo, FiSun, FiMoon, FiSettings, FiGrid, FiGlobe,
} from 'react-icons/fi';

const CATEGORY_KEYS = [
  { key: 'entertainment', slug: 'entertainment', icon: '🎨' },
  { key: 'lifestyle', slug: 'lifestyle', icon: '🛍️' },
  { key: 'hobbiesTravel', slug: 'hobbies-travel', icon: '🧭' },
  { key: 'knowledge', slug: 'knowledge', icon: '🧠' },
];

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const CATEGORIES = CATEGORY_KEYS.map((c) => ({ ...c, name: t(c.key) }));
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ tags: [], posts: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=10');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (_) {}
  };

  const handleSearchInput = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const res = await api.get(`/search/suggestions?q=${encodeURIComponent(val)}`);
        setSuggestions(res.data.suggestions);
        setShowSuggestions(true);
      } catch (_) {}
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800'}`}>
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg font-heading">S</span>
            </div>
            <span className="font-heading font-bold text-xl gradient-text hidden sm:block">Sholok Blog</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => suggestions.tags.length > 0 && setShowSuggestions(true)}
                  placeholder={t('searchPlaceholder')}
                  className="input pl-10 pr-4 py-2 text-sm rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
            </form>
            {showSuggestions && (suggestions.tags.length > 0 || suggestions.posts.length > 0) && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                {suggestions.tags.length > 0 && (
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{t('tags')}</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.tags.map((tag) => (
                        <button key={tag} onClick={() => { navigate(`/search?q=${tag}&type=posts`); setShowSuggestions(false); }}
                          className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-xs hover:bg-primary-100 transition">
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.posts.length > 0 && (
                  <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{t('posts')}</p>
                    {suggestions.posts.map((post) => (
                      <Link key={post._id} to={`/blog/${post.slug}`} onClick={() => setShowSuggestions(false)}
                        className="block px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {post.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
              {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            <button onClick={toggleLanguage} className="flex items-center gap-1 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300 text-xs font-semibold">
              <FiGlobe className="w-5 h-5" /> {language === 'bn' ? 'বাং' : 'EN'}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/write" className="btn-primary text-sm hidden sm:flex items-center gap-1.5 py-2 px-4">
                  <FiPenTool className="w-4 h-4" /> {t('write')}
                </Link>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
                    className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300">
                    <FiBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <span className="font-semibold text-sm">{t('notifications')}</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-500 hover:underline">{t('markAllRead')}</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-sm">{t('noNotifications')}</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                              onClick={() => { if (n.link) navigate(n.link); setShowNotifications(false); }}>
                              <img src={n.sender?.avatar || `https://ui-avatars.com/api/?name=${n.sender?.displayName}&background=6941ff&color=fff`}
                                alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.displayName}&background=6941ff&color=fff`}
                      alt={user.displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden py-1">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.displayName}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                      {[
                        { icon: FiUser, label: t('profile'), to: `/profile/${user.username}` },
                        { icon: FiGrid, label: t('dashboard'), to: '/dashboard' },
                        { icon: FiClock, label: t('timeline'), to: '/timeline' },
                        ...(isAdmin ? [{ icon: FiSettings, label: t('adminPanel'), to: 'http://localhost:5174', external: true }] : []),
                      ].map((item) => (
                        item.external ? (
                          <a key={item.label} href={item.to} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <item.icon className="w-4 h-4" /> {item.label}
                          </a>
                        ) : (
                          <Link key={item.label} to={item.to} onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                            <item.icon className="w-4 h-4" /> {item.label}
                          </Link>
                        )
                      ))}
                      <div className="border-t border-gray-100 dark:border-gray-800 mt-1">
                        <button onClick={() => { logout(); setShowUserMenu(false); navigate('/'); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full">
                          <FiLogOut className="w-4 h-4" /> {t('signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition px-3 py-2 hidden sm:block">{t('signIn')}</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">{t('getStarted')}</Link>
              </div>
            )}

            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300 lg:hidden">
              {showMobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div className="border-t border-gray-100 dark:border-gray-800 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            <Link to="/" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${location.pathname === '/' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <FiHome className="w-4 h-4" /> {t('home')}
            </Link>
            <Link to="/search?sort=trending" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>
              <FiTrendingUp className="w-4 h-4" /> {t('trending')}
            </Link>
            <Link to="/clips" className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}>
              <FiVideo className="w-4 h-4" /> {t('shortClips')}
            </Link>
            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-2" />
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${location.pathname.includes(cat.slug) ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 space-y-2 animate-slide-up">
          {isAuthenticated && (
            <Link to="/write" onClick={() => setShowMobileMenu(false)} className="btn-primary w-full flex items-center justify-center gap-2 mb-3">
              <FiPenTool className="w-4 h-4" /> {t('writePost')}
            </Link>
          )}
          {[{ name: t('home'), path: '/', icon: FiHome }, { name: t('trending'), path: '/search?sort=trending', icon: FiTrendingUp }, { name: t('shortClips'), path: '/clips', icon: FiVideo }].map((item) => (
            <Link key={item.name} to={item.path} onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <item.icon className="w-4 h-4" /> {item.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setShowMobileMenu(false)} className="btn-outline flex-1 text-center text-sm">{t('signIn')}</Link>
              <Link to="/register" onClick={() => setShowMobileMenu(false)} className="btn-primary flex-1 text-center text-sm">{t('getStarted')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
