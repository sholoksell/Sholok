import { useState, useEffect } from 'react';
import { marketingApi, Coupon, Banner, MarketingStats, FlashSale, EmailCampaign } from '@/services/marketingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Ticket, Image, Plus, Pencil, Trash2, Tag, Megaphone, BarChart3, Zap, Mail } from 'lucide-react';

export default function Marketing() {
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
        <h1 className="text-3xl font-bold text-foreground">Marketing & Promotion</h1>
        <p className="text-muted-foreground">Manage coupons, banners and promotional campaigns</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Ticket className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Active Coupons</p><p className="text-2xl font-bold">{stats.activeCoupons}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">Total Redemptions</p><p className="text-2xl font-bold">{stats.totalRedemptions}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Image className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">Active Banners</p><p className="text-2xl font-bold">{stats.activeBanners}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><Megaphone className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">Total Coupons</p><p className="text-2xl font-bold">{stats.totalCoupons}</p></div></CardContent></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'coupons' ? 'default' : 'outline'} onClick={() => setTab('coupons')}><Ticket className="w-4 h-4 mr-2" />Coupons</Button>
        <Button variant={tab === 'banners' ? 'default' : 'outline'} onClick={() => setTab('banners')}><Image className="w-4 h-4 mr-2" />Banners</Button>
        <Button variant={tab === 'flash-sales' ? 'default' : 'outline'} onClick={() => setTab('flash-sales')}><Zap className="w-4 h-4 mr-2" />Flash Sales</Button>
        <Button variant={tab === 'campaigns' ? 'default' : 'outline'} onClick={() => setTab('campaigns')}><Mail className="w-4 h-4 mr-2" />Email Campaigns</Button>
      </div>

      {/* Coupons Tab */}
      {tab === 'coupons' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Coupons</CardTitle><Button onClick={openNewCoupon}><Plus className="w-4 h-4 mr-2" />Add Coupon</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Min Purchase</TableHead><TableHead>Used</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {coupons.map(c => (
                  <TableRow key={c._id}>
                    <TableCell className="font-mono font-bold">{c.code}</TableCell>
                    <TableCell>{discountTypeLabels[c.discountType]}</TableCell>
                    <TableCell>{c.discountType === 'percentage' ? `${c.discountValue}%` : c.discountType === 'free_delivery' ? 'Free' : `৳${c.discountValue}`}</TableCell>
                    <TableCell>{c.minPurchaseAmount > 0 ? `৳${c.minPurchaseAmount}` : '—'}</TableCell>
                    <TableCell>{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</TableCell>
                    <TableCell>{c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><Badge className={c.isActive && new Date(c.endDate) >= new Date() ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{c.isActive && new Date(c.endDate) >= new Date() ? 'Active' : 'Expired'}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditCoupon(c)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteCoupon(c._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {coupons.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No coupons yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Banners Tab */}
      {tab === 'banners' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Banners</CardTitle><Button onClick={openNewBanner}><Plus className="w-4 h-4 mr-2" />Add Banner</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Image</TableHead><TableHead>Title</TableHead><TableHead>Placement</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {banners.map(b => (
                  <TableRow key={b._id}>
                    <TableCell>{b.image ? <img src={b.image} alt={b.title} className="w-20 h-10 rounded object-cover" /> : '—'}</TableCell>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell className="capitalize">{b.placement.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{b.priority}</TableCell>
                    <TableCell><Badge className={b.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditBanner(b)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteBanner(b._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {banners.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No banners yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Coupon Dialog */}
      <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Coupon Code</label><Input value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="e.g. SAVE20" /></div>
            <div><label className="text-sm font-medium">Description</label><Input value={couponForm.description} onChange={e => setCouponForm({...couponForm, description: e.target.value})} placeholder="20% off on first order" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Discount Type</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value as Coupon['discountType']})}>
                  <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_delivery">Free Delivery</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Discount Value</label><Input type="number" value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Min Purchase (৳)</label><Input type="number" value={couponForm.minPurchaseAmount} onChange={e => setCouponForm({...couponForm, minPurchaseAmount: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">Max Discount (৳)</label><Input type="number" value={couponForm.maxDiscountAmount} onChange={e => setCouponForm({...couponForm, maxDiscountAmount: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={couponForm.startDate} onChange={e => setCouponForm({...couponForm, startDate: e.target.value})} /></div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" value={couponForm.endDate} onChange={e => setCouponForm({...couponForm, endDate: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Usage Limit (0 = unlimited)</label><Input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">Per Customer Limit</label><Input type="number" value={couponForm.usagePerCustomer} onChange={e => setCouponForm({...couponForm, usagePerCustomer: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm({...couponForm, isActive: e.target.checked})} /><label className="text-sm">Active</label></div>
            <Button onClick={handleSaveCoupon} className="w-full">{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flash Sales Tab */}
      {tab === 'flash-sales' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Flash Sales</CardTitle><Button onClick={openNewFlash}><Plus className="w-4 h-4 mr-2" />Add Flash Sale</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Discount</TableHead><TableHead>Badge</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {flashSales.map(f => (
                  <TableRow key={f._id}>
                    <TableCell className="font-medium">{f.title}</TableCell>
                    <TableCell>{f.discountType === 'percentage' ? `${f.discountValue}%` : `৳${f.discountValue}`}</TableCell>
                    <TableCell>{f.badge || '—'}</TableCell>
                    <TableCell>{f.startDate ? new Date(f.startDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{f.endDate ? new Date(f.endDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell><Badge className={f.isActive && new Date(f.endDate) >= new Date() ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{f.isActive && new Date(f.endDate) >= new Date() ? 'Active' : 'Ended'}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditFlash(f)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteFlash(f._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {flashSales.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No flash sales yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Email Campaigns Tab */}
      {tab === 'campaigns' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Email Campaigns</CardTitle><Button onClick={openNewCampaign}><Plus className="w-4 h-4 mr-2" />New Campaign</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Subject</TableHead><TableHead>Audience</TableHead><TableHead>Status</TableHead><TableHead>Sent</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
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
                {campaigns.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No campaigns yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Flash Sale Dialog */}
      <Dialog open={flashDialogOpen} onOpenChange={setFlashDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingFlash ? 'Edit Flash Sale' : 'Create Flash Sale'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><Input value={flashForm.title} onChange={e => setFlashForm({...flashForm, title: e.target.value})} placeholder="Summer Flash Sale" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Discount Type</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={flashForm.discountType} onChange={e => setFlashForm({...flashForm, discountType: e.target.value as 'percentage' | 'fixed'})}>
                  <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Discount Value</label><Input type="number" value={flashForm.discountValue} onChange={e => setFlashForm({...flashForm, discountValue: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Start Date</label><Input type="date" value={flashForm.startDate} onChange={e => setFlashForm({...flashForm, startDate: e.target.value})} /></div>
              <div><label className="text-sm font-medium">End Date</label><Input type="date" value={flashForm.endDate} onChange={e => setFlashForm({...flashForm, endDate: e.target.value})} /></div>
            </div>
            <div><label className="text-sm font-medium">Badge Label (optional)</label><Input value={flashForm.badge} onChange={e => setFlashForm({...flashForm, badge: e.target.value})} placeholder="🔥 FLASH" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={flashForm.isActive} onChange={e => setFlashForm({...flashForm, isActive: e.target.checked})} /><label className="text-sm">Active</label></div>
            <Button onClick={handleSaveFlash} className="w-full">{editingFlash ? 'Update' : 'Create'} Flash Sale</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><Input value={campaignForm.title} onChange={e => setCampaignForm({...campaignForm, title: e.target.value})} placeholder="Campaign title" /></div>
            <div><label className="text-sm font-medium">Subject</label><Input value={campaignForm.subject} onChange={e => setCampaignForm({...campaignForm, subject: e.target.value})} placeholder="Email subject line" /></div>
            <div><label className="text-sm font-medium">Body</label><textarea className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm min-h-[100px]" value={campaignForm.body} onChange={e => setCampaignForm({...campaignForm, body: e.target.value})} placeholder="Email body content..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Audience</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={campaignForm.audience} onChange={e => setCampaignForm({...campaignForm, audience: e.target.value})}>
                  <option value="all">All Customers</option><option value="new">New Customers</option><option value="returning">Returning</option><option value="inactive">Inactive</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Status</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={campaignForm.status} onChange={e => setCampaignForm({...campaignForm, status: e.target.value as EmailCampaign['status']})}>
                  <option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="sent">Sent</option><option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {campaignForm.status === 'scheduled' && (
              <div><label className="text-sm font-medium">Scheduled At</label><Input type="date" value={campaignForm.scheduledAt} onChange={e => setCampaignForm({...campaignForm, scheduledAt: e.target.value})} /></div>
            )}
            <Button onClick={handleSaveCampaign} className="w-full">{editingCampaign ? 'Update' : 'Create'} Campaign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Banner Dialog */}
      <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingBanner ? 'Edit Banner' : 'Create Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Title</label><Input value={bannerForm.title} onChange={e => setBannerForm({...bannerForm, title: e.target.value})} placeholder="Banner title" /></div>
            <div><label className="text-sm font-medium">Description</label><Input value={bannerForm.description} onChange={e => setBannerForm({...bannerForm, description: e.target.value})} placeholder="Optional description" /></div>
            <div><label className="text-sm font-medium">Image URL</label><Input value={bannerForm.image} onChange={e => setBannerForm({...bannerForm, image: e.target.value})} placeholder="https://..." /></div>
            <div><label className="text-sm font-medium">Link URL</label><Input value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Placement</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={bannerForm.placement} onChange={e => setBannerForm({...bannerForm, placement: e.target.value as Banner['placement']})}>
                  <option value="homepage_top">Homepage Top</option><option value="homepage_slider">Homepage Slider</option><option value="sidebar">Sidebar</option><option value="category">Category</option><option value="popup">Popup</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Priority</label><Input type="number" value={bannerForm.priority} onChange={e => setBannerForm({...bannerForm, priority: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm({...bannerForm, isActive: e.target.checked})} /><label className="text-sm">Active</label></div>
            <Button onClick={handleSaveBanner} className="w-full">{editingBanner ? 'Update Banner' : 'Create Banner'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
