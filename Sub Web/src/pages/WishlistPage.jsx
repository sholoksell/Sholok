import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlistStore } from '@/store/wishlistStore';
import { wishlistService } from '@/services/wishlistService';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { customer, isAuthenticated } = useAuth();
  const { remove: storeRemove } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    wishlistService.getAll().then((data) => {
      const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setItems(list);
      setLoading(false);
    });
  }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      await wishlistService.remove(productId);
      storeRemove(productId);
      setItems((prev) => prev.filter((p) => String(p.id) !== String(productId)));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAddToCart = async (product) => {
    const result = await addToCart(product, 1);
    if (result.success) toast.success(`${product.name} added to cart`);
    else toast.error(result.message || 'Failed to add to cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Please sign in to view your saved items.</p>
        <Link to="/login" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Save items you love by tapping the heart icon.</p>
        <Link to="/" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          My Wishlist <span className="ml-2 text-base font-normal text-gray-400">({items.length} items)</span>
        </h1>
        <Link to="/" className="text-sm font-semibold text-primary hover:underline">
          Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((product) => {
          const price = product.sale_price || product.regular_price || product.price;
          const comparePrice = product.regular_price || product.comparePrice;
          const image = product.thumbnail || product.image || (product.images && product.images[0]);
          return (
            <div key={product.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
              {/* Remove button */}
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/90 shadow-sm border border-gray-200 hover:border-sale hover:bg-sale-soft"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-3.5 w-3.5 text-sale" />
              </button>

              {/* Image */}
              <Link to={`/product/${product.slug || product.id}`} className="aspect-square bg-gray-50 flex items-center justify-center p-2">
                {image ? (
                  <img
                    src={getImageUrl(image)}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-200">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1 border-t border-gray-100 px-2.5 pt-2 pb-2.5">
                <Link to={`/product/${product.slug || product.id}`}>
                  <h3 className="line-clamp-2 text-[12px] font-semibold leading-4 text-gray-800 hover:text-primary min-h-8">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-auto">
                  <span className="text-sm font-bold text-primary">{formatPrice(price)}</span>
                  {comparePrice && comparePrice > price && (
                    <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(comparePrice)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart({ ...product, price, images: image ? [image] : [] })}
                  disabled={product.stock === 0}
                  className="mt-1 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-sale text-xs font-semibold text-sale hover:bg-sale hover:text-white disabled:border-gray-200 disabled:text-gray-400 transition-colors"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
