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
import { MapPin, CreditCard, Banknote, Loader2 } from 'lucide-react';

const CheckoutPage = () => {
    const { cart, clearCart } = useCartStore();
    const { isAuthenticated, customer } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');

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
    // Flat ৳60 delivery (matches cart sidebar)
    const shippingCost = items.length > 0 ? 60 : 0;
    const total = subtotal + shippingCost;

    const onSubmit = async (data) => {
        if (items.length === 0) {
            toast.error('Your cart is empty');
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
                total,
            };

            await orderService.create(orderData);

            // Save shipping address to customer's address book
            try {
                const existingAddresses = await addressService.getAll();
                const alreadySaved = existingAddresses.some(
                    a => a.street === data.address && a.city === data.city
                );
                if (!alreadySaved) {
                    await addressService.create({
                        label: 'Home',
                        name: data.fullName,
                        phone: data.phone,
                        street: data.address,
                        city: data.city,
                        state: data.area || '',
                        country: 'Bangladesh',
                        isDefault: existingAddresses.length === 0,
                    });
                }
            } catch (_) { /* non-blocking */ }

            toast.success('Order placed successfully!');
            clearCart();
            navigate('/account'); // Redirect to order history
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !customer) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Login to Checkout</h2>
                <p className="text-muted-foreground mb-6">You need to be signed in to place an order.</p>
                <div className="flex justify-center gap-4">
                    <Link to="/login?redirect=/checkout">
                        <Button>Login</Button>
                    </Link>
                    <Link to="/register">
                        <Button variant="outline">Register</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
                <Link to="/">
                    <Button>Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Shipping Address */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Shipping Address</h2>
                        </div>

                        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        {...register('fullName', { required: 'Name is required' })}
                                        placeholder="Enter your name"
                                    />
                                    {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone Number</label>
                                    <Input
                                        {...register('phone', { required: 'Phone is required' })}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <Input
                                    {...register('address', { required: 'Address is required' })}
                                    placeholder="House no, Road no, Area"
                                />
                                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City</label>
                                    <Input
                                        {...register('city', { required: 'City is required' })}
                                        defaultValue="Dhaka"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Area / Thana</label>
                                    <Input
                                        {...register('area', { required: 'Area is required' })}
                                        placeholder="e.g. Gulshan, Mirpur"
                                    />
                                    {errors.area && <span className="text-red-500 text-xs">{errors.area.message}</span>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Banknote className="h-5 w-5 text-primary" />
                            <h2 className="text-xl font-semibold">Payment Method</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => setPaymentMethod('cod')}
                            >
                                <Banknote className="h-6 w-6 text-green-600" />
                                <div>
                                    <h3 className="font-semibold">Cash On Delivery</h3>
                                    <p className="text-xs text-muted-foreground">Pay when you receive</p>
                                </div>
                            </div>

                            <div
                                className={`border rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${paymentMethod === 'online' ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                onClick={() => setPaymentMethod('online')}
                            >
                                <CreditCard className="h-6 w-6 text-blue-600" />
                                <div>
                                    <h3 className="font-semibold">Online Payment</h3>
                                    <p className="text-xs text-muted-foreground">Bkash / Nagad / Card</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

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

                        <div className="space-y-2 border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{formatPrice(shippingCost)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatPrice(total)}</span>
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
                                    Processing...
                                </>
                            ) : (
                                'Place Order'
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
