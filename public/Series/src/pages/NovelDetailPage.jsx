import { useParams, Link } from 'react-router-dom';
import { Star, Eye, BookOpen, Heart } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import BookCover from '../components/BookCover';
import EmptyState from '../components/EmptyState';
import { novels } from '../data/novels';
import { authors } from '../data/authors';
import { useLibrary } from '../context/LibraryContext';

function NovelDetailPage() {
  const { id } = useParams();
  const novel = novels.find((n) => n.id === id);
  const { isFavorite, toggleFavorite } = useLibrary();

  if (!novel) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState title="নভেলটি খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  const author = authors.find((a) => a.id === novel.authorId);
  const fav = isFavorite(novel.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'ওয়েব নভেল', to: '/novels' }, { label: novel.title }]} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <div>
          <BookCover title={novel.title} gradient={novel.gradient} className="aspect-[3/4] w-full" textSize="text-xl" />
          <button
            type="button"
            onClick={() => toggleFavorite(novel.id)}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-black/10 px-3 py-2.5 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300"
          >
            <Heart size={16} className={fav ? 'fill-rose-500 text-rose-500' : ''} />
            পছন্দ তালিকায় যোগ করুন
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">{novel.title}</h1>
          {author && (
            <Link to={`/authors/${author.id}`} className="mt-2 inline-block text-brand-600 hover:underline dark:text-gold-400">
              লেখক: {author.name}
            </Link>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-gold-600">
              <Star size={16} className="fill-gold-500 text-gold-500" />
              {novel.rating}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={15} />
              {novel.totalChapters} পর্ব
            </span>
            <span className="flex items-center gap-1">
              <Eye size={15} />
              {novel.views.toLocaleString('bn-BD')} ভিউ
            </span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-white/10 dark:text-gold-400">
              {novel.status}
            </span>
          </div>
          <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">{novel.description}</p>

          <h2 className="mt-8 mb-3 text-lg font-bold text-brand-950 dark:text-white">পর্বসমূহ</h2>
          <div className="flex flex-col gap-2">
            {novel.chapters.map((ch) => (
              <Link
                key={ch.id}
                to={`/read/${novel.id}`}
                className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-4 py-3 text-sm transition hover:border-brand-300 dark:border-white/10 dark:bg-white/5"
              >
                <span className="text-brand-950 dark:text-white">{ch.title}</span>
                <span className="text-xs text-gray-400">{ch.releaseDate}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NovelDetailPage;
