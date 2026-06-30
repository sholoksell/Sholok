import Breadcrumb from '../components/Breadcrumb';
import AuthorCard from '../components/AuthorCard';
import { authors } from '../data/authors';

function AuthorsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumb items={[{ label: 'লেখক' }]} />
      <h1 className="mb-2 text-2xl font-bold text-brand-950 dark:text-white sm:text-3xl">সকল লেখক</h1>
      <p className="mb-8 text-gray-500 dark:text-gray-400">বাংলাদেশের সেরা লেখকদের তালিকা</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {authors.map((a) => (
          <AuthorCard key={a.id} author={a} />
        ))}
      </div>
    </div>
  );
}

export default AuthorsPage;
