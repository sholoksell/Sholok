import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const API = '/api/brands';

export default function Brands() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [brands, setBrands] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', name_bn: '', logo: '', banner: '', description: '', website: '', is_active: 1, sort_order: 0 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch(`${API}?limit=200`).then(r => r.json()).then(setBrands);
  };

  useEffect(() => { load(); }, []);

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || (b.nameBn || '').includes(search));

  const openCreate = () => { setEditing(null); setForm({ name: '', name_bn: '', logo: '', banner: '', description: '', website: '', is_active: 1, sort_order: 0 }); setShowForm(true); };
  const openEdit = (b: any) => { setEditing(b); setForm({ name: b.name, name_bn: b.nameBn || '', logo: b.logo || '', banner: b.banner || '', description: b.description || '', website: b.website || '', is_active: b.isActive ? 1 : 0, sort_order: b.sortOrder || 0 }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `${API}/${editing._id}` : API;
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setSaving(false); setShowForm(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand?')) return;
    await fetch(`${API}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{t('brands')}</h1>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus size={16} className="mr-1" /> {t('addBrand')}</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative mb-4 max-w-sm">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
            <Input placeholder={t('searchBrands')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">{t('brandName')}</th>
                <th className="pb-2 font-medium">{t('bengaliLabel')}</th>
                <th className="pb-2 font-medium">{t('products')}</th>
                <th className="pb-2 font-medium">{t('status')}</th>
                <th className="pb-2 font-medium">{t('sortOrder')}</th>
                <th className="pb-2 font-medium">{t('actions')}</th>
              </tr></thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {b.logo ? <img src={b.logo} alt="" className="w-8 h-8 rounded object-contain bg-gray-50 border" /> : <div className="w-8 h-8 rounded bg-gray-100" />}
                        <div>
                          <p className="font-medium">{b.name}</p>
                          {b.website && <a href={b.website} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{b.website}</a>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{b.nameBn || '—'}</td>
                    <td className="py-3">{b.productCount}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.isActive ? t('active') : t('inactive')}</span></td>
                    <td className="py-3">{b.sortOrder}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Edit size={14} /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(b._id)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">{t('noBrandsFound')}</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? t('editBrand') : t('addBrand')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('name')} (English) *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
              <div><Label>{t('nameBnLabel')}</Label><Input value={form.name_bn} onChange={e => setForm(f => ({ ...f, name_bn: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label>{t('logoUrl')}</Label><Input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className="mt-1" placeholder="https://…" /></div>
            <div><Label>{t('bannerUrl')}</Label><Input value={form.banner} onChange={e => setForm(f => ({ ...f, banner: e.target.value }))} className="mt-1" placeholder="https://…" /></div>
            <div><Label>{t('website')}</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="mt-1" placeholder="https://brand.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t('sortOrder')}</Label><Input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} className="mt-1" /></div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={!!form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v ? 1 : 0 }))} />
                <Label>{t('active')}</Label>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>{t('cancel')}</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? t('saving') : t('save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
