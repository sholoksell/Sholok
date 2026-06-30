import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';
import BookCover from './BookCover';
import { useLibrary } from '../context/LibraryContext';

function BookCard({ book }) {
  const { isFavorite, toggleFavorite } = useLibrary();
  const fav = isFavorite(book.id);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft dark:border-white/10 dark:bg-white/5"
    >
      <Link to={`/book/${book.id}`} className="relative block aspect-[3/4] overflow-hidden">
        <BookCover title={book.title} gradient={book.gradient} className="h-full w-full rounded-none" textSize="text-base" />
        {book.isFree && (
          <span className="absolute left-2 top-2 rounded-full bg-emerald2-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            ফ্রি
          </span>
        )}
        {book.isDiscounted && !book.isFree && (
          <span className="absolute left-2 top-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs font-semibold text-brand-950 shadow">
            -{book.discountPercent}%
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(book.id);
          }}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
        >
          <Heart size={16} className={fav ? 'fill-rose-500 text-rose-500' : ''} />
        </button>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/book/${book.id}`} className="line-clamp-2 text-sm font-semibold text-brand-950 hover:text-brand-600 dark:text-white">
          {book.title}
        </Link>
        <Link to={`/authors/${book.authorId}`} className="line-clamp-1 text-xs text-gray-500 hover:text-brand-600 dark:text-gray-400">
          {book.authorName}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gold-600">
            <Star size={14} className="fill-gold-500 text-gold-500" />
            <span>{book.rating}</span>
            <span className="text-gray-400">({book.reviewCount})</span>
          </div>
          <div className="text-sm font-bold text-brand-700 dark:text-brand-300">
            {book.isFree ? (
              <span className="text-emerald2-600">ফ্রি</span>
            ) : book.isDiscounted ? (
              <span className="flex items-center gap-1">
                <span className="text-xs text-gray-400 line-through">৳{book.price}</span>
                <span>৳{book.discountedPrice}</span>
              </span>
            ) : (
              <span>৳{book.price}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BookCard;
