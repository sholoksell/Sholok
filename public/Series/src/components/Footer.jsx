import { Link } from 'react-router-dom';
import { BookOpen, Mail } from 'lucide-react';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="mt-16 border-t border-black/5 bg-white dark:border-white/10 dark:bg-brand-950">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-brand-700 dark:text-gold-400">
            <BookOpen size={24} />
            <span className="text-lg font-bold text-gradient">পাঠশালা</span>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            বাংলাদেশের পাঠকদের জন্য প্রিমিয়াম ডিজিটাল লাইব্রেরি ও ওয়েব নভেল প্ল্যাটফর্ম। হাজারো বই ও নভেল এক জায়গায়।
          </p>
          <div className="mt-4 flex gap-3">
            {[FaFacebookF, FaYoutube, FaInstagram, Mail].map((Icon, i) => (
              <span key={i} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-600 hover:text-white dark:bg-white/10 dark:text-gold-400">
                <Icon size={16} />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-brand-950 dark:text-white">দ্রুত লিংক</h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/categories" className="hover:text-brand-600">বিষয়সমূহ</Link></li>
            <li><Link to="/novels" className="hover:text-brand-600">ওয়েব নভেল</Link></li>
            <li><Link to="/rankings" className="hover:text-brand-600">র‍্যাঙ্কিং</Link></li>
            <li><Link to="/offers" className="hover:text-brand-600">আজকের অফার</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-brand-950 dark:text-white">পাঠক কর্নার</h3>
          <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/library" className="hover:text-brand-600">আমার লাইব্রেরি</Link></li>
            <li><Link to="/authors" className="hover:text-brand-600">লেখক তালিকা</Link></li>
            <li><Link to="/new-releases" className="hover:text-brand-600">নতুন প্রকাশ</Link></li>
            <li><Link to="/search" className="hover:text-brand-600">খুঁজুন</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-brand-950 dark:text-white">যোগাযোগ</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">ঢাকা, বাংলাদেশ</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">support@pathshala.bd</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
