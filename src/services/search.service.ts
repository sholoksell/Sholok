// All calls go through Vite's proxy: /api → http://localhost:5001/api
const HOME_API = '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SuggestionItem {
  type: 'product' | 'category';
  name: string;      // English
  nameBn: string;    // Bengali (falls back to name if unavailable)
  slug: string;
  thumbnail?: string;
  regularPrice?: number;
  salePrice?: number | null;
  icon?: string;
}

export interface ProductResult {
  _id: string;
  name: string;
  nameBn: string;
  slug: string;
  thumbnail: string;
  regularPrice: number;
  salePrice: number | null;
  brand: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  categoryId: { name: string; nameBn: string; slug: string } | null;
}

export interface CategoryResult {
  _id: string;
  name: string;
  nameBn: string;
  slug: string;
  icon: string;
  image?: string;
}

export interface SearchResponse {
  products: ProductResult[];
  categories: CategoryResult[];
  total: number;
  page: number;
  limit: number;
}

export interface AISearchResponse {
  success: boolean;
  answer?: string | null;
  products: SuggestionItem[];
  categories: SuggestionItem[];
  interpretedQuery?: string;
  originalQuery?: string;
  message?: string;
  configError?: boolean;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns the localised display name.
 * The search keyword language does NOT affect this — only the site language does.
 */
export function getLocalizedName(
  item: { name?: string; nameBn?: string },
  lang: 'EN' | 'BN'
): string {
  if (lang === 'BN') return item.nameBn?.trim() || item.name?.trim() || '';
  return item.name?.trim() || item.nameBn?.trim() || '';
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const searchService = {
  /**
   * Full search — queries MongoDB across all bilingual product & category fields.
   * @param q     Primary search term (user's raw input)
   * @param page  Page number
   * @param limit Results per page
   * @param qEn   Secondary search term (e.g. Bengali transliteration of Banglish)
   */
  search: async (q: string, page = 1, limit = 20, qEn?: string): Promise<SearchResponse> => {
    if (!q.trim()) return { products: [], categories: [], total: 0, page: 1, limit };
    const params = new URLSearchParams({ q: q.trim(), page: String(page), limit: String(limit) });
    if (qEn?.trim()) params.set('qEn', qEn.trim());
    const res = await fetch(`${HOME_API}/search?${params.toString()}`);
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  },

  /**
   * Autocomplete suggestions — debounced on the component side.
   * @param q       Partial query (user's raw text)
   * @param qEn     Bengali equivalent for bilingual matching
   * @param signal  AbortSignal for request cancellation
   */
  getSuggestions: async (q: string, qEn?: string, signal?: AbortSignal): Promise<SuggestionItem[]> => {
    if (!q.trim()) return [];
    const params = new URLSearchParams({ q: q.trim() });
    if (qEn?.trim()) params.set('qEn', qEn.trim());
    try {
      const res = await fetch(`${HOME_API}/search/suggestions?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.suggestions)) return data.suggestions;
      if (Array.isArray(data?.products)) return data.products;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;  // re-throw so caller can detect cancellation
      return [];
    }
  },

  /**
   * AI-powered natural language search.
   * Falls back gracefully if the AI endpoint is not available.
   */
  aiSearch: async (query: string, language: 'EN' | 'BN' = 'EN'): Promise<AISearchResponse> => {
    const res = await fetch(`${HOME_API}/search/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim(), language }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`AI search failed: ${res.status}`);
    return res.json();
  },

  /**
   * Image-based search — uploads an image file.
   * Returns a query string and/or results if image recognition is available.
   */
  imageSearch: async (file: File): Promise<{ success: boolean; query?: string; message?: string; products?: SuggestionItem[]; categories?: SuggestionItem[] }> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${HOME_API}/search/image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(20000),
    });
    if (res.status === 404) {
      return { success: false, message: 'Image search coming soon' };
    }
    if (!res.ok) throw new Error(`Image search failed: ${res.status}`);
    return res.json();
  },
};
