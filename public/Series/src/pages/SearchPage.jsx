import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import NovelCard from '../components/NovelCard';
import AuthorCard from '../components/AuthorCard';
import EmptyState from '../components/EmptyState';
import { books } from '../data/books';
import { novels } from '../data/novels';
import { authors } from '../data/authors';
import { useLibrary } from '../context/LibraryContext';

const FILTERS = [
  { value: 'all', label: 'সব' },
  { value: 'books', label: 'বই' },
  { value: 'novels', label: 'ওয়েব নভেল' },
  { value: 'authors', label: 'লেখক' },
];

function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [filter, setFilter] = useState('all');
  const { searchHistory, addSearchHistory, clearSearchHistory } = useLibrary();

  useEffect(() => {
    setQuery(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timeout = setTimeout(() => {
      setParams({ q }, { replace: true });
      addSearchHistory(q);
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { books: [], novels: [], authors: [] };
    return {
      books: books.filter((b) => b.title.toLowerCase().includes(q) || b.authorName.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)),
      novels: novels.filter((n) => n.title.toLowerCase().includes(q) || n.authorName.toLowerCase().includes(q)),
      authors: authors.filter((a) => a.name.toLowerCase().includes(q)),
    };
  }, [query]);

  const total = results.books.length + results.novels.length + results.authors.length;
  const showBooks = filter === 'all' || filter === 'books';
  const showNovels = filter === 'all' || filter === 'novels';
  const showAuthors = filter === 'all' || filter === 'authors';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'খুঁজুন' }]} />

      <div className="relative mx-auto max-w-2xl">
        <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="বই, লেখক বা নভেল খুঁজুন..."
          className="w-full rounded-full border border-black/10 bg-white py-3.5 pl-12 pr-10 text-brand-950 outline-none ring-brand-400 transition focus:ring-2 dark:border-white/10 dark:bg-white/10 dark:text-white"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" aria-label="মুছুন">
            <X size={18} />
          </button>
        )}
      </div>

      {!query.trim() && searchHistory.length > 0 && (
        <div className="mx-auto mt-6 max-w-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">সাম্প্রতিক অনুসন্ধান</p>
            <button type="button" onClick={clearSearchHistory} className="text-xs text-brand-600 hover:underline dark:text-gold-400">
              সব মুছুন
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm text-brand-700 dark:bg-white/10 dark:text-gold-300"
              >
                <Clock size={13} />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.trim() && (
        <>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f.value ? 'bg-brand-600 text-white' : 'bg-brand-50 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">"{query}" এর জন্য {total} টি ফলাফল পাওয়া গেছে</p>

          {total === 0 ? (
            <EmptyState title="কোনো ফলাফল পাওয়া যায়নি" subtitle="অন্য কিছু খুঁজে দেখুন" />
          ) : (
            <div className="mt-6 flex flex-col gap-10">
              {showBooks && results.books.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold text-brand-950 dark:text-white">বই ({results.books.length})</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {results.books.map((b) => (
                      <BookCard key={b.id} book={b} />
                    ))}
                  </div>
                </div>
              )}
              {showNovels && results.novels.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold text-brand-950 dark:text-white">ওয়েব নভেল ({results.novels.length})</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {results.novels.map((n) => (
                      <NovelCard key={n.id} novel={n} />
                    ))}
                  </div>
                </div>
              )}
              {showAuthors && results.authors.length > 0 && (
                <div>
                  <h2 className="mb-4 text-lg font-bold text-brand-950 dark:text-white">লেখক ({results.authors.length})</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {results.authors.map((a) => (
                      <AuthorCard key={a.id} author={a} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
