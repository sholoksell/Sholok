import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [step, setStep] = useState(STEP_EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setIsLoading(true);
    try {
      const res = await api.post('/customer-auth/forgot-password', { email });
      toast.success(res.data.message || 'Verification code sent!');
      setStep(STEP_OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the verification code');
    setIsLoading(true);
    try {
      await api.post('/customer-auth/verify-otp', { email, otp });
      toast.success('Code verified!');
      setStep(STEP_NEW_PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    setIsLoading(true);
    try {
      await api.post('/customer-auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === STEP_EMAIL && 'Forgot Password'}
              {step === STEP_OTP && 'Enter Verification Code'}
              {step === STEP_NEW_PASSWORD && 'Set New Password'}
            </CardTitle>
            <CardDescription>
              {step === STEP_EMAIL && 'Enter your email address and we will send you a verification code'}
              {step === STEP_OTP && `A verification code has been sent to ${email}`}
              {step === STEP_NEW_PASSWORD && 'Create a new password for your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Enter Email */}
            {step === STEP_EMAIL && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            )}

            {/* Step 2: Enter OTP */}
            {step === STEP_OTP && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Verification Code</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    required
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => { setOtp(''); handleSendOTP({ preventDefault: () => {} }); }}
                  >
                    Didn't receive the code? Resend
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === STEP_NEW_PASSWORD && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
