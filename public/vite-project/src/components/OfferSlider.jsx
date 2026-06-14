import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import grocerySlider from '@/images_sholok/grocery-slider.jpg';
import spiceSlider from '@/images_sholok/spice-slider.jpg';

const OfferSlider = () => {
  const slides = [
    {
      id: 1,
      image: grocerySlider,
      alt: 'Grocery Offers'
    },
    {
      id: 2,
      image: spiceSlider,
      alt: 'Spice Offers'
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative w-full max-w-full mx-auto overflow-hidden rounded-lg shadow-xl bg-white">
      {/* Carousel Container */}
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
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: '400px' }}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
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

      {/* Dot Indicators */}
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
