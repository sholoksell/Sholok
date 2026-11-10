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
        <article key={b.title} className="group relative h-48 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={b.img}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover object-right transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
          <div className="relative flex h-full max-w-[65%] flex-col justify-center gap-1.5 p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sale">{b.tag}</span>
            <h3 className="text-lg font-bold leading-snug text-primary-deep">{b.title}</h3>
            <p className="text-xs text-gray-600">{b.copy}</p>
            <Link
              to={b.link}
              className="mt-1 flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {b.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
