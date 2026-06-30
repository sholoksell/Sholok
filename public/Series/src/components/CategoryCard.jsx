import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function CategoryCard({ category }) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link
        to={`/categories/${category.slug}`}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br ${category.color} p-6 text-center shadow-soft transition-shadow hover:shadow-glow`}
      >
        <span className="text-3xl">{category.icon}</span>
        <span className="text-sm font-semibold text-white">{category.name}</span>
      </Link>
    </motion.div>
  );
}

export default CategoryCard;
