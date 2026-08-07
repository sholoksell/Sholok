import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Package, ShoppingCart, Heart, Store, Users } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { wishlistService } from '@/services/wishlistService';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const VendorStorePage = () => {
  const { slug } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/stores/${slug}?sort=${sort}&page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(data => {
        setVendor(data.vendor);
        setProducts(data.products || []);
        setReviews(data.reviews || []);
      })
      .catch(() => toast.error('Failed to load store'))
      .finally(() => setLoading(false));
  }, [slug, sort, page]);

  useEffect(() => {
    wishlistService.getAll().then(items => {
      setWishlistIds(new Set(items.map(i => i.id)));
    }).catch(() => {});
  }, []);

  const handleAddToCart = (product) => {
    addToCart({
      _id: product.id,
      name: product.name,
      salePrice: product.sale_price,
      regularPrice: product.regular_price,
      thumbnail: product.thumbnail,
      stock: product.stock,
      slug: product.slug,
    }, 1);
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlist = async (product) => {
    try {
      if (wishlistIds.has(product.id)) {
        await wishlistService.remove(product.id);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(product.id); return s; });
        toast.success('Removed from wishlist');
      } else {
        await wishlistService.add(product.id);
        setWishlistIds(prev => new Set([...prev, product.id]));
        toast.success('Added to wishlist');
      }
    } catch { toast.error('Please login to use wishlist'); }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground mt-4">Loading store…</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Store Not Found</h2>
        <p className="text-muted-foreground mb-6">This vendor store doesn't exist or is no longer active.</p>
        <Link to="/" className="text-green-600 hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Store Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-700 to-emerald-500 overflow-hidden">
        {vendor.store_banner && (
          <img src={getImageUrl(vendor.store_banner)} alt="Store banner" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-6 left-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
            {vendor.store_logo
              ? <img src={getImageUrl(vendor.store_logo)} alt="Logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">{vendor.store_name?.[0]}</div>
            }
          </div>
          <div className="text-white pb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{vendor.store_name || vendor.name}</h1>
            {vendor.district && (
              <p className="flex items-center gap-1 text-white/80 text-sm mt-1"><MapPin size={14} />{vendor.district}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white border rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Store Info</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {vendor.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{Number(vendor.rating).toFixed(1)}</span>
                    <span className="text-gray-400">({vendor.rating_count} reviews)</span>
                  </div>
                )}
                <div className="flex items-center gap-2"><Package size={14} />{vendor.product_count || 0} Products</div>
                <div className="flex items-center gap-2"><ShoppingCart size={14} />{vendor.total_orders || 0} Orders</div>
              </div>
              {vendor.store_description && (
                <p className="text-sm text-gray-500 mt-3 border-t pt-3">{vendor.store_description}</p>
              )}
              {vendor.store_policies && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Store Policies</p>
                  <p className="text-xs text-gray-500 whitespace-pre-line">{vendor.store_policies}</p>
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Reviews</h3>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map(r => (
                    <div key={r.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                      {r.comment && <p className="text-xs text-gray-600 line-clamp-2">{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">{r.customer_name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{products.length} products</p>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="border rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p>No products yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => {
                  const price = product.sale_price || product.regular_price;
                  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
                  const inWishlist = wishlistIds.has(product.id);
                  return (
                    <div key={product.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative aspect-square overflow-hidden bg-gray-50">
                        <Link to={`/product/${product.slug}`}>
                          <img
                            src={getImageUrl(product.thumbnail)}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                            {Math.round((1 - product.sale_price / product.regular_price) * 100)}% OFF
                          </span>
                        )}
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart size={14} className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                        </button>
                      </div>
                      <div className="p-3">
                        <Link to={`/product/${product.slug}`}>
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-green-600 transition-colors">{product.name}</h3>
                        </Link>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-bold text-green-700">{formatPrice(price)}</span>
                          {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatPrice(product.regular_price)}</span>}
                        </div>
                        {product.stock === 0 ? (
                          <span className="text-xs text-red-500 font-medium">Out of stock</span>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="mt-2 w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingCart size={12} /> Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {products.length === limit && (
              <div className="flex justify-center mt-6 gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <span className="px-4 py-2 text-sm text-gray-500">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorStorePage;
