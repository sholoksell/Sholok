import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Phone } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Summer Fest', href: '/category/summer-fest', highlight: false },
  { label: 'Great Deals', href: '/offers', highlight: true },
  { label: 'Unilever-Stock & Save', href: '/category/unilever', highlight: false },
  { label: 'Buy & Save More', href: '/category/buy-save', highlight: false },
  { label: 'Our Brands', href: '/category/our-brands', highlight: false },
  { label: "Women's Corner", href: '/category/womens-corner', highlight: false },
];

const CategoryNavBar = () => {
  return (
    <div className="hidden lg:block bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-stretch h-11">

          {/* Promo nav links */}
          <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`whitespace-nowrap px-3 py-1.5 text-sm font-semibold rounded transition-colors flex-shrink-0 ${
                  link.highlight
                    ? 'text-[#00b0f0] hover:text-[#0090cc]'
                    : 'text-gray-700 hover:text-[#E31E24]'
                }`}
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4 flex-shrink-0 border-l border-gray-200 pl-4">
            <Link
              to="/outlets"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#E31E24] transition-colors whitespace-nowrap"
            >
              <Store className="w-3.5 h-3.5" />
              Our outlets
            </Link>
            <Link
              to="/help"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#E31E24] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              Help line
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CategoryNavBar;
