import { motion } from 'framer-motion';
import { BookOpen, Heart, Clock, Star, Award, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

const achievements = [
  { icon: '📚', label: 'পাঠকপ্রিয়', desc: '১০+ সিরিজ পড়েছেন', unlocked: true },
  { icon: '🔥', label: 'নিয়মিত', desc: '৭ দিন ধারাবাহিক', unlocked: true },
  { icon: '⭐', label: 'সমালোচক', desc: '২০+ সিরিজ রেটিং', unlocked: false },
  { icon: '💬', label: 'মন্তব্যকারী', desc: '৫০+ মন্তব্য', unlocked: false },
  { icon: '🏆', label: 'চ্যাম্পিয়ন', desc: 'শীর্ষ ১% পাঠক', unlocked: true },
  { icon: '🎯', label: 'অন্বেষক', desc: '৫+ ঘরানা পড়েছেন', unlocked: true },
];

export default function ProfilePage() {
  const { darkMode, favorites, readingHistory, continueReading } = useApp();

  const stats = [
    { label: 'সিরিজ পড়েছেন', value: readingHistory.length, icon: BookOpen, color: 'from-indigo-500 to-purple-600' },
    { label: 'পছন্দের', value: favorites.length, icon: Heart, color: 'from-pink-500 to-rose-600' },
    { label: 'পড়ছেন', value: continueReading.length, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'পর্ব পড়েছেন', value: readingHistory.length * 7, icon: Star, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Card */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-8">
          <div className={`rounded-3xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white shadow-xl'}`}>
            <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4" />
              </div>
              <button className="absolute top-4 right-4 p-2 bg-black/30 rounded-xl text-white hover:bg-black/50 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-12">
              {/* Avatar — gradient circle, no image */}
              <div className="w-24 h-24 rounded-2xl border-4 border-indigo-500 overflow-hidden mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-black text-3xl">পা</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>WebtoonFan</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>২০২৪ থেকে সদস্য · লেভেল ১৫ পাঠক</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['রোমান্স', 'ফ্যান্টাসি', 'অ্যাকশন'].map(g => (
                      <span key={g} className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium">{g}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <motion.div key={stat.label} variants={staggerItem}>
              <div className={`rounded-2xl p-5 text-center ${darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white shadow-md'}`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>অর্জনসমূহ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map(a => (
              <div key={a.label} className={`flex items-center gap-3 p-4 rounded-xl ${
                a.unlocked ? darkMode ? 'bg-gray-900 border border-indigo-500/30' : 'bg-white shadow-sm' : darkMode ? 'bg-gray-900/50 border border-white/5 opacity-50' : 'bg-gray-50 opacity-50'
              }`}>
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{a.label}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{a.desc}</p>
                </div>
                {a.unlocked && <Award className="w-4 h-4 text-yellow-400 ml-auto flex-shrink-0" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reading History */}
        {readingHistory.length > 0 && (
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>পড়ার ইতিহাস</h3>
              <Link to="/favorites" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">সব দেখুন</Link>
            </div>
            <div className="space-y-3">
              {readingHistory.slice(0, 5).map(w => (
                <Link key={w.id} to={`/webtoon/${w.slug}`}>
                  <div className={`flex items-center gap-4 p-3 rounded-xl transition-all hover:scale-[1.01] ${darkMode ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50 shadow-sm'}`}>
                    {/* Gradient mini cover */}
                    <div className={`w-12 h-16 rounded-lg flex-shrink-0 bg-gradient-to-br ${w.coverGradient} flex items-center justify-center`}>
                      <span className="text-white font-bold text-xs text-center px-1 leading-tight">{w.title.substring(0, 4)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{w.title}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{w.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">{w.rating}</span>
                      </div>
                    </div>
                    <span className={`text-xs flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(w.viewedAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
