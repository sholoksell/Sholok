import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp, Music2, Radio, Sparkles, Music, ListMusic } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { songs, trendingSongs, newSongs, popularSongs } from '../data/songs'
import { artists, featuredArtists } from '../data/artists'
import { albums } from '../data/albums'
import { playlists, moodPlaylists } from '../data/playlists'
import { categories } from '../data/categories'
import SongCard from '../components/cards/SongCard'
import ArtistCard from '../components/cards/ArtistCard'
import AlbumCard from '../components/cards/AlbumCard'
import PlaylistCard from '../components/cards/PlaylistCard'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function Section({ title, icon: Icon, link, children }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="mb-10"
    >
      <div className="flex items-center justify-between mb-4 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} className="text-primary-400" />}
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {link && (
          <Link to={link} className="text-sm text-gray-500 hover:text-primary-400 flex items-center gap-1 transition-colors">
            সব দেখুন <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </motion.section>
  )
}

function EmptyBanner() {
  return (
    <div className="mx-4 lg:mx-6 mb-10 rounded-3xl overflow-hidden bg-gradient-to-br from-bangla-surface to-bangla-card border border-bangla-border flex flex-col items-center justify-center" style={{ minHeight: 280 }}>
      <div className="w-20 h-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-4">
        <Music size={36} className="text-primary-400" />
      </div>
      <h2 className="text-2xl font-bold text-gradient mb-2">সুরবাংলায় স্বাগতম</h2>
      <p className="text-gray-400 text-sm text-center max-w-xs px-4">
        বাংলাদেশের প্রিমিয়াম মিউজিক স্ট্রিমিং প্ল্যাটফর্ম। শীঘ্রই গান যোগ করা হবে।
      </p>
    </div>
  )
}

function EmptyGrid({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500 col-span-full">
      <Music size={32} className="mb-2 opacity-30" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export default function Home() {
  const { recentlyPlayed } = useMusic()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'শুভ সকাল'
    if (h < 17) return 'শুভ দুপুর'
    if (h < 20) return 'শুভ বিকাল'
    return 'শুভ সন্ধ্যা'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
      {/* Greeting */}
      <div className="px-4 lg:px-6 mb-6">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          {greeting()} 👋
        </motion.h1>
        <p className="text-gray-400 text-sm mt-1">আজকের জন্য কী শুনতে চান?</p>
      </div>

      {/* Hero */}
      {trendingSongs.length > 0 ? <HeroBanner /> : <EmptyBanner />}

      {/* Mood */}
      {moodPlaylists.length > 0 && (
        <Section title="মুড অনুযায়ী গান" icon={Sparkles}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 px-4 lg:px-6">
            {moodPlaylists.map(mood => <MoodCard key={mood.id} mood={mood} />)}
          </div>
        </Section>
      )}

      {/* Trending */}
      <Section title="আজকের ট্রেন্ডিং" icon={TrendingUp} link="/charts">
        {trendingSongs.length > 0 ? (
          <div className="px-4 lg:px-6 space-y-1">
            {trendingSongs.slice(0, 6).map((song, i) => (
              <SongCard key={song.id} song={song} index={i} queue={trendingSongs} />
            ))}
          </div>
        ) : (
          <div className="px-4 lg:px-6">
            <div className="glass rounded-2xl py-10 flex flex-col items-center text-gray-500">
              <TrendingUp size={32} className="mb-2 opacity-30" />
              <p className="text-sm">এখনো কোনো ট্রেন্ডিং গান নেই</p>
            </div>
          </div>
        )}
      </Section>

      {/* Categories */}
      {categories.length > 0 && (
        <Section title="সব ধরণ" icon={Music2} link="/search">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 px-4 lg:px-6">
            {categories.slice(0, 12).map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`}>
                <motion.div
                  whileHover={{ scale: 1.04, y: -3 }}
                  className={`relative rounded-xl p-4 bg-gradient-to-br ${cat.color} cursor-pointer overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/25" />
                  <span className="relative text-2xl block mb-1">{cat.icon}</span>
                  <p className="relative text-sm font-semibold text-white leading-tight">{cat.name}</p>
                  <p className="relative text-xs text-white/60 mt-0.5">{cat.count}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Featured Artists */}
      {featuredArtists.length > 0 && (
        <Section title="জনপ্রিয় শিল্পী" icon={Radio} link="/search">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 lg:px-6">
            {featuredArtists.map(artist => <ArtistCard key={artist.id} artist={artist} />)}
          </div>
        </Section>
      )}

      {/* New Releases */}
      {albums.length > 0 && (
        <Section title="নতুন প্রকাশ" link="/charts">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 lg:px-6">
            {albums.slice(0, 6).map(album => <AlbumCard key={album.id} album={album} />)}
          </div>
        </Section>
      )}

      {/* Featured Playlists */}
      {playlists.length > 0 && (
        <Section title="বিশেষ প্লেলিস্ট" link="/library">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 lg:px-6">
            {playlists.slice(0, 5).map(pl => <PlaylistCard key={pl.id} playlist={pl} />)}
          </div>
        </Section>
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <Section title="সম্প্রতি শোনা" link="/library">
          <div className="px-4 lg:px-6 space-y-1">
            {recentlyPlayed.slice(0, 5).map((song, i) => (
              <SongCard key={song.id} song={song} index={i} queue={recentlyPlayed} />
            ))}
          </div>
        </Section>
      )}

      {/* Popular Songs */}
      {popularSongs.length > 0 && (
        <Section title="সর্বাধিক শোনা" icon={TrendingUp}>
          <div className="px-4 lg:px-6 space-y-1">
            {popularSongs.slice(0, 8).map((song, i) => (
              <SongCard key={song.id} song={song} index={i} queue={popularSongs} />
            ))}
          </div>
        </Section>
      )}

      {/* Empty state when everything is empty */}
      {songs.length === 0 && categories.length === 0 && artists.length === 0 && (
        <div className="px-4 lg:px-6">
          <div className="glass rounded-3xl p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6 animate-pulse-slow">
              <Music2 size={40} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gradient mb-3">কন্টেন্ট যোগের অপেক্ষায়</h2>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              সুরবাংলা প্ল্যাটফর্মে গান, শিল্পী, অ্যালবাম ও প্লেলিস্ট যোগ করলে এখানে দেখাবে।
              <br /><span className="text-primary-400">src/data/</span> ফোল্ডারে data যোগ করুন।
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
