import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

function SectionHeader({ title, subtitle, viewAllTo }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-brand-950 dark:text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link to={viewAllTo} className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-gold-400">
          সব দেখুন
          <ChevronLeft size={14} />
        </Link>
      )}
    </div>
  );
}

export default SectionHeader;
