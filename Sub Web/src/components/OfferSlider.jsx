import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { bannerService } from '@/services/commonService';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/admin-api';
const resolveImage = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const origin = API_BASE.replace(/\/admin-api\/?$/, '').replace(/\/$/, '');
  return url.startsWith('/') ? `${origin}${url}` : url;
};

const OfferSlider = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    bannerService.getAll({ placement: 'offer_slider', is_active: 1 })
      .then(({ banners = [], data = [] }) => {
        const list = banners.length ? banners : data;
        setSlides(list.map((b, i) => ({
          id: b.id || b._id || i,
          image: resolveImage(b.image || b.imageUrl),
          alt: b.title || b.alt || 'Offer',
          link: b.link || b.url || null,
        })));
      })
      .catch(() => setSlides([]));
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => { if (emblaApi) emblaApi.scrollPrev(); }, [emblaApi]);
  const scrollNext = useCallback(() => { if (emblaApi) emblaApi.scrollNext(); }, [emblaApi]);
  const scrollTo  = useCallback((i)  => { if (emblaApi) emblaApi.scrollTo(i);  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full max-w-full mx-auto overflow-hidden rounded-lg shadow-xl bg-white">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full"
              >
                {slide.link ? (
                  <a href={slide.link}>
                    <img src={slide.image} alt={slide.alt} className="w-full h-auto object-contain" style={{ maxHeight: '400px' }} />
                  </a>
                ) : (
                  <img src={slide.image} alt={slide.alt} className="w-full h-auto object-contain" style={{ maxHeight: '400px' }} />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#E31E24] rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={scrollNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#E31E24] rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 hover:scale-110 z-10 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex
                ? 'w-8 h-2 bg-[#E31E24]'
                : 'w-2 h-2 bg-white/60 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OfferSlider;
