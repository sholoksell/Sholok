// Central catalogue of everything inside this portal. The site search filters
// these entries so that searching returns the website's own pages/services.
// Fully bilingual: each entry carries both English and Bengali fields.

export type SearchCategory = 'Apps' | 'Shopping' | 'Media' | 'Info' | 'Tools' | 'Finance';

export interface SearchEntry {
  title: string;       // English title
  titleBn: string;     // Bengali title
  path: string;
  description: string;     // English description
  descriptionBn: string;   // Bengali description
  category: SearchCategory;
  keywords: string[];  // mixed EN + BN keywords
  external?: boolean;
}

/** Maps category key → Bengali label */
export const CATEGORY_BN: Record<string, string> = {
  All: 'সব',
  Apps: 'অ্যাপস',
  Shopping: 'কেনাকাটা',
  Media: 'মিডিয়া',
  Info: 'তথ্য',
  Tools: 'টুলস',
  Finance: 'অর্থনীতি',
};

/** Returns true if the string contains at least one Bengali Unicode character */
export function isBengaliScript(text: string): boolean {
  return /[\u0980-\u09FF]/.test(text);
}

export const SEARCH_INDEX: SearchEntry[] = [
  {
    title: 'Mail', titleBn: 'মেইল',
    path: '/mail', category: 'Apps',
    description: 'Send, receive and organise your emails in one inbox.',
    descriptionBn: 'ইমেইল পাঠান, গ্রহণ করুন এবং একটি ইনবক্সে সাজিয়ে রাখুন।',
    keywords: ['email', 'inbox', 'message', 'compose', 'mail', 'মেইল', 'ইমেইল', 'বার্তা', 'ইনবক্স', 'কম্পোজ'],
  },
  {
    title: 'Cafe', titleBn: 'ক্যাফে',
    path: '/cafe', category: 'Info',
    description: 'Discover cafés, coffee shops and restaurants near you.',
    descriptionBn: 'কাছের ক্যাফে, কফি শপ এবং রেস্তোরাঁ খুঁজুন।',
    keywords: ['coffee', 'restaurant', 'food', 'dining', 'cafe', 'ক্যাফে', 'কফি', 'রেস্তোরাঁ', 'খাবার', 'ডাইনিং'],
  },
  {
    title: 'Blog', titleBn: 'ব্লগ',
    path: '/blog', category: 'Media',
    description: 'Read and write articles, stories and blog posts.',
    descriptionBn: 'নিবন্ধ, গল্প এবং ব্লগ পোস্ট পড়ুন ও লিখুন।',
    keywords: ['article', 'post', 'writing', 'story', 'blog', 'ব্লগ', 'নিবন্ধ', 'লেখা', 'গল্প', 'পোস্ট'],
  },
  {
    title: 'Shopping', titleBn: 'কেনাকাটা',
    path: '/shopping/', category: 'Shopping', external: true,
    description: 'Browse and buy products from the online store.',
    descriptionBn: 'অনলাইন স্টোর থেকে পণ্য ব্রাউজ করুন এবং কিনুন।',
    keywords: ['buy', 'store', 'product', 'ecommerce', 'shop', 'cart', 'কেনাকাটা', 'দোকান', 'পণ্য', 'শপিং', 'কার্ট', 'কিনুন'],
  },
  {
    title: 'News', titleBn: 'খবর',
    path: '/news', category: 'Info',
    description: 'Latest headlines, breaking news and current affairs.',
    descriptionBn: 'সর্বশেষ শিরোনাম, ব্রেকিং নিউজ এবং সাম্প্রতিক ঘটনাবলী।',
    keywords: ['headline', 'breaking', 'current affairs', 'newspaper', 'news', 'খবর', 'সংবাদ', 'শিরোনাম', 'ব্রেকিং', 'পত্রিকা'],
  },
  {
    title: 'Maps', titleBn: 'ম্যাপস',
    path: '/maps', category: 'Tools',
    description: 'Find locations, get directions and explore places.',
    descriptionBn: 'অবস্থান খুঁজুন, দিকনির্দেশ পান এবং জায়গা অন্বেষণ করুন।',
    keywords: ['location', 'direction', 'navigation', 'place', 'route', 'map', 'ম্যাপ', 'মানচিত্র', 'অবস্থান', 'দিকনির্দেশ', 'রাস্তা'],
  },
  {
    title: 'Webtoon', titleBn: 'ওয়েবটুন',
    path: '/webtoon', category: 'Media',
    description: 'Read comics, manga and manhwa series.',
    descriptionBn: 'কমিক্স, মাঙ্গা এবং মানহোয়া পড়ুন।',
    keywords: ['comic', 'manga', 'manhwa', 'cartoon', 'webtoon', 'ওয়েবটুন', 'কমিক্স', 'কার্টুন', 'মাঙ্গা'],
  },
  {
    title: 'Smart Store', titleBn: 'স্মার্ট স্টোর',
    path: '/smartstore', category: 'Shopping',
    description: 'A marketplace of stores and independent vendors.',
    descriptionBn: 'দোকান ও স্বতন্ত্র বিক্রেতাদের মার্কেটপ্লেস।',
    keywords: ['marketplace', 'vendor', 'store', 'product', 'স্মার্ট স্টোর', 'বাজার', 'বিক্রেতা', 'মার্কেট'],
  },
  {
    title: 'Pay', titleBn: 'পেমেন্ট',
    path: '/pay', category: 'Finance',
    description: 'Make payments, send money and manage your wallet.',
    descriptionBn: 'পেমেন্ট করুন, টাকা পাঠান এবং ওয়ালেট পরিচালনা করুন।',
    keywords: ['payment', 'wallet', 'money', 'transaction', 'send', 'pay', 'পেমেন্ট', 'টাকা', 'ওয়ালেট', 'লেনদেন', 'পাঠান'],
  },
  {
    title: 'Music', titleBn: 'মিউজিক',
    path: '/music', category: 'Media',
    description: 'Listen to songs, albums and playlists.',
    descriptionBn: 'গান, অ্যালবাম এবং প্লেলিস্ট শুনুন।',
    keywords: ['song', 'audio', 'playlist', 'album', 'sound', 'music', 'মিউজিক', 'গান', 'সংগীত', 'অ্যালবাম'],
  },
  {
    title: 'Video Platform', titleBn: 'ভিডিও প্ল্যাটফর্ম',
    path: '/tv', category: 'Media',
    description: 'Watch and upload videos, shorts and live streams.',
    descriptionBn: 'ভিডিও, শর্টস এবং লাইভ স্ট্রিম দেখুন ও আপলোড করুন।',
    keywords: ['video', 'watch', 'stream', 'tv', 'youtube', 'shorts', 'live', 'ভিডিও', 'টিভি', 'লাইভ', 'দেখুন', 'শর্টস'],
  },
  {
    title: 'Series', titleBn: 'সিরিজ',
    path: '/series', category: 'Media',
    description: 'Read books, novels and ongoing series.',
    descriptionBn: 'বই, উপন্যাস এবং চলমান সিরিজ পড়ুন।',
    keywords: ['book', 'novel', 'reading', 'series', 'সিরিজ', 'বই', 'উপন্যাস', 'পড়া'],
  },
  {
    title: 'Translate', titleBn: 'অনুবাদ',
    path: '/translate', category: 'Tools',
    description: 'Translate text between many languages.',
    descriptionBn: 'বিভিন্ন ভাষার মধ্যে টেক্সট অনুবাদ করুন।',
    keywords: ['translation', 'language', 'convert', 'translate', 'অনুবাদ', 'ভাষা', 'ট্রান্সলেট', 'রূপান্তর'],
  },
  {
    title: 'Dictionary', titleBn: 'অভিধান',
    path: '/dictionary', category: 'Tools',
    description: 'Look up word meanings, pronunciation and translations.',
    descriptionBn: 'শব্দের অর্থ, উচ্চারণ এবং অনুবাদ খুঁজুন।',
    keywords: ['word', 'meaning', 'definition', 'pronunciation', 'dictionary', 'ডিকশনারি', 'অভিধান', 'শব্দ', 'অর্থ', 'উচ্চারণ'],
  },
  {
    title: 'Finance', titleBn: 'অর্থনীতি',
    path: '/finance', category: 'Finance',
    description: 'Track stocks, markets and your investments.',
    descriptionBn: 'শেয়ার, বাজার এবং আপনার বিনিয়োগ ট্র্যাক করুন।',
    keywords: ['stock', 'market', 'investment', 'money', 'trading', 'finance', 'ফাইন্যান্স', 'শেয়ার', 'বাজার', 'বিনিয়োগ', 'অর্থ'],
  },
  {
    title: 'Sports', titleBn: 'খেলাধুলা',
    path: '/sports', category: 'Info',
    description: 'Live scores, fixtures and sports news.',
    descriptionBn: 'লাইভ স্কোর, ফিক্সচার এবং খেলাধুলার খবর।',
    keywords: ['game', 'score', 'match', 'football', 'cricket', 'sports', 'খেলা', 'স্কোর', 'ক্রিকেট', 'ফুটবল', 'খেলাধুলা', 'ম্যাচ'],
  },
  {
    title: 'Weather', titleBn: 'আবহাওয়া',
    path: '/weather', category: 'Info',
    description: 'Forecasts, temperature and climate updates.',
    descriptionBn: 'পূর্বাভাস, তাপমাত্রা এবং আবহাওয়া আপডেট।',
    keywords: ['forecast', 'temperature', 'climate', 'rain', 'weather', 'আবহাওয়া', 'তাপমাত্রা', 'বৃষ্টি', 'পূর্বাভাস'],
  },
  {
    title: 'Real Estate', titleBn: 'রিয়েল এস্টেট',
    path: '/realestate', category: 'Shopping',
    description: 'Buy, sell or rent homes, apartments and property.',
    descriptionBn: 'বাড়ি, অ্যাপার্টমেন্ট এবং সম্পত্তি কিনুন, বিক্রি করুন বা ভাড়া নিন।',
    keywords: ['property', 'home', 'apartment', 'rent', 'buy', 'house', 'real estate', 'রিয়েল এস্টেট', 'বাড়ি', 'ফ্ল্যাট', 'ভাড়া', 'সম্পত্তি', 'অ্যাপার্টমেন্ট'],
  },
  {
    title: 'Knowledge iN', titleBn: 'জ্ঞান ইন',
    path: '/qna', category: 'Info',
    description: 'Ask questions and get answers from the community.',
    descriptionBn: 'সম্প্রদায়ের কাছ থেকে প্রশ্ন করুন এবং উত্তর পান।',
    keywords: ['question', 'answer', 'q&a', 'qna', 'help', 'knowledge', 'প্রশ্ন', 'উত্তর', 'জ্ঞান', 'সাহায্য', 'কমিউনিটি'],
  },
  {
    title: 'Admin Panel', titleBn: 'অ্যাডমিন প্যানেল',
    path: '/home/admin/', category: 'Tools', external: true,
    description: 'Multi-vendor super admin: manage vendors, products, orders and payments.',
    descriptionBn: 'মাল্টি-ভেন্ডার সুপার অ্যাডমিন: বিক্রেতা, পণ্য, অর্ডার এবং পেমেন্ট পরিচালনা করুন।',
    keywords: ['admin', 'dashboard', 'vendor', 'manage', 'panel', 'super admin', 'অ্যাডমিন', 'প্যানেল', 'ড্যাশবোর্ড', 'বিক্রেতা', 'পরিচালনা'],
  },
  {
    title: 'Job Portal', titleBn: 'জব পোর্টাল',
    path: '/job-portal/', category: 'Tools', external: true,
    description: 'Find jobs, post vacancies and build your career.',
    descriptionBn: 'চাকরি খুঁজুন, শূন্যপদ পোস্ট করুন এবং ক্যারিয়ার গড়ুন।',
    keywords: ['job', 'career', 'employment', 'hiring', 'vacancy', 'work', 'চাকরি', 'কাজ', 'নিয়োগ', 'ক্যারিয়ার', 'কর্মসংস্থান'],
  },
];

/**
 * Score & filter the index for a query.
 * - Detects whether the query uses Bengali script and weights matching fields accordingly.
 * - When language === 'BN', results are sorted with Bengali-field matches first.
 * Higher score = better match.
 */
export function searchSite(query: string, language: 'EN' | 'BN' = 'EN'): SearchEntry[] {
  const q = query.trim();
  if (!q) return [];

  const qLower = q.toLowerCase();
  const terms = qLower.split(/\s+/);
  const queryIsBengali = isBengaliScript(q);

  const scored = SEARCH_INDEX.map((entry) => {
    // Pick primary/secondary fields based on whether query is in Bengali
    const priTitle  = (queryIsBengali ? entry.titleBn  : entry.title).toLowerCase();
    const secTitle  = (queryIsBengali ? entry.title    : entry.titleBn).toLowerCase();
    const priDesc   = (queryIsBengali ? entry.descriptionBn : entry.description).toLowerCase();
    const secDesc   = (queryIsBengali ? entry.description   : entry.descriptionBn).toLowerCase();
    const allFields = [entry.title, entry.titleBn, entry.description, entry.descriptionBn, ...entry.keywords].join(' ').toLowerCase();

    let score = 0;
    for (const term of terms) {
      // Primary title — strongest signal
      if (priTitle === term)             score += 100;
      else if (priTitle.startsWith(term)) score += 55;
      else if (priTitle.includes(term))   score += 32;

      // Secondary title — cross-language bonus
      if (secTitle === term)              score += 40;
      else if (secTitle.startsWith(term)) score += 20;
      else if (secTitle.includes(term))   score += 10;

      // Keywords — unified list (already has both EN and BN keywords)
      if (entry.keywords.some((k) => k.toLowerCase() === term))         score += 28;
      else if (entry.keywords.some((k) => k.toLowerCase().includes(term))) score += 14;

      // Descriptions
      if (priDesc.includes(term))  score += 8;
      if (secDesc.includes(term))  score += 3;

      // Catch-all
      if (allFields.includes(term)) score += 1;
    }
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);
}
