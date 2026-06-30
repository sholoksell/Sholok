import { categories } from './categories';

const firstNames = [
  'রবীন্দ্রনাথ', 'কাজী', 'হুমায়ূন', 'জহির', 'সেলিনা', 'আনিসুল', 'মুহাম্মদ', 'শওকত',
  'বুদ্ধদেব', 'তসলিমা', 'শাহাদুজ্জামান', 'ইমদাদুল', 'মুহম্মদ', 'সৈয়দ', 'রিজিয়া',
  'হরিশংকর', 'সুনীল', 'আখতারুজ্জামান', 'মাহমুদুল', 'নির্মলেন্দু', 'ফরহাদ', 'মনজুরুল',
  'রাবেয়া', 'শামসুর', 'আল', 'আব্দুল', 'নাসরীন', 'ফারজানা', 'তানভীর', 'রুমানা',
];
const lastNames = [
  'ঠাকুর', 'নজরুল', 'আহমেদ', 'রায়হান', 'হোসেন', 'ইসলাম', 'হক', 'চৌধুরী', 'বসু',
  'নাসরীন', 'করিম', 'আলম', 'রহমান', 'মাহমুদ', 'খান', 'সরকার', 'গুহ', 'মুনীর',
  'বন্দ্যোপাধ্যায়', 'মির্জা', 'কবির', 'শাহরিয়ার', 'জামান', 'হায়দার', 'ফারুক',
];

const bioTemplates = [
  (name) => `${name} একজন স্বনামধন্য বাংলা ভাষার লেখক, যিনি তাঁর গভীর জীবনবোধ ও সাবলীল গদ্যশৈলীর জন্য পাঠকমহলে সমাদৃত। তাঁর লেখায় বাংলার মাটি, মানুষ ও সংস্কৃতির এক অনন্য প্রতিচ্ছবি ফুটে ওঠে।`,
  (name) => `${name} দীর্ঘদিন ধরে বাংলা সাহিত্যের বিভিন্ন শাখায় লেখালেখি করছেন। উপন্যাস, গল্প ও প্রবন্ধে তাঁর অসংখ্য পাঠকপ্রিয় রচনা রয়েছে, যা নতুন প্রজন্মকে বইমুখী করে তুলেছে।`,
  (name) => `${name} এর লেখনীতে রয়েছে এক মুগ্ধতা ছড়ানো বর্ণনাভঙ্গি। সমাজ, ইতিহাস ও মানবিক সম্পর্কের জটিলতা তাঁর লেখায় বারবার উঠে এসেছে অসাধারণ দক্ষতায়।`,
  (name) => `পাঠকমহলে ${name} এক পরিচিত নাম। তাঁর রচনাশৈলী সহজ অথচ গভীর, যা প্রতিটি বয়সের পাঠকের কাছে সমানভাবে আবেদনময়।`,
];

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

function generateAuthors(count = 25) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 3 + 5) % lastNames.length];
    const name = `${first} ${last}`;
    const bio = bioTemplates[i % bioTemplates.length](name);
    const genreCount = 1 + (i % 3);
    const genres = seededShuffle(categories, i + 1).slice(0, genreCount).map((c) => c.name);
    list.push({
      id: `author-${i + 1}`,
      name,
      slug: `author-${i + 1}`,
      bio,
      photoInitial: first[0],
      birthYear: 1930 + ((i * 7) % 70),
      booksCount: 0,
      followers: 500 + ((i * 137) % 15000),
      genres,
      gradient: [
        'from-brand-500 to-gold-500',
        'from-emerald2-500 to-brand-600',
        'from-gold-500 to-brand-700',
        'from-brand-600 to-emerald2-600',
        'from-emerald2-600 to-gold-600',
      ][i % 5],
    });
  }
  return list;
}

export const authors = generateAuthors(25);
