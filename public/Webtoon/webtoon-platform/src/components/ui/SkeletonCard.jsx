import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export default function SkeletonCard() {
  const { darkMode } = useApp();
  const base = darkMode ? 'bg-gray-800' : 'bg-gray-200';
  const shine = darkMode ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  return (
    <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <motion.div
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className={`w-full aspect-[3/4] ${shine}`}
        style={{ backgroundSize: '200% 100%' }}
      />
      <div className="p-3 space-y-2">
        <div className={`h-4 rounded ${base} w-3/4`} />
        <div className={`h-3 rounded ${base} w-1/2`} />
        <div className={`h-3 rounded ${base} w-2/3`} />
      </div>
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <motion.div
      animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className="w-full h-[500px] rounded-2xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
      style={{ backgroundSize: '200% 100%' }}
    />
  );
}
