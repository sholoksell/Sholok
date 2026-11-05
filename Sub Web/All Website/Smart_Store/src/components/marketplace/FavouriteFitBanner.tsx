import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FavouriteFitBanner() {
  return (
    <section className="container py-6">
      <div className="relative overflow-hidden rounded-lg h-52 sm:h-60 bg-gradient-to-r from-[#5D0096] to-[#8A00C8] flex items-center">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&q=80&auto=format&fit=crop"
          alt="Fashion collection"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />

        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-32 w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 px-8 sm:px-12 max-w-lg">
          <p className="text-sm text-white/70 font-medium uppercase tracking-widest mb-2">THE SUMMER EDIT</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
            Your Next<br />Favourite Fit
          </h2>
          <p className="text-white/80 text-sm mb-5">
            Discover seasonal style and everyday essentials curated just for you.
          </p>
          <Link
            to="/search?featured=1"
            className="inline-flex items-center gap-2 px-6 h-11 rounded bg-white text-[#5D0096] font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            Explore the edit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
