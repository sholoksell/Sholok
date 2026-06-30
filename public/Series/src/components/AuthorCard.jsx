import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function AuthorCard({ author }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link
        to={`/authors/${author.id}`}
        className="flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-white p-5 text-center shadow-soft dark:border-white/10 dark:bg-white/5"
      >
        <div
          className={`grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br ${author.gradient} text-2xl font-bold text-white shadow-glow`}
        >
          {author.photoInitial}
        </div>
        <div>
          <p className="font-semibold text-brand-950 dark:text-white">{author.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{author.booksCount} টি বই</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default AuthorCard;
