import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Filter } from 'lucide-react';
import { webtoons, popularSearches, moodTags } from '../data/webtoons';
import { useApp } from '../context/AppContext';
import WebtoonGrid from '../components/home/WebtoonGrid';
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants';

const genres = ['All', 'Romance', 'Fantasy', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller'];
const sorts = ['Relevance', 'Most Popular', 'Latest', 'Top Rated', 'Most Episodes'];
const statuses = ['All', 'Ongoing', 'Completed'];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { darkMode, searchHistory, addSearchHistory } = useApp();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('Relevance');
  const [status, setStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q) search(q);
  }, [searchParams]);

  const search = (q) => {
    if (!q.trim()) { setResults([]); return; }
    const filtered = webtoons.filter(w =>
      w.title.toLowerCase().includes(q.toLowerCase()) ||
      w.author.toLowerCase().includes(q.toLowerCase()) ||
      w.genre.toLowerCase().includes(q.toLowerCase()) ||
      w.description.toLowerCase().includes(q.toLowerCase())
    );
    setResults(filtered);
    addSearchHistory(q);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
      search(query);
    }
  };

  const applyFilter = () => {
    let filtered = [...results];
    if (genre !== 'All') filtered = filtered.filter(w => w.genre === genre);
    if (status !== 'All') filtered = filtered.filter(w => w.status === status);
    if (sort === 'Most Popular') filtered.sort((a, b) => b.views - a.views);
    else if (sort === 'Top Rated') filtered.sort((a, b) => b.rating - a.rating);
    else if (sort === 'Latest') filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    return filtered;
  };

  const filtered = applyFilter();
  const hasQuery = !!searchParams.get('q');

  return (
    <div className={`min-h-screen pt-20 pb-20 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search webtoons, authors, genres..."
              className={`w-full pl-14 pr-14 py-4 text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                darkMode ? 'bg-gray-900 border border-white/10 text-white placeholder-gray-500' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 shadow-lg'
              }`}
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults([]); }} className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={() => setShowFilters(p => !p)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${showFilters ? 'text-indigo-400' : 'text-gray-400 hover:text-gray-600'}`}>
              <Filter className="w-5 h-5" />
            </button>
          </form>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="max-w-2xl mx-auto mt-4 overflow-hidden">
                <div className={`p-4 rounded-xl border space-y-4 ${darkMode ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div>
                    <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>GENRE</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.map(g => (
                        <button key={g} onClick={() => setGenre(g)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${genre === g ? 'bg-indigo-500 text-white' : darkMode ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>STATUS</p>
                      <div className="flex gap-2">
                        {statuses.map(s => (
                          <button key={s} onClick={() => setStatus(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${status === s ? 'bg-indigo-500 text-white' : darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>SORT BY</p>
                      <div className="flex flex-wrap gap-2">
                        {sorts.map(s => (
                          <button key={s} onClick={() => setSort(s)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sort === s ? 'bg-purple-500 text-white' : darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* No search — show suggestions */}
        {!hasQuery && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-10">
            {/* Popular Searches */}
            <motion.div variants={staggerItem}>
              <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Popular Searches
              </h3>
              <div className="flex flex-wrap gap-3">
                {popularSearches.map(s => (
                  <button key={s} onClick={() => { setSearchParams({ q: s }); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${darkMode ? 'bg-white/10 text-gray-300 hover:bg-indigo-500/30 hover:text-indigo-300' : 'bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>

            {searchHistory.length > 0 && (
              <motion.div variants={staggerItem}>
                <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Clock className="w-5 h-5 text-purple-400" /> Recent Searches
                </h3>
                <div className="flex flex-wrap gap-3">
                  {searchHistory.map(s => (
                    <button key={s} onClick={() => setSearchParams({ q: s })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${darkMode ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}`}>
                      <Clock className="w-3 h-3" />{s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Mood Tags */}
            <motion.div variants={staggerItem}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Browse by Mood</h3>
              <div className="flex flex-wrap gap-3">
                {moodTags.map(tag => (
                  <button key={tag.label} onClick={() => setSearchParams({ q: tag.label })}
                    className={`px-4 py-2 rounded-full text-sm text-white font-medium transition-all hover:scale-105 ${tag.color}`}>
                    {tag.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Results */}
        {hasQuery && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-6">
              <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {filtered.length > 0 ? `${filtered.length} results for "${searchParams.get('q')}"` : `No results for "${searchParams.get('q')}"`}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Search className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                </motion.div>
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nothing found</h3>
                <p className={`mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Try different keywords or browse our popular searches</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularSearches.slice(0, 5).map(s => (
                    <button key={s} onClick={() => setSearchParams({ q: s })}
                      className="px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-full text-sm hover:bg-indigo-500/30 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <WebtoonGrid webtoons={filtered} />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
