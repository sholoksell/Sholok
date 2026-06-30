import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, Eye, BookOpen, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { staggerItem } from '../../animations/variants';

const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
};

const coverIcons = ['📚', '🔮', '⚡', '🌙', '🗡️', '🌸', '👻', '🚀', '🎭', '🔍', '🌊', '🔥', '🏯', '🌿', '⚔️'];

export default function WebtoonCard({ webtoon, index = 0 }) {
  const { darkMode, toggleFavorite, isFavorite } = useApp();
  const [hovered, setHovered] = useState(false);
  const fav = isFavorite(webtoon.id);
  const icon = coverIcons[(webtoon.id - 1) % coverIcons.length];

  return (
    <motion.div
      variants={staggerItem}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative group"
    >
      <Link to={`/webtoon/${webtoon.slug}`}>
        <motion.div
          animate={{ y: hovered ? -8 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 shadow-xl' : 'bg-white shadow-lg'} hover:shadow-2xl hover:shadow-indigo-500/20 transition-shadow duration-300`}
        >
          {/* Cover — gradient only, no image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <div className={`w-full h-full bg-gradient-to-br ${webtoon.coverGradient} flex flex-col items-center justify-center p-4`}>
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              {/* Icon + Title */}
              <motion.div
                animate={{ scale: hovered ? 1.15 : 1 }}
                transition={{ duration: 0.3 }}
                className="text-5xl mb-3 relative z-10 drop-shadow-lg"
              >
                {icon}
              </motion.div>
              <p className="text-white font-bold text-sm text-center line-clamp-3 relative z-10 drop-shadow px-2">
                {webtoon.title}
              </p>
              <p className="text-white/70 text-xs text-center mt-1 relative z-10">
                {webtoon.genre}
              </p>
            </div>

            {/* Hover overlay */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              </div>
            </motion.div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {webtoon.isOriginal && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-md shadow-lg">অরিজিনাল</span>
              )}
              {webtoon.isNew && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold rounded-md shadow-lg">নতুন</span>
              )}
              {webtoon.status === 'সম্পূর্ণ' && (
                <span className="px-2 py-0.5 bg-black/50 text-gray-200 text-[10px] font-bold rounded-md">সম্পূর্ণ</span>
              )}
            </div>

            {/* Rating */}
            <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-white text-[11px] font-semibold">{webtoon.rating}</span>
            </div>

            {/* Views on hover */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs"
            >
              <Eye className="w-3 h-3" />
              <span>{formatNumber(webtoon.views)}</span>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className={`font-semibold text-sm line-clamp-2 mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {webtoon.title}
            </h3>
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {webtoon.author}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gradient-to-r ${webtoon.genreColors?.bg || 'from-indigo-500 to-purple-600'} text-white`}>
                {webtoon.genre}
              </span>
              <div className="flex items-center gap-1">
                <BookOpen className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{webtoon.episodeCount}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Favorite button */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={(e) => { e.preventDefault(); toggleFavorite(webtoon); }}
        className={`absolute top-10 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 z-10 ${
          fav ? 'bg-red-500/90' : 'bg-black/40 hover:bg-red-500/70'
        }`}
      >
        <Heart className={`w-4 h-4 ${fav ? 'fill-white text-white' : 'text-white'}`} />
      </motion.button>
    </motion.div>
  );
}
