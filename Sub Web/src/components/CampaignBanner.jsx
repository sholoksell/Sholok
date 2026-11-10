import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CampaignBanner() {
  return (
    <section className="group relative overflow-hidden rounded-2xl bg-gray-100">
      <img
        src="/campaign.jpg"
        alt="Everyday style campaign"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-right transition-transform duration-700 group-hover:scale-[1.02]"
      />
      {/* Left-to-right scrim */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.55) 45%, transparent 75%)' }} />
      <div className="relative flex min-h-72 max-w-xl flex-col justify-center gap-2 p-6 md:min-h-80 md:p-14">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-sale">Special Seasonal Offer</span>
        <h2 className="text-4xl font-extrabold tracking-tight text-primary-deep md:text-5xl">EVERYDAY STYLE</h2>
        <p className="text-lg font-semibold text-gray-700 md:text-xl">Discover More, Love More</p>
        <p className="text-base text-gray-700">
          Save up to{' '}
          <span className="rounded-md bg-sale px-2 py-0.5 text-xl font-bold text-white">20% OFF</span>
        </p>
        <Link
          to="/category/fashion-lifestyle"
          className="mt-3 flex w-fit items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
