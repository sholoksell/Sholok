import { useParams } from 'react-router-dom';
import { Calendar, BookOpen } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { publishers } from '../data/publishers';
import { books } from '../data/books';

function PublisherDetailPage() {
  const { id } = useParams();
  const publisher = publishers.find((p) => p.id === id);

  if (!publisher) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState title="প্রকাশনী খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  const publisherBooks = books.filter((b) => b.publisherId === publisher.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'প্রকাশনী' }, { label: publisher.name }]} />

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5 sm:flex-row sm:text-left">
        <div className={`grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${publisher.gradient} text-3xl font-bold text-white shadow-glow`}>
          {publisher.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950 dark:text-white">{publisher.name}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 sm:justify-start">
            <span className="flex items-center gap-1">
              <BookOpen size={15} />
              {publisher.booksCount} টি বই
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={15} />
              প্রতিষ্ঠা {publisher.establishedYear}
            </span>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">{publisher.description}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold text-brand-950 dark:text-white">প্রকাশিত বইসমূহ</h2>
        {publisherBooks.length === 0 ? (
          <EmptyState title="কোনো বই পাওয়া যায়নি" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {publisherBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PublisherDetailPage;
