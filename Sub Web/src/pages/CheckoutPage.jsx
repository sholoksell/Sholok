import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Loader2, Clock, Salad, Briefcase, Home, Truck, CheckCircle2,
  Tag, ChevronDown, Pencil, MapPin, ChevronRight, AlertCircle,
  Package, Plus, Minus, Trash2, ShoppingBag, CreditCard, Smartphone,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = '/api';

const BD_GEO = {
  'Dhaka':      ['Dhaka','Gazipur','Narsingdi','Manikganj','Munshiganj','Narayanganj','Tangail','Faridpur','Gopalganj','Kishoreganj','Madaripur','Rajbari','Shariatpur'],
  'Chattogram': ['Chattogram',"Cox's Bazar",'Rangamati','Bandarban','Khagrachari','Feni','Lakshmipur','Noakhali','Cumilla','Chandpur','Brahmanbaria'],
  'Sylhet':     ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
  'Rajshahi':   ['Rajshahi','Bogura','Chapai Nawabganj','Naogaon','Natore','Pabna','Sirajganj','Joypurhat'],
  'Khulna':     ['Khulna','Bagerhat','Satkhira','Jashore','Magura','Jhenaidah','Narail','Chuadanga','Kushtia','Meherpur'],
  'Barishal':   ['Barishal','Bhola','Jhalokathi','Patuakhali','Pirojpur','Barguna'],
  'Rangpur':    ['Rangpur','Dinajpur','Kurigram','Gaibandha','Nilphamari','Lalmonirhat','Panchgarh','Thakurgaon'],
  'Mymensingh': ['Mymensingh','Jamalpur','Netrokona','Sherpur'],
};

const getDivision = (district) => {
  for (const [div, dists] of Object.entries(BD_GEO)) {
    if (dists.includes(district)) return div;
  }
  return '';
};

const SelectField = ({ label, value, onChange, options, placeholder, error, disabled }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700 block">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent pr-8 transition-colors ${
          error ? 'border-red-400' : 'border-gray-200'
        } ${!value ? 'text-gray-400' : 'text-gray-800'} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextField = ({ label, placeholder, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-700 block">{label}</label>
    <input
      {...props}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors ${
        error ? 'border-red-400' : 'border-gray-200'
      } text-gray-800 placeholder-gray-400 bg-white`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const CheckoutPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated, customer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const placeOrderLock = useRef(false);
  const addrFormRef = useRef(null);

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
  const [addressLabel, setAddressLabel] = useState('home');
  const [addrSaved, setAddrSaved] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Item selection state
  const allItems = cart?.items || [];
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set(allItems.map(i => i._id)));

  // Sync selection when cart changes (new item added etc.)
  useEffect(() => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      allItems.forEach(i => { if (!newSet.has(i._id)) newSet.add(i._id); });
      return newSet;
    });
  }, [cart]);

  const toggleItem = (id) => {
    setSelectedItemIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAll = () => {
    if (selectedItemIds.size === allItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(allItems.map(i => i._id)));
    }
  };

  const handleQtyChange = (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) {
      removeFromCart(item._id);
      setSelectedItemIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
    } else {
      updateCartItem(item._id, newQty);
    }
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item._id);
    setSelectedItemIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
  };

  // All DB areas (763 total), keyed by district
  const [areasByDistrict, setAreasByDistrict] = useState({});
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedAreaObj, setSelectedAreaObj] = useState(null);
  const [shippingCost, setShippingCost] = useState(null);
  const [rateGroupName, setRateGroupName] = useState(null);

  // Cascading location state
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [areaName, setAreaName] = useState('');
  const [buildingAddr, setBuildingAddr] = useState('');
  const [colonyAddr, setColonyAddr] = useState('');
  const [streetAddr, setStreetAddr] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const selectedItems = allItems.filter(i => selectedItemIds.has(i._id));
  const hasGrocery = selectedItems.some(item => item.product_type === 'perishable');
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  useEffect(() => {
    setAreasLoading(true);
    fetch(`${API_BASE}/shipping/areas/active`)
      .then(r => r.ok ? r.json() : [])
      .then(areas => {
        const byDistrict = {};
        for (const a of (Array.isArray(areas) ? areas : [])) {
          const d = a.city || '';
          if (!byDistrict[d]) byDistrict[d] = [];
          byDistrict[d].push(a);
        }
        for (const d of Object.keys(byDistrict)) {
          byDistrict[d].sort((a, b) => a.name.localeCompare(b.name));
        }
        setAreasByDistrict(byDistrict);
      })
      .catch(() => {})
      .finally(() => setAreasLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const saved = localStorage.getItem('delivery_location');
      if (saved) {
        const loc = JSON.parse(saved);
        if (loc.division) setDivision(loc.division);
        if (loc.city || loc.district) setDistrict(loc.city || loc.district);
        if (loc.area_name) setAreaName(loc.area_name);
      }
    } catch {}
    setFullName(customer?.name || '');
    setPhone(customer?.phone || '');
  }, [isAuthenticated, customer]);

  useEffect(() => {
    if (!district || !Object.keys(areasByDistrict).length) {
      if (!district) { setSelectedAreaObj(null); setShippingCost(null); setRateGroupName(null); }
      return;
    }
    if (!areaName) { setSelectedAreaObj(null); return; }
    const found = (areasByDistrict[district] || []).find(a => a.name === areaName);
    setSelectedAreaObj(found || null);
  }, [district, areaName, areasByDistrict]);

  useEffect(() => {
    if (!district) { setShippingCost(null); setRateGroupName(null); return; }
    setShippingLoading(true);
    fetch(`${API_BASE}/delivery-rates/charge?district=${encodeURIComponent(district)}&area=${encodeURIComponent(areaName || '')}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.matched) {
          setShippingCost(d.charge);
          setRateGroupName(d.groupName || 'Rate Group');
        } else if (selectedAreaObj) {
          const charge = Number(selectedAreaObj.deliveryCharge || selectedAreaObj.delivery_charge || 0);
          const threshold = Number(selectedAreaObj.freeDeliveryThreshold || selectedAreaObj.free_delivery_threshold || 0);
          setShippingCost(threshold > 0 && subtotal >= threshold ? 0 : charge);
          setRateGroupName(null);
        } else {
          setShippingCost(null);
          setRateGroupName(null);
        }
      })
      .catch(() => {
        if (selectedAreaObj) {
          const charge = Number(selectedAreaObj.deliveryCharge || selectedAreaObj.delivery_charge || 0);
          setShippingCost(charge);
        } else setShippingCost(null);
        setRateGroupName(null);
      })
      .finally(() => setShippingLoading(false));
  }, [district, areaName, selectedAreaObj, subtotal]);

  useEffect(() => {
    if (!hasGrocery) return;
    fetch(`${API_BASE}/grocery-settings/slots`)
      .then(r => r.json())
      .then(d => setGrocerySlots((d || []).filter(s => s.isActive)))
      .catch(() => {});
  }, [hasGrocery]);

  useEffect(() => {
    if (!selectedItems.length) { setBundleOffers([]); return; }
    fetch(`${API_BASE}/bundle-offers/check-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: selectedItems.map(i => ({ productId: i.productId || i._id || i.id, quantity: i.quantity })) }),
    }).then(r => r.ok ? r.json() : { applicable: [] })
      .then(d => setBundleOffers(d.applicable || []))
      .catch(() => {});
  }, [cart, selectedItemIds]);

  const effectiveShipping = selectedItems.length > 0 && shippingCost !== null ? shippingCost : 0;
  const bundleSavings = bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0);
  const total = Math.max(0, subtotal + effectiveShipping - couponDiscount - bundleSavings);

  const handleDivisionChange = (v) => {
    setDivision(v); setDistrict(''); setAreaName(''); setSelectedAreaObj(null); setShippingCost(null);
  };
  const handleDistrictChange = (v) => {
    setDistrict(v); setAreaName(''); setSelectedAreaObj(null); setShippingCost(null);
    if (v && !division) setDivision(getDivision(v));
  };
  const handleAreaChange = (v) => setAreaName(v);

  const availableDistricts = division
    ? (BD_GEO[division] || []).filter(d => (areasByDistrict[d] || []).length > 0)
    : [];
  const availableAreas = district ? (areasByDistrict[district] || []) : [];

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${API_BASE}/marketing/coupons/validate/${couponCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      const coupon = data.coupon;
      if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount)
        throw new Error(`Minimum purchase ৳${coupon.minPurchaseAmount} required`);
      let discount = coupon.discountType === 'percentage'
        ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity)
        : coupon.discountValue;
      discount = Math.min(discount, subtotal);
      setCouponDiscount(discount);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! You save ৳${discount.toFixed(0)}`);
    } catch (err) {
      setCouponDiscount(0); setAppliedCoupon(null);
      toast.error(err.message);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => { setCouponDiscount(0); setAppliedCoupon(null); setCouponCode(''); };

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^(\+88)?0[1-9]\d{9}$/.test(phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid BD phone number';
    if (!division) errs.division = 'Select your division';
    if (!district) errs.district = 'Select your district';
    if (availableAreas.length > 0 && !areaName) errs.areaName = 'Select your area/upazila';
    if (!buildingAddr.trim()) errs.buildingAddr = 'House/Building no. is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validate()) return;
    setAddrSaved(true);
    toast.success('Delivery address saved');
  };

  const handleEditAddress = () => {
    setAddrSaved(false);
    setTimeout(() => addrFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handlePlaceOrder = async () => {
    if (placeOrderLock.current) return;
    if (!validate()) { toast.error('Please fill in all required fields'); return; }
    if (!selectedItems.length) { toast.error('Please select at least one item'); return; }
    if (availableAreas.length > 0 && !selectedAreaObj) {
      toast.error('Please select your area to calculate delivery fee');
      return;
    }
    placeOrderLock.current = true;
    try {
      setLoading(true);
      const fullAddress = [buildingAddr, colonyAddr, streetAddr].filter(Boolean).join(', ');
      const orderData = {
        items: selectedItems.map(item => ({
          productId: item._id || item.productId,
          productName: item.name,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || '',
          total: item.price * item.quantity,
        })),
        shippingAddress: {
          name: fullName,
          phone,
          street: fullAddress,
          city: district,
          state: areaName || district,
          country: 'Bangladesh',
          division,
          areaId: selectedAreaObj?._id || null,
          areaName: areaName || null,
          label: addressLabel,
        },
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
        subtotal,
        shippingCost: effectiveShipping,
        deliveryCharge: effectiveShipping,
        discount: couponDiscount + bundleSavings,
        total,
        couponCode: appliedCoupon?.code,
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
      toast.success(t('orderPlacedSuccess') || 'Order placed successfully!');
      clearCart();
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.message || t('failedToPlaceOrder') || 'Failed to place order');
    } finally {
      setLoading(false);
      placeOrderLock.current = false;
    }
  };

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('pleaseLoginToCheckout') || 'Login to Checkout'}</h2>
          <p className="text-gray-500 mb-6">{t('needSignedIn') || 'You need to be signed in to place an order'}</p>
          <div className="flex justify-center gap-3">
            <Link to="/login?redirect=/checkout">
              <button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">{t('login') || 'Login'}</button>
            </Link>
            <Link to="/register">
              <button className="border border-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:border-violet-500 hover:text-violet-600 transition-colors">{t('register') || 'Register'}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!allItems.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center">
          <Package className="w-10 h-10 text-violet-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('yourCartIsEmpty') || 'Your cart is empty'}</h2>
        <p className="text-gray-500">Add some products to continue</p>
        <Link to="/">
          <button className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors">
            {t('continueShopping') || 'Continue Shopping'}
          </button>
        </Link>
      </div>
    );
  }

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const deliveryDays = selectedAreaObj?.estimatedDeliveryDays || selectedAreaObj?.estimated_delivery_days || 3;
  const deliveryByDate = new Date(Date.now() + deliveryDays * 86400000);
  const deliveryRangeEnd = new Date(Date.now() + (deliveryDays + 2) * 86400000);

  const noAreaAvailable = district && availableAreas.length === 0 && !areasLoading;
  const needsArea = district && availableAreas.length > 0 && !areaName;
  const freeThreshold = selectedAreaObj
    ? Number(selectedAreaObj.freeDeliveryThreshold || selectedAreaObj.free_delivery_threshold || 0)
    : 0;

  const allSelected = selectedItemIds.size === allItems.length && allItems.length > 0;
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < allItems.length;

  const paymentMethods = [
    { key: 'cod',    label: 'Cash on Delivery', sub: 'Pay when you receive', icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'bkash',  label: 'bKash',             sub: 'Mobile banking payment', icon: <Smartphone className="w-5 h-5" /> },
    { key: 'nagad',  label: 'Nagad',              sub: 'Mobile banking payment', icon: <Smartphone className="w-5 h-5" /> },
    { key: 'card',   label: 'Card / Online',      sub: 'Debit or Credit Card',  icon: <CreditCard className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f5f3ff' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
          <Link to="/" className="hover:text-violet-600 hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/cart" className="hover:text-violet-600 hover:underline">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 font-medium">Checkout</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Delivery Address */}
            <div ref={addrFormRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                  {addrSaved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                {addrSaved && (
                  <button type="button" onClick={handleEditAddress}
                    className="flex items-center gap-1 text-violet-600 text-sm font-semibold hover:underline">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>

              {addrSaved ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-violet-50 rounded-lg p-3.5 border border-violet-100">
                    <div className={`mt-0.5 p-1.5 rounded-full ${addressLabel === 'office' ? 'bg-blue-100' : 'bg-violet-100'}`}>
                      {addressLabel === 'office'
                        ? <Briefcase className="w-4 h-4 text-blue-600" />
                        : <Home className="w-4 h-4 text-violet-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{fullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{phone}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[buildingAddr, colonyAddr, areaName, district, division].filter(Boolean).join(', ')}
                      </p>
                      {streetAddr && <p className="text-xs text-gray-400 mt-0.5 italic">{streetAddr}</p>}
                    </div>
                  </div>
                  {(selectedAreaObj || (district && shippingCost !== null)) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-800">
                          {effectiveShipping === 0 ? 'Free Delivery!' : `Delivery Fee: ৳${effectiveShipping}`}
                          {rateGroupName && (
                            <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 px-1.5 py-0.5 rounded">{rateGroupName}</span>
                          )}
                        </p>
                        <p className="text-green-700 text-xs mt-0.5">
                          Estimated {deliveryDays}–{deliveryDays + 2} days
                          {freeThreshold > 0 && effectiveShipping > 0 && <> · Free above ৳{freeThreshold}</>}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <TextField label="Full Name *" placeholder="Enter your full name" value={fullName}
                      onChange={e => setFullName(e.target.value)} error={formErrors.fullName} />
                    <TextField label="Phone Number *" placeholder="01XXXXXXXXX" value={phone}
                      onChange={e => setPhone(e.target.value)} error={formErrors.phone} type="tel" />
                    <SelectField label="Division *" value={division} onChange={handleDivisionChange}
                      options={Object.keys(BD_GEO)} placeholder="Select Division" error={formErrors.division} />
                    <SelectField label="District *" value={district} onChange={handleDistrictChange}
                      options={availableDistricts} placeholder={division ? 'Select District' : 'Select Division first'}
                      error={formErrors.district} disabled={!division || areasLoading} />
                    {!noAreaAvailable && (
                      <SelectField label="Area / Upazila *" value={areaName} onChange={handleAreaChange}
                        options={availableAreas.map(a => a.name)}
                        placeholder={district ? 'Select Area' : 'Select District first'}
                        error={formErrors.areaName} disabled={!district || areasLoading} />
                    )}
                    <TextField label="House / Building / Road *" placeholder="e.g. House 12, Road 4, Block C"
                      value={buildingAddr} onChange={e => setBuildingAddr(e.target.value)} error={formErrors.buildingAddr} />
                    <TextField label="Colony / Area / Landmark" placeholder="e.g. Near City Hospital"
                      value={colonyAddr} onChange={e => setColonyAddr(e.target.value)} />
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-700 block">Additional Notes (optional)</label>
                      <textarea rows={2} placeholder="Any special delivery instructions..."
                        value={streetAddr} onChange={e => setStreetAddr(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-800 placeholder-gray-400 resize-none bg-white" />
                    </div>
                  </div>

                  {(selectedAreaObj || (district && shippingCost !== null)) && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-green-800">
                          {effectiveShipping === 0 ? 'Free Delivery applied!' : `Delivery Fee: ৳${effectiveShipping}`}
                          {rateGroupName && (
                            <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 px-1.5 py-0.5 rounded">{rateGroupName}</span>
                          )}
                        </p>
                        <p className="text-green-700 text-xs mt-0.5">
                          {selectedAreaObj ? `${selectedAreaObj.name}, ${district}` : district}
                          {' — '}Estimated {deliveryDays}–{deliveryDays + 2} days
                          {freeThreshold > 0 && effectiveShipping > 0 && <> &nbsp;·&nbsp; Free above ৳{freeThreshold}</>}
                        </p>
                      </div>
                    </div>
                  )}

                  {noAreaAvailable && (
                    <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-800">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      No delivery areas configured for {district} yet. Standard rates apply.
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Address label:</p>
                    <div className="flex gap-3">
                      {[
                        { key: 'home',   icon: <Home className="w-4 h-4" />,     label: 'HOME' },
                        { key: 'office', icon: <Briefcase className="w-4 h-4" />, label: 'OFFICE' },
                      ].map(opt => (
                        <button key={opt.key} type="button" onClick={() => setAddressLabel(opt.key)}
                          className={`flex items-center gap-2 px-5 py-2 border rounded-lg text-sm font-medium transition-colors ${
                            addressLabel === opt.key
                              ? 'border-violet-500 text-violet-600 bg-violet-50'
                              : 'border-gray-200 text-gray-500 hover:border-violet-400'
                          }`}>
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button type="button" onClick={handleSaveAddress}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm px-8 py-2.5 rounded-lg transition-colors">
                    Save Address
                  </button>
                </>
              )}
            </div>

            {/* Grocery Schedule */}
            {hasGrocery && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Salad className="w-4 h-4 text-green-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">{t('groceryDeliverySchedule') || 'Grocery Delivery Schedule'}</h2>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">{t('deliveryDate') || 'Delivery Date'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['today', 'tomorrow'].map(day => (
                      <button key={day} type="button" onClick={() => setSelectedDeliveryDate(day)}
                        className={`border rounded-lg p-3 text-sm font-medium transition-colors ${
                          selectedDeliveryDate === day
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-violet-400'
                        }`}>
                        {day === 'today' ? `${t('today') || 'Today'} (${fmtDate(today)})` : `${t('tomorrow') || 'Tomorrow'} (${fmtDate(tomorrow)})`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t('selectTimeSlot') || 'Select Time Slot'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {grocerySlots.length > 0 ? grocerySlots.map(slot => (
                      <button key={slot._id} type="button" onClick={() => setSelectedSlotId(String(slot._id))}
                        className={`border rounded-lg p-2.5 text-xs font-medium text-left transition-colors ${
                          selectedSlotId === String(slot._id)
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 text-gray-600 hover:border-violet-400'
                        }`}>
                        {slot.label}
                      </button>
                    )) : <p className="text-sm text-gray-400 col-span-2">Loading slots…</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-violet-600" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Order Items</h2>
                  <span className="text-sm text-gray-500">({selectedItemIds.size}/{allItems.length} selected)</span>
                </div>
              </div>

              {/* Select All + delivery info row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative">
                    <input type="checkbox" className="sr-only"
                      checked={allSelected} onChange={toggleAll}
                      ref={el => { if (el) el.indeterminate = someSelected; }} />
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      allSelected || someSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-300'
                    }`}>
                      {allSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                      {someSelected && !allSelected && <div className="w-2 h-0.5 bg-white rounded" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Select All</span>
                </label>
                <div className="flex items-center gap-1.5 text-xs font-medium text-violet-700 bg-violet-50 px-3 py-1.5 rounded-full border border-violet-200">
                  <Truck className="w-3.5 h-3.5" />
                  Standard Delivery
                  <span className="font-bold">
                    {shippingLoading ? '…' : shippingCost !== null ? ` · ৳${effectiveShipping}` : needsArea ? ' · Select area' : ''}
                  </span>
                </div>
              </div>

              {/* Product list */}
              <div className="space-y-3">
                {allItems.map((item, idx) => {
                  const isSelected = selectedItemIds.has(item._id);
                  return (
                    <div key={item._id || idx} className={`flex gap-3 p-3 rounded-xl border transition-colors ${
                      isSelected ? 'border-violet-200 bg-violet-50/40' : 'border-gray-100 bg-gray-50/50 opacity-60'
                    }`}>
                      {/* Checkbox */}
                      <div className="flex items-start pt-1 flex-shrink-0">
                        <label className="cursor-pointer">
                          <input type="checkbox" className="sr-only"
                            checked={isSelected} onChange={() => toggleItem(item._id)} />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                          }`}>
                            {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                          </div>
                        </label>
                      </div>
                      {/* Image */}
                      <div className="w-16 h-16 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <img src={getImageUrl(item.image)} alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-sm font-bold text-violet-700 mt-1">{formatPrice(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                      </div>
                      {/* Qty controls + remove */}
                      <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
                        <button onClick={() => handleRemoveItem(item)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => handleQtyChange(item, -1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold text-gray-800">{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item, +1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery estimate */}
              {selectedAreaObj && (
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <Truck className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  Estimated delivery: <span className="font-medium text-gray-700">{fmtDate(deliveryByDate)} – {fmtDate(deliveryRangeEnd)}</span>
                  {freeThreshold > 0 && effectiveShipping > 0 && (
                    <span className="ml-auto text-green-600 font-medium">Add ৳{(freeThreshold - subtotal).toFixed(0)} more for FREE delivery</span>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="text-base font-bold text-gray-900">Payment Method</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(pm => (
                  <button key={pm.key} type="button" onClick={() => setPaymentMethod(pm.key)}
                    className={`border-2 rounded-xl p-4 text-left flex items-center gap-3 transition-all ${
                      paymentMethod === pm.key
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300 bg-white'
                    }`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      paymentMethod === pm.key ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {pm.icon}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMethod === pm.key ? 'text-violet-700' : 'text-gray-800'}`}>{pm.label}</p>
                      <p className="text-xs text-gray-400">{pm.sub}</p>
                    </div>
                    {paymentMethod === pm.key && (
                      <div className="ml-auto">
                        <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN (Sidebar) ───────────────────────────── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-3">

            {/* Delivery To summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">Delivery To</p>
                <button onClick={handleEditAddress} className="text-violet-600 text-xs font-semibold flex items-center gap-1 hover:underline">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-semibold text-gray-800">{fullName || customer?.name || '—'}</p>
                <p>{phone || customer?.phone || '—'}</p>
                {(areaName || district || division) && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-violet-500 flex-shrink-0" />
                    {[areaName, district, division].filter(Boolean).join(', ')}
                  </p>
                )}
                {buildingAddr && <p className="text-gray-700">{buildingAddr}</p>}
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Promo Code</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                  <div>
                    <span className="font-semibold text-green-700 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />{appliedCoupon.code}
                    </span>
                    <span className="text-green-600 text-xs block">−{formatPrice(couponDiscount)} saved</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 text-xs font-semibold">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-800 placeholder-gray-400 min-w-0"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                  <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                    className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                    {couponLoading ? '…' : 'APPLY'}
                  </button>
                </div>
              )}
            </div>

            {/* Bundle offers */}
            {bundleOffers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-violet-100 p-4 space-y-2">
                {bundleOffers.map((offer, i) => (
                  <div key={offer.id ?? i} className="flex items-start gap-2 bg-violet-50 rounded-lg px-2 py-1.5 text-xs">
                    <span>🎁</span>
                    <div>
                      <p className="font-semibold text-violet-800">Bundle: {offer.name}</p>
                      {offer.discount_amount > 0 && <p className="text-violet-600">Save {formatPrice(offer.discount_amount)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <p className="text-sm font-bold text-gray-900 mb-3">Order Summary</p>

              <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto pr-1">
                {selectedItems.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-2 items-center">
                    <div className="w-8 h-8 flex-shrink-0 border border-gray-100 rounded-lg overflow-hidden bg-gray-50">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <p className="text-xs text-gray-700 flex-1 line-clamp-2">{item.name} ×{item.quantity}</p>
                    <p className="text-xs font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                {selectedItems.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No items selected</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''})</span>
                  <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className={`font-medium ${effectiveShipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {shippingLoading ? '…' : shippingCost === null
                      ? <span className="text-amber-600 text-xs">Select area</span>
                      : effectiveShipping === 0 ? 'FREE' : formatPrice(effectiveShipping)
                    }
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>−{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {bundleSavings > 0 && (
                  <div className="flex justify-between text-violet-600">
                    <span>Bundle Savings</span>
                    <span>−{formatPrice(bundleSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-base text-violet-700">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-right">VAT included, where applicable</p>
              </div>

              {needsArea && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Select your area/upazila above to confirm delivery fee
                </div>
              )}

              {!selectedItems.length && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Select at least one item to place your order
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || !selectedItems.length || (availableAreas.length > 0 && !selectedAreaObj)}
                className="w-full mt-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                  : `Place Order · ${formatPrice(total)}`
                }
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                By placing this order you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
