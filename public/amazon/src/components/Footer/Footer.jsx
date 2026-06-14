import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronUp, FiGlobe } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const footerLinks = [
  {
    title: 'Get to Know Us',
    links: ['About Us', 'Careers', 'Press Releases', 'Sholok Science', 'Investor Relations', 'Our Devices', 'Sustainability'],
  },
  {
    title: 'Make Money with Us',
    links: ['Sell on Sholok', 'Sell Under Sholok Accelerator', 'Become an Affiliate', 'Advertise Your Products', 'Self-Publish with Us', 'Host a Sholok Hub'],
  },
  {
    title: 'Sholok Payment Products',
    links: ['Sholok Business Card', 'Shop with Points', 'Reload Your Balance', 'Sholok Currency Converter', 'Payment Methods', 'Sholok Pay'],
  },
  {
    title: 'Let Us Help You',
    links: ['Your Account', 'Your Orders', 'Shipping Rates & Policies', 'Returns & Replacements', 'Manage Your Content', 'ShopZone Assistant', 'Help'],
  },
];

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="mt-4">
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475A] hover:bg-[#485769] text-white text-sm py-3 text-center transition-colors font-medium"
      >
        Back to top ↑
      </button>

      {/* Main footer */}
      <div className="bg-[#232F3E] py-10 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-bold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-1.5">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="text-[#CCC] text-xs hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Middle divider */}
      <div className="bg-[#37475A] py-4 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center">
            <span className="text-white font-extrabold text-xl tracking-tighter">
              Sho<span className="text-amazon-orange">lok</span>
            </span>
          </Link>

          {/* Language */}
          <button className="flex items-center gap-1.5 border border-gray-500 text-white text-xs px-3 py-1.5 rounded hover:border-white transition-colors">
            <FiGlobe size={14} />
            <span>English</span>
          </button>

          {/* Country */}
          <button className="flex items-center gap-1.5 border border-gray-500 text-white text-xs px-3 py-1.5 rounded hover:border-white transition-colors">
            🇧🇩 <span>Bangladesh</span>
          </button>

          {/* Social */}
          <div className="flex items-center gap-3 ml-auto">
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <Icon key={i} className="text-gray-400 hover:text-white cursor-pointer transition-colors" size={18} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <div className="bg-[#131921] py-5 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-3">
            {[
              'Conditions of Use', 'Privacy Notice', 'Interest-Based Ads',
              'Cookie Preferences', 'Modern Slavery Statement',
            ].map((item) => (
              <Link key={item} to="/" className="text-[#CCC] text-xs hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
