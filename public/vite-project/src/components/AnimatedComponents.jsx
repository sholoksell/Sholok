// Animated wrapper components for high-performance animations
import React from 'react';
import { motion } from 'framer-motion';
import { animations, variants, viewportOptions } from '@/lib/animations';

// Page wrapper with fade-in animation
export const AnimatedPage = ({ children, className = '' }) => (
  <motion.div
    initial="hidden"
    animate="show"
    exit="hidden"
    variants={variants.pageContainer}
    className={className}
  >
    {children}
  </motion.div>
);

// Card with hover animation
export const AnimatedCard = React.memo(({ children, className = '', onClick }) => (
  <motion.div
    variants={variants.card}
    whileHover={animations.hoverLift}
    whileTap={animations.tap}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
));

AnimatedCard.displayName = 'AnimatedCard';

// Grid container with stagger animation
export const AnimatedGrid = ({ children, className = '' }) => (
  <motion.div
    variants={variants.gridContainer}
    initial="hidden"
    animate="show"
    className={className}
  >
    {children}
  </motion.div>
);

// List item with stagger animation
export const AnimatedListItem = React.memo(({ children, className = '', index = 0 }) => (
  <motion.div
    variants={animations.staggerItem}
    custom={index}
    className={className}
  >
    {children}
  </motion.div>
));

AnimatedListItem.displayName = 'AnimatedListItem';

// Scroll-triggered animation
export const AnimatedOnScroll = ({ children, className = '', animation = 'slideUp' }) => {
  const animationConfig = animations[animation] || animations.slideUp;

  return (
    <motion.div
      initial={animationConfig.initial}
      whileInView={animationConfig.animate}
      viewport={viewportOptions}
      transition={animationConfig.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Button with tap and hover animation
export const AnimatedButton = React.memo(({ children, className = '', onClick, disabled = false }) => (
  <motion.button
    whileHover={disabled ? {} : { scale: 1.05 }}
    whileTap={disabled ? {} : animations.tap}
    transition={{ duration: 0.2 }}
    className={className}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </motion.button>
));

AnimatedButton.displayName = 'AnimatedButton';

// Modal/Dialog with scale animation
export const AnimatedModal = ({ children, isOpen, className = '' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      variants={variants.modal}
      initial="hidden"
      animate="show"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Sidebar with slide animation
export const AnimatedSidebar = ({ children, isOpen, className = '' }) => {
  return (
    <motion.div
      variants={variants.sidebar}
      initial="hidden"
      animate={isOpen ? 'show' : 'hidden'}
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero section with fade and scale
export const AnimatedHero = ({ children, className = '' }) => (
  <motion.div
    variants={variants.hero}
    initial="hidden"
    animate="show"
    className={className}
  >
    {children}
  </motion.div>
);

// Fade in view wrapper
export const FadeInView = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={viewportOptions}
    transition={{ duration: 0.5, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Scale on hover wrapper
export const ScaleOnHover = React.memo(({ children, className = '', scale = 1.05 }) => (
  <motion.div
    whileHover={{ scale }}
    transition={{ duration: 0.2 }}
    className={className}
  >
    {children}
  </motion.div>
));

ScaleOnHover.displayName = 'ScaleOnHover';

// Slide up on scroll
export const SlideUpOnScroll = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={viewportOptions}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// Parallel animations - multiple elements animating together
export const ParallelAnimate = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Counter animation for numbers
export const AnimatedCounter = ({ value, duration = 1 }) => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {value}
    </motion.span>
  );
};
