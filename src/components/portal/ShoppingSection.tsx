import { useEffect, useState } from "react";
import { ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ApiProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  regularPrice?: number;
  salePrice?: number;
  thumbnail?: string;
  images?: string[];
  categoryName?: string;
  slug?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  vendor: string;
  image: string | null;
  slug?: string;
}

// Resolve a product image path to a usable URL (uploads are proxied by the dev server)
const resolveImage = (p: ApiProduct): string | null => {
  const raw = p.thumbnail || p.images?.[0];
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return raw.startsWith("/") ? raw : `/uploads/${raw}`;
};

const mapProduct = (p: ApiProduct): Product => {
  const price = p.salePrice || p.price || p.regularPrice || 0;
  const original = p.originalPrice || p.regularPrice || 0;
  const hasDiscount = original > price && price > 0;
  return {
    id: p._id,
    name: p.name,
    price,
    originalPrice: hasDiscount ? original : null,
    discount: hasDiscount ? Math.round((1 - price / original) * 100) : null,
    vendor: p.categoryName || "Sholok Store",
    image: resolveImage(p),
    slug: p.slug,
  };
};

const ShoppingSection = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/products?limit=5&sort=-createdAt");
        const data = await res.json();
        const list: ApiProduct[] = data.products || data.data || [];
        if (active) setProducts(list.slice(0, 5).map(mapProduct));
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Hide the section entirely if there's nothing to show
  if (!loading && products.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">{t("shoppingToday")}</h2>
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{t("hot")}</span>
        </div>
        <a href="/shopping/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                <div className="w-full aspect-square mb-4 bg-secondary/50 rounded-lg" />
                <div className="h-4 bg-secondary/50 rounded mb-2" />
                <div className="h-4 w-2/3 bg-secondary/50 rounded" />
              </div>
            ))
          : products.map((product) => (
              <a
                key={product.id}
                href={product.slug ? `/shopping/product/${product.slug}` : "/shopping/"}
                className="group block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
              >
                <div className="relative w-full aspect-square mb-4 bg-secondary/50 rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
                  {product.discount && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                      -{product.discount}%
                    </span>
                  )}
                  {product.image && !brokenImages.has(product.id) ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={() => setBrokenImages((prev) => new Set(prev).add(product.id))}
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-muted-foreground group-hover:scale-110 transition-transform" />
                  )}
                </div>

                <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2 min-h-[40px]">
                  {product.name}
                </h3>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-bold text-portal-green">৳{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ৳{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {t("from")} <span className="font-semibold text-foreground">{product.vendor}</span>
                </p>
              </a>
            ))}
      </div>
    </div>
  );
};

export default ShoppingSection;
