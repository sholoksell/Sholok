import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { Play, Shuffle } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { categories } from '../data/categories'
import { songs } from '../data/songs'
import SongCard from '../components/cards/SongCard'

export default function CategoryPage() {
  const { id } = useParams()
  const { playSong, setShuffle } = useMusic()
  const category = categories.find(c => c.id === parseInt(id))
  if (!category) return <div className="p-8 text-center text-gray-400">ধরণ পাওয়া যায়নি</div>

  const catSongs = songs.filter(s => s.genre === category.name)
  const displaySongs = catSongs.length > 0 ? catSongs : songs.slice(0, 10)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${category.color} p-8 pb-12`}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative">
          <span className="text-6xl block mb-3">{category.icon}</span>
          <h1 className="text-4xl font-bold text-white mb-2">{category.name}</h1>
          <p className="text-white/70">{category.count} উপলব্ধ</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Actions */}
        <div className="flex items-center gap-3 mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => displaySongs[0] && playSong(displaySongs[0], displaySongs)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full font-semibold hover:shadow-glow-purple"
          >
            <Play size={16} className="ml-0.5" /> সব চালান
          </motion.button>
          <button
            onClick={() => { setShuffle(true); displaySongs[0] && playSong(displaySongs[Math.floor(Math.random()*displaySongs.length)], displaySongs) }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-gray-300 hover:border-white/40 text-sm"
          >
            <Shuffle size={15} /> র‍্যান্ডম
          </button>
        </div>

        {/* Songs */}
        <div className="space-y-1">
          {displaySongs.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} queue={displaySongs} />
          ))}
        </div>

        {catSongs.length === 0 && (
          <div className="mt-4 p-4 glass rounded-xl">
            <p className="text-sm text-gray-400 text-center">
              এই ধরণের আরো গান শীঘ্রই যোগ করা হবে। আপাতত কিছু জনপ্রিয় গান দেখানো হচ্ছে।
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
