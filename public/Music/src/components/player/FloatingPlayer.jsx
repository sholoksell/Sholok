import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Repeat1, Heart, Maximize2, Minimize2,
  ListMusic, Mic2, ChevronDown
} from 'lucide-react'
import { useMusic } from '../../context/MusicContext'
import { Link } from 'react-router-dom'

function WaveBars({ isPlaying }) {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`w-1 rounded-full bg-primary-400 ${isPlaying ? 'wave-bar' : 'h-1'}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export default function FloatingPlayer() {
  const {
    currentSong, isPlaying, progress, duration, volume, isMuted, shuffle, repeat,
    togglePlay, playNext, playPrev, seekTo, setVolume, setIsMuted, setShuffle,
    toggleRepeat, isLiked, toggleLike, showPlayer, setShowLyrics, showQueue, setShowQueue, setShowPlayer,
  } = useMusic()

  const [expanded, setExpanded] = useState(false)
  const [showVol, setShowVol] = useState(false)

  if (!currentSong || !showPlayer) return null

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '০:০০'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 floating-player"
      >
        {/* Progress bar at top */}
        <div className="relative h-1 bg-white/10 cursor-pointer group" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          seekTo(pct * duration)
        }}>
          <div
            className="h-full bg-gradient-to-r from-primary-600 to-bangla-gold transition-all duration-100"
            style={{ width: `${progressPct}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progressPct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
          />
        </div>

        <div className="flex items-center gap-4 px-4 py-3">
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={currentSong.cover}
                alt={currentSong.title}
                className={`w-12 h-12 rounded-lg object-cover ${isPlaying ? 'animate-pulse-slow' : ''}`}
                style={{ boxShadow: isPlaying ? '0 0 15px rgba(217,70,239,0.5)' : 'none' }}
              />
              {isPlaying && (
                <div className="absolute bottom-0.5 right-0.5">
                  <WaveBars isPlaying={isPlaying} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-white">{currentSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => toggleLike(currentSong)}
              className={`flex-shrink-0 ml-1 transition-all ${isLiked(currentSong.id) ? 'text-primary-500 scale-110' : 'text-gray-500 hover:text-white'}`}
            >
              <Heart size={18} fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShuffle(s => !s)}
              className={`p-1.5 rounded-lg transition-colors hidden sm:flex ${shuffle ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
            >
              <Shuffle size={16} />
            </button>
            <button onClick={playPrev} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center hover:scale-105 transition-transform shadow-glow-purple"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <SkipForward size={18} />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition-colors hidden sm:flex ${repeat !== 'none' ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
            >
              <RepeatIcon size={16} />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400 hidden md:block">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
            <div className="relative hidden md:block">
              <button
                onMouseEnter={() => setShowVol(true)}
                onMouseLeave={() => setShowVol(false)}
                onClick={() => setIsMuted(m => !m)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              {showVol && (
                <div
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-bangla-surface border border-bangla-border rounded-xl p-3 w-32"
                  onMouseEnter={() => setShowVol(true)}
                  onMouseLeave={() => setShowVol(false)}
                >
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false) }}
                    className="w-full accent-primary-500"
                  />
                  <p className="text-center text-xs text-gray-400 mt-1">{Math.round(volume * 100)}%</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowLyrics(l => !l)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-primary-400 hidden lg:flex"
              title="লিরিক্স"
            >
              <Mic2 size={16} />
            </button>
            <button
              onClick={() => setShowQueue(q => !q)}
              className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors hidden lg:flex ${showQueue ? 'text-primary-400' : 'text-gray-500 hover:text-white'}`}
              title="কিউ"
            >
              <ListMusic size={16} />
            </button>
            <button
              onClick={() => setShowPlayer(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Mobile volume slider */}
        <div className="md:hidden px-4 pb-2">
          <input
            type="range" min="0" max="1" step="0.01"
            value={isMuted ? 0 : volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); setIsMuted(false) }}
            className="w-full accent-primary-500"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
