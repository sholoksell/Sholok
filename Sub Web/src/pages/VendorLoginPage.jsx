import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

const VendorLoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/vendor-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('vendor_token', data.token);
      window.location.href = '/admin/vendor/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Sign In</h1>
          <p className="text-gray-500 text-sm mt-1">Access your Sholok Vendor Panel</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200 mb-5">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="vendor@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in to Vendor Panel'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-sm text-gray-500">
          <p>
            Not a vendor yet?{' '}
            <Link to="/vendor/apply" className="text-emerald-600 hover:underline font-medium">Apply to sell on Sholok</Link>
          </p>
          <p>
            Looking for customer login?{' '}
            <Link to="/login" className="text-gray-700 hover:underline font-medium">Sign in here</Link>
          </p>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <strong>Note:</strong> Only approved vendors can sign in. If your application is pending review, you will receive an email once approved.
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;
