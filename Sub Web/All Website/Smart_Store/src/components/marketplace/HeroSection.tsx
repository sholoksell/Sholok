import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Package, Shirt, SprayCan, Home, Baby, Dumbbell, Gift, Camera, Book, Utensils, Gem, Leaf, Briefcase, Coffee, Bike, Laptop } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { categoriesApi } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";

const CAT_ICON_MAP: Record<string, any> = {
  women: Shirt, "women's": Shirt, ladies: Shirt,
  men: Briefcase, "men's": Briefcase, gents: Briefcase,
  fashion: Shirt, clothing: Shirt, apparel: Shirt, dress: Shirt,
  beauty: SprayCan, makeup: SprayCan, cosmetic: SprayCan, skin: SprayCan,
  home: Home, decor: Home, furniture: Home, living: Home,
  kitchen: Utensils, food: Coffee, grocery: Leaf,
  baby: Baby, kids: Baby, children: Baby, toy: Gift,
  electronic: Laptop, phone: Laptop, mobile: Laptop, gadget: Laptop, tech: Camera,
  sport: Dumbbell, fitness: Dumbbell, gym: Dumbbell,
  book: Book, stationery: Book, office: Book,
  jewel: Gem, accessories: Gem, bag: Gift, watch: Gem,
  organic: Leaf, fresh: Leaf, vegetable: Leaf, fruit: Leaf,
  bike: Bike, cycle: Bike, vehicle: Bike,
  camera: Camera, photo: Camera,
};

function getCatIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, Icon] of Object.entries(CAT_ICON_MAP)) {
    if (lower.includes(key)) return Icon;
  }
  return Package;
}

const CAT_COLORS = [
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-orange-100 text-orange-600",
  "bg-teal-100 text-teal-600",
  "bg-red-100 text-red-600",
  "bg-yellow-100 text-yellow-600",
  "bg-indigo-100 text-indigo-600",
  "bg-cyan-100 text-cyan-600",
  "bg-rose-100 text-rose-600",
  "bg-emerald-100 text-emerald-600",
];

const SLIDES = [
  {
    eyebrow: "NEW SEASON COLLECTION",
    title: "Festive Fashion For Every You",
    subtitle: "Discover kurtis, sarees and three-piece sets curated for celebration.",
    offer: "Up to 40% OFF",
    cta: "Shop Now",
    ctaHref: "/search?featured=1",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80&auto=format&fit=crop",
  },
  {
    eyebrow: "BEAUTY WEEK",
    title: "Glow Up With Top Beauty Picks",
    subtitle: "Lipsticks, serums and fragrances from loved brands, now with great deals.",
    offer: "Flat 25% OFF",
    cta: "Explore Beauty",
    ctaHref: "/search?category=beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400&q=80&auto=format&fit=crop",
  },
  {
    eyebrow: "HOME ESSENTIALS",
    title: "Make Your Home Beautiful",
    subtitle: "Cookware, decor and furniture for every room and every budget.",
    offer: "Starting ৳299",
    cta: "Shop Home",
    ctaHref: "/search?category=home",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1400&q=80&auto=format&fit=crop",
  },
];

type SubCat = { id?: string | number; _id?: string | number; name: string; slug?: string };
type Category = { id?: string | number; _id?: string | number; name: string; slug?: string; children?: SubCat[] };
const catId = (c: { id?: string | number; _id?: string | number; slug?: string }) => String(c._id ?? c.id ?? c.slug ?? "");

function CategorySidebar({ categories }: { categories: Category[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRowClick = (cat: Category) => {
    const id = catId(cat);
    if ((cat.children?.length ?? 0) > 0) {
      setExpandedId((prev) => (prev === id ? null : id));
    } else {
      navigate(`/search?categoryId=${id}`);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-[270px] shrink-0 bg-card border border-border border-t-0 rounded-b-xl overflow-hidden self-start">
      <ul className="py-1 flex-1 max-h-[calc(420px-2px)] overflow-y-auto">
        {categories.length === 0
          ? Array.from({ length: 10 }).map((_, i) => (
              <li key={i} className="mx-3 my-1 h-10 rounded-lg bg-muted animate-pulse" />
            ))
          : categories.map((cat, idx) => {
              const Icon = getCatIcon(cat.name);
              const colorCls = CAT_COLORS[idx % CAT_COLORS.length];
              const hasChildren = (cat.children?.length ?? 0) > 0;
              const id = catId(cat);
              const isExpanded = expandedId === id;

              return (
                <li key={id}>
                  <button
                    onClick={() => handleRowClick(cat)}
                    className="group w-full flex items-center gap-3 px-4 py-[0.55rem] text-sm font-medium text-foreground transition-all hover:bg-[#5D0096]/5 hover:text-[#5D0096] text-left"
                  >
                    <span className={`grid h-7 w-7 place-items-center rounded-md shrink-0 transition-all group-hover:bg-[#5D0096] group-hover:text-white ${colorCls}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 truncate">{cat.name}</span>
                    {hasChildren && (
                      <ChevronRight className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 group-hover:text-[#5D0096] ${isExpanded ? "rotate-90" : ""}`} />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && hasChildren && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden bg-[#5D0096]/[0.03]"
                      >
                        {cat.children!.map((sub) => (
                          <li key={catId(sub)}>
                            <Link
                              to={`/search?categoryId=${catId(sub)}`}
                              className="flex items-center gap-2.5 pl-[52px] pr-4 h-9 text-sm text-gray-600 hover:text-[#5D0096] hover:bg-[#5D0096]/5 transition-colors"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5D0096]/40 shrink-0" />
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            to={`/search?categoryId=${id}`}
                            className="flex items-center gap-2.5 pl-[52px] pr-4 h-9 text-xs text-[#5D0096] font-semibold hover:bg-[#5D0096]/5 transition-colors"
                          >
                            View all →
                          </Link>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
      </ul>
    </aside>
  );
}

function MobileCategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 lg:hidden px-4 scrollbar-hide">
      {categories.slice(0, 10).map((cat, idx) => {
        const Icon = getCatIcon(cat.name);
        const colorCls = CAT_COLORS[idx % CAT_COLORS.length];
        return (
          <Link
            key={String(catId(cat))}
            to={`/search?categoryId=${catId(cat)}`}
            className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <span className={`grid h-14 w-14 place-items-center rounded-2xl border border-border shadow-sm ${colorCls}`}>
              <Icon className="h-6 w-6" />
            </span>
            <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function HeroSection() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    categoriesApi.list().then((r: any) => {
      if (!mounted.current) return;
      const list = r?.categories || r?.data || (Array.isArray(r) ? r : []);
      setCategories(list.slice(0, 14));
    }).catch(() => {});
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setSlide((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const go = (d: number) => setSlide((p) => (p + d + SLIDES.length) % SLIDES.length);
  const s = SLIDES[slide];

  return (
    <section className="pb-2">
      <div className="container">
        {/* Main hero area — sidebar adjacent to slider */}
        <div className="flex gap-5 pt-4" style={{ minHeight: 420 }}>
          <CategorySidebar categories={categories} />

          {/* Hero slider */}
          <div
            className="relative flex-1 overflow-hidden rounded-xl border border-border shadow-card"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Slides */}
            <div
              className="flex h-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {SLIDES.map((sl, idx) => (
                <div
                  key={sl.title}
                  className="relative w-full shrink-0 min-h-[420px]"
                  aria-hidden={idx !== slide}
                >
                  <img
                    src={sl.image}
                    alt={sl.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

                  {/* Text content */}
                  <div className={`relative z-10 flex h-full max-w-[55%] flex-col justify-center gap-3 px-8 py-10 ${idx === slide ? "[&>*]:animate-fade-in" : ""}`}>
                    <span className="w-fit rounded-full bg-[#D31710] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">
                      {sl.offer}
                    </span>
                    <p className="text-xs font-semibold text-white/80 tracking-widest uppercase sm:text-sm">{sl.eyebrow}</p>
                    <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">{sl.title}</h2>
                    <p className="hidden text-sm text-white/80 sm:block max-w-xs leading-relaxed">{sl.subtitle}</p>
                    <Link
                      to={sl.ctaHref}
                      tabIndex={idx === slide ? 0 : -1}
                      className="btn-primary mt-1 w-fit text-sm"
                    >
                      {sl.cta} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev / Next */}
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow-card transition hover:bg-white sm:grid"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/80 shadow-card transition hover:bg-white sm:grid"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${idx === slide ? "w-7 bg-white" : "w-2 bg-white/50"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile category strip */}
        {categories.length > 0 && (
          <div className="mt-4 lg:hidden">
            <MobileCategoryStrip categories={categories} />
          </div>
        )}
      </div>
    </section>
  );

}
