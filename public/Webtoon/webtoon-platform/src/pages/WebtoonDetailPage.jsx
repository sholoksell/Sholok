import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Eye, Heart, BookOpen, Share2, Bell, Play, ChevronDown, ChevronUp, MessageSquare, ThumbsUp } from 'lucide-react';
import { webtoons, generateEpisodes, comments } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n;
};

const coverIcons = ['📚', '🔮', '⚡', '🌙', '🗡️', '🌸', '👻', '🚀', '🎭', '🔍', '🌊', '🔥', '🏯', '🌿', '⚔️'];

export default function WebtoonDetailPage() {
  const { slug } = useParams();
  const { darkMode, toggleFavorite, isFavorite, addToHistory } = useApp();
  const [webtoon, setWebtoon] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [activeTab, setActiveTab] = useState('episodes');
  const [liked, setLiked] = useState({});

  useEffect(() => {
    const w = webtoons.find(w => w.slug === slug);
    if (w) {
      setWebtoon(w);
      setEpisodes(generateEpisodes(w.id, w.episodeCount));
      addToHistory(w);
    }
  }, [slug]);

  if (!webtoon) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const icon = coverIcons[(webtoon.id - 1) % coverIcons.length];
  const displayEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 5);
  const related = webtoons.filter(w => w.genre === webtoon.genre && w.id !== webtoon.id).slice(0, 5);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Banner — gradient, no image */}
      <div className={`relative h-64 md:h-80 bg-gradient-to-br ${webtoon.coverGradient} overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 border border-white/10" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-black/10 border border-white/5" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.2 }} transition={{ duration: 0.8 }}
            className="text-[180px] select-none">
            {icon}
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-28 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Cover card */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
            <div className={`w-40 md:w-52 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-white/10 bg-gradient-to-br ${webtoon.coverGradient}`}>
              <div className="aspect-[3/4] flex flex-col items-center justify-center p-4">
                <div className="text-6xl mb-3">{icon}</div>
                <p className="text-white font-bold text-sm text-center line-clamp-3">{webtoon.title}</p>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 pt-20 md:pt-12">
            <div className="flex flex-wrap gap-2 mb-3">
              {webtoon.isOriginal && <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full">অরিজিনাল</span>}
              <span className={`px-3 py-1 bg-gradient-to-r ${webtoon.genreColors?.bg || 'from-pink-500 to-rose-600'} text-white text-xs font-bold rounded-full`}>{webtoon.genre}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${webtoon.status === 'সম্পূর্ণ' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>{webtoon.status}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{webtoon.title}</h1>
            <p className="text-gray-400 mb-4">লেখক: <span className="text-indigo-400 font-semibold">{webtoon.author}</span></p>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{webtoon.description}</p>

            <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-lg">{webtoon.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400"><Eye className="w-4 h-4" /><span>{formatNumber(webtoon.views)}</span></div>
              <div className="flex items-center gap-1 text-gray-400"><BookOpen className="w-4 h-4" /><span>{webtoon.episodeCount} পর্ব</span></div>
              <div className="flex items-center gap-1 text-gray-400"><Heart className="w-4 h-4" /><span>{formatNumber(webtoon.likes)}</span></div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/read/${webtoon.slug}/1`}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30">
                  <Play className="w-4 h-4 fill-white" />পড়া শুরু করুন
                </motion.button>
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => toggleFavorite(webtoon)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all ${
                  isFavorite(webtoon.id) ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}>
                <Heart className={`w-4 h-4 ${isFavorite(webtoon.id) ? 'fill-red-400' : ''}`} />
                {isFavorite(webtoon.id) ? 'সেভ করা হয়েছে' : 'সেভ করুন'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20">
                <Bell className="w-4 h-4" />সাবস্ক্রাইব
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="p-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20">
                <Share2 className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {webtoon.tags.map(tag => (
                <span key={tag} className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>#{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl mb-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'}`}>
          {[['episodes', 'পর্বসমূহ'], ['comments', 'মন্তব্য'], ['related', 'সম্পর্কিত']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === key ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>{label}</button>
          ))}
        </div>

        {/* Episodes */}
        {activeTab === 'episodes' && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <div className="space-y-3 mb-6">
              {displayEpisodes.map(ep => (
                <motion.div key={ep.id} variants={staggerItem}>
                  <Link to={`/read/${webtoon.slug}/${ep.number}`}>
                    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01] ${darkMode ? 'bg-gray-900 hover:bg-gray-800 border border-white/5' : 'bg-white hover:bg-gray-50 border border-gray-200'} shadow-sm`}>
                      {/* Episode number badge */}
                      <div className={`w-14 h-14 rounded-xl flex-shrink-0 bg-gradient-to-br ${webtoon.coverGradient} flex items-center justify-center`}>
                        <span className="text-white font-black text-lg">{ep.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{ep.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>{new Date(ep.releaseDate).toLocaleDateString('bn-BD')}</span>
                          <div className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatNumber(ep.views)}</div>
                          <div className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{formatNumber(ep.comments)}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {!ep.isFree && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-md">কয়েন</span>}
                        <Play className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            {episodes.length > 5 && (
              <button onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                  darkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {showAllEpisodes ? <><ChevronUp className="w-4 h-4" />কম দেখান</> : <><ChevronDown className="w-4 h-4" />সব {episodes.length}টি পর্ব দেখুন</>}
              </button>
            )}
          </motion.div>
        )}

        {/* Comments */}
        {activeTab === 'comments' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {comments.map(c => (
              <div key={c.id} className={`rounded-2xl p-5 ${darkMode ? 'bg-gray-900 border border-white/5' : 'bg-white border border-gray-200'}`}>
                {c.isPinned && (
                  <div className="flex items-center gap-1 mb-3 text-xs text-yellow-400 font-semibold">
                    <Star className="w-3 h-3 fill-yellow-400" /> পিন করা মন্তব্য
                  </div>
                )}
                <div className="flex items-start gap-3">
                  {/* Avatar — gradient, no image */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.avatarColor} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{c.initials}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{c.user}</span>
                      <span className="text-xs text-gray-400">{c.time}</span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{c.text}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button onClick={() => setLiked(p => ({ ...p, [c.id]: !p[c.id] }))}
                        className={`flex items-center gap-1 text-xs transition-colors ${liked[c.id] ? 'text-indigo-400' : 'text-gray-400 hover:text-indigo-400'}`}>
                        <ThumbsUp className={`w-3.5 h-3.5 ${liked[c.id] ? 'fill-indigo-400' : ''}`} />
                        {c.likes + (liked[c.id] ? 1 : 0)}
                      </button>
                      <button className="text-xs text-gray-400 hover:text-indigo-400 transition-colors">উত্তর দিন</button>
                    </div>
                    {c.replies?.map(r => (
                      <div key={r.id} className={`mt-4 ml-4 flex items-start gap-3 pl-4 border-l-2 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${r.avatarColor} flex items-center justify-center flex-shrink-0`}>
                          <span className="text-white font-bold text-xs">{r.initials}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-semibold text-xs ${darkMode ? 'text-white' : 'text-gray-900'}`}>{r.user}</span>
                            <span className="text-xs text-gray-400">{r.time}</span>
                          </div>
                          <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Related */}
        {activeTab === 'related' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <WebtoonGrid webtoons={related} cols="grid-cols-2 sm:grid-cols-3 md:grid-cols-5" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
