import { motion } from 'framer-motion';
import Breadcrumb from '../components/Breadcrumb';
import CategoryCard from '../components/CategoryCard';
import { categories } from '../data/categories';
import { books } from '../data/books';

function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'বিষয়সমূহ' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">সকল বিষয়</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">আপনার পছন্দের ক্যাটাগরি বেছে নিয়ে বই খুঁজুন</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((c, i) => {
          const count = books.filter((b) => b.categorySlug === c.slug).length;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative"
            >
              <CategoryCard category={c} />
              <span className="absolute -top-2 right-2 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-700 shadow dark:bg-brand-950 dark:text-gold-400">
                {count}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoriesPage;
