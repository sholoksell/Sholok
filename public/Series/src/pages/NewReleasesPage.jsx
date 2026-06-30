import { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { books } from '../data/books';

const PAGE_SIZE = 18;

function NewReleasesPage() {
  const [page, setPage] = useState(1);
  const sorted = [...books].sort((a, b) => b.year - a.year || (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'নতুন প্রকাশ' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">নতুন প্রকাশ</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">সদ্য প্রকাশিত বইগুলো দেখে নিন</p>

      {pageItems.length === 0 ? (
        <EmptyState title="কোনো নতুন বই নেই" />
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

export default NewReleasesPage;
