import React from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '@/contexts/CategoryContext';
import CategoryIcon from '@/components/CategoryIcon';

export default function ShopByCategorySection() {
  const { categories } = useCategories();
  if (!categories || categories.length === 0) return null;

  const display = categories.filter(c => c.slug !== 'grocery').slice(0, 13);

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <p className="mt-1 text-sm text-gray-500">Browse all departments</p>
        </div>
        <Link to="/categories" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-13">
        {display.map((cat) => (
          <Link
            key={cat._id || cat.id}
            to={`/category/${cat.slug || cat._id}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center transition-colors hover:border-primary hover:bg-primary-soft"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <CategoryIcon icon={cat.icon} image={cat.image} name={cat.name} className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium leading-tight text-gray-700 group-hover:text-primary line-clamp-2">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
