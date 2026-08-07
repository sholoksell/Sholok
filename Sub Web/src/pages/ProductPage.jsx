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
import ProductQA from '@/components/ProductQA';
import { wishlistService } from '@/services/wishlistService';
import { reviewService } from '@/services/reviewService';
import { homeSectionService } from '@/services/homeSectionService';
import { useDeliveryLocation } from '@/hooks/useDeliveryLocation';
import DeliveryLocationModal from '@/components/DeliveryLocationModal';
import DeliveryInfoCard from '@/components/DeliveryInfoCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const [compareData, setCompareData] = useState(null);
    const [compareLoading, setCompareLoading] = useState(false);
    const [freqBought, setFreqBought] = useState([]);
    const { location: deliveryLocation } = useDeliveryLocation();
    const { customer } = useAuth();
    const { language } = useLanguage();
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

    // Track product view for recommendations
    useEffect(() => {
        if (!product?.id) return;
        const sessionId = localStorage.getItem('session_id') || (() => {
            const id = Math.random().toString(36).substr(2, 12);
            localStorage.setItem('session_id', id);
            return id;
        })();
        const customerId = (() => {
            try { return JSON.parse(localStorage.getItem('customer'))?.id; } catch { return null; }
        })();
        api.post('/recommendations/view', {
            productId: product.id,
            customerId,
            sessionId,
            vendorId: product.vendor_id,
            categoryId: product.category_id,
        }).catch(() => {});
    }, [product?.id]);

    // Load frequently bought together
    useEffect(() => {
        if (!product?.id) return;
        api.get(`/recommendations/frequently-bought/${product.id}`)
            .then(res => setFreqBought(res.data.products || []))
            .catch(() => {});
    }, [product?.id]);

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

    const loadComparison = async () => {
        if (!product?.id || compareData) return;
        setCompareLoading(true);
        try {
            const res = await api.get(`/price-comparison/${product.id}`);
            setCompareData(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setCompareLoading(false);
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
                <span className="text-foreground font-medium truncate max-w-[200px]">{language === 'bn' && product.nameBn ? product.nameBn : product.name}</span>
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
                        <h1 className="text-2xl font-bold text-foreground mb-2">{language === 'bn' && product.nameBn ? product.nameBn : product.name}</h1>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Unit:</span>
                                <span className="font-medium bg-muted px-2 py-0.5 rounded text-sm">{product.unit || 'Each'}</span>
                            </div>
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
                        <span className="text-sm text-muted-foreground mb-1">{product.unit ? `Per ${product.unit.replace(/^per\s+/i, '')}` : 'Per Piece'}</span>
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
                        <div className="pt-2 border-t">
                            <DeliveryInfoCard
                                product={product}
                                onChangeLocation={() => setShowLocationModal(true)}
                            />
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
                    <button
                        onClick={() => { setActiveTab('compare'); loadComparison(); }}
                        className={`px-6 py-3 font-semibold text-sm transition-colors flex items-center gap-1 ${activeTab === 'compare' ? 'bg-primary text-white border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Compare Prices
                        {compareData?.summary?.vendor_count > 1 && (
                            <span className="ml-1 bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">{compareData.summary.vendor_count} stores</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('qa')}
                        className={`px-6 py-3 font-semibold text-sm transition-colors ${activeTab === 'qa' ? 'bg-primary text-white border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Q&amp;A
                    </button>
                </div>
                <div className="p-6">
                    {activeTab === 'compare' ? (
                        compareLoading ? (
                            <div className="space-y-3 py-4">{Array(3).fill(0).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
                        ) : !compareData || compareData?.offers?.length <= 1 ? (
                            <div className="text-center py-8 text-gray-400">
                                <p>Only one seller offers this product</p>
                                <p className="text-sm mt-1">This is the best (and only) price available</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-gray-500 text-xs">
                                            <th className="pb-2 font-medium">Store</th>
                                            <th className="pb-2 font-medium">Price</th>
                                            <th className="pb-2 font-medium">Shipping</th>
                                            <th className="pb-2 font-medium">Total</th>
                                            <th className="pb-2 font-medium">Rating</th>
                                            <th className="pb-2 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compareData.offers.map(offer => (
                                            <tr key={offer.id || offer.vendor_id} className={`border-b last:border-0 ${offer.is_lowest ? 'bg-green-50' : ''}`}>
                                                <td className="py-3">
                                                    <div className="flex items-center gap-2">
                                                        {offer.store_logo && <img src={offer.store_logo} alt="" className="w-6 h-6 rounded object-cover" />}
                                                        <div>
                                                            <a href={`/store/${offer.vendor_slug}`} className="font-medium text-blue-600 hover:underline text-xs">{offer.store_name}</a>
                                                            {offer.is_lowest && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Best Price</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 font-semibold">৳{offer.effective_price?.toLocaleString()}</td>
                                                <td className="py-3 text-gray-500">{offer.shipping_charge > 0 ? `৳${offer.shipping_charge}` : 'Free'}</td>
                                                <td className="py-3 font-bold text-gray-900">৳{offer.total_price?.toLocaleString()}</td>
                                                <td className="py-3">
                                                    {offer.vendor_rating ? (
                                                        <span className="flex items-center gap-0.5 text-xs">
                                                            <span className="text-yellow-500">★</span> {Number(offer.vendor_rating).toFixed(1)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3">
                                                    <a href={`/product/${offer.slug}`} className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                                                        View
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {compareData.summary && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                                        Max savings: ৳{compareData.summary.max_savings?.toLocaleString()} · {compareData.summary.vendor_count} sellers
                                    </div>
                                )}
                            </div>
                        )
                    ) : activeTab === 'overview' ? (
                        (product.description || product.shortDescription || product.descriptionBn || product.shortDescriptionBn) ? (
                            <div className="space-y-5">
                                <h3 className="font-bold text-base text-primary">{language === 'bn' ? 'পণ্যের বিবরণ' : 'Product Description'}</h3>

                                {(language === 'bn' ? (product.shortDescriptionBn || product.shortDescription) : product.shortDescription) && (
                                    <div className="bg-primary/5 border-l-4 border-primary rounded-r-md px-4 py-3">
                                        <p
                                            className="text-foreground text-sm leading-relaxed font-medium"
                                            dangerouslySetInnerHTML={{ __html: language === 'bn' ? (product.shortDescriptionBn || product.shortDescription) : product.shortDescription }}
                                        />
                                    </div>
                                )}

                                {(language === 'bn' ? (product.descriptionBn || product.description) : product.description) && (
                                    <div
                                        className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground/90 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h3]:font-semibold [&_h3]:mt-2 [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_img]:rounded-md [&_img]:my-3"
                                        dangerouslySetInnerHTML={{ __html: language === 'bn' ? (product.descriptionBn || product.description) : product.description }}
                                    />
                                )}

                                {/* Quick info grid — always shown for a polished look */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t">
                                    <div className="bg-muted/40 rounded-lg p-3">
                                        <div className="text-xs text-muted-foreground">Unit</div>
                                        <div className="font-semibold text-sm mt-0.5">{product.unit || 'Each'}</div>
                                    </div>
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
                                    {language === 'bn' ? 'এই পণ্যের বিস্তারিত বিবরণ দেওয়া হয়নি।' : <>No detailed description provided for <span className="font-semibold text-foreground">{product.name}</span>.</>}
                                </p>
                                <p className="text-muted-foreground/80 text-xs mt-2">
                                    {product.unit ? `Sold ${product.unit.toLowerCase()}.` : ''} {product.stock > 0 ? 'In stock and ready to ship.' : ''}
                                </p>
                            </div>
                        )
                    ) : activeTab === 'qa' ? (
                        <ProductQA productId={product._id || product.id} />
                    ) : (
                        <ReviewSection productId={product._id || product.id} />
                    )}
                </div>
            </div>

            {/* ── Frequently Bought Together ── */}
            {freqBought.length > 0 && (
                <div className="mt-10 border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-bold">Frequently Bought Together</h2>
                        </div>
                        {freqBought.length > 1 && (
                            <Button
                                size="sm"
                                className="bg-[#E31E24] hover:bg-[#b9151a] gap-1.5"
                                onClick={() => {
                                    freqBought.forEach(p => {
                                        addToCart({
                                            id: p.id,
                                            name: p.name,
                                            thumbnail: p.thumbnail,
                                            salePrice: p.sale_price,
                                            regularPrice: p.regular_price,
                                            price: p.price,
                                        }, 1);
                                    });
                                    toast.success(`Added ${freqBought.length} items to cart`);
                                }}
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Add All to Cart
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {freqBought.map((p, idx) => (
                            <React.Fragment key={p.id}>
                                {idx > 0 && (
                                    <div className="flex items-center flex-shrink-0 text-xl font-bold text-muted-foreground px-1">+</div>
                                )}
                                <Link
                                    to={`/product/${p.slug}`}
                                    className="group flex-shrink-0 w-36 flex flex-col border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/40 transition-all bg-card"
                                >
                                    <div className="bg-white aspect-square overflow-hidden">
                                        {p.thumbnail ? (
                                            <img
                                                src={getImageUrl(p.thumbnail)}
                                                alt={p.name}
                                                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 flex flex-col gap-0.5">
                                        <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">{p.name}</p>
                                        <span className="font-bold text-primary text-sm">{formatPrice(p.price)}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addToCart({
                                                id: p.id,
                                                name: p.name,
                                                thumbnail: p.thumbnail,
                                                salePrice: p.sale_price,
                                                regularPrice: p.regular_price,
                                                price: p.price,
                                            }, 1);
                                            toast.success(`Added ${p.name} to cart`);
                                        }}
                                        className="bg-[#E31E24] text-white text-xs font-semibold py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1"
                                    >
                                        <ShoppingCart className="h-3 w-3" />
                                        Add
                                    </button>
                                </Link>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

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
