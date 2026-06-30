import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Eye, BookOpen } from 'lucide-react';
import BookCover from './BookCover';

function NovelCard({ novel }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-soft dark:border-white/10 dark:bg-white/5"
    >
      <Link to={`/novels/${novel.id}`} className="relative block aspect-[3/4] overflow-hidden">
        <BookCover title={novel.title} gradient={novel.gradient} className="h-full w-full rounded-none" textSize="text-base" />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow ${
            novel.status === 'সম্পূর্ণ' ? 'bg-emerald2-600' : novel.status === 'নতুন' ? 'bg-gold-500 text-brand-950' : 'bg-brand-600'
          }`}
        >
          {novel.status}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link to={`/novels/${novel.id}`} className="line-clamp-2 text-sm font-semibold text-brand-950 hover:text-brand-600 dark:text-white">
          {novel.title}
        </Link>
        <Link to={`/authors/${novel.authorId}`} className="line-clamp-1 text-xs text-gray-500 hover:text-brand-600 dark:text-gray-400">
          {novel.authorName}
        </Link>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1 text-gold-600">
            <Star size={14} className="fill-gold-500 text-gold-500" />
            <span>{novel.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={13} />
            <span>{novel.totalChapters} পর্ব</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={13} />
            <span>{novel.views > 1000 ? `${(novel.views / 1000).toFixed(1)}হা.` : novel.views}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default NovelCard;
