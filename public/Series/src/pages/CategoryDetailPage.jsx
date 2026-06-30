import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { categories } from '../data/categories';
import { books } from '../data/books';

const PAGE_SIZE = 12;

function CategoryDetailPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const category = categories.find((c) => c.slug === slug);
  const filtered = books.filter((b) => b.categorySlug === slug);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState title="ক্যাটাগরি খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'বিষয়সমূহ', to: '/categories' }, { label: category.name }]} />
      <div className={`mb-8 flex items-center gap-4 rounded-3xl bg-gradient-to-br ${category.color} p-6 sm:p-8`}>
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{category.name}</h1>
          <p className="text-sm text-white/85">{filtered.length} টি বই পাওয়া গেছে</p>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="এই বিষয়ে কোনো বই নেই" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {pageItems.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
          <div className="mt-10">
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

export default CategoryDetailPage;
