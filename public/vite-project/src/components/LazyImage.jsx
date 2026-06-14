// Optimized lazy loading image component with animations
import React, { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';

const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f3f4f6"/%3E%3C/svg%3E',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageError(true);
      return;
    }

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageError(true);
      setImageSrc('https://via.placeholder.com/400x400?text=No+Image');
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: imageLoaded ? 1 : 0,
          scale: imageLoaded ? 1 : 1.1
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        loading="lazy"
        {...props}
      />
      
      {!imageLoaded && !imageError && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
