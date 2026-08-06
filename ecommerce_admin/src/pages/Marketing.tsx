import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { marketingApi, Coupon, Banner, MarketingStats, FlashSale, EmailCampaign } from '@/services/marketingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Ticket, Image, Plus, Pencil, Trash2, Tag, Megaphone, BarChart3, Zap, Mail, Package } from 'lucide-react';
import api from '@/lib/axios';

export default function Marketing() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'coupons' | 'banners' | 'flash-sales' | 'campaigns'>('coupons');
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Coupon form
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discountType: 'percentage' as Coupon['discountType'], discountValue: 0, minPurchaseAmount: 0, maxDiscountAmount: 0, startDate: '', endDate: '', usageLimit: 0, usagePerCustomer: 1, isActive: true });

  // Banner form
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({ title: '', description: '', image: '', link: '', placement: 'homepage_slider' as Banner['placement'], isActive: true, priority: 0 });

  // Flash Sale form
  const [flashDialogOpen, setFlashDialogOpen] = useState(false);
  const [editingFlash, setEditingFlash] = useState<FlashSale | null>(null);
  const [flashForm, setFlashForm] = useState({ title: '', discountType: 'percentage' as 'percentage' | 'fixed', discountValue: 0, startDate: '', endDate: '', badge: '', isActive: true });

  // Flash Sale — Manage Products
  const [flashProductsDialogOpen, setFlashProductsDialogOpen] = useState(false);
  const [managingFlash, setManagingFlash] = useState<FlashSale | null>(null);
  const [flashProductsLoading, setFlashProductsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [savingProducts, setSavingProducts] = useState(false);

  // Campaign form
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({ title: '', subject: '', body: '', audience: 'all', status: 'draft' as EmailCampaign['status'], scheduledAt: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsData, couponsData, bannersData, flashData, campaignData] = await Promise.all([
        marketingApi.getStats(), marketingApi.getCoupons(), marketingApi.getBanners(),
        marketingApi.getFlashSales(), marketingApi.getEmailCampaigns(),
      ]);
      setStats(statsData);
      setCoupons(couponsData);
      setBanners(bannersData);
      setFlashSales(flashData);
      setCampaigns(campaignData);
    } catch { toast.error('Failed to load marketing data'); }
    finally { setLoading(false); }
  };

  // Flash Sale handlers
  const openNewFlash = () => {
    setEditingFlash(null);
    setFlashForm({ title: '', discountType: 'percentage', discountValue: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', badge: '', isActive: true });
    setFlashDialogOpen(true);
  };
  const openEditFlash = (f: FlashSale) => {
    setEditingFlash(f);
    setFlashForm({ title: f.title, discountType: f.discountType, discountValue: f.discountValue, startDate: f.startDate?.split('T')[0] || '', endDate: f.endDate?.split('T')[0] || '', badge: f.badge || '', isActive: f.isActive });
    setFlashDialogOpen(true);
  };
  const handleSaveFlash = async () => {
    try {
      if (editingFlash) { await marketingApi.updateFlashSale(editingFlash._id, flashForm); toast.success('Flash sale updated'); }
      else { await marketingApi.createFlashSale(flashForm); toast.success('Flash sale created'); }
      setFlashDialogOpen(false); fetchAll();
    } catch { toast.error('Failed to save flash sale'); }
  };
  const handleDeleteFlash = async (id: string) => {
    if (!confirm('Delete this flash sale?')) return;
    try { await marketingApi.deleteFlashSale(id); toast.success('Deleted'); fetchAll(); } catch { toast.error('Failed'); }
  };

  // Flash Sale — Manage Products handlers
  const openManageProducts = async (f: FlashSale) => {
    setManagingFlash(f);
    setFlashProductsDialogOpen(true);
    setFlashProductsLoading(true);
    setProductSearch('');
    setSelectedProductIds([]);
    try {
      const [currentRes, allRes] = await Promise.all([
        api.get(`/marketing/flash-sales/${f._id}/products`),
        api.get('/products?limit=300'),
      ]);
      const currentProds: any[] = Array.isArray(currentRes.data)
        ? currentRes.data
        : (currentRes.data.products || []);
      setSelectedProductIds(currentProds.map((p: any) => Number(p.id || p._id)));
      const allProds: any[] = Array.isArray(allRes.data)
        ? allRes.data
        : (allRes.data.products || allRes.data.data || []);
      setAllProducts(allProds.map((p: any) => ({ id: Number(p._id || p.id), name: p.name })));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setFlashProductsLoading(false);
    }
  };

  const toggleProduct = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSaveFlashProducts = async () => {
    if (!managingFlash) return;
    setSavingProducts(true);
    try {
      await api.post(`/marketing/flash-sales/${managingFlash._id}/products`, {
        productIds: selectedProductIds,
      });
      toast.success('Products saved');
      setFlashProductsDialogOpen(false);
    } catch {
      toast.error('Failed to save products');
    } finally {
      setSavingProducts(false);
    }
  };

  // Campaign handlers
  const openNewCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({ title: '', subject: '', body: '', audience: 'all', status: 'draft', scheduledAt: '' });
    setCampaignDialogOpen(true);
  };
  const openEditCampaign = (c: EmailCampaign) => {
    setEditingCampaign(c);
    setCampaignForm({ title: c.title, subject: c.subject, body: c.body, audience: c.audience, status: c.status, scheduledAt: c.scheduledAt?.split('T')[0] || '' });
    setCampaignDialogOpen(true);
  };
  const handleSaveCampaign = async () => {
    try {
      if (editingCampaign) { await marketingApi.updateEmailCampaign(editingCampaign._id, campaignForm); toast.success('Campaign updated'); }
      else { await marketingApi.createEmailCampaign(campaignForm); toast.success('Campaign created'); }
      setCampaignDialogOpen(false); fetchAll();
    } catch { toast.error('Failed to save campaign'); }
  };
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    try { await marketingApi.deleteEmailCampaign(id); toast.success('Deleted'); fetchAll(); } catch { toast.error('Failed'); }
  };

  // Coupon handlers
  const openNewCoupon = () => {
    setEditingCoupon(null);
    setCouponForm({ code: '', description: '', discountType: 'percentage', discountValue: 0, minPurchaseAmount: 0, maxDiscountAmount: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', usageLimit: 0, usagePerCustomer: 1, isActive: true });
    setCouponDialogOpen(true);
  };

  const openEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({ code: c.code, description: c.description, discountType: c.discountType, discountValue: c.discountValue, minPurchaseAmount: c.minPurchaseAmount, maxDiscountAmount: c.maxDiscountAmount || 0, startDate: c.startDate?.split('T')[0] || '', endDate: c.endDate?.split('T')[0] || '', usageLimit: c.usageLimit || 0, usagePerCustomer: c.usagePerCustomer, isActive: c.isActive });
    setCouponDialogOpen(true);
  };

  const handleSaveCoupon = async () => {
    try {
      const data = { ...couponForm, usageLimit: couponForm.usageLimit || null };
      if (editingCoupon) { await marketingApi.updateCoupon(editingCoupon._id, data); toast.success('Coupon updated'); }
      else { await marketingApi.createCoupon(data); toast.success('Coupon created'); }
      setCouponDialogOpen(false);
      fetchAll();
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to save coupon'); }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try { await marketingApi.deleteCoupon(id); toast.success('Coupon deleted'); fetchAll(); } catch { toast.error('Failed to delete'); }
  };

  // Banner handlers
  const openNewBanner = () => {
    setEditingBanner(null);
    setBannerForm({ title: '', description: '', image: '', link: '', placement: 'homepage_slider', isActive: true, priority: 0 });
    setBannerDialogOpen(true);
  };

  const openEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({ title: b.title, description: b.description || '', image: b.image, link: b.link || '', placement: b.placement, isActive: b.isActive, priority: b.priority });
    setBannerDialogOpen(true);
  };

  const handleSaveBanner = async () => {
    try {
      if (editingBanner) { await marketingApi.updateBanner(editingBanner._id, bannerForm); toast.success('Banner updated'); }
      else { await marketingApi.createBanner(bannerForm); toast.success('Banner created'); }
      setBannerDialogOpen(false);
      fetchAll();
    } catch { toast.error('Failed to save banner'); }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { await marketingApi.deleteBanner(id); toast.success('Banner deleted'); fetchAll(); } catch { toast.error('Failed to delete'); }
  };

  const discountTypeLabels: Record<string, string> = { percentage: 'Percentage', fixed: 'Fixed Amount', free_delivery: 'Free Delivery' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('marketingPromotion')}</h1>
        <p className="text-muted-foreground">{t('manageCouponsDesc')}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Ticket className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('activeCoupons')}</p><p className="text-2xl font-bold">{stats.activeCoupons}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">{t('totalRedemptions')}</p><p className="text-2xl font-bold">{stats.totalRedemptions}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Image className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">{t('activeBanners')}</p><p className="text-2xl font-bold">{stats.activeBanners}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><Megaphone className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">{t('totalCoupons')}</p><p className="text-2xl font-bold">{stats.totalCoupons}</p></div></CardContent></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'coupons' ? 'default' : 'outline'} onClick={() => setTab('coupons')}><Ticket className="w-4 h-4 mr-2" />{t('coupons')}</Button>
        <Button variant={tab === 'banners' ? 'default' : 'outline'} onClick={() => setTab('banners')}><Image className="w-4 h-4 mr-2" />{t('banners')}</Button>
        <Button variant={tab === 'flash-sales' ? 'default' : 'outline'} onClick={() => setTab('flash-sales')}><Zap className="w-4 h-4 mr-2" />{t('flashSales')}</Button>
        <Button variant={tab === 'campaigns' ? 'default' : 'outline'} onClick={() => setTab('campaigns')}><Mail className="w-4 h-4 mr-2" />{t('emailCampaigns')}</Button>
      </div>

      {/* Coupons Tab */}
      {tab === 'coupons' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('coupons')}</CardTitle><Button onClick={openNewCoupon}><Plus className="w-4 h-4 mr-2" />{t('addCoupon')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('code')}</TableHead><TableHead>{t('type')}</TableHead><TableHead>{t('value')}</TableHead><TableHead>{t('minPurchase')}</TableHead><TableHead>{t('used')}</TableHead><TableHead>{t('expires')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {coupons.map(c => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell>{discountTypeLabels[c.discountType]}</TableCell>
                    <TableCell>{c.discountType === 'percentage' ? `${c.discountValue}%` : c.discountType === 'free_delivery' ? t('freeDelivery') : `৳${c.discountValue}`}</TableCell>
                    <TableCell>{c.minPurchaseAmount > 0 ? `৳${c.minPurchaseAmount}` : '—'}</TableCell>
                    <TableCell>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</TableCell>
                    <TableCell>{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><Badge className={c.isActive && new Date(c.endDate) >= new Date() ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{c.isActive && new Date(c.endDate) >= new Date() ? t('active') : t('expired')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditCoupon(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(c._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {coupons.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">{t('noCouponsYet')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Banners Tab */}
      {tab === 'banners' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('banners')}</CardTitle><Button onClick={openNewBanner}><Plus className="w-4 h-4 mr-2" />{t('addBanner')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('image')}</TableHead><TableHead>{t('title')}</TableHead><TableHead>{t('placement')}</TableHead><TableHead>{t('priority')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {banners.map(b => (
                  <TableRow key={b._id}>
                    <TableCell>{b.image ? <img src={b.image} alt={b.title} className="w-20 h-10 rounded object-cover" /> : '—'}</TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell className="capitalize">{b.placement.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{b.priority}</TableCell>
                    <TableCell><Badge className={b.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{b.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditBanner(b)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(b._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noBannersYet')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Coupon Dialog */}
      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCoupon ? t('editCoupon') : t('createCoupon')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('couponCode')}</label><Input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" /></div>
            <div><label className="text-sm font-medium">{t('description')}</label><Input value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('discountType')}</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value as Coupon['discountType']})}>
                  <option value="percentage">{t('percentage')}</option><option value="fixed">{t('fixedAmount')}</option><option value="free_delivery">{t('freeDelivery')}</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">{t('discountValue')}</label><Input type="number" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('minPurchaseLbl')}</label><Input type="number" value={couponForm.minPurchaseAmount} onChange={e => setCouponForm({...couponForm, minPurchaseAmount: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">{t('maxDiscount')}</label><Input type="number" value={couponForm.maxDiscountAmount} onChange={e => setCouponForm({...couponForm, maxDiscountAmount: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('startDate')}</label><Input type="date" value={couponForm.startDate} onChange={e => setCouponForm({...couponForm, startDate: e.target.value})} /></div>
              <div><label className="text-sm font-medium">{t('endDate')}</label><Input type="date" value={couponForm.endDate} onChange={e => setCouponForm({...couponForm, endDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('usageLimit')}</label><Input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">{t('perCustomerLimit')}</label><Input type="number" value={couponForm.usagePerCustomer} onChange={e => setCouponForm({...couponForm, usagePerCustomer: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm({...couponForm, isActive: e.target.checked})} /><label className="text-sm">{t('active')}</label></div>
            <Button onClick={handleSaveCoupon} className="w-full">{editingCoupon ? t('updateCoupon') : t('createCoupon')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flash Sales Tab */}
      {tab === 'flash-sales' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('flashSales')}</CardTitle><Button onClick={openNewFlash}><Plus className="w-4 h-4 mr-2" />{t('addFlashSale')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('title')}</TableHead><TableHead>{t('discount')}</TableHead><TableHead>{t('badge')}</TableHead><TableHead>{t('start')}</TableHead><TableHead>{t('end')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {flashSales.map(f => (
                  <TableRow key={f._id}>
                    <TableCell className="font-medium">{f.title}</TableCell>
                    <TableCell>{f.discountType === 'percentage' ? `${f.discountValue}%` : `৳${f.discountValue}`}</TableCell>
                    <TableCell>{f.badge || '—'}</TableCell>
                    <TableCell>{f.startDate ? new Date(f.startDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{f.endDate ? new Date(f.endDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><Badge className={f.isActive && new Date(f.endDate) >= new Date() ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{f.isActive && new Date(f.endDate) >= new Date() ? t('active') : t('ended')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1 items-center"><Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={() => openManageProducts(f)}><Package className="w-3 h-3 mr-1" />{t('products')}</Button><Button variant="ghost" size="icon" onClick={() => openEditFlash(f)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteFlash(f._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {flashSales.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('noFlashSalesYet')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Email Campaigns Tab */}
      {tab === 'campaigns' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('emailCampaigns')}</CardTitle><Button onClick={openNewCampaign}><Plus className="w-4 h-4 mr-2" />{t('newCampaign')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('title')}</TableHead><TableHead>{t('subject')}</TableHead><TableHead>{t('audience')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('sentLabel')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {campaigns.map(c => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell className="capitalize">{c.audience}</TableCell>
                    <TableCell><Badge className={{ draft: 'bg-muted text-muted-foreground', scheduled: 'bg-warning/20 text-warning', sent: 'bg-success/20 text-success', cancelled: 'bg-destructive/20 text-destructive' }[c.status] || ''}>{c.status}</Badge></TableCell>
                    <TableCell>{c.sentCount ?? '—'}</TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditCampaign(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCampaign(c._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {campaigns.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noCampaignsYet')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Flash Sale Dialog */}
      <Dialog open={flashDialogOpen} onOpenChange={setFlashDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingFlash ? t('editFlashSale') : t('createFlashSale')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('title')}</label><Input value={flashForm.title} onChange={e => setFlashForm({...flashForm, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('discountType')}</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={flashForm.discountType} onChange={e => setFlashForm({...flashForm, discountType: e.target.value as 'percentage' | 'fixed'})}>
                  <option value="percentage">{t('percentage')}</option><option value="fixed">{t('fixedAmount')}</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">{t('discountValue')}</label><Input type="number" value={flashForm.discountValue} onChange={e => setFlashForm({...flashForm, discountValue: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('startDate')}</label><Input type="date" value={flashForm.startDate} onChange={e => setFlashForm({...flashForm, startDate: e.target.value})} /></div>
              <div><label className="text-sm font-medium">{t('endDate')}</label><Input type="date" value={flashForm.endDate} onChange={e => setFlashForm({...flashForm, endDate: e.target.value})} /></div>
            </div>
            <div><label className="text-sm font-medium">{t('badgeLabel')}</label><Input value={flashForm.badge} onChange={e => setFlashForm({...flashForm, badge: e.target.value})} placeholder="🔥 FLASH" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={flashForm.isActive} onChange={e => setFlashForm({...flashForm, isActive: e.target.checked})} /><label className="text-sm">{t('active')}</label></div>
            <Button onClick={handleSaveFlash} className="w-full">{editingFlash ? t('update') : t('create')} {t('flashSales')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCampaign ? t('editCampaign') : t('newCampaign')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('title')}</label><Input value={campaignForm.title} onChange={e => setCampaignForm({...campaignForm, title: e.target.value})} /></div>
            <div><label className="text-sm font-medium">{t('subject')}</label><Input value={campaignForm.subject} onChange={e => setCampaignForm({...campaignForm, subject: e.target.value})} /></div>
            <div><label className="text-sm font-medium">{t('description')}</label><textarea className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[100px]" value={campaignForm.body} onChange={e => setCampaignForm({...campaignForm, body: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('audience')}</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={campaignForm.audience} onChange={e => setCampaignForm({...campaignForm, audience: e.target.value})}>
                  <option value="all">{t('allCustomersAudience')}</option><option value="new">{t('newCustomersAudience')}</option><option value="returning">{t('returning')}</option><option value="inactive">{t('inactiveAudience')}</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">{t('status')}</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={campaignForm.status} onChange={e => setCampaignForm({...campaignForm, status: e.target.value as EmailCampaign['status']})}>
                  <option value="draft">{t('draft')}</option><option value="scheduled">{t('scheduled')}</option><option value="sent">{t('sentLabel')}</option><option value="cancelled">{t('cancelled')}</option>
                </select>
              </div>
            </div>
            {campaignForm.status === 'scheduled' && (
              <div><label className="text-sm font-medium">{t('scheduledAt')}</label><Input type="date" value={campaignForm.scheduledAt} onChange={e => setCampaignForm({...campaignForm, scheduledAt: e.target.value})} /></div>
            )}
            <Button onClick={handleSaveCampaign} className="w-full">{editingCampaign ? t('updateCampaign') : t('createCampaign')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flash Sale — Manage Products Dialog */}
      <Dialog open={flashProductsDialogOpen} onOpenChange={setFlashProductsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('manageProducts')} — {managingFlash?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t('searchProductsByName')}
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
            />
            {flashProductsLoading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5 max-h-80 overflow-y-auto border rounded-lg p-2">
                {allProducts.filter(p =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase())
                ).length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-6">{t('noData')}</p>
                ) : (
                  allProducts
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(p => (
                      <label
                        key={p.id}
                        className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm">{p.name}</span>
                      </label>
                    ))
                )}
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              {selectedProductIds.length} {t('productSelected')}
            </div>
            <Button
              onClick={handleSaveFlashProducts}
              disabled={savingProducts || flashProductsLoading}
              className="w-full"
            >
              {savingProducts ? t('saving') : t('saveProducts')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBanner ? t('editBanner') : t('createBanner')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('title')}</label><Input value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} /></div>
            <div><label className="text-sm font-medium">{t('description')}</label><Input value={bannerForm.description} onChange={e => setBannerForm({...bannerForm, description: e.target.value})} /></div>
            <div><label className="text-sm font-medium">{t('imageUrl')}</label><Input value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} placeholder="https://..." /></div>
            <div><label className="text-sm font-medium">{t('linkUrl')}</label><Input value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('placement')}</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={bannerForm.placement} onChange={e => setBannerForm({...bannerForm, placement: e.target.value as Banner['placement']})}>
                  <option value="homepage_top">{t('homepageTop')}</option><option value="homepage_slider">{t('homepageSlider')}</option><option value="sidebar">{t('sidebar')}</option><option value="category">{t('category')}</option><option value="popup">{t('popup')}</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">{t('priority')}</label><Input type="number" value={bannerForm.priority} onChange={e => setBannerForm({...bannerForm, priority: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm({...bannerForm, isActive: e.target.checked})} /><label className="text-sm">{t('active')}</label></div>
            <Button onClick={handleSaveBanner} className="w-full">{editingBanner ? t('updateBanner') : t('createBanner')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
