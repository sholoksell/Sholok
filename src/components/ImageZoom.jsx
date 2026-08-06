import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Simple hover zoom for product cards
export const ImageHoverZoom = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setPosition({ x, y });
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      ref={imageRef}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300"
        style={{
          transformOrigin: `${position.x}% ${position.y}%`,
        }}
        animate={{
          scale: isZoomed ? 1.8 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

// Advanced zoom with magnifier lens for product detail pages
export const ImageMagnifier = ({ 
  src, 
  alt, 
  magnifierHeight = 200,
  magnifierWidth = 200,
  zoomLevel = 3.5,
  className = ''
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);

  const handleMouseEnter = (e) => {
    const { width, height } = e.currentTarget.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e) => {
    const { top, left, width, height } = e.currentTarget.getBoundingClientRect();
    
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    setMagnifierPosition({ x, y });
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowMagnifier(false)}
      ref={imgRef}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain cursor-crosshair"
      />

      {/* Magnifier Lens */}
      {showMagnifier && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${magnifierPosition.y - magnifierHeight / 2}px`,
            left: `${magnifierPosition.x - magnifierWidth / 2}px`,
            opacity: '1',
            border: '4px solid #E31E24',
            backgroundColor: 'white',
            backgroundImage: `url('${src}')`,
            backgroundRepeat: 'no-repeat',
            borderRadius: '50%',
            boxShadow: '0 8px 16px rgba(227, 30, 36, 0.3), 0 0 0 2px white',
            backgroundSize: `${imgSize.width * zoomLevel}px ${imgSize.height * zoomLevel}px`,
            backgroundPositionX: `${-magnifierPosition.x * zoomLevel + magnifierWidth / 2}px`,
            backgroundPositionY: `${-magnifierPosition.y * zoomLevel + magnifierHeight / 2}px`,
          }}
        />
      )}

      {/* Zoom Indicator */}
      <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 backdrop-blur-sm">
        <ZoomIn className="h-3 w-3" />
        Hover to zoom
      </div>
    </div>
  );
};

// Full-screen image modal with zoom
export const ImageZoomModal = ({ images = [], initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={scale <= 1}
          >
            <span className="text-2xl font-bold">-</span>
          </button>
          <span className="text-white font-semibold min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={scale >= 3}
          >
            <span className="text-2xl font-bold">+</span>
          </button>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Image */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-5xl max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            src={images[currentIndex]}
            alt={`Product ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain"
            animate={{ scale }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'center' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageMagnifier;
