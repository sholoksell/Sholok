import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '@/lib/axios';

const TYPES = [
  { value: 'summer_fest',   label: '☀️ Summer Fest' },
  { value: 'buy_save',      label: '💰 Buy & Save More' },
  { value: 'great_deals',   label: '🔥 Great Deals' },
  { value: 'seasonal',      label: '🍂 Seasonal' },
  { value: 'festival',      label: '🎉 Festival' },
  { value: 'special_event', label: '⭐ Special Event' },
];

const STATUSES = ['draft','scheduled','active','paused','expired'];

const STATUS_COLORS: Record<string, string> = {
  draft: 'secondary', scheduled: 'outline', active: 'default',
  paused: 'secondary', expired: 'destructive',
};

interface Campaign {
  id: number; name: string; type: string; description?: string; image?: string;
  discountType: string; discountValue: number; minPurchase: number;
  couponCode?: string; startDate?: string; endDate?: string; status: string;
  tiers?: { minQty: number; discountType: string; discountValue: number; label?: string }[];
}

interface Product { id: number; name: string; thumbnail?: string; regular_price?: number; }

const emptyForm = () => ({
  name: '', type: 'seasonal', description: '', image: '',
  discountType: 'none', discountValue: 0, minPurchase: 0, maxDiscount: 0,
  maxQuantity: 0, perCustomerLimit: 0, couponCode: '',
  startDate: '', endDate: '', status: 'draft',
  tiers: [] as { minQty: number; discountType: string; discountValue: number; label: string }[],
});

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const [prodDialog, setProdDialog] = useState(false);
  const [managingCampaign, setManagingCampaign] = useState<Campaign | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedPids, setSelectedPids] = useState<number[]>([]);
  const [prodSearch, setProdSearch] = useState('');
  const [savingProds, setSavingProds] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const r = await api.get('/campaigns', { params: typeFilter ? { type: typeFilter } : {} });
      setCampaigns(r.data || []);
    } catch { toast.error('Failed to load campaigns'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, [typeFilter]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setEditing(c);
    setForm({
      name: c.name, type: c.type, description: c.description || '',
      image: c.image || '', discountType: c.discountType || 'none',
      discountValue: c.discountValue || 0, minPurchase: c.minPurchase || 0,
      maxDiscount: 0, maxQuantity: 0, perCustomerLimit: 0,
      couponCode: c.couponCode || '',
      startDate: c.startDate ? c.startDate.slice(0, 16) : '',
      endDate: c.endDate ? c.endDate.slice(0, 16) : '',
      status: c.status,
      tiers: c.tiers || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, tiers: form.tiers };
      if (editing) {
        await api.put(`/campaigns/${editing.id}`, payload);
        toast.success('Campaign updated');
      } else {
        await api.post('/campaigns', payload);
        toast.success('Campaign created');
      }
      setDialogOpen(false);
      fetchCampaigns();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Campaign) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    try {
      await api.delete(`/campaigns/${c.id}`);
      toast.success('Deleted');
      fetchCampaigns();
    } catch { toast.error('Delete failed'); }
  };

  const openManageProds = async (c: Campaign) => {
    setManagingCampaign(c);
    setProdDialog(true);
    setProdSearch('');
    const [allR, existR] = await Promise.all([
      api.get('/products', { params: { limit: 200, status: 'active' } }),
      api.get(`/campaigns/${c.id}/products`),
    ]);
    setAllProducts(allR.data?.products || allR.data || []);
    const existing = existR.data?.products || [];
    setSelectedPids(existing.map((p: Product) => p.id));
  };

  const handleSaveProds = async () => {
    if (!managingCampaign) return;
    setSavingProds(true);
    try {
      await api.post(`/campaigns/${managingCampaign.id}/products`, { productIds: selectedPids });
      toast.success('Products saved');
      setProdDialog(false);
    } catch { toast.error('Save failed'); }
    finally { setSavingProds(false); }
  };

  const addTier = () => {
    setForm(f => ({ ...f, tiers: [...f.tiers, { minQty: 1, discountType: 'percentage', discountValue: 5, label: '' }] }));
  };
  const removeTier = (i: number) => {
    setForm(f => ({ ...f, tiers: f.tiers.filter((_, idx) => idx !== i) }));
  };
  const updateTier = (i: number, key: string, val: any) => {
    setForm(f => ({ ...f, tiers: f.tiers.map((t, idx) => idx === i ? { ...t, [key]: val } : t) }));
  };

  const filteredProds = allProducts.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground text-sm">Manage Summer Fest, Buy & Save, seasonal and festival campaigns</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Plus size={16} /> New Campaign
        </Button>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button size="sm" variant={!typeFilter ? 'default' : 'outline'} onClick={() => setTypeFilter('')}>All</Button>
        {TYPES.map(t => (
          <Button key={t.value} size="sm" variant={typeFilter === t.value ? 'default' : 'outline'} onClick={() => setTypeFilter(t.value)}>
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No campaigns yet</TableCell></TableRow>
              ) : campaigns.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{TYPES.find(t => t.value === c.type)?.label || c.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[c.status] as any || 'secondary'}>{c.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {c.discountType !== 'none'
                      ? `${c.discountType === 'percentage' ? c.discountValue + '%' : '৳' + c.discountValue} off`
                      : c.tiers?.length ? `${c.tiers.length} tiers` : '—'}
                  </TableCell>
                  <TableCell className="text-sm">{c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-sm">{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openManageProds(c)} title="Manage Products">
                        <Package size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(c)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Campaign' : 'New Campaign'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium">Campaign Name *</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Fest 2025" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Start Date/Time</label>
                <Input type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date/Time</label>
                <Input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Discount</SelectItem>
                    <SelectItem value="percentage">Percentage %</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ৳</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.discountType !== 'none' && (
                <div>
                  <label className="text-sm font-medium">Discount Value</label>
                  <Input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: Number(e.target.value) }))} className="mt-1" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Min Purchase (৳)</label>
                <Input type="number" value={form.minPurchase} onChange={e => setForm(f => ({ ...f, minPurchase: Number(e.target.value) }))} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Coupon Code (optional)</label>
                <Input value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value.toUpperCase() }))} placeholder="SUMMER25" className="mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Banner Image URL</label>
                <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Campaign description..." />
              </div>

              {/* Tiers for Buy & Save */}
              {(form.type === 'buy_save') && (
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Quantity Tiers</label>
                    <Button size="sm" variant="outline" onClick={addTier} type="button"><Plus size={12} className="mr-1" />Add Tier</Button>
                  </div>
                  <div className="space-y-2">
                    {form.tiers.map((tier, i) => (
                      <div key={i} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Min Qty</label>
                          <Input type="number" value={tier.minQty} onChange={e => updateTier(i, 'minQty', Number(e.target.value))} className="h-7 text-xs" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Type</label>
                          <Select value={tier.discountType} onValueChange={v => updateTier(i, 'discountType', v)}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">৳</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Value</label>
                          <Input type="number" value={tier.discountValue} onChange={e => updateTier(i, 'discountValue', Number(e.target.value))} className="h-7 text-xs" />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">Label</label>
                          <Input value={tier.label} onChange={e => updateTier(i, 'label', e.target.value)} placeholder="Buy 2+ Save" className="h-7 text-xs" />
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive mt-4" onClick={() => removeTier(i)} type="button">
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                    {form.tiers.length === 0 && (
                      <p className="text-xs text-muted-foreground">No tiers added. Add tiers to enable quantity-based discounts.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Assignment Dialog */}
      <Dialog open={prodDialog} onOpenChange={setProdDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Products — {managingCampaign?.name}</DialogTitle>
          </DialogHeader>
          <Input value={prodSearch} onChange={e => setProdSearch(e.target.value)} placeholder="Search products…" className="mt-2" />
          <div className="space-y-1 mt-2 max-h-80 overflow-y-auto border rounded p-2">
            {filteredProds.map(p => (
              <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 py-1 rounded">
                <input type="checkbox" checked={selectedPids.includes(p.id)}
                  onChange={e => setSelectedPids(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))} />
                <img src={p.thumbnail || '/placeholder.png'} alt="" className="w-8 h-8 object-cover rounded" onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                <span className="text-sm">{p.name}</span>
                {p.regular_price && <span className="text-xs text-muted-foreground ml-auto">৳{p.regular_price}</span>}
              </label>
            ))}
            {filteredProds.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No products found</p>}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">{selectedPids.length} selected</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setProdDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveProds} disabled={savingProds}>{savingProds ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
