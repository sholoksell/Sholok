import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

const FOOTER_LINKS = [
  ['footer.about', '/about'],
  ['footer.contact', '/contact'],
  ['footer.privacy', '/privacy'],
  ['footer.terms', '/terms'],
  ['footer.editorial', '/editorial'],
];

const CATEGORIES = [
  ['nav.national', '/category/national'],
  ['nav.international', '/category/international'],
  ['nav.economy', '/category/economy'],
  ['nav.sports', '/category/sports'],
  ['nav.tech', '/category/technology'],
  ['nav.health', '/category/health'],
];

export default function Footer() {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  return (
    <footer className="bg-gray-950 text-gray-300 mt-16">
      <div className="container-news py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5D0096, #D31710)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="white" fillOpacity=".2"/>
                  <rect x="5" y="8" width="14" height="1.5" rx=".75" fill="white"/>
                  <rect x="5" y="11" width="14" height="1.5" rx=".75" fill="white"/>
                  <rect x="5" y="14" width="9" height="1.5" rx=".75" fill="white"/>
                </svg>
              </div>
              <span className={`font-extrabold text-white font-editorial ${isBn ? 'font-bangla text-base' : 'text-xl'}`}>{t('site.name')}</span>
            </Link>
            <p className={`text-sm text-gray-400 leading-relaxed mb-5 ${isBn ? 'font-bangla' : ''}`}>
              {t('footer.description')}
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { label: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
                { label: 'YouTube', path: 'M22.54 6.42a2.78 2.78 0 00-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM10 15.5v-7l6 3.5-6 3.5z' },
              ].map(({ label, path }) => (
                <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary-800 flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className={`text-white font-semibold mb-4 text-sm ${isBn ? 'font-bangla' : ''}`}>{isBn ? 'বিভাগ' : 'Categories'}</h4>
            <ul className="space-y-2">
              {CATEGORIES.map(([key, path]) => (
                <li key={key}>
                  <Link to={path} className={`text-sm text-gray-400 hover:text-white hover:pl-1 transition-all ${isBn ? 'font-bangla' : ''}`}>
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className={`text-white font-semibold mb-4 text-sm ${isBn ? 'font-bangla' : ''}`}>{isBn ? 'তথ্য' : 'Information'}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.map(([key, path]) => (
                <li key={key}>
                  <Link to={path} className={`text-sm text-gray-400 hover:text-white hover:pl-1 transition-all ${isBn ? 'font-bangla' : ''}`}>
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className={`text-white font-semibold mb-2 text-sm ${isBn ? 'font-bangla' : ''}`}>{t('footer.newsletter')}</h4>
            <p className={`text-sm text-gray-400 mb-4 ${isBn ? 'font-bangla' : ''}`}>{t('footer.newsletterDesc')}</p>
            <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={isBn ? 'আপনার ইমেইল' : 'Your email address'}
                className={`w-full px-3.5 py-2.5 text-sm bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${isBn ? 'font-bangla' : ''}`}
              />
              <button
                type="submit"
                className={`w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-opacity hover:opacity-90 ${isBn ? 'font-bangla' : ''}`}
                style={{ background: 'linear-gradient(135deg, #5D0096, #D31710)' }}
              >
                {isBn ? 'সাবস্ক্রাইব করুন' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/5">
        <div className="container-news py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className={`text-xs text-gray-500 ${isBn ? 'font-bangla' : ''}`}>{t('footer.copyright')}</p>
          <p className="text-xs text-gray-600">
            Sholok News Portal &mdash; Powered by <span className="text-primary-400">Sholok</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
