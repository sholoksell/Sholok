import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search as SearchIcon, X, Clock, TrendingUp } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useMusic } from '../context/MusicContext'
import { songs } from '../data/songs'
import { artists } from '../data/artists'
import { albums } from '../data/albums'
import { playlists } from '../data/playlists'
import { categories } from '../data/categories'
import SongCard from '../components/cards/SongCard'
import ArtistCard from '../components/cards/ArtistCard'
import AlbumCard from '../components/cards/AlbumCard'
import PlaylistCard from '../components/cards/PlaylistCard'
import { Link } from 'react-router-dom'

const TABS = ['গান', 'শিল্পী', 'অ্যালবাম', 'প্লেলিস্ট']

const popularSearches = ['তাহসান', 'হাবিব', 'রবীন্দ্রসঙ্গীত', 'লালনগীতি', 'ব্যান্ড', 'রোমান্টিক', 'বিরহ', 'দেশের গান']

export default function Search() {
  const [params] = useSearchParams()
  const initialQ = params.get('q') || ''
  const [query, setQuery] = useState(initialQ)
  const [activeTab, setActiveTab] = useState('গান')
  const { searchHistory, addSearchHistory } = useMusic()

  useEffect(() => { setQuery(initialQ) }, [initialQ])

  const q = query.toLowerCase()
  const filteredSongs = q ? songs.filter(s => s.title.includes(q) || s.artist.includes(q) || s.genre.includes(q)) : []
  const filteredArtists = q ? artists.filter(a => a.name.includes(q) || a.genre.includes(q)) : []
  const filteredAlbums = q ? albums.filter(a => a.title.includes(q) || a.artist.includes(q)) : []
  const filteredPlaylists = q ? playlists.filter(p => p.title.includes(q)) : []

  const handleSearch = (val) => {
    setQuery(val)
    if (val) addSearchHistory(val)
  }

  const totalResults = filteredSongs.length + filteredArtists.length + filteredAlbums.length + filteredPlaylists.length

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">সার্চ করুন</h1>

      {/* Search Input */}
      <div className="relative mb-6">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="গান, শিল্পী, অ্যালবাম, ধরণ..."
          className="w-full bg-white/10 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-500 outline-none focus:border-primary-500 font-bangla text-base transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* No query state */}
      {!query && (
        <div>
          {/* Search history */}
          {searchHistory.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> সাম্প্রতিক সার্চ
              </h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(h)}
                    className="px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-primary-500/20 hover:text-primary-400 transition-colors"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" /> জনপ্রিয় সার্চ
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-sm text-primary-300 hover:bg-primary-500/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3">সব ধরণ দেখুন</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className={`relative rounded-xl p-4 bg-gradient-to-br ${cat.color} overflow-hidden cursor-pointer`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="relative text-2xl block mb-1">{cat.icon}</span>
                    <p className="relative text-sm font-semibold text-white">{cat.name}</p>
                    <p className="relative text-xs text-white/60">{cat.count}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <div>
          <p className="text-sm text-gray-400 mb-4">"{query}" এর জন্য {totalResults} টি ফলাফল</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary-500 text-white'
                    : 'bg-white/10 text-gray-400 hover:bg-white/15'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'গান' && (
            <div className="space-y-1">
              {filteredSongs.length > 0
                ? filteredSongs.map((s, i) => <SongCard key={s.id} song={s} index={i} queue={filteredSongs} />)
                : <p className="text-gray-500 text-center py-8">কোনো গান পাওয়া যায়নি</p>
              }
            </div>
          )}
          {activeTab === 'শিল্পী' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredArtists.length > 0
                ? filteredArtists.map(a => <ArtistCard key={a.id} artist={a} />)
                : <p className="text-gray-500 col-span-full text-center py-8">কোনো শিল্পী পাওয়া যায়নি</p>
              }
            </div>
          )}
          {activeTab === 'অ্যালবাম' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredAlbums.length > 0
                ? filteredAlbums.map(a => <AlbumCard key={a.id} album={a} />)
                : <p className="text-gray-500 col-span-full text-center py-8">কোনো অ্যালবাম পাওয়া যায়নি</p>
              }
            </div>
          )}
          {activeTab === 'প্লেলিস্ট' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPlaylists.length > 0
                ? filteredPlaylists.map(p => <PlaylistCard key={p.id} playlist={p} />)
                : <p className="text-gray-500 col-span-full text-center py-8">কোনো প্লেলিস্ট পাওয়া যায়নি</p>
              }
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
