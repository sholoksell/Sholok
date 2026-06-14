import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const CategorySection = ({ 
  title, 
  titleBn, 
  products, 
  viewAllLink, 
  bgColor = 'bg-white',
  gradient = false,
  emoji = '',
  maxProducts = 6
}) => {
  const { t } = useLanguage();
  
  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, maxProducts);

  return (
    <section className={`${gradient ? 'bg-gradient-to-r ' + bgColor : bgColor} rounded-xl p-4 md:p-6 shadow-md hover:shadow-xl transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl md:text-2xl font-bold text-gray-900 uppercase flex items-center gap-2"
        >
          {emoji && <span className="text-3xl">{emoji}</span>}
          <span>{t('language') === 'bn' && titleBn ? titleBn : title}</span>
        </motion.h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink} 
            className="text-sm font-bold text-[#E31E24] hover:text-[#b9151a] hover:underline flex items-center gap-1 transition-all group"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {displayProducts.map((product, i) => (
          <motion.div
            key={product._id || product.id || i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
