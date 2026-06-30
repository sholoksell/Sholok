import { motion } from 'framer-motion';

function PublisherCard({ publisher }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-white/5"
    >
      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${publisher.gradient} text-lg font-bold text-white`}>
        {publisher.name[0]}
      </div>
      <div>
        <p className="font-semibold text-brand-950 dark:text-white">{publisher.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{publisher.booksCount} টি বই &bull; প্রতিষ্ঠা {publisher.establishedYear}</p>
      </div>
    </motion.div>
  );
}

export default PublisherCard;
