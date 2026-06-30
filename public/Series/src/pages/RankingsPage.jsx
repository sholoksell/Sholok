import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Tabs from '../components/Tabs';
import BookCover from '../components/BookCover';
import { books } from '../data/books';

const TABS = [
  { value: 'daily', label: 'দৈনিক' },
  { value: 'weekly', label: 'সাপ্তাহিক' },
  { value: 'monthly', label: 'মাসিক' },
];

function bnNum(n) {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n)
    .split('')
    .map((d) => (map[d] !== undefined ? map[d] : d))
    .join('');
}

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function RankingsPage() {
  const rankings = useMemo(
    () => ({
      daily: seededShuffle(books, 1).sort((a, b) => b.rating - a.rating).slice(0, 20),
      weekly: seededShuffle(books, 2).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 20),
      monthly: seededShuffle(books, 3).sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount).slice(0, 20),
    }),
    []
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb items={[{ label: 'র‍্যাঙ্কিং' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">বইয়ের র‍্যাঙ্কিং</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">সবচেয়ে জনপ্রিয় বইগুলোর তালিকা</p>

      <Tabs tabs={TABS} defaultTab="daily">
        {(active) => (
          <div className="flex flex-col gap-3">
            {rankings[active].map((book, i) => (
              <Link
                key={book.id}
                to={`/book/${book.id}`}
                className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-soft transition hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    i < 3 ? 'bg-gold-500 text-white' : 'bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-gold-400'
                  }`}
                >
                  {bnNum(i + 1)}
                </span>
                <BookCover title={book.title} gradient={book.gradient} className="h-16 w-12 shrink-0" textSize="text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-semibold text-brand-950 dark:text-white">{book.title}</p>
                  <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{book.authorName}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-sm text-gold-600">
                  <Star size={14} className="fill-gold-500 text-gold-500" />
                  {book.rating}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default RankingsPage;
