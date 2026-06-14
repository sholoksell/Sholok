import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSearch } from '../../context/SearchContext';
import { categories } from '../../data/categories';
import {
  FiSearch, FiChevronDown, FiShoppingCart, FiGlobe, FiMic,
} from 'react-icons/fi';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';

const Logo = () => (
  <Link to="/" className="nav-hover-border px-2 py-1 flex flex-col items-center shrink-0 select-none">
    <span className="text-white font-extrabold text-[22px] tracking-tighter leading-none">
      Sho<span className="text-amazon-orange">lok</span>
    </span>
    <span className="text-amazon-orange text-[10px] leading-none tracking-widest font-medium mt-0.5">
      ▸ E-commerce
    </span>
  </Link>
);

const accountLinks = [
  'Your Account', 'Your Orders', 'Your Wish List',
  'Prime Membership', 'Your Recommendations', 'Subscribe & Save',
];

const TopNavbar = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [showAccount, setShowAccount] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { totalItems } = useCart();
  const { setSearchTerm } = useSearch();
  const navigate = useNavigate();
  const accountRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setShowAccount(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchTerm(q);
    const params = new URLSearchParams({ q });
    if (category !== 'All') params.set('category', category);
    navigate(`/search?${params}`);
  };

  return (
    <nav className="bg-amazon-nav sticky top-0 z-50 shadow-md">
      <div className="flex items-center px-2 sm:px-4 py-2 gap-1 max-w-[1800px] mx-auto">

        {/* Logo */}
        <Logo />

        {/* Location – desktop */}
        <div className="nav-hover-border px-2 py-1 hidden lg:flex flex-col justify-end shrink-0 cursor-pointer">
          <span className="text-[#CCC] text-[11px] leading-none">Deliver to</span>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-sm leading-none">🇧🇩</span>
            <span className="text-white text-[13px] font-bold leading-none">Bangladesh</span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 flex h-10 rounded overflow-hidden min-w-0">
          {/* Category dropdown */}
          <div className="relative hidden sm:flex shrink-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-full bg-[#F3F3F3] border-r border-[#CDCDCD] text-amazon-dark text-xs px-2 appearance-none cursor-pointer hover:bg-[#E8E8E8] focus:outline-none pl-2 pr-6 rounded-l"
            >
              <option value="All">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-gray-600" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands and categories"
            className="flex-1 px-3 text-sm text-amazon-dark bg-white focus:outline-none placeholder-gray-400 min-w-0"
          />

          {/* Voice search icon */}
          <button
            type="button"
            aria-label="Voice search"
            className="hidden md:flex items-center bg-white border-l border-[#CDCDCD] px-2 text-gray-500 hover:text-amazon-dark transition-colors"
          >
            <FiMic size={15} />
          </button>

          {/* Search submit */}
          <button
            type="submit"
            className="bg-amazon-orange hover:bg-[#e88b00] px-4 flex items-center justify-center rounded-r transition-colors shrink-0"
            aria-label="Search"
          >
            <FiSearch size={18} className="text-amazon-dark" />
          </button>
        </form>

        {/* Language – desktop */}
        <div className="nav-hover-border px-1.5 py-1 hidden xl:flex items-center gap-0.5 shrink-0 cursor-pointer">
          <FiGlobe className="text-white text-sm" />
          <span className="text-white text-[13px] font-bold">EN</span>
          <FiChevronDown className="text-white text-xs" />
        </div>

        {/* Account – desktop */}
        <div
          ref={accountRef}
          className="nav-hover-border px-2 py-1 hidden sm:flex flex-col cursor-pointer relative shrink-0"
          onMouseEnter={() => setShowAccount(true)}
          onMouseLeave={() => setShowAccount(false)}
        >
          <span className="text-[#CCC] text-[11px] leading-none">Hello, sign in</span>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="text-white text-[13px] font-bold leading-none whitespace-nowrap">Account & Lists</span>
            <FiChevronDown className="text-white text-xs" />
          </div>

          <AnimatePresence>
            {showAccount && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-1 w-[320px] bg-white shadow-amazon-lg border border-amazon-border rounded z-50 p-4"
              >
                <div className="flex justify-center mb-3">
                  <Link to="/login" className="amazon-btn px-10 text-center text-sm">
                    Sign in
                  </Link>
                </div>
                <p className="text-center text-xs text-amazon-dark mb-3">
                  New customer?{' '}
                  <Link to="/login" className="text-amazon-blue hover:underline">
                    Start here.
                  </Link>
                </p>
                <hr className="border-amazon-border mb-3" />
                <div className="grid grid-cols-2 gap-2">
                  {accountLinks.map((item) => (
                    <Link
                      key={item}
                      to="/login"
                      className="text-xs text-amazon-dark hover:text-amazon-orange hover:underline py-0.5"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Returns & Orders */}
        <Link
          to="/"
          className="nav-hover-border px-2 py-1 hidden md:flex flex-col shrink-0"
        >
          <span className="text-[#CCC] text-[11px] leading-none">Returns</span>
          <span className="text-white text-[13px] font-bold leading-none whitespace-nowrap">& Orders</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className="nav-hover-border px-2 py-1 flex items-center gap-1 shrink-0 relative"
        >
          <div className="relative">
            <FiShoppingCart size={26} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 left-3.5 bg-amazon-orange text-white text-[11px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </div>
          <span className="text-white text-[13px] font-bold hidden md:block">Cart</span>
        </Link>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden px-2 pb-2">
        <form onSubmit={handleSearch} className="flex h-9 rounded overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 text-sm text-amazon-dark bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amazon-orange px-3 flex items-center justify-center"
          >
            <FiSearch size={16} className="text-amazon-dark" />
          </button>
        </form>
      </div>
    </nav>
  );
};

export default TopNavbar;
