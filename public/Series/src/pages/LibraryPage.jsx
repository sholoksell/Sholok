import { Link } from 'react-router-dom';
import { Heart, Bookmark, History, BookOpen } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Tabs from '../components/Tabs';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { books } from '../data/books';
import { useLibrary } from '../context/LibraryContext';

const TABS = [
  { value: 'continue', label: 'পড়া চালিয়ে যান' },
  { value: 'favorites', label: 'পছন্দের তালিকা' },
  { value: 'bookmarks', label: 'বুকমার্ক' },
  { value: 'history', label: 'ইতিহাস' },
];

function findBook(id) {
  return books.find((b) => b.id === id);
}

function LibraryPage() {
  const { favorites, bookmarks, history, continueReading } = useLibrary();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'আমার লাইব্রেরি' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">আমার লাইব্রেরি</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">আপনার পছন্দের বই, বুকমার্ক ও পড়ার ইতিহাস</p>

      <Tabs tabs={TABS} defaultTab="continue">
        {(active) => {
          if (active === 'continue') {
            const items = continueReading.map((c) => ({ ...c, book: findBook(c.bookId) })).filter((c) => c.book);
            return items.length === 0 ? (
              <EmptyState icon={BookOpen} title="এখনো কোনো বই পড়া শুরু করেননি" subtitle="একটি বই বেছে নিয়ে পড়া শুরু করুন" />
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <Link
                    key={item.bookId}
                    to={`/read/${item.bookId}`}
                    className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-semibold text-brand-950 dark:text-white">{item.book.title}</p>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-50 dark:bg-white/10">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${item.progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">{item.progress}% সম্পন্ন</p>
                    </div>
                  </Link>
                ))}
              </div>
            );
          }
          if (active === 'favorites') {
            const items = favorites.map(findBook).filter(Boolean);
            return items.length === 0 ? (
              <EmptyState icon={Heart} title="পছন্দের তালিকা খালি" subtitle="বই পছন্দ করে এখানে যুক্ত করুন" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {items.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            );
          }
          if (active === 'bookmarks') {
            const items = bookmarks.map((b) => findBook(b.bookId)).filter(Boolean);
            return items.length === 0 ? (
              <EmptyState icon={Bookmark} title="কোনো বুকমার্ক নেই" subtitle="পড়ার সময় বুকমার্ক করুন" />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {items.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            );
          }
          const items = history.map((h) => findBook(h.bookId)).filter(Boolean);
          return items.length === 0 ? (
            <EmptyState icon={History} title="পড়ার ইতিহাস খালি" subtitle="বই দেখলে এখানে দেখানো হবে" />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {items.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          );
        }}
      </Tabs>
    </div>
  );
}

export default LibraryPage;
