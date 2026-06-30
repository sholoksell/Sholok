import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFoundPage() {
  const { darkMode } = useApp();
  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="text-center max-w-md">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-9xl mb-8"
        >
          📚
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className={`text-8xl font-black mb-4 gradient-text`}>404</h1>
          <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Page Not Found</h2>
          <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Looks like this chapter hasn't been written yet. Let's get you back on track!
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl">
                <Home className="w-4 h-4" />Go Home
              </motion.button>
            </Link>
            <Link to="/search">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border ${darkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                <Search className="w-4 h-4" />Search
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
