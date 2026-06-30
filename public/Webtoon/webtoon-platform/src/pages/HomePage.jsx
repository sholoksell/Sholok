import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Clock, Star, Crown, BookOpen, TrendingUp, RefreshCw, Sparkles } from 'lucide-react';
import HeroBanner from '../components/home/HeroBanner';
import SectionHeader from '../components/home/SectionHeader';
import WebtoonGrid from '../components/home/WebtoonGrid';
import RankingCard from '../components/home/RankingCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { webtoons, genres, rankings } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem, fadeInUp } from '../animations/variants';

const genreIcons = { Romance: '💕', Fantasy: '🔮', Action: '⚡', Drama: '🎭', Comedy: '😂', Horror: '👻', 'Sci-Fi': '🚀', Thriller: '🔍', Sports: '⚽', Adventure: '🗺️', 'Slice of Life': '🌸', Mystery: '🕵️', Historical: '📜', 'School Life': '🎒' };

export default function HomePage() {
  const { darkMode, continueReading } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeRankTab, setActiveRankTab] = useState('daily');

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const trending = webtoons.filter(w => w.isTrending).slice(0, 10);
  const newReleases = webtoons.filter(w => w.isNew).slice(0, 10);
  const originals = webtoons.filter(w => w.isOriginal).slice(0, 10);

  const bg = darkMode
    ? 'min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-gray-900'
    : 'min-h-screen bg-gradient-to-b from-slate-50 to-white';

  return (
    <div className={bg}>
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, 20, 0], y: [0, -40, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-16">
          {loading ? (
            <div className="h-[600px] rounded-3xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
          ) : (
            <HeroBanner />
          )}
        </motion.div>

        {/* Continue Reading */}
        {continueReading.length > 0 && (
          <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
            <SectionHeader title="Continue Reading" icon="📖" subtitle="Pick up where you left off" />
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {continueReading.slice(0, 6).map(w => (
                <Link key={w.id} to={`/webtoon/${w.slug}`} className="flex-shrink-0 w-32">
                  <div className={`rounded-xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className={`relative aspect-[3/4] bg-gradient-to-br ${w.coverGradient} flex flex-col items-center justify-center`}>
                      <span className="text-4xl mb-2">📚</span>
                      <span className="text-white font-bold text-xs text-center px-2 line-clamp-2">{w.title}</span>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                    </div>
                    <p className={`text-xs font-medium p-2 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{w.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Trending Today */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="Trending Today" icon="🔥" subtitle="Most popular right now" linkTo="/rankings" />
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(10).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <WebtoonGrid webtoons={trending} />
          )}
        </motion.section>

        {/* Genres */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="Browse Genres" icon="🎯" subtitle="Find your favorite story type" linkTo="/genres" />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {genres.slice(0, 14).map(g => (
              <motion.div key={g.id} variants={staggerItem}>
                <Link to={`/genres/${g.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    className={`relative rounded-xl p-3 text-center cursor-pointer overflow-hidden group bg-gradient-to-br ${g.color}`}
                  >
                    <div className="text-2xl mb-1">{g.icon}</div>
                    <div className="text-white font-semibold text-xs">{g.name}</div>
                    <div className="text-white/70 text-[10px]">{g.count}</div>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200 rounded-xl" />
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* New Releases + Rankings Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* New Releases */}
          <div className="lg:col-span-2">
            <SectionHeader title="New Releases" icon="✨" subtitle="Fresh stories just dropped" linkTo="/originals" />
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <WebtoonGrid webtoons={newReleases.slice(0, 6)} cols="grid-cols-2 sm:grid-cols-3" />
            )}
          </div>

          {/* Rankings */}
          <div>
            <SectionHeader title="Rankings" icon="🏆" linkTo="/rankings" />
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900/80 border border-white/5' : 'bg-white border border-gray-200'}`}>
              {/* Tabs */}
              <div className={`flex border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                {['daily', 'weekly', 'monthly'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveRankTab(tab)}
                    className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                      activeRankTab === tab
                        ? 'text-indigo-400 border-b-2 border-indigo-500'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-2">
                {rankings[activeRankTab]?.slice(0, 8).map((w, i) => (
                  <RankingCard key={w.id} webtoon={w} rank={i + 1} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Originals */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="WebtoonX Originals" icon="⭐" subtitle="Exclusive stories only on WebtoonX" linkTo="/originals" />
          <WebtoonGrid webtoons={originals} />
        </motion.section>

        {/* Challenge Comics */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="Challenge Comics" icon="🌟" subtitle="Rising indie creators to watch" linkTo="/challenge" />
          <WebtoonGrid webtoons={webtoons.filter(w => w.isChallenge).slice(0, 10)} />
        </motion.section>

        {/* Stats Banner */}
        <motion.div
          variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12 text-white relative"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-2">Join 10M+ Readers</h2>
            <p className="text-white/80 mb-8">Discover amazing stories from creators around the world</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Webtoons', value: '100,000+', icon: '📚' },
                { label: 'Active Readers', value: '10M+', icon: '👥' },
                { label: 'Episodes Daily', value: '500+', icon: '📖' },
                { label: 'Creators', value: '50,000+', icon: '✏️' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
