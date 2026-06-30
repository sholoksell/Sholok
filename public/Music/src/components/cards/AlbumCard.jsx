import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play, Heart } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'

export default function AlbumCard({ album }) {
  const { toggleSaveAlbum, savedAlbums } = useMusic()
  const isSaved = savedAlbums.some(a => a.id === album.id)

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="glass rounded-2xl p-3 card-hover group cursor-pointer"
    >
      <Link to={`/album/${album.id}`} className="block">
        <div className="relative mb-3 rounded-xl overflow-hidden">
          <img
            src={album.cover}
            alt={album.title}
            className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center shadow-glow-purple">
              <Play size={20} className="ml-1" />
            </div>
          </div>
        </div>
        <p className="font-semibold text-sm truncate">{album.title}</p>
        <p className="text-xs text-gray-500 truncate">{album.artist}</p>
        <p className="text-xs text-gray-600 mt-0.5">{album.year} · {album.tracks} গান</p>
      </Link>
      <button
        onClick={e => { e.stopPropagation(); toggleSaveAlbum(album) }}
        className={`mt-2 p-1.5 rounded-lg transition-colors ${isSaved ? 'text-primary-500' : 'text-gray-600 hover:text-primary-400'}`}
      >
        <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
      </button>
    </motion.div>
  )
}
