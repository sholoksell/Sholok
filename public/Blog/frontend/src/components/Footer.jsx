import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const footerLinks = {
  Platform: [
    { label: 'Home', to: '/' },
    { label: 'Trending', to: '/search?sort=trending' },
    { label: 'Short Clips', to: '/clips' },
    { label: 'Write a Post', to: '/write' },
  ],
  Categories: [
    { label: 'Entertainment', to: '/category/entertainment' },
    { label: 'Lifestyle', to: '/category/lifestyle' },
    { label: 'Hobbies & Travel', to: '/category/hobbies-travel' },
    { label: 'Knowledge', to: '/category/knowledge' },
  ],
  Account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Register', to: '/register' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Timeline', to: '/timeline' },
  ],
};

export default function Footer() {
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
              Discover amazing stories, share your thoughts, and connect with bloggers from around the world. Your story matters.
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
