// Universal Search Service — queries ALL Sholok backends in parallel

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductResult {
  _id: string; name: string; nameBn?: string; slug: string;
  thumbnail?: string;
  // admin-api returns a single 'price' field (sale price if set, else regular)
  price?: number;
  // customer-api returns separate regularPrice / salePrice
  regularPrice?: number; salePrice?: number | null;
  brand?: string; rating?: number; reviewCount?: number; stock?: number;
  categoryId?: { name: string; nameBn?: string; slug: string } | null;
}

export function getProductPrice(p: ProductResult): { display: number; original?: number } {
  if (p.price != null) return { display: p.price };
  const display   = p.salePrice ?? p.regularPrice ?? 0;
  const original  = p.salePrice && p.regularPrice ? p.regularPrice : undefined;
  return { display, original };
}

export interface CategoryResult {
  _id: string; name: string; nameBn?: string; slug: string; icon?: string;
}

export interface JobResult {
  _id: string; title: string; titleBn?: string; company: string;
  companyLogo?: string; location?: string; salary?: string;
  salaryMin?: number; salaryMax?: number; jobType?: string;
  category?: string; description?: string; createdAt?: string; status?: string;
}

export interface BlogPost {
  _id: string; title: string; titleBn?: string; slug: string;
  excerpt?: string; excerptBn?: string;
  coverImage?: { url?: string; thumbnail?: string };
  author?: { username?: string; displayName?: string; avatar?: string };
  category?: string; tags?: string[]; createdAt?: string; views?: number;
}

export interface VideoResult {
  _id: string; title: string; titleBn?: string; titleEn?: string;
  thumbnailPath?: string; duration?: number; views?: number;
  category?: string; isShort?: boolean;
  channel?: { name?: string; handle?: string; avatar?: string };
  uploader?: { username?: string; displayName?: string };
}

export interface StoreResult {
  _id: string; name: string; nameBn?: string; nameEn?: string;
  smartStore?: string; logo?: string; banner?: string;
  category?: string; description?: string; descriptionBn?: string;
  tags?: string[];
  stats?: { rating?: number; totalProducts?: number; totalSales?: number };
}

export interface MultivendorProduct {
  _id: string; name: string; nameBn?: string; slug?: string;
  price: number; originalPrice?: number;
  images?: string[]; rating?: number;
  categoryName?: string;
  store?: { name?: string; smartStore?: string; logo?: string };
  badge?: string; isFeatured?: boolean; isFlashSale?: boolean;
}

export interface UniversalSearchResults {
  // Shopping
  products: ProductResult[];
  categories: CategoryResult[];
  totalProducts: number;
  // Jobs
  jobs: JobResult[];
  totalJobs: number;
  // Blog
  blogPosts: BlogPost[];
  totalBlogPosts: number;
  // Video
  videos: VideoResult[];
  totalVideos: number;
  // Smart Store / Multi-vendor
  stores: StoreResult[];
  multivendorProducts: MultivendorProduct[];
  totalStores: number;
  totalMultivendorProducts: number;
  // Meta
  errors: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return fallback;
    const data = await res.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

export function getLocalizedName(
  item: { name?: string; nameBn?: string; nameEn?: string },
  lang: 'EN' | 'BN'
): string {
  if (lang === 'BN') return item.nameBn?.trim() || item.name?.trim() || '';
  return item.name?.trim() || item.nameBn?.trim() || '';
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const EMPTY: UniversalSearchResults = {
  products: [], categories: [], totalProducts: 0,
  jobs: [], totalJobs: 0,
  blogPosts: [], totalBlogPosts: 0,
  videos: [], totalVideos: 0,
  stores: [], multivendorProducts: [], totalStores: 0, totalMultivendorProducts: 0,
  errors: {},
};

export const universalSearchService = {

  async search(q: string, limit = 5): Promise<UniversalSearchResults> {
    const enc = encodeURIComponent(q.trim());
    if (!enc) return { ...EMPTY };

    const [shopRes, jobRes, blogRes, videoRes, mvProductRes, storeRes] =
      await Promise.allSettled([
        safeFetch<{ products: ProductResult[]; categories: CategoryResult[]; total: number }>(
          `/api/search?q=${enc}&limit=${limit}`,
          { products: [], categories: [], total: 0 }
        ),
        safeFetch<{ jobs: JobResult[]; total: number }>(
          `/jobportal-api/jobs?search=${enc}&limit=${limit}&page=1`,
          { jobs: [], total: 0 }
        ),
        safeFetch<{ success: boolean; posts?: BlogPost[]; total?: number }>(
          `/blog-api/search?q=${enc}&type=posts&limit=${limit}`,
          { success: false, posts: [], total: 0 }
        ),
        safeFetch<{ videos: VideoResult[]; pagination?: { total: number } }>(
          `/tv-api/videos?search=${enc}&limit=${limit}`,
          { videos: [], pagination: { total: 0 } }
        ),
        safeFetch<{ success: boolean; products?: MultivendorProduct[]; total?: number }>(
          `/multivendor-api/v1/products?search=${enc}&limit=${limit}`,
          { success: false, products: [], total: 0 }
        ),
        safeFetch<{ success: boolean; stores?: StoreResult[]; total?: number }>(
          `/multivendor-api/v1/stores?search=${enc}&limit=${limit}`,
          { success: false, stores: [], total: 0 }
        ),
      ]);

    const shop  = shopRes.status      === 'fulfilled' ? shopRes.value      : { products: [], categories: [], total: 0 };
    const job   = jobRes.status       === 'fulfilled' ? jobRes.value       : { jobs: [], total: 0 };
    const blog  = blogRes.status      === 'fulfilled' ? blogRes.value      : { success: false, posts: [], total: 0 };
    const video = videoRes.status     === 'fulfilled' ? videoRes.value     : { videos: [], pagination: { total: 0 } };
    const mvp   = mvProductRes.status === 'fulfilled' ? mvProductRes.value : { success: false, products: [], total: 0 };
    const store = storeRes.status     === 'fulfilled' ? storeRes.value     : { success: false, stores: [], total: 0 };

    return {
      products:              shop.products         ?? [],
      categories:            shop.categories        ?? [],
      totalProducts:         shop.total             ?? 0,
      jobs:                  job.jobs               ?? [],
      totalJobs:             job.total              ?? 0,
      blogPosts:             blog.posts             ?? [],
      totalBlogPosts:        blog.total             ?? 0,
      videos:                video.videos           ?? [],
      totalVideos:           video.pagination?.total ?? 0,
      multivendorProducts:   mvp.products           ?? [],
      totalMultivendorProducts: mvp.total           ?? 0,
      stores:                store.stores           ?? [],
      totalStores:           store.total            ?? 0,
      errors: {},
    };
  },

  async searchJobs(q: string, page = 1, limit = 12): Promise<{ jobs: JobResult[]; total: number }> {
    const res = await safeFetch<{ jobs: JobResult[]; total: number }>(
      `/jobportal-api/jobs?search=${encodeURIComponent(q)}&limit=${limit}&page=${page}`,
      { jobs: [], total: 0 }
    );
    return { jobs: res.jobs ?? [], total: res.total ?? 0 };
  },

  async searchBlog(q: string, page = 1, limit = 12): Promise<{ posts: BlogPost[]; total: number }> {
    const res = await safeFetch<{ posts: BlogPost[]; total: number }>(
      `/blog-api/search?q=${encodeURIComponent(q)}&type=posts&limit=${limit}&page=${page}`,
      { posts: [], total: 0 }
    );
    return { posts: res.posts ?? [], total: res.total ?? 0 };
  },

  async searchProducts(q: string, page = 1, limit = 12): Promise<{ products: ProductResult[]; total: number }> {
    const res = await safeFetch<{ products: ProductResult[]; total: number }>(
      `/api/search?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`,
      { products: [], total: 0 }
    );
    return { products: res.products ?? [], total: res.total ?? 0 };
  },

  async searchVideos(q: string, page = 1, limit = 12): Promise<{ videos: VideoResult[]; total: number }> {
    const res = await safeFetch<{ videos: VideoResult[]; pagination?: { total: number } }>(
      `/tv-api/videos?search=${encodeURIComponent(q)}&limit=${limit}&page=${page}`,
      { videos: [], pagination: { total: 0 } }
    );
    return { videos: res.videos ?? [], total: res.pagination?.total ?? 0 };
  },

  async searchStores(q: string, page = 1, limit = 12): Promise<{ stores: StoreResult[]; total: number }> {
    const res = await safeFetch<{ stores: StoreResult[]; total: number }>(
      `/multivendor-api/v1/stores?search=${encodeURIComponent(q)}&limit=${limit}&page=${page}`,
      { stores: [], total: 0 }
    );
    return { stores: res.stores ?? [], total: res.total ?? 0 };
  },

  async searchMultivendorProducts(q: string, page = 1, limit = 12): Promise<{ products: MultivendorProduct[]; total: number }> {
    const res = await safeFetch<{ products: MultivendorProduct[]; total: number }>(
      `/multivendor-api/v1/products?search=${encodeURIComponent(q)}&limit=${limit}&page=${page}`,
      { products: [], total: 0 }
    );
    return { products: res.products ?? [], total: res.total ?? 0 };
  },
};
