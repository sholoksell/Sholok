import React, { memo } from 'react';
import ProductCard from './ProductCard';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductSection = memo(({ title, subtitle, products, viewAllLink, icon }) => {
  if (!products || products.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05
      }
    }
  };

  return (
    <motion.section 
      className="py-8"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <motion.span 
              className="text-3xl"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              {icon}
            </motion.span>
          )}
          <div>
            <motion.h2 
              className="text-2xl font-bold text-foreground"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p 
                className="text-sm text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        </div>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <motion.div
              className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 text-sm"
              whileHover={{ x: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </Link>
        )}
      </motion.div>
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {products.slice(0, 12).map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </motion.div>
    </motion.section>
  );
});

ProductSection.displayName = 'ProductSection';

export default ProductSection;
