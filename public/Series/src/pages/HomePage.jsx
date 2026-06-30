import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Tag } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import SectionHeader from '../components/SectionHeader';
import BookCard from '../components/BookCard';
import NovelCard from '../components/NovelCard';
import CategoryCard from '../components/CategoryCard';
import AuthorCard from '../components/AuthorCard';
import { books } from '../data/books';
import { novels } from '../data/novels';
import { categories } from '../data/categories';
import { authors } from '../data/authors';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function HomePage() {
  const popularBooks = books.filter((b) => b.isPopular).slice(0, 10);
  const newBooks = books.filter((b) => b.isNew).slice(0, 10);
  const trendingNovels = novels.filter((n) => n.isTrending).slice(0, 10);
  const editorChoice = books.filter((b) => b.isEditorChoice).slice(0, 8);
  const topAuthors = [...authors].sort((a, b) => b.followers - a.followers).slice(0, 8);
  const offerBooks = books.filter((b) => b.isDiscounted || b.isFree).slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <HeroSlider />

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-12">
        <SectionHeader title="আজকের জনপ্রিয়" subtitle="পাঠকদের সবচেয়ে পছন্দের বইগুলো" viewAllTo="/rankings" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {popularBooks.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mt-14 rounded-3xl bg-gradient-to-r from-gold-500 via-gold-400 to-brand-600 p-6 sm:p-8"
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 text-white">
            <Tag size={28} />
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">আজকের বিশেষ অফার</h2>
              <p className="text-sm text-white/85">ফ্রি বই ও বিশাল ছাড়ে প্রিয় বইগুলো সংগ্রহ করুন</p>
            </div>
          </div>
          <Link to="/offers" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 shadow-soft">
            সব অফার দেখুন
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {offerBooks.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-14">
        <SectionHeader title="নতুন প্রকাশ" subtitle="সদ্য প্রকাশিত বইগুলো দেখে নিন" viewAllTo="/new-releases" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {newBooks.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-14">
        <SectionHeader title="ট্রেন্ডিং ওয়েব নভেল" subtitle="পাঠকদের মুখে মুখে আলোচিত নভেলগুলো" viewAllTo="/novels" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {trendingNovels.map((n) => (
            <NovelCard key={n.id} novel={n} />
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-14">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles size={22} className="text-gold-500" />
          <h2 className="text-xl font-bold text-brand-950 dark:text-white sm:text-2xl">এডিটরস চয়েস</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {editorChoice.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-14">
        <SectionHeader title="বিষয়সমূহ" subtitle="আপনার পছন্দের ক্যাটাগরি বেছে নিন" viewAllTo="/categories" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </motion.section>

      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-14 mb-6">
        <SectionHeader title="জনপ্রিয় লেখকগণ" subtitle="বাংলাদেশের সেরা লেখকদের বই পড়ুন" viewAllTo="/authors" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {topAuthors.map((a) => (
            <AuthorCard key={a.id} author={a} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}

export default HomePage;
