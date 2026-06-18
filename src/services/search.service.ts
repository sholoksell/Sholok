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

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns the localised display name.
 * - lang = 'BN' → Bengali, falls back to English if BN is empty
 * - lang = 'EN' → English, falls back to Bengali if EN is empty
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
   * @param q     Primary search term (Bangla if BN mode was used)
   * @param page  Page number
   * @param limit Results per page
   * @param qEn   Original English term (passed when BN mode converts it)
   *              The backend searches BOTH q and qEn to maximise results.
   */
  search: async (q: string, page = 1, limit = 20, qEn?: string): Promise<SearchResponse> => {
    if (!q.trim()) {
      return { products: [], categories: [], total: 0, page: 1, limit };
    }
    const params = new URLSearchParams({
      q: q.trim(),
      page: String(page),
      limit: String(limit),
    });
    if (qEn?.trim()) params.set('qEn', qEn.trim());
    const res = await fetch(`${HOME_API}/search?${params.toString()}`);
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    return res.json();
  },

  /**
   * Autocomplete suggestions — debounced on the component side.
   * @param q    Partial query (Bangla or English)
   * @param qEn  Optional English equivalent for BN-mode typing
   */
  getSuggestions: async (q: string, qEn?: string): Promise<SuggestionItem[]> => {
    if (!q.trim()) return [];
    const params = new URLSearchParams({ q: q.trim() });
    if (qEn?.trim()) params.set('qEn', qEn.trim());
    const res = await fetch(`${HOME_API}/search/suggestions?${params.toString()}`);
    if (!res.ok) return [];
    return res.json();
  },
};

