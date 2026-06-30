import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { Play, Heart, Clock, Music } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { albums } from '../data/albums'
import { songs } from '../data/songs'
import SongCard from '../components/cards/SongCard'

export default function AlbumPage() {
  const { id } = useParams()
  const { playSong, toggleSaveAlbum, savedAlbums } = useMusic()
  const album = albums.find(a => a.id === parseInt(id))
  if (!album) return <div className="p-8 text-center text-gray-400">অ্যালবাম পাওয়া যায়নি</div>

  // Get songs for this album or sample songs
  const albumSongs = songs.filter(s => s.album === album.title).length > 0
    ? songs.filter(s => s.album === album.title)
    : songs.filter(s => s.artist === album.artist).slice(0, album.tracks)

  const isSaved = savedAlbums.some(a => a.id === album.id)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="relative p-6 md:p-8 pb-0">
        <div className="absolute inset-0 overflow-hidden">
          <img src={album.cover} alt="" className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-b from-bangla-dark/60 to-bangla-dark" />
        </div>
        <div className="relative flex flex-col sm:flex-row gap-6 items-start mb-6">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={album.cover}
            alt={album.title}
            className="w-48 h-48 rounded-2xl object-cover shadow-2xl border border-white/10 flex-shrink-0"
            style={{ boxShadow: '0 0 40px rgba(217,70,239,0.3)' }}
          />
          <div className="pt-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">অ্যালবাম</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1 mb-1">{album.title}</h1>
            <p className="text-gray-300 mb-1">{album.artist}</p>
            <p className="text-sm text-gray-500">{album.genre} · {album.year} · {album.tracks} গান · {album.duration}</p>
            {album.description && <p className="text-sm text-gray-400 mt-2">{album.description}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex items-center gap-3 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => albumSongs[0] && playSong(albumSongs[0], albumSongs)}
            className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full font-semibold hover:shadow-glow-purple"
          >
            <Play size={18} className="ml-0.5" /> সব চালান
          </motion.button>
          <button
            onClick={() => toggleSaveAlbum(album)}
            className={`p-3 rounded-full border transition-all ${
              isSaved ? 'border-primary-500 text-primary-400' : 'border-white/20 text-gray-400 hover:border-white/40'
            }`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Tracks */}
      <div className="px-4 lg:px-8 pb-8">
        <div className="flex items-center text-xs text-gray-500 px-3 mb-2 gap-3">
          <span className="w-8 text-center">#</span>
          <span className="w-10" />
          <span className="flex-1">শিরোনাম</span>
          <span className="hidden md:block flex-shrink-0 w-24">ধরণ</span>
          <span className="flex-shrink-0"><Clock size={13} /></span>
        </div>
        <div className="space-y-1">
          {albumSongs.map((song, i) => (
            <SongCard key={song.id} song={song} index={i} queue={albumSongs} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
