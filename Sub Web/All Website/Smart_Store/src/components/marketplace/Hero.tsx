import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { heroSlides } from "@/data/mockData";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const images = [hero1, hero2, hero3];

export default function Hero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[i];

  return (
    <section className="container pt-4 lg:pt-8">
      <div className={`relative overflow-hidden rounded-4xl bg-gradient-to-br ${slide.gradient} transition-colors duration-700`}>
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/30 blur-3xl pointer-events-none" />

        <div className="relative grid lg:grid-cols-2 items-center gap-8 p-8 sm:p-12 lg:p-16 min-h-[480px] lg:min-h-[560px]">
          {/* Text */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-semibold mb-6">
                  <Sparkles className="w-3 h-3 text-accent" />
                  {slide.eyebrow}
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight whitespace-pre-line text-foreground">
                  {slide.title}
                </h1>
                <p className="mt-5 text-base lg:text-lg text-foreground/70 max-w-md leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="group h-12 px-6 rounded-2xl bg-foreground text-background font-semibold text-sm flex items-center gap-2 shadow-elegant"
                  >
                    {slide.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <button className="h-12 px-6 rounded-2xl glass font-semibold text-sm">
                    Explore stores
                  </button>
                </div>

                {/* Stats */}
                <div className="mt-10 flex gap-8">
                  {[
                    { v: "12K+", l: "Trusted stores" },
                    { v: "2M+", l: "Happy buyers" },
                    { v: "4.9★", l: "Avg rating" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-2xl font-bold">{s.v}</div>
                      <div className="text-xs text-foreground/60">{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Image */}
          <div className="relative h-72 sm:h-96 lg:h-full lg:min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <img
                  src={images[i]}
                  alt={slide.title}
                  className="w-full h-full object-cover rounded-3xl shadow-elegant"
                />
                {/* Floating glass card */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-6 left-6 glass rounded-2xl p-4 max-w-[220px] shadow-card"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-semibold">Insight</span>
                  </div>
                  <p className="text-xs text-foreground/70 leading-snug">
                    Buyers like you save 23% by following trending stores.
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === i ? "w-10 bg-foreground" : "w-1.5 bg-foreground/30"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
