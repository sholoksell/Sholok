// Universal Search Service — queries all Sholok backends in parallel

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductResult {
  _id: string; name: string; nameBn: string; slug: string;
  thumbnail: string; regularPrice: number; salePrice: number | null;
  brand: string; rating: number; reviewCount: number; isFeatured: boolean;
  categoryId: { name: string; nameBn: string; slug: string } | null;
}

export interface CategoryResult {
  _id: string; name: string; nameBn: string; slug: string; icon: string;
}

export interface JobResult {
  _id: string; title: string; titleBn?: string; company: string;
  companyLogo?: string; location: string; salary?: string;
  salaryMin?: number; salaryMax?: number; jobType: string;
  category: string; description: string; createdAt: string;
  status: string;
}

export interface BlogPost {
  _id: string; title: string; titleBn?: string; slug: string;
  excerpt?: string; excerptBn?: string;
  coverImage?: { url?: string; thumbnail?: string };
  author?: { username?: string; displayName?: string; avatar?: string };
  category?: string; tags?: string[]; createdAt: string; views?: number;
}

export interface UniversalSearchResults {
  products: ProductResult[];
  categories: CategoryResult[];
  jobs: JobResult[];
  blogPosts: BlogPost[];
  totalProducts: number;
  totalJobs: number;
  totalBlogPosts: number;
  errors: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const universalSearchService = {
  async search(q: string, limit = 6): Promise<UniversalSearchResults> {
    const enc = encodeURIComponent(q.trim());
    if (!enc) {
      return { products: [], categories: [], jobs: [], blogPosts: [], totalProducts: 0, totalJobs: 0, totalBlogPosts: 0, errors: {} };
    }

    const [shopRes, jobRes, blogRes] = await Promise.allSettled([
      safeFetch<{ products: ProductResult[]; categories: CategoryResult[]; total: number }>(
        `/api/search?q=${enc}&limit=${limit}`,
        { products: [], categories: [], total: 0 }
      ),
      safeFetch<{ jobs: JobResult[]; total: number; pages: number }>(
        `/jobportal-api/jobs?search=${enc}&limit=${limit}&page=1`,
        { jobs: [], total: 0, pages: 0 }
      ),
      safeFetch<{ success: boolean; posts?: BlogPost[]; total?: number }>(
        `/blog-api/search?q=${enc}&type=posts&limit=${limit}`,
        { success: false, posts: [], total: 0 }
      ),
    ]);

    const shop = shopRes.status === 'fulfilled' ? shopRes.value : { products: [], categories: [], total: 0 };
    const job  = jobRes.status  === 'fulfilled' ? jobRes.value  : { jobs: [], total: 0 };
    const blog = blogRes.status === 'fulfilled' ? blogRes.value : { success: false, posts: [], total: 0 };

    return {
      products:      shop.products    ?? [],
      categories:    shop.categories  ?? [],
      jobs:          job.jobs         ?? [],
      blogPosts:     blog.posts       ?? [],
      totalProducts: shop.total       ?? 0,
      totalJobs:     job.total        ?? 0,
      totalBlogPosts: blog.total      ?? 0,
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
};

export function getLocalizedName(item: { name?: string; nameBn?: string }, lang: 'EN' | 'BN'): string {
  if (lang === 'BN') return item.nameBn?.trim() || item.name?.trim() || '';
  return item.name?.trim() || item.nameBn?.trim() || '';
}
