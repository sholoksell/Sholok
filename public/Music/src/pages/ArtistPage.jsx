import { motion } from 'framer-motion'
import { useParams, Link } from 'react-router-dom'
import { BadgeCheck, Play, UserPlus, Music, Disc3 } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { artists } from '../data/artists'
import { songs } from '../data/songs'
import { albums } from '../data/albums'
import SongCard from '../components/cards/SongCard'
import AlbumCard from '../components/cards/AlbumCard'
import ArtistCard from '../components/cards/ArtistCard'

export default function ArtistPage() {
  const { id } = useParams()
  const { playSong, toggleSaveArtist, savedArtists } = useMusic()
  const artist = artists.find(a => a.id === parseInt(id))
  if (!artist) return <div className="p-8 text-center text-gray-400">শিল্পী পাওয়া যায়নি</div>

  const artistSongs = songs.filter(s => s.artist === artist.name)
  const artistAlbums = albums.filter(a => a.artist === artist.name)
  const relatedArtists = artists.filter(a => a.genre === artist.genre && a.id !== artist.id).slice(0, 6)
  const isSaved = savedArtists.some(a => a.id === artist.id)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={artist.cover} alt={artist.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bangla-dark via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            {artist.verified && (
              <span className="flex items-center gap-1 text-xs bg-primary-500/30 text-primary-300 px-3 py-1 rounded-full border border-primary-500/30">
                <BadgeCheck size={12} /> যাচাইকৃত শিল্পী
              </span>
            )}
            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">{artist.genre}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">{artist.name}</h1>
          <p className="text-gray-300">{artist.followers} অনুসরণকারী · {artist.songs} গান · {artist.albums} অ্যালবাম</p>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        {/* Actions */}
        <div className="flex items-center gap-3 mb-8">
          {artistSongs[0] && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => playSong(artistSongs[0], artistSongs)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 rounded-full font-semibold text-sm hover:shadow-glow-purple"
            >
              <Play size={16} className="ml-0.5" /> সব গান চালান
            </motion.button>
          )}
          <button
            onClick={() => toggleSaveArtist(artist)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-medium transition-all ${
              isSaved
                ? 'border-primary-500 text-primary-400 bg-primary-500/10'
                : 'border-white/20 text-gray-300 hover:border-white/40'
            }`}
          >
            <UserPlus size={15} /> {isSaved ? 'অনুসরণ করছি' : 'অনুসরণ করুন'}
          </button>
        </div>

        {/* Bio */}
        <div className="glass rounded-2xl p-5 mb-8">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-primary-400">
            <Music size={16} /> পরিচিতি
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">{artist.bio}</p>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-xl font-bold text-gradient">{artist.followers}</p>
              <p className="text-xs text-gray-500">অনুসরণকারী</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gradient">{artist.songs}</p>
              <p className="text-xs text-gray-500">গান</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gradient">{artist.albums}</p>
              <p className="text-xs text-gray-500">অ্যালবাম</p>
            </div>
          </div>
        </div>

        {/* Popular Songs */}
        {artistSongs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">জনপ্রিয় গান</h2>
            <div className="space-y-1">
              {artistSongs.slice(0, 5).map((song, i) => (
                <SongCard key={song.id} song={song} index={i} queue={artistSongs} />
              ))}
            </div>
          </div>
        )}

        {/* Also known popular songs from data */}
        {artist.popular && (
          <div className="mb-8 glass rounded-2xl p-5">
            <h2 className="font-semibold mb-3 text-primary-400">বিখ্যাত গান</h2>
            <div className="flex flex-wrap gap-2">
              {artist.popular.map((title, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-gray-300">{title}</span>
              ))}
            </div>
          </div>
        )}

        {/* Albums */}
        {artistAlbums.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">অ্যালবাম</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {artistAlbums.map(album => <AlbumCard key={album.id} album={album} />)}
            </div>
          </div>
        )}

        {/* Related Artists */}
        {relatedArtists.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">সম্পর্কিত শিল্পী</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {relatedArtists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
