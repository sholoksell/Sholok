import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import SectionHeader from '../components/home/SectionHeader';
import { fadeInUp } from '../animations/variants';

export default function FavoritesPage() {
  const { darkMode, favorites, readingHistory, continueReading } = useApp();

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-10">
          <h1 className={`text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My <span className="gradient-text">Library</span>
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Your saved series and reading history</p>
        </motion.div>

        {/* Favorites */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="Saved Series" icon="❤️" subtitle={`${favorites.length} series saved`} />
          {favorites.length > 0 ? (
            <WebtoonGrid webtoons={favorites} />
          ) : (
            <div className={`text-center py-20 rounded-2xl border ${darkMode ? 'border-white/10 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              </motion.div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>No favorites yet</h3>
              <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start exploring and save series you love!</p>
              <Link to="/">
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold">
                  Browse Webtoons
                </button>
              </Link>
            </div>
          )}
        </motion.section>

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
            <SectionHeader title="Continue Reading" icon="📖" subtitle="Resume where you left off" />
            <WebtoonGrid webtoons={continueReading.slice(0, 10)} />
          </motion.section>
        )}

        {/* Reading History */}
        {readingHistory.length > 0 && (
          <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SectionHeader title="Recently Viewed" icon="🕐" subtitle={`${readingHistory.length} series viewed`} />
            <WebtoonGrid webtoons={readingHistory.slice(0, 10)} />
          </motion.section>
        )}
      </div>
    </div>
  );
}
