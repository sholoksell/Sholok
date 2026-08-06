import { useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function VendorStore() {
  const { vendor, token, updateVendor } = useVendorAuth();
  const [form, setForm] = useState({
    store_name: vendor?.storeName || '',
    store_description: vendor?.storeDescription || '',
    store_logo: vendor?.storeLogo || '',
    store_banner: vendor?.storeBanner || '',
    store_policies: '',
    phone: vendor?.phone || '',
    district: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const res = await fetch('/admin-api/vendor-auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { updateVendor(data); setSuccess(true); }
    setSaving(false);
  };

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Store Profile</h1>

      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">Store profile updated successfully.</div>}

      {vendor?.storeBanner && (
        <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
          <img src={vendor.storeBanner} alt="Banner" className="w-full h-full object-cover" />
          {vendor.storeLogo && (
            <div className="absolute bottom-3 left-4">
              <img src={vendor.storeLogo} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white object-cover shadow" />
            </div>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Store Name</Label><Input value={form.store_name} onChange={e => f('store_name', e.target.value)} className="mt-1" /></div>
          <div><Label>Store Description</Label><Textarea value={form.store_description} onChange={(e: any) => f('store_description', e.target.value)} className="mt-1" rows={3} /></div>
          <div><Label>Store Policies</Label><Textarea value={form.store_policies} onChange={(e: any) => f('store_policies', e.target.value)} className="mt-1" rows={3} placeholder="Return policy, shipping terms, etc." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Logo URL</Label><Input value={form.store_logo} onChange={e => f('store_logo', e.target.value)} className="mt-1" placeholder="https://…" /></div>
            <div><Label>Banner URL</Label><Input value={form.store_banner} onChange={e => f('store_banner', e.target.value)} className="mt-1" placeholder="https://…" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Contact & Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Phone</Label><Input value={form.phone} onChange={e => f('phone', e.target.value)} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>District</Label><Input value={form.district} onChange={e => f('district', e.target.value)} className="mt-1" /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => f('address', e.target.value)} className="mt-1" /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 px-8">{saving ? 'Saving…' : 'Save Changes'}</Button>
      </div>
    </div>
  );
}
