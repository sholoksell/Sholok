import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { addressService } from '@/services/addressService';
import { getImageUrl, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Clock, Salad, Briefcase, Home, Truck, CheckCircle2, Tag, ChevronDown, Pencil } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE = '/api';

// Bangladesh cascading location data
const BD_DIVISIONS = ['Dhaka','Chittagong','Rajshahi','Khulna','Sylhet','Barisal','Rangpur','Mymensingh'];

const BD_DISTRICTS = {
  Dhaka:       ['Dhaka','Gazipur','Narayanganj','Narsingdi','Manikganj','Munshiganj','Rajbari','Shariatpur','Faridpur','Madaripur','Gopalganj','Kishoreganj','Tangail'],
  Chittagong:  ['Chittagong','Cox\'s Bazar','Comilla','Feni','Noakhali','Lakshmipur','Chandpur','Brahmanbaria','Khagrachhari','Rangamati','Bandarban'],
  Rajshahi:    ['Rajshahi','Bogura','Naogaon','Chapai Nawabganj','Natore','Sirajganj','Pabna','Joypurhat'],
  Khulna:      ['Khulna','Jessore','Satkhira','Bagerhat','Narail','Magura','Jhenaidah','Chuadanga','Kushtia','Meherpur'],
  Sylhet:      ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
  Barisal:     ['Barisal','Pirojpur','Bhola','Jhalokathi','Patuakhali','Barguna'],
  Rangpur:     ['Rangpur','Dinajpur','Kurigram','Gaibandha','Nilphamari','Panchagarh','Thakurgaon','Lalmonirhat'],
  Mymensingh:  ['Mymensingh','Jamalpur','Netrokona','Sherpur'],
};

const BD_AREAS = {
  Dhaka:         ['Dhanmondi','Mirpur','Gulshan','Banani','Uttara','Mohammadpur','Rayer Bazar','Badda','Khilgaon','Motijheel','Paltan','Old Dhaka','Demra','Jatrabari','Shyamoli','Lalmatia','Azimpur','Lalbagh','New Market','Kalabagan','Farmgate','Tejgaon','Rampura','Khilkhet','Vatara'],
  Gazipur:       ['Gazipur Sadar','Kaliakoir','Kapasia','Sreepur','Tongi'],
  Narayanganj:   ['Narayanganj Sadar','Araihazar','Bandar','Rupganj','Sonargaon'],
  Chittagong:    ['Agrabad','Anderkilla','Bakolia','Bayazid','Chandgaon','Chawkbazar','Double Mooring','Halishahar','Khulshi','Kotwali','Pahartali','Panchlaish','Patenga','Sholoshahar'],
  "Cox's Bazar": ['Cox\'s Bazar Sadar','Chakaria','Maheshkhali','Ukhia','Teknaf','Kutubdia'],
  Comilla:       ['Comilla Sadar','Burichang','Chandina','Chauddagram','Daudkandi','Debidwar','Homna','Laksam','Monohorganj','Muradnagar'],
  Rajshahi:      ['Rajshahi Sadar','Boalia','Motihar','Rajpara','Shah Makhdum'],
  Khulna:        ['Khulna Sadar','Daulatpur','Khalishpur','Khanepur','Sonadanga'],
  Sylhet:        ['Sylhet Sadar','Beanibazar','Companiganj','Golapganj','Gowainghat','Jaintapur','Kanaighat','Osmaninagar'],
  Barisal:       ['Barisal Sadar','Agailjhara','Babuganj','Bakerganj','Banaripara','Gauranadi','Mehendiganj','Muladi','Wazirpur'],
  Rangpur:       ['Rangpur Sadar','Badarganj','Gangachara','Kaunia','Mithapukur','Pirgachha','Pirganj','Taraganj'],
  Mymensingh:    ['Mymensingh Sadar','Bhaluka','Dhobaura','Fulbaria','Gaffargaon','Gauripur','Haluaghat','Ishwarganj','Muktagachha','Nandail','Phulpur','Trishal'],
};

const getAreas = (district) => BD_AREAS[district] || [];

const SelectField = ({ label, value, onChange, options, placeholder, error }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-[#0f1111] block">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full appearance-none border rounded px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#e77600] pr-8 ${
          error ? 'border-red-500' : 'border-[#adb1b8]'
        } ${!value ? 'text-gray-400' : 'text-[#0f1111]'}`}
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
      className={`w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e77600] ${
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
  const [shippingCost, setShippingCost] = useState(115);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Cascading location state
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [buildingAddr, setBuildingAddr] = useState('');
  const [colonyAddr, setColonyAddr] = useState('');
  const [streetAddr, setStreetAddr] = useState('');
  const [fullName, setFullName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [formErrors, setFormErrors] = useState({});

  const hasGrocery = (cart?.items || []).some(item => item.product_type === 'perishable');

  useEffect(() => {
    const cartItems = cart?.items || [];
    if (!cartItems.length) { setBundleOffers([]); return; }
    fetch(`${API_BASE}/bundle-offers/check-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems.map(i => ({ productId: i.productId || i._id || i.id, quantity: i.quantity })) }),
    }).then(r => r.ok ? r.json() : { applicable: [] })
      .then(d => setBundleOffers(d.applicable || []))
      .catch(() => {});
  }, [cart]);

  useEffect(() => {
    if (!hasGrocery) return;
    fetch(`${API_BASE}/grocery-settings/slots`)
      .then(r => r.json())
      .then(d => setGrocerySlots((d || []).filter(s => s.isActive)))
      .catch(() => {});
  }, [hasGrocery]);

  useEffect(() => {
    if (!isAuthenticated) return;
    addressService.getAll().then(list => {
      const def = (list || []).find(a => a.isDefault) || (list || [])[0];
      if (def) {
        setFullName(def.name || customer?.name || '');
        setPhone(def.phone || customer?.phone || '');
        setBuildingAddr(def.street || '');
        setDistrict(def.city || '');
        setArea(def.state || '');
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!district) return;
    const items = cart?.items || [];
    if (!items.length) { setShippingCost(0); return; }
    setShippingLoading(true);
    fetch(`${API_BASE}/delivery-rates/charge?district=${encodeURIComponent(district)}&area=${encodeURIComponent(area || '')}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.matched) setShippingCost(d.charge); })
      .catch(() => {})
      .finally(() => setShippingLoading(false));
  }, [district, area, cart]);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const effectiveShipping = items.length > 0 ? shippingCost : 0;
  const bundleSavings = bundleOffers.reduce((s, o) => s + (o.discount_amount || 0), 0);
  const total = Math.max(0, subtotal + effectiveShipping - couponDiscount - bundleSavings);

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
    if (!division) errs.division = 'Please choose your region';
    if (!district) errs.district = 'Please choose your city';
    if (!area && getAreas(district).length > 0) errs.area = 'Please choose your area';
    if (!buildingAddr.trim()) errs.buildingAddr = 'Building / House No is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveAddress = () => {
    if (!validate()) return;
    setAddrSaved(true);
    toast.success('Delivery address saved');
  };

  const handlePlaceOrder = async () => {
    if (!validate()) { toast.error('Please fill in all required fields'); return; }
    if (!items.length) { toast.error(t('cartIsEmpty')); return; }
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
          name: fullName,
          phone,
          street: [buildingAddr, colonyAddr, streetAddr].filter(Boolean).join(', '),
          city: district,
          state: area || division,
          country: 'Bangladesh',
        },
        paymentMethod: paymentMethod === 'cod' ? 'cash_on_delivery' : 'credit_card',
        subtotal,
        shippingCost: effectiveShipping,
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
      toast.success(t('orderPlacedSuccess'));
      clearCart();
      navigate('/account');
    } catch (error) {
      toast.error(error.response?.data?.message || t('failedToPlaceOrder'));
    } finally { setLoading(false); }
  };

  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('pleaseLoginToCheckout')}</h2>
          <p className="text-muted-foreground mb-6">{t('needSignedIn')}</p>
          <div className="flex justify-center gap-3">
            <Link to="/login?redirect=/checkout">
              <Button className="bg-[#f57224] hover:bg-[#e06420] text-white border-0">{t('login')}</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">{t('register')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-2xl font-bold">{t('yourCartIsEmpty')}</h2>
        <Link to="/"><Button className="bg-[#f57224] hover:bg-[#e06420] text-white border-0">{t('continueShopping')}</Button></Link>
      </div>
    );
  }

  // Delivery date labels
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const fmtDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-[#0f1111] mb-5">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-5 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Delivery Information card */}
            <div className="bg-white rounded-sm border border-[#ddd] p-5">
              <h2 className="text-base font-bold text-[#0f1111] mb-4 border-b border-[#e7e7e7] pb-3">
                Delivery Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Row 1 */}
                <TextField
                  label="Full name"
                  placeholder="Enter your first and last name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  error={formErrors.fullName}
                />
                <SelectField
                  label="Region"
                  value={division}
                  onChange={v => { setDivision(v); setDistrict(''); setArea(''); }}
                  options={BD_DIVISIONS}
                  placeholder="Please choose your region"
                  error={formErrors.division}
                />

                {/* Row 2 */}
                <TextField
                  label="Phone Number"
                  placeholder="Please enter your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  error={formErrors.phone}
                  type="tel"
                />
                <SelectField
                  label="City"
                  value={district}
                  onChange={v => { setDistrict(v); setArea(''); }}
                  options={division ? (BD_DISTRICTS[division] || []) : []}
                  placeholder="Please choose your city"
                  error={formErrors.district}
                />

                {/* Row 3 */}
                <TextField
                  label="Building / House No / Floor / Street"
                  placeholder="Please enter"
                  value={buildingAddr}
                  onChange={e => setBuildingAddr(e.target.value)}
                  error={formErrors.buildingAddr}
                />
                {getAreas(district).length > 0 ? (
                  <SelectField
                    label="Area"
                    value={area}
                    onChange={setArea}
                    options={getAreas(district)}
                    placeholder="Please choose your area"
                    error={formErrors.area}
                  />
                ) : (
                  <TextField
                    label="Area"
                    placeholder="Enter your area / thana"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                  />
                )}

                {/* Row 4 */}
                <TextField
                  label="Colony / Suburb / Locality / Landmark"
                  placeholder="Please enter"
                  value={colonyAddr}
                  onChange={e => setColonyAddr(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#0f1111] block">Address</label>
                  <textarea
                    rows={2}
                    placeholder="For Example: House# 123, Street# 123, ABC Road"
                    value={streetAddr}
                    onChange={e => setStreetAddr(e.target.value)}
                    className="w-full border border-[#adb1b8] rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e77600] text-[#0f1111] placeholder-gray-400 resize-none"
                  />
                </div>
              </div>

              {/* Label selection */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#0f1111] mb-2">Select a label for effective delivery:</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setAddressLabel('office')}
                    className={`flex items-center gap-2 px-5 py-2 border rounded text-sm font-medium transition-colors ${
                      addressLabel === 'office'
                        ? 'border-[#f57224] text-[#f57224] bg-orange-50'
                        : 'border-[#adb1b8] text-[#565959] hover:border-[#f57224]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" /> OFFICE
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressLabel('home')}
                    className={`flex items-center gap-2 px-5 py-2 border rounded text-sm font-medium transition-colors ${
                      addressLabel === 'home'
                        ? 'border-[#f57224] text-[#f57224] bg-orange-50'
                        : 'border-[#adb1b8] text-[#565959] hover:border-[#f57224]'
                    }`}
                  >
                    <Home className="w-4 h-4" /> HOME
                  </button>
                </div>
              </div>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSaveAddress}
                className="bg-[#1a94ff] hover:bg-[#0e87f0] text-white font-semibold text-sm px-8 py-2.5 rounded transition-colors"
              >
                {addrSaved ? '✓ SAVED' : 'SAVE'}
              </button>
            </div>

            {/* Grocery Schedule */}
            {hasGrocery && (
              <div className="bg-white rounded-sm border border-[#ddd] p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-[#e7e7e7] pb-3">
                  <Salad className="h-5 w-5 text-green-600" />
                  <h2 className="text-base font-bold text-[#0f1111]">{t('groceryDeliverySchedule')}</h2>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#0f1111] mb-2">{t('deliveryDate')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['today', 'tomorrow'].map(day => (
                      <button key={day} type="button" onClick={() => setSelectedDeliveryDate(day)}
                        className={`border rounded p-3 text-sm font-medium transition-colors ${selectedDeliveryDate === day ? 'border-[#f57224] bg-orange-50 text-[#f57224]' : 'border-[#adb1b8] text-[#565959] hover:border-[#f57224]'}`}>
                        {day === 'today' ? `${t('today')} (${fmtDate(today)})` : `${t('tomorrow')} (${fmtDate(tomorrow)})`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0f1111] mb-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t('selectTimeSlot')}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {grocerySlots.length > 0 ? grocerySlots.map(slot => (
                      <button key={slot._id} type="button" onClick={() => setSelectedSlotId(String(slot._id))}
                        className={`border rounded p-2.5 text-xs font-medium text-left transition-colors ${selectedSlotId === String(slot._id) ? 'border-[#f57224] bg-orange-50 text-[#f57224]' : 'border-[#adb1b8] text-[#565959] hover:border-[#f57224]'}`}>
                        {slot.label}
                      </button>
                    )) : <p className="text-sm text-gray-400 col-span-2">Loading slots…</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Package section */}
            {items.map((item, idx) => {
              const vendorName = item.vendor_name || item.store_name || 'Sholok Store';
              const deliveryDate = `${fmtDate(new Date(Date.now() + 2 * 86400000))}-${fmtDate(new Date(Date.now() + 5 * 86400000))}`;
              return (
                <div key={item._id || idx} className="bg-white rounded-sm border border-[#ddd] p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-[#e7e7e7] pb-3">
                    <span className="text-sm font-bold text-[#0f1111]">Package {idx + 1} of {items.length}</span>
                    <span className="text-xs text-[#565959]">
                      Shipped by <span className="font-semibold text-[#0f1111] uppercase">{vendorName}</span>
                    </span>
                  </div>

                  {/* Delivery option */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#0f1111] mb-2">Delivery or Pickup</p>
                    <div className="border-2 border-[#1a94ff] rounded p-3 flex items-start gap-3 bg-[#f0f8ff]">
                      <CheckCircle2 className="w-5 h-5 text-[#1a94ff] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm text-[#0f1111]">
                          {shippingLoading ? '…' : `৳${effectiveShipping}`}
                        </p>
                        <p className="text-xs text-[#565959]">Standard Delivery</p>
                        <p className="text-xs text-[#565959] mt-0.5 flex items-center gap-1">
                          <Truck className="w-3 h-3" /> Guaranteed by {deliveryDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product row */}
                  <div className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 border border-[#e7e7e7] rounded overflow-hidden bg-[#f5f5f5]">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#c45500] font-semibold mb-0.5">10.10</p>
                      <p className="text-sm text-[#0f1111] line-clamp-2 font-medium">{item.name}</p>
                      <p className="text-xs text-[#565959]">{item.brand || 'No Brand'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#0f1111]">{formatPrice(item.price)}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs text-[#999] line-through">{formatPrice(item.originalPrice)}</p>
                      )}
                      <p className="text-xs text-[#565959]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Payment Method */}
            <div className="bg-white rounded-sm border border-[#ddd] p-5">
              <h2 className="text-base font-bold text-[#0f1111] mb-4 border-b border-[#e7e7e7] pb-3">
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setPaymentMethod('cod')}
                  className={`border-2 rounded p-4 text-left flex items-center gap-3 transition-colors ${paymentMethod === 'cod' ? 'border-[#f57224] bg-orange-50' : 'border-[#adb1b8] hover:border-[#f57224]'}`}>
                  <span className="text-2xl">💵</span>
                  <div>
                    <p className={`font-semibold text-sm ${paymentMethod === 'cod' ? 'text-[#f57224]' : 'text-[#0f1111]'}`}>{t('cashOnDelivery')}</p>
                    <p className="text-xs text-[#565959]">Pay when you receive</p>
                  </div>
                </button>
                <button type="button" onClick={() => setPaymentMethod('online')}
                  className={`border-2 rounded p-4 text-left flex items-center gap-3 transition-colors ${paymentMethod === 'online' ? 'border-[#f57224] bg-orange-50' : 'border-[#adb1b8] hover:border-[#f57224]'}`}>
                  <span className="text-2xl">💳</span>
                  <div>
                    <p className={`font-semibold text-sm ${paymentMethod === 'online' ? 'text-[#f57224]' : 'text-[#0f1111]'}`}>{t('cardPayment')}</p>
                    <p className="text-xs text-[#565959]">Bkash / Nagad / Card</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 space-y-3">

            {/* Promotion */}
            <div className="bg-white rounded-sm border border-[#ddd] p-4">
              <p className="text-sm font-bold text-[#0f1111] mb-3">Promotion</p>
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
                    placeholder="Enter Store/Daraz Code"
                    className="flex-1 border border-[#adb1b8] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1a94ff] text-[#0f1111] placeholder-gray-400 min-w-0"
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-[#1a94ff] hover:bg-[#0e87f0] disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded transition-colors whitespace-nowrap"
                  >
                    {couponLoading ? '…' : 'APPLY'}
                  </button>
                </div>
              )}
            </div>

            {/* Invoice & Contact Info */}
            <div className="bg-white rounded-sm border border-[#ddd] p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-[#0f1111]">Invoice and Contact Info</p>
                <button className="text-[#1a94ff] text-xs font-semibold flex items-center gap-1 hover:underline">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
              <div className="text-xs text-[#565959] space-y-0.5">
                <p>{fullName || customer?.name || '—'}</p>
                <p>{phone || customer?.phone || '—'}</p>
                {(district || division) && <p>{[area, district, division].filter(Boolean).join(', ')}</p>}
              </div>
            </div>

            {/* Bundle offers */}
            {bundleOffers.length > 0 && (
              <div className="bg-white rounded-sm border border-purple-200 p-4 space-y-2">
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
            <div className="bg-white rounded-sm border border-[#ddd] p-4">
              <p className="text-sm font-bold text-[#0f1111] mb-3">Order Summary</p>

              {/* Product mini list */}
              <div className="space-y-2 mb-3 max-h-[180px] overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-2 items-center">
                    <div className="w-9 h-9 flex-shrink-0 border border-[#e7e7e7] rounded overflow-hidden bg-[#f5f5f5]">
                      <img src={getImageUrl(item.image)} alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <p className="text-xs text-[#0f1111] flex-1 line-clamp-2">{item.name}</p>
                    <p className="text-xs font-semibold text-[#0f1111] flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#e7e7e7] pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-[#565959]">
                  <span>Items Total ({items.length} {items.length === 1 ? 'Item' : 'Items'})</span>
                  <span className="font-medium text-[#0f1111]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#565959]">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-[#0f1111]">
                    {shippingLoading ? '…' : formatPrice(effectiveShipping)}
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
                  <span className="font-bold text-[#0f1111]">Total:</span>
                  <span className="font-bold text-base text-[#f57224]">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-[#999] text-right">VAT included, where applicable</p>
              </div>

              {/* Proceed to Pay */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 bg-[#f57224] hover:bg-[#e06420] disabled:opacity-60 text-white font-bold text-sm py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order…</> : 'Proceed to Pay'}
              </button>

              <p className="text-[10px] text-[#999] text-center mt-3 leading-relaxed">
                By placing this order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
