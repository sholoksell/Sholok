import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Clock, Disc3, Users, ListMusic, Music2 } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import SongCard from '../components/cards/SongCard'
import ArtistCard from '../components/cards/ArtistCard'
import AlbumCard from '../components/cards/AlbumCard'
import PlaylistCard from '../components/cards/PlaylistCard'

const TABS = [
  { id: 'liked', label: 'পছন্দের গান', icon: Heart },
  { id: 'recent', label: 'সম্প্রতি শোনা', icon: Clock },
  { id: 'albums', label: 'সেভ করা অ্যালবাম', icon: Disc3 },
  { id: 'artists', label: 'শিল্পী', icon: Users },
  { id: 'playlists', label: 'প্লেলিস্ট', icon: ListMusic },
]

function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{desc}</p>
    </div>
  )
}

export default function Library() {
  const [activeTab, setActiveTab] = useState('liked')
  const { likedSongs, recentlyPlayed, savedAlbums, savedArtists, savedPlaylists } = useMusic()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4 lg:px-6">
      <h1 className="text-2xl font-bold mb-6">আমার লাইব্রেরি</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-primary-500 text-white shadow-glow-purple'
                : 'bg-white/10 text-gray-400 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'liked' && (
        <div>
          {likedSongs.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">{likedSongs.length} টি গান</p>
              <div className="space-y-1">
                {likedSongs.map((s, i) => <SongCard key={s.id} song={s} index={i} queue={likedSongs} />)}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Heart}
              title="এখনো কোনো পছন্দের গান নেই"
              desc="গানে হৃদয়ের আইকনে ক্লিক করে পছন্দের তালিকায় যোগ করুন"
            />
          )}
        </div>
      )}

      {activeTab === 'recent' && (
        <div>
          {recentlyPlayed.length > 0 ? (
            <>
              <p className="text-sm text-gray-500 mb-4">{recentlyPlayed.length} টি গান</p>
              <div className="space-y-1">
                {recentlyPlayed.map((s, i) => <SongCard key={s.id} song={s} index={i} queue={recentlyPlayed} />)}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Clock}
              title="এখনো কোনো গান শোনা হয়নি"
              desc="গান শুনতে শুরু করুন, সেগুলো এখানে দেখাবে"
            />
          )}
        </div>
      )}

      {activeTab === 'albums' && (
        <div>
          {savedAlbums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {savedAlbums.map(a => <AlbumCard key={a.id} album={a} />)}
            </div>
          ) : (
            <EmptyState
              icon={Disc3}
              title="কোনো অ্যালবাম সেভ নেই"
              desc="অ্যালবামে হৃদয় আইকনে ক্লিক করে সেভ করুন"
            />
          )}
        </div>
      )}

      {activeTab === 'artists' && (
        <div>
          {savedArtists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {savedArtists.map(a => <ArtistCard key={a.id} artist={a} />)}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="কোনো শিল্পী অনুসরণ নেই"
              desc="শিল্পীর পেজে গিয়ে অনুসরণ করুন"
            />
          )}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div>
          {savedPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {savedPlaylists.map(p => <PlaylistCard key={p.id} playlist={p} />)}
            </div>
          ) : (
            <EmptyState
              icon={ListMusic}
              title="কোনো প্লেলিস্ট সেভ নেই"
              desc="প্লেলিস্ট সেভ করুন এখানে দেখাবে"
            />
          )}
        </div>
      )}
    </motion.div>
  )
}
