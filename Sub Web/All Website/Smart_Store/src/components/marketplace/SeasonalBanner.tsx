import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import bannerWoman from "@/assets/banner-woman.jpg";

export default function SeasonalBanner() {
  return (
    <section className="container py-6">
      <div className="relative overflow-hidden rounded-xl bg-[#f5ede8] min-h-[200px] sm:min-h-[280px] flex items-center">
        {/* Background model image — right side */}
        <img
          src={bannerWoman}
          alt="Everyday Style"
          className="absolute right-0 top-0 h-full w-[55%] object-cover object-left-top"
        />
        {/* Gradient overlay — fades from left (text area) to transparent, revealing the woman */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#f5ede8] from-30% via-[#f5ede8]/60 via-45% to-transparent to-60%" />

        {/* Content */}
        <div className="relative z-10 px-8 sm:px-14 max-w-lg py-10">
          <span className="text-xs font-bold tracking-widest text-[#D31710] uppercase mb-3 block">
            Special Seasonal Offer
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-[#5D0096] leading-tight mb-3 uppercase">
            Everyday<br />Style
          </h2>
          <p className="text-sm text-gray-600 mb-2">Discover More, Love More</p>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm text-gray-700">Save up to</span>
            <span className="bg-[#D31710] text-white text-sm font-bold px-3 py-1 rounded-full">
              20% OFF
            </span>
          </div>
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-[#5D0096] text-white font-semibold text-sm hover:bg-[#4a0078] transition-colors"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
