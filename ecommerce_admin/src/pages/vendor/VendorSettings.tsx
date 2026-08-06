import { useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function VendorSettings() {
  const { vendor, token, updateVendor } = useVendorAuth();
  const [bankForm, setBankForm] = useState({ bank_name: '', bank_account: '', bank_routing: '' });
  const [nameForm, setNameForm] = useState({ name: vendor?.name || '' });
  const [saving, setSaving] = useState<string>('');
  const [success, setSuccess] = useState('');

  const save = async (payload: object, section: string) => {
    setSaving(section);
    setSuccess('');
    const res = await fetch('/admin-api/vendor-auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) { updateVendor(data); setSuccess(`${section} saved.`); }
    setSaving('');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      {success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">{success}</div>}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Your Name</Label><Input value={nameForm.name} onChange={e => setNameForm({ name: e.target.value })} className="mt-1" /></div>
          <div className="text-sm text-gray-500">Email: <span className="font-medium">{vendor?.email}</span> (contact support to change)</div>
          <Button onClick={() => save(nameForm, 'Account')} disabled={saving === 'Account'} className="bg-emerald-600 hover:bg-emerald-700">
            {saving === 'Account' ? 'Saving…' : 'Save Account'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Bank Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Used for settlement payouts. Kept secure.</p>
          <div><Label>Bank Name</Label><Input value={bankForm.bank_name} onChange={e => setBankForm(f => ({ ...f, bank_name: e.target.value }))} className="mt-1" /></div>
          <div><Label>Account Number</Label><Input value={bankForm.bank_account} onChange={e => setBankForm(f => ({ ...f, bank_account: e.target.value }))} className="mt-1" /></div>
          <div><Label>Routing Number</Label><Input value={bankForm.bank_routing} onChange={e => setBankForm(f => ({ ...f, bank_routing: e.target.value }))} className="mt-1" /></div>
          <Button onClick={() => save(bankForm, 'Bank')} disabled={saving === 'Bank'} className="bg-emerald-600 hover:bg-emerald-700">
            {saving === 'Bank' ? 'Saving…' : 'Save Bank Info'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
