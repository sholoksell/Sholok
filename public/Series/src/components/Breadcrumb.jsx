import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

function Breadcrumb({ items }) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      <Link to="/" className="flex items-center gap-1 hover:text-brand-600">
        <Home size={14} />
        হোম
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronLeft size={14} />
          {item.to ? (
            <Link to={item.to} className="hover:text-brand-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-700 dark:text-gold-400">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
