import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { fetchSearch } from '../utils/api';

const NAV_CATS = [
  'home', 'national', 'international', 'sports',
  'economy', 'tech', 'entertainment', 'lifestyle', 'health',
];

function SearchOverlay({ onClose, lang, t, isBn }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (val) => {
    if (!val.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const r = await fetchSearch(val, 1, 8);
      setResults(r.articles || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(q), 320);
    return () => clearTimeout(timer);
  }, [q, doSearch]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const title = (a) => isBn && a.title_bn ? a.title_bn : a.title_en;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="w-full max-w-2xl px-4" onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('nav.search')}
            className={`w-full pl-12 pr-14 py-4 text-lg bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-primary-800 text-gray-900 dark:text-white placeholder-gray-400 ${isBn ? 'font-bangla' : ''}`}
          />
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Results */}
        {(results.length > 0 || loading) && (
          <div className="mt-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">{t('common.searching')}</div>
            ) : results.map((item, i) => (
              <Link
                key={item.id}
                to={`/article/${item.slug}`}
                onClick={onClose}
                className={`flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${i === 0 ? 'rounded-t-2xl' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300 mb-1">
                    {item.category_name}
                  </span>
                  <p className={`text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 ${isBn ? 'font-bangla' : ''}`}>
                    {title(item)}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            {!loading && results.length === 0 && q.trim() && (
              <div className={`p-5 text-center text-gray-400 text-sm ${isBn ? 'font-bangla' : ''}`}>{t('common.noResults')}</div>
            )}
          </div>
        )}
        <p className="text-center text-white/50 text-xs mt-4">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded">Esc</kbd> to close</p>
      </div>
    </div>
  );
}

export default function Navbar() {
  const { lang, t, toggleLanguage } = useLanguage();
  const isBn = lang === 'bn';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const toggleDark = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };

  const getCatPath = (cat) => cat === 'home' ? '/' : `/category/${cat}`;
  const isActive = (cat) => cat === 'home' ? location.pathname === '/' : location.pathname === `/category/${cat}`;

  return (
    <>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} lang={lang} t={t} isBn={isBn} />}

      <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
        {/* Top Bar */}
        <div className="bg-primary-800 text-white">
          <div className="container-news flex items-center justify-between py-1.5">
            <span className={`hidden sm:inline text-xs text-white/70 ${isBn ? 'font-bangla' : ''}`}>
              {new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={toggleLanguage} className={`text-xs font-semibold bg-white/15 hover:bg-white/25 px-3 py-1 rounded-full transition-colors flex items-center gap-1.5 ${isBn ? 'font-bangla' : ''}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {isBn ? 'English' : 'বাংলা'}
              </button>
              <button onClick={toggleDark} className="bg-white/15 hover:bg-white/25 p-1.5 rounded-full transition-colors" aria-label="Toggle dark mode">
                {darkMode
                  ? <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                  : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Logo + Search */}
        <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <div className="container-news py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, #5D0096, #D31710)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="white" fillOpacity=".2"/>
                  <rect x="5" y="8" width="14" height="1.5" rx=".75" fill="white"/>
                  <rect x="5" y="11" width="14" height="1.5" rx=".75" fill="white"/>
                  <rect x="5" y="14" width="9" height="1.5" rx=".75" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className={`text-xl font-extrabold leading-tight tracking-tight text-primary-800 dark:text-primary-300 font-editorial ${isBn ? 'font-bangla text-lg' : ''}`}>
                  {t('site.name')}
                </h1>
                <p className={`text-[10px] text-gray-400 leading-none ${isBn ? 'font-bangla' : ''}`}>{t('site.tagline')}</p>
              </div>
            </Link>

            {/* Search button desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-full transition-colors w-56"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className={`${isBn ? 'font-bangla text-xs' : ''}`}>{t('nav.search')}</span>
            </button>

            {/* Mobile controls */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={() => setMenuOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Category Nav — desktop */}
        <nav className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
          <div className="container-news hidden md:block">
            <ul className="flex items-center gap-0.5 no-scrollbar overflow-x-auto">
              {NAV_CATS.map(cat => {
                const active = isActive(cat);
                return (
                  <li key={cat}>
                    <Link
                      to={getCatPath(cat)}
                      className={`relative block px-3.5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                        active
                          ? 'text-primary-800 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-primary-800 dark:hover:text-primary-300'
                      } ${isBn ? 'font-bangla' : ''}`}
                    >
                      {t(`nav.${cat}`)}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 rounded-full bg-primary-800 dark:bg-primary-400" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-overlay" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer-panel open">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className={`font-extrabold text-primary-800 dark:text-primary-300 text-lg font-editorial ${isBn ? 'font-bangla' : ''}`}>{t('site.name')}</span>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="py-2">
              {NAV_CATS.map(cat => (
                <li key={cat}>
                  <Link
                    to={getCatPath(cat)}
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                      isActive(cat)
                        ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-800 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } ${isBn ? 'font-bangla' : ''}`}
                  >
                    {isActive(cat) && <span className="w-1 h-4 rounded-full bg-primary-800 flex-shrink-0" />}
                    {t(`nav.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
