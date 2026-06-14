// Performance monitoring component for development
import { useEffect } from 'react';

const PerformanceMonitor = ({ enabled = process.env.NODE_ENV === 'development' }) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Monitor FPS
    let lastTime = performance.now();
    let frames = 0;
    let fps = 60;

    const measureFPS = () => {
      const currentTime = performance.now();
      frames++;

      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;

        // Warn if FPS drops below 50
        if (fps < 50) {
          console.warn(`⚠️ Low FPS detected: ${fps} fps`);
        }
      }

      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['longtask', 'measure'] });
      } catch (e) {
        // Browser doesn't support longtask
      }

      return () => {
        observer.disconnect();
        cancelAnimationFrame(rafId);
      };
    }

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return null;
};

export default PerformanceMonitor;
