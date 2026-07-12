import { ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Premium Cotton T-Shirt",
    price: 650,
    originalPrice: 950,
    discount: 32,
    vendor: "Fashion Hub",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Wireless Bluetooth Earbuds",
    price: 1200,
    originalPrice: 1800,
    discount: 33,
    vendor: "Tech Zone",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Leather Wallet",
    price: 480,
    originalPrice: null,
    discount: null,
    vendor: "Leather Craft BD",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Ceramic Coffee Mug",
    price: 280,
    originalPrice: 350,
    discount: 20,
    vendor: "Home Decor",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Running Sneakers",
    price: 2200,
    originalPrice: 3000,
    discount: 27,
    vendor: "Sports World",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop",
  },
];

const ShoppingSection = () => {
  const { t } = useLanguage();

  return (
    <div className="w-full py-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {fallbackProducts.map((product) => (
          <a
            key={product.id}
            href="/shopping/"
            className="group block bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
          >
            <div className="relative w-full aspect-square mb-4 bg-secondary/50 rounded-lg flex items-center justify-center overflow-hidden group-hover:bg-secondary transition-colors">
              {product.discount && (
                <span className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  -{product.discount}%
                </span>
              )}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <ShoppingBag className="w-16 h-16 text-muted-foreground" />
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
