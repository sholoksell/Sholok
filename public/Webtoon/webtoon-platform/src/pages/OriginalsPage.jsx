import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { webtoons } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import SectionHeader from '../components/home/SectionHeader';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

const coverIcons = ['📚', '🔮', '⚡', '🌙', '🗡️'];

export default function OriginalsPage() {
  const { darkMode } = useApp();
  const originals = webtoons.filter(w => w.isOriginal);
  const featured = originals.slice(0, 3);
  const others = originals.slice(3);

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Banner */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="relative mb-16 rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-[160px] opacity-10 select-none">⭐</motion.div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-400 font-bold uppercase tracking-wider text-sm">শুধুমাত্র WebtoonX-এ</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">WebtoonX অরিজিনাল</h1>
            <p className="text-white/80 text-lg max-w-xl">বিশ্বমানের শিল্পীদের তৈরি প্রিমিয়াম গল্প — যা শুধুমাত্র WebtoonX-এ পাওয়া যায়।</p>
          </div>
        </motion.div>

        {/* Featured */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
          <SectionHeader title="বিশেষ অরিজিনাল" subtitle="সম্পাদকের বাছাই" />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((w, i) => (
              <motion.div key={w.id} variants={staggerItem}>
                <Link to={`/webtoon/${w.slug}`}>
                  <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white shadow-lg'} hover:shadow-xl transition-shadow`}>
                    {/* Gradient banner, no image */}
                    <div className={`relative h-44 bg-gradient-to-br ${w.coverGradient} flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                      </div>
                      <span className="text-7xl relative z-10 opacity-80">{coverIcons[i % coverIcons.length]}</span>
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded">অরিজিনাল</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold text-base mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{w.title}</h3>
                      <p className={`text-sm line-clamp-2 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{w.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{w.author}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-semibold">{w.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* All Originals */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionHeader title="সব অরিজিনাল" subtitle={`${originals.length}টি এক্সক্লুসিভ সিরিজ`} />
          <WebtoonGrid webtoons={others} />
        </motion.section>
      </div>
    </div>
  );
}
