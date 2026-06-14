import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const PromoBanner = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-portal-orange/10 border border-primary/20 rounded-xl p-4 mb-4 animate-fade-in">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">
              NEW YEAR SPECIAL
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            ১০০০ টাকার অর্ডারে ফ্রি ডেলিভারি
          </h3>
          <p className="text-sm text-muted-foreground">
            Free delivery on orders above ৳1000 • Valid until January 15
          </p>
        </div>
        <Link to="/search?q=Special Offers" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
          Shop Now
        </Link>
      </div>
    </div>
  );
};

export default PromoBanner;
