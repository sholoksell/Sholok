import { Link } from "react-router-dom";
import { ArrowRight, Leaf } from "lucide-react";

export default function FavouriteFitBanner() {
  return (
    <section className="container py-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#5D0096] via-[#7a00bc] to-[#8A00C8] min-h-[200px] sm:min-h-[240px] flex items-center">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1534859108275-a3a6b182f2f8?w=1600&q=80&auto=format&fit=crop"
          alt="Summer collection"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
        />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-40 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-6 right-16 w-24 h-24 rounded-full bg-[#D31710]/20" />

        <div className="relative z-10 px-8 sm:px-14 max-w-xl py-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-3">
            <Leaf className="w-3.5 h-3.5" /> SUMMER SPECIAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
            Fresh Arrivals<br />For Every Style
          </h2>
          <p className="text-white/80 text-sm mb-5 max-w-sm">
            From everyday essentials to statement pieces — curated collections just for you.
          </p>
          <Link
            to="/search?featured=1"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-white text-[#5D0096] font-bold text-sm hover:bg-white/90 transition-colors"
          >
            Shop the Edit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
