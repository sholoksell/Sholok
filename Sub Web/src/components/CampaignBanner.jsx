import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CampaignBanner() {
  return (
    <section className="group relative overflow-hidden rounded-2xl bg-[#f0ece8] flex items-stretch min-h-[280px] md:min-h-[380px]">
      {/* Image — right side, full height, zoom on hover */}
      <div className="absolute right-0 top-0 h-full w-[65%] overflow-hidden">
        <img
          src="/campaign.jpg"
          alt="Everyday style campaign"
          loading="lazy"
          className="h-full w-full object-cover object-[center_top] transition-transform duration-1000 ease-out group-hover:scale-110"
        />
      </div>

      {/* Gradient scrim — left-to-right so text stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #f0ece8 0%, #f0ece8 30%, rgba(240,236,232,0.85) 48%, rgba(240,236,232,0.3) 62%, transparent 75%)' }}
      />

      {/* Text content */}
      <div className="relative z-10 flex flex-col justify-center gap-2 p-6 md:p-14 w-[52%]">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-sale">Special Seasonal Offer</span>
        <h2 className="text-4xl font-extrabold tracking-tight text-primary-deep md:text-5xl">EVERYDAY<br />STYLE</h2>
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
