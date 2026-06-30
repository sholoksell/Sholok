import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sun, Moon, Coffee, Plus, Minus, Bookmark, ArrowLeft, Volume2, Clock, AlignLeft,
} from 'lucide-react';
import { books } from '../data/books';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../components/Toast';
import EmptyState from '../components/EmptyState';

const MODE_STYLES = {
  day: { bg: 'bg-white', text: 'text-gray-800' },
  night: { bg: 'bg-[#16121a]', text: 'text-gray-200' },
  sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#3a2f1d]' },
};

const FONT_FAMILIES = ['Hind Siliguri', 'Noto Sans Bengali', 'serif'];

const paragraphTemplates = [
  'একদিন সকালবেলা গ্রামের মেঠোপথ ধরে হেঁটে যাচ্ছিল রহিম। চারিদিকে সবুজ ধানক্ষেত, পাখির কলরব আর শিশিরভেজা বাতাস তাকে এক অন্যরকম প্রশান্তি দিচ্ছিল। হঠাৎ সে লক্ষ্য করল পথের ধারে একটি পুরনো বটগাছের নিচে কেউ একজন বসে আছে।',
  'কাহিনির এই অংশে চরিত্রগুলোর মধ্যে এক জটিল দ্বন্দ্ব দেখা দেয়। প্রত্যেকেই নিজের অবস্থান থেকে সঠিক মনে করলেও, পরিস্থিতি ক্রমেই জটিল হয়ে উঠছিল। লেখক এখানে অত্যন্ত দক্ষতার সাথে মানবিক সম্পর্কের নানা দিক তুলে ধরেছেন।',
  'রাত গভীর হতেই শহরের কোলাহল থেমে যায়। নিস্তব্ধতার মাঝে দূর থেকে ভেসে আসে কুকুরের ডাক আর রিকশার টুংটাং শব্দ। জানালার ধারে বসে থাকা মানুষটির মনে তখন হাজারো চিন্তা ভিড় করছিল।',
  'এই অধ্যায়ে আমরা দেখতে পাই কীভাবে একটি ছোট সিদ্ধান্ত সম্পূর্ণ কাহিনির গতিপথ পরিবর্তন করে দিতে পারে। লেখকের বর্ণনাভঙ্গি এখানে অত্যন্ত নিখুঁত, যা পাঠককে পুরোপুরি গল্পের ভেতরে টেনে নিয়ে যায়।',
  'বৃষ্টির শব্দে ঘুম ভাঙল তার। জানালার কাচ বেয়ে নামছিল অজস্র জলধারা। মনে পড়ে গেল ছোটবেলার সেই দিনগুলোর কথা, যখন বৃষ্টি দেখলেই খুশিতে নেচে উঠত মন।',
  'সমাজের নানা স্তরে ছড়িয়ে থাকা মানুষগুলোর জীবনযাত্রা এই অধ্যায়ে ফুটে উঠেছে অত্যন্ত বাস্তবভাবে। প্রতিটি চরিত্রের নিজস্ব গল্প আছে, নিজস্ব সংগ্রাম আছে, যা সামগ্রিকভাবে একটি সম্পূর্ণ চিত্র তৈরি করে।',
];

function ReadingPage() {
  const { id } = useParams();
  const book = books.find((b) => b.id === id);
  const { readingPrefs, updateReadingPrefs } = useTheme();
  const { toggleBookmark, isBookmarked, updateContinueReading } = useLibrary();
  const { showToast } = useToast();
  const [progress, setProgress] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleScroll() {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY - el.offsetTop;
      const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
      setProgress(Math.round(pct));
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [book]);

  useEffect(() => {
    if (!book) return;
    const interval = setInterval(() => updateContinueReading(book.id, progress), 5000);
    return () => clearInterval(interval);
  }, [book, progress, updateContinueReading]);

  const content = useMemo(() => {
    if (!book) return [];
    return book.tableOfContents.map((title, i) => ({
      title,
      paragraphs: [
        paragraphTemplates[i % paragraphTemplates.length],
        paragraphTemplates[(i + 2) % paragraphTemplates.length],
        paragraphTemplates[(i + 4) % paragraphTemplates.length],
      ],
    }));
  }, [book]);

  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="বইটি খুঁজে পাওয়া যায়নি" />
      </div>
    );
  }

  const marked = isBookmarked(book.id);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const mode = MODE_STYLES[readingPrefs.mode] || MODE_STYLES.day;

  function handleTTS() {
    setSpeaking((s) => !s);
    showToast(speaking ? 'পড়া বন্ধ করা হয়েছে' : 'টেক্সট-টু-স্পিচ চালু করা হয়েছে');
  }

  return (
    <div className={`min-h-screen ${mode.bg} ${mode.text}`}>
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-black/10">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="sticky top-1 z-40 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to={`/book/${book.id}`} className="flex items-center gap-1.5 text-sm font-medium opacity-80 hover:opacity-100">
          <ArrowLeft size={16} />
          ফিরে যান
        </Link>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => updateReadingPrefs({ mode: 'day' })} className={`grid h-8 w-8 place-items-center rounded-full ${readingPrefs.mode === 'day' ? 'bg-brand-500 text-white' : 'bg-black/5'}`} aria-label="দিন মোড">
            <Sun size={15} />
          </button>
          <button type="button" onClick={() => updateReadingPrefs({ mode: 'night' })} className={`grid h-8 w-8 place-items-center rounded-full ${readingPrefs.mode === 'night' ? 'bg-brand-500 text-white' : 'bg-black/5'}`} aria-label="রাত মোড">
            <Moon size={15} />
          </button>
          <button type="button" onClick={() => updateReadingPrefs({ mode: 'sepia' })} className={`grid h-8 w-8 place-items-center rounded-full ${readingPrefs.mode === 'sepia' ? 'bg-brand-500 text-white' : 'bg-black/5'}`} aria-label="সেপিয়া মোড">
            <Coffee size={15} />
          </button>
          <span className="mx-1 h-5 w-px bg-black/10" />
          <button type="button" onClick={() => updateReadingPrefs({ fontSize: Math.max(14, readingPrefs.fontSize - 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-black/5" aria-label="ফন্ট ছোট করুন">
            <Minus size={15} />
          </button>
          <span className="w-6 text-center text-xs">{readingPrefs.fontSize}</span>
          <button type="button" onClick={() => updateReadingPrefs({ fontSize: Math.min(30, readingPrefs.fontSize + 1) })} className="grid h-8 w-8 place-items-center rounded-full bg-black/5" aria-label="ফন্ট বড় করুন">
            <Plus size={15} />
          </button>
          <span className="mx-1 h-5 w-px bg-black/10" />
          <select
            value={readingPrefs.fontFamily}
            onChange={(e) => updateReadingPrefs({ fontFamily: e.target.value })}
            className="rounded-full bg-black/5 px-2 py-1.5 text-xs"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => updateReadingPrefs({ lineHeight: readingPrefs.lineHeight >= 2.2 ? 1.5 : readingPrefs.lineHeight + 0.2 })}
            className="grid h-8 w-8 place-items-center rounded-full bg-black/5"
            aria-label="লাইন উচ্চতা"
          >
            <AlignLeft size={15} />
          </button>
          <button type="button" onClick={handleTTS} className={`grid h-8 w-8 place-items-center rounded-full ${speaking ? 'bg-brand-500 text-white' : 'bg-black/5'}`} aria-label="শুনুন">
            <Volume2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => {
              toggleBookmark(book.id);
              showToast(marked ? 'বুকমার্ক সরানো হয়েছে' : 'বুকমার্ক করা হয়েছে');
            }}
            className={`grid h-8 w-8 place-items-center rounded-full ${marked ? 'bg-brand-500 text-white' : 'bg-black/5'}`}
            aria-label="বুকমার্ক"
          >
            <Bookmark size={15} className={marked ? 'fill-white' : ''} />
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-xs opacity-70">
        <span className="flex items-center gap-1">
          <Clock size={13} />
          {mins}:{String(secs).padStart(2, '0')} মিনিট পড়া হয়েছে
        </span>
        <span>{progress}% সম্পন্ন</span>
      </div>

      <article
        ref={containerRef}
        className="mx-auto max-w-3xl px-4 pb-24 pt-8"
        style={{ fontFamily: readingPrefs.fontFamily, fontSize: `${readingPrefs.fontSize}px`, lineHeight: readingPrefs.lineHeight }}
      >
        <h1 className="mb-2 text-2xl font-bold" style={{ fontSize: `${readingPrefs.fontSize + 8}px` }}>
          {book.title}
        </h1>
        <p className="mb-10 text-sm opacity-60">লেখক: {book.authorName}</p>

        {content.map((chapter, i) => (
          <section key={i} className="mb-12">
            <h2 className="mb-4 font-bold" style={{ fontSize: `${readingPrefs.fontSize + 4}px` }}>
              {chapter.title}
            </h2>
            {chapter.paragraphs.map((p, pi) => (
              <p key={pi} className="mb-4">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}

export default ReadingPage;
