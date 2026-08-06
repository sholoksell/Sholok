import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, Store, Wallet, Eye, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  district: string;
  status: string;
  isVerified: boolean;
  codEnabled: boolean;
  wallet?: { currentBalance: number; pendingSettlement: number; holdAmount: number };
}

const statusColor: Record<string, string> = {
  active: 'bg-success/20 text-success',
  pending: 'bg-warning/20 text-warning',
  inactive: 'bg-muted text-muted-foreground',
  suspended: 'bg-destructive/20 text-destructive',
};

export default function Vendors() {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositVendor, setDepositVendor] = useState<Vendor | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [form, setForm] = useState({ name: '', business_name: '', email: '', phone: '', district: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectVendor, setRejectVendor] = useState<Vendor | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/vendors');
      setVendors(data.vendors || []);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditVendor(null); setForm({ name: '', business_name: '', email: '', phone: '', district: '' }); setDialogOpen(true); };
  const openEdit = (v: Vendor) => { setEditVendor(v); setForm({ name: v.name, business_name: v.businessName || '', email: v.email, phone: v.phone || '', district: v.district || '' }); setDialogOpen(true); };

  const saveVendor = async () => {
    try {
      if (editVendor) {
        await api.put(`/vendors/${editVendor._id}`, form);
        toast.success('Vendor updated');
      } else {
        await api.post('/vendors', form);
        toast.success('Vendor created');
      }
      setDialogOpen(false);
      fetchVendors();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error saving vendor'); }
  };

  const toggleCod = async (v: Vendor) => {
    try {
      await api.put(`/vendors/${v._id}`, { cod_enabled: v.codEnabled ? 0 : 1 });
      toast.success(`COD ${v.codEnabled ? 'disabled' : 'enabled'}`);
      fetchVendors();
    } catch { toast.error('Failed to toggle COD'); }
  };

  const toggleStatus = async (v: Vendor) => {
    const newStatus = v.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/vendors/${v._id}`, { status: newStatus });
      toast.success(`Vendor ${newStatus}`);
      fetchVendors();
    } catch { toast.error('Failed to update status'); }
  };

  const submitDeposit = async () => {
    if (!depositVendor || !depositAmount) return;
    try {
      await api.post(`/vendors/${depositVendor._id}/wallet/deposit`, { amount: Number(depositAmount), note: depositNote });
      toast.success('Deposit recorded');
      setDepositOpen(false);
      setDepositAmount('');
      setDepositNote('');
      fetchVendors();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const approveVendor = async (v: Vendor) => {
    try {
      await api.put(`/vendors/${v._id}`, { status: 'active', is_verified: 1 });
      toast.success(`${v.name} approved`);
      fetchVendors();
    } catch { toast.error('Failed to approve'); }
  };

  const openReject = (v: Vendor) => { setRejectVendor(v); setRejectNote(''); setRejectOpen(true); };

  const submitReject = async () => {
    if (!rejectVendor) return;
    try {
      await api.put(`/vendors/${rejectVendor._id}`, { status: 'rejected' });
      toast.success(`${rejectVendor.name} rejected`);
      setRejectOpen(false);
      fetchVendors();
    } catch { toast.error('Failed to reject'); }
  };

  const filtered = vendors
    .filter(v => statusFilter === 'all' || v.status === statusFilter)
    .filter(v =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()) ||
      v.businessName?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('vendors')}</h1>
          <p className="text-muted-foreground">{t('manageMarketplaceVendors')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('addVendor')}</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Store className="w-8 h-8 text-primary" /><div><p className="text-2xl font-bold">{vendors.length}</p><p className="text-muted-foreground text-sm">{t('totalVendors')}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><CheckCircle className="w-8 h-8 text-green-500" /><div><p className="text-2xl font-bold">{vendors.filter(v => v.status === 'active').length}</p><p className="text-muted-foreground text-sm">{t('active')}</p></div></div></CardContent></Card>
        <Card className={vendors.filter(v => v.status === 'pending').length > 0 ? 'border-yellow-400' : ''}><CardContent className="pt-6"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-2xl font-bold">{vendors.filter(v => v.status === 'pending').length}</p><p className="text-muted-foreground text-sm">{t('pendingApproval')}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Wallet className="w-8 h-8 text-warning" /><div><p className="text-2xl font-bold">{vendors.filter(v => v.codEnabled).length}</p><p className="text-muted-foreground text-sm">{t('codEnabled')}</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('searchVendors')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">{t('all')}</TabsTrigger>
                <TabsTrigger value="pending">{t('pending')}</TabsTrigger>
                <TabsTrigger value="active">{t('active')}</TabsTrigger>
                <TabsTrigger value="inactive">{t('inactive')}</TabsTrigger>
                <TabsTrigger value="suspended">{t('suspended')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{t('location')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('cod')}</TableHead>
                  <TableHead>{t('balance')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(v => (
                  <TableRow key={v._id} className={v.status === 'pending' ? 'bg-yellow-50' : ''}>
                    <TableCell>
                      <div className="font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.businessName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{v.email}</div>
                      <div className="text-xs text-muted-foreground">{v.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm">{v.district || '—'}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[v.status] || 'bg-muted text-muted-foreground'}>
                        {v.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={v.codEnabled} onCheckedChange={() => toggleCod(v)} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">৳{(v.wallet?.currentBalance || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t('pending')}: ৳{(v.wallet?.pendingSettlement || 0).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {v.status === 'pending' ? (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs" onClick={() => approveVendor(v)}>
                              <CheckCircle className="w-3 h-3 mr-1" />{t('approve')}
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => openReject(v)}>
                              <XCircle className="w-3 h-3 mr-1" />{t('reject')}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => openEdit(v)}><Edit className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { setDepositVendor(v); setDepositOpen(true); }}><Wallet className="w-3 h-3" /></Button>
                            <Button size="sm" variant={v.status === 'active' ? 'destructive' : 'default'} className="h-7 px-2 text-xs" onClick={() => toggleStatus(v)}>
                              {v.status === 'active' ? t('deactivate') : t('activate')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noVendorsFound')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editVendor ? t('editVendor') : t('addVendor')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t('vendorName')}</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('businessName')}</label><Input value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('email')} *</label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('phone')}</label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('district')}</label><Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={saveVendor}>{editVendor ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('rejectVendorTitle')} — {rejectVendor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Optionally add a reason for the rejection (the vendor will see this).</p>
            <Textarea placeholder={t('rejectionReason')} value={rejectNote} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectNote(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={submitReject}>{t('rejectVendorTitle')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('recordDeposit')} — {depositVendor?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t('amountBdt')}</label><Input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Note</label><Input value={depositNote} onChange={e => setDepositNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDepositOpen(false)}>{t('cancel')}</Button>
            <Button onClick={submitDeposit}>{t('recordDeposit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
