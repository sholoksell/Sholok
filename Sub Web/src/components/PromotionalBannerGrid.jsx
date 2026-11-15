import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BANNERS = [
  {
    img: '/banner-women.jpg',
    tag: "Women's Fashion",
    title: 'New Season Styles',
    copy: 'Refresh your wardrobe with modern essentials.',
    cta: 'Shop Women',
    link: '/category/womens-clothing',
  },
  {
    img: '/banner-men.jpg',
    tag: "Men's Fashion",
    title: 'Everyday Comfort, Elevated',
    copy: 'Casual looks made for every day.',
    cta: 'Shop Men',
    link: '/category/mens-clothing',
  },
  {
    img: '/banner-home.jpg',
    tag: 'Home & Kitchen',
    title: 'Make Home Feel Better',
    copy: 'Thoughtful essentials for everyday living.',
    cta: 'Shop Home',
    link: '/category/home-kitchen',
  },
  {
    img: '/banner-baby.jpg',
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
        <Link
          key={b.title}
          to={b.link}
          className="group relative h-72 overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow block"
        >
          {/* Full background image */}
          <img
            src={b.img}
            alt={b.tag}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />

          {/* Gradient overlay — bottom-heavy for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

          {/* Text content — bottom aligned */}
          <div className="absolute inset-0 flex flex-col justify-end gap-1.5 p-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sale">{b.tag}</span>
            <h3 className="text-base font-bold leading-tight text-white">{b.title}</h3>
            <p className="text-[11px] text-white/75 leading-snug line-clamp-2">{b.copy}</p>
            <span className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-white group-hover:text-sale transition-colors">
              {b.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
