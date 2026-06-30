import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

export default function PlaylistCard({ playlist }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="group cursor-pointer"
    >
      <Link to={`/playlist/${playlist.id}`}>
        <div className="relative rounded-2xl overflow-hidden mb-3 aspect-square">
          <img
            src={playlist.cover}
            alt={playlist.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${playlist.color} opacity-60`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <span className="text-4xl mb-2">{playlist.emoji}</span>
            <p className="font-bold text-lg text-center leading-tight">{playlist.title}</p>
            <p className="text-xs text-white/70 mt-1">{playlist.songs.length} গান</p>
          </div>
          <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            <Play size={16} className="ml-0.5" />
          </div>
        </div>
        <p className="font-medium text-sm truncate">{playlist.title}</p>
        <p className="text-xs text-gray-500 truncate">{playlist.description}</p>
      </Link>
    </motion.div>
  )
}
