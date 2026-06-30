import { motion } from 'framer-motion';
import { webtoons, authors } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import SectionHeader from '../components/home/SectionHeader';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

export default function ChallengePage() {
  const { darkMode } = useApp();
  const challengeWebtoons = webtoons.filter(w => w.isChallenge);
  const rising = challengeWebtoons.slice(0, 4);

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-12 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className={`text-4xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Challenge <span className="gradient-text">Comics</span>
          </h1>
          <p className={`text-lg max-w-xl mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover tomorrow's stars today. Independent creators sharing their vision with the world.
          </p>
        </motion.div>

        {/* Rising Creators */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-14">
          <SectionHeader title="Rising Creators" icon="🚀" subtitle="New artists making waves" />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {authors.slice(10, 14).map(a => (
              <motion.div key={a.id} variants={staggerItem}>
                <div className={`p-5 rounded-2xl text-center ${darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white shadow-md'}`}>
                  <div className={`w-16 h-16 rounded-full mx-auto mb-3 border-2 border-indigo-500/50 bg-gradient-to-br ${a.avatarColor} flex items-center justify-center`}>
                    <span className="text-white font-black text-xl">{a.initials}</span>
                  </div>
                  <h4 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{a.name}</h4>
                  <p className={`text-xs mt-1 mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{a.bio}</p>
                  <div className="text-indigo-400 text-xs font-semibold">{(a.followers / 1000).toFixed(1)}K followers</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Featured Challenge */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-14">
          <SectionHeader title="Editor's Picks" icon="✨" subtitle="Community favorites" />
          <WebtoonGrid webtoons={rising} cols="grid-cols-2 sm:grid-cols-4" />
        </motion.section>

        {/* All Challenge Comics */}
        <motion.section variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <SectionHeader title="All Challenge Comics" subtitle={`${challengeWebtoons.length} indie stories`} />
          <WebtoonGrid webtoons={challengeWebtoons} />
        </motion.section>
      </div>
    </div>
  );
}
