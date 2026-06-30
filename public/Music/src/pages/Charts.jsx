import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, Star, Flame, Music } from 'lucide-react'
import { songs, popularSongs, trendingSongs, newSongs } from '../data/songs'
import SongCard from '../components/cards/SongCard'

const CHART_TABS = [
  { id: 'top50', label: 'বাংলাদেশ টপ ৫০', icon: Star },
  { id: 'trending', label: 'ট্রেন্ডিং', icon: TrendingUp },
  { id: 'new', label: 'নতুন জনপ্রিয়', icon: Flame },
  { id: 'weekly', label: 'সাপ্তাহিক সেরা', icon: BarChart2 },
]

export default function Charts() {
  const [activeTab, setActiveTab] = useState('top50')

  const getChartSongs = () => {
    switch (activeTab) {
      case 'top50': return [...songs].sort((a, b) => b.views - a.views).slice(0, 50)
      case 'trending': return trendingSongs
      case 'new': return newSongs
      case 'weekly': return [...songs].sort(() => Math.random() - 0.5).slice(0, 20)
      default: return popularSongs
    }
  }

  const chartSongs = getChartSongs()

  const formatViews = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M বার শোনা`
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K বার শোনা`
    return `${n} বার শোনা`
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4 lg:px-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-bangla-gold flex items-center justify-center shadow-glow-purple">
          <BarChart2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">চার্ট</h1>
          <p className="text-sm text-gray-400">বাংলাদেশের সেরা গানের তালিকা</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CHART_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary-500 text-white shadow-glow-purple'
                : 'bg-white/10 text-gray-400 hover:bg-white/15'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Chart List */}
      <div className="space-y-1">
        {chartSongs.map((song, i) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 group"
          >
            {/* Rank */}
            <div className="w-10 text-center flex-shrink-0">
              {i < 3 ? (
                <span className={`text-lg font-bold ${i === 0 ? 'text-bangla-gold' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`}>
                  {i + 1}
                </span>
              ) : (
                <span className="text-sm text-gray-600">{i + 1}</span>
              )}
            </div>
            <div className="flex-1">
              <SongCard song={song} queue={chartSongs} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
