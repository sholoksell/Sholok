import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { Play, Heart, Shuffle } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { playlists } from '../data/playlists'
import { songs } from '../data/songs'
import SongCard from '../components/cards/SongCard'

export default function PlaylistPage() {
  const { id } = useParams()
  const { playSong, setShuffle, toggleSavePlaylist, savedPlaylists } = useMusic()
  const playlist = playlists.find(p => p.id === parseInt(id))
  if (!playlist) return <div className="p-8 text-center text-gray-400">প্লেলিস্ট পাওয়া যায়নি</div>

  const playlistSongs = playlist.songs.map(sid => songs.find(s => s.id === sid)).filter(Boolean)
  const isSaved = savedPlaylists.some(p => p.id === playlist.id)

  const totalDuration = () => {
    const mins = playlistSongs.reduce((acc, s) => {
      const [m, sec] = s.duration.replace('৩', '3').replace('৪', '4').replace('৫', '5').replace('৬', '6').replace(':', ':').split(':')
      return acc + (parseInt(m) || 0) * 60 + (parseInt(sec) || 0)
    }, 0)
    return `${Math.floor(mins / 60)} ঘণ্টা ${mins % 60} মিনিট`
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-30 blur-2xl`} />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
            <div className={`w-48 h-48 rounded-2xl bg-gradient-to-br ${playlist.color} flex items-center justify-center flex-shrink-0 shadow-2xl`}>
              <span className="text-6xl">{playlist.emoji}</span>
            </div>
            <div className="pt-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">প্লেলিস্ট</span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-1 mb-2">{playlist.title}</h1>
              <p className="text-gray-400 text-sm mb-1">{playlist.description}</p>
              <p className="text-sm text-gray-500">{playlistSongs.length} গান</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playlistSongs[0] && playSong(playlistSongs[0], playlistSongs)}
              className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full font-semibold hover:shadow-glow-purple"
            >
              <Play size={18} className="ml-0.5" /> চালান
            </motion.button>
            <button
              onClick={() => { setShuffle(true); playlistSongs[0] && playSong(playlistSongs[Math.floor(Math.random()*playlistSongs.length)], playlistSongs) }}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-gray-300 hover:border-white/40 text-sm"
            >
              <Shuffle size={15} /> র‍্যান্ডম
            </button>
            <button
              onClick={() => toggleSavePlaylist(playlist)}
              className={`p-3 rounded-full border transition-all ${
                isSaved ? 'border-primary-500 text-primary-400' : 'border-white/20 text-gray-400 hover:border-white/40'
              }`}
            >
              <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="px-4 lg:px-8 pb-8">
        <div className="space-y-1">
          {playlistSongs.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} queue={playlistSongs} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
