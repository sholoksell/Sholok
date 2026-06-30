import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowLeft, List, ZoomIn, ZoomOut, Moon, Sun, BookOpen } from 'lucide-react';
import { webtoons, generateEpisodes } from '../data/webtoons';
import { useApp } from '../context/AppContext';

const panelColors = [
  'from-indigo-900 to-purple-950', 'from-blue-900 to-indigo-950',
  'from-violet-900 to-indigo-950', 'from-purple-900 to-pink-950',
  'from-slate-800 to-gray-950', 'from-teal-900 to-cyan-950',
];

const panelTexts = [
  '[ দৃশ্য ১ ]', '[ সংলাপ ]', '[ অ্যাকশন ]', '[ আবেগ ]',
  '[ রহস্য ]', '[ টুইস্ট ]', '[ চরমোৎকর্ষ ]', '[ উপসংহার ]',
];

export default function ReaderPage() {
  const { slug, episode } = useParams();
  const navigate = useNavigate();
  const { darkMode, updateContinueReading } = useApp();
  const [webtoon, setWebtoon] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEp, setCurrentEp] = useState(null);
  const [showUI, setShowUI] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showDrawer, setShowDrawer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [readerDark, setReaderDark] = useState(true);
  const readerRef = useRef(null);
  const uiTimer = useRef(null);

  useEffect(() => {
    const w = webtoons.find(w => w.slug === slug);
    if (w) {
      setWebtoon(w);
      const eps = generateEpisodes(w.id, w.episodeCount);
      setEpisodes(eps);
      const ep = eps.find(e => e.number === parseInt(episode)) || eps[0];
      setCurrentEp(ep);
      updateContinueReading(w, ep?.number || 1);
    }
  }, [slug, episode]);

  useEffect(() => {
    const handleScroll = () => {
      if (!readerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = readerRef.current;
      setProgress(Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      clearTimeout(uiTimer.current);
      setShowUI(true);
      uiTimer.current = setTimeout(() => setShowUI(false), 3000);
    };
    const el = readerRef.current;
    if (el) el.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, [currentEp]);

  const goToEpisode = (n) => navigate(`/read/${slug}/${n}`);

  if (!webtoon || !currentEp) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const epIndex = episodes.findIndex(e => e.id === currentEp.id);
  const prevEp = episodes[epIndex - 1];
  const nextEp = episodes[epIndex + 1];

  return (
    <div className={`min-h-screen ${readerDark ? 'bg-gray-950' : 'bg-gray-100'}`} onClick={() => setShowUI(p => !p)}>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Top UI */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
            className="fixed top-1 left-0 right-0 z-40 px-4 pt-2" onClick={e => e.stopPropagation()}>
            <div className="max-w-3xl mx-auto flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/webtoon/${slug}`)} className="text-gray-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="text-white font-semibold text-sm">{webtoon.title}</p>
                  <p className="text-gray-400 text-xs">{currentEp.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoom(p => Math.max(50, p - 10))} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-gray-300 text-xs w-10 text-center">{zoom}%</span>
                <button onClick={() => setZoom(p => Math.min(200, p + 10))} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setReaderDark(p => !p)} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white">
                  {readerDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={e => { e.stopPropagation(); setShowDrawer(p => !p); }} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:text-white">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader content */}
      <div ref={readerRef} className="h-screen overflow-y-auto pt-16" style={{ maxHeight: '100vh' }}>
        <div className="mx-auto py-4" style={{ width: `${zoom}%`, maxWidth: '800px' }}>
          {/* Comic panels — gradient based, no images */}
          {currentEp.panels.map((panel, i) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`w-full mb-1 min-h-[400px] bg-gradient-to-b ${panelColors[i % panelColors.length]} flex flex-col items-center justify-center relative overflow-hidden`}
              style={{ minHeight: '400px' }}
            >
              {/* Decorative shapes inside panel */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/3 rounded-full blur-3xl" />
              </div>
              <div className="relative z-10 text-center px-8 py-12">
                <div className="text-6xl mb-6 opacity-40">
                  {['📖', '✍️', '🎨', '📜', '🖊️', '📝'][i % 6]}
                </div>
                <p className={`text-white/30 text-sm font-mono tracking-widest`}>
                  {panelTexts[i % panelTexts.length]}
                </p>
                <p className="text-white/20 text-xs mt-2">পর্ব {currentEp.number} • প্যানেল {i + 1}</p>
              </div>
            </motion.div>
          ))}

          {/* Episode Navigation */}
          <div className="p-8 flex flex-col gap-4 items-center">
            <p className={`text-sm ${readerDark ? 'text-gray-400' : 'text-gray-600'}`}>{currentEp.title} — সমাপ্ত</p>
            <div className="flex gap-4">
              {prevEp && (
                <button onClick={() => goToEpisode(prevEp.number)}
                  className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20">
                  <ChevronLeft className="w-4 h-4" />আগের পর্ব
                </button>
              )}
              {nextEp && (
                <button onClick={() => goToEpisode(nextEp.number)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl">
                  পরের পর্ব<ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <AnimatePresence>
        {showUI && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-4 left-0 right-0 z-40 px-4" onClick={e => e.stopPropagation()}>
            <div className="max-w-md mx-auto flex items-center justify-between bg-black/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10">
              <button onClick={() => prevEp && goToEpisode(prevEp.number)} disabled={!prevEp}
                className="flex items-center gap-1 text-gray-300 disabled:opacity-30 hover:text-white text-sm">
                <ChevronLeft className="w-4 h-4" />আগে
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-white text-sm font-semibold">পর্ব {currentEp.number}</span>
                <span className="text-gray-400 text-xs">/ {episodes.length}</span>
              </div>
              <button onClick={() => nextEp && goToEpisode(nextEp.number)} disabled={!nextEp}
                className="flex items-center gap-1 text-gray-300 disabled:opacity-30 hover:text-white text-sm">
                পরে<ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episode Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 bottom-0 w-72 bg-gray-950 border-l border-white/10 z-50 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold">পর্বসমূহ</h3>
                <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-2">
                {episodes.map(ep => (
                  <button key={ep.id} onClick={() => { goToEpisode(ep.number); setShowDrawer(false); }}
                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${
                      ep.id === currentEp.id ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}>
                    <p className="font-medium">{ep.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(ep.releaseDate).toLocaleDateString('bn-BD')}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
