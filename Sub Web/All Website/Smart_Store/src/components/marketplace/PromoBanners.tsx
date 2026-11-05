import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    kicker: "MEN'S FASHION",
    title: "Shirts, Chinos\n& Sneakers",
    offer: "Save 30%",
    href: "/search?category=men",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&auto=format&fit=crop",
    from: "#5D0096",
  },
  {
    kicker: "YOUR BEAUTY EDIT",
    title: "Skincare &\nMakeup Picks",
    offer: "Up to 20% OFF",
    href: "/search?category=beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80&auto=format&fit=crop",
    from: "#b5179e",
  },
  {
    kicker: "HOME COMFORTS",
    title: "Decor &\nKitchen Finds",
    offer: "From ৳290",
    href: "/search?category=home",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&auto=format&fit=crop",
    from: "#0d7377",
  },
  {
    kicker: "KIDS & BABY",
    title: "Gentle Care\nFor Little Ones",
    offer: "Flat 15% OFF",
    href: "/search?category=kids",
    image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80&auto=format&fit=crop",
    from: "#e76f51",
  },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

function BannerCard({ b, delay }: { b: typeof BANNERS[0]; delay: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal${visible ? " is-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link
        to={b.href}
        className="group relative block aspect-[16/10] overflow-hidden rounded-xl bg-muted"
      >
        <img
          src={b.image}
          alt={b.title.replace("\n", " ")}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, ${b.from}dd 0%, ${b.from}88 45%, transparent 100%)` }}
        />
        <div className="relative flex h-full flex-col justify-center gap-1.5 p-5 text-white">
          <span className="w-fit rounded bg-[#D31710] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">
            {b.offer}
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-widest opacity-80 mt-0.5">{b.kicker}</p>
          <h3 className="text-xl font-extrabold leading-tight whitespace-pre-line">{b.title}</h3>
          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 text-xs font-bold transition-all group-hover:bg-white group-hover:text-[#5D0096] group-hover:gap-2">
            Shop Now <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function PromoBanners() {
  return (
    <section className="container py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BANNERS.map((b, i) => (
          <BannerCard key={b.title} b={b} delay={i * 80} />
        ))}
      </div>
    </section>
  );
}
