import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, MapPin, Mail, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const cols = [
    {
      title: t('aboutUs') || 'About Sholok',
      links: [
        { label: t('aboutUs') || 'About Us', to: '/about' },
        { label: t('contactUs') || 'Contact Us', to: '/contact' },
      ],
    },
    {
      title: t('customerService') || 'Customer Service',
      links: [
        { label: t('helpLine') || 'Help Center', to: '/help' },
        { label: t('shippingInfo') || 'Shipping Information', to: '/shipping' },
        { label: t('returnPolicy') || 'Returns and Refunds', to: '/return-policy' },
        { label: t('faq') || 'FAQs', to: '/faq' },
      ],
    },
    {
      title: 'Shopping',
      links: [
        { label: 'Shop All', to: '/categories' },
        { label: 'New Arrivals', to: '/discover' },
        { label: 'Flash Sales', to: '/flash-sales' },
        { label: 'Trending Items', to: '/offers' },
        { label: t('deliveryAreas') || 'Delivery Areas', to: '/delivery-areas' },
      ],
    },
    {
      title: 'Seller Information',
      links: [
        { label: t('sellOnSholok') || 'Become a Seller', to: '/vendor/apply' },
        { label: t('privacyPolicy') || 'Privacy Policy', to: '/privacy-policy' },
        { label: t('termsConditions') || 'Terms & Conditions', to: '/terms' },
      ],
    },
  ];

  return (
    <footer className="mt-12 bg-primary-deep text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 md:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <p className="text-3xl font-extrabold tracking-tight">
              SHOLOK<span className="text-orange-500">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm opacity-80">
              Fashion, beauty, home and everyday essentials — discover more and love more, all in one place.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a href="tel:+8801000000000" className="flex items-center gap-2 opacity-85 hover:opacity-100 hover:underline">
                <Phone className="h-4 w-4" /> +880 1XXX-XXXXXX
              </a>
              <a href="mailto:support@sholok.com" className="flex items-center gap-2 opacity-85 hover:opacity-100 hover:underline">
                <Mail className="h-4 w-4" /> support@sholok.com
              </a>
              <div className="flex items-start gap-2 opacity-85">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>123 Shopping Street, Dhaka 1000, Bangladesh</span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <button
                  key={i}
                  aria-label={['Facebook', 'Instagram', 'YouTube'][i]}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/30 hover:bg-white hover:text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">{col.title}</h3>
              <ul className="space-y-2 text-sm opacity-85">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:opacity-100 hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/15">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <form
            onSubmit={handleSubscribe}
            className="flex w-full max-w-md overflow-hidden rounded-full bg-white/10"
          >
            <label htmlFor="newsletter-email" className="sr-only">Email for newsletter</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email for offers & updates"
              className="min-w-0 flex-1 bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-white/60"
            />
            <button
              type="submit"
              className="bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs opacity-70 shrink-0">
            © {new Date().getFullYear()} Sholok Shopping. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
