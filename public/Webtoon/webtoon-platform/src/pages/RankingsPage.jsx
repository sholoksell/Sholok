import { useState } from 'react';
import { motion } from 'framer-motion';
import { rankings } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import RankingCard from '../components/home/RankingCard';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

const tabs = [
  { key: 'daily', label: 'Daily', icon: '🔥' },
  { key: 'weekly', label: 'Weekly', icon: '⚡' },
  { key: 'monthly', label: 'Monthly', icon: '📅' },
  { key: 'allTime', label: 'All Time', icon: '👑' },
];

export default function RankingsPage() {
  const { darkMode } = useApp();
  const [activeTab, setActiveTab] = useState('daily');

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-10 text-center">
          <h1 className={`text-4xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            🏆 <span className="gradient-text">Rankings</span>
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Discover the most loved webtoons</p>
        </motion.div>

        {/* Tabs */}
        <div className={`flex gap-2 p-1.5 rounded-2xl mb-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600'
              }`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Rankings List */}
        <motion.div
          key={activeTab}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900/80 border border-white/5' : 'bg-white border border-gray-200 shadow-sm'}`}
        >
          {rankings[activeTab]?.map((w, i) => (
            <motion.div key={w.id} variants={staggerItem} className={`${i !== rankings[activeTab].length - 1 ? darkMode ? 'border-b border-white/5' : 'border-b border-gray-100' : ''}`}>
              <RankingCard webtoon={w} rank={i + 1} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
