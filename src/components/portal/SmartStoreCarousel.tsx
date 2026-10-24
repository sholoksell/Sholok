import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "/smart-store/assets/hero-1-D7Cj3vzY.jpg",
    eyebrow: "Curated · Spring Edit",
    title: "Discover what you'll\nlove next.",
    subtitle: "Smart recommendations from 12,000+ trusted stores — tailored to your taste.",
    cta: "Shop the edit",
    overlay: "from-black/60 via-black/30 to-transparent",
  },
  {
    id: 2,
    image: "/smart-store/assets/hero-2-CpPilVxR.jpg",
    eyebrow: "Flash Sale · 48 Hours",
    title: "Up to 60% off\nbest sellers.",
    subtitle: "Limited drops from your favorite vendors. Move fast — they go quickly.",
    cta: "See deals",
    overlay: "from-black/65 via-black/35 to-transparent",
  },
  {
    id: 3,
    image: "/smart-store/assets/hero-3-DljjT5_Y.jpg",
    eyebrow: "New · Live Shopping",
    title: "Watch, chat,\nbuy live.",
    subtitle: "Join interactive streams from top sellers and shop in real-time.",
    cta: "Go live",
    overlay: "from-black/60 via-black/30 to-transparent",
  },
];

const AUTO_PLAY_MS = 4500;

const SmartStoreCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((dir: "left" | "right") => {
    setCurrent((c) =>
      dir === "right" ? (c + 1) % SLIDES.length : (c - 1 + SLIDES.length) % SLIDES.length
    );
  }, []);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setTimeout(() => go("right"), AUTO_PLAY_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, isPaused, go]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? "right" : "left");
    touchStartX.current = null;
  };

  return (
    <div className="w-full py-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Smart Store</h2>
          <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">
            Bangladesh
          </span>
        </div>
        <a
          href="/smart-store/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Visit Store <ChevronRight className="w-4 h-4" />
        </a>
      </div>

      {/* Carousel — fixed height, prevents clipping on mobile */}
      <a
        href="/smart-store/"
        className="block relative overflow-hidden rounded-2xl select-none cursor-pointer min-h-[200px] sm:min-h-[240px] lg:min-h-[290px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* All slides rendered together — switching via opacity avoids image re-fetching */}
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : 1 }}
          >
            {/* Background image */}
            <img
              src={s.image}
              alt={s.eyebrow}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />

            {/* Text content */}
            <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 py-6 sm:py-8 max-w-lg">
              <span className="inline-block mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/80 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full w-fit">
                {s.eyebrow}
              </span>

              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-2 sm:mb-3"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.4)", whiteSpace: "pre-line" }}
              >
                {s.title}
              </h3>

              <p className="hidden sm:block text-sm text-white/75 mb-4 leading-relaxed">
                {s.subtitle}
              </p>

              <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-gray-900 rounded-full font-bold text-sm w-fit transition-all duration-200 hover:scale-105 hover:shadow-lg">
                {s.cta} <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}

        {/* Progress bar — keyed to current so animation restarts on each slide */}
        {!isPaused && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
            <div
              key={`progress-${current}`}
              className="h-full bg-white/50 origin-left"
              style={{ animation: `ssProgress ${AUTO_PLAY_MS}ms linear forwards` }}
            />
          </div>
        )}

        {/* Prev / Next arrows */}
        <button
          onClick={(e) => { e.preventDefault(); go("left"); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); go("right"); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/25 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Dot navigation */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={(e) => { e.preventDefault(); goTo(i); }}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? "20px" : "7px",
                height: "7px",
                background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </div>
      </a>

      <style>{`
        @keyframes ssProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SmartStoreCarousel;
