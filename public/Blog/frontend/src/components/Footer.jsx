import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t('platform')]: [
      { label: t('home'), to: '/' },
      { label: t('trending'), to: '/search?sort=trending' },
      { label: t('shortClips'), to: '/clips' },
      { label: t('writePost'), to: '/write' },
    ],
    [t('categories')]: [
      { label: t('entertainment'), to: '/category/entertainment' },
      { label: t('lifestyle'), to: '/category/lifestyle' },
      { label: t('hobbiesTravel'), to: '/category/hobbies-travel' },
      { label: t('knowledge'), to: '/category/knowledge' },
    ],
    [t('account')]: [
      { label: t('signIn'), to: '/login' },
      { label: t('register'), to: '/register' },
      { label: t('dashboard'), to: '/dashboard' },
      { label: t('timeline'), to: '/timeline' },
    ],
  };

  return (
    <footer className="bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg font-heading">S</span>
              </div>
              <span className="font-heading font-bold text-xl text-white">Sholok Blog</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              {t('brandTagline')}
            </p>
            <div className="flex gap-3">
              {[FiTwitter, FiInstagram, FiGithub].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8" />
      </div>
    </footer>
  );
}
