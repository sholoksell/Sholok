import { useState } from 'react';
import Header from '@/components/portal/Header';
import { Play, Tv, TrendingUp, Clock, Star } from 'lucide-react';

const CHANNELS = [
  { id: 'UCiEDS_XqyHVB1TcKAqC5kag', name: 'Somoy TV', lang: 'বাংলা নিউজ', emoji: '📺' },
  { id: 'UCItfx_HyAiOLp9uZr8X5DyA', name: 'Channel i', lang: 'বাংলা', emoji: '📡' },
  { id: 'UCm5VKy5NfQ1J5uqxdSKANlw', name: 'NTV Bangladesh', lang: 'বাংলা', emoji: '🎙️' },
];

const FEATURED = [
  {
    id: 'MV0rZJe8ck0',
    title: 'Bangladesh: Land of Rivers',
    channel: 'Travel BD',
    views: '2.3M views',
    category: 'Travel',
  },
  {
    id: 'YE7VzlLtp-4',
    title: 'Learn React in 2024',
    channel: 'Traversy Media',
    views: '1.1M views',
    category: 'Technology',
  },
  {
    id: '8mAITcNt710',
    title: 'Relaxing Music & Beautiful Nature',
    channel: 'Relaxing World',
    views: '5.4M views',
    category: 'Music',
  },
  {
    id: 'hFZFjoX2cGg',
    title: 'Healthy Recipes | Easy Cooking',
    channel: 'Food Network',
    views: '876K views',
    category: 'Food',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Top Hits 2024 Playlist',
    channel: 'Music Zone',
    views: '12M views',
    category: 'Music',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'lofi hip hop radio 📚 beats to relax/study to',
    channel: 'Lofi Girl',
    views: 'Live',
    category: 'Music',
  },
];

const CATEGORIES = ['All', 'News', 'Music', 'Technology', 'Travel', 'Food', 'Sports'];

export default function TV() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? FEATURED
    : FEATURED.filter(v => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />

      {/* Active Player */}
      {activeVideo && (
        <div className="w-full bg-black flex justify-center" style={{ height: 'min(56.25vw, 540px)' }}>
          <iframe
            key={activeVideo}
            src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
            className="w-full max-w-5xl h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title="Video Player"
          />
        </div>
      )}

      {!activeVideo && (
        /* Hero Banner */
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 py-12 px-6 text-center border-b border-gray-800">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Tv className="w-10 h-10 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Sholok TV</h1>
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">Watch videos, live channels, and trending content. Click any video below to start watching.</p>
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Videos Grid */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Featured Videos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(video => (
              <button
                key={video.id}
                onClick={() => { setActiveVideo(video.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group text-left bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full aspect-video object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-green-500 rounded-full p-3">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  {video.views === 'Live' && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">● LIVE</span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{video.category}</span>
                </div>
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
                  <p className="text-gray-400 text-xs">{video.channel}</p>
                  <p className="text-gray-500 text-xs mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {video.views}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Live Channels */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold text-white">Live Channels</h2>
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">LIVE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CHANNELS.map(ch => (
              <button
                key={ch.id}
                onClick={() => { setActiveVideo(ch.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="group flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 hover:border-green-500 transition-all text-left"
              >
                <span className="text-3xl">{ch.emoji}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{ch.name}</p>
                  <p className="text-gray-400 text-xs">{ch.lang}</p>
                  <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse" />
                    Live Now
                  </p>
                </div>
                <Play className="w-5 h-5 text-green-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
