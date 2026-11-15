import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const SLIDE_META = [
  {
    img: '/uploads/supreme-digital-lawn-vol-01.jpg',
    eyebrow: 'New Season Edit',
    title: 'Discover Your Everyday Style',
    copy: 'Fresh silhouettes and easy favourites for every day of the week.',
    cta: 'Shop Now',
    link: '/category/womens-clothing',
    secondary: { label: 'Explore Lifestyle', link: '/category/fashion-lifestyle' },
    gradient: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 40%, #ddd6fe 100%)',
    accentGradient: 'linear-gradient(135deg, #5D0096 0%, #7c3aed 100%)',
  },
  {
    img: '/uploads/supreme-digital-lawn-vol-01-3.jpg',
    eyebrow: 'Top Picks',
    title: 'Style, Beauty & More — All in One Place',
    copy: 'Curated collections to suit every taste and occasion.',
    cta: 'Explore Collection',
    link: '/category/beauty-makeup',
    secondary: { label: 'View All', link: '/categories' },
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 40%, #fecdd3 100%)',
    accentGradient: 'linear-gradient(135deg, #D31710 0%, #be123c 100%)',
  },
  {
    img: '/uploads/supreme-digital-lawn-vol-01-5.jpg',
    eyebrow: 'Trending Now',
    title: 'Find Your New Favorites',
    copy: 'Bestselling pieces loved by thousands of shoppers.',
    cta: 'Shop Trending',
    link: '/flash-sales',
    gradient: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #a7f3d0 100%)',
    accentGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
];

const AUTO_PLAY_MS = 6000;

export default function HomeBannerCarousel() {
  const [slides, setSlides] = useState(SLIDE_META);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    async function loadImages() {
      // 1) Try banner API
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        const banners = data.banners || data.data || [];
        if (banners.length > 0) {
          setSlides(banners.map((b, i) => ({
            img: b.image || b.imageUrl || b.thumbnail,
            eyebrow: b.tag || b.subtitle || SLIDE_META[i % SLIDE_META.length].eyebrow,
            title: b.title || SLIDE_META[i % SLIDE_META.length].title,
            copy: b.description || SLIDE_META[i % SLIDE_META.length].copy,
            cta: b.buttonText || 'Shop Now',
            link: b.link || b.url || '/',
            gradient: SLIDE_META[i % SLIDE_META.length].gradient,
            accentGradient: SLIDE_META[i % SLIDE_META.length].accentGradient,
          })));
          return;
        }
      } catch {}

      // If banner API returns nothing, SLIDE_META with hardcoded images is used
    }
    loadImages();
  }, []);

  const go = useCallback((n) => {
    setCurrent((n + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(current + 1), AUTO_PLAY_MS);
    return () => clearTimeout(t);
  }, [current, paused, go]);

  return (
    <section
      className="relative overflow-hidden rounded-xl min-h-[280px] md:min-h-[600px] flex-1"
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
      {slides.map((s, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== current}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          style={{ background: s.gradient }}
        >
          {/* Decorative circles visible until image loads */}
          <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full opacity-20" style={{ background: s.accentGradient }} />
            <div className="absolute right-20 bottom-10 h-56 w-56 rounded-full opacity-15" style={{ background: s.accentGradient }} />
            <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full opacity-10" style={{ background: s.accentGradient }} />
          </div>

          {s.img && (
            <div className="absolute right-0 top-0 h-full w-1/2 md:w-[55%] flex items-center justify-center overflow-hidden">
              <img
                src={s.img}
                alt=""
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-contain object-center drop-shadow-xl"
                onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Gradient scrim for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />

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
        {slides.map((_, idx) => (
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
