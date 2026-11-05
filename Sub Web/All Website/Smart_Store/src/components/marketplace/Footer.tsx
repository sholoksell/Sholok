import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";

const LINKS = {
  Shop: [
    { label: "New Arrivals", to: "/search?isNew=1" },
    { label: "Best Sellers", to: "/search?sort=popular" },
    { label: "Flash Sale", to: "/#flash-sale" },
    { label: "All Categories", to: "/search" },
  ],
  Account: [
    { label: "My Orders", to: "/account?tab=orders" },
    { label: "My Wishlist", to: "/account?tab=wishlist" },
    { label: "My Profile", to: "/account" },
    { label: "Track Order", to: "/account?tab=orders" },
  ],
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Contact Us", to: "/contact" },
    { label: "Become a Seller", to: "/seller" },
    { label: "Privacy Policy", to: "/privacy" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="bg-[#1a1a2e] text-white mt-12">
      {/* Newsletter strip */}
      <div className="bg-[#5D0096]">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Subscribe to our newsletter</p>
            <p className="text-sm text-white/75">Get deals, new arrivals and exclusive offers.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 sm:w-64 h-10 px-4 rounded bg-white/15 border border-white/25 text-sm placeholder:text-white/50 text-white focus:outline-none focus:border-white/60"
            />
            <button type="submit" className="h-10 px-5 rounded bg-white text-[#5D0096] text-sm font-semibold hover:bg-white/90 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#5D0096] flex items-center justify-center">
              <span className="text-white font-bold text-base leading-none">S</span>
            </div>
            <span className="font-bold text-lg">Sholok <span className="text-[#9d4edd]">Shopping</span></span>
          </Link>
          <p className="text-sm text-white/60 leading-relaxed mb-4">
            Discover more. Shop better. Your everyday marketplace for fashion, beauty, home &amp; more.
          </p>
          <div className="space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>+880 1800-000000</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>support@sholok.com</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#5D0096] flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-semibold mb-3 text-white/90">{title}</h4>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/55 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
