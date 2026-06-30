import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Menu, X, Music2 } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar({ onMenuToggle }) {
  const { theme, toggleTheme } = useMusic()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-bangla-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-bangla-gold flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform">
              <Music2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">সুরবাংলা</span>
          </Link>
        </div>

        {/* Center: Search */}
        <AnimatePresence>
          {showSearch ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleSearch}
              className="absolute left-0 right-0 top-0 p-3 z-10 glass-dark border-b border-bangla-border"
            >
              <div className="flex items-center gap-2 max-w-2xl mx-auto">
                <Search size={18} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="গান, শিল্পী, অ্যালবাম সার্চ করুন..."
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 font-bangla"
                />
                <button type="button" onClick={() => setShowSearch(false)}>
                  <X size={20} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </motion.form>
          ) : (
            <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-72 border border-white/10 hover:border-primary-500 transition-colors">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="সার্চ করুন..."
                className="bg-transparent outline-none text-white placeholder-gray-500 font-bangla text-sm flex-1"
              />
            </form>
          )}
        </AnimatePresence>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-xl hover:bg-white/10 transition-colors md:hidden"
            onClick={() => setShowSearch(true)}
          >
            <Search size={20} />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/10 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="text-bangla-gold" /> : <Moon size={20} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-bangla-gold flex items-center justify-center text-sm font-bold cursor-pointer">
            আ
          </div>
        </div>
      </div>
    </header>
  )
}
