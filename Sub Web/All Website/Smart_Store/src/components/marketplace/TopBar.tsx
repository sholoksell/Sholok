import { Phone, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <div className="bg-[#5D0096] text-white text-xs">
      <div className="container flex items-center justify-between h-9 gap-4">
        <div className="flex items-center gap-1.5 text-white/90">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>Welcome to <strong className="text-white">Sholok Shopping</strong> — Free delivery on orders over ৳999</span>
        </div>
        <a
          href="tel:+8801800000000"
          className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-white transition-colors shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>+880 1800-000000</span>
        </a>
        <div className="hidden md:flex items-center gap-4 text-white/80 shrink-0">
          <Link to="/seller" className="hover:text-white transition-colors">Sell with us</Link>
          <Link to="/account" className="hover:text-white transition-colors">Track order</Link>
        </div>
      </div>
    </div>
  );
}
