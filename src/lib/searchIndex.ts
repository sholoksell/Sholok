// Central catalogue of everything inside this portal. The site search filters
// these entries so that searching returns the website's own pages/services.

export interface SearchEntry {
  title: string;
  path: string;
  description: string;
  category: 'Apps' | 'Shopping' | 'Media' | 'Info' | 'Tools' | 'Finance';
  keywords: string[];
  external?: boolean; // true => full page navigation (sub-app), not a React route
}

export const SEARCH_INDEX: SearchEntry[] = [
  {
    title: 'Mail', path: '/mail', category: 'Apps',
    description: 'Send, receive and organise your emails in one inbox.',
    keywords: ['email', 'inbox', 'message', 'compose', 'মেইল', 'ইমেইল', 'বার্তা'],
  },
  {
    title: 'Cafe', path: '/cafe', category: 'Info',
    description: 'Discover cafés, coffee shops and restaurants near you.',
    keywords: ['coffee', 'restaurant', 'food', 'dining', 'cafe', 'ক্যাফে', 'কফি', 'রেস্তোরাঁ', 'খাবার'],
  },
  {
    title: 'Blog', path: '/blog', category: 'Media',
    description: 'Read and write articles, stories and blog posts.',
    keywords: ['article', 'post', 'writing', 'story', 'ব্লগ', 'নিবন্ধ', 'লেখা'],
  },
  {
    title: 'Shopping', path: '/shopping/', category: 'Shopping', external: true,
    description: 'Browse and buy products from the online store.',
    keywords: ['buy', 'store', 'product', 'ecommerce', 'shop', 'cart', 'কেনাকাটা', 'দোকান', 'পণ্য', 'শপিং'],
  },
  {
    title: 'News', path: '/news', category: 'Info',
    description: 'Latest headlines, breaking news and current affairs.',
    keywords: ['headline', 'breaking', 'current affairs', 'newspaper', 'খবর', 'সংবাদ', 'শিরোনাম'],
  },
  {
    title: 'Maps', path: '/maps', category: 'Tools',
    description: 'Find locations, get directions and explore places.',
    keywords: ['location', 'direction', 'navigation', 'place', 'route', 'ম্যাপ', 'মানচিত্র', 'অবস্থান', 'দিকনির্দেশ'],
  },
  {
    title: 'Webtoon', path: '/webtoon', category: 'Media',
    description: 'Read comics, manga and manhwa series.',
    keywords: ['comic', 'manga', 'manhwa', 'cartoon', 'ওয়েবটুন', 'কমিক্স', 'কার্টুন'],
  },
  {
    title: 'Smart Store', path: '/smartstore', category: 'Shopping',
    description: 'A marketplace of stores and independent vendors.',
    keywords: ['marketplace', 'vendor', 'store', 'product', 'স্মার্ট স্টোর', 'বাজার', 'বিক্রেতা'],
  },
  {
    title: 'Pay', path: '/pay', category: 'Finance',
    description: 'Make payments, send money and manage your wallet.',
    keywords: ['payment', 'wallet', 'money', 'transaction', 'send', 'পেমেন্ট', 'টাকা', 'ওয়ালেট', 'লেনদেন'],
  },
  {
    title: 'Music', path: '/music', category: 'Media',
    description: 'Listen to songs, albums and playlists.',
    keywords: ['song', 'audio', 'playlist', 'album', 'sound', 'মিউজিক', 'গান', 'সংগীত'],
  },
  {
    title: 'Video Platform', path: '/tv', category: 'Media',
    description: 'Watch and upload videos, shorts and live streams.',
    keywords: ['video', 'watch', 'stream', 'tv', 'youtube', 'shorts', 'live', 'ভিডিও', 'টিভি', 'লাইভ'],
  },
  {
    title: 'Series', path: '/series', category: 'Media',
    description: 'Read books, novels and ongoing series.',
    keywords: ['book', 'novel', 'reading', 'series', 'সিরিজ', 'বই', 'উপন্যাস'],
  },
  {
    title: 'Translate', path: '/translate', category: 'Tools',
    description: 'Translate text between many languages.',
    keywords: ['translation', 'language', 'convert', 'অনুবাদ', 'ভাষা'],
  },
  {
    title: 'Dictionary', path: '/dictionary', category: 'Tools',
    description: 'Look up word meanings, pronunciation and translations.',
    keywords: ['word', 'meaning', 'definition', 'pronunciation', 'language', 'ডিকশনারি', 'অভিধান', 'শব্দ', 'অর্থ'],
  },
  {
    title: 'Finance', path: '/finance', category: 'Finance',
    description: 'Track stocks, markets and your investments.',
    keywords: ['stock', 'market', 'investment', 'money', 'trading', 'ফাইন্যান্স', 'শেয়ার', 'বাজার', 'বিনিয়োগ'],
  },
  {
    title: 'Sports', path: '/sports', category: 'Info',
    description: 'Live scores, fixtures and sports news.',
    keywords: ['game', 'score', 'match', 'football', 'cricket', 'খেলা', 'স্কোর', 'ক্রিকেট', 'ফুটবল'],
  },
  {
    title: 'Weather', path: '/weather', category: 'Info',
    description: 'Forecasts, temperature and climate updates.',
    keywords: ['forecast', 'temperature', 'climate', 'rain', 'আবহাওয়া', 'তাপমাত্রা', 'বৃষ্টি'],
  },
  {
    title: 'Real Estate', path: '/realestate', category: 'Shopping',
    description: 'Buy, sell or rent homes, apartments and property.',
    keywords: ['property', 'home', 'apartment', 'rent', 'buy', 'house', 'রিয়েল এস্টেট', 'বাড়ি', 'ফ্ল্যাট', 'ভাড়া', 'সম্পত্তি'],
  },
  {
    title: 'Knowledge iN', path: '/qna', category: 'Info',
    description: 'Ask questions and get answers from the community.',
    keywords: ['question', 'answer', 'q&a', 'qna', 'help', 'প্রশ্ন', 'উত্তর', 'জ্ঞান'],
  },
  {
    title: 'Admin Panel', path: '/home/admin/', category: 'Tools', external: true,
    description: 'Multi-vendor super admin: manage vendors, products, orders and payments.',
    keywords: ['admin', 'dashboard', 'vendor', 'manage', 'panel', 'super admin', 'অ্যাডমিন', 'প্যানেল', 'ড্যাশবোর্ড', 'বিক্রেতা'],
  },
  {
    title: 'Job Portal', path: '/job-portal/', category: 'Tools', external: true,
    description: 'Find jobs, post vacancies and build your career.',
    keywords: ['job', 'career', 'employment', 'hiring', 'vacancy', 'work', 'চাকরি', 'কাজ', 'নিয়োগ', 'ক্যারিয়ার'],
  },
];

// Score & filter the index for a query. Higher score = better match.
export function searchSite(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);

  const scored = SEARCH_INDEX.map((entry) => {
    const haystackTitle = entry.title.toLowerCase();
    const haystackAll = [entry.title, entry.description, ...entry.keywords].join(' ').toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystackTitle === term) score += 100;
      else if (haystackTitle.startsWith(term)) score += 50;
      else if (haystackTitle.includes(term)) score += 30;
      if (entry.keywords.some((k) => k.toLowerCase() === term)) score += 25;
      else if (entry.keywords.some((k) => k.toLowerCase().includes(term))) score += 12;
      if (entry.description.toLowerCase().includes(term)) score += 5;
      if (haystackAll.includes(term)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);
}
