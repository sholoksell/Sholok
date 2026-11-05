import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";

const SERVICE_TILES = [
  { icon: Truck, title: "Fast Delivery", desc: "Across all 64 districts" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: ShieldCheck, title: "100% Genuine", desc: "Authentic products only" },
  { icon: Headphones, title: "24/7 Support", desc: "We're always here" },
];

const CATEGORIES = [
  { label: "Men's Fashion", to: "/search?category=men" },
  { label: "Women's Fashion", to: "/search?category=women" },
  { label: "Beauty & Health", to: "/search?category=beauty" },
  { label: "Electronics", to: "/search?category=electronics" },
  { label: "Home & Living", to: "/search?category=home" },
  { label: "Kids & Baby", to: "/search?category=kids" },
];

const QUICK_LINKS = [
  { label: "New Arrivals", to: "/search?isNew=1" },
  { label: "Flash Sale", to: "/#flash-sale" },
  { label: "Best Sellers", to: "/search?sort=popular" },
  { label: "Become a Seller", to: "/seller" },
  { label: "Track My Order", to: "/account?tab=orders" },
  { label: "Privacy Policy", to: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="bg-[#5D0096] text-white mt-12">
      {/* Service tiles */}
      <div className="bg-[#4a0078]">
        <div className="container py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_TILES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-xs text-white/60">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block mb-4">
            <span className="font-logo text-3xl font-black text-white tracking-tight">SHOLOK</span>
          </Link>
          <p className="text-sm text-white/60 leading-relaxed mb-5">
            Discover more. Shop better. Your everyday marketplace for fashion, beauty, home &amp; more.
          </p>
          <div className="space-y-2 text-sm text-white/60 mb-5">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0 text-white/40" />
              <span>+880 1800-000000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0 text-white/40" />
              <span>support@sholok.com</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-white/40" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Categories</h4>
          <ul className="space-y-2.5">
            {CATEGORIES.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="text-sm text-white/60 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact / Newsletter */}
        <div>
          <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">Stay Updated</h4>
          <p className="text-sm text-white/60 mb-3">Get deals and new arrivals in your inbox.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="h-10 px-4 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-white/40 text-white focus:outline-none focus:border-white/50 transition-colors"
            />
            <button type="submit" className="h-10 rounded-lg bg-white text-[#5D0096] text-sm font-bold hover:bg-white/90 transition-colors">
              Subscribe
            </button>
          </form>
          <div className="mt-5 space-y-2 text-sm text-white/60">
            <Link to="/about" className="block hover:text-white transition-colors">About Us</Link>
            <Link to="/contact" className="block hover:text-white transition-colors">Contact Us</Link>
            <Link to="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Sholok Shopping. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
