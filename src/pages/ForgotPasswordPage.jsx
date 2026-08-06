import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import api from '../lib/axios';

const STEP_EMAIL = 0;
const STEP_OTP = 1;
const STEP_NEW_PASSWORD = 2;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(STEP_EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error(t('pleaseEnterEmail'));
    setIsLoading(true);
    try {
      const res = await api.post('/customer-auth/forgot-password', { email });
      toast.success(res.data.message || t('codeSent'));
      setStep(STEP_OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToSendCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error(t('pleaseEnterCode'));
    setIsLoading(true);
    try {
      await api.post('/customer-auth/verify-otp', { email, otp });
      toast.success(t('codeVerified'));
      setStep(STEP_NEW_PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message || t('invalidCode'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error(t('passwordTooShort'));
    if (newPassword !== confirmPassword) return toast.error(t('passwordsDoNotMatch'));
    setIsLoading(true);
    try {
      await api.post('/customer-auth/reset-password', { email, otp, newPassword });
      toast.success(t('passwordResetSuccess'));
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || t('failedToResetPassword'));
    } finally {
      setIsLoading(false);
    }
  };

  const titles = [t('forgotPasswordTitle'), t('enterVerificationCode'), t('setNewPassword')];
  const descs = [
    t('forgotPasswordDesc'),
    `${t('codeSent').replace('!', '')} ${email}`,
    t('createNewPassword'),
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{titles[step]}</CardTitle>
            <CardDescription>{descs[step]}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Enter Email */}
            {step === STEP_EMAIL && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('email')}</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('sending') : t('sendVerificationCode')}
                </Button>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {step === STEP_OTP && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('verificationCode')}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('verifying') : t('verifyCode')}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => { setOtp(''); handleSendOTP({ preventDefault: () => {} }); }}
                  >
                    {t('didntReceiveCode')}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === STEP_NEW_PASSWORD && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('newPassword')}</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('confirmPassword')}</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('resetting') : t('resetPassword')}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              {t('rememberPassword')}{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
