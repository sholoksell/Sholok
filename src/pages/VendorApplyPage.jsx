import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = '/api';

const VendorApplyPage = () => {
  const [form, setForm] = useState({
    name: '', business_name: '', store_name: '',
    email: '', phone: '', password: '', confirmPassword: '',
    district: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/vendor-auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, business_name: form.business_name, store_name: form.store_name,
          email: form.email, phone: form.phone, password: form.password,
          district: form.district, address: form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Application Submitted!</h2>
          <p className="text-gray-500 mb-6">
            Thank you for applying to sell on Sholok. Our team will review your application and notify you by email within 2-3 business days.
          </p>
          <Link to="/" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Become a Vendor</h1>
          <p className="text-gray-500 mt-2">Join thousands of sellers on Sholok Marketplace</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🏪', title: 'Your Own Store', desc: 'Customizable storefront' },
            { icon: '📦', title: 'Easy Shipping', desc: 'Integrated logistics' },
            { icon: '💰', title: 'Fast Payouts', desc: 'Weekly settlements' },
          ].map(b => (
            <div key={b.title} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <span className="text-2xl">{b.icon}</span>
              <p className="text-sm font-semibold text-gray-800 mt-1">{b.title}</p>
              <p className="text-xs text-gray-400">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Application Form</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-5">
              <AlertCircle size={16} />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Your Name *</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone *</label>
                  <input value={form.phone} onChange={e => f('phone', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="01XXXXXXXXX" />
                </div>
              </div>
            </div>

            {/* Business */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Business Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Store Name *</label>
                  <input value={form.store_name} onChange={e => f('store_name', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Your shop name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Business Name</label>
                  <input value={form.business_name} onChange={e => f('business_name', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Registered business (optional)" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">District *</label>
                  <input value={form.district} onChange={e => f('district', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g. Dhaka" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Address</label>
                  <input value={form.address} onChange={e => f('address', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Shop/warehouse address" />
                </div>
              </div>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Account Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email Address *</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="vendor@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Password *</label>
                    <input type="password" value={form.password} onChange={e => f('password', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Confirm Password *</label>
                    <input type="password" value={form.confirmPassword} onChange={e => f('confirmPassword', e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Repeat password" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-base transition-colors mt-2"
            >
              {loading ? 'Submitting Application…' : 'Submit Application'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Already a vendor?{' '}
              <Link to="/vendor/login" className="text-green-600 hover:underline font-medium">Sign in to Vendor Panel</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorApplyPage;
