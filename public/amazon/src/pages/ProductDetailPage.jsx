import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getProductsByCategory } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/common/StarRating';
import PrimeBadge from '../components/common/PrimeBadge';
import ProductSlider from '../components/Product/ProductSlider';
import { FiShoppingCart, FiChevronRight, FiShield, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { BsBoxSeam } from 'react-icons/bs';
import { motion } from 'framer-motion';

const fakeReviews = [
  { id: 1, name: 'Alex M.', rating: 5, date: 'March 12, 2025', title: 'Absolutely love it!', body: 'Exceeded my expectations in every way. The quality is outstanding and delivery was super fast. Would definitely recommend to anyone looking for this product.' },
  { id: 2, name: 'Sarah K.', rating: 4, date: 'February 28, 2025', title: 'Great value for money', body: 'Really happy with this purchase. Works exactly as described. Only minor issue is the packaging could be better, but the product itself is excellent.' },
  { id: 3, name: 'James T.', rating: 5, date: 'April 5, 2025', title: 'Best purchase this year', body: 'I have been using this for a month now and it still works perfectly. The build quality is top-notch and it looks exactly like the photos.' },
  { id: 4, name: 'Priya L.', rating: 3, date: 'January 19, 2025', title: 'Decent product', body: 'Does what it says. Nothing spectacular but no complaints either. Delivery was on time and the item was well packaged.' },
];

const RatingBar = ({ stars, percent }) => (
  <div className="flex items-center gap-2">
    <span className="text-amazon-blue text-xs hover:underline cursor-pointer w-12 shrink-0">{stars} star</span>
    <div className="flex-1 bg-[#E8E8E8] h-3 rounded-sm overflow-hidden">
      <div className="h-full bg-amazon-orange rounded-sm" style={{ width: `${percent}%` }} />
    </div>
    <span className="text-amazon-blue text-xs hover:underline cursor-pointer w-8 text-right">{percent}%</span>
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => getProductById(id), [id]);
  const { addToCart, isInCart } = useCart();
  const { addToast } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const related = useMemo(
    () => product ? getProductsByCategory(product.category).filter(p => p.id !== product.id).slice(0, 10) : [],
    [product]
  );

  if (!product) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <p className="text-2xl font-bold text-amazon-dark mb-4">Product not found</p>
        <Link to="/" className="amazon-btn px-8 inline-block">Back to Home</Link>
      </div>
    );
  }

  const allImages = product.images?.length ? product.images : [product.image];
  const fallback = `https://placehold.co/500x500/EAEDED/565959?text=${encodeURIComponent(product.brand)}`;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    addToast(`Added ${quantity}× "${product.title.slice(0, 35)}..." to cart`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-4">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-amazon-text-gray mb-4 flex-wrap">
          <Link to="/" className="hover:text-amazon-orange hover:underline">Home</Link>
          <FiChevronRight size={12} />
          <Link to={`/search?category=${encodeURIComponent(product.category)}`} className="hover:text-amazon-orange hover:underline">
            {product.category}
          </Link>
          <FiChevronRight size={12} />
          <span className="text-amazon-dark line-clamp-1">{product.title.slice(0, 60)}…</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_300px] gap-6">

          {/* ── LEFT: Images ── */}
          <div className="flex flex-col-reverse md:flex-row gap-2 md:w-[440px]">
            {/* Thumbnails */}
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px]">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-14 h-14 border-2 rounded overflow-hidden ${
                    selectedImage === i ? 'border-amazon-orange' : 'border-amazon-border hover:border-amazon-blue'
                  } transition-colors`}
                >
                  <img
                    src={img || fallback}
                    alt={`${product.title} view ${i + 1}`}
                    className="w-full h-full object-contain p-0.5"
                    onError={(e) => { e.target.src = fallback; }}
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 border border-amazon-border rounded overflow-hidden flex items-center justify-center bg-[#F7F8F8] aspect-square md:aspect-auto md:min-h-[440px] relative group">
              <motion.img
                key={selectedImage}
                src={!allImages[selectedImage] || imgError ? fallback : allImages[selectedImage]}
                alt={product.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          {/* ── CENTER: Details ── */}
          <div className="min-w-0">
            {/* Title */}
            <h1 className="text-xl font-medium text-amazon-dark leading-snug mb-2">
              {product.title}
            </h1>

            {/* Brand */}
            <p className="text-sm mb-2">
              Brand:{' '}
              <Link
                to={`/search?q=${encodeURIComponent(product.brand)}`}
                className="text-amazon-blue hover:underline"
              >
                {product.brand}
              </Link>
            </p>

            {/* Ratings row */}
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={product.rating} size="md" />
              <Link to="#reviews" className="text-amazon-blue text-sm hover:underline">
                {product.reviewCount?.toLocaleString()} ratings
              </Link>
              <span className="text-amazon-text-gray text-xs">|</span>
              <Link to="#" className="text-amazon-blue text-sm hover:underline">
                {Math.floor(product.reviewCount / 30)} answered questions
              </Link>
            </div>

            {/* Bought */}
            {product.boughtCount && (
              <p className="text-xs text-amazon-text-gray mb-2">{product.boughtCount} bought in past month</p>
            )}

            <hr className="border-amazon-border my-3" />

            {/* Price block */}
            <div className="mb-3">
              {product.discount > 0 && (
                <span className="text-amazon-red text-sm font-medium">-{product.discount}% </span>
              )}
              <span className="text-[28px] font-medium text-amazon-red leading-none">
                ৳{Math.round(product.price * 110).toLocaleString()}
              </span>
              {product.originalPrice && (
                <p className="text-sm text-amazon-text-gray mt-0.5">
                  List price:{' '}
                  <span className="line-through">৳{Math.round(product.originalPrice * 110).toLocaleString()}</span>
                </p>
              )}
              <p className="text-xs text-amazon-text-gray">
                Includes applicable taxes. <Link to="#" className="text-amazon-blue hover:underline">Details</Link>
              </p>
            </div>

            {/* Prime */}
            {product.isPrime && (
              <div className="flex items-center gap-2 mb-3">
                <PrimeBadge size="lg" />
                <span className="text-sm text-amazon-dark">
                  FREE delivery <strong>{product.deliveryDate}</strong>
                </span>
              </div>
            )}

            {/* Coupon */}
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="coupon" className="w-4 h-4 accent-amazon-orange" readOnly />
              <label htmlFor="coupon" className="text-sm text-amazon-dark cursor-pointer">
                Apply <span className="text-amazon-green font-bold">5% coupon</span>
                <Link to="#" className="text-amazon-blue hover:underline ml-1">Terms</Link>
              </label>
            </div>

            <hr className="border-amazon-border my-3" />

            {/* About this item */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-amazon-dark mb-2">About this item</h3>
              <ul className="space-y-1.5">
                {product.features?.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amazon-dark">
                    <span className="text-amazon-orange mt-1 shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div>
                <h3 className="text-base font-bold text-amazon-dark mb-2">Technical Specifications</h3>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? 'bg-[#F7F8F8]' : 'bg-white'}>
                        <td className="py-1.5 px-3 font-medium text-amazon-dark w-40 border border-amazon-border">{key}</td>
                        <td className="py-1.5 px-3 text-amazon-dark border border-amazon-border">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── RIGHT: Buy box ── */}
          <div className="md:w-[300px]">
            <div className="border border-amazon-border rounded p-4 shadow-amazon sticky top-20">
              {/* Price */}
              <p className="text-2xl font-medium text-amazon-red mb-1">
                ৳{Math.round(product.price * 110).toLocaleString()}
              </p>

              {/* Delivery */}
              <div className="flex items-start gap-1.5 mb-2">
                <FiTruck className="text-amazon-dark mt-0.5 shrink-0" size={14} />
                <div className="text-sm">
                  <p className="text-amazon-dark">
                    FREE delivery <span className="font-bold">{product.deliveryDate}</span>
                  </p>
                  <p className="text-amazon-text-gray text-xs">Order within 14 hrs 22 mins</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 mb-3 text-xs">
                <span className="text-amazon-dark">Deliver to</span>
                <Link to="#" className="text-amazon-blue hover:underline font-bold">Bangladesh 1212</Link>
              </div>

              {/* Stock */}
              <p className="text-amazon-green font-medium text-sm mb-3">
                {product.inStock
                  ? product.stockCount <= 5
                    ? `Only ${product.stockCount} left in stock!`
                    : 'In Stock'
                  : 'Currently unavailable'}
              </p>

              {/* Qty selector */}
              <div className="mb-3">
                <label className="text-xs text-amazon-text-gray mb-1 block">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-amazon-border rounded px-2 py-1 text-sm text-amazon-dark bg-white focus:outline-none"
                >
                  {Array.from({ length: Math.min(product.stockCount || 10, 10) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full amazon-btn py-2 mb-2 flex items-center justify-center gap-2 text-sm"
              >
                <FiShoppingCart size={15} />
                {isInCart(product.id) ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>

              {/* Buy now */}
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="w-full amazon-btn-orange py-2 mb-3 flex items-center justify-center gap-2 text-sm"
              >
                Buy Now
              </button>

              <hr className="border-amazon-border mb-3" />

              {/* Secure + Seller */}
              <div className="space-y-1.5 text-xs text-amazon-text-gray">
                <div className="flex items-center gap-1.5">
                  <FiShield size={12} className="text-amazon-dark" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BsBoxSeam size={12} className="text-amazon-dark" />
                  <span>Ships from <strong className="text-amazon-dark">Sholok</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiRefreshCw size={12} className="text-amazon-dark" />
                  <span>
                    <Link to="#" className="text-amazon-blue hover:underline">Free returns</Link> within 30 days
                  </span>
                </div>
              </div>

              {/* Gift option */}
              <div className="mt-3 flex items-center gap-1.5">
                <input type="checkbox" id="gift" className="w-4 h-4 accent-amazon-orange" />
                <label htmlFor="gift" className="text-xs text-amazon-dark cursor-pointer">
                  Add gift option
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ── Customer Reviews ── */}
        <div id="reviews" className="mt-8 border-t border-amazon-border pt-6">
          <h2 className="text-xl font-bold text-amazon-dark mb-4">Customer Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
            {/* Rating summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={product.rating} size="lg" />
                <span className="text-lg font-bold">{product.rating} out of 5</span>
              </div>
              <p className="text-sm text-amazon-text-gray mb-3">{product.reviewCount?.toLocaleString()} global ratings</p>
              <div className="space-y-1.5">
                <RatingBar stars={5} percent={Math.round(product.rating * 15)} />
                <RatingBar stars={4} percent={20} />
                <RatingBar stars={3} percent={8} />
                <RatingBar stars={2} percent={4} />
                <RatingBar stars={1} percent={3} />
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-6">
              {fakeReviews.map((review) => (
                <div key={review.id} className="border-b border-amazon-border pb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-amazon-secondary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{review.name[0]}</span>
                    </div>
                    <span className="text-sm font-bold text-amazon-dark">{review.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-amazon-dark text-sm font-bold">{review.title}</span>
                  </div>
                  <p className="text-xs text-amazon-text-gray mb-2">Verified Purchase — {review.date}</p>
                  <p className="text-sm text-amazon-dark leading-relaxed">{review.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-amazon-text-gray">Helpful?</span>
                    <button className="amazon-btn-secondary text-xs px-2 py-0.5">Yes</button>
                    <button className="amazon-btn-secondary text-xs px-2 py-0.5">No</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-8">
            <ProductSlider
              title={`More from ${product.category}`}
              products={related}
              seeMoreLink={`/search?category=${encodeURIComponent(product.category)}`}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetailPage;
