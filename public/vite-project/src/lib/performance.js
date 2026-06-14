// Performance optimization utilities for React components

import { useEffect, useRef, useCallback, useMemo } from 'react';

// Throttle function for scroll/resize events
export const throttle = (func, delay = 100) => {
  let timeoutId;
  let lastRan;
  
  return function (...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (Date.now() - lastRan >= delay) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, delay - (Date.now() - lastRan));
    }
  };
};

// Debounce function for inputs/searches
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Custom hook for intersection observer (lazy loading images)
export const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin]);

  return [ref, isIntersecting];
};

// Custom hook for lazy loading images
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return { imageSrc, isLoading };
};

// Memoized component wrapper
export const createMemoizedComponent = (Component, propsAreEqual) => {
  return React.memo(Component, propsAreEqual);
};

// Performance monitoring helper
export const measurePerformance = (componentName) => {
  if (typeof window === 'undefined' || !window.performance) return;

  const start = performance.now();

  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16.67) { // More than one frame (60fps)
      console.warn(`⚠️ ${componentName} render took ${duration.toFixed(2)}ms`);
    }
  };
};

// Optimize event handlers
export const useOptimizedCallback = (callback, dependencies) => {
  return useCallback(callback, dependencies);
};

// Optimize computed values
export const useOptimizedMemo = (factory, dependencies) => {
  return useMemo(factory, dependencies);
};

// Request Animation Frame hook for smooth animations
export const useAnimationFrame = (callback, dependencies = []) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, dependencies);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);
};

// Virtualization helper for long lists
export const getVisibleItems = (items, scrollTop, containerHeight, itemHeight) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
  
  return {
    startIndex: Math.max(0, startIndex - 2), // Add buffer
    endIndex: Math.min(items.length, endIndex + 2), // Add buffer
    visibleItems: items.slice(
      Math.max(0, startIndex - 2),
      Math.min(items.length, endIndex + 2)
    )
  };
};

// Image optimization helper
export const optimizeImageUrl = (url, width = 400, quality = 80) => {
  if (!url) return '';
  
  // For external URLs (Unsplash, etc.)
  if (url.includes('unsplash.com')) {
    return `${url}&w=${width}&q=${quality}&fm=webp&fit=crop`;
  }
  
  return url;
};

// Cache helper for API responses
const cache = new Map();

export const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCachedData = (key, data, ttl = 60000) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

export const clearCache = () => {
  cache.clear();
};
