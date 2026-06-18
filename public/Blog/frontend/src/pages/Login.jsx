import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
            if (!email || !password) { toast.error(t('passwordLabel') + ' / ' + t('emailAddress')); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login - Sholok Blog</title></Helmet>

      <div className="min-h-screen flex">
        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: Math.random() * 100 + 20, height: Math.random() * 100 + 20, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }} />
            ))}
          </div>
          <div className="relative text-center text-white">
            <div className="text-7xl mb-6">✍️</div>
            <h2 className="text-4xl font-heading font-bold mb-4">{t('welcomeBack')}</h2>
            <p className="text-primary-100 text-lg max-w-sm leading-relaxed">
              {t('loginPanelText')}
            </p>
            <div className="mt-8 flex justify-center gap-6 text-center">
              {[['10K+', t('bloggers')], ['50K+', t('posts')], ['100K+', t('readers')]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold">{n}</p>
                  <p className="text-primary-200 text-sm">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-950">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-sm">SB</div>
                <span className="font-heading font-bold text-xl gradient-text">Sholok Blog</span>
              </Link>
              <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">{t('signInToAccount')}</h1>
              <p className="text-gray-400 mt-1">{t('noAccount')} <Link to="/register" className="text-primary-600 hover:underline font-medium">{t('signUpFree')}</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('emailAddress')}</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-12"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('passwordLabel')}</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-12 pr-12"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-base py-3.5 disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('signingIn')}</span>
                ) : (
                  <span className="flex items-center gap-2">{t('signInBtn')} <FiArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              {t('agreeTerms')}{' '}
              <Link to="/" className="text-primary-600 hover:underline">{t('termsOfService')}</Link>
              {t('agreeTermsEnd') ? ' ' + t('agreeTermsEnd') : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
