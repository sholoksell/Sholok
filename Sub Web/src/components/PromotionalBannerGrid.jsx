import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BANNERS = [
  {
    img: '/banner-women.jpg',
    gradient: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 60%, #ede9fe 100%)',
    tag: "Women's Fashion",
    title: 'New Season Styles',
    copy: 'Refresh your wardrobe with modern essentials.',
    cta: 'Shop Women',
    link: '/category/womens-clothing',
  },
  {
    img: '/banner-men.jpg',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 60%, #bfdbfe 100%)',
    tag: "Men's Fashion",
    title: 'Everyday Comfort, Elevated',
    copy: 'Casual looks made for every day.',
    cta: 'Shop Men',
    link: '/category/mens-clothing',
  },
  {
    img: '/banner-home.jpg',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
    tag: 'Home & Kitchen',
    title: 'Make Home Feel Better',
    copy: 'Thoughtful essentials for everyday living.',
    cta: 'Shop Home',
    link: '/category/home-kitchen',
  },
  {
    img: '/banner-baby.jpg',
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 60%, #fdba74 100%)',
    tag: 'Baby Care',
    title: 'Little Things, Big Care',
    copy: 'Explore everyday essentials for little ones.',
    cta: 'Shop Baby Care',
    link: '/category/baby-care',
  },
];

export default function PromotionalBannerGrid() {
  return (
    <section aria-label="Promotions" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {BANNERS.map((b) => (
        <Link key={b.title} to={b.link} className="group flex h-72 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow" style={{ background: b.gradient }}>
          {/* Left: text content */}
          <div className="flex flex-col justify-center gap-2 py-5 pl-5 pr-3 w-[58%] flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sale">{b.tag}</span>
            <h3 className="text-base font-bold leading-tight text-gray-900">{b.title}</h3>
            <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{b.copy}</p>
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-sale transition-colors">
              {b.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
          {/* Right: image */}
          <div className="relative flex-1 overflow-hidden">
            <img
              src={b.img}
              alt={b.tag}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        </Link>
      ))}
    </section>
  );
}
