import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Heart, Share2, Star, ChevronRight, Truck, ShieldCheck, RefreshCw, Maximize2, Tag, MapPin, CreditCard, CheckCircle2, Facebook, MessageCircle, Copy } from 'lucide-react';
import { productService } from '@/services/productService';
import api from '@/lib/axios';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { ImageZoomModal } from '@/components/ImageZoom';
import ReviewSection from '@/components/ReviewSection';
import { wishlistService } from '@/services/wishlistService';
import { reviewService } from '@/services/reviewService';
import { homeSectionService } from '@/services/homeSectionService';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import DeliveryLocationModal from '@/components/DeliveryLocationModal';
import { useAuth } from '@/contexts/AuthContext';

const ProductPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [reviewStats, setReviewStats] = useState(null);
    const [similarSection, setSimilarSection] = useState(null);
    const [relatedSection, setRelatedSection] = useState(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const { location: deliveryLocation } = useDeliveryLocation();
    const { customer } = useAuth();
    const addToCart = useCartStore((state) => state.addToCart);

    // Sale countdown — uses product.saleEndDate, otherwise a synthetic 6-hour window when discounted
    const saleEndAt = React.useMemo(() => {
        if (!product) return null;
        if (product.saleEndDate) return new Date(product.saleEndDate).getTime();
        const hasDiscount = (product.comparePrice || product.regularPrice) > (product.price || product.salePrice || 0);
        if (!hasDiscount) return null;
        // Stable per-product synthetic deadline (6h from page open)
        return Date.now() + 6 * 60 * 60 * 1000;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product?._id]);

    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        if (!saleEndAt) return;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [saleEndAt]);

    const formatCountdown = (ms) => {
        if (ms <= 0) return '00:00:00:00';
        const totalSec = Math.floor(ms / 1000);
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    useEffect(() => {
        let cancelled = false;
        const loadProduct = async () => {
            try {
                setLoading(true);

                // Try slug → id → all-products fallbacks
                let data = await productService.getByAny(slug);
                let productObj = data?.product || data;

                if (!productObj || !(productObj._id || productObj.id)) {
                    // Fall back to admin-managed Home Page section items
                    const fallback = await api
                        .get(`/home-sections/item/${slug}`)
                        .then((r) => r.data)
                        .catch(() => null);
                    if (fallback?.item) {
                        const it = fallback.item;
                        data = {
                            product: {
                                _id: it._id,
                                slug: it.slug || slug,
                                name: it.name,
                                description: it.description || '',
                                shortDescription: it.shortDescription || '',
                                price: it.price,
                                regularPrice: it.comparePrice || it.price,
                                comparePrice: it.comparePrice,
                                salePrice: it.price,
                                images: it.image ? [it.image] : [],
                                thumbnail: it.image || '',
                                stock: it.stock ?? 100,
                                unit: it.unit || 'Per Piece',
                                badge: it.badge || '',
                                minOrderQuantity: it.minQty || 1,
                                isHomeSectionItem: true,
                            },
                        };
                        productObj = data.product;
                    }
                }

                if (cancelled) return;
                if (productObj && (productObj._id || productObj.id)) {
                    setProduct(data.product || data);
                    setQuantity(1);
                    setSelectedImage(0);
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error('Error loading product:', error);
                if (!cancelled) setProduct(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadProduct();
        return () => { cancelled = true; };
    }, [slug]);

    // Load review stats and wishlist status when product loads
    useEffect(() => {
        if (!product) return;
        if (product.isHomeSectionItem) return; // skip — not a real Product
        const pid = product._id || product.id;
        // Load review stats
        reviewService.getProductReviews(pid).then(data => {
            if (data.stats) setReviewStats(data.stats);
        }).catch(() => {});
        // Check wishlist status
        if (customer) {
            wishlistService.check(pid).then(data => {
                setIsWishlisted(data.isInWishlist);
            }).catch(() => {});
        }
    }, [product, customer]);

    // Load admin-managed Similar / Related sections (shared across all products)
    useEffect(() => {
        let cancelled = false;
        homeSectionService.getByKey('similar-products')
            .then((s) => { if (!cancelled) setSimilarSection(s); })
            .catch(() => {});
        homeSectionService.getByKey('related-products')
            .then((s) => { if (!cancelled) setRelatedSection(s); })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    const handleWishlistToggle = async () => {
        if (!customer) {
            toast.error('Please login to add to wishlist');
            return;
        }
        const pid = product._id || product.id;
        try {
            if (isWishlisted) {
                await wishlistService.remove(pid);
                setIsWishlisted(false);
                toast.success('Removed from wishlist');
            } else {
                await wishlistService.add(pid);
                setIsWishlisted(true);
                toast.success('Added to wishlist');
            }
        } catch (error) {
            toast.error('Failed to update wishlist');
        }
    };

    const handleQuantityChange = (delta) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            const result = await addToCart(product, quantity);
            if (result.success) {
                toast.success(`Added ${quantity} ${product.name} to cart`);
            } else {
                toast.error(result.message || 'Failed to add to cart');
            }
        } catch (error) {
            toast.error('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-xl mx-auto text-center bg-card border rounded-2xl p-10 shadow-sm">
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#E31E24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M12 8v4m0 4h.01M12 22a10 10 0 100-20 10 10 0 000 20z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        The product you're looking for is unavailable or may have been removed.
                        Please check the link or browse our catalog for similar items.
                    </p>
                    <p className="text-xs text-muted-foreground mb-8 break-all">
                        Reference: <span className="font-mono">{slug}</span>
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <Link to="/">
                            <Button className="bg-[#E31E24] hover:bg-[#b9151a]">Return to Home</Button>
                        </Link>
                        <Link to="/search">
                            <Button variant="outline">Browse Products</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const images = product.images?.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []);
    const activeImage = images[selectedImage] || null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-muted-foreground mb-8">
                <Link to="/" className="hover:text-primary">Home</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <Link to={`/category/${product.category?.slug}`} className="hover:text-primary">
                    {product.category?.name || 'Category'}
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ── LEFT: Image Gallery ── */}
                <div className="lg:col-span-4 space-y-3">
                    {/* Main image */}
                    <div
                        className="relative bg-white border border-gray-200 rounded-xl overflow-hidden cursor-zoom-in shadow-sm"
                        style={{ aspectRatio: '1 / 1' }}
                        onClick={() => activeImage && setShowZoomModal(true)}
                    >
                        {activeImage ? (
                            <img
                                src={getImageUrl(activeImage)}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm text-gray-400 mt-3">No image available</p>
                            </div>
                        )}
                        {/* Zoom icon */}
                        {activeImage && (
                            <button
                                className="absolute bottom-3 right-3 bg-white/80 hover:bg-white border border-gray-200 rounded-full p-2 shadow-sm transition-all"
                                onClick={(e) => { e.stopPropagation(); setShowZoomModal(true); }}
                            >
                                <Maximize2 className="h-4 w-4 text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnail strip — only shown if 2+ images */}
                    {images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white transition-all ${
                                        selectedImage === idx
                                            ? 'border-primary shadow-md'
                                            : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`View ${idx + 1}`}
                                        className="w-full h-full object-contain p-1"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── CENTER: Product Details ── */}
                <div className="lg:col-span-5 space-y-5">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-foreground font-medium text-sm">{reviewStats?.averageRating || '0'}</span>
                                <span className="text-muted-foreground text-sm">({reviewStats?.total || 0} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Sale countdown banner */}
                    {saleEndAt && saleEndAt > now && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">Hurry! Sales Ends in</span>
                            <span className="bg-yellow-300 text-foreground font-mono font-bold px-3 py-1 rounded text-sm tracking-wider">
                                {formatCountdown(saleEndAt - now)} <span className="font-sans font-semibold">Left</span>
                            </span>
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-end gap-3 flex-wrap">
                        {product.comparePrice > (product.price || product.salePrice || 0) && (
                            <span className="text-lg text-muted-foreground line-through mb-1">{formatPrice(product.comparePrice)}</span>
                        )}
                        <span className="text-3xl font-bold text-[#E31E24]">{formatPrice(product.price || product.salePrice || product.regularPrice)}</span>
                    </div>

                    {/* Quantity + Add to bag */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center border rounded-lg bg-background">
                            <button
                                onClick={() => handleQuantityChange(-1)}
                                className="p-2.5 hover:bg-muted disabled:opacity-50 transition-colors"
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className="w-10 text-center font-medium">{quantity}</div>
                            <button
                                onClick={() => handleQuantityChange(1)}
                                className="p-2.5 hover:bg-muted disabled:opacity-50 transition-colors"
                                disabled={quantity >= (product.stock || 10)}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <Button
                            onClick={handleAddToCart}
                            size="lg"
                            className="gap-2 bg-[#E31E24] hover:bg-[#b9151a] px-8"
                            disabled={product.stock === 0}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {product.stock === 0 ? 'Out of Stock' : '+ Add to Bag'}
                        </Button>
                    </div>

                    {/* Trust features */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                        <div className="flex flex-col items-center text-center gap-1 p-2 bg-muted/30 rounded-lg">
                            <Truck className="h-5 w-5 text-primary" />
                            <h4 className="font-medium text-xs">Fast Delivery</h4>
                        </div>
                        <div className="flex flex-col items-center text-center gap-1 p-2 bg-muted/30 rounded-lg">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <h4 className="font-medium text-xs">Authentic</h4>
                        </div>
                        <div className="flex flex-col items-center text-center gap-1 p-2 bg-muted/30 rounded-lg">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            <h4 className="font-medium text-xs">Easy Returns</h4>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Sidebar (SKU / Payments / Delivery) ── */}
                <aside className="lg:col-span-3">
                    <div className="border rounded-xl p-4 space-y-4 bg-card sticky top-24">
                        {/* SKU + Stock */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                SKU: <span className="font-semibold text-foreground">{product.sku || product._id?.slice(-7) || '—'}</span>
                            </span>
                            <span className={`flex items-center gap-1 font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <CheckCircle2 className="h-4 w-4" />
                                {product.stock > 0 ? 'In stock' : 'Out of stock'}
                            </span>
                        </div>

                        {/* Wishlist + Share row */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <button
                                onClick={handleWishlistToggle}
                                className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                            >
                                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                                Add to Wishlist
                            </button>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                    target="_blank" rel="noreferrer"
                                    className="p-1.5 rounded-full hover:bg-muted text-blue-600"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook className="h-4 w-4" />
                                </a>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + window.location.href)}`}
                                    target="_blank" rel="noreferrer"
                                    className="p-1.5 rounded-full hover:bg-muted text-green-600"
                                    aria-label="Share on WhatsApp"
                                >
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                                <button
                                    onClick={() => {
                                        navigator.clipboard?.writeText(window.location.href);
                                        toast.success('Link copied');
                                    }}
                                    className="p-1.5 rounded-full hover:bg-muted text-muted-foreground"
                                    aria-label="Copy link"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Delivery info */}
                        <div className="pt-2 border-t space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" />
                                <span className="text-muted-foreground">Delivery:</span>
                                <span className="font-semibold text-foreground">1-2 hours</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowLocationModal(true)}
                                className="flex items-center gap-2 w-full text-left hover:text-primary transition-colors"
                                title={deliveryLocation?.label || ''}
                            >
                                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground">Location:</span>
                                <span className={`text-xs truncate ${deliveryLocation ? 'text-foreground font-medium' : 'text-primary underline'}`}>
                                    {deliveryLocation?.label || 'Select your delivery location'}
                                </span>
                            </button>
                        </div>

                        {/* Payment methods */}
                        <div className="pt-2 border-t">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Other Payment Methods</span>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-center gap-1 border rounded-md py-2 text-xs font-semibold bg-pink-50 text-pink-700 border-pink-200">
                                    bKash
                                </div>
                                <div className="flex items-center justify-center gap-1 border rounded-md py-2 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                                    Cash on Delivery
                                </div>
                                <div className="flex items-center justify-center gap-1 border rounded-md py-2 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                                    City Bank
                                </div>
                                <div className="flex items-center justify-center gap-1 border rounded-md py-2 text-xs font-semibold bg-muted text-foreground">
                                    Card Payment
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Description & Reviews — full width below */}
            <div className="mt-10 border rounded-xl overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'overview' ? 'bg-primary text-white border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'reviews' ? 'bg-primary text-white border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Reviews {reviewStats?.total > 0 && `(${reviewStats.total})`}
                    </button>
                </div>
                <div className="p-6">
                    {activeTab === 'overview' ? (
                        (product.description || product.shortDescription) ? (
                            <div className="space-y-5">
                                <h3 className="font-bold text-base text-primary">Product Description</h3>

                                {product.shortDescription && (
                                    <div className="bg-primary/5 border-l-4 border-primary rounded-r-md px-4 py-3">
                                        <p
                                            className="text-foreground text-sm leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                                        />
                                    </div>
                                )}

                                {product.description && (
                                    <div
                                        className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:font-semibold [&_h3]:mt-2 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_img]:rounded-md [&_img]:my-3"
                                        dangerouslySetInnerHTML={{ __html: product.description }}
                                    />
                                )}

                                {/* Quick info grid — always shown for a polished look */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
                                    {product.brand && (
                                        <div className="bg-muted/40 rounded-lg p-3">
                                            <div className="text-xs text-muted-foreground">Brand</div>
                                            <div className="font-semibold text-sm mt-0.5">{product.brand?.name || product.brand}</div>
                                        </div>
                                    )}
                                    {product.category && (
                                        <div className="bg-muted/40 rounded-lg p-3">
                                            <div className="text-xs text-muted-foreground">Category</div>
                                            <div className="font-semibold text-sm mt-0.5">{product.category?.name || product.category}</div>
                                        </div>
                                    )}
                                    <div className="bg-muted/40 rounded-lg p-3">
                                        <div className="text-xs text-muted-foreground">Availability</div>
                                        <div className={`font-semibold text-sm mt-0.5 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <p className="text-muted-foreground text-sm">
                                    No detailed description provided for <span className="font-semibold text-foreground">{product.name}</span>.
                                </p>
                                <p className="text-muted-foreground/80 text-xs mt-2">
                                    {product.unit ? `Sold ${product.unit.toLowerCase()}.` : ''} {product.stock > 0 ? 'In stock and ready to ship.' : ''}
                                </p>
                            </div>
                        )
                    ) : (
                        <ReviewSection productId={product._id || product.id} />
                    )}
                </div>
            </div>

            {/* Zoom Modal */}
            {showZoomModal && activeImage && (
                <ImageZoomModal
                    images={images.map(getImageUrl)}
                    initialIndex={selectedImage}
                    onClose={() => setShowZoomModal(false)}
                />
            )}

            {/* Delivery Location Modal */}
            <DeliveryLocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
            />

            {/* ── Similar Products ── */}
            <div className="mt-14">
                <h2 className="text-xl font-bold mb-6 text-center tracking-wide">
                    {similarSection?.title?.toUpperCase() || 'SIMILAR PRODUCTS'}
                </h2>
                {similarSection?.products?.length > 0
                    ? <LinkedProductGrid products={similarSection.products.filter((p) => p.isActive !== false)} />
                    : product.upsellProducts?.length > 0
                        ? <LinkedProductGrid products={product.upsellProducts} />
                        : <CategoryRelated currentProductId={product._id || product.id} categorySlug={product.category?.slug} limit={5} />
                }
            </div>

            {/* ── Related Products ── */}
            <div className="mt-14">
                <h2 className="text-xl font-bold mb-6 text-center tracking-wide">
                    {relatedSection?.title?.toUpperCase() || 'RELATED PRODUCTS'}
                </h2>
                {relatedSection?.products?.length > 0
                    ? <LinkedProductGrid products={relatedSection.products.filter((p) => p.isActive !== false)} />
                    : product.relatedProducts?.length > 0
                        ? <LinkedProductGrid products={product.relatedProducts} />
                        : <CategoryRelated currentProductId={product._id || product.id} categorySlug={product.category?.slug} limit={5} skip={5} />
                }
            </div>

            {/* ── Cross-sell / Customers also bought ── */}
            {product.crossSellProducts?.length > 0 && (
                <div className="mt-14">
                    <div className="flex items-center gap-2 mb-6">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Customers also bought</h2>
                    </div>
                    <LinkedProductGrid products={product.crossSellProducts} />
                </div>
            )}
        </div>
    );
};

// ── LinkedProductGrid — renders admin-configured product lists ──────────────
const LinkedProductGrid = ({ products }) => {
    const addToCart = useCartStore((state) => state.addToCart);
    if (!products?.length) return null;

    const handleAdd = async (e, p) => {
        e.preventDefault();
        const result = await addToCart(p, 1);
        if (result?.success) toast.success(`Added ${p.name} to cart`);
        else toast.error(result?.message || 'Failed to add to cart');
    };

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => {
                const thumb = p.thumbnail || p.images?.[0] || null;
                const price  = p.salePrice ?? p.regularPrice ?? p.price ?? 0;
                const hasDiscount = p.salePrice && p.regularPrice && p.salePrice < p.regularPrice;
                const discountPct = hasDiscount
                    ? Math.round(100 - (p.salePrice / p.regularPrice) * 100)
                    : 0;

                return (
                    <Link
                        key={p._id || p.id}
                        to={`/product/${p.slug}`}
                        className="group relative flex flex-col border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition-all bg-card"
                    >
                        {/* Discount badge */}
                        {discountPct > 0 && (
                            <span className="absolute top-2 left-2 z-10 bg-[#E31E24] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                -{discountPct}%
                            </span>
                        )}
                        {/* Image */}
                        <div className="bg-white aspect-square overflow-hidden">
                            {thumb ? (
                                <img
                                    src={getImageUrl(thumb)}
                                    alt={p.name}
                                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-col flex-1 p-3 gap-1">
                            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {p.name}
                            </p>
                            <div className="flex items-baseline gap-2 mt-auto pt-1">
                                <span className="font-bold text-primary">{formatPrice(price)}</span>
                                {hasDiscount && (
                                    <span className="text-xs text-muted-foreground line-through">{formatPrice(p.regularPrice)}</span>
                                )}
                            </div>
                        </div>
                        {/* Add to cart — appears on hover */}
                        <button
                            onClick={(e) => handleAdd(e, p)}
                            className="absolute bottom-0 inset-x-0 bg-[#E31E24] text-white text-xs font-semibold py-2 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Add to Cart
                        </button>
                    </Link>
                );
            })}
        </div>
    );
};

// ── CategoryRelated — fallback when no admin-configured related products ────
const CategoryRelated = ({ currentProductId, categorySlug, limit = 5, skip = 0 }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const load = async () => {
            try {
                let list = [];
                if (categorySlug) {
                    const res = await productService.getByCategory(categorySlug, 20);
                    list = res?.products || [];
                }
                // Fallback: pull from all products if category returned nothing
                if (!list.length) {
                    const res = await productService.getAll({ limit: 20 });
                    list = res?.products || [];
                }
                const filtered = list.filter((p) => (p._id || p.id) !== currentProductId);
                setProducts(filtered.slice(skip, skip + limit));
            } catch (_) {
                setProducts([]);
            }
        };
        load();
    }, [currentProductId, categorySlug, limit, skip]);

    if (!products.length) return <p className="text-sm text-muted-foreground text-center">No products to show.</p>;
    return <LinkedProductGrid products={products} />;
};

export default ProductPage;
