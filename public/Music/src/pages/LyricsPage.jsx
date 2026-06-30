import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic2, Copy, Type, Scroll } from 'lucide-react'
import { useMusic } from '../context/MusicContext'
import { lyrics } from '../data/categories'
import { songs } from '../data/songs'
import SongCard from '../components/cards/SongCard'

export default function LyricsPage() {
  const { currentSong } = useMusic()
  const [fontSize, setFontSize] = useState('text-lg')
  const [darkMode, setDarkMode] = useState(true)
  const [copied, setCopied] = useState(false)

  const activeSong = currentSong || songs.find(s => lyrics[s.id])
  const songLyrics = activeSong ? lyrics[activeSong.id] : null
  const songsWithLyrics = songs.filter(s => lyrics[s.id])

  const handleCopy = () => {
    if (songLyrics) {
      navigator.clipboard.writeText(songLyrics).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 px-4 lg:px-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-bangla-gold flex items-center justify-center">
          <Mic2 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">লিরিক্স</h1>
          <p className="text-sm text-gray-400">গানের কথা পড়ুন</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lyrics panel */}
        <div className="lg:col-span-2">
          {activeSong && (
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-bangla-surface border border-bangla-border' : 'bg-white text-gray-900'}`}>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src={activeSong.cover} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold">{activeSong.title}</p>
                    <p className="text-sm text-gray-400">{activeSong.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Font size */}
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                    {fontSizes.map((size, i) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-1 rounded text-xs transition-all ${fontSize === size ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        A{i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white'} hover:bg-white/10`}
                    title="কপি করুন"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Lyrics */}
              <div className="p-6 min-h-64">
                {songLyrics ? (
                  <div className={`${fontSize} leading-relaxed whitespace-pre-line text-gray-200 font-bangla`}>
                    {songLyrics}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                    <Mic2 size={40} className="mb-3 opacity-30" />
                    <p>এই গানের লিরিক্স এখনো যোগ করা হয়নি</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Songs with lyrics */}
        <div>
          <h2 className="text-lg font-semibold mb-4">লিরিক্স সহ গান</h2>
          <div className="space-y-1">
            {songsWithLyrics.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} queue={songsWithLyrics} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
