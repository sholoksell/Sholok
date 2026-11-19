const BASE = '/news-api/public';

export interface NewsCategory {
  id: number;
  name_en: string;
  name_bn: string;
  slug: string;
  color: string;
}

export interface NewsArticle {
  id: number;
  title_en: string;
  title_bn: string;
  slug: string;
  summary_en: string | null;
  summary_bn: string | null;
  featured_image: string | null;
  view_count: number;
  publish_at: string;
  created_at: string;
  is_featured: number;
  is_breaking: number;
  category_name: string;
  category_slug: string;
  author_name: string;
}

export interface NewsPageResult {
  articles: NewsArticle[];
  total: number;
  page: number;
}

async function apiFetch<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`News API ${r.status}`);
  return r.json() as Promise<T>;
}

export const newsService = {
  getCategories: () => apiFetch<NewsCategory[]>('/categories'),

  getNews: (params: { category?: string; page?: number; limit?: number } = {}) => {
    const { category, page = 1, limit = 12 } = params;
    const sp = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) sp.set('category', category);
    return apiFetch<NewsPageResult>(`/news?${sp}`);
  },

  getBreaking: () => apiFetch<NewsArticle[]>('/breaking'),

  getLatest: (limit = 6) => apiFetch<NewsArticle[]>(`/latest?limit=${limit}`),

  getMostRead: (limit = 5) => apiFetch<NewsArticle[]>(`/most-read?limit=${limit}`),

  getImageUrl: (featured_image: string | null): string | null => {
    if (!featured_image) return null;
    if (featured_image.startsWith('http')) return featured_image;
    return `/news-api/news-uploads/${featured_image}`;
  },

  articleUrl: (slug: string) => `/news/article/${slug}`,
};

// Category accent color map (supplement API's color field)
const CAT_COLORS: Record<string, string> = {
  bangladesh:    '#D31710',
  international: '#5D0096',
  business:      '#0078D7',
  economy:       '#217346',
  technology:    '#E8A400',
  science:       '#1EA6B5',
  education:     '#6B46C1',
  health:        '#059669',
  sports:        '#EA580C',
  entertainment: '#DB2777',
  politics:      '#7C3AED',
  environment:   '#16A34A',
  lifestyle:     '#C2410C',
  'default':     '#5D0096',
};

export function getCategoryColor(slug: string): string {
  return CAT_COLORS[slug?.toLowerCase()] ?? CAT_COLORS['default'];
}

export function formatRelativeTime(isoStr: string, language: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (language === 'BN') {
    if (mins < 1)    return 'এইমাত্র';
    if (mins < 60)   return `${toBanglaNum(mins)} মিনিট আগে`;
    if (hours < 24)  return `${toBanglaNum(hours)} ঘণ্টা আগে`;
    return `${toBanglaNum(days)} দিন আগে`;
  }
  if (mins < 1)    return 'Just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

function toBanglaNum(n: number): string {
  return String(n).split('').map(d => '০১২৩৪৫৬৭৮৯'[+d] ?? d).join('');
}
