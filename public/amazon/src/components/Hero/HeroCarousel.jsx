import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { heroSlides } from '../../data/heroSlides';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const HeroSlide = ({ slide }) => (
  <div
    className="relative w-full flex items-center justify-center overflow-hidden"
    style={{ background: slide.bg, minHeight: '460px' }}
  >
    {/* Decorative blobs */}
    <div
      className="absolute right-10 top-1/2 -translate-y-1/2 text-[180px] opacity-10 select-none hidden md:block"
      aria-hidden
    >
      {slide.image}
    </div>
    <div className="absolute top-6 right-6 flex gap-3 opacity-20 text-5xl hidden lg:flex" aria-hidden>
      {slide.decorElements?.map((el, i) => (
        <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>{el}</span>
      ))}
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-[1800px] w-full px-8 md:px-16 py-12">
      {/* Badge */}
      {slide.badge && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-block px-3 py-1 text-xs font-bold tracking-widest rounded mb-4"
            style={{ background: slide.accent, color: '#0F1111' }}
          >
            {slide.badge}
          </span>
        </motion.div>
      )}

      <motion.h1
        className="text-4xl md:text-6xl font-extrabold leading-tight mb-3"
        style={{ color: slide.textColor }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {slide.title}
      </motion.h1>

      <motion.p
        className="text-2xl md:text-3xl font-bold mb-2"
        style={{ color: slide.accent }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {slide.subtitle}
      </motion.p>

      <motion.p
        className="text-base md:text-lg opacity-80 mb-8 max-w-md"
        style={{ color: slide.textColor }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {slide.description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          to={slide.link}
          className="inline-block px-8 py-3 rounded text-amazon-dark font-bold text-base shadow-lg hover:scale-105 transition-transform duration-200"
          style={{ background: slide.accent }}
        >
          {slide.cta} →
        </Link>
      </motion.div>
    </div>

    {/* Bottom gradient fade for smooth transition to products below */}
    <div
      className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, transparent, rgba(234,237,237,0.8))',
      }}
    />
  </div>
);

const HeroCarousel = () => (
  <div className="w-full relative">
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      loop
      className="w-full"
    >
      {heroSlides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <HeroSlide slide={slide} />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

export default HeroCarousel;
