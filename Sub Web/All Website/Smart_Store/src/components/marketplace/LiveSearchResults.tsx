import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search } from "lucide-react";
import { getProductCache, filterProducts, thumbUrl, type CachedProduct } from "@/lib/productCache";
import { useCart } from "@/store/cartContext";

const PAGE_SIZE = 20;

function SearchProductCard({ product }: { product: CachedProduct }) {
  const { add } = useCart();
  const src = thumbUrl(product.thumbnail);
  const reg = product.regularPrice ?? product.price ?? 0;
  const sale = product.salePrice && product.salePrice < reg ? product.salePrice : null;
  const discount = sale ? Math.round(((reg - sale) / reg) * 100) : 0;

  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-elegant transition-shadow duration-300 flex flex-col">
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden aspect-[4/3] bg-muted">
        {src ? (
          <img
            src={src}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-[#D31710] text-white rounded">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link to={`/product/${product.slug}`} className="text-sm font-medium text-foreground leading-snug line-clamp-2 hover:text-[#5D0096] transition-colors">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-auto pt-1">
          {sale ? (
            <>
              <span className="text-sm font-bold text-[#D31710]">৳{sale.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground line-through">৳{reg.toLocaleString()}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-[#5D0096]">৳{reg.toLocaleString()}</span>
          )}
        </div>
        <button
          onClick={() => add({ id: product._id, name: product.name, price: sale ?? reg, image: thumbUrl(product.thumbnail) } as any, 1)}
          className="mt-1 h-9 w-full rounded-md bg-[#5D0096] hover:bg-[#4a0078] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}

interface LiveSearchResultsProps {
  query: string;
}

export default function LiveSearchResults({ query }: LiveSearchResultsProps) {
  const [results, setResults] = useState<CachedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const latestQuery = useRef(query);

  useEffect(() => {
    latestQuery.current = query;
    setPage(1);
    setLoading(true);

    const run = async () => {
      const all = await getProductCache();
      if (latestQuery.current !== query) return; // stale
      setResults(filterProducts(all, query));
      setLoading(false);
    };
    run();
  }, [query]);

  const visible = results.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < results.length;

  return (
    <section className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Search results for <span className="text-[#5D0096]">"{query}"</span>
          </h2>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {results.length === 0
                ? "No matching products found"
                : `${results.length} product${results.length !== 1 ? "s" : ""} found`}
            </p>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#5D0096] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-foreground">No products found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Product grid */}
      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {visible.map(p => (
              <SearchProductCard key={p._id} product={p} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(n => n + 1)}
                className="px-8 h-11 rounded-lg border-2 border-[#5D0096] text-[#5D0096] font-semibold hover:bg-[#5D0096] hover:text-white transition-colors text-sm"
              >
                Load More ({results.length - visible.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
