import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, BookOpen, Library } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { to: '/', label: 'হোম' },
  { to: '/categories', label: 'বিষয়' },
  { to: '/novels', label: 'ওয়েব নভেল' },
  { to: '/rankings', label: 'র‍্যাঙ্কিং' },
  { to: '/authors', label: 'লেখক' },
  { to: '/offers', label: 'অফার' },
  { to: '/new-releases', label: 'নতুন প্রকাশ' },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-lg dark:border-white/10 dark:bg-brand-950/80">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-brand-700 dark:text-gold-400">
          <BookOpen size={26} />
          <span className="text-lg font-bold text-gradient">পাঠশালা</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-gold-400'
                    : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:text-gray-300 dark:hover:bg-white/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 md:block lg:max-w-xs">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/library"
            className="hidden items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 sm:flex"
          >
            <Library size={16} />
            আমার লাইব্রেরি
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-brand-700 dark:border-white/10 dark:text-gold-400 lg:hidden"
            aria-label="মেনু খুলুন"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-0 top-0 z-50 h-full w-72 bg-white p-5 shadow-2xl dark:bg-brand-950 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gradient">পাঠশালা</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="বন্ধ করুন">
                  <X size={22} className="text-brand-700 dark:text-gold-400" />
                </button>
              </div>
              <div className="mt-4">
                <SearchBar />
              </div>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-gold-400'
                          : 'text-gray-600 dark:text-gray-300'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/library"
                  onClick={() => setOpen(false)}
                  className="mt-3 rounded-xl bg-brand-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  আমার লাইব্রেরি
                </NavLink>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
