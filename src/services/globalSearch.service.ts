/**
 * Global Integrated Search Service
 *
 * Fans out to every available Sholok data source simultaneously via
 * Promise.allSettled, so if any backend is down the rest still contribute.
 *
 * Sources:
 *  1. Portal services   — static, always instant (searchIndex.ts)
 *  2. Shopping backend  — products + categories + brands via /api/search/suggestions
 *                         (Banglish handled server-side in Node.js/Express/MySQL)
 *  3. Blog backend      — posts (MySQL blog_db)
 *  4. Dictionary        — word meanings (in-memory)
 */

import { searchSite } from '@/lib/searchIndex';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlobalSuggestionType = 'product' | 'category' | 'brand' | 'service' | 'blog' | 'dictionary';

export interface GlobalSuggestionItem {
  type: GlobalSuggestionType;
  name: string;
  nameBn: string;
  slug?: string;
  url?: string;
  thumbnail?: string;
  icon?: string;
  regularPrice?: number;
  salePrice?: number | null;
  categoryName?: string;
}

// ─── Type metadata ─────────────────────────────────────────────────────────────

export const GLOBAL_TYPE_META: Record<GlobalSuggestionType, { icon: string; label: string; labelBn: string }> = {
  product:    { icon: '🛍️',  label: 'Product',    labelBn: 'পণ্য'       },
  category:   { icon: '📂',  label: 'Category',   labelBn: 'বিভাগ'      },
  brand:      { icon: '🏷️',  label: 'Brand',      labelBn: 'ব্র্যান্ড'  },
  service:    { icon: '🌐',  label: 'Sholok',     labelBn: 'সেবা'       },
  blog:       { icon: '📝',  label: 'Blog',       labelBn: 'ব্লগ'       },
  dictionary: { icon: '📖',  label: 'Dictionary', labelBn: 'অভিধান'     },
};

// ─── API prefixes ─────────────────────────────────────────────────────────────

const HOME_API = '/api';
const BLOG_API = '/blog-api';

// ─── Source: Portal Services ──────────────────────────────────────────────────

function searchPortalServices(q: string, language: 'EN' | 'BN'): GlobalSuggestionItem[] {
  return searchSite(q, language)
    .slice(0, 3)
    .map(e => ({
      type: 'service' as GlobalSuggestionType,
      name:   e.title,
      nameBn: e.titleBn,
      url:    e.path,
      icon:   '🌐',
    }));
}

// ─── Source: Shopping — /api/search/suggestions (Banglish handled by server) ──

async function fetchShoppingSuggestions(
  q: string,
  signal: AbortSignal | undefined,
): Promise<GlobalSuggestionItem[]> {
  const params = new URLSearchParams({ q, limit: '8' });

  // Try dedicated suggestions endpoint first; fall back to main search endpoint
  let data: any;
  const resSugg = await fetch(`${HOME_API}/search/suggestions?${params}`, { signal });
  if (resSugg.ok) {
    const ct = resSugg.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      data = await resSugg.json();
    }
  }

  if (!data) {
    // Fallback: use the main search endpoint and reshape its response
    const resFull = await fetch(`${HOME_API}/search?q=${encodeURIComponent(q)}&limit=8`, { signal });
    if (!resFull.ok) return [];
    const ct = resFull.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) return [];
    const full = await resFull.json();
    data = {
      products:   full.products ?? [],
      categories: full.facets?.categories ?? [],
      brands:     full.facets?.brands ?? [],
    };
  }

  const products: GlobalSuggestionItem[] = (data.products ?? []).slice(0, 5).map((p: any) => ({
    type:         'product' as GlobalSuggestionType,
    name:         p.name     || '',
    nameBn:       p.nameBn   || p.name || '',
    slug:         p.slug     || '',
    thumbnail:    p.thumbnail || '',
    regularPrice: p.regular_price != null ? Number(p.regular_price) : undefined,
    salePrice:    p.sale_price    != null ? Number(p.sale_price)    : null,
    categoryName: p.category_name || '',
  }));

  const categories: GlobalSuggestionItem[] = (data.categories ?? []).slice(0, 3).map((c: any) => ({
    type:   'category' as GlobalSuggestionType,
    name:   c.name   || '',
    nameBn: c.nameBn || c.name || '',
    slug:   c.slug   || '',
    url:    `/shopping/category/${c.slug}`,
    icon:   '📂',
  }));

  const brands: GlobalSuggestionItem[] = (data.brands ?? []).slice(0, 2).map((b: any) => ({
    type:   'brand' as GlobalSuggestionType,
    name:   b.name  || '',
    nameBn: b.name  || '',
    slug:   b.slug  || '',
    url:    `/search?q=${encodeURIComponent(b.name || '')}&filter=brand`,
    icon:   '🏷️',
  }));

  return [...products, ...categories, ...brands];
}

// ─── Source: Blog ─────────────────────────────────────────────────────────────

async function fetchBlogSuggestions(
  q: string,
  signal: AbortSignal | undefined,
): Promise<GlobalSuggestionItem[]> {
  const res = await fetch(
    `${BLOG_API}/search/suggestions?q=${encodeURIComponent(q)}`,
    { signal },
  );
  if (!res.ok) return [];
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return [];
  const data = await res.json();
  const posts: any[] = data?.suggestions?.posts ?? [];
  return posts.slice(0, 3).map(p => ({
    type:   'blog' as GlobalSuggestionType,
    name:   p.title || '',
    nameBn: p.title || '',
    slug:   p.slug,
    url:    `/search?q=${encodeURIComponent(p.title || '')}&tab=blog`,
    icon:   '📝',
  }));
}

// ─── Source: Dictionary ───────────────────────────────────────────────────────

async function fetchDictionarySuggestions(
  q: string,
  signal: AbortSignal | undefined,
): Promise<GlobalSuggestionItem[]> {
  const res = await fetch(
    `${HOME_API}/dictionary/suggest?q=${encodeURIComponent(q)}&limit=2`,
    { signal },
  );
  if (!res.ok) return [];
  const data = await res.json();
  const words: any[] = Array.isArray(data) ? data : [];
  return words.slice(0, 2).map(w => ({
    type:   'dictionary' as GlobalSuggestionType,
    name:   w.en || q,
    nameBn: w.bn || w.en || q,
    url:    `/dictionary?word=${encodeURIComponent(w.en || q)}`,
    icon:   '📖',
  }));
}

// ─── Navigate helper ──────────────────────────────────────────────────────────

export function getItemUrl(item: GlobalSuggestionItem): { href?: string; to?: string } {
  switch (item.type) {
    case 'product':
      return { href: `/shopping/product/${item.slug}` };
    case 'category':
      return item.url?.startsWith('http')
        ? { href: item.url }
        : { to: item.url || `/search?q=${encodeURIComponent(item.name)}` };
    case 'brand':
      return item.url?.startsWith('http')
        ? { href: item.url }
        : { to: item.url || `/search?q=${encodeURIComponent(item.name)}` };
    case 'service':
      if (!item.url) return { to: '/' };
      return item.url.startsWith('http') ? { href: item.url } : { to: item.url };
    case 'blog':
      return { to: item.url || `/search?q=${encodeURIComponent(item.name)}&tab=blog` };
    case 'dictionary':
      return { to: item.url || `/dictionary?word=${encodeURIComponent(item.name)}` };
    default:
      return { to: `/search?q=${encodeURIComponent(item.name)}` };
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getGlobalSuggestions(
  q: string,
  _qEn: string | undefined,
  language: 'EN' | 'BN',
  signal?: AbortSignal,
): Promise<GlobalSuggestionItem[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];

  const services = searchPortalServices(trimmed, language);

  const [shoppingResult, blogResult, dictResult] = await Promise.allSettled([
    fetchShoppingSuggestions(trimmed, signal),
    fetchBlogSuggestions(trimmed, signal),
    fetchDictionarySuggestions(trimmed, signal),
  ]);

  for (const r of [shoppingResult, blogResult, dictResult]) {
    if (r.status === 'rejected' && r.reason?.name === 'AbortError') throw r.reason;
  }

  const shopping   = shoppingResult.status === 'fulfilled' ? shoppingResult.value : [];
  const blog       = blogResult.status     === 'fulfilled' ? blogResult.value     : [];
  const dictionary = dictResult.status     === 'fulfilled' ? dictResult.value     : [];

  const products   = shopping.filter(s => s.type === 'product').slice(0, 4);
  const categories = shopping.filter(s => s.type === 'category').slice(0, 2);
  const brands     = shopping.filter(s => s.type === 'brand').slice(0, 2);

  return [
    ...services.slice(0, 2),
    ...products,
    ...categories,
    ...brands,
    ...blog.slice(0, 2),
    ...dictionary.slice(0, 1),
  ].slice(0, 12);
}
