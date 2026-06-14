import { ArrowRight, MapPin, Bed, Bath, Square, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const listings = [
  {
    titleEn: "Luxury Apartment in Gulshan",
    titleBn: "গুলশানে বিলাসবহুল অ্যাপার্টমেন্ট",
    locationEn: "Gulshan 2, Dhaka",
    locationBn: "গুলশান ২, ঢাকা",
    price: "৳ ২.৫ কোটি",
    statusEn: "For Sale",
    statusBn: "বিক্রয়ের জন্য",
    statusColor: "bg-green-500",
    bedrooms: 4,
    bathrooms: 4,
    area: "২,৮০০ বর্গফুট",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop",
  },
  {
    titleEn: "Modern Office Space in Banani",
    titleBn: "বনানীতে আধুনিক অফিস স্পেস",
    locationEn: "Banani, Dhaka",
    locationBn: "বনানী, ঢাকা",
    price: "৳ ৫ কোটি",
    statusEn: "For Sale",
    statusBn: "বিক্রয়ের জন্য",
    statusColor: "bg-green-500",
    bedrooms: null,
    bathrooms: 3,
    area: "৪,৫০০ বর্গফুট",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop",
  },
  {
    titleEn: "Duplex Villa in Dhanmondi",
    titleBn: "ধানমন্ডিতে ডুপ্লেক্স ভিলা",
    locationEn: "Dhanmondi 8A, Dhaka",
    locationBn: "ধানমন্ডি ৮এ, ঢাকা",
    price: "৳ ১.৮ কোটি",
    statusEn: "For Rent",
    statusBn: "ভাড়ার জন্য",
    statusColor: "bg-blue-500",
    bedrooms: 5,
    bathrooms: 5,
    area: "৩,২০০ বর্গফুট",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop",
  },
  {
    titleEn: "Studio Apartment in Uttara",
    titleBn: "উত্তরায় স্টুডিও অ্যাপার্টমেন্ট",
    locationEn: "Uttara Sector 7, Dhaka",
    locationBn: "উত্তরা সেক্টর ৭, ঢাকা",
    price: "৳ ৪৫ লক্ষ",
    statusEn: "For Sale",
    statusBn: "বিক্রয়ের জন্য",
    statusColor: "bg-green-500",
    bedrooms: 1,
    bathrooms: 1,
    area: "৬৫০ বর্গফুট",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop",
  },
  {
    titleEn: "Commercial Plot in Mirpur",
    titleBn: "মিরপুরে বাণিজ্যিক প্লট",
    locationEn: "Mirpur DOHS, Dhaka",
    locationBn: "মিরপুর ডিওএইচএস, ঢাকা",
    price: "৳ ৩.২ কোটি",
    statusEn: "For Sale",
    statusBn: "বিক্রয়ের জন্য",
    statusColor: "bg-green-500",
    bedrooms: null,
    bathrooms: null,
    area: "৫ কাঠা",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format&fit=crop",
  },
];

const RealEstateSection = () => {
  const { language, t } = useLanguage();
  const isBn = language === "BN";

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">
            {isBn ? "রিয়েল এস্টেট" : "Real Estate"}
          </h2>
          <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
            {isBn ? "নতুন" : "NEW"}
          </span>
        </div>
        <Link
          to="/realestate"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {listings.map((item, index) => (
          <Link
            key={index}
            to="/realestate"
            className="group block bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all"
          >
            {/* Image */}
            <div className="relative w-full aspect-video overflow-hidden bg-secondary">
              <img
                src={item.image}
                alt={isBn ? item.titleBn : item.titleEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className={`absolute top-2 left-2 px-2 py-0.5 text-white text-xs font-bold rounded ${item.statusColor}`}>
                {isBn ? item.statusBn : item.statusEn}
              </span>
            </div>

            {/* Info */}
            <div className="p-3 space-y-1">
              <h3 className="text-xs font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[32px]">
                {isBn ? item.titleBn : item.titleEn}
              </h3>

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{isBn ? item.locationBn : item.locationEn}</span>
              </p>

              <p className="text-sm font-bold text-emerald-600">{item.price}</p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5 flex-wrap">
                {item.bedrooms !== null && (
                  <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" />{item.bedrooms}</span>
                )}
                {item.bathrooms !== null && (
                  <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" />{item.bathrooms}</span>
                )}
                <span className="flex items-center gap-0.5"><Square className="w-3 h-3" />{item.area}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RealEstateSection;
