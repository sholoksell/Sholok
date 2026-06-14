// High-performance animation configurations using Framer Motion
// Optimized for smooth, fast animations without performance degradation

export const animations = {
  // Page transitions - smooth and fast
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Fade in animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 }
  },

  // Slide from bottom - for cards, products
  slideUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },

  // Slide from right - for sidebars, panels
  slideRight: {
    initial: { x: -40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },

  // Scale animation - for buttons, interactive elements
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
  },

  // Stagger children - for lists, grids
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  },

  // Stagger item - for list items
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  },

  // Hover scale - for cards and buttons
  hoverScale: {
    scale: 1.03,
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Hover lift - subtle elevation effect
  hoverLift: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' }
  },

  // Tap animation - for buttons
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// Optimized variants for complex animations
export const variants = {
  // Page container with stagger
  pageContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  },

  // Card grid with stagger
  gridContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05
      }
    }
  },

  // Individual card
  card: {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  },

  // Hero section
  hero: {
    hidden: { opacity: 0, scale: 0.98 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  },

  // Modal/Dialog
  modal: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  },

  // Sidebar
  sidebar: {
    hidden: { x: '-100%' },
    show: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  }
};

// Performance-optimized transition presets
export const transitions = {
  // Spring physics - natural feel
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },

  // Quick spring - for immediate feedback
  quickSpring: {
    type: 'spring',
    stiffness: 500,
    damping: 35
  },

  // Smooth easing - for most animations
  smooth: {
    duration: 0.3,
    ease: [0.25, 0.1, 0.25, 1]
  },

  // Fast easing - for micro-interactions
  fast: {
    duration: 0.2,
    ease: [0.25, 0.1, 0.25, 1]
  },

  // Bouncy - for attention-grabbing elements
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
};

// Viewport animation settings for scroll-triggered animations
export const viewportOptions = {
  once: true, // Animate only once when entering viewport
  amount: 0.2, // Trigger when 20% is visible
  margin: '0px 0px -100px 0px' // Trigger slightly before entering viewport
};
