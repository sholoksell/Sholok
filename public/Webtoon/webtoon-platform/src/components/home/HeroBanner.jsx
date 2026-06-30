import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Star, Eye, Heart, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { webtoons } from '../../data/webtoons';
import { useApp } from '../../context/AppContext';

const featured = webtoons.filter(w => w.isFeatured).slice(0, 5);

const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
};

const bannerIcons = ['📚', '⚔️', '🔮', '🌙', '🎭'];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const { toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const w = featured[current];

  return (
    <div className="relative h-[560px] md:h-[650px] overflow-hidden rounded-3xl mx-4 md:mx-0">
      {/* Animated gradient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className={`absolute inset-0 bg-gradient-to-br ${w.coverGradient}`}
        />
      </AnimatePresence>

      {/* Decorative animated shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/5 border border-white/10" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-white/5 border border-white/10" />
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-1/4 top-1/4 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

        {/* Big centered book icon */}
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.8 }}
          className="absolute right-12 top-1/2 -translate-y-1/2 text-[220px] select-none"
        >
          {bannerIcons[current]}
        </motion.div>
      </div>

      {/* Dark overlay bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 px-8 md:px-16">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-2 mb-4">
                {w.isOriginal && (
                  <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full">অরিজিনাল</span>
                )}
                <span className={`px-3 py-1 bg-gradient-to-r ${w.genreColors?.bg || 'from-pink-500 to-rose-600'} text-white text-xs font-bold rounded-full`}>
                  {w.genre}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">{w.title}</h1>
              <p className="text-gray-300 text-sm mb-2">লেখক: <span className="text-indigo-300 font-semibold">{w.author}</span></p>
              <p className="text-gray-300 text-base mb-6 line-clamp-2">{w.description}</p>

              <div className="flex items-center gap-6 mb-8 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-yellow-400">{w.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>{formatNumber(w.views)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span>{w.episodeCount} পর্ব</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${w.status === 'সম্পূর্ণ' ? 'bg-blue-500/30 text-blue-300' : 'bg-green-500/30 text-green-300'}`}>
                  {w.status}
                </span>
              </div>

              <div className="flex gap-3">
                <Link to={`/webtoon/${w.slug}`}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/40 transition-shadow">
                    <Play className="w-4 h-4 fill-white" />
                    পড়া শুরু করুন
                  </motion.button>
                </Link>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFavorite(w)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${
                    isFavorite(w.id)
                      ? 'bg-red-500/20 border-red-500/50 text-red-400'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}>
                  <Heart className={`w-4 h-4 ${isFavorite(w.id) ? 'fill-red-400' : ''}`} />
                  {isFavorite(w.id) ? 'সেভ করা হয়েছে' : 'সেভ করুন'}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 right-8 flex gap-2">
        {featured.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent(p => (p - 1 + featured.length) % featured.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/50 transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => setCurrent(p => (p + 1) % featured.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/50 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
