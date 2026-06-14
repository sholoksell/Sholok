import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Search, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroBanner({ banners }) {
  const { language, getLocalizedField } = useLanguage();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
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

  if (!banners || banners.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[200px] sm:h-[250px] md:h-[280px] lg:h-[320px] bg-gradient-to-r from-[#E31E24] via-[#b9151a] to-[#E31E24] rounded-lg overflow-hidden shadow-2xl"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            animate={{              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.h2 
                className="text-5xl font-bold mb-4 drop-shadow-2xl"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.5)',
                    '0 0 40px rgba(255,255,255,0.8)',
                    '0 0 20px rgba(255,255,255,0.5)'
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Welcome to Sholok
              </motion.h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-2xl mb-8"
            >
              Your One-Stop Online Grocery Store
            </motion.p>

            <motion.div 
              className="flex gap-3 justify-center flex-wrap px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                { icon: '🚚', text: 'Fast Delivery' },
                { icon: '💰', text: 'Best Prices' },
                { icon: '✨', text: 'Fresh Products' }
              ].map((item, index) => (
                <motion.span
                  key={index}
                  className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    y: -5
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  animate={{
                    y: [0, -5, 0]
                  }}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  {item.icon} {item.text}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating sparkles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              opacity: 0
            }}
            animate={{
              y: [null, '-20%', null],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>
    );
  }


  return (
    <motion.div 
      className="relative w-full overflow-hidden rounded-lg shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner, bannerIndex) => (
            <div key={banner.id} className="embla__slide flex-[0_0_100%] min-w-0">
              <motion.div 
                className="relative h-[200px] sm:h-[250px] md:h-[280px] lg:h-[320px] w-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading="lazy"
                  animate={selectedIndex === bannerIndex ? {
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{
                    duration: 10,
                    ease: "easeInOut"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <AnimatePresence mode="wait">
                      {selectedIndex === bannerIndex && (
                        <motion.div
                          key={`banner-${bannerIndex}`}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="max-w-2xl text-white space-y-3 sm:space-y-4 md:space-y-6"
                        >
                          {/* Sale Badge */}
                          {banner.badge && (
                            <motion.div 
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#fec400] to-[#f5b800] text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg"
                            >
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                              </motion.div>
                              {banner.badge}
                            </motion.div>
                          )}
                      
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-2xl"
                      >
                        {language === 'bn' && banner.titleBn ? banner.titleBn : banner.title}
                      </motion.h2>
                      
                      {(banner.subtitle || banner.subtitleBn) && (
                        <motion.p 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="text-sm sm:text-base md:text-xl lg:text-2xl text-white/95 font-medium drop-shadow-lg"
                        >
                          {language === 'bn' && banner.subtitleBn ? banner.subtitleBn : banner.subtitle}
                        </motion.p>
                      )}
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex gap-2 sm:gap-3 pt-1 sm:pt-2"
                      >
                        {banner.link && banner.buttonText && (
                          <a href={banner.link}>
                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                size="lg" 
                                className="bg-gradient-to-r from-[#E31E24] to-[#b9151a] hover:from-[#b9151a] hover:to-[#E31E24] text-white font-bold px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg shadow-2xl hover:shadow-[#E31E24]/50 transition-all duration-500 relative overflow-hidden group"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                                <span className="relative flex items-center gap-2">
                                  {banner.buttonText}
                                  <Sparkles className="h-4 w-4" />
                                </span>
                              </Button>
                            </motion.div>
                          </a>
                        )}
                        {banner.secondaryLink && (
                          <a href={banner.secondaryLink}>
                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                size="lg" 
                                variant="outline" 
                                className="bg-white/10 backdrop-blur-md border-2 border-white text-white hover:bg-white/20 font-bold px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 text-sm sm:text-base md:text-lg transition-all duration-300"
                              >
                                Learn More
                              </Button>
                            </motion.div>
                          </a>
                        )}
                      </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-2xl transition-all z-10 group"
            onClick={scrollPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#E31E24] group-hover:scale-110 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, x: 3 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center shadow-2xl transition-all z-10 group"
            onClick={scrollNext}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#E31E24] group-hover:scale-110 transition-transform" />
          </motion.button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                className={`transition-all rounded-full ${
                  index === selectedIndex
                    ? 'w-8 sm:w-10 h-2 sm:h-2.5 bg-white shadow-lg'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={index === selectedIndex ? {
                  boxShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
