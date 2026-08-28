import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiShield, FiUser, FiKey } from 'react-icons/fi';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ secretKey: '', username: '', displayName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/admin-register', {
        secretKey: form.secretKey,
        username: form.username,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      });
      toast.success('Admin account created! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Create Admin Account</h1>
          <p className="text-gray-400 mt-1">Sholok Blog Management Panel</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Secret Key</label>
              <div className="relative">
                <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" value={form.secretKey} onChange={set('secretKey')} required
                  className="input pl-11" placeholder="Enter admin secret key" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Contact system owner for the secret key</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" value={form.displayName} onChange={set('displayName')} required
                  className="input pl-11" placeholder="Your full name" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input type="text" value={form.username} onChange={set('username')} required
                  className="input pl-8" placeholder="username" pattern="[a-zA-Z0-9_]+" minLength={3} maxLength={30} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" value={form.email} onChange={set('email')} required
                  className="input pl-11" placeholder="admin@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" value={form.password} onChange={set('password')} required
                  className="input pl-11" placeholder="Min 6 characters" minLength={6} />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required
                  className="input pl-11" placeholder="Repeat password" minLength={6} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</span>
                : 'Create Admin Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
