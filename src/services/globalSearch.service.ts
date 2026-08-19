/**
 * Global Integrated Search Service
 *
 * Fans out to every available Sholok data source simultaneously via
 * Promise.allSettled, so if any backend is down the rest still contribute.
 *
 * Sources:
 *  1. Portal services   — static, always instant (searchIndex.ts)
 *  2. Shopping backend  — products + categories + brands (MySQL, /api/search)
 *  3. Blog backend      — posts (MySQL blog_db, port 5050)
 *  4. Dictionary        — word meanings (in-memory)
 */

import { searchSite } from '@/lib/searchIndex';
import { transliterateText } from '@/lib/transliteration';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GlobalSuggestionType = 'product' | 'category' | 'brand' | 'service' | 'blog' | 'dictionary';

export interface GlobalSuggestionItem {
  type: GlobalSuggestionType;
  name: string;       // English display name
  nameBn: string;     // Bengali display name (falls back to name)
  slug?: string;      // for internal navigation
  url?: string;       // full path to navigate to on click
  thumbnail?: string; // product image
  icon?: string;      // emoji icon for the type
  regularPrice?: number;
  salePrice?: number | null;
}

// ─── Type metadata (icons + bilingual labels) ──────────────────────────────

export const GLOBAL_TYPE_META: Record<GlobalSuggestionType, { icon: string; label: string; labelBn: string }> = {
  product:    { icon: '🛍️',  label: 'Product',    labelBn: 'পণ্য'       },
  category:   { icon: '📂',  label: 'Category',   labelBn: 'বিভাগ'      },
  brand:      { icon: '🏷️',  label: 'Brand',      labelBn: 'ব্র্যান্ড'  },
  service:    { icon: '🌐',  label: 'Sholok',     labelBn: 'সেবা'       },
  blog:       { icon: '📝',  label: 'Blog',       labelBn: 'ব্লগ'       },
  dictionary: { icon: '📖',  label: 'Dictionary', labelBn: 'অভিধান'     },
};

// ─── API prefixes (match vite.config.ts proxy) ────────────────────────────

const HOME_API = '/api';
const BLOG_API = '/blog-api';

// ─── Source: Portal Services (static, synchronous) ───────────────────────

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

// ─── Source: Shopping — products + categories + brands via /api/search ────
// Root cause of the previous autocomplete failure:
//   /api/search/suggestions crashed with
//   "Table 'sholokcp_shopping.popular_searches' doesn't exist"
// Fix: use the public /api/search endpoint which works and returns
//   products[] (with thumbnail, regular_price, sale_price) +
//   facets.categories[] + facets.brands[]

async function fetchShoppingSuggestions(
  q: string,
  qEn: string | undefined,
  signal: AbortSignal | undefined,
): Promise<GlobalSuggestionItem[]> {

  const fetchSearch = async (term: string): Promise<{
    products: GlobalSuggestionItem[];
    categories: GlobalSuggestionItem[];
    brands: GlobalSuggestionItem[];
  }> => {
    const params = new URLSearchParams({ q: term, limit: '8' });
    const res = await fetch(`${HOME_API}/search?${params}`, { signal });
    if (!res.ok) return { products: [], categories: [], brands: [] };
    const data = await res.json();

    const products: GlobalSuggestionItem[] = (data.products ?? []).slice(0, 5).map((p: any) => ({
      type: 'product' as GlobalSuggestionType,
      name:         p.name      || '',
      nameBn:       p.name      || '',
      slug:         p.slug      || '',
      thumbnail:    p.thumbnail || '',
      regularPrice: p.regular_price != null ? Number(p.regular_price) : undefined,
      salePrice:    p.sale_price    != null ? Number(p.sale_price)    : null,
    }));

    const categories: GlobalSuggestionItem[] = (data.facets?.categories ?? []).slice(0, 3).map((c: any) => ({
      type:   'category' as GlobalSuggestionType,
      name:   c.name   || '',
      nameBn: c.nameBn || c.name || '',
      slug:   c.slug   || '',
      url:    `/shopping/category/${c.slug}`,
      icon:   '📂',
    }));

    const brands: GlobalSuggestionItem[] = (data.facets?.brands ?? []).slice(0, 2).map((b: any) => ({
      type:   'brand' as GlobalSuggestionType,
      name:   b.name  || '',
      nameBn: b.name  || '',
      slug:   b.slug  || '',
      url:    `/search?q=${encodeURIComponent(b.name || '')}&filter=brand`,
      icon:   '🏷️',
    }));

    return { products, categories, brands };
  };

  // Primary search with the user's typed query
  const primary = await fetchSearch(q);

  // Banglish: if the query transliterates to something different, also try that
  // e.g. "mobile" → "মোবাইল", "cha" → "চা"
  let extraProducts: GlobalSuggestionItem[] = [];
  if (qEn && qEn !== q) {
    try {
      const secondary = await fetchSearch(qEn);
      const primarySlugs = new Set(primary.products.map(p => p.slug));
      extraProducts = secondary.products
        .filter(p => p.slug && !primarySlugs.has(p.slug))
        .slice(0, 2);
    } catch { /* ignore errors from secondary search */ }
  }

  // Also try a prefix-based Banglish transliteration of the raw query
  const rawBn = transliterateText(q);
  if (rawBn !== q && rawBn !== qEn) {
    try {
      const tertiary = await fetchSearch(rawBn);
      const existingSlugs = new Set([
        ...primary.products.map(p => p.slug),
        ...extraProducts.map(p => p.slug),
      ]);
      const moreProducts = tertiary.products
        .filter(p => p.slug && !existingSlugs.has(p.slug))
        .slice(0, 2);
      extraProducts = [...extraProducts, ...moreProducts];
    } catch { /* ignore */ }
  }

  return [
    ...primary.products,
    ...extraProducts,
    ...primary.categories,
    ...primary.brands,
  ];
}

// ─── Source: Blog — published posts (MySQL blog_db) ──────────────────────

async function fetchBlogSuggestions(
  q: string,
  signal: AbortSignal | undefined,
): Promise<GlobalSuggestionItem[]> {
  const res = await fetch(
    `${BLOG_API}/search/suggestions?q=${encodeURIComponent(q)}`,
    { signal },
  );
  if (!res.ok) return [];
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

// ─── Source: Dictionary — in-memory word lookup ───────────────────────────

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

// ─── Navigate helper (exported so SearchBar can use it) ──────────────────

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
      return item.url.startsWith('http')
        ? { href: item.url }
        : { to: item.url };
    case 'blog':
      return { to: item.url || `/search?q=${encodeURIComponent(item.name)}&tab=blog` };
    case 'dictionary':
      return { to: item.url || `/dictionary?word=${encodeURIComponent(item.name)}` };
    default:
      return { to: `/search?q=${encodeURIComponent(item.name)}` };
  }
}

// ─── Main export: fan-out global suggestions ──────────────────────────────

export async function getGlobalSuggestions(
  q: string,
  qEn: string | undefined,
  language: 'EN' | 'BN',
  signal?: AbortSignal,
): Promise<GlobalSuggestionItem[]> {
  const trimmed = q.trim();
  if (!trimmed) return [];

  // 1. Portal services — always instant, no network needed
  const services = searchPortalServices(trimmed, language);

  // 2. Fan out to all network sources simultaneously
  const [shoppingResult, blogResult, dictResult] = await Promise.allSettled([
    fetchShoppingSuggestions(trimmed, qEn, signal),
    fetchBlogSuggestions(trimmed, signal),
    fetchDictionarySuggestions(trimmed, signal),
  ]);

  // Re-throw AbortError so the caller can detect cancellation
  for (const r of [shoppingResult, blogResult, dictResult]) {
    if (r.status === 'rejected' && r.reason?.name === 'AbortError') throw r.reason;
  }

  const shopping   = shoppingResult.status === 'fulfilled' ? shoppingResult.value : [];
  const blog       = blogResult.status     === 'fulfilled' ? blogResult.value     : [];
  const dictionary = dictResult.status     === 'fulfilled' ? dictResult.value     : [];

  const products   = shopping.filter(s => s.type === 'product').slice(0, 4);
  const categories = shopping.filter(s => s.type === 'category').slice(0, 2);
  const brands     = shopping.filter(s => s.type === 'brand').slice(0, 2);

  // Merge in display priority order, cap at 12 total
  return [
    ...services.slice(0, 2),
    ...products,
    ...categories,
    ...brands,
    ...blog.slice(0, 2),
    ...dictionary.slice(0, 1),
  ].slice(0, 12);
}
