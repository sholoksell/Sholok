import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Coffee } from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

interface Cafe {
  _id: string;
  name: string;
  area: string;
  city: string;
  rating: number;
  reviewCount: number;
  priceSymbol: string;
  priceRange: string;
  coverImage: string;
  images: string[];
  isFeatured: boolean;
  awards: string[];
  establishmentType: string[];
  isOpenNow: boolean;
}

const fallbackCafes: Cafe[] = [
  {
    _id: "1",
    name: "Latitude 23",
    area: "Gulshan 2",
    city: "Dhaka",
    rating: 4.7,
    reviewCount: 312,
    priceSymbol: "৳৳",
    priceRange: "Mid-range",
    coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop",
    images: [],
    isFeatured: true,
    awards: ["Travelers' Choice"],
    establishmentType: ["Café"],
    isOpenNow: true,
  },
  {
    _id: "2",
    name: "NORTH END Coffee",
    area: "Shahajadpur",
    city: "Dhaka",
    rating: 4.6,
    reviewCount: 289,
    priceSymbol: "৳৳",
    priceRange: "Mid-range",
    coverImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop",
    images: [],
    isFeatured: true,
    awards: [],
    establishmentType: ["Coffee & Tea"],
    isOpenNow: true,
  },
  {
    _id: "3",
    name: "GBC Baking Company",
    area: "Gulshan 1",
    city: "Dhaka",
    rating: 4.5,
    reviewCount: 201,
    priceSymbol: "৳৳",
    priceRange: "Mid-range",
    coverImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop",
    images: [],
    isFeatured: false,
    awards: ["Best Cafe 2024"],
    establishmentType: ["Bakery & Café"],
    isOpenNow: false,
  },
  {
    _id: "4",
    name: "Kaffeine Dhaka",
    area: "Dhanmondi",
    city: "Dhaka",
    rating: 4.4,
    reviewCount: 178,
    priceSymbol: "৳",
    priceRange: "Cheap Eats",
    coverImage: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&auto=format&fit=crop",
    images: [],
    isFeatured: false,
    awards: [],
    establishmentType: ["Café"],
    isOpenNow: true,
  },
  {
    _id: "5",
    name: "Cafe Social",
    area: "Shahbagh",
    city: "Dhaka",
    rating: 4.3,
    reviewCount: 156,
    priceSymbol: "৳৳৳",
    priceRange: "Fine Dining",
    coverImage: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=600&auto=format&fit=crop",
    images: [],
    isFeatured: true,
    awards: ["Travelers' Choice"],
    establishmentType: ["Restaurant & Café"],
    isOpenNow: true,
  },
];

const RatingStars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= full
              ? "fill-amber-400 text-amber-400"
              : i === full + 1 && half
              ? "fill-amber-200 text-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </span>
  );
};

const CafeSection = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/cafes`, { params: { city: "Dhaka", sort: "rating", limit: 5 } })
      .then((res) => {
        const data: Cafe[] = res.data?.cafes || [];
        setCafes(data.length > 0 ? data : fallbackCafes);
      })
      .catch(() => setCafes(fallbackCafes))
      .finally(() => setLoading(false));
  }, []);

  const display = loading ? fallbackCafes : cafes;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Coffee className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">Cafés</h2>
          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
            Bangladesh
          </span>
        </div>
        <Link
          to="/cafe"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cafe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {display.map((cafe, index) => {
          const imgSrc = cafe.coverImage || cafe.images?.[0] || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop";
          const badge = cafe.awards.includes("Travelers' Choice")
            ? { label: "Travelers' Choice", color: "bg-green-600" }
            : cafe.isFeatured
            ? { label: "Featured", color: "bg-amber-500" }
            : null;

          return (
            <Link
              key={cafe._id || index}
              to="/cafe"
              className="group block bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="relative w-full aspect-video overflow-hidden bg-secondary">
                <img
                  src={imgSrc}
                  alt={cafe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop";
                  }}
                />
                {badge && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-white text-[10px] font-bold rounded ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${cafe.isOpenNow ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>
                  {cafe.isOpenNow ? "Open" : "Closed"}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <h3 className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[32px]">
                  {cafe.name}
                </h3>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{cafe.area}, {cafe.city}</span>
                </p>

                <div className="flex items-center gap-1.5">
                  <RatingStars rating={cafe.rating} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{cafe.rating}</span>
                  <span className="text-xs text-muted-foreground">({cafe.reviewCount})</span>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs text-amber-600 font-semibold">{cafe.priceSymbol} · {cafe.priceRange}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[70px] text-right">{cafe.establishmentType[0]}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CafeSection;
