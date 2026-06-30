import { NavLink } from 'react-router-dom'
import { Home, Search, Library, BarChart2, Heart, Clock, BookOpen, Radio, Music, X } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: 'হোম' },
  { to: '/search', icon: Search, label: 'সার্চ' },
  { to: '/library', icon: Library, label: 'আমার লাইব্রেরি' },
  { to: '/charts', icon: BarChart2, label: 'চার্ট' },
  { to: '/lyrics', icon: BookOpen, label: 'লিরিক্স' },
]

const categories = [
  { to: '/category/1', label: 'আধুনিক বাংলা' },
  { to: '/category/2', label: 'বাংলা ব্যান্ড' },
  { to: '/category/3', label: 'রবীন্দ্রসঙ্গীত' },
  { to: '/category/4', label: 'নজরুলগীতি' },
  { to: '/category/5', label: 'লালনগীতি' },
  { to: '/category/6', label: 'লোকসংগীত' },
  { to: '/category/8', label: 'ইসলামিক সংগীত' },
  { to: '/category/10', label: 'দেশাত্মবোধক' },
  { to: '/category/11', label: 'চলচ্চিত্রের গান' },
]

export default function Sidebar({ open, onClose }) {
  const { likedSongs, recentlyPlayed } = useMusic()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-full w-64 z-50 glass-dark border-r border-bangla-border pt-16 pb-28 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-2 lg:hidden">
          <span className="text-gradient font-bold text-lg">সুরবাংলা</span>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* Main Nav */}
        <nav className="px-3 mb-6">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 text-sm ${
                  isActive
                    ? 'sidebar-active text-primary-400 font-semibold'
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Library Quick Links */}
        <div className="px-3 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">লাইব্রেরি</p>
          <NavLink
            to="/library"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm"
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <Heart size={16} className="text-primary-500" />
            <span>পছন্দের গান ({likedSongs.length})</span>
          </NavLink>
          <NavLink
            to="/library"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all text-sm"
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            <Clock size={16} className="text-bangla-gold" />
            <span>সাম্প্রতিক ({recentlyPlayed.length})</span>
          </NavLink>
        </div>

        {/* Categories */}
        <div className="px-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">ধরণ</p>
          {categories.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl mb-0.5 text-sm transition-all ${
                  isActive ? 'text-primary-400 bg-primary-500/10' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`
              }
            >
              <Music size={13} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </motion.aside>
    </>
  )
}
