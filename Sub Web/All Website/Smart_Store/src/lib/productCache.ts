import { productsApi, API_ORIGIN } from "@/lib/api";

export interface CachedProduct {
  _id: string;
  name: string;
  nameBn?: string;
  slug: string;
  thumbnail?: string;
  regularPrice?: number;
  salePrice?: number;
  price?: number;
  categoryId?: { _id?: string; name?: string; slug?: string } | string;
}

let _cache: CachedProduct[] | null = null;
let _loading = false;
const _listeners: Array<() => void> = [];

export async function getProductCache(): Promise<CachedProduct[]> {
  if (_cache) return _cache;
  if (_loading) return new Promise(r => _listeners.push(() => r(_cache!)));
  _loading = true;
  try {
    const res = await productsApi.list({ limit: 500 });
    _cache = Array.isArray(res) ? res : (res.products ?? res.data ?? []);
  } catch {
    _cache = [];
  } finally {
    _loading = false;
    _listeners.splice(0).forEach(fn => fn());
  }
  return _cache!;
}

export function filterProducts(all: CachedProduct[], q: string): CachedProduct[] {
  const lq = q.toLowerCase().trim();
  if (!lq) return [];
  const words = lq.split(/\s+/).filter(Boolean);
  return all.filter(p => {
    const name = p.name?.toLowerCase() ?? "";
    const nameBn = p.nameBn ?? "";
    const cat = typeof p.categoryId === "object" ? (p.categoryId?.name?.toLowerCase() ?? "") : "";
    return words.every(w => name.includes(w) || nameBn.includes(w) || cat.includes(w));
  });
}

export function thumbUrl(thumbnail?: string): string {
  if (!thumbnail) return "";
  if (thumbnail.startsWith("http")) return thumbnail;
  return `${API_ORIGIN}${thumbnail.startsWith("/") ? "" : "/"}${thumbnail}`;
}
