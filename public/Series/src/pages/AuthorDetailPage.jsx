import { useParams } from 'react-router-dom';
import { Users, BookOpen } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import BookCard from '../components/BookCard';
import EmptyState from '../components/EmptyState';
import { authors } from '../data/authors';
import { books } from '../data/books';

function AuthorDetailPage() {
  const { id } = useParams();
  const author = authors.find((a) => a.id === id);

  if (!author) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState title="লেখককে খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  const authorBooks = books.filter((b) => b.authorId === author.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'লেখক', to: '/authors' }, { label: author.name }]} />

      <div className="flex flex-col items-center gap-4 rounded-3xl border border-black/5 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-white/5 sm:flex-row sm:text-left">
        <div className={`grid h-28 w-28 shrink-0 place-items-center rounded-full bg-gradient-to-br ${author.gradient} text-4xl font-bold text-white shadow-glow`}>
          {author.photoInitial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950 dark:text-white">{author.name}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 sm:justify-start">
            <span className="flex items-center gap-1">
              <BookOpen size={15} />
              {author.booksCount} টি বই
            </span>
            <span className="flex items-center gap-1">
              <Users size={15} />
              {author.followers.toLocaleString('bn-BD')} ফলোয়ার
            </span>
            <span>জন্ম: {author.birthYear}</span>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {author.genres.map((g) => (
              <span key={g} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-white/10 dark:text-gold-400">
                {g}
              </span>
            ))}
          </div>
          <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">{author.bio}</p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 text-xl font-bold text-brand-950 dark:text-white">{author.name} এর বইসমূহ</h2>
        {authorBooks.length === 0 ? (
          <EmptyState title="এই লেখকের কোনো বই নেই" />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {authorBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AuthorDetailPage;
