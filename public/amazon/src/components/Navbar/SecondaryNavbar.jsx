import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { navCategories } from '../../data/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiMenu, FiChevronRight } from 'react-icons/fi';
import MegaMenu from './MegaMenu';

const SecondaryNavbar = () => {
  const [megaOpen, setMegaOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="bg-amazon-secondary relative z-40">
      <div className="flex items-center px-2 sm:px-4 max-w-[1800px] mx-auto overflow-x-auto scrollbar-none">
        {/* All menu button */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-white font-bold text-sm whitespace-nowrap hover:bg-white/10 transition-colors shrink-0"
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
          onClick={() => setMegaOpen((p) => !p)}
        >
          <FiMenu size={18} />
          <span>{t('menuAll')}</span>
        </button>

        {/* Category links */}
        <div className="flex items-center overflow-x-auto scrollbar-none gap-0.5">
          {navCategories.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="px-3 py-2 text-white text-sm whitespace-nowrap hover:bg-white/10 transition-colors rounded"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mega menu */}
      {megaOpen && (
        <div
          onMouseEnter={() => setMegaOpen(true)}
          onMouseLeave={() => setMegaOpen(false)}
        >
          <MegaMenu onClose={() => setMegaOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default SecondaryNavbar;
