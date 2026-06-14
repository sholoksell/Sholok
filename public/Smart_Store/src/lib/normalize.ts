import type { Product } from "@/data/mockData";

/** Convert backend MongoDB product → frontend Product shape */
export function normalizeProduct(raw: any): Product | null {
  if (!raw) return null;
  const img = raw.image
    || raw.images?.[0]?.url
    || (typeof raw.images?.[0] === "string" ? raw.images[0] : "")
    || "";
  return {
    id:            raw.id || raw._id || raw.slug || "",
    name:          raw.name || "",
    brand:         raw.brand || "",
    storeId:       raw.storeId || raw.store?._id || raw.store || "",
    price:         raw.price ?? 0,
    originalPrice: raw.originalPrice || undefined,
    image:         img,
    gallery:       (raw.gallery && raw.gallery.length ? raw.gallery : (raw.images || []).map((i: any) => i.url || i)).filter(Boolean),
    rating:        raw.rating ?? raw.ratings?.average ?? 0,
    reviews:       raw.reviews ?? raw.ratings?.count ?? 0,
    badge:         raw.badge || undefined,
    category:      raw.category?.name || raw.categoryName || (typeof raw.category === "string" ? raw.category : ""),
    description:   raw.description || "",
    variants:      raw.variants || [],
    stock:         raw.stock,
    tags:          raw.tags || [],
    seasonalFor:   raw.seasonalFor || [],
  };
}

export function normalizeProducts(raw: any): Product[] {
  const list = raw?.products || raw?.data || raw || [];
  return Array.isArray(list) ? list.map(normalizeProduct).filter(Boolean) as Product[] : [];
}

export function normalizeStore(raw: any) {
  if (!raw) return null;
  return {
    id:        raw.id || raw._id || raw.smartStore || "",
    slug:      raw.smartStore || raw.slug,
    name:      raw.name || "",
    tagline:   raw.tagline || raw.description?.slice(0, 80) || "",
    rating:    raw.rating ?? raw.stats?.rating ?? 4.5,
    followers: raw.followers ?? raw.stats?.followers ?? 0,
    products:  raw.stats?.totalProducts ?? raw.products ?? 0,
    accent:    raw.layout?.primaryColor || "#0f172a",
    logo:      raw.logo || "",
    banner:    raw.banner || "",
    description: raw.description || "",
    layout:    raw.layout || {},
    socialLinks: raw.socialLinks || {},
    policies:  raw.policies || {},
  };
}
