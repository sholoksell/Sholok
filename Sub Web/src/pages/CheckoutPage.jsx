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
  Calendar, Shield, HelpCircle, Lock, ArrowRight,
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

// ── Shared styles ──────────────────────────────────────────────────────────
const C = {
  primary:   '#6d28d9',
  primaryHov:'#5b21b6',
  primaryBg: '#f5f3ff',
  primaryBrd:'#ddd6fe',
  border:    '#e5e7eb',
  inputBrd:  '#d1d5db',
  label:     '#374151',
  muted:     '#6b7280',
  orange:    '#f97316',
  dark:      '#111827',
};

const cardCls = 'bg-white rounded-xl border p-5';
const cardBrd = { border: `1px solid ${C.border}` };

const inputCls = `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6d28d9] focus:border-transparent transition-colors bg-white`;

const SelectField = ({ label, value, onChange, options, placeholder, error, disabled, hint }) => (
  <div>
    <label style={{ color: C.label }} className="block text-sm font-medium mb-1.5">{label}</label>
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`${inputCls} appearance-none pr-8 ${error ? 'border-red-400' : ''} ${!value ? 'text-gray-400' : ''} ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''}`}
        style={{ borderColor: error ? '#f87171' : C.inputBrd }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: C.muted }} />
    </div>
    {hint && <p className="text-xs mt-1" style={{ color: C.muted }}>{hint}</p>}
    {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
  </div>
);

const TextField = ({ label, placeholder, error, hint, ...props }) => (
  <div>
    <label style={{ color: C.label }} className="block text-sm font-medium mb-1.5">{label}</label>
    <input {...props} placeholder={placeholder}
      className={`${inputCls} ${error ? 'border-red-400' : ''}`}
      style={{ borderColor: error ? '#f87171' : C.inputBrd }} />
    {hint && <p className="text-xs mt-1" style={{ color: C.muted }}>{hint}</p>}
    {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
  </div>
);

// Checkbox component matching reference style
const PurpleCheckbox = ({ checked, onChange, indeterminate }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <div className="relative w-4 h-4 flex-shrink-0">
      <input type="checkbox" ref={ref} checked={checked} onChange={onChange} className="sr-only" />
      <div onClick={onChange}
        className="w-4 h-4 rounded cursor-pointer flex items-center justify-center border transition-colors"
        style={{ background: (checked || indeterminate) ? C.primary : 'white', borderColor: (checked || indeterminate) ? C.primary : C.inputBrd }}>
        {checked && !indeterminate && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        )}
        {indeterminate && <div className="w-2 h-0.5 bg-white rounded" />}
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated, customer } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const placeOrderLock = useRef(false);

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
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  const allItems = cart?.items || [];
  const [selectedItemIds, setSelectedItemIds] = useState(() => new Set(allItems.map(i => i._id)));

  useEffect(() => {
    setSelectedItemIds(prev => {
      const s = new Set(prev);
      allItems.forEach(i => { if (!s.has(i._id)) s.add(i._id); });
      return s;
    });
  }, [cart]);

  const toggleItem = (id) => setSelectedItemIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => setSelectedItemIds(selectedItemIds.size === allItems.length ? new Set() : new Set(allItems.map(i => i._id)));

  const handleQtyChange = (item, delta) => {
    const nq = (item.quantity || 1) + delta;
    if (nq < 1) { removeFromCart(item._id); setSelectedItemIds(prev => { const s = new Set(prev); s.delete(item._id); return s; }); }
    else updateCartItem(item._id, nq);
  };
  const handleRemoveItem = (item) => { removeFromCart(item._id); setSelectedItemIds(prev => { const s = new Set(prev); s.delete(item._id); return s; }); };

  const [areasByDistrict, setAreasByDistrict] = useState({});
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedAreaObj, setSelectedAreaObj] = useState(null);
  const [shippingCost, setShippingCost] = useState(null);
  const [rateGroupName, setRateGroupName] = useState(null);

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
        for (const d of Object.keys(byDistrict)) byDistrict[d].sort((a, b) => a.name.localeCompare(b.name));
        setAreasByDistrict(byDistrict);
      })
      .catch(() => {}).finally(() => setAreasLoading(false));
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
    const ctrl = new AbortController();
    fetch(`${API_BASE}/delivery-rates/charge?district=${encodeURIComponent(district)}&area=${encodeURIComponent(areaName || '')}`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) { setShippingCost(null); setRateGroupName(null); return; }
        if (d.matched) {
          // Backend resolved a charge (rate group or delivery_areas table) — use it directly, no threshold logic
          setShippingCost(Number(d.charge));
          setRateGroupName(d.groupName || null);
        } else {
          // No delivery configuration found for this area
          setShippingCost(null);
          setRateGroupName(null);
        }
      })
      .catch(err => { if (err.name !== 'AbortError') { setShippingCost(null); setRateGroupName(null); } })
      .finally(() => setShippingLoading(false));
    return () => ctrl.abort();
  }, [district, areaName]);

  useEffect(() => {
    if (!hasGrocery) return;
    fetch(`${API_BASE}/grocery-settings/slots`).then(r => r.json()).then(d => setGrocerySlots((d || []).filter(s => s.isActive))).catch(() => {});
  }, [hasGrocery]);

  useEffect(() => {
    if (!selectedItems.length) { setBundleOffers([]); return; }
    fetch(`${API_BASE}/bundle-offers/check-cart`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: selectedItems.map(i => ({ productId: i.productId || i._id, quantity: i.quantity })) }) })
      .then(r => r.ok ? r.json() : { applicable: [] }).then(d => setBundleOffers(d.applicable || [])).catch(() => {});
  }, [cart, selectedItemIds]);

  // effectiveShipping: use 0 only when shippingCost === 0 (backend confirmed free), otherwise use the resolved cost
  const effectiveShipping = selectedItems.length > 0 && shippingCost !== null ? shippingCost : 0;
  const bundleSavings = bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0);
  const total = Math.max(0, subtotal + effectiveShipping - couponDiscount - bundleSavings);

  const handleDivisionChange = (v) => { setDivision(v); setDistrict(''); setAreaName(''); setSelectedAreaObj(null); setShippingCost(null); };
  const handleDistrictChange = (v) => { setDistrict(v); setAreaName(''); setSelectedAreaObj(null); setShippingCost(null); if (v && !division) setDivision(getDivision(v)); };

  const availableDistricts = division ? (BD_GEO[division] || []).filter(d => (areasByDistrict[d] || []).length > 0) : [];
  const availableAreas = district ? (areasByDistrict[district] || []) : [];
  const noAreaAvailable = district && availableAreas.length === 0 && !areasLoading;
  const needsArea = district && availableAreas.length > 0 && !areaName;
  // shippingUnresolved: district selected but no charge returned (not covered by any delivery config)
  const shippingUnresolved = district && !shippingLoading && shippingCost === null;

  const deliveryDays = selectedAreaObj?.estimatedDeliveryDays || selectedAreaObj?.estimated_delivery_days || 3;
  const deliveryByDate = new Date(Date.now() + deliveryDays * 86400000);
  const deliveryRangeEnd = new Date(Date.now() + (deliveryDays + 2) * 86400000);
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`${API_BASE}/marketing/coupons/validate/${couponCode.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid coupon');
      const coupon = data.coupon;
      if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) throw new Error(`Minimum purchase ৳${coupon.minPurchaseAmount} required`);
      let discount = coupon.discountType === 'percentage' ? Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscountAmount || Infinity) : coupon.discountValue;
      discount = Math.min(discount, subtotal);
      setCouponDiscount(discount); setAppliedCoupon(coupon);
      toast.success(`Coupon applied! You save ৳${discount.toFixed(0)}`);
    } catch (err) { setCouponDiscount(0); setAppliedCoupon(null); toast.error(err.message); }
    finally { setCouponLoading(false); }
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

  const handlePlaceOrder = async () => {
    if (placeOrderLock.current) return;
    if (!validate()) { toast.error('Please fill in all required fields'); return; }
    if (!selectedItems.length) { toast.error('Please select at least one item'); return; }
    if (shippingLoading) { toast.error('Please wait — calculating delivery charge…'); return; }
    if (shippingUnresolved) { toast.error('No delivery rate configured for this area. Please select a different area or contact support.'); return; }
    placeOrderLock.current = true;
    try {
      setLoading(true);
      const fullAddress = [buildingAddr, colonyAddr, streetAddr].filter(Boolean).join(', ');
      const orderData = {
        items: selectedItems.map(item => ({ productId: item._id || item.productId, productName: item.name, name: item.name, quantity: item.quantity, price: item.price, image: item.image || '', total: item.price * item.quantity })),
        shippingAddress: { name: fullName, phone, street: fullAddress, city: district, state: areaName || district, country: 'Bangladesh', division, areaId: selectedAreaObj?._id || null, areaName: areaName || null, label: addressLabel },
        paymentMethod: paymentMethod === 'cod' ? 'cod' : 'online',
        subtotal, shippingCost: effectiveShipping, deliveryCharge: effectiveShipping,
        discount: couponDiscount + bundleSavings, total, couponCode: appliedCoupon?.code,
      };
      if (hasGrocery) {
        const tod = new Date(); const tom = new Date(tod); tom.setDate(tod.getDate() + 1);
        orderData.grocery_delivery_date = selectedDeliveryDate === 'today' ? tod.toISOString().slice(0, 10) : tom.toISOString().slice(0, 10);
        orderData.grocery_delivery_slot_id = selectedSlotId ? Number(selectedSlotId) : null;
      }
      await orderService.create(orderData);
      toast.success(t('orderPlacedSuccess') || 'Order placed successfully!');
      clearCart();
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.message || t('failedToPlaceOrder') || 'Failed to place order');
    } finally { setLoading(false); placeOrderLock.current = false; }
  };

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!isAuthenticated || !customer) {
    return (
      <div style={{ background: C.primaryBg }} className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: C.primaryBrd }}>
            <ShoppingBag className="w-8 h-8" style={{ color: C.primary }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.dark }}>{t('pleaseLoginToCheckout') || 'Login to Checkout'}</h2>
          <p className="mb-6" style={{ color: C.muted }}>{t('needSignedIn') || 'You need to be signed in to place an order'}</p>
          <div className="flex justify-center gap-3">
            <Link to="/login?redirect=/checkout">
              <button className="text-white font-semibold px-6 py-2.5 rounded-lg transition-colors" style={{ background: C.primary }}>{t('login') || 'Login'}</button>
            </Link>
            <Link to="/register">
              <button className="font-semibold px-6 py-2.5 rounded-lg border transition-colors" style={{ borderColor: C.border, color: C.dark }}>{t('register') || 'Register'}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!allItems.length) {
    return (
      <div style={{ background: C.primaryBg }} className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16" style={{ color: C.primaryBrd }} />
        <h2 className="text-2xl font-bold" style={{ color: C.dark }}>{t('yourCartIsEmpty') || 'Your cart is empty'}</h2>
        <Link to="/">
          <button className="text-white font-semibold px-6 py-2.5 rounded-lg transition-colors" style={{ background: C.primary }}>{t('continueShopping') || 'Continue Shopping'}</button>
        </Link>
      </div>
    );
  }

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const allSelected = selectedItemIds.size === allItems.length && allItems.length > 0;
  const someSelected = selectedItemIds.size > 0 && selectedItemIds.size < allItems.length;

  const paymentMethods = [
    { key: 'cod',   label: 'Cash on Delivery', sub: 'Pay when you receive',   icon: <ShoppingBag className="w-5 h-5" /> },
    { key: 'bkash', label: 'bKash',             sub: 'Mobile banking',         icon: <Smartphone className="w-5 h-5" /> },
    { key: 'nagad', label: 'Nagad',              sub: 'Mobile banking',         icon: <Smartphone className="w-5 h-5" /> },
    { key: 'card',  label: 'Card / Online',      sub: 'Debit or Credit Card',   icon: <CreditCard className="w-5 h-5" /> },
  ];

  const fmtTaka = (n) => `৳${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div style={{ background: C.primaryBg }} className="min-h-screen">
      <div className="max-w-[960px] mx-auto px-4 py-6">

        {/* Page heading */}
        <h1 className="text-2xl font-bold mb-1" style={{ color: C.dark }}>Checkout</h1>
        <p className="text-sm mb-5" style={{ color: C.muted }}>Review your order and enter your delivery details.</p>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* 1. Delivery Address */}
            <div className={cardCls} style={cardBrd}>
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: C.primary }} />
                  <span className="text-base font-bold" style={{ color: C.dark }}>Delivery Address</span>
                </div>
                <span className="text-xs" style={{ color: C.primary }}>* Required fields</span>
              </div>
              <p className="text-xs mb-4" style={{ color: C.primary }}>Where should we deliver your order?</p>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Full name *" placeholder="Enter your full name" value={fullName}
                  onChange={e => setFullName(e.target.value)} error={formErrors.fullName} />
                <div>
                  <TextField label="Phone number *" placeholder="01XXXXXXXXX" value={phone}
                    onChange={e => setPhone(e.target.value)} error={formErrors.phone} type="tel" />
                  <p className="text-xs mt-1" style={{ color: C.muted }}>We will contact you about your delivery.</p>
                </div>

                <SelectField label="Division *" value={division} onChange={handleDivisionChange}
                  options={Object.keys(BD_GEO)} placeholder="Select division" error={formErrors.division} />
                <SelectField label="City / District *" value={district} onChange={handleDistrictChange}
                  options={availableDistricts} placeholder={division ? 'Select district' : 'Select division first'}
                  error={formErrors.district} disabled={!division || areasLoading} />

                {!noAreaAvailable && (
                  <SelectField label="Area / Upazila *" value={areaName} onChange={v => setAreaName(v)}
                    options={availableAreas.map(a => a.name)}
                    placeholder={district ? 'Select area' : 'Select district first'}
                    error={formErrors.areaName} disabled={!district || areasLoading} />
                )}

                <TextField label="House / Road / Block *" placeholder="House, road, block or apartment"
                  value={buildingAddr} onChange={e => setBuildingAddr(e.target.value)} error={formErrors.buildingAddr} />

                <div className="sm:col-span-2">
                  <TextField label="Landmark (Optional)" placeholder="e.g. Near City Hospital"
                    value={colonyAddr} onChange={e => setColonyAddr(e.target.value)} />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.label }}>Delivery instructions (Optional)</label>
                  <textarea rows={3} placeholder="Any special instructions for the delivery rider?"
                    value={streetAddr} onChange={e => setStreetAddr(e.target.value)}
                    className={`${inputCls} resize-none`} style={{ borderColor: C.inputBrd }} />
                </div>
              </div>

              {/* Address label + save checkbox */}
              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: C.label }}>Address label</p>
                  <div className="flex gap-2">
                    {[{ key: 'home', icon: <Home className="w-3.5 h-3.5" />, label: 'Home' },
                      { key: 'office', icon: <Briefcase className="w-3.5 h-3.5" />, label: 'Office' }].map(opt => (
                      <button key={opt.key} type="button" onClick={() => setAddressLabel(opt.key)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors"
                        style={{ borderColor: addressLabel === opt.key ? C.primary : C.inputBrd, color: addressLabel === opt.key ? C.primary : C.muted, background: addressLabel === opt.key ? C.primaryBg : 'white' }}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 rounded accent-purple-700" />
                  <span className="text-sm" style={{ color: C.muted }}>Save this address for next time</span>
                </label>
              </div>

              {noAreaAvailable && (
                <div className="mt-4 flex items-center gap-2 text-xs rounded-lg px-3 py-2" style={{ background: '#fffbeb', border: `1px solid #fde68a`, color: '#92400e' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No delivery areas configured for {district} yet. Standard rates apply.
                </div>
              )}
            </div>

            {/* Grocery schedule */}
            {hasGrocery && (
              <div className={cardCls} style={cardBrd}>
                <div className="flex items-center gap-2 mb-4">
                  <Salad className="w-4 h-4 text-green-600" />
                  <span className="text-base font-bold" style={{ color: C.dark }}>{t('groceryDeliverySchedule') || 'Grocery Delivery Schedule'}</span>
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: C.label }}>Delivery Date</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {['today', 'tomorrow'].map(day => (
                    <button key={day} type="button" onClick={() => setSelectedDeliveryDate(day)}
                      className="border rounded-lg p-3 text-sm font-medium transition-colors"
                      style={{ borderColor: selectedDeliveryDate === day ? C.primary : C.border, color: selectedDeliveryDate === day ? C.primary : C.muted, background: selectedDeliveryDate === day ? C.primaryBg : 'white' }}>
                      {day === 'today' ? `Today (${fmtDate(today)})` : `Tomorrow (${fmtDate(tomorrow)})`}
                    </button>
                  ))}
                </div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: C.label }}>
                  <Clock className="w-3.5 h-3.5" /> Select Time Slot
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {grocerySlots.length > 0 ? grocerySlots.map(slot => (
                    <button key={slot._id} type="button" onClick={() => setSelectedSlotId(String(slot._id))}
                      className="border rounded-lg p-2.5 text-xs font-medium text-left transition-colors"
                      style={{ borderColor: selectedSlotId === String(slot._id) ? C.primary : C.border, color: selectedSlotId === String(slot._id) ? C.primary : C.muted, background: selectedSlotId === String(slot._id) ? C.primaryBg : 'white' }}>
                      {slot.label}
                    </button>
                  )) : <p className="text-sm col-span-2" style={{ color: C.muted }}>Loading slots…</p>}
                </div>
              </div>
            )}

            {/* 2. Order Items */}
            <div className={cardCls} style={cardBrd}>
              {/* Header */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: C.primaryBg }}>
                  <Package className="w-3.5 h-3.5" style={{ color: C.primary }} />
                </div>
                <span className="text-base font-bold" style={{ color: C.dark }}>Order Items</span>
                <span className="text-sm font-medium" style={{ color: C.primary }}>{allItems.length} items</span>
              </div>
              <p className="text-xs mb-3" style={{ color: C.muted }}>Check the products and quantities in your order.</p>

              <div style={{ borderTop: `1px solid ${C.border}` }} className="pt-3 mb-3">
                {/* Select All row */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <PurpleCheckbox checked={allSelected} onChange={toggleAll} indeterminate={someSelected} />
                    <span className="text-sm font-medium" style={{ color: C.label }}>Select all items</span>
                  </label>
                  <span className="text-xs font-medium" style={{ color: C.primary }}>
                    {selectedItemIds.size} of {allItems.length} products selected
                  </span>
                </div>
              </div>

              {/* Product list */}
              <div style={{ borderTop: `1px solid ${C.border}` }}>
                {allItems.map((item, idx) => {
                  const isSel = selectedItemIds.has(item._id);
                  return (
                    <div key={item._id || idx}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      className={`py-3 flex items-start gap-3 transition-opacity ${!isSel ? 'opacity-50' : ''}`}>
                      {/* Checkbox */}
                      <div className="pt-0.5 flex-shrink-0">
                        <PurpleCheckbox checked={isSel} onChange={() => toggleItem(item._id)} />
                      </div>
                      {/* Image */}
                      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border" style={{ borderColor: C.border }}>
                        <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      {/* Name + attrs */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: C.dark }}>{item.name}</p>
                        {(item.color || item.size || item.variant) && (
                          <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                            {item.color && <span>Color: {item.color}</span>}
                            {item.color && item.size && <span> · </span>}
                            {item.size && <span>Size: {item.size}</span>}
                            {item.variant && !item.color && !item.size && <span>{item.variant}</span>}
                          </p>
                        )}
                      </div>
                      {/* Price + controls */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-sm font-semibold" style={{ color: C.primary }}>
                          {fmtTaka(item.price)} /item
                        </span>
                        {/* Qty controls */}
                        <div className="flex items-center rounded border overflow-hidden" style={{ borderColor: C.border }}>
                          <button onClick={() => handleQtyChange(item, -1)}
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50 text-gray-500">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-sm font-medium" style={{ color: C.dark }}>{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item, +1)}
                            className="w-7 h-7 flex items-center justify-center transition-colors hover:bg-gray-50 text-gray-500">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => handleRemoveItem(item)}
                          className="text-xs font-medium hover:underline transition-colors" style={{ color: C.orange }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <p className="text-xs mt-3" style={{ color: C.muted }}>
                <span className="font-semibold" style={{ color: C.dark }}>{selectedItemIds.size} selected product{selectedItemIds.size !== 1 ? 's' : ''}</span> in this order
              </p>
            </div>

            {/* 3. Shipping Method */}
            <div className={cardCls} style={cardBrd}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: C.primaryBg }}>
                  <Truck className="w-3.5 h-3.5" style={{ color: C.primary }} />
                </div>
                <span className="text-base font-bold" style={{ color: C.dark }}>Shipping Method</span>
              </div>

              <div className="flex items-start justify-between p-3 rounded-lg border" style={{ borderColor: C.primaryBrd, background: C.primaryBg }}>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0" style={{ borderColor: C.primary }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: C.primary }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.dark }}>Standard Delivery</p>
                    {selectedAreaObj ? (
                      <>
                        <p className="text-xs mt-0.5" style={{ color: C.primary }}>
                          Estimated delivery: {fmtDate(deliveryByDate)} – {fmtDate(deliveryRangeEnd)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs mt-0.5" style={{ color: C.primary }}>Select your division to see the delivery estimate.</p>
                        <p className="text-xs" style={{ color: C.primary }}>Select your division to confirm delivery charge</p>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold flex-shrink-0 ml-3" style={{ color: C.dark }}>
                  {shippingLoading ? '…' : shippingCost !== null
                    ? (effectiveShipping === 0 ? 'FREE' : fmtTaka(effectiveShipping))
                    : '—'}
                </span>
              </div>
              {rateGroupName && (
                <p className="text-xs mt-2" style={{ color: C.muted }}>Rate group: <span style={{ color: C.primary }}>{rateGroupName}</span></p>
              )}
            </div>

            {/* 4. Payment Method */}
            <div className={cardCls} style={cardBrd}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: C.primaryBg }}>
                  <CreditCard className="w-3.5 h-3.5" style={{ color: C.primary }} />
                </div>
                <span className="text-base font-bold" style={{ color: C.dark }}>Payment Method</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(pm => (
                  <button key={pm.key} type="button" onClick={() => setPaymentMethod(pm.key)}
                    className="flex items-center gap-3 p-3 rounded-lg border text-left transition-colors"
                    style={{ borderColor: paymentMethod === pm.key ? C.primary : C.border, background: paymentMethod === pm.key ? C.primaryBg : 'white' }}>
                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                      style={{ borderColor: paymentMethod === pm.key ? C.primary : C.inputBrd }}>
                      {paymentMethod === pm.key && <div className="w-2 h-2 rounded-full" style={{ background: C.primary }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: paymentMethod === pm.key ? C.primary : C.dark }}>{pm.label}</p>
                      <p className="text-xs truncate" style={{ color: C.muted }}>{pm.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="w-full lg:w-[220px] flex-shrink-0 space-y-3">

            {/* 1. Promo Code */}
            <div className={cardCls} style={cardBrd}>
              <p className="text-sm font-bold mb-3" style={{ color: C.dark }}>Promo code</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm border"
                  style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div>
                    <span className="font-semibold flex items-center gap-1" style={{ color: '#15803d' }}>
                      <Tag className="w-3.5 h-3.5" />{appliedCoupon.code}
                    </span>
                    <span className="text-xs block" style={{ color: '#16a34a' }}>−{formatPrice(couponDiscount)} saved</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs font-semibold" style={{ color: C.orange }}>Remove</button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 min-w-0 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6d28d9] focus:border-transparent"
                      style={{ borderColor: C.inputBrd }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()} />
                    <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                      className="text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-40 whitespace-nowrap"
                      style={{ background: C.primary }}>
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: C.muted }}>Have a discount code? Apply it here.</p>
                </>
              )}
            </div>

            {/* Bundle offers (if any) */}
            {bundleOffers.length > 0 && (
              <div className={cardCls} style={{ ...cardBrd, borderColor: C.primaryBrd }}>
                {bundleOffers.map((offer, i) => (
                  <div key={offer.id ?? i} className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs mb-1" style={{ background: C.primaryBg }}>
                    <span>🎁</span>
                    <div>
                      <p className="font-semibold" style={{ color: C.primary }}>Bundle: {offer.name}</p>
                      {offer.discount_amount > 0 && <p style={{ color: C.primary }}>Save {formatPrice(offer.discount_amount)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Order Summary */}
            <div className={cardCls} style={cardBrd}>
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold" style={{ color: C.dark }}>Order Summary</span>
                <Calendar className="w-4 h-4" style={{ color: C.primary }} />
              </div>
              <p className="text-xs mb-4" style={{ color: C.muted }}>{selectedItems.length} items from your cart</p>

              {/* Rows */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>Items Total ({selectedItems.length} items)</span>
                  <span className="font-medium" style={{ color: C.dark }}>{fmtTaka(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>Delivery Charge</span>
                  <span className="font-medium" style={{ color: C.dark }}>
                    {shippingLoading ? '…' : shippingCost === null
                      ? <span className="text-xs" style={{ color: '#d97706' }}>Select area</span>
                      : effectiveShipping === 0 ? <span style={{ color: '#16a34a' }}>FREE</span> : fmtTaka(effectiveShipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: C.muted }}>Discount</span>
                  <span style={{ color: couponDiscount + bundleSavings > 0 ? '#16a34a' : C.dark }}>
                    {couponDiscount + bundleSavings > 0 ? `−${fmtTaka(couponDiscount + bundleSavings)}` : `− ${fmtTaka(0)}`}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
                <span className="text-sm font-bold" style={{ color: C.dark }}>Total</span>
                <span className="text-lg font-bold" style={{ color: C.primary }}>{fmtTaka(total)}</span>
              </div>

              {/* CTA warnings */}
              {needsArea && (
                <div className="mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                  style={{ background: '#fffbeb', border: `1px solid #fde68a`, color: '#92400e' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Select your area to confirm delivery fee
                </div>
              )}
              {shippingUnresolved && !needsArea && (
                <div className="mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                  style={{ background: '#fef2f2', border: `1px solid #fecaca`, color: '#b91c1c' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  No delivery rate configured for this area. Please contact support.
                </div>
              )}
              {!selectedItems.length && (
                <div className="mt-3 flex items-center gap-2 text-xs rounded-lg px-3 py-2"
                  style={{ background: '#fffbeb', border: `1px solid #fde68a`, color: '#92400e' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Select at least one item
                </div>
              )}

              <button type="button" onClick={handlePlaceOrder}
                disabled={loading || !selectedItems.length || shippingLoading || shippingUnresolved || needsArea}
                className="w-full mt-3 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm"
                style={{ background: loading || !selectedItems.length ? C.muted : C.primary }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing…</>
                  : <><span>Confirm Order {fmtTaka(total)}</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>

              {/* Secure + terms */}
              <div className="mt-3 text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5" style={{ color: C.muted }} />
                  <span className="text-xs" style={{ color: C.muted }}>Secure checkout</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: C.muted }}>
                  By placing your order, you agree to our{' '}
                  <span className="underline cursor-pointer" style={{ color: C.primary }}>Terms of Service</span>
                  {' '}and{' '}
                  <span className="underline cursor-pointer" style={{ color: C.primary }}>Privacy Policy</span>
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${C.border}` }} className="mt-3 pt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.primary }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.dark }}>Need help with your order?</p>
                    <p className="text-xs" style={{ color: C.muted }}>Our customer support team is here to help.</p>
                    <p className="text-xs font-medium" style={{ color: C.primary }}>Contact customer support</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: C.primary }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: C.dark }}>Your information is protected</p>
                    <p className="text-xs" style={{ color: C.muted }}>Your details stay in this browser.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
