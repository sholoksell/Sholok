import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Eye, EyeOff } from 'lucide-react';

const PRIMARY = '#5D0096';
const ACCENT = '#D31710';

export default function VendorLogin() {
  const { login } = useVendorAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/vendor/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f0ff 0%, #fff0f0 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: PRIMARY }}>
            <Store size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: PRIMARY }}>SHOLOK</h1>
          <p className="text-sm text-gray-500 mt-1">Vendor Panel</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="pt-8 pb-8 px-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Sign in to your store</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your vendor credentials to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm p-3 rounded-lg border" style={{ background: '#fff0f0', color: ACCENT, borderColor: '#fecaca' }}>
                  {error}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="vendor@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative mt-1">
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity disabled:opacity-70 mt-2"
                style={{ background: loading ? '#888' : PRIMARY }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
              Not a vendor yet?{' '}
              <a href="https://shopping.sholok.com/vendor/apply" className="font-semibold hover:underline" style={{ color: ACCENT }}>
                Apply now
              </a>
            </div>

            <div className="mt-3 text-center">
              <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">Admin login →</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
