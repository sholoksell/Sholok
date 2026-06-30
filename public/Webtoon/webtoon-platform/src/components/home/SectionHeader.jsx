import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function SectionHeader({ title, subtitle, linkTo, icon }) {
  const { darkMode } = useApp();
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
        </div>
        {subtitle && <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo}>
          <motion.button
            whileHover={{ x: 3 }}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      )}
    </div>
  );
}
