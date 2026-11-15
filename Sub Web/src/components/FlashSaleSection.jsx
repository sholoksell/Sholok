import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

function useCountdown(endMs) {
  const [left, setLeft] = useState(Math.max(0, endMs - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endMs]);
  return left;
}

function CountdownBox({ value, label }) {
  return (
    <div className="flex min-w-[52px] flex-col items-center rounded-lg bg-white px-2 py-1.5 shadow-sm">
      <span className="text-xl font-extrabold tabular-nums leading-none text-sale">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </span>
    </div>
  );
}

function CountdownBlock({ ms }) {
  if (ms === 0) return (
    <div className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-2">
      <span className="text-sm font-bold text-white">Sale Ended</span>
    </div>
  );
  const s = Math.floor(ms / 1000);
  const parts = [
    [Math.floor(s / 86400), 'DAYS'],
    [Math.floor((s % 86400) / 3600), 'HRS'],
    [Math.floor((s % 3600) / 60), 'MIN'],
    [s % 60, 'SEC'],
  ];
  return (
    <div className="flex items-center gap-2" role="timer" aria-label="Time left in flash sale">
      <span className="text-xs font-semibold uppercase tracking-widest text-white/80">ENDS IN</span>
      <div className="flex items-center gap-1.5">
        {parts.map(([v, l]) => (
          <CountdownBox key={l} value={v} label={l} />
        ))}
      </div>
    </div>
  );
}

export default function FlashSaleSection({ products = [] }) {
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 0);
  const endMs = tomorrow.getTime();
  const left = useCountdown(endMs);

  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 240, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;
  const items = products.slice(0, 12);

  return (
    <section className="overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, #5D0096 0%, #9b1dcc 40%, #D31710 100%)' }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5">
        {/* Left: title + subtitle */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Zap className="h-5 w-5 fill-white text-white" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold leading-none text-white md:text-[26px]">Flash Sale</h2>
            <p className="mt-0.5 text-xs text-white/70">Up to 25% off — limited-time deals.</p>
          </div>
        </div>

        {/* Right: countdown + View All */}
        <div className="flex flex-wrap items-center gap-4">
          <CountdownBlock ms={left} />
          <Link
            to="/flash-sale"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow hover:bg-primary hover:text-white transition-colors"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Product cards on white background */}
      <div className="relative bg-white px-4 pb-5 pt-4 md:px-6">
        {/* Scroll arrows */}
        {items.length > 5 && (
          <>
            <button
              onClick={() => scroll(-1)}
              className="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}
        <div
          ref={scrollRef}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-3 lg:grid-cols-5 xl:grid-cols-6"
        >
          {items.map((product, i) => (
            <ProductCard key={product._id || product.id || i} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
