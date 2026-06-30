import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BadgeCheck, UserPlus } from 'lucide-react'
import { useMusic } from '../../context/MusicContext'

export default function ArtistCard({ artist }) {
  const { toggleSaveArtist, savedArtists } = useMusic()
  const isSaved = savedArtists.some(a => a.id === artist.id)

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass rounded-2xl p-4 card-hover group cursor-pointer"
    >
      <Link to={`/artist/${artist.id}`} className="block">
        <div className="relative mb-3">
          <img
            src={artist.cover}
            alt={artist.name}
            className="w-full aspect-square rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm truncate">{artist.name}</p>
              {artist.verified && <BadgeCheck size={14} className="text-primary-400 flex-shrink-0" />}
            </div>
            <p className="text-xs text-gray-500 truncate">{artist.genre}</p>
            <p className="text-xs text-gray-600 mt-0.5">{artist.followers} অনুসরণকারী</p>
          </div>
        </div>
      </Link>
      <button
        onClick={e => { e.stopPropagation(); toggleSaveArtist(artist) }}
        className={`mt-2 w-full py-1.5 rounded-lg text-xs font-medium transition-all border ${
          isSaved
            ? 'border-primary-500 text-primary-400 bg-primary-500/10'
            : 'border-white/20 text-gray-400 hover:border-primary-500 hover:text-primary-400'
        }`}
      >
        {isSaved ? 'অনুসরণ করছি' : 'অনুসরণ করুন'}
      </button>
    </motion.div>
  )
}
