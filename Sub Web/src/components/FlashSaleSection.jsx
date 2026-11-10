import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

function useCountdown(endMs) {
  const [left, setLeft] = useState(Math.max(0, endMs - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endMs]);
  return left;
}

function CountdownBlock({ ms }) {
  if (ms === 0) return <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-500">Sale Ended</span>;
  const s = Math.floor(ms / 1000);
  const parts = [
    [Math.floor(s / 86400), 'Days'],
    [Math.floor((s % 86400) / 3600), 'Hrs'],
    [Math.floor((s % 3600) / 60), 'Min'],
    [s % 60, 'Sec'],
  ];
  return (
    <div className="flex items-center gap-1.5" role="timer" aria-label="Time left in flash sale">
      <span className="mr-1 text-xs font-medium text-gray-500">Ends in</span>
      {parts.map(([v, l]) => (
        <span key={l} className="flex min-w-11 flex-col items-center rounded-lg bg-sale px-1.5 py-1 text-white">
          <span className="text-base font-bold tabular-nums leading-none">{String(v).padStart(2, '0')}</span>
          <span className="text-[9px] uppercase tracking-wide opacity-90">{l}</span>
        </span>
      ))}
    </div>
  );
}

export default function FlashSaleSection({ products = [] }) {
  // Flash sale ends at midnight tomorrow
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 0);
  const endMs = tomorrow.getTime();
  const left = useCountdown(endMs);

  if (!products || products.length === 0) return null;
  const items = products.slice(0, 10);

  return (
    <section className="rounded-2xl border border-sale/20 bg-sale-soft p-4 md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold md:text-[28px] flex items-center gap-2">
            <Zap className="h-6 w-6 fill-sale text-sale" /> Flash Sale
          </h2>
          <p className="mt-1 text-sm text-gray-500">Limited-time deals on selected products.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CountdownBlock ms={left} />
          <Link to="/flash-sale" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((product, i) => (
          <ProductCard key={product._id || product.id || i} product={product} />
        ))}
      </div>
    </section>
  );
}
