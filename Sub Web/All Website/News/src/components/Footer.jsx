import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const socialLinks = [
  { name: 'Facebook', href: '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { name: 'Twitter', href: '#', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
  { name: 'YouTube', href: '#', icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z' },
];

const footerCategories = [
  'national', 'international', 'politics', 'economy',
  'sports', 'entertainment', 'tech', 'lifestyle',
];

export default function Footer() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      {/* Main Footer */}
      <div className="container-news py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-accent-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">শ</span>
              </div>
              <h3 className={`text-xl font-bold text-white ${isBn ? 'font-bangla' : ''}`}>
                {t('site.name')}
              </h3>
            </div>
            <p className={`text-sm text-gray-400 leading-relaxed mb-4 ${isBn ? 'font-bangla' : ''}`}>
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 bg-gray-800 hover:bg-accent-700 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className={`text-white font-semibold mb-4 ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? 'বিভাগসমূহ' : 'Categories'}
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(0, 4).map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className={`text-sm text-gray-400 hover:text-white transition-colors ${isBn ? 'font-bangla' : ''}`}>
                    {t(`nav.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`text-white font-semibold mb-4 ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? 'আরও বিভাগ' : 'More Sections'}
            </h4>
            <ul className="space-y-2">
              {footerCategories.slice(4).map((cat) => (
                <li key={cat}>
                  <Link to={`/category/${cat}`} className={`text-sm text-gray-400 hover:text-white transition-colors ${isBn ? 'font-bangla' : ''}`}>
                    {t(`nav.${cat}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-white font-semibold mb-4 ${isBn ? 'font-bangla' : ''}`}>
              {isBn ? 'দরকারি লিংক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2">
              {['about', 'contact', 'privacy', 'terms'].map((link) => (
                <li key={link}>
                  <a href={`#${link}`} className={`text-sm text-gray-400 hover:text-white transition-colors ${isBn ? 'font-bangla' : ''}`}>
                    {t(`footer.${link}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </footer>
  );
}
