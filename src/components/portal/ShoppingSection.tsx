import { useState, useEffect } from "react";
import { ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  nameBn?: string;
  price?: number;
  salePrice?: number;
  regularPrice?: number;
  comparePrice?: number;
  image?: string;
  images?: string[];
  thumbnail?: string;
  slug?: string;
  vendor?: { storeName?: string; name?: string } | string;
  vendorName?: string;
  category?: { name?: string; slug?: string } | string;
}

const SHOPPING_API = "https://sholok.com/api";

// Tabs filter by product name keyword (search param) since products are
// named e.g. "Digital Printed Lawn", "Embroidered Chiffon", "Banarsi Dupatta"
const TABS = [
  { label: "All Items",   key: "",           search: "" },
  { label: "Lawn",        key: "lawn",       search: "lawn" },
  { label: "Printed",     key: "printed",    search: "printed" },
  { label: "Embroidered", key: "embroidered",search: "embroidered" },
  { label: "Dupatta",     key: "dupatta",    search: "dupatta" },
];

const IMAGE_BASE = "https://shopping.sholok.com";

function getImageSrc(product: Product): string {
  const raw = product.image || product.images?.[0] || product.thumbnail || "";
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads")) return `${IMAGE_BASE}${raw}`;
  return `${IMAGE_BASE}/uploads/${raw.replace(/^\//, "")}`;
}

function getVendorName(product: Product): string {
  if (typeof product.vendor === "object" && product.vendor !== null) {
    return product.vendor.storeName || product.vendor.name || "";
  }
  if (typeof product.vendor === "string") return product.vendor;
  return product.vendorName || "";
}

const ProductSkeleton = () => (
  <div className="rounded-xl border border-border p-4 animate-pulse">
    <div className="w-full aspect-square mb-4 bg-secondary/70 rounded-lg" />
    <div className="h-4 bg-secondary/70 rounded mb-2 w-4/5" />
    <div className="h-4 bg-secondary/70 rounded mb-2 w-3/5" />
    <div className="h-3 bg-secondary/50 rounded w-2/5" />
  </div>
);

const ShoppingSection = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "10" });
    if (activeTab.search) params.set("search", activeTab.search);
    fetch(`${SHOPPING_API}/products/public?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const list: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        setProducts(list.slice(0, 10));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeTab.key]);

  return (
    <div className="w-full py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">{t("shoppingToday")}</h2>
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{t("hot")}</span>
        </div>
        <a
          href="https://shopping.sholok.com/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t("viewAll")} <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab.key === tab.key
                ? "border-portal-green text-portal-green"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.length > 0
          ? products.map((product) => {
              const pid = product._id || product.id || "";
              const imgSrc = getImageSrc(product);
              const price = product.price || product.salePrice || product.regularPrice || 0;
              const comparePrice = product.comparePrice || product.regularPrice;
              const discount =
                comparePrice && comparePrice > price
                  ? Math.round(((comparePrice - price) / comparePrice) * 100)
                  : null;
              const vendorName = getVendorName(product);
              const href = product.slug
                ? `https://shopping.sholok.com/product/${product.slug}`
                : "https://shopping.sholok.com/";

              return (
                <a
                  key={pid}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-card rounded-xl border border-border p-3 hover:shadow-md transition-all"
                >
                  <div className="relative w-full aspect-square mb-3 bg-secondary/50 rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
                    {discount && (
                      <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                        -{discount}%
                      </span>
                    )}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          (e.currentTarget.nextElementSibling as HTMLElement | null)?.removeAttribute("hidden");
                        }}
                      />
                    ) : null}
                    <ShoppingBag
                      className="w-12 h-12 text-muted-foreground"
                      hidden={!!imgSrc}
                    />
                  </div>

                  <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-2 min-h-[36px]">
                    {product.nameBn || product.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
                    <span className="text-base font-bold text-portal-green">
                      ৳{price.toLocaleString()}
                    </span>
                    {comparePrice && comparePrice > price && (
                      <span className="text-xs text-muted-foreground line-through">
                        ৳{comparePrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {vendorName && (
                    <p className="text-xs text-muted-foreground truncate">
                      {t("from")} <span className="font-semibold text-foreground">{vendorName}</span>
                    </p>
                  )}
                </a>
              );
            })
          : (
            <div className="col-span-5 text-center py-10 text-muted-foreground text-sm">
              No products found.
            </div>
          )}
      </div>
    </div>
  );
};

export default ShoppingSection;
