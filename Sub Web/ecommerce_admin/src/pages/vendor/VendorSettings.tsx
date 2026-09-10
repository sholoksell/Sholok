import { useState, useEffect, useRef } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight, ChevronLeft, User, Building2, Lock, CreditCard,
  TrendingUp, Wallet, MapPin, Truck, Package, FileText,
  Bell, MessageSquare, Bot, Plus, Trash2, Store, Shield,
  CheckCircle, AlertCircle, Eye, EyeOff, ExternalLink
} from 'lucide-react';

type Section =
  | 'seller-profile' | 'business-info' | 'account-settings'
  | 'bank-account' | 'commission' | 'warehouse'
  | 'delivery' | 'invoice' | 'notifications'
  | 'quick-reply' | 'auto-reply';

interface Toast { type: 'success' | 'error'; msg: string }

function useVendorApi(token: string | null) {
  const api = async (path: string, opts?: RequestInit) => {
    const res = await fetch(`/admin-api${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts?.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };
  return api;
}

/* ─── Hub card ─── */
function SettingCard({ icon: Icon, color, title, desc, onClick }: {
  icon: any; color: string; title: string; desc: string; onClick: () => void
}) {
  return (
    <button onClick={onClick} className="w-full text-left group">
      <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 flex-shrink-0" />
      </div>
    </button>
  );
}

/* ─── Section wrapper ─── */
function SectionShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Toast ─── */
function ToastBanner({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${
      toast.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {toast.msg}
    </div>
  );
}

/* ─── Form field helpers ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium text-gray-700">{label}</Label>{children}</div>;
}

function SaveRow({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-3 pt-2">
      <Button onClick={onSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECTIONS
═══════════════════════════════════════════════ */

function SellerProfile({ token, vendor, updateVendor, onBack }: any) {
  const api = useVendorApi(token);
  const [form, setForm] = useState({
    name: vendor?.name || '',
    store_name: vendor?.storeName || '',
    store_description: vendor?.storeDescription || '',
    store_policies: vendor?.storePolicies || '',
    phone: vendor?.phone || '',
    store_logo: vendor?.storeLogo || '',
    store_banner: vendor?.storeBanner || '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('images', file);
    const res = await fetch('/admin-api/vendor/upload/multiple', {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.message || 'Upload failed');
    return d.urls[0];
  };

  const handleImagePick = async (field: 'store_logo' | 'store_banner', file: File) => {
    try {
      const url = await uploadImage(file);
      setForm(f => ({ ...f, [field]: url }));
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
  };

  const save = async () => {
    setSaving(true); setToast(null);
    try {
      const updated = await api('/vendor-auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      updateVendor(updated);
      setToast({ type: 'success', msg: 'Seller profile saved successfully.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <SectionShell title="Seller Profile" onBack={onBack}>
      <ToastBanner toast={toast} />

      {/* Profile info readonly */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
          {(vendor?.storeName || vendor?.name || 'V').charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{vendor?.storeName || vendor?.name}</p>
          <p className="text-xs text-gray-500">{vendor?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={vendor?.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {vendor?.isVerified ? 'Verified' : 'Pending Verification'}
            </Badge>
            <span className="text-xs text-gray-400">ID: {vendor?._id}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Your Name"><Input {...f('name')} /></Field>
          <Field label="Store Name"><Input {...f('store_name')} /></Field>
        </div>
        <Field label="Phone"><Input {...f('phone')} type="tel" /></Field>
        <Field label="Store Description"><Textarea {...f('store_description')} rows={3} /></Field>
        <Field label="Store Policies"><Textarea {...f('store_policies')} rows={2} placeholder="Return policy, shipping info…" /></Field>

        {/* Logo */}
        <Field label="Store Logo URL">
          <div className="flex gap-2">
            <Input {...f('store_logo')} placeholder="https://... or upload below" />
            <Button type="button" variant="outline" size="sm" onClick={() => logoRef.current?.click()}>Upload</Button>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleImagePick('store_logo', e.target.files[0])} />
          {form.store_logo && <img src={form.store_logo} alt="logo" className="mt-2 h-14 w-14 object-cover rounded-lg border" />}
        </Field>

        {/* Banner */}
        <Field label="Store Banner URL">
          <div className="flex gap-2">
            <Input {...f('store_banner')} placeholder="https://... or upload below" />
            <Button type="button" variant="outline" size="sm" onClick={() => bannerRef.current?.click()}>Upload</Button>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleImagePick('store_banner', e.target.files[0])} />
          {form.store_banner && <img src={form.store_banner} alt="banner" className="mt-2 h-20 w-full object-cover rounded-lg border" />}
        </Field>

        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>Store URL:</span>
          <span className="font-mono text-gray-500">sholok.com/shopping/vendor/{vendor?.slug}</span>
        </div>
        <div className="text-xs text-gray-400">Joined: {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</div>
      </div>

      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

function BusinessInfo({ token, vendor, updateVendor, onBack }: any) {
  const api = useVendorApi(token);
  const [form, setForm] = useState({
    business_name: vendor?.businessName || '',
    business_type: vendor?.businessType || '',
    owner_name: vendor?.ownerName || '',
    division: vendor?.division || '',
    district: vendor?.district || '',
    upazila: vendor?.upazila || '',
    address: vendor?.address || '',
    city: vendor?.city || '',
    postal_code: vendor?.postalCode || '',
    country: vendor?.country || 'Bangladesh',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const save = async () => {
    setSaving(true); setToast(null);
    try {
      const updated = await api('/vendor-auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      updateVendor(updated);
      setToast({ type: 'success', msg: 'Business information saved.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <SectionShell title="Business Information" onBack={onBack}>
      <ToastBanner toast={toast} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Business Name"><Input {...f('business_name')} /></Field>
          <Field label="Owner Name"><Input {...f('owner_name')} /></Field>
        </div>
        <Field label="Business Type">
          <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))}>
            <option value="">Select type…</option>
            <option value="individual">Individual / Sole Proprietor</option>
            <option value="partnership">Partnership</option>
            <option value="company">Private Limited Company</option>
            <option value="ngo">NGO / Non-profit</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Address"><Textarea {...f('address')} rows={2} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City"><Input {...f('city')} /></Field>
          <Field label="Upazila"><Input {...f('upazila')} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="District"><Input {...f('district')} /></Field>
          <Field label="Division"><Input {...f('division')} /></Field>
          <Field label="Postal Code"><Input {...f('postal_code')} /></Field>
        </div>
        <Field label="Country"><Input {...f('country')} /></Field>
      </div>
      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

function AccountSettings({ token, vendor, onBack }: any) {
  const api = useVendorApi(token);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showPw, setShowPw] = useState(false);

  const changePw = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setToast({ type: 'error', msg: 'New passwords do not match.' });
    }
    setSaving(true); setToast(null);
    try {
      await api('/vendor-auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      setToast({ type: 'success', msg: 'Password changed successfully.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  return (
    <SectionShell title="Account Settings" onBack={onBack}>
      <ToastBanner toast={toast} />

      <Card>
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Account Information</h3>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-medium">{vendor?.email}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span>
            <Badge className={vendor?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {vendor?.status}
            </Badge>
          </div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Verified</span>
            <span className={vendor?.isVerified ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {vendor?.isVerified ? '✓ Verified' : 'Not verified'}
            </span>
          </div>
          <p className="text-xs text-gray-400">To change your email address, contact Sholok support.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Lock size={15} /> Change Password</h3>
          <Field label="Current Password">
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
          <Field label="New Password"><Input type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} /></Field>
          <Field label="Confirm New Password"><Input type="password" value={pwForm.confirmPassword}
            onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} /></Field>
          <Button onClick={changePw} disabled={saving || !pwForm.currentPassword || !pwForm.newPassword}
            className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {saving ? 'Changing…' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function BankAccount({ token, vendor, updateVendor, onBack }: any) {
  const api = useVendorApi(token);
  const [form, setForm] = useState({
    bank_name: vendor?.bankName || '',
    bank_account: '',
    bank_routing: vendor?.bankRouting || '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const save = async () => {
    if (!form.bank_account) return setToast({ type: 'error', msg: 'Please enter your bank account number to update.' });
    setSaving(true); setToast(null);
    try {
      const updated = await api('/vendor-auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      updateVendor(updated);
      setToast({ type: 'success', msg: 'Bank information saved securely.' });
      setForm(f => ({ ...f, bank_account: '' }));
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <SectionShell title="Bank Account" onBack={onBack}>
      <ToastBanner toast={toast} />
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex gap-2">
        <Shield size={14} className="flex-shrink-0 mt-0.5" />
        <span>Bank details are stored securely. Account numbers are masked in display.</span>
      </div>
      {vendor?.bankAccount && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <p className="text-xs text-gray-500 font-medium">Current Bank Details</p>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Bank</span><span className="font-medium">{vendor.bankName || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Account</span><span className="font-mono font-medium">{vendor.bankAccount}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Routing</span><span className="font-medium">{vendor.bankRouting || '—'}</span></div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-4">
        <Field label="Bank Name"><Input {...f('bank_name')} placeholder="e.g. Dutch-Bangla Bank" /></Field>
        <Field label="Account Number (new)">
          <Input {...f('bank_account')} type="password" placeholder="Enter full account number" autoComplete="off" />
        </Field>
        <Field label="Routing / Branch Code"><Input {...f('bank_routing')} placeholder="e.g. 090268226" /></Field>
      </div>
      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

function Commission({ vendor, onBack }: any) {
  return (
    <SectionShell title="Commission" onBack={onBack}>
      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-700 mb-4">
        Commission rates are set by Sholok admin and cannot be changed by vendors.
      </div>
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="text-center py-6">
            <div className="text-5xl font-bold text-emerald-600">{vendor?.commissionRate ?? 10}%</div>
            <div className="text-sm text-gray-500 mt-2">Your current commission rate</div>
          </div>
          <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
            <p className="font-medium text-gray-700">How commission works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
              <li>Commission is deducted from your sale price on each order.</li>
              <li>Net amount is credited to your wallet after order delivery.</li>
              <li>COD orders are settled after collection and verification.</li>
              <li>Contact Sholok support for commission queries.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function Warehouse({ token, vendor, updateVendor, onBack }: any) {
  const api = useVendorApi(token);
  const [form, setForm] = useState({
    address: vendor?.address || '',
    city: vendor?.city || '',
    upazila: vendor?.upazila || '',
    district: vendor?.district || '',
    division: vendor?.division || '',
    postal_code: vendor?.postalCode || '',
    phone: vendor?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const save = async () => {
    setSaving(true); setToast(null);
    try {
      const updated = await api('/vendor-auth/profile', { method: 'PUT', body: JSON.stringify(form) });
      updateVendor(updated);
      setToast({ type: 'success', msg: 'Warehouse / pickup address saved.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const f = (k: keyof typeof form) => ({ value: form[k], onChange: (e: any) => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <SectionShell title="Warehouse / Pickup Address" onBack={onBack}>
      <ToastBanner toast={toast} />
      <div className="space-y-4">
        <Field label="Street / Pickup Address"><Textarea {...f('address')} rows={2} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City"><Input {...f('city')} /></Field>
          <Field label="Upazila"><Input {...f('upazila')} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="District"><Input {...f('district')} /></Field>
          <Field label="Division"><Input {...f('division')} /></Field>
          <Field label="Postal Code"><Input {...f('postal_code')} /></Field>
        </div>
        <Field label="Contact Phone"><Input {...f('phone')} type="tel" /></Field>
      </div>
      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

function DeliveryInvoice({ token, settings: initSettings, onBack, section }: any) {
  const api = useVendorApi(token);
  const [settings, setSettings] = useState(initSettings || {});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const save = async (payload: object) => {
    setSaving(true); setToast(null);
    try {
      const updated = await api('/vendor/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setSettings(updated);
      setToast({ type: 'success', msg: 'Settings saved.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  if (section === 'delivery') {
    return (
      <SectionShell title="Delivery & Shipping Preferences" onBack={onBack}>
        <ToastBanner toast={toast} />
        <div className="space-y-4">
          <Field label="Handling / Processing Time (days)">
            <Input type="number" min={1} max={30} value={settings.handling_time ?? 1}
              onChange={e => setSettings((s: any) => ({ ...s, handling_time: Number(e.target.value) }))} />
            <p className="text-xs text-gray-400 mt-1">How many days to process an order before dispatch.</p>
          </Field>
          <Field label="Default Shipping Method">
            <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
              value={settings.default_shipping || 'standard'}
              onChange={e => setSettings((s: any) => ({ ...s, default_shipping: e.target.value }))}>
              <option value="standard">Standard Delivery</option>
              <option value="express">Express Delivery</option>
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="pickup">In-store Pickup</option>
            </select>
          </Field>
        </div>
        <SaveRow saving={saving}
          onSave={() => save({ handling_time: settings.handling_time, default_shipping: settings.default_shipping })}
          onCancel={onBack} />
      </SectionShell>
    );
  }

  // Invoice section
  return (
    <SectionShell title="Invoice Configuration" onBack={onBack}>
      <ToastBanner toast={toast} />
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p className="font-medium mb-1">Preview: <span className="font-mono text-emerald-600">{settings.invoice_prefix || 'INV'}-{settings.invoice_start || 1001}</span></p>
          <p className="text-xs text-gray-400">Your invoices will be numbered sequentially starting from this number.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Invoice Prefix">
            <Input value={settings.invoice_prefix || 'INV'} maxLength={10}
              onChange={e => setSettings((s: any) => ({ ...s, invoice_prefix: e.target.value.toUpperCase() }))} />
          </Field>
          <Field label="Starting Number">
            <Input type="number" min={1} value={settings.invoice_start || 1001}
              onChange={e => setSettings((s: any) => ({ ...s, invoice_start: Number(e.target.value) }))} />
          </Field>
        </div>
        <div className="text-xs text-gray-400">Current invoice count: <span className="font-medium">{settings.invoice_current || settings.invoice_start || 1001}</span></div>
      </div>
      <SaveRow saving={saving}
        onSave={() => save({ invoice_prefix: settings.invoice_prefix, invoice_start: settings.invoice_start })}
        onCancel={onBack} />
    </SectionShell>
  );
}

function NotificationSettings({ token, settings: initSettings, onBack }: any) {
  const api = useVendorApi(token);
  const [settings, setSettings] = useState(initSettings || {});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const toggle = (key: string) => setSettings((s: any) => ({ ...s, [key]: !s[key] }));

  const save = async () => {
    setSaving(true); setToast(null);
    try {
      const payload = {
        notif_order: settings.notif_order,
        notif_product: settings.notif_product,
        notif_payment: settings.notif_payment,
        notif_review: settings.notif_review,
        notif_chat: settings.notif_chat,
      };
      const updated = await api('/vendor/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setSettings(updated);
      setToast({ type: 'success', msg: 'Notification preferences saved.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const NotifRow = ({ label, desc, keyName }: { label: string; desc: string; keyName: string }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
      <Switch checked={!!settings[keyName]} onCheckedChange={() => toggle(keyName)} />
    </div>
  );

  return (
    <SectionShell title="Notification Settings" onBack={onBack}>
      <ToastBanner toast={toast} />
      <Card>
        <CardContent className="pt-5">
          <NotifRow label="Order Notifications" desc="New orders, status updates, cancellations" keyName="notif_order" />
          <NotifRow label="Product Notifications" desc="Stock alerts, product approvals, rejections" keyName="notif_product" />
          <NotifRow label="Payment Notifications" desc="Settlements, wallet credits, COD collections" keyName="notif_payment" />
          <NotifRow label="Review Notifications" desc="Customer reviews and ratings on your products" keyName="notif_review" />
          <NotifRow label="Chat / Message Notifications" desc="Customer messages and inquiries" keyName="notif_chat" />
        </CardContent>
      </Card>
      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

function QuickReply({ token, quickReplies: initReplies, onBack }: any) {
  const api = useVendorApi(token);
  const [replies, setReplies] = useState<any[]>(initReplies || []);
  const [form, setForm] = useState({ title: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const add = async () => {
    if (!form.title || !form.message) return setToast({ type: 'error', msg: 'Title and message are required.' });
    setSaving(true); setToast(null);
    try {
      const created = await api('/vendor/quick-replies', { method: 'POST', body: JSON.stringify(form) });
      setReplies(r => [created, ...r]);
      setForm({ title: '', message: '' });
      setToast({ type: 'success', msg: 'Quick reply added.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  const remove = async (id: number) => {
    try {
      await api(`/vendor/quick-replies/${id}`, { method: 'DELETE' });
      setReplies(r => r.filter(x => x.id !== id));
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
  };

  return (
    <SectionShell title="Quick Replies" onBack={onBack}>
      <ToastBanner toast={toast} />
      <Card>
        <CardContent className="pt-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">Add New Quick Reply</p>
          <Field label="Title / Shortcut"><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Shipping Time" /></Field>
          <Field label="Message"><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} placeholder="Type your reply template here…" /></Field>
          <Button onClick={add} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
            <Plus size={14} /> {saving ? 'Adding…' : 'Add Reply'}
          </Button>
        </CardContent>
      </Card>

      {replies.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Saved Replies ({replies.length})</p>
          {replies.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-xl p-3 bg-white flex gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{r.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.message}</p>
              </div>
              <button onClick={() => remove(r.id)} className="text-gray-300 hover:text-red-500 flex-shrink-0 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {replies.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
          No quick replies yet. Add one above.
        </div>
      )}
    </SectionShell>
  );
}

function AutoReply({ token, settings: initSettings, onBack }: any) {
  const api = useVendorApi(token);
  const [settings, setSettings] = useState(initSettings || {});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const save = async () => {
    setSaving(true); setToast(null);
    try {
      const payload = {
        auto_reply_enabled: settings.auto_reply_enabled,
        auto_reply_message: settings.auto_reply_message,
        business_hours_start: settings.business_hours_start,
        business_hours_end: settings.business_hours_end,
      };
      const updated = await api('/vendor/settings', { method: 'PUT', body: JSON.stringify(payload) });
      setSettings(updated);
      setToast({ type: 'success', msg: 'Auto reply settings saved.' });
    } catch (e: any) { setToast({ type: 'error', msg: e.message }); }
    setSaving(false);
  };

  return (
    <SectionShell title="Auto Reply" onBack={onBack}>
      <ToastBanner toast={toast} />
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Enable Auto Reply</p>
              <p className="text-xs text-gray-400">Automatically reply to customer messages</p>
            </div>
            <Switch checked={!!settings.auto_reply_enabled}
              onCheckedChange={v => setSettings((s: any) => ({ ...s, auto_reply_enabled: v }))} />
          </div>

          {settings.auto_reply_enabled && (
            <>
              <Field label="Auto Reply Message">
                <Textarea rows={4}
                  value={settings.auto_reply_message || ''}
                  onChange={e => setSettings((s: any) => ({ ...s, auto_reply_message: e.target.value }))}
                  placeholder="Hi! Thanks for reaching out. We'll get back to you within 24 hours…" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Business Hours Start">
                  <Input type="time" value={settings.business_hours_start || '09:00'}
                    onChange={e => setSettings((s: any) => ({ ...s, business_hours_start: e.target.value }))} />
                </Field>
                <Field label="Business Hours End">
                  <Input type="time" value={settings.business_hours_end || '18:00'}
                    onChange={e => setSettings((s: any) => ({ ...s, business_hours_end: e.target.value }))} />
                </Field>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <SaveRow saving={saving} onSave={save} onCancel={onBack} />
    </SectionShell>
  );
}

/* ═══════════════════════════════════════════════
   MAIN HUB
═══════════════════════════════════════════════ */
export default function VendorSettings() {
  const { vendor, token, updateVendor } = useVendorAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [vsSettings, setVsSettings] = useState<any>(null);
  const [quickReplies, setQuickReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/admin-api/vendor/settings', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.settings) { setVsSettings(d.settings); setQuickReplies(d.quickReplies || []); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-sm text-gray-400 py-8 text-center">Loading settings…</div>;

  /* ─── Active section ─── */
  const sectionProps = { token, vendor, updateVendor, onBack: () => setActiveSection(null) };
  if (activeSection === 'seller-profile') return <SellerProfile {...sectionProps} />;
  if (activeSection === 'business-info') return <BusinessInfo {...sectionProps} />;
  if (activeSection === 'account-settings') return <AccountSettings {...sectionProps} />;
  if (activeSection === 'bank-account') return <BankAccount {...sectionProps} />;
  if (activeSection === 'commission') return <Commission {...sectionProps} />;
  if (activeSection === 'warehouse') return <Warehouse {...sectionProps} />;
  if (activeSection === 'delivery') return <DeliveryInvoice {...sectionProps} settings={vsSettings} section="delivery" />;
  if (activeSection === 'invoice') return <DeliveryInvoice {...sectionProps} settings={vsSettings} section="invoice" />;
  if (activeSection === 'notifications') return <NotificationSettings {...sectionProps} settings={vsSettings} />;
  if (activeSection === 'quick-reply') return <QuickReply {...sectionProps} quickReplies={quickReplies} />;
  if (activeSection === 'auto-reply') return <AutoReply {...sectionProps} settings={vsSettings} />;

  const go = (s: Section) => setActiveSection(s);

  /* ─── Hub ─── */
  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold">
          {(vendor?.storeName || vendor?.name || 'V').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{vendor?.storeName || vendor?.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{vendor?.email}</span>
            <Badge className={vendor?.isVerified ? 'bg-green-100 text-green-700 text-xs' : 'bg-yellow-100 text-yellow-700 text-xs'}>
              {vendor?.isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Seller ID: {vendor?._id} · Store: {vendor?.slug}</p>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Business Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SettingCard icon={Store} color="bg-emerald-500" title="Seller Profile" desc="Store name, logo, banner, description" onClick={() => go('seller-profile')} />
          <SettingCard icon={Building2} color="bg-blue-500" title="Business Information" desc="Business name, type, address" onClick={() => go('business-info')} />
          <SettingCard icon={Lock} color="bg-violet-500" title="Account Settings" desc="Email, password, security" onClick={() => go('account-settings')} />
        </div>
      </div>

      {/* Finance */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Finance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SettingCard icon={CreditCard} color="bg-teal-500" title="Bank Account" desc="Account number, bank, routing" onClick={() => go('bank-account')} />
          <SettingCard icon={TrendingUp} color="bg-orange-500" title="Commission" desc="Your current commission rate" onClick={() => go('commission')} />
          <SettingCard icon={Wallet} color="bg-green-500" title="Wallet & Earnings" desc="Balance, transactions, settlements" onClick={() => navigate('/vendor/wallet')} />
        </div>
      </div>

      {/* Logistics */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Logistics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SettingCard icon={MapPin} color="bg-red-500" title="Warehouse / Address" desc="Pickup address, contact" onClick={() => go('warehouse')} />
          <SettingCard icon={Truck} color="bg-cyan-500" title="Delivery Service" desc="Handling time, shipping method" onClick={() => go('delivery')} />
          <SettingCard icon={FileText} color="bg-indigo-500" title="Invoice Number" desc="Prefix, starting number" onClick={() => go('invoice')} />
        </div>
      </div>

      {/* Chat */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Chat</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SettingCard icon={MessageSquare} color="bg-pink-500" title="Quick Replies" desc={`${quickReplies.length} saved reply templates`} onClick={() => go('quick-reply')} />
          <SettingCard icon={Bot} color="bg-amber-500" title="Auto Reply" desc={vsSettings?.auto_reply_enabled ? 'Enabled' : 'Disabled'} onClick={() => go('auto-reply')} />
        </div>
      </div>

      {/* System */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <SettingCard icon={Bell} color="bg-slate-500" title="Notifications" desc="Order, payment, review alerts" onClick={() => go('notifications')} />
          <SettingCard icon={Package} color="bg-gray-500" title="My Products" desc="Go to product management" onClick={() => navigate('/vendor/products')} />
          <SettingCard icon={ExternalLink} color="bg-emerald-600" title="My Store" desc="View your store on Sholok" onClick={() => window.open(`https://sholok.com/shopping`, '_blank')} />
        </div>
      </div>
    </div>
  );
}
