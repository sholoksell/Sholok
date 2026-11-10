import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDES = [
  {
    img: '/hero-1.jpg',
    eyebrow: 'New Season Edit',
    title: 'Discover Your Everyday Style',
    copy: 'Fresh silhouettes and easy favourites for every day of the week.',
    cta: 'Shop Now',
    link: '/category/womens-clothing',
    secondary: { label: 'Explore Lifestyle', link: '/category/fashion-lifestyle' },
  },
  {
    img: '/hero-2.jpg',
    eyebrow: 'Beauty Picks',
    title: 'Style, Beauty & More — All in One Place',
    copy: 'Makeup, skincare and fragrance chosen to make you glow.',
    cta: 'Explore Collection',
    link: '/category/beauty-makeup',
    secondary: { label: 'Personal Care', link: '/category/personal-care' },
  },
  {
    img: '/banner-home.jpg',
    eyebrow: 'Home Refresh',
    title: 'Find Your New Favorites',
    copy: 'Thoughtful home and kitchen essentials that just work.',
    cta: 'Discover More',
    link: '/category/home-kitchen',
  },
];

const AUTO_PLAY_MS = 6000;

export default function HomeBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  const go = useCallback((n) => {
    setCurrent((n + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(current + 1), AUTO_PLAY_MS);
    return () => clearTimeout(t);
  }, [current, paused, go]);

  return (
    <section
      className="relative overflow-hidden rounded-xl bg-primary-soft min-h-[280px] md:min-h-[600px] flex-1"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {SLIDES.map((s, idx) => (
        <div
          key={s.title}
          aria-hidden={idx !== current}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <img
            src={s.img}
            alt=""
            loading={idx === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 w-full h-full object-cover object-right"
          />
          {/* Gradient scrim for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent" />
          <div className="relative flex h-full max-w-xl flex-col justify-center gap-4 p-6 md:p-14 lg:p-16">
            <span className="w-fit rounded-full bg-sale px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
              {s.eyebrow}
            </span>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-primary-deep">
              {s.title}
            </h2>
            <p className="max-w-sm text-sm md:text-base text-gray-700 hidden sm:block">
              {s.copy}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                to={s.link}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 md:px-6 md:py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                tabIndex={idx === current ? 0 : -1}
              >
                {s.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              {s.secondary && (
                <Link
                  to={s.secondary.link}
                  className="rounded-full border border-primary bg-white/70 px-5 py-2.5 md:px-6 md:py-3 text-sm font-semibold text-primary transition-colors hover:bg-white"
                  tabIndex={idx === current ? 0 : -1}
                >
                  {s.secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={() => go(current - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 hidden md:grid place-items-center h-10 w-10 rounded-full bg-white/90 text-primary shadow hover:bg-white z-10"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(current + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:grid place-items-center h-10 w-10 rounded-full bg-white/90 text-primary shadow hover:bg-white z-10"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => go(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === current ? 'w-7 bg-primary' : 'w-2 bg-primary/30'}`}
          />
        ))}
      </div>
    </section>
  );
}
