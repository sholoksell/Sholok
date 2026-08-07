import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '@/lib/axios';

/* ──────────────────────────── types ──────────────────────────── */

type OfferType = 'bundle' | 'bogo' | 'buy_x_get_y';
type DiscountType = 'percentage' | 'fixed';

interface BundleOffer {
  id: number;
  name: string;
  description?: string;
  offer_type: OfferType;
  buy_product_id?: number;
  get_product_id?: number;
  buy_quantity: number;
  get_quantity: number;
  get_discount_percent: number;
  bundle_products?: { product_id: number; quantity: number }[] | null;
  bundle_price?: number | null;
  discount_type: DiscountType;
  discount_value: number;
  min_cart_value: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  usage_limit: number;
  used_count: number;
  vendor_id?: number | null;
  created_at?: string;
}

/* ──────────────────────────── default form ──────────────────────────── */

const defaultForm = (): Partial<BundleOffer> => ({
  name: '',
  description: '',
  offer_type: 'bogo',
  buy_product_id: undefined,
  get_product_id: undefined,
  buy_quantity: 1,
  get_quantity: 1,
  get_discount_percent: 100,
  bundle_products: null,
  bundle_price: null,
  discount_type: 'percentage',
  discount_value: 0,
  min_cart_value: 0,
  start_date: '',
  end_date: '',
  is_active: true,
  usage_limit: 0,
});

/* ──────────────────────────── badge helpers ──────────────────────────── */

const TYPE_BADGE: Record<OfferType, string> = {
  bundle: 'bg-purple-100 text-purple-700',
  bogo: 'bg-green-100 text-green-700',
  buy_x_get_y: 'bg-blue-100 text-blue-700',
};

const TYPE_LABEL: Record<OfferType, string> = {
  bundle: 'Bundle',
  bogo: 'BOGO',
  buy_x_get_y: 'Buy X Get Y',
};

/* ──────────────────────────── component ──────────────────────────── */

export default function BundleOffers() {
  const { t } = useLanguage();
  const [offers, setOffers] = useState<BundleOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BundleOffer | null>(null);
  const [form, setForm] = useState<Partial<BundleOffer>>(defaultForm());
  const [saving, setSaving] = useState(false);
  // For bundle_products field (JSON textarea)
  const [bundleProductsRaw, setBundleProductsRaw] = useState('');

  /* ── fetch ── */
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bundle-offers/admin');
      setOffers(res.data);
    } catch {
      toast.error('Failed to load bundle offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  /* ── open new ── */
  const openNew = () => {
    setEditing(null);
    setForm(defaultForm());
    setBundleProductsRaw('');
    setDialogOpen(true);
  };

  /* ── open edit ── */
  const openEdit = (offer: BundleOffer) => {
    setEditing(offer);
    setForm({ ...offer });
    setBundleProductsRaw(
      offer.bundle_products ? JSON.stringify(offer.bundle_products, null, 2) : ''
    );
    setDialogOpen(true);
  };

  /* ── save ── */
  const handleSave = async () => {
    if (!form.name?.trim() || !form.offer_type) {
      toast.error('Name and offer type are required');
      return;
    }

    // Parse bundle_products JSON
    let bundleProducts = null;
    if (bundleProductsRaw.trim()) {
      try {
        bundleProducts = JSON.parse(bundleProductsRaw);
      } catch {
        toast.error('Bundle products JSON is invalid');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        bundle_products: bundleProducts,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        bundle_price: form.bundle_price || null,
      };

      if (editing) {
        await api.put(`/bundle-offers/${editing.id}`, payload);
        toast.success('Offer updated');
      } else {
        await api.post('/bundle-offers', payload);
        toast.success('Offer created');
      }
      setDialogOpen(false);
      fetchOffers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this bundle offer?')) return;
    try {
      await api.delete(`/bundle-offers/${id}`);
      toast.success('Deleted');
      fetchOffers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  /* ── field helper ── */
  const setField = (key: keyof BundleOffer, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  /* ── render ── */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold">{t('bundleBogoOffers')}</h1>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          {t('addOffer')}
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t('loading')}</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t('noBundleOffers')}</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('type')}</TableHead>
                <TableHead>{t('products')}</TableHead>
                <TableHead>{t('discount')}</TableHead>
                <TableHead>{t('dates')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('used')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium max-w-[180px]">
                    <div className="truncate" title={offer.name}>{offer.name}</div>
                    {offer.description && (
                      <div className="text-xs text-muted-foreground truncate">{offer.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[offer.offer_type]}`}>
                      {TYPE_LABEL[offer.offer_type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offer.offer_type === 'bundle'
                      ? `${offer.bundle_products?.length ?? 0} products`
                      : `Buy #${offer.buy_product_id ?? '—'} → Get #${offer.get_product_id ?? '—'}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {offer.offer_type === 'bundle' && offer.bundle_price != null
                      ? `৳${offer.bundle_price}`
                      : offer.discount_type === 'percentage'
                        ? `${offer.discount_value}%`
                        : `৳${offer.discount_value}`}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {offer.start_date ?? '—'}<br />{offer.end_date ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={offer.is_active ? 'default' : 'secondary'}>
                      {offer.is_active ? t('active') : t('inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {offer.used_count}
                    {offer.usage_limit > 0 ? ` / ${offer.usage_limit}` : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(offer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(offer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t('editOffer') : t('addBundleOffer')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('name')} *</label>
              <Input value={form.name ?? ''} onChange={e => setField('name', e.target.value)} placeholder="Offer name" />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('description')}</label>
              <Input value={form.description ?? ''} onChange={e => setField('description', e.target.value)} placeholder="Short description" />
            </div>

            {/* Offer Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('offerType')} *</label>
              <select
                value={form.offer_type ?? 'bogo'}
                onChange={e => setField('offer_type', e.target.value as OfferType)}
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="bogo">{t('bogoOption')}</option>
                <option value="buy_x_get_y">{t('buyXGetY')}</option>
                <option value="bundle">{t('bundle')}</option>
              </select>
            </div>

            {/* BOGO / Buy X Get Y fields */}
            {(form.offer_type === 'bogo' || form.offer_type === 'buy_x_get_y') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('buyProductId')}</label>
                    <Input
                      type="number"
                      value={form.buy_product_id ?? ''}
                      onChange={e => setField('buy_product_id', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Product ID"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('buyQty')}</label>
                    <Input
                      type="number"
                      min={1}
                      value={form.buy_quantity ?? 1}
                      onChange={e => setField('buy_quantity', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('getProductId')}</label>
                    <Input
                      type="number"
                      value={form.get_product_id ?? ''}
                      onChange={e => setField('get_product_id', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Product ID"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('getQty')}</label>
                    <Input
                      type="number"
                      min={1}
                      value={form.get_quantity ?? 1}
                      onChange={e => setField('get_quantity', Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('getDiscountPct')}</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    value={form.get_discount_percent ?? 100}
                    onChange={e => setField('get_discount_percent', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* Bundle fields */}
            {form.offer_type === 'bundle' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('bundleProductsJson')}</label>
                  <p className="text-xs text-muted-foreground">Format: <code>[{"{"}"product_id": 1, "quantity": 2{"}"}]</code></p>
                  <textarea
                    rows={4}
                    value={bundleProductsRaw}
                    onChange={e => setBundleProductsRaw(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                    placeholder='[{"product_id": 1, "quantity": 1}]'
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">{t('bundlePrice')}</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.bundle_price ?? ''}
                    onChange={e => setField('bundle_price', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Leave empty to use discount %"
                  />
                </div>
              </>
            )}

            {/* Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('discountType')}</label>
                <select
                  value={form.discount_type ?? 'percentage'}
                  onChange={e => setField('discount_type', e.target.value as DiscountType)}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="percentage">{t('percentage')} (%)</option>
                  <option value="fixed">{t('fixedDiscount')}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('discountValue')}</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.discount_value ?? 0}
                  onChange={e => setField('discount_value', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Min cart value */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('minCartValue')}</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.min_cart_value ?? 0}
                onChange={e => setField('min_cart_value', Number(e.target.value))}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('startDate')}</label>
                <Input
                  type="date"
                  value={form.start_date ?? ''}
                  onChange={e => setField('start_date', e.target.value || null)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{t('endDate')}</label>
                <Input
                  type="date"
                  value={form.end_date ?? ''}
                  onChange={e => setField('end_date', e.target.value || null)}
                />
              </div>
            </div>

            {/* Usage limit */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{t('usageLimit')}</label>
              <Input
                type="number"
                min={0}
                value={form.usage_limit ?? 0}
                onChange={e => setField('usage_limit', Number(e.target.value))}
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={!!form.is_active}
                onChange={e => setField('is_active', e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">{t('active')}</label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('saving') : editing ? t('updateOffer') : t('createOffer')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
