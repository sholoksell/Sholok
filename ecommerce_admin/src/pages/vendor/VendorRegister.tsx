import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store } from 'lucide-react';

export default function VendorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', business_name: '', email: '', phone: '', password: '', store_name: '', district: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/admin-api/vendor-auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Application submitted! Our team will review and contact you.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Store size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-800">Become a Vendor</CardTitle>
          <p className="text-sm text-gray-500">Apply to sell on Sholok</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-6">
              <div className="text-emerald-600 text-5xl mb-4">✓</div>
              <p className="text-gray-700 font-medium mb-1">{success}</p>
              <Link to="/vendor/login" className="text-emerald-600 text-sm hover:underline">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Your Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="mt-1" />
                </div>
                <div>
                  <Label>Business Name</Label>
                  <Input value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Store Name *</Label>
                <Input value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>District</Label>
                  <Input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Submitting…' : 'Submit Application'}
              </Button>
              <p className="text-center text-sm text-gray-500">
                Already have an account? <Link to="/vendor/login" className="text-emerald-600 hover:underline">Sign in</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
