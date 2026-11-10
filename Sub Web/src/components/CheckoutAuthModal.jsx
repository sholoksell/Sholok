import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/axios';

const STEP_SIGNUP      = 'signup';
const STEP_VERIFY      = 'verify';
const STEP_SUCCESS     = 'success';
const STEP_SIGNIN      = 'signin';
const STEP_GOOGLE_OTP  = 'google_otp';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function loadGSI() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.getElementById('gsi-client');
    if (existing) { existing.addEventListener('load', resolve, { once: true }); return; }
    const s = document.createElement('script');
    s.id = 'gsi-client'; s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('GSI load failed'));
    document.head.appendChild(s);
  });
}

function TextField({ icon: Icon, type = 'text', placeholder, value, onChange, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  return (
    <div className="flex items-center rounded-xl bg-gray-100 px-4 py-3 gap-3">
      <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
      <input
        type={isPwd ? (show ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
      />
      {isPwd && (
        <button type="button" onClick={() => setShow(v => !v)} className="text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

const CheckoutAuthModal = ({ onClose, onAuthComplete }) => {
  const [step, setStep]       = useState(STEP_SIGNUP);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Sign-up fields
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // OTP state
  const [otp, setOtp]                     = useState('');
  const [verificationToken, setVToken]    = useState('');
  const [maskedEmail, setMaskedEmail]     = useState('');
  const [countdown, setCountdown]         = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

  // Sign-in fields
  const [signEmail, setSignEmail]       = useState('');
  const [signPassword, setSignPassword] = useState('');

  // Google OTP
  const [googleOtp, setGoogleOtp]           = useState('');
  const [googleOtpError, setGoogleOtpError] = useState('');
  const [googleCountdown, setGoogleCountdown] = useState(60);
  const [resendGoogleLoading, setResendGoogleLoading] = useState(false);
  const googleTimerRef = useRef(null);

  // Google button refs
  const gBtnSignup = useRef(null);
  const gBtnSignin = useRef(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const startTimer = (secs, setter, ref) => {
    setter(secs);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setter(v => { if (v <= 1) { clearInterval(ref.current); return 0; } return v - 1; });
    }, 1000);
  };

  useEffect(() => () => { clearInterval(timerRef.current); clearInterval(googleTimerRef.current); }, []);

  const handleGoogleCredential = useCallback(async (response) => {
    const credential = response?.credential;
    if (!credential) return;
    setGoogleLoading(true); setError('');
    try {
      const res = await api.post('/customer-auth/google/verify', { credential });
      setVToken(res.data.verificationToken);
      setMaskedEmail(res.data.maskedEmail);
      setStep(STEP_GOOGLE_OTP);
      startTimer(60, setGoogleCountdown, googleTimerRef);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally { setGoogleLoading(false); }
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (step !== STEP_SIGNUP && step !== STEP_SIGNIN) return;
    const ref = step === STEP_SIGNUP ? gBtnSignup : gBtnSignin;
    let cancelled = false;
    (async () => {
      try {
        await loadGSI();
        if (cancelled || !ref.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential,
          ux_mode: 'popup', cancel_on_tap_outside: false,
        });
        window.google.accounts.id.renderButton(ref.current, {
          type: 'standard', theme: 'outline',
          text: step === STEP_SIGNUP ? 'signup_with' : 'signin_with',
          shape: 'rectangular', logo_alignment: 'left', width: '300',
        });
      } catch (e) { console.warn('GSI init failed:', e.message); }
    })();
    return () => { cancelled = true; };
  }, [step, handleGoogleCredential]);

  // ── Sign Up ───────────────────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { setError('All fields are required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/customer-auth/register/init', {
        name: name.trim(), email: email.trim().toLowerCase(), password,
      });
      setVToken(res.data.verificationToken);
      setMaskedEmail(res.data.maskedEmail);
      setStep(STEP_VERIFY);
      setOtp('');
      startTimer(60, setCountdown, timerRef);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit code'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/customer-auth/register/verify', { verificationToken, otp, password });
      setStep(STEP_SUCCESS);
      clearInterval(timerRef.current);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code.');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true); setError('');
    try {
      await api.post('/customer-auth/register/resend', { verificationToken });
      startTimer(60, setCountdown, timerRef);
      toast.success('New code sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend.');
    } finally { setResendLoading(false); }
  };

  // ── Sign In ───────────────────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!signEmail.trim() || !signPassword) { setError('All fields are required'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/customer-auth/login', {
        email: signEmail.trim().toLowerCase(), password: signPassword,
      });
      const { token, customer } = res.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customer));
      window.dispatchEvent(new Event('customer-auth-updated'));
      onClose();
      toast.success(`Welcome back, ${customer.name}!`, {
        style: { background: '#16a34a', color: '#fff', fontWeight: '600', border: 'none' },
        duration: 3000,
      });
      setTimeout(onAuthComplete, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  // ── Google OTP verify ─────────────────────────────────────────────────────
  const handleVerifyGoogleOtp = async (e) => {
    e.preventDefault();
    if (googleOtp.length !== 6) { setGoogleOtpError('Enter the 6-digit code'); return; }
    setGoogleOtpError(''); setLoading(true);
    try {
      const res = await api.post('/customer-auth/google/otp-verify', {
        verificationToken, otp: googleOtp,
      });
      const { token, customer } = res.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customer));
      window.dispatchEvent(new Event('customer-auth-updated'));
      onClose();
      toast.success(`Welcome, ${customer.name}!`, {
        style: { background: '#16a34a', color: '#fff', fontWeight: '600', border: 'none' },
        duration: 3000,
      });
      setTimeout(onAuthComplete, 300);
    } catch (err) {
      setGoogleOtpError(err.response?.data?.message || 'Invalid code.');
    } finally { setLoading(false); }
  };

  const handleResendGoogleOtp = async () => {
    if (googleCountdown > 0 || resendGoogleLoading) return;
    setResendGoogleLoading(true); setGoogleOtpError('');
    try {
      await api.post('/customer-auth/google/resend-otp', { verificationToken });
      startTimer(60, setGoogleCountdown, googleTimerRef);
      toast.success('New code sent!');
    } catch (err) {
      setGoogleOtpError(err.response?.data?.message || 'Failed to resend.');
    } finally { setResendGoogleLoading(false); }
  };

  const goSignup = () => { setStep(STEP_SIGNUP); setError(''); };
  const goSignin = () => { setStep(STEP_SIGNIN); setError(''); };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          initial={{ opacity: 0, scale: 0.93, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.96,  y: -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
            <X className="h-5 w-5" />
          </button>

          {/* ── SIGN UP ──────────────────────────────────────────────────── */}
          {step === STEP_SIGNUP && (
            <div className="px-6 pt-7 pb-6">
              <h2 className="text-[22px] font-bold text-gray-900">Create an account</h2>
              <p className="mt-1 text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={goSignin} className="font-bold text-gray-900 hover:underline">Sign In</button>
              </p>

              {error && <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <form onSubmit={handleSignUp} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Full Name</label>
                  <TextField icon={User} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email Address</label>
                  <TextField icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
                  <TextField icon={Lock} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60 mt-1"
                >
                  {loading ? 'Sending code…' : 'Sign Up'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-2.5">
                {/* Google */}
                <div className="flex justify-center min-h-[42px] items-center">
                  {googleLoading ? (
                    <p className="text-xs text-gray-400">Connecting to Google…</p>
                  ) : GOOGLE_CLIENT_ID ? (
                    <div ref={gBtnSignup} />
                  ) : (
                    <button type="button" disabled className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 bg-white opacity-60">
                      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.3 8.9 3.4l6.6-6.6C35.4 2.5 30 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.7 6C12.4 13.2 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/><path fill="#FBBC05" d="M10.3 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.7-4.7l-7.7-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.7-6z"/><path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.5 2.2-7.2 2.2-6.3 0-11.6-3.7-13.7-9.2l-7.7 6C6.5 42.6 14.6 48 24 48z"/></svg>
                      Sign Up With Google
                    </button>
                  )}
                </div>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => toast.info('Facebook Sign-In coming soon!')}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#1565d8] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
                  Sign Up With Facebook
                </button>
              </div>
            </div>
          )}

          {/* ── OTP VERIFY ───────────────────────────────────────────────── */}
          {step === STEP_VERIFY && (
            <div className="px-6 pt-7 pb-6">
              <button onClick={goSignup} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 text-center">Verify your email</h2>
              <p className="mt-1 text-xs text-gray-500 text-center">
                We sent a 6-digit code to <span className="font-semibold text-gray-700">{maskedEmail}</span>
              </p>

              {error && <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}

              <form onSubmit={handleVerify} className="mt-5">
                {/* 6-box OTP input */}
                <div className="flex gap-2 mb-5">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ''}
                      autoFocus={i === 0}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '');
                        const arr = otp.split('');
                        arr[i] = v;
                        setOtp(arr.join('').slice(0, 6));
                        if (v && i < 5) e.target.parentElement.children[i + 1]?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otp[i] && i > 0)
                          e.target.parentElement.children[i - 1]?.focus();
                      }}
                      onPaste={e => {
                        e.preventDefault();
                        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        setOtp(digits);
                      }}
                      className="flex-1 min-w-0 border-2 border-gray-200 rounded-xl py-3 text-center text-xl font-bold text-gray-900 outline-none focus:border-purple-600 transition-colors"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? 'Verifying…' : 'Verify & Create Account'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-4">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span>Resend in <span className="font-semibold text-gray-700">00:{String(countdown).padStart(2,'0')}</span></span>
                ) : (
                  <button onClick={handleResend} disabled={resendLoading} className="font-semibold text-purple-600 hover:underline disabled:opacity-60">
                    {resendLoading ? 'Sending…' : 'Resend Code'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* ── SUCCESS ──────────────────────────────────────────────────── */}
          {step === STEP_SUCCESS && (
            <div className="px-6 pt-8 pb-7 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900">Account Created!</h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Your account has been created successfully! Your email address is verified. Please sign in to continue.
              </p>
              <button
                onClick={() => { setSignEmail(email); setStep(STEP_SIGNIN); setError(''); }}
                className="mt-6 w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          {/* ── SIGN IN ──────────────────────────────────────────────────── */}
          {step === STEP_SIGNIN && (
            <div className="px-6 pt-7 pb-6">
              <h2 className="text-[22px] font-bold text-gray-900">Sign In</h2>
              <p className="mt-1 text-sm text-gray-500">
                Don't have an account?{' '}
                <button onClick={goSignup} className="font-bold text-gray-900 hover:underline">Sign Up</button>
              </p>

              {error && <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <form onSubmit={handleSignIn} className="mt-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email Address</label>
                  <TextField icon={Mail} type="email" placeholder="you@example.com" value={signEmail} onChange={e => setSignEmail(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
                  <TextField icon={Lock} type="password" placeholder="Your password" value={signPassword} onChange={e => setSignPassword(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <a href="/forgot-password" className="text-xs text-purple-600 hover:underline">Forgot Password?</a>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-center min-h-[42px] items-center">
                  {googleLoading ? (
                    <p className="text-xs text-gray-400">Connecting to Google…</p>
                  ) : GOOGLE_CLIENT_ID ? (
                    <div ref={gBtnSignin} />
                  ) : (
                    <button type="button" disabled className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 bg-white opacity-60">
                      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.5 1.3 8.9 3.4l6.6-6.6C35.4 2.5 30 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.7 6C12.4 13.2 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/><path fill="#FBBC05" d="M10.3 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.7-4.7l-7.7-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.7-6z"/><path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.5 2.2-7.2 2.2-6.3 0-11.6-3.7-13.7-9.2l-7.7 6C6.5 42.6 14.6 48 24 48z"/></svg>
                      Sign In With Google
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Facebook Sign-In coming soon!')}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#1565d8] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
                  Sign In With Facebook
                </button>
              </div>
            </div>
          )}

          {/* ── GOOGLE OTP ───────────────────────────────────────────────── */}
          {step === STEP_GOOGLE_OTP && (
            <form onSubmit={handleVerifyGoogleOtp} className="px-6 pt-7 pb-6">
              <button type="button" onClick={goSignup} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h2 className="text-[20px] font-bold text-gray-900 text-center">Email Verification</h2>
              <p className="mt-1 text-xs text-gray-500 text-center">
                A 6-digit code was sent to <span className="font-semibold text-gray-700">{maskedEmail}</span>
              </p>

              {googleOtpError && <p className="mt-3 text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">{googleOtpError}</p>}

              <div className="flex gap-2 my-5">
                {[0,1,2,3,4,5].map(i => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={googleOtp[i] || ''}
                    autoFocus={i === 0}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      const arr = googleOtp.split('');
                      arr[i] = v;
                      setGoogleOtp(arr.join('').slice(0, 6));
                      if (v && i < 5) e.target.parentElement.children[i + 1]?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !googleOtp[i] && i > 0)
                        e.target.parentElement.children[i - 1]?.focus();
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      setGoogleOtp(e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6));
                    }}
                    className="flex-1 min-w-0 border-2 border-gray-200 rounded-xl py-3 text-center text-xl font-bold text-gray-900 outline-none focus:border-purple-600 transition-colors"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || googleOtp.length !== 6}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Didn't receive the code?{' '}
                {googleCountdown > 0 ? (
                  <span>Resend in <span className="font-semibold text-gray-700">00:{String(googleCountdown).padStart(2,'0')}</span></span>
                ) : (
                  <button type="button" onClick={handleResendGoogleOtp} disabled={resendGoogleLoading} className="font-semibold text-purple-600 hover:underline disabled:opacity-60">
                    {resendGoogleLoading ? 'Sending…' : 'Resend Code'}
                  </button>
                )}
              </p>
            </form>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CheckoutAuthModal;
