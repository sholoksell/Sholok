import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    tagline: "Flash Sale",
    title: "আপনার পছন্দের\nপণ্য সেরা দামে",
    titleEn: "Your Favourite\nProducts at Best Price",
    sub: "সীমিত সময়ের অফার — এখনই কিনুন",
    subEn: "Limited time offers — shop now",
    badge: "UP TO 60% OFF",
    bg: "from-[#0f172a] to-[#1e3a5f]",
    accent: "#38bdf8",
    emoji: ["🛒", "🎁", "📦", "💳", "✨"],
  },
  {
    id: 2,
    tagline: "নতুন আগমন",
    title: "গ্রীষ্মের সেরা\nকালেকশন এসে গেছে",
    titleEn: "Summer Best\nCollection is Here",
    sub: "গ্রীষ্ম মৌসুমের এক্সক্লুসিভ পণ্য সংগ্রহ",
    subEn: "Exclusive summer season product collection",
    badge: "NEW ARRIVAL",
    bg: "from-[#14532d] to-[#16a34a]",
    accent: "#86efac",
    emoji: ["👗", "👠", "🕶️", "🧴", "🌞"],
  },
  {
    id: 3,
    tagline: "বিশেষ অফার",
    title: "গ্যাজেট &\nইলেকট্রনিক্স ডিল",
    titleEn: "Gadgets &\nElectronics Deals",
    sub: "সেরা ব্র্যান্ডের ইলেকট্রনিক্স সর্বনিম্ন মূল্যে",
    subEn: "Top brand electronics at the lowest prices",
    badge: "৳৳ SAVE BIG",
    bg: "from-[#1e1b4b] to-[#4338ca]",
    accent: "#a5b4fc",
    emoji: ["💻", "📱", "🎧", "⌚", "🖥️"],
  },
];

const AUTO_PLAY_MS = 4000;

const SmartStoreCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const go = useCallback((dir: "left" | "right") => {
    setAnimDir(dir);
    setCurrent((c) =>
      dir === "right" ? (c + 1) % SLIDES.length : (c - 1 + SLIDES.length) % SLIDES.length
    );
    setTimeout(() => setAnimDir(null), 380);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      setAnimDir(idx > current ? "right" : "left");
      setCurrent(idx);
      setTimeout(() => setAnimDir(null), 380);
    },
    [current]
  );

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

  const slide = SLIDES[current];

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

      {/* Carousel */}
      <a
        href="/smart-store/"
        className="block relative overflow-hidden rounded-2xl select-none cursor-pointer"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slide */}
        <div
          key={slide.id}
          className={`bg-gradient-to-r ${slide.bg} min-h-[160px] sm:min-h-[200px]`}
          style={{
            animation: animDir
              ? `ssSlide${animDir === "right" ? "FromRight" : "FromLeft"} 0.38s cubic-bezier(.4,0,.2,1)`
              : "none",
          }}
        >
          <div className="max-w-full px-5 sm:px-8 py-6 sm:py-8 flex items-center justify-between gap-4">
            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: slide.accent, color: "#111", opacity: 0.95 }}
                >
                  {slide.tagline}
                </span>
                <span
                  className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border"
                  style={{ borderColor: slide.accent, color: slide.accent }}
                >
                  {slide.badge}
                </span>
              </div>

              <h3
                className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight mb-2"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)", whiteSpace: "pre-line" }}
              >
                {slide.title}
              </h3>

              <p className="text-sm text-white/70 mb-4 hidden sm:block">{slide.sub}</p>

              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ background: slide.accent, color: "#111" }}
              >
                এখনই দেখুন <ChevronRight className="h-4 w-4" />
              </span>
            </div>

            {/* Emoji grid — desktop */}
            <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-2 pr-2">
              <div className="flex gap-3 mb-2">
                {slide.emoji.slice(0, 3).map((em, i) => (
                  <span
                    key={i}
                    className="text-4xl lg:text-5xl drop-shadow-lg"
                    style={{ animation: `ssFloat 2.5s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
                  >
                    {em}
                  </span>
                ))}
              </div>
              <div className="flex gap-3 justify-center">
                {slide.emoji.slice(3).map((em, i) => (
                  <span
                    key={i}
                    className="text-4xl lg:text-5xl drop-shadow-lg"
                    style={{ animation: `ssFloat 2.5s ease-in-out infinite`, animationDelay: `${(i + 3) * 0.3 + 0.15}s` }}
                  >
                    {em}
                  </span>
                ))}
              </div>
            </div>

            {/* Single emoji — mobile */}
            <span
              className="sm:hidden flex-shrink-0 text-6xl drop-shadow-lg"
              style={{ animation: "ssFloat 2.5s ease-in-out infinite" }}
            >
              {slide.emoji[0]}
            </span>
          </div>

          {/* Progress bar */}
          {!isPaused && (
            <div className="h-0.5 w-full bg-white/10">
              <div
                key={`${slide.id}-bar`}
                className="h-full bg-white/40 origin-left"
                style={{ animation: `ssProgress ${AUTO_PLAY_MS}ms linear forwards` }}
              />
            </div>
          )}
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={(e) => { e.preventDefault(); go("left"); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); go("right"); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/25 hover:bg-black/50 text-white rounded-full p-1.5 sm:p-2 transition-all hover:scale-110 backdrop-blur-sm"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Dot navigation */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
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
        @keyframes ssFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes ssProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes ssSlideFromRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes ssSlideFromLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default SmartStoreCarousel;
