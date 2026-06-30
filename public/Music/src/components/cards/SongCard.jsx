import { motion } from 'framer-motion'
import { Play, Heart, MoreHorizontal } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'

export default function SongCard({ song, index, queue }) {
  const { playSong, currentSong, isPlaying, toggleLike, isLiked } = useMusic()
  const isActive = currentSong?.id === song.id

  const formatViews = (n) => {
    if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n/1000).toFixed(0)}K`
    return n.toString()
  }

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)', scale: 1.005 }}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all ${isActive ? 'bg-primary-500/10 border border-primary-500/20' : ''}`}
      onClick={() => playSong(song, queue)}
    >
      {/* Index/Play */}
      <div className="w-8 flex-shrink-0 text-center">
        <span className={`text-sm group-hover:hidden ${isActive ? 'hidden' : 'text-gray-500'}`}>
          {index !== undefined ? index + 1 : ''}
        </span>
        <div className={`w-8 h-8 flex items-center justify-center ${isActive ? '' : 'hidden group-hover:flex'}`}>
          {isActive && isPlaying ? (
            <div className="flex items-end gap-0.5 h-5">
              {[1,2,3].map(i => (
                <div key={i} className="w-0.5 bg-primary-400 wave-bar rounded-full" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          ) : (
            <Play size={14} className="text-primary-400 ml-0.5" />
          )}
        </div>
      </div>

      {/* Cover */}
      <img
        src={song.cover}
        alt={song.title}
        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary-400' : 'text-white'}`}>
          {song.title}
        </p>
        <p className="text-xs text-gray-500 truncate">{song.artist}</p>
      </div>

      {/* Genre */}
      <span className="hidden md:block text-xs text-gray-600 truncate max-w-24">{song.genre}</span>

      {/* Views */}
      <span className="hidden lg:block text-xs text-gray-500">{formatViews(song.views)}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); toggleLike(song) }}
          className={`p-1.5 rounded-lg transition-all ${isLiked(song.id) ? 'text-primary-500' : 'text-gray-600 hover:text-white'}`}
        >
          <Heart size={15} fill={isLiked(song.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Duration */}
      <span className="text-xs text-gray-500 flex-shrink-0">{song.duration}</span>
    </motion.div>
  )
}
