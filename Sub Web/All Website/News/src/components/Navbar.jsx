import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const navCategories = [
  'home', 'national', 'international', 'politics',
  'economy', 'sports', 'entertainment', 'tech', 'lifestyle',
];

export default function Navbar() {
  const { lang, t, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const handleDarkToggle = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getCatPath = (cat) => (cat === 'home' ? '/' : `/category/${cat}`);
  const isActive = (cat) => {
    if (cat === 'home') return location.pathname === '/';
    return location.pathname === `/category/${cat}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-surface-dark shadow-md">
      {/* Top Bar */}
      <div className="bg-primary-800 text-white">
        <div className="container-news flex items-center justify-between py-1.5 text-sm">
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs font-medium transition-colors"
              aria-label="Toggle language"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={handleDarkToggle}
              className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Logo + Search Bar */}
      <div className="container-news py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-accent-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">শ</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold text-primary-800 dark:text-primary-300 leading-tight ${lang === 'bn' ? 'font-bangla' : ''}`}>
                {t('site.name')}
              </h1>
              <p className={`text-xs text-gray-500 dark:text-gray-400 ${lang === 'bn' ? 'font-bangla' : ''}`}>
                {t('site.tagline')}
              </p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder={t('nav.search')}
                className={`w-64 pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-gray-200 ${lang === 'bn' ? 'font-bangla' : ''}`}
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-surface-dark">
        {/* Desktop Navigation */}
        <div className="container-news hidden md:block">
          <ul className="flex items-center gap-1 overflow-x-auto">
            {navCategories.map((cat) => (
              <li key={cat}>
                <Link
                  to={getCatPath(cat)}
                  className={`block px-4 py-3 text-sm font-medium whitespace-nowrap hover:text-accent-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b-2 border-transparent hover:border-accent-700 ${
                    isActive(cat)
                      ? 'text-accent-700 border-accent-700'
                      : 'text-gray-700 dark:text-gray-300'
                  } ${lang === 'bn' ? 'font-bangla' : ''}`}
                >
                  {t(`nav.${cat}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-700 animate-fade-in">
            {/* Mobile Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-200 ${lang === 'bn' ? 'font-bangla' : ''}`}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <ul className="pb-3">
              {navCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={getCatPath(cat)}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-6 py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isActive(cat)
                        ? 'text-accent-700 bg-accent-50 dark:bg-accent-950'
                        : 'text-gray-700 dark:text-gray-300'
                    } ${lang === 'bn' ? 'font-bangla' : ''}`}
                  >
                    {t(`nav.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
