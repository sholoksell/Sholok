import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Heart, Globe, MessageCircle, Camera, Play } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Home', path: '/' },
    { label: 'Originals', path: '/originals' },
    { label: 'Daily Updates', path: '/daily' },
    { label: 'Rankings', path: '/rankings' },
  ],
  Genres: [
    { label: 'Romance', path: '/genres/romance' },
    { label: 'Fantasy', path: '/genres/fantasy' },
    { label: 'Action', path: '/genres/action' },
    { label: 'Drama', path: '/genres/drama' },
  ],
  Community: [
    { label: 'Challenge', path: '/challenge' },
    { label: 'Comments', path: '/' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Profile', path: '/profile' },
  ],
};

export default function Footer() {
  const { darkMode } = useApp();

  return (
    <footer className={`${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-200'} border-t mt-20`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">W</span>
              </div>
              <span className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Webtoon<span className="gradient-text">X</span>
              </span>
            </Link>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover thousands of webtoons from talented creators around the world.
              Read anywhere, anytime — your story awaits.
            </p>
            <div className="flex gap-3">
              {[Globe, MessageCircle, Camera, Play].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    darkMode ? 'bg-white/10 text-gray-400 hover:bg-indigo-500/30 hover:text-indigo-400' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className={`font-semibold text-sm mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{section}</h4>
              <ul className="space-y-2">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className={`text-sm transition-colors ${darkMode ? 'text-gray-400 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
