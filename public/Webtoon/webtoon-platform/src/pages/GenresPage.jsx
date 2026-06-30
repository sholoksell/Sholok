import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { genres, webtoons } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import SectionHeader from '../components/home/SectionHeader';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

export default function GenresPage() {
  const { genre } = useParams();
  const { darkMode } = useApp();
  const [selected, setSelected] = useState(genre ? decodeURIComponent(genre) : null);

  const selectedGenre = genres.find(g => g.name.toLowerCase().replace(/\s+/g, '-') === selected?.toLowerCase().replace(/\s+/g, '-'));
  const filteredWebtoons = selected
    ? webtoons.filter(w => w.genre.toLowerCase() === (selectedGenre?.name || selected).toLowerCase())
    : webtoons;

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-10 text-center">
          <h1 className={`text-4xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {selectedGenre ? (
              <span className="flex items-center justify-center gap-3">
                {selectedGenre.icon} <span className="gradient-text">{selectedGenre.name}</span>
              </span>
            ) : 'Browse Genres'}
          </h1>
          {selectedGenre && <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedGenre.description}</p>}
        </motion.div>

        {/* Genre Grid */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-12">
          <motion.div variants={staggerItem}>
            <button
              onClick={() => setSelected(null)}
              className={`w-full rounded-2xl p-4 text-center transition-all hover:scale-105 ${
                !selected
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : darkMode ? 'bg-gray-900 text-gray-400 hover:bg-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <div className="text-3xl mb-1">🌐</div>
              <div className="font-semibold text-sm">All</div>
              <div className="text-xs opacity-70">{webtoons.length}</div>
            </button>
          </motion.div>
          {genres.map(g => (
            <motion.div key={g.id} variants={staggerItem}>
              <Link to={`/genres/${g.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <button
                  onClick={() => setSelected(g.name)}
                  className={`w-full rounded-2xl p-4 text-center transition-all hover:scale-105 ${
                    selectedGenre?.id === g.id
                      ? `bg-gradient-to-br ${g.color} text-white shadow-lg`
                      : darkMode ? 'bg-gray-900 text-gray-400 hover:bg-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  <div className="text-3xl mb-1">{g.icon}</div>
                  <div className="font-semibold text-xs">{g.name}</div>
                  <div className="text-xs opacity-70">{g.count}</div>
                </button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Webtoon Grid */}
        <div>
          <SectionHeader
            title={selectedGenre ? `${selectedGenre.name} Comics` : 'All Webtoons'}
            subtitle={`${filteredWebtoons.length} series available`}
          />
          <WebtoonGrid webtoons={filteredWebtoons.slice(0, 40)} />
        </div>
      </div>
    </div>
  );
}
