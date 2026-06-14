import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/lib/utils';
import CategoryIcon from '@/components/CategoryIcon';

export default function CategoryGrid({ categories, maxItems = 12 }) {
  const displayCategories = categories.slice(0, maxItems);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 12
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {displayCategories.map((category, index) => (
        <motion.div
          key={category._id}
          variants={itemVariants}
          whileHover={{ 
            y: -10,
            transition: { type: "spring", stiffness: 300 }
          }}
        >
          <Link to={`/category/${category.slug}`}>
            <Card className="group hover:shadow-2xl hover:shadow-[#E31E24]/20 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-[#E31E24]/30 relative bg-white hover:bg-gradient-to-br hover:from-white hover:to-red-50/20">
              {/* Animated shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </div>

              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {category.image ? (
                  <motion.img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                    whileHover={{ scale: 1.15, rotate: 2 }}
                  />
                ) : (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <CategoryIcon icon={category.icon} image={category.image} name={category.name} className="w-10 h-10" />
                    </motion.div>
                  </motion.div>
                )}
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#E31E24]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              <div className="p-3 text-center relative z-10">
                <motion.h3 
                  className="font-semibold text-sm group-hover:text-[#E31E24] transition-colors duration-300 line-clamp-2"
                  whileHover={{ scale: 1.05 }}
                >
                  {category.name}
                </motion.h3>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
