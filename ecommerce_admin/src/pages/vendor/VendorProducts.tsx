import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function VendorProducts() {
  const { token } = useVendorAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: '', regular_price: '', sale_price: '', stock: '', sku: '', product_type: 'non_perishable', status: 'draft', description: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(search && { search }), ...(status && { status }) });
    fetch(`/admin-api/vendor/products?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setProducts(d.products || []); setTotal(d.total || 0); });
  };

  useEffect(() => { load(); }, [page, search, status]);

  const openCreate = () => { setEditing(null); setForm({ name: '', regular_price: '', sale_price: '', stock: '', sku: '', product_type: 'non_perishable', status: 'draft', description: '', thumbnail: '' }); setShowForm(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, regular_price: p.regular_price, sale_price: p.sale_price || '', stock: p.stock, sku: p.sku || '', product_type: p.product_type, status: p.status, description: p.description || '', thumbnail: p.thumbnail || '' }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    const url = editing ? `/admin-api/vendor/products/${editing.id}` : '/admin-api/vendor/products';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Archive this product?')) return;
    await fetch(`/admin-api/vendor/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    load();
  };

  const statusBadge: Record<string, string> = { active: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600', archived: 'bg-red-100 text-red-600' };
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Products</h1>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700"><Plus size={16} className="mr-1" /> Add Product</Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <Input placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No products found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {p.thumbnail ? <img src={p.thumbnail} alt="" className="w-9 h-9 rounded object-cover" /> : <div className="w-9 h-9 bg-gray-100 rounded" />}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <p>৳{Number(p.regular_price).toLocaleString()}</p>
                        {p.sale_price && <p className="text-xs text-emerald-600">Sale: ৳{Number(p.sale_price).toLocaleString()}</p>}
                      </td>
                      <td className="py-3">
                        <span className={p.stock <= 5 ? 'text-red-600 font-medium' : ''}>{p.stock}</span>
                      </td>
                      <td className="py-3 capitalize">{p.product_type?.replace('_', ' ')}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-sm text-gray-500 self-center">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} className="mt-1" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e: any) => setForm((f: any) => ({ ...f, description: e.target.value }))} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Regular Price *</Label><Input type="number" value={form.regular_price} onChange={e => setForm((f: any) => ({ ...f, regular_price: e.target.value }))} className="mt-1" /></div>
              <div><Label>Sale Price</Label><Input type="number" value={form.sale_price} onChange={e => setForm((f: any) => ({ ...f, sale_price: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={e => setForm((f: any) => ({ ...f, stock: e.target.value }))} className="mt-1" /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => setForm((f: any) => ({ ...f, sku: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={form.product_type} onValueChange={v => setForm((f: any) => ({ ...f, product_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="non_perishable">Non-Perishable</SelectItem><SelectItem value="perishable">Perishable</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Thumbnail URL</Label><Input value={form.thumbnail} onChange={e => setForm((f: any) => ({ ...f, thumbnail: e.target.value }))} className="mt-1" placeholder="https://…" /></div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">{saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
