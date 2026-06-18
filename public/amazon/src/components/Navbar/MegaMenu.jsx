import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/categories';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const getMegaSections = (t) => [
  {
    title: t('digitalContent'),
    items: ['Echo & Alexa', 'Fire Tablets', 'Fire TV', 'Kindle E-Readers', 'Prime Video', 'Amazon Music', 'Audible'],
  },
  {
    title: t('shopByDepartment'),
    items: ['Electronics', 'Computers', 'Smart Home', 'Gaming', 'Fashion', 'Beauty', 'Sports'],
  },
  {
    title: t('programsFeatures'),
    items: [t('todaysDeals'), t('prime'), 'Gift Cards', t('subscribeSave'), 'Amazon Fresh', 'New Releases', t('bestSellers')],
  },
  {
    title: t('helpSettings'),
    items: [t('yourAccount'), t('customerService'), t('signIn'), t('manageContent'), t('wishList'), t('signOut')],
  },
];

const MegaMenu = ({ onClose }) => {
  const { t } = useLanguage();
  const megaSections = getMegaSections(t);

  return (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.15 }}
    className="absolute top-full left-0 z-50 w-80 bg-white shadow-amazon-lg border border-amazon-border"
  >
    {/* Header */}
    <div className="bg-amazon-dark px-4 py-3 flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center">
        <span className="text-white text-xs font-bold">U</span>
      </div>
      <span className="text-white text-sm font-bold">{t('helloSignIn')}</span>
    </div>

    {/* Sections */}
    <div className="overflow-y-auto max-h-[70vh]">
      {megaSections.map((section) => (
        <div key={section.title} className="border-b border-amazon-border last:border-0">
          <p className="px-4 pt-3 pb-1 text-amazon-dark font-bold text-sm">{section.title}</p>
          {section.items.map((item) => (
            <Link
              key={item}
              to={`/search?q=${encodeURIComponent(item)}`}
              onClick={onClose}
              className="flex items-center justify-between px-4 py-1.5 text-sm text-amazon-dark hover:bg-amazon-bg transition-colors"
            >
              {item}
              <FiChevronRight size={14} className="text-gray-400" />
            </Link>
          ))}
        </div>
      ))}

      {/* All categories */}
      <div className="border-t border-amazon-border">
        <p className="px-4 pt-3 pb-1 text-amazon-dark font-bold text-sm">{t('allCategories')}</p>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/search?category=${encodeURIComponent(cat.name)}`}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-amazon-dark hover:bg-amazon-bg transition-colors"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  </motion.div>
  );
};

export default MegaMenu;
