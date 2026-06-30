import { Gift, Percent } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { books } from '../data/books';

function OffersPage() {
  const freeBooks = books.filter((b) => b.isFree);
  const discountedBooks = books.filter((b) => b.isDiscounted);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'অফার' }]} />
      <div className="mb-10 rounded-3xl bg-gradient-to-r from-gold-500 via-gold-400 to-brand-600 p-8 text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">আজকের বিশেষ অফার</h1>
        <p className="mt-2 text-sm text-white/85">ফ্রি বই ও বিশাল ছাড়ে প্রিয় বইগুলো সংগ্রহ করুন</p>
      </div>

      <section className="mb-14">
        <div className="mb-5 flex items-center gap-2">
          <Gift size={22} className="text-emerald2-600" />
          <h2 className="text-xl font-bold text-brand-950 dark:text-white">ফ্রি বই</h2>
        </div>
        {freeBooks.length === 0 ? (
          <EmptyState title="বর্তমানে কোনো ফ্রি বই নেই" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {freeBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center gap-2">
          <Percent size={22} className="text-brand-600" />
          <h2 className="text-xl font-bold text-brand-950 dark:text-white">ছাড়কৃত বই</h2>
        </div>
        {discountedBooks.length === 0 ? (
          <EmptyState title="বর্তমানে কোনো ছাড় নেই" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {discountedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default OffersPage;
