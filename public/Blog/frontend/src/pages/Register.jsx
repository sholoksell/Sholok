import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAtSign } from 'react-icons/fi';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!form.displayName.trim()) err.displayName = 'Name is required';
    if (!form.username.trim()) err.username = 'Username is required';
    else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) err.username = 'Username must be 3-30 chars (letters, numbers, _)';
    if (!form.email.trim()) err.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Invalid email address';
    if (!form.password) err.password = 'Password is required';
    else if (form.password.length < 6) err.password = 'Password must be at least 6 characters';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) { setErrors(err); return; }

    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.displayName);
      toast.success('Welcome to Sholok Blog! 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <>
      <Helmet><title>Create Account - Sholok Blog</title></Helmet>

      <div className="min-h-screen flex">
        {/* Left form */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm">SB</div>
                <span className="font-heading font-bold text-xl gradient-text">Sholok Blog</span>
              </Link>
              <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Create your account</h1>
              <p className="text-gray-400 mt-1">Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Display Name" icon={FiUser} error={errors.displayName}>
                <input type="text" value={form.displayName} onChange={set('displayName')}
                  placeholder="Your full name" className={`input pl-12 ${errors.displayName ? 'border-red-400' : ''}`} />
              </Field>

              <Field label="Username" icon={FiAtSign} error={errors.username}>
                <input type="text" value={form.username} onChange={set('username')}
                  placeholder="unique_username" className={`input pl-12 ${errors.username ? 'border-red-400' : ''}`}
                  autoComplete="username" />
              </Field>

              <Field label="Email address" icon={FiMail} error={errors.email}>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="you@example.com" className={`input pl-12 ${errors.email ? 'border-red-400' : ''}`}
                  autoComplete="email" />
              </Field>

              <Field label="Password" icon={FiLock} error={errors.password}>
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className={`input pl-12 pr-12 ${errors.password ? 'border-red-400' : ''}`}
                  autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </Field>

              {/* Password strength */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => {
                      const strength = form.password.length >= 6 ? (form.password.length >= 8 ? (form.password.match(/[A-Z]/) ? (form.password.match(/[^a-zA-Z0-9]/) ? 4 : 3) : 2) : 1) : 0;
                      return <div key={lvl} className={`h-1.5 flex-1 rounded-full transition-all ${lvl <= strength ? (strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-yellow-400' : strength <= 3 ? 'bg-blue-400' : 'bg-green-400') : 'bg-gray-200 dark:bg-gray-700'}`} />;
                    })}
                  </div>
                  <p className="text-xs text-gray-400">Use uppercase, numbers & symbols for a stronger password</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-base py-3.5 disabled:opacity-50 mt-2">
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</span>
                ) : (
                  <span className="flex items-center gap-2">Create Account <FiArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              By creating an account, you agree to our{' '}
              <Link to="/" className="text-primary-600 hover:underline">Terms of Service</Link>
            </p>
          </div>
        </div>

        {/* Right decorative panel */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-accent-600 via-primary-600 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
          <div className="relative text-center text-white">
            <div className="text-7xl mb-6">🌟</div>
            <h2 className="text-3xl font-heading font-bold mb-4">Join Sholok Blog</h2>
            <p className="text-primary-100 leading-relaxed mb-8 max-w-sm">
              Share your stories, discover amazing content, and connect with a vibrant community of bloggers.
            </p>
            <div className="grid grid-cols-2 gap-4 text-left">
              {['Rich text editor', 'Analytics dashboard', 'Short video clips', 'Follow system', 'Dark mode', 'Multi-category'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-primary-100">
                  <span className="text-accent-200">✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
