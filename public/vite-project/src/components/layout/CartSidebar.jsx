import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { EmptyCart } from '@/components/EmptyStates';

const CartSidebar = () => {
    const { cart, removeFromCart, updateCartItem } = useCartStore();
    const { isCartSidebarOpen, closeCartSidebar } = useUIStore();
    const navigate = useNavigate();

    useEffect(() => {
        // Listen for custom cart open event
        const handleOpenCart = () => {
            useUIStore.getState().openCartSidebar();
        };
        window.addEventListener('openCart', handleOpenCart);
        return () => window.removeEventListener('openCart', handleOpenCart);
    }, []);

    const handleCheckout = () => {
        closeCartSidebar();
        navigate('/checkout');
    };

    const handleUpdateQuantity = (itemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity >= 1) {
            updateCartItem(itemId, newQuantity);
        }
    };

    if (!isCartSidebarOpen) return null;

    const items = cart?.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? 60 : 0; // Flat ৳60 delivery
    const total = subtotal + deliveryFee;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 transition-opacity animate-fade-in backdrop-blur-sm"
                onClick={closeCartSidebar}
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right"
            >

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#E31E24] to-[#b9151a] text-white">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" />
                        <div>
                            <h2 className="font-bold text-lg">Shopping Cart</h2>
                            <p className="text-xs text-white/80">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={closeCartSidebar}
                        className="text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                        <EmptyCart onClose={closeCartSidebar} />
                    ) : (
                        items.map((item) => (
                            <div 
                                key={item._id} 
                                className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-all duration-300 bg-white"
                            >
                                {/* Product image */}
                                <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-50">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div className="flex justify-between gap-2">
                                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-end justify-between mt-2">
                                        <div className="flex items-center border border-gray-300 rounded-lg bg-white h-9 shadow-sm">
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                                                className="px-3 hover:bg-gray-100 disabled:opacity-50 h-full flex items-center transition-colors rounded-l-lg"
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-3 w-3 text-gray-600" />
                                            </button>
                                            <div className="w-10 text-center text-sm font-semibold">{item.quantity}</div>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                                                className="px-3 hover:bg-gray-100 h-full flex items-center transition-colors rounded-r-lg"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-3 w-3 text-gray-600" />
                                            </button>
                                        </div>
                                        <div className="font-bold text-[#E31E24]">৳{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
                        {/* Price Breakdown */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fee</span>
                                <span className="font-semibold">৳{deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between text-lg">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-[#E31E24]">৳{total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        {/* Continue Shopping Link */}
                        <button
                            onClick={closeCartSidebar}
                            className="w-full text-center text-sm text-gray-600 hover:text-[#E31E24] transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
