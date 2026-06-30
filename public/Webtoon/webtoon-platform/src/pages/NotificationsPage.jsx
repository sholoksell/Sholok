import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notifications } from '../data/webtoons';
import { webtoons } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

export default function NotificationsPage() {
  const { darkMode } = useApp();
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  const dismiss = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs;

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{notifs.filter(n => !n.isRead).length} unread</p>
            </div>
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              <Check className="w-4 h-4" />Mark all read
            </button>
          </div>

          {/* Filter */}
          <div className={`flex gap-2 p-1 rounded-xl ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              </motion.div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All caught up!</h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No new notifications</p>
            </div>
          ) : filtered.map(n => (
            <motion.div key={n.id} variants={staggerItem}>
              <div className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${
                !n.isRead
                  ? darkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
                  : darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white border border-gray-200'
              }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                      <p className={`text-sm mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
                      <button onClick={() => dismiss(n.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {n.webtoonId && (
                    <Link to={`/webtoon/${webtoons.find(w => w.id === n.webtoonId)?.slug || ''}`}>
                      <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View now →</button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
