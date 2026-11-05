import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronRight as Arrow } from "lucide-react";
import { Link } from "react-router-dom";
import { categoriesApi } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    eyebrow: "THE NEW SEASON EDIT",
    title: "Find your everyday style.",
    subtitle: "Fresh looks and thoughtful essentials, all in one place.",
    cta: "Explore Collection",
    ctaHref: "/search?featured=1",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80&auto=format&fit=crop",
    gradient: "from-purple-50 to-pink-50",
  },
  {
    eyebrow: "DETAILS THAT MATTER",
    title: "Make every moment count.",
    subtitle: "Discover lifestyle picks made for your pace.",
    cta: "Shop Trending",
    ctaHref: "/search?sort=popular",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400&q=80&auto=format&fit=crop",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    eyebrow: "MOVE YOUR WAY",
    title: "Comfort meets confidence.",
    subtitle: "Explore versatile essentials for every day.",
    cta: "Shop Now",
    ctaHref: "/search",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=1400&q=80&auto=format&fit=crop",
    gradient: "from-orange-50 to-yellow-50",
  },
];

type Category = { id?: string | number; _id?: string | number; name: string; slug?: string };
const catId = (c: Category) => c._id ?? c.id ?? c.slug ?? "";

export default function HeroSection() {
  const [slide, setSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesApi.list().then((r: any) => {
      const list = r?.categories || r?.data || (Array.isArray(r) ? r : []);
      setCategories(list.slice(0, 12));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setSlide((p) => (p + 1) % SLIDES.length);

  const s = SLIDES[slide];

  return (
    <section className="container pt-4 pb-2">
      <div className="flex gap-0 rounded-lg overflow-hidden border border-border shadow-card" style={{ minHeight: 400 }}>
        {/* Category panel */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-card border-r border-border">
          <div className="flex items-center gap-2 px-4 h-12 border-b border-border bg-secondary">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Shop by Category</span>
          </div>
          <ul className="flex-1 overflow-y-auto py-1">
            {categories.length === 0
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className="mx-2 my-0.5 h-9 rounded bg-muted animate-pulse" />
                ))
              : categories.map((cat) => (
                  <li key={String(catId(cat))}>
                    <Link
                      to={`/search?categoryId=${catId(cat)}`}
                      className="flex items-center justify-between px-4 h-10 text-sm hover:bg-secondary hover:text-primary transition-colors group"
                    >
                      <span>{cat.name}</span>
                      <Arrow className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                    </Link>
                  </li>
                ))}
          </ul>
        </aside>

        {/* Hero slider */}
        <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-purple-50 to-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={s.image}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Text overlay */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide}`}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10 flex flex-col justify-center h-full px-8 py-12 max-w-lg"
            >
              <span className="text-xs font-semibold text-white/80 tracking-widest uppercase mb-3">{s.eyebrow}</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">{s.title}</h1>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">{s.subtitle}</p>
              <Link
                to={s.ctaHref}
                className="inline-flex items-center gap-2 self-start px-6 h-11 rounded-lg bg-[#5D0096] text-white font-semibold text-sm hover:bg-[#4a0078] transition-colors shadow-md"
              >
                {s.cta} <Arrow className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
