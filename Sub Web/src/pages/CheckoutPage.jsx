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
  Package,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = '/api';

// Same BD_GEO as DeliveryLocationModal — district names match DB `city` field
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
  <div className="space-y-1">
    <label className="text-xs font-semibold text-[#0f1111] block">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E31E24] pr-8 transition-colors ${
          error ? 'border-red-500' : 'border-[#adb1b8]'
        } ${!value ? 'text-gray-400' : 'text-[#0f1111]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextField = ({ label, placeholder, error, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-[#0f1111] block">{label}</label>
    <input
      {...props}
      placeholder={placeholder}
      className={`w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] transition-colors ${
        error ? 'border-red-500' : 'border-[#adb1b8]'
      } text-[#0f1111] placeholder-gray-400`}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const CheckoutPage = () => {
  const { cart, clearCart } = useCartStore();
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
  const [addrSaved, setAddrSaved] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);

  // All DB areas (763 total), keyed by district
  const [areasByDistrict, setAreasByDistrict] = useState({});
  const [areasLoading, setAreasLoading] = useState(true);
  const [selectedAreaObj, setSelectedAreaObj] = useState(null); // full area object from DB
  const [shippingCost, setShippingCost] = useState(null); // null = not yet determined
  const [rateGroupName, setRateGroupName] = useState(null); // non-null when Rate Group is used

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

  const hasGrocery = (cart?.items || []).some(item => item.product_type === 'perishable');
  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Load all areas from DB on mount ─────────────────────────────────────
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
        // Sort each district's areas alphabetically
        for (const d of Object.keys(byDistrict)) {
          byDistrict[d].sort((a, b) => a.name.localeCompare(b.name));
        }
        setAreasByDistrict(byDistrict);
      })
      .catch(() => {})
      .finally(() => setAreasLoading(false));
  }, []);

  // ── Pre-populate from localStorage delivery_location (product page) ───
  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      const saved = localStorage.getItem('delivery_location');
      if (saved) {
        const loc = JSON.parse(saved);
        if (loc.division) setDivision(loc.division);
        if (loc.city || loc.district) setDistrict(loc.city || loc.district);
        if (loc.area_name) setAreaName(loc.area_name);
        if (loc.area_id) {
          // area obj will be resolved once areasByDistrict loads
        }
      }
    } catch {}
    // Pre-fill name/phone from customer
    setFullName(customer?.name || '');
    setPhone(customer?.phone || '');
  }, [isAuthenticated, customer]);

  // ── Resolve area object from DB areas ────────────────────────────────
  useEffect(() => {
    if (!district || !Object.keys(areasByDistrict).length) {
      if (!district) { setSelectedAreaObj(null); setShippingCost(null); setRateGroupName(null); }
      return;
    }
    if (!areaName) { setSelectedAreaObj(null); return; }
    const found = (areasByDistrict[district] || []).find(a => a.name === areaName);
    setSelectedAreaObj(found || null);
  }, [district, areaName, areasByDistrict]);

  // ── Shipping fee: Rate Groups first, delivery_areas.charge as fallback ──
  // Runs whenever district, area, or subtotal changes
  useEffect(() => {
    if (!district) { setShippingCost(null); setRateGroupName(null); return; }
    setShippingLoading(true);
    fetch(`${API_BASE}/delivery-rates/charge?district=${encodeURIComponent(district)}&area=${encodeURIComponent(areaName || '')}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.matched) {
          // Rate Group configured in admin → use it
          setShippingCost(d.charge);
          setRateGroupName(d.groupName || 'Rate Group');
        } else if (selectedAreaObj) {
          // No Rate Group → fall back to delivery_areas.delivery_charge
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
        // Network error: try flat rate from area obj
        if (selectedAreaObj) {
          const charge = Number(selectedAreaObj.deliveryCharge || selectedAreaObj.delivery_charge || 0);
          setShippingCost(charge);
        } else setShippingCost(null);
        setRateGroupName(null);
      })
      .finally(() => setShippingLoading(false));
  }, [district, areaName, selectedAreaObj, subtotal]);

  // ── Grocery slots ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasGrocery) return;
    fetch(`${API_BASE}/grocery-settings/slots`)
      .then(r => r.json())
      .then(d => setGrocerySlots((d || []).filter(s => s.isActive)))
      .catch(() => {});
  }, [hasGrocery]);

  // ── Bundle offers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!items.length) { setBundleOffers([]); return; }
    fetch(`${API_BASE}/bundle-offers/check-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(i => ({ productId: i.productId || i._id || i.id, quantity: i.quantity })) }),
    }).then(r => r.ok ? r.json() : { applicable: [] })
      .then(d => setBundleOffers(d.applicable || []))
      .catch(() => {});
  }, [cart]);

  // ── Derived totals ────────────────────────────────────────────────────
  const effectiveShipping = items.length > 0 && shippingCost !== null ? shippingCost : 0;
  const bundleSavings = bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0);
  const total = Math.max(0, subtotal + effectiveShipping - couponDiscount - bundleSavings);

  // ── Location handlers ─────────────────────────────────────────────────
  const handleDivisionChange = (v) => {
    setDivision(v);
    setDistrict('');
    setAreaName('');
    setSelectedAreaObj(null);
    setShippingCost(null);
  };

  const handleDistrictChange = (v) => {
    setDistrict(v);
    setAreaName('');
    setSelectedAreaObj(null);
    setShippingCost(null);
    if (v && !division) setDivision(getDivision(v));
  };

  const handleAreaChange = (v) => {
    setAreaName(v);
  };

  // ── Districts available for selected division (only those with DB areas) ─
  const availableDistricts = division
    ? (BD_GEO[division] || []).filter(d => (areasByDistrict[d] || []).length > 0)
    : [];

  const availableAreas = district ? (areasByDistrict[district] || []) : [];

  // ── Coupon ────────────────────────────────────────────────────────────
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

  // ── Validation ────────────────────────────────────────────────────────
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

  // ── Place Order ───────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (placeOrderLock.current) return;
    if (!validate()) { toast.error('Please fill in all required fields'); return; }
    if (!items.length) { toast.error(t('cartIsEmpty') || 'Cart is empty'); return; }
    if (availableAreas.length > 0 && !selectedAreaObj) {
      toast.error('Please select your area to calculate delivery fee');
      return;
    }
    placeOrderLock.current = true;
    try {
      setLoading(true);
      const fullAddress = [buildingAddr, colonyAddr, streetAddr].filter(Boolean).join(', ');
      const orderData = {
        items: items.map(item => ({
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

  // ── Auth guard ────────────────────────────────────────────────────────
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('pleaseLoginToCheckout') || 'Login to Checkout'}</h2>
          <p className="text-muted-foreground mb-6">{t('needSignedIn') || 'You need to be signed in to place an order'}</p>
          <div className="flex justify-center gap-3">
            <Link to="/login?redirect=/checkout">
              <button className="bg-[#E31E24] hover:bg-[#c41920] text-white font-semibold px-6 py-2.5 rounded transition-colors">{t('login') || 'Login'}</button>
            </Link>
            <Link to="/register">
              <button className="border border-[#adb1b8] text-[#0f1111] font-semibold px-6 py-2.5 rounded hover:border-[#E31E24] transition-colors">{t('register') || 'Register'}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <Package className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-[#0f1111]">{t('yourCartIsEmpty') || 'Your cart is empty'}</h2>
        <Link to="/">
          <button className="bg-[#E31E24] hover:bg-[#c41920] text-white font-semibold px-6 py-2.5 rounded transition-colors">
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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#565959] mb-4">
          <Link to="/" className="hover:text-[#E31E24] hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/cart" className="hover:text-[#E31E24] hover:underline">Cart</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0f1111] font-medium">Checkout</span>
        </div>

        <h1 className="text-xl font-bold text-[#0f1111] mb-5">Order Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Delivery Address */}
            <div className="bg-white rounded border border-[#ddd] p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-[#e7e7e7] pb-3">
                <MapPin className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-base font-bold text-[#0f1111]">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TextField
                  label="Full Name *"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  error={formErrors.fullName}
                />
                <TextField
                  label="Phone Number *"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  error={formErrors.phone}
                  type="tel"
                />

                {/* Division */}
                <SelectField
                  label="Division *"
                  value={division}
                  onChange={handleDivisionChange}
                  options={Object.keys(BD_GEO)}
                  placeholder="Select Division"
                  error={formErrors.division}
                />

                {/* District — filtered to only districts with DB areas */}
                <SelectField
                  label="District *"
                  value={district}
                  onChange={handleDistrictChange}
                  options={availableDistricts}
                  placeholder={division ? 'Select District' : 'Select Division first'}
                  error={formErrors.district}
                  disabled={!division || areasLoading}
                />

                {/* Area / Upazila */}
                {!noAreaAvailable && (
                  <SelectField
                    label="Area / Upazila *"
                    value={areaName}
                    onChange={handleAreaChange}
                    options={availableAreas.map(a => a.name)}
                    placeholder={district ? 'Select Area' : 'Select District first'}
                    error={formErrors.areaName}
                    disabled={!district || areasLoading}
                  />
                )}

                <TextField
                  label="House / Building / Road *"
                  placeholder="e.g. House 12, Road 4, Block C"
                  value={buildingAddr}
                  onChange={e => setBuildingAddr(e.target.value)}
                  error={formErrors.buildingAddr}
                />

                <TextField
                  label="Colony / Area / Landmark"
                  placeholder="e.g. Near City Hospital"
                  value={colonyAddr}
                  onChange={e => setColonyAddr(e.target.value)}
                />

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#0f1111] block">Additional Notes (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Any special delivery instructions..."
                    value={streetAddr}
                    onChange={e => setStreetAddr(e.target.value)}
                    className="w-full border border-[#adb1b8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E31E24] text-[#0f1111] placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Delivery fee preview when area selected */}
              {(selectedAreaObj || (district && shippingCost !== null)) && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded p-3 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-800">
                      {effectiveShipping === 0
                        ? 'Free Delivery applied!'
                        : `Delivery Fee: ৳${effectiveShipping}`}
                      {rateGroupName && (
                        <span className="ml-2 text-xs font-normal text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                          {rateGroupName}
                        </span>
                      )}
                    </p>
                    <p className="text-green-700 text-xs mt-0.5">
                      {selectedAreaObj ? `${selectedAreaObj.name}, ${district}` : district}
                      {' — '}Estimated {deliveryDays}–{deliveryDays + 2} days
                      {freeThreshold > 0 && effectiveShipping > 0 && (
                        <> &nbsp;·&nbsp; Free above ৳{freeThreshold}</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {noAreaAvailable && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  No delivery areas configured for {district} yet. Standard rates apply.
                </div>
              )}

              {/* Address label */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#0f1111] mb-2">Address label:</p>
                <div className="flex gap-3">
                  {[
                    { key: 'home',   icon: <Home className="w-4 h-4" />,     label: 'HOME' },
                    { key: 'office', icon: <Briefcase className="w-4 h-4" />, label: 'OFFICE' },
                  ].map(opt => (
                    <button key={opt.key} type="button" onClick={() => setAddressLabel(opt.key)}
                      className={`flex items-center gap-2 px-5 py-2 border rounded text-sm font-medium transition-colors ${
                        addressLabel === opt.key
                          ? 'border-[#E31E24] text-[#E31E24] bg-red-50'
                          : 'border-[#adb1b8] text-[#565959] hover:border-[#E31E24]'
                      }`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={handleSaveAddress}
                className="bg-[#E31E24] hover:bg-[#c41920] text-white font-semibold text-sm px-8 py-2.5 rounded transition-colors">
                {addrSaved ? '✓ Address Saved' : 'Save Address'}
              </button>
            </div>

            {/* Grocery Schedule */}
            {hasGrocery && (
              <div className="bg-white rounded border border-[#ddd] p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-[#e7e7e7] pb-3">
                  <Salad className="h-5 w-5 text-green-600" />
                  <h2 className="text-base font-bold text-[#0f1111]">{t('groceryDeliverySchedule') || 'Grocery Delivery Schedule'}</h2>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#0f1111] mb-2">{t('deliveryDate') || 'Delivery Date'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['today', 'tomorrow'].map(day => (
                      <button key={day} type="button" onClick={() => setSelectedDeliveryDate(day)}
                        className={`border rounded p-3 text-sm font-medium transition-colors ${
                          selectedDeliveryDate === day
                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24]'
                            : 'border-[#adb1b8] text-[#565959] hover:border-[#E31E24]'
                        }`}>
                        {day === 'today' ? `${t('today') || 'Today'} (${fmtDate(today)})` : `${t('tomorrow') || 'Tomorrow'} (${fmtDate(tomorrow)})`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0f1111] mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t('selectTimeSlot') || 'Select Time Slot'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {grocerySlots.length > 0 ? grocerySlots.map(slot => (
                      <button key={slot._id} type="button" onClick={() => setSelectedSlotId(String(slot._id))}
                        className={`border rounded p-2.5 text-xs font-medium text-left transition-colors ${
                          selectedSlotId === String(slot._id)
                            ? 'border-[#E31E24] bg-red-50 text-[#E31E24]'
                            : 'border-[#adb1b8] text-[#565959] hover:border-[#E31E24]'
                        }`}>
                        {slot.label}
                      </button>
                    )) : <p className="text-sm text-gray-400 col-span-2">Loading slots…</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded border border-[#ddd] p-5">
              <div className="flex items-center gap-2 mb-4 border-b border-[#e7e7e7] pb-3">
                <Package className="w-4 h-4 text-[#E31E24]" />
                <h2 className="text-base font-bold text-[#0f1111]">Order Items ({items.length})</h2>
              </div>

              {/* Delivery method row */}
              <div className="mb-4 border border-[#E31E24] rounded p-3 flex items-start gap-3 bg-red-50">
                <CheckCircle2 className="w-5 h-5 text-[#E31E24] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#0f1111] flex items-center gap-2">
                    Standard Delivery
                    <span className="text-[#E31E24]">
                      {shippingLoading ? '…' : shippingCost !== null ? `৳${effectiveShipping}` : (needsArea ? 'Select area' : '—')}
                    </span>
                  </p>
                  <p className="text-xs text-[#565959] mt-0.5 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    {selectedAreaObj
                      ? `Estimated delivery: ${fmtDate(deliveryByDate)} – ${fmtDate(deliveryRangeEnd)}`
                      : 'Select your delivery area to see estimated date'}
                  </p>
                  {freeThreshold > 0 && effectiveShipping > 0 && (
                    <p className="text-xs text-green-700 mt-0.5">
                      Add ৳{(freeThreshold - subtotal).toFixed(0)} more for FREE delivery
                    </p>
                  )}
                </div>
              </div>

              {/* Product list */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-3">
                    <div className="w-[72px] h-[72px] flex-shrink-0 border border-[#e7e7e7] rounded overflow-hidden bg-[#f5f5f5]">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0f1111] font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-[#565959] mt-0.5">Qty: {item.quantity}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs text-[#999] line-through">{formatPrice(item.originalPrice)}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#0f1111]">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-[#565959]">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded border border-[#ddd] p-5">
              <h2 className="text-base font-bold text-[#0f1111] mb-4 border-b border-[#e7e7e7] pb-3">
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'cod',    icon: '💵', label: t('cashOnDelivery') || 'Cash on Delivery', sub: 'Pay when you receive' },
                  { key: 'online', icon: '📱', label: t('cardPayment') || 'Mobile Banking',      sub: 'bKash / Nagad / Card' },
                ].map(pm => (
                  <button key={pm.key} type="button" onClick={() => setPaymentMethod(pm.key)}
                    className={`border-2 rounded p-4 text-left flex items-center gap-3 transition-colors ${
                      paymentMethod === pm.key
                        ? 'border-[#E31E24] bg-red-50'
                        : 'border-[#adb1b8] hover:border-[#E31E24]'
                    }`}>
                    <span className="text-2xl">{pm.icon}</span>
                    <div>
                      <p className={`font-semibold text-sm ${paymentMethod === pm.key ? 'text-[#E31E24]' : 'text-[#0f1111]'}`}>{pm.label}</p>
                      <p className="text-xs text-[#565959]">{pm.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-3">

            {/* Contact Info summary */}
            <div className="bg-white rounded border border-[#ddd] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#0f1111]">Delivery To</p>
                <button onClick={() => setAddrSaved(false)} className="text-[#E31E24] text-xs font-semibold flex items-center gap-1 hover:underline">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="text-xs text-[#565959] space-y-0.5">
                <p className="font-medium text-[#0f1111]">{fullName || customer?.name || '—'}</p>
                <p>{phone || customer?.phone || '—'}</p>
                {(areaName || district || division) && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E31E24] flex-shrink-0" />
                    {[areaName, district, division].filter(Boolean).join(', ')}
                  </p>
                )}
                {buildingAddr && <p className="text-[#0f1111]">{buildingAddr}</p>}
              </div>
            </div>

            {/* Promotion / Coupon */}
            <div className="bg-white rounded border border-[#ddd] p-4">
              <p className="text-sm font-bold text-[#0f1111] mb-3">Voucher / Coupon</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
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
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-[#adb1b8] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#E31E24] text-[#0f1111] placeholder-gray-400 min-w-0"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                    className="bg-[#E31E24] hover:bg-[#c41920] disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded transition-colors whitespace-nowrap">
                    {couponLoading ? '…' : 'APPLY'}
                  </button>
                </div>
              )}
            </div>

            {/* Bundle offers */}
            {bundleOffers.length > 0 && (
              <div className="bg-white rounded border border-purple-200 p-4 space-y-2">
                {bundleOffers.map((offer, i) => (
                  <div key={offer.id ?? i} className="flex items-start gap-2 bg-purple-50 rounded px-2 py-1.5 text-xs">
                    <span>🎁</span>
                    <div>
                      <p className="font-semibold text-purple-800">Bundle: {offer.name}</p>
                      {offer.discount_amount > 0 && <p className="text-purple-600">Save {formatPrice(offer.discount_amount)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded border border-[#ddd] p-4">
              <p className="text-sm font-bold text-[#0f1111] mb-3">Order Summary</p>

              <div className="space-y-2 mb-3 max-h-[160px] overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-2 items-center">
                    <div className="w-9 h-9 flex-shrink-0 border border-[#e7e7e7] rounded overflow-hidden bg-[#f5f5f5]">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <p className="text-xs text-[#0f1111] flex-1 line-clamp-2">{item.name} ×{item.quantity}</p>
                    <p className="text-xs font-semibold text-[#0f1111] flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e7e7e7] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#565959]">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                  <span className="font-medium text-[#0f1111]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#565959]">
                  <span>Delivery Fee</span>
                  <span className={`font-medium ${effectiveShipping === 0 ? 'text-green-600' : 'text-[#0f1111]'}`}>
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
                  <div className="flex justify-between text-purple-600">
                    <span>Bundle Savings</span>
                    <span>−{formatPrice(bundleSavings)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#e7e7e7]">
                  <span className="font-bold text-[#0f1111] text-base">Total</span>
                  <span className="font-bold text-base text-[#E31E24]">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-[#999] text-right">VAT included, where applicable</p>
              </div>

              {/* Place Order CTA */}
              {needsArea && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Select your area/upazila above to confirm delivery fee
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || (availableAreas.length > 0 && !selectedAreaObj)}
                className="w-full mt-3 bg-[#E31E24] hover:bg-[#c41920] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</>
                  : `Place Order · ${formatPrice(total)}`
                }
              </button>

              <p className="text-[10px] text-[#999] text-center mt-3 leading-relaxed">
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
