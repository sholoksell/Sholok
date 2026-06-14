import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

const LoginPage = () => {
  const [isLogin, setIsLogin]     = useState(true);
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [name, setName]           = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const { addToast }              = useToast();
  const navigate                  = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast(
        isLogin ? 'Signed in successfully (demo)' : 'Account created (demo)',
        'success'
      );
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 px-4 pb-12">
      {/* Logo */}
      <Link to="/" className="mb-6 flex flex-col items-center">
        <span className="text-amazon-nav font-extrabold text-3xl tracking-tighter">
          Sho<span className="text-amazon-orange">lok</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[350px] border border-amazon-border rounded p-6 shadow-amazon">
        <h1 className="text-xl font-medium text-amazon-dark mb-4">
          {isLogin ? 'Sign in' : 'Create account'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-amazon-dark mb-1">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                className="w-full border border-amazon-border rounded px-3 py-2 text-sm text-amazon-dark focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-amazon-dark mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-amazon-text-gray" size={14} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-amazon-border rounded pl-9 pr-3 py-2 text-sm text-amazon-dark focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-amazon-dark">Password</label>
              {isLogin && (
                <Link to="#" className="text-xs text-amazon-blue hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-amazon-text-gray" size={14} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full border border-amazon-border rounded pl-9 pr-10 py-2 text-sm text-amazon-dark focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition"
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amazon-text-gray hover:text-amazon-dark transition-colors"
              >
                {showPwd ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-amazon-text-gray mt-1">
                Passwords must be at least 6 characters.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full amazon-btn py-2 text-sm font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-amazon-dark/40 border-t-amazon-dark rounded-full animate-spin" />
                Please wait…
              </>
            ) : isLogin ? 'Continue' : 'Create your Sholok account'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-[11px] text-amazon-text-gray mt-4 leading-relaxed">
          By continuing, you agree to Sholok's{' '}
          <Link to="#" className="text-amazon-blue hover:underline">Conditions of Use</Link>{' '}
          and{' '}
          <Link to="#" className="text-amazon-blue hover:underline">Privacy Notice</Link>.
        </p>

        {/* Divider */}
        <div className="relative my-5">
          <hr className="border-amazon-border" />
          <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[11px] text-amazon-text-gray uppercase tracking-wider">
            Or
          </span>
        </div>

        {/* Toggle */}
        <div className="text-center">
          <p className="text-sm text-amazon-dark mb-3">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </p>
          <button
            onClick={() => setIsLogin((p) => !p)}
            className="w-full amazon-btn-secondary py-2 text-sm"
          >
            {isLogin ? 'Create your Sholok account' : 'Sign in instead'}
          </button>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-8 w-full max-w-[350px]">
        <div className="border-t border-amazon-border pt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
          {['Conditions of Use', 'Privacy Notice', 'Help'].map((item) => (
            <Link key={item} to="#" className="text-xs text-amazon-blue hover:underline">
              {item}
            </Link>
          ))}
        </div>
        <p className="text-center text-[11px] text-amazon-text-gray mt-2">
          © 2024–{new Date().getFullYear()}, Sholok.com, Inc.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
