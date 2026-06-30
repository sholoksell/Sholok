import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
};

const coverIcons = ['📚', '🔮', '⚡', '🌙', '🗡️', '🌸', '👻', '🚀', '🎭', '🔍'];

export default function RankingCard({ webtoon, rank }) {
  const { darkMode } = useApp();
  const trend = rank <= 3 ? 'up' : Math.random() > 0.6 ? 'up' : Math.random() > 0.5 ? 'down' : 'same';
  const rankColor = rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : darkMode ? 'text-gray-500' : 'text-gray-400';
  const icon = coverIcons[(webtoon.id - 1) % coverIcons.length];

  return (
    <Link to={`/webtoon/${webtoon.slug}`}>
      <motion.div whileHover={{ x: 4 }}
        className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
        <span className={`text-2xl font-black w-8 text-center flex-shrink-0 ${rankColor}`}>
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
        </span>

        {/* Gradient mini-cover */}
        <div className={`w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br ${webtoon.coverGradient} flex items-center justify-center text-2xl shadow-md`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{webtoon.title}</h4>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{webtoon.author}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">{webtoon.rating}</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Eye className="w-3 h-3 text-gray-400" />
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{formatNumber(webtoon.views)}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
          {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
          {trend === 'same' && <Minus className="w-4 h-4 text-gray-400" />}
        </div>
      </motion.div>
    </Link>
  );
}
