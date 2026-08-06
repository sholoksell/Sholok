import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { addressService } from '@/services/addressService';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MapPin, CreditCard, Banknote, Loader2, Clock, Salad } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = '/api';

const CheckoutPage = () => {
    const { cart, clearCart } = useCartStore();
    const { isAuthenticated, customer } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [grocerySlots, setGrocerySlots] = useState([]);
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('today');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [bundleOffers, setBundleOffers] = useState([]);

    // Check if cart has grocery items
    const hasGrocery = (cart?.items || []).some(item => item.product_type === 'perishable');

    // Check bundle offers when cart changes
    useEffect(() => {
        const cartItems = cart?.items || [];
        if (cartItems.length === 0) { setBundleOffers([]); return; }
        const checkBundles = async () => {
            try {
                const res = await fetch(`${API_BASE}/bundle-offers/check-cart`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cartItems.map(i => ({
                            productId: i.productId || i._id || i.id,
                            quantity: i.quantity,
                        })),
                    }),
                });
                if (!res.ok) return;
                const data = await res.json();
                setBundleOffers(data.applicable || []);
            } catch { /* silently ignore */ }
        };
        checkBundles();
    }, [cart]);

    useEffect(() => {
        if (!hasGrocery) return;
        fetch(`${API_BASE}/grocery-settings/slots`)
            .then(r => r.json())
            .then(data => setGrocerySlots((data || []).filter(s => s.isActive)))
            .catch(() => {});
    }, [hasGrocery]);

    // Normalize customer.address — it may be an object { street, city, ... } or a string
    const customerAddrObj = customer?.address && typeof customer.address === 'object' ? customer.address : null;
    const customerAddrStr = typeof customer?.address === 'string' ? customer.address : (customerAddrObj?.street || '');

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            fullName: customer?.name || '',
            phone: customer?.phone || '',
            address: customerAddrStr,
            city: customerAddrObj?.city || 'Dhaka',
            area: customerAddrObj?.state || '',
        }
    });

    // Pre-fill from default saved address in the address book
    useEffect(() => {
        if (!isAuthenticated) return;
        addressService.getAll().then((list) => {
            const def = (list || []).find(a => a.isDefault) || (list || [])[0];
            if (def) {
                reset({
                    fullName: def.name || customer?.name || '',
                    phone: def.phone || customer?.phone || '',
                    address: def.street || customerAddrStr,
                    city: def.city || 'Dhaka',
                    area: def.state || '',
                });
            }
        }).catch(() => { /* ignore */ });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const items = cart?.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = items.length > 0 ? 60 : 0;
    const total = subtotal + shippingCost - couponDiscount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const res = await fetch(`${API_BASE}/marketing/coupons/validate/${couponCode.trim().toUpperCase()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid coupon');
            const coupon = data.coupon;
            if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
                throw new Error(`Minimum purchase ৳${coupon.minPurchaseAmount} required`);
            }
            let discount = 0;
            if (coupon.discountType === 'percentage') {
                discount = (subtotal * coupon.discountValue) / 100;
                if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
            } else {
                discount = coupon.discountValue;
            }
            discount = Math.min(discount, subtotal);
            setCouponDiscount(discount);
            setAppliedCoupon(coupon);
            toast.success(`Coupon applied! You save ৳${discount.toFixed(0)}`);
        } catch (err) {
            setCouponDiscount(0);
            setAppliedCoupon(null);
            toast.error(err.message);
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => { setCouponDiscount(0); setAppliedCoupon(null); setCouponCode(''); };

    const onSubmit = async (data) => {
        if (items.length === 0) {
            toast.error(t('cartIsEmpty'));
            return;
        }

        try {
            setLoading(true);
            const orderData = {
                items: items.map(item => ({
                    productId: item._id,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity,
                })),
                shippingAddress: {
                    name: data.fullName,
                    phone: data.phone,
                    street: data.address,
                    city: data.city,
                    state: data.area,
                    country: 'Bangladesh',
                },
                paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'credit_card',
                subtotal,
                shippingCost,
                discount: couponDiscount,
                total,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
            };

            if (hasGrocery) {
                const today = new Date();
                const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
                orderData.grocery_delivery_date = selectedDeliveryDate === 'today'
                    ? today.toISOString().slice(0, 10)
                    : tomorrow.toISOString().slice(0, 10);
                orderData.grocery_delivery_slot_id = selectedSlotId ? Number(selectedSlotId) : null;
            }
            await orderService.create(orderData);
            toast.success(t('orderPlacedSuccess'));
            clearCart();
            navigate('/account');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || t('failedToPlaceOrder'));
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !customer) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('pleaseLoginToCheckout')}</h2>
                <p className="text-muted-foreground mb-6">{t('needSignedIn')}</p>
                <div className="flex justify-center gap-4">
                    <Link to="/login?redirect=/checkout">
                        <Button>{t('login')}</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="outline">{t('register')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('yourCartIsEmpty')}</h2>
                <Link to="/">
                    <Button>{t('continueShopping')}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Shipping Address */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">{t('shippingAddress')}</h2>
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('fullName')}</label>
                                    <Input
                                        {...register('fullName', { required: t('nameRequired') })}
                                        placeholder={t('fullName')}
                                    />
                                    {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('phoneNumber')}</label>
                                    <Input
                                        {...register('phone', { required: t('phoneRequired') })}
                                        placeholder={t('phoneNumber')}
                                    />
                                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('address')}</label>
                                <Input
                                    {...register('address', { required: t('addressRequired') })}
                                    placeholder={t('address')}
                                />
                                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('city')}</label>
                                    <Input
                                        {...register('city', { required: t('cityRequired') })}
                                        defaultValue="Dhaka"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('areaThana')}</label>
                                    <Input
                                        {...register('area', { required: t('areaRequired') })}
                                        placeholder="e.g. Gulshan, Mirpur"
                                    />
                                    {errors.area && <span className="text-red-500 text-xs">{errors.area.message}</span>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Grocery Delivery Schedule */}
                    {hasGrocery && (
                        <div className="bg-card border border-green-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Salad className="h-5 w-5 text-green-600" />
                                <h2 className="text-xl font-semibold">{t('groceryDeliverySchedule')}</h2>
                            </div>

                            {/* Date selection */}
                            <div className="mb-4">
                                <label className="text-sm font-medium mb-2 block">{t('deliveryDate')}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['today', 'tomorrow'].map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setSelectedDeliveryDate(day)}
                                            className={`border rounded-lg p-3 text-sm font-medium transition-colors ${selectedDeliveryDate === day ? 'border-green-500 bg-green-50 text-green-700' : 'hover:border-green-300'}`}
                                        >
                                            {day === 'today' ? t('today') : t('tomorrow')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time slot selection */}
                            <div>
                                <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                                    <Clock className="h-4 w-4" /> {t('selectTimeSlot')}
                                </label>
                                {grocerySlots.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {grocerySlots.map(slot => (
                                            <button
                                                key={slot._id}
                                                type="button"
                                                onClick={() => setSelectedSlotId(String(slot._id))}
                                                className={`border rounded-lg p-2.5 text-xs font-medium transition-colors text-left ${selectedSlotId === String(slot._id) ? 'border-green-500 bg-green-50 text-green-700' : 'hover:border-green-300'}`}
                                            >
                                                {slot.label}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Slots loading...</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Payment Method */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Banknote className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">{t('paymentMethod')}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => setPaymentMethod('cod')}
                            >
                                <Banknote className="h-6 w-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold">{t('cashOnDelivery')}</h3>
                                    <p className="text-xs text-muted-foreground">Bkash / Nagad / Card</p>
                                </div>
                            </div>

                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => setPaymentMethod('online')}
                            >
                                <CreditCard className="h-6 w-6 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold">{t('cardPayment')}</h3>
                                    <p className="text-xs text-muted-foreground">Bkash / Nagad / Card</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">{t('orderSummary')}</h2>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                            {items.map((item) => (
                                <div key={item._id} className="flex gap-3 text-sm">
                                    <div className="h-12 w-12 bg-white border rounded flex-shrink-0 overflow-hidden">
                                        <img src={getImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-2">{item.name}</p>
                                        <p className="text-muted-foreground">{item.quantity} x {formatPrice(item.price)}</p>
                                    </div>
                                    <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Coupon Code */}
                        <div className="border-t pt-4 mb-4">
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-green-700">{appliedCoupon.code}</span>
                                        <span className="text-green-600 ml-2">−{formatPrice(couponDiscount)}</span>
                                    </div>
                                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-xs font-medium">{t('remove')}</button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder={t('enterCouponCode')}
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={couponLoading || !couponCode.trim()}
                                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {couponLoading ? '…' : t('apply')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bundle offer banners */}
                        {bundleOffers.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {bundleOffers.map((offer, i) => (
                                    <div key={offer.id ?? i} className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-sm">
                                        <span className="text-base leading-none mt-0.5">🎁</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-purple-800 line-clamp-1">Bundle offer applied: {offer.name}</p>
                                            {offer.discount_amount > 0 && (
                                                <p className="text-purple-600 text-xs">Save {formatPrice(offer.discount_amount)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2 border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('subtotal')}</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('shippingFee')}</span>
                                <span>{formatPrice(shippingCost)}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>{t('couponDiscount')}</span>
                                    <span>−{formatPrice(couponDiscount)}</span>
                                </div>
                            )}
                            {bundleOffers.length > 0 && bundleOffers.some(o => o.discount_amount > 0) && (
                                <div className="flex justify-between text-purple-600">
                                    <span>Bundle Savings</span>
                                    <span>−{formatPrice(bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0))}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>{t('total')}</span>
                                <span className="text-primary">{formatPrice(Math.max(0, total - bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0)))}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            size="lg"
                            onClick={() => document.getElementById('checkout-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('placingOrder')}
                                </>
                            ) : (
                                t('placeOrder')
                            )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                            By placing this order, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
