import { categories } from './categories';
import { authors } from './authors';

const novelTitles = [
  'রাজকন্যার অভিশাপ', 'নীল আকাশের নিচে', 'অন্ধকার রাজ্যের সম্রাট', 'হৃদয়ের গোপন কথা',
  'সাত সমুদ্র তেরো নদী', 'প্রতিশোধের আগুন', 'চাঁদনী রাতের প্রেম', 'যোদ্ধার উত্থান',
  'নিষিদ্ধ প্রেমের গল্প', 'মায়াবী জগতের কাহিনি', 'অভিশপ্ত প্রাসাদ', 'রাজসিংহাসনের লড়াই',
  'গোপন পরিচয়ের আড়ালে', 'এক টুকরো আকাশ', 'বরফরাজ্যের রহস্য', 'শেষ যোদ্ধার গল্প',
  'মেঘবালিকার ডায়েরি', 'অন্তিম যাত্রার পথে', 'প্রেম ও প্রতিশোধ', 'হারানো রাজ্যের সন্ধানে',
  'কালো জাদুর রহস্য', 'স্বপ্নের শহরে', 'বিদ্রোহী রাজকুমার', 'অশরীরী প্রেমকথা',
  'যুগান্তরের কাহিনি', 'লুকানো সত্যের সন্ধানে', 'অগ্নিকন্যার উপাখ্যান', 'দ্বৈত জীবনের গল্প',
  'মহাকালের যাত্রী', 'অন্তরালের সম্রাজ্ঞী',
];

const statusOptions = ['চলমান', 'সম্পূর্ণ', 'নতুন'];

function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const gradients = [
  'from-brand-600 via-brand-800 to-emerald2-900',
  'from-gold-500 via-brand-700 to-brand-900',
  'from-emerald2-600 via-brand-700 to-brand-950',
  'from-brand-500 via-gold-600 to-emerald2-800',
];

function generateNovels(count = 30) {
  const novels = [];
  for (let i = 0; i < count; i++) {
    const title = novelTitles[i % novelTitles.length];
    const author = seededShuffle(authors, i + 11)[0];
    const cat = categories[i % categories.length];
    const status = statusOptions[i % 3];
    const totalChapters = status === 'সম্পূর্ণ' ? 40 + (i % 60) : 10 + (i % 80);
    const rating = (3.6 + ((i * 11) % 14) / 10).toFixed(1);
    const views = 1000 + ((i * 977) % 500000);
    const isTrending = i % 4 === 0;
    const isNew = i % 5 === 0;

    const chapters = Array.from({ length: Math.min(totalChapters, 30) }, (_, ci) => ({
      id: `ch-${i + 1}-${ci + 1}`,
      number: ci + 1,
      title: `অধ্যায় ${ci + 1}: ${['নতুন শুরু', 'অপ্রত্যাশিত সাক্ষাৎ', 'গোপন ষড়যন্ত্র', 'রহস্যের জট', 'মুখোমুখি', 'বিশ্বাসঘাতকতা', 'নতুন আশা', 'চূড়ান্ত লড়াই'][ci % 8]}`,
      releaseDate: `২০২৪-${String(1 + (ci % 12)).padStart(2, '0')}-${String(1 + (ci % 28)).padStart(2, '0')}`,
      wordCount: 1500 + (ci % 5) * 300,
    }));

    novels.push({
      id: `novel-${i + 1}`,
      title: `${title}${i >= novelTitles.length ? ` পর্ব-${Math.floor(i / novelTitles.length) + 1}` : ''}`,
      slug: `novel-${i + 1}`,
      authorId: author.id,
      authorName: author.name,
      category: cat.name,
      categorySlug: cat.slug,
      description: `"${title}" একটি জনপ্রিয় ওয়েব নভেল যা পাঠকদের মুগ্ধ করেছে এর চমকপ্রদ কাহিনি ও চরিত্র চিত্রণের মাধ্যমে। প্রতি সপ্তাহে নতুন অধ্যায় প্রকাশিত হয়, যা পাঠকদের আগ্রহ ধরে রাখে।`,
      status,
      totalChapters,
      chapters,
      rating: Number(rating),
      views,
      isTrending,
      isNew,
      gradient: gradients[i % gradients.length],
      lastUpdated: `২০২৪-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`,
    });
  }
  return novels;
}

export const novels = generateNovels(30);
