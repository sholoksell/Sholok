import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle, AlertCircle, Upload, Eye, EyeOff, ChevronDown } from 'lucide-react';

const API_BASE = '/api';
const PRIMARY = '#5D0096';
const ACCENT = '#D31710';

const BUSINESS_TYPES = [
  'Individual / Sole Trader',
  'Retail Shop',
  'Wholesale / Distributor',
  'Manufacturer / Brand',
  'Importer / Exporter',
  'Handicrafts / Cottage Industry',
  'Fashion & Apparel',
  'Electronics & Technology',
  'Food & Beverage',
  'Beauty & Personal Care',
  'Books & Stationery',
  'Home & Kitchen',
  'Others',
];

const BD_DIVISIONS = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

function InputField({ label, required, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label}{required && <span style={{ color: ACCENT }} className="ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: ACCENT }}>{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-transparent focus:ring-2 transition-all"
      style={{ '--tw-ring-color': PRIMARY }}
      onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`}
      onBlur={e => e.currentTarget.style.boxShadow = ''}
      {...rest}
    />
  );
}

function SelectField({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 appearance-none focus:outline-none disabled:opacity-50 cursor-pointer pr-9 transition-all"
        onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`}
        onBlur={e => e.currentTarget.style.boxShadow = ''}
      >
        {children}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

const VendorApplyPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    store_name: '', business_name: '', business_type: '', store_description: '',
    division: '', district: '', upazila: '', address: '',
    nid_number: '', trade_license: '',
    agree_terms: false,
  });
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Load districts when division changes
  useEffect(() => {
    if (!form.division) { setDistricts([]); f('district', ''); setUpazilas([]); f('upazila', ''); return; }
    fetch(`${API_BASE}/delivery-coverage/location/districts?division=${encodeURIComponent(form.division)}`)
      .then(r => r.json())
      .then(d => setDistricts(Array.isArray(d) ? d : []))
      .catch(() => setDistricts([]));
    f('district', '');
    setUpazilas([]);
    f('upazila', '');
  }, [form.division]);

  // Load upazilas when district changes
  useEffect(() => {
    if (!form.district) { setUpazilas([]); f('upazila', ''); return; }
    fetch(`${API_BASE}/delivery-coverage/location/areas?district=${encodeURIComponent(form.district)}`)
      .then(r => r.json())
      .then(d => setUpazilas(Array.isArray(d) ? d : []))
      .catch(() => setUpazilas([]));
    f('upazila', '');
  }, [form.district]);

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
      if (!form.phone.trim()) e.phone = 'Mobile number is required';
      else if (!/^01[3-9]\d{8}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid BD mobile number';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 6) e.password = 'Minimum 6 characters';
      if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
      else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (!form.store_name.trim()) e.store_name = 'Store name is required';
      if (!form.business_type) e.business_type = 'Business type is required';
      if (!form.store_description.trim()) e.store_description = 'Brief store description is required';
    }
    if (s === 3) {
      if (!form.division) e.division = 'Division is required';
      if (!form.district) e.district = 'District is required';
      if (!form.address.trim()) e.address = 'Business address is required';
      if (!form.agree_terms) e.agree_terms = 'You must accept the Terms & Conditions';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    setSubmitError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        store_name: form.store_name.trim(),
        business_name: form.business_name.trim() || form.store_name.trim(),
        business_type: form.business_type,
        store_description: form.store_description.trim(),
        division: form.division,
        district: form.district,
        upazila: form.upazila || null,
        address: form.address.trim(),
        nid_number: form.nid_number.trim() || null,
        trade_license: form.trade_license.trim() || null,
      };
      const res = await fetch(`${API_BASE}/vendor-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8f0ff 0%, #fff 60%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: '#f0e6ff' }}>
            <CheckCircle size={40} style={{ color: PRIMARY }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Application Submitted!</h2>
          <p className="text-gray-500 mb-2">
            Thank you, <strong>{form.name}</strong>! Your vendor application has been received.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Our team will review your application and notify you at <strong>{form.email}</strong> within 2–3 business days.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Application ID</p>
            <p className="font-mono font-bold text-gray-700">VND-{String(success.vendorId || '').padStart(6, '0')}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors text-center">
              Back to Home
            </Link>
            <a href="https://admin.sholok.com/vendor/login" className="flex-1 py-3 rounded-xl font-semibold text-sm text-white text-center transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #7A00BB)` }}>
              Vendor Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = ['Personal Info', 'Business Info', 'Location & Terms'];

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(135deg, #f8f0ff 0%, #fff 50%, #fff5f5 100%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: `linear-gradient(135deg, ${PRIMARY}, #7A00BB)` }}>
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Become a Vendor</h1>
          <p className="text-gray-500 mt-2">Join Sholok Marketplace and grow your business</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🏪', title: 'Your Own Store', desc: 'Customizable storefront' },
            { icon: '📦', title: 'Easy Logistics', desc: 'Integrated shipping' },
            { icon: '💰', title: 'Fast Payouts', desc: 'Weekly settlements' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <span className="text-2xl">{b.icon}</span>
              <p className="text-xs font-semibold text-gray-800 mt-1">{b.title}</p>
              <p className="text-xs text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 px-2">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <React.Fragment key={n}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: done || active ? PRIMARY : '#e5e7eb',
                      color: done || active ? '#fff' : '#9ca3af',
                    }}
                  >
                    {done ? '✓' : n}
                  </div>
                  <span className="hidden sm:block text-xs font-medium" style={{ color: active ? PRIMARY : done ? '#6b7280' : '#9ca3af' }}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2" style={{ background: step > n ? PRIMARY : '#e5e7eb' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {submitError && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg border mb-5" style={{ background: '#fff5f5', borderColor: '#fecaca', color: ACCENT }}>
              <AlertCircle size={16} className="flex-shrink-0" />{submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ── STEP 1: Personal Info ── */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>
                <InputField label="Full Name" required error={errors.name}>
                  <TextInput value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your full name" />
                </InputField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Email Address" required error={errors.email}>
                    <TextInput type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="vendor@example.com" />
                  </InputField>
                  <InputField label="Mobile Number" required error={errors.phone}>
                    <TextInput value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="01XXXXXXXXX" />
                  </InputField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Password" required error={errors.password}>
                    <div className="relative">
                      <TextInput
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => f('password', e.target.value)}
                        placeholder="Min 6 characters"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </InputField>
                  <InputField label="Confirm Password" required error={errors.confirmPassword}>
                    <div className="relative">
                      <TextInput
                        type={showConfirm ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={e => f('confirmPassword', e.target.value)}
                        placeholder="Repeat password"
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </InputField>
                </div>
              </div>
            )}

            {/* ── STEP 2: Business Info ── */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Business Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Store / Shop Name" required error={errors.store_name}>
                    <TextInput value={form.store_name} onChange={e => f('store_name', e.target.value)} placeholder="Your shop name" />
                  </InputField>
                  <InputField label="Registered Business Name" error={errors.business_name}>
                    <TextInput value={form.business_name} onChange={e => f('business_name', e.target.value)} placeholder="Optional" />
                  </InputField>
                </div>
                <InputField label="Business Type" required error={errors.business_type}>
                  <SelectField value={form.business_type} onChange={e => f('business_type', e.target.value)}>
                    <option value="">— Select Business Type —</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </SelectField>
                </InputField>
                <InputField label="Store Description" required error={errors.store_description}>
                  <textarea
                    value={form.store_description}
                    onChange={e => f('store_description', e.target.value)}
                    placeholder="Briefly describe what your store sells…"
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none resize-none transition-all"
                    onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`}
                    onBlur={e => e.currentTarget.style.boxShadow = ''}
                  />
                </InputField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="NID / National ID Number" error={errors.nid_number}>
                    <TextInput value={form.nid_number} onChange={e => f('nid_number', e.target.value)} placeholder="Optional" />
                  </InputField>
                  <InputField label="Trade License Number" error={errors.trade_license}>
                    <TextInput value={form.trade_license} onChange={e => f('trade_license', e.target.value)} placeholder="Optional" />
                  </InputField>
                </div>
              </div>
            )}

            {/* ── STEP 3: Location & Terms ── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Location & Terms</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Division" required error={errors.division}>
                    <SelectField value={form.division} onChange={e => f('division', e.target.value)}>
                      <option value="">— Division —</option>
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </SelectField>
                  </InputField>
                  <InputField label="District" required error={errors.district}>
                    <SelectField value={form.district} onChange={e => f('district', e.target.value)} disabled={!form.division}>
                      <option value="">— District —</option>
                      {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </SelectField>
                  </InputField>
                  <InputField label="Area / Upazila" error={errors.upazila}>
                    <SelectField value={form.upazila} onChange={e => f('upazila', e.target.value)} disabled={!form.district}>
                      <option value="">— Area (optional) —</option>
                      {upazilas.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </SelectField>
                  </InputField>
                </div>
                <InputField label="Business Address" required error={errors.address}>
                  <textarea
                    value={form.address}
                    onChange={e => f('address', e.target.value)}
                    placeholder="Shop or warehouse address…"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:outline-none resize-none transition-all"
                    onFocus={e => e.currentTarget.style.boxShadow = `0 0 0 2px ${PRIMARY}33`}
                    onBlur={e => e.currentTarget.style.boxShadow = ''}
                  />
                </InputField>

                {/* Terms */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-500 leading-relaxed max-h-32 overflow-y-auto">
                  <strong className="text-gray-700">Terms & Conditions</strong><br />
                  By submitting this application you agree to Sholok's vendor policies, commission structure, and marketplace rules.
                  Approved vendors must maintain product quality, accurate stock, and timely order fulfillment.
                  Sholok reserves the right to suspend or terminate accounts that violate these policies.
                  Commission rates are set by Sholok admin and may vary by category.
                  Payouts are processed weekly after deducting applicable commissions and fees.
                </div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.agree_terms}
                    onChange={e => f('agree_terms', e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: PRIMARY }}
                  />
                  <span className="text-sm text-gray-700">
                    I have read and agree to the <span style={{ color: PRIMARY }} className="font-medium">Terms & Conditions</span>
                    {errors.agree_terms && <span className="block text-xs mt-0.5" style={{ color: ACCENT }}>{errors.agree_terms}</span>}
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  ← Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, #7A00BB)` }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, #7A00BB)` }}
                >
                  {loading ? 'Submitting…' : 'Submit Application'}
                </button>
              )}
            </div>

            <p className="text-center text-sm text-gray-400 mt-4">
              Already a vendor?{' '}
              <a href="https://admin.sholok.com/vendor/login" style={{ color: PRIMARY }} className="hover:underline font-medium">
                Sign in to Vendor Panel
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorApplyPage;
