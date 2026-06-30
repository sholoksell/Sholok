import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-7xl font-bold text-gradient">৪০৪</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-950 dark:text-white">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">আপনি যে পৃষ্ঠাটি খুঁজছেন তা হয়তো মুছে ফেলা হয়েছে অথবা ভুল ঠিকানা।</p>
      <Link to="/" className="mt-6 flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft">
        <Home size={16} />
        হোমে ফিরে যান
      </Link>
    </div>
  );
}

export default NotFoundPage;
