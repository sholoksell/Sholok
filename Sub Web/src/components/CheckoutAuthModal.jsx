import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Pencil, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/axios';

const STEP_PHONE = 'phone';
const STEP_OTP   = 'otp';
const STEP_INFO  = 'info';
const STEP_GOOGLE_OTP = 'google_otp';

const SholokBadge = () => (
  <svg viewBox="0 0 200 200" width="72" height="72" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="goldGrad" cx="50%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#f5d97a" />
        <stop offset="50%" stopColor="#c9960c" />
        <stop offset="100%" stopColor="#7a5900" />
      </radialGradient>
      <path id="topArc"   d="M 28,100 A 72,72 0 0,1 172,100" />
      <path id="botArc"   d="M 32,108 A 68,68 0 0,0 168,108" />
    </defs>
    <circle cx="100" cy="100" r="96" fill="url(#goldGrad)" />
    <circle cx="100" cy="100" r="88" fill="#111" />
    <circle cx="100" cy="100" r="88" fill="none" stroke="#c9960c" strokeWidth="3" />
    <circle cx="100" cy="100" r="72" fill="none" stroke="#c9960c" strokeWidth="1.5" />
    <text fontSize="13" fontWeight="800" letterSpacing="4" fill="#c9960c" fontFamily="Arial,sans-serif" textAnchor="middle">
      <textPath href="#topArc" startOffset="50%">SAVE MONEY</textPath>
    </text>
    <text fontSize="13" fontWeight="800" letterSpacing="4" fill="#c9960c" fontFamily="Arial,sans-serif" textAnchor="middle">
      <textPath href="#botArc" startOffset="50%">LIVE BETTER</textPath>
    </text>
    <text x="22"  y="107" fontSize="14" fill="#c9960c" textAnchor="middle">★</text>
    <text x="178" y="107" fontSize="14" fill="#c9960c" textAnchor="middle">★</text>
    <text x="100" y="98"  fontSize="26" fontWeight="900" fill="#c9960c" fontFamily="Arial,sans-serif" textAnchor="middle" letterSpacing="1">SHOLOK</text>
    <rect x="52" y="103" width="96" height="20" rx="3" fill="#333" />
    <text x="100" y="117" fontSize="10" fontWeight="700" fill="#c9960c" fontFamily="Arial,sans-serif" textAnchor="middle" letterSpacing="2">SUPER MARKET</text>
  </svg>
);

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function loadGSI() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const existing = document.getElementById('gsi-client');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject,  { once: true });
      return;
    }
    const s = document.createElement('script');
    s.id  = 'gsi-client';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load Google Sign-In library'));
    document.head.appendChild(s);
  });
}

const CheckoutAuthModal = ({ onClose, onAuthComplete }) => {
  const [step, setStep]         = useState(STEP_PHONE);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Phone flow
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(29);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const timerRef = useRef(null);

  // Google OTP flow
  const [googleOtp, setGoogleOtp]   = useState('');
  const [googleOtpError, setGoogleOtpError] = useState('');
  const [googleLoading, setGoogleLoading]   = useState(false);
  const [googleCountdown, setGoogleCountdown] = useState(60);
  const [resendLoading, setResendLoading]   = useState(false);
  const [googleVerif, setGoogleVerif] = useState({ maskedEmail: '', verificationToken: '' });
  const googleTimerRef = useRef(null);
  const googleBtnRef   = useRef(null);

  // ── Phone flow ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step === STEP_OTP) {
      setCountdown(29);
      timerRef.current = setInterval(() => {
        setCountdown(v => { if (v <= 1) { clearInterval(timerRef.current); return 0; } return v - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handlePhoneLogin = (e) => {
    e.preventDefault();
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setError('');
    setStep(STEP_OTP);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.trim().length < 5) { setOtpError('Please enter the OTP'); return; }
    setOtpError('');
    clearInterval(timerRef.current);
    setStep(STEP_INFO);
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) { setError('First name is required'); return; }
    setError('');
    setLoading(true);
    const name      = `${firstName} ${lastName}`.trim();
    const autoEmail = `${phone.replace(/\D/g, '')}@sholok.app`;
    const autoPwd   = `SholokPwd_${phone.replace(/\D/g, '')}`;
    try {
      const res = await api.post('/customer-auth/register', { name, email: autoEmail, phone, password: autoPwd });
      const { token, customer } = res.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customer));
      window.dispatchEvent(new Event('customer-auth-updated'));
    } catch {
      try {
        const res = await api.post('/customer-auth/login', { email: autoEmail, password: autoPwd });
        const { token, customer } = res.data;
        await api.put('/customer-auth/profile', { name, phone }, { headers: { Authorization: `Bearer ${token}` } });
        localStorage.setItem('customer_token', token);
        localStorage.setItem('customer', JSON.stringify({ ...customer, name }));
        window.dispatchEvent(new Event('customer-auth-updated'));
      } catch {
        const guest = { _id: Date.now(), name, phone, email: autoEmail };
        localStorage.setItem('customer', JSON.stringify(guest));
        window.dispatchEvent(new Event('customer-auth-updated'));
      }
    }
    setLoading(false);
    onClose();
    toast.success('Profile updated successfully', {
      icon: '✓',
      style: { background: '#16a34a', color: '#fff', fontWeight: '600', border: 'none' },
      duration: 3000,
    });
    setTimeout(onAuthComplete, 900);
  };

  // ── Google flow ───────────────────────────────────────────────────────────
  const handleGoogleCredential = useCallback(async (response) => {
    const credential = response?.credential;
    if (!credential) return;
    setGoogleLoading(true);
    setError('');
    try {
      const res = await api.post('/customer-auth/google/verify', { credential });
      setGoogleVerif({ maskedEmail: res.data.maskedEmail, verificationToken: res.data.verificationToken });
      setStep(STEP_GOOGLE_OTP);
      // Start 60-second resend cooldown
      setGoogleCountdown(60);
      clearInterval(googleTimerRef.current);
      googleTimerRef.current = setInterval(() => {
        setGoogleCountdown(v => { if (v <= 1) { clearInterval(googleTimerRef.current); return 0; } return v - 1; });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  // Render Google button when on phone step
  useEffect(() => {
    if (step !== STEP_PHONE || !GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    (async () => {
      try {
        await loadGSI();
        if (cancelled || !googleBtnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          ux_mode: 'popup',
          cancel_on_tap_outside: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: 'standard',
          theme: 'outline',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: '280',
        });
      } catch (e) {
        console.warn('GSI init failed:', e.message);
      }
    })();

    return () => { cancelled = true; };
  }, [step, handleGoogleCredential]);

  useEffect(() => () => clearInterval(googleTimerRef.current), []);

  const handleVerifyGoogleOtp = async (e) => {
    e.preventDefault();
    if (googleOtp.trim().length !== 6) { setGoogleOtpError('Enter the 6-digit code'); return; }
    setGoogleOtpError('');
    setLoading(true);
    try {
      const res = await api.post('/customer-auth/google/otp-verify', {
        verificationToken: googleVerif.verificationToken,
        otp: googleOtp.trim(),
      });
      const { token, customer } = res.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer', JSON.stringify(customer));
      window.dispatchEvent(new Event('customer-auth-updated'));
      onClose();
      toast.success(`Welcome, ${customer.name}!`, {
        icon: '✓',
        style: { background: '#16a34a', color: '#fff', fontWeight: '600', border: 'none' },
        duration: 3000,
      });
      setTimeout(onAuthComplete, 900);
    } catch (err) {
      setGoogleOtpError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendGoogleOtp = async () => {
    if (googleCountdown > 0 || resendLoading) return;
    setResendLoading(true);
    setGoogleOtpError('');
    try {
      await api.post('/customer-auth/google/resend-otp', { verificationToken: googleVerif.verificationToken });
      setGoogleCountdown(60);
      clearInterval(googleTimerRef.current);
      googleTimerRef.current = setInterval(() => {
        setGoogleCountdown(v => { if (v <= 1) { clearInterval(googleTimerRef.current); return 0; } return v - 1; });
      }, 1000);
      toast.success('New OTP sent!');
    } catch (err) {
      setGoogleOtpError(err.response?.data?.message || 'Failed to resend. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const backToPhone = () => {
    clearInterval(googleTimerRef.current);
    setGoogleOtp('');
    setGoogleOtpError('');
    setGoogleVerif({ maskedEmail: '', verificationToken: '' });
    setError('');
    setStep(STEP_PHONE);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.95,  y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
            <X className="h-5 w-5" />
          </button>

          <div className="flex justify-center pt-5 pb-1"><SholokBadge /></div>

          {/* ── PHONE STEP ─────────────────────────────────────────────────── */}
          {step === STEP_PHONE && (
            <form onSubmit={handlePhoneLogin} className="px-6 pb-6 pt-2">
              <h2 className="text-center text-[15px] font-bold text-gray-800 mb-4">
                Sign in to get best online experience
              </h2>
              {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mb-4 focus-within:border-[#E31E24] transition-colors">
                <div className="flex items-center gap-1 px-3 py-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                  <span className="text-base">🇧🇩</span>
                  <span className="text-sm text-gray-600 font-medium">+880</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="1XXXXXXXXX"
                  className="flex-1 px-3 py-3 text-sm outline-none bg-white"
                />
              </div>

              <button type="submit" className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-bold py-3 rounded-lg text-sm transition-colors">
                Login
              </button>

              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or, sign in with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex justify-center min-h-[42px] items-center">
                {googleLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Connecting to Google…
                  </div>
                ) : GOOGLE_CLIENT_ID ? (
                  <div ref={googleBtnRef} />
                ) : (
                  <p className="text-xs text-gray-400 text-center">Google Sign-In not configured</p>
                )}
              </div>
            </form>
          )}

          {/* ── OTP STEP (phone) ───────────────────────────────────────────── */}
          {step === STEP_OTP && (
            <form onSubmit={handleVerifyOtp} className="px-6 pb-6 pt-2">
              <h2 className="text-center text-[16px] font-bold text-gray-800 mb-2">OTP Verification</h2>
              <p className="text-center text-xs text-gray-500 mb-5 leading-relaxed">
                Please enter the OTP sent to{' '}
                <span className="font-semibold text-gray-700">{phone}</span>{' '}
                <button type="button" onClick={() => { clearInterval(timerRef.current); setStep(STEP_PHONE); setOtp(''); setOtpError(''); }} className="inline-flex items-center text-[#E31E24]">
                  <Pencil className="h-3 w-3" />
                </button>
              </p>
              {otpError && <p className="text-xs text-red-500 text-center mb-3">{otpError}</p>}
              <input
                type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="_ _ _ _ _"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-[#E31E24] transition-colors mb-4"
                autoFocus
              />
              <button type="submit" className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-bold py-3 rounded-lg text-sm transition-colors">
                Verify
              </button>
              <p className="text-center text-xs text-gray-400 mt-4">
                Not received your OTP?{' '}
                {countdown > 0 ? (
                  <span>Resend OTP <span className="text-[#E31E24] font-semibold">00:{String(countdown).padStart(2, '0')}</span></span>
                ) : (
                  <button type="button" onClick={() => { setCountdown(29); timerRef.current = setInterval(() => setCountdown(v => { if (v <= 1) { clearInterval(timerRef.current); return 0; } return v - 1; }), 1000); }} className="text-[#E31E24] font-semibold hover:underline">
                    Resend OTP
                  </button>
                )}
              </p>
            </form>
          )}

          {/* ── UPDATE INFO STEP ───────────────────────────────────────────── */}
          {step === STEP_INFO && (
            <form onSubmit={handleUpdateInfo} className="px-6 pb-6 pt-2">
              <h2 className="text-center text-[15px] font-bold text-gray-800 mb-5">Update Info</h2>
              {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
              <div className="flex gap-2 mb-3">
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name *" required className="flex-1 border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#E31E24] transition-colors" />
                <input type="text" value={lastName}  onChange={e => setLastName(e.target.value)}  placeholder="Last Name"    className="flex-1 border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:border-[#E31E24] transition-colors" />
              </div>
              <div className="mb-5">
                <div className="flex items-center border border-gray-100 bg-gray-50 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-1 px-3 py-3 border-r border-gray-200 flex-shrink-0">
                    <span className="text-base">🇧🇩</span>
                    <span className="text-sm text-gray-400 font-medium">+880</span>
                  </div>
                  <span className="px-3 text-sm text-gray-400">{phone}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-60">
                {loading ? 'Updating…' : 'Update'}
              </button>
            </form>
          )}

          {/* ── GOOGLE OTP STEP ────────────────────────────────────────────── */}
          {step === STEP_GOOGLE_OTP && (
            <form onSubmit={handleVerifyGoogleOtp} className="px-6 pb-6 pt-2">
              <h2 className="text-center text-[16px] font-bold text-gray-800 mb-2">Email Verification</h2>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <p className="text-center text-xs text-gray-500 leading-relaxed">
                  A 6-digit code was sent to{' '}
                  <span className="font-semibold text-gray-700">{googleVerif.maskedEmail}</span>
                </p>
                <button type="button" onClick={backToPhone} className="text-[#E31E24] flex-shrink-0">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>

              {googleOtpError && <p className="text-xs text-red-500 text-center mb-3">{googleOtpError}</p>}

              <div className="flex gap-2 mb-4">
                {[0,1,2,3,4,5].map(i => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={googleOtp[i] || ''}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '');
                      const arr = googleOtp.split('');
                      arr[i] = v;
                      setGoogleOtp(arr.join('').slice(0, 6));
                      if (v && i < 5) {
                        const next = e.target.parentElement.children[i + 1];
                        next?.focus();
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !googleOtp[i] && i > 0) {
                        const prev = e.target.parentElement.children[i - 1];
                        prev?.focus();
                      }
                    }}
                    onPaste={e => {
                      e.preventDefault();
                      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                      setGoogleOtp(digits.padEnd(6, '').slice(0, 6));
                    }}
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg py-3 text-center text-xl font-bold outline-none focus:border-[#E31E24] focus:ring-1 focus:ring-[#E31E24] transition-colors"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || googleOtp.length !== 6}
                className="w-full bg-[#E31E24] hover:bg-[#b9151a] text-white font-bold py-3 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                {loading ? 'Verifying…' : 'Verify & Sign In'}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                Didn't receive the code?{' '}
                {googleCountdown > 0 ? (
                  <span>Resend in <span className="text-[#E31E24] font-semibold">00:{String(googleCountdown).padStart(2, '0')}</span></span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendGoogleOtp}
                    disabled={resendLoading}
                    className="text-[#E31E24] font-semibold hover:underline disabled:opacity-60"
                  >
                    {resendLoading ? 'Sending…' : 'Resend Code'}
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
