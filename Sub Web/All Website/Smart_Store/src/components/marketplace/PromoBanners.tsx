import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const BANNERS = [
  {
    kicker: "STYLE REFRESH",
    title: "Everyday Fashion",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80&auto=format&fit=crop",
    href: "/search?category=fashion",
    bg: "from-purple-100/80 to-purple-50/60",
  },
  {
    kicker: "YOUR BEAUTY EDIT",
    title: "Beauty Favorites",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop",
    href: "/search?category=beauty",
    bg: "from-pink-100/80 to-pink-50/60",
  },
  {
    kicker: "MAKE ROOM FOR",
    title: "Home Comforts",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&auto=format&fit=crop",
    href: "/search?category=home",
    bg: "from-teal-100/80 to-teal-50/60",
  },
];

export default function PromoBanners() {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BANNERS.map((b) => (
          <Link
            key={b.title}
            to={b.href}
            className="group relative overflow-hidden rounded-lg h-44 flex items-end bg-muted"
          >
            <img
              src={b.image}
              alt={b.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${b.bg}`} />
            <div className="relative z-10 p-4">
              <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">{b.kicker}</p>
              <h3 className="text-lg font-bold text-foreground leading-tight">{b.title}</h3>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5D0096] mt-1 group-hover:gap-2 transition-all">
                Shop now <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
