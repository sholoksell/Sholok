import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Bookmark, BookOpenCheck, Calendar, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import BookCover from '../components/BookCover';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';
import { books } from '../data/books';
import { authors } from '../data/authors';
import { publishers } from '../data/publishers';
import { getReviewsForBook } from '../data/reviews';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../components/Toast';

function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === id);
  const { isFavorite, toggleFavorite, isBookmarked, toggleBookmark, addToHistory } = useLibrary();
  const { showToast } = useToast();

  useEffect(() => {
    if (book) addToHistory(book.id);
  }, [book, addToHistory]);

  if (!book) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState title="বইটি খুঁজে পাওয়া যায়নি" subtitle="অন্য বই দেখুন" />
      </div>
    );
  }

  const author = authors.find((a) => a.id === book.authorId);
  const publisher = publishers.find((p) => p.id === book.publisherId);
  const related = books.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 5);
  const bookReviews = getReviewsForBook(book.id);
  const fav = isFavorite(book.id);
  const marked = isBookmarked(book.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'বিষয়', to: '/categories' }, { label: book.category, to: `/categories/${book.categorySlug}` }, { label: book.title }]} />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <BookCover title={book.title} gradient={book.gradient} className="aspect-[3/4] w-full" textSize="text-xl" />
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => navigate(`/read/${book.id}`)}
              className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              <BookOpenCheck size={18} />
              পাঠ শুরু করুন
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(book.id);
                  showToast(fav ? 'পছন্দের তালিকা থেকে সরানো হয়েছে' : 'পছন্দের তালিকায় যোগ হয়েছে');
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 px-3 py-2.5 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300"
              >
                <Heart size={16} className={fav ? 'fill-rose-500 text-rose-500' : ''} />
                পছন্দ
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleBookmark(book.id);
                  showToast(marked ? 'বুকমার্ক সরানো হয়েছে' : 'বুকমার্ক করা হয়েছে');
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 px-3 py-2.5 text-sm font-medium text-gray-600 dark:border-white/10 dark:text-gray-300"
              >
                <Bookmark size={16} className={marked ? 'fill-brand-500 text-brand-500' : ''} />
                বুকমার্ক
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h1 className="text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">{book.title}</h1>
          {author && (
            <Link to={`/authors/${author.id}`} className="mt-2 inline-block text-brand-600 hover:underline dark:text-gold-400">
              লেখক: {author.name}
            </Link>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-gold-600">
              <Star size={16} className="fill-gold-500 text-gold-500" />
              {book.rating} ({book.reviewCount} রিভিউ)
            </span>
            <span className="flex items-center gap-1">
              <FileText size={15} />
              {book.pages} পৃষ্ঠা
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={15} />
              {book.year}
            </span>
            <span className="flex items-center gap-1">
              <Globe size={15} />
              {book.language}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            {book.isFree ? (
              <span className="text-2xl font-bold text-emerald2-600">ফ্রি</span>
            ) : book.isDiscounted ? (
              <>
                <span className="text-2xl font-bold text-brand-700 dark:text-brand-300">৳{book.discountedPrice}</span>
                <span className="text-gray-400 line-through">৳{book.price}</span>
                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-700">-{book.discountPercent}%</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-brand-700 dark:text-brand-300">৳{book.price}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-gray-600 dark:text-gray-300">{book.longDescription}</p>

          {publisher && (
            <Link
              to={`/publishers/${publisher.id}`}
              className="mt-4 inline-block rounded-xl border border-black/5 px-4 py-2 text-sm text-gray-600 hover:border-brand-300 dark:border-white/10 dark:text-gray-300"
            >
              প্রকাশনী: {publisher.name}
            </Link>
          )}

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-brand-950 dark:text-white">সূচিপত্র</h2>
            <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {book.tableOfContents.map((chapter, i) => (
                <li key={i} className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  {chapter}
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-brand-950 dark:text-white">সম্পর্কিত বই</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {related.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 mb-6">
        <h2 className="mb-5 text-xl font-bold text-brand-950 dark:text-white">পাঠকদের রিভিউ ({bookReviews.length})</h2>
        {bookReviews.length === 0 ? (
          <EmptyState title="এখনো কোনো রিভিউ নেই" subtitle="প্রথম রিভিউ দিন" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bookReviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BookDetailsPage;
