import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Wallet, CheckCircle, Clock } from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';

interface CodTx { id: string; shipment_id: number; order_id: number; vendor_id: number; amount: number; status: string; collected_at: string; created_at: string; }
interface Settlement { _id: string; vendorId: number; vendorName: string; periodStart: string; periodEnd: string; totalAmount: number; codAmount: number; platformFee: number; netAmount: number; status: string; paymentMethod: string; paymentRef: string; processedAt: string; createdAt: string; }
interface Vendor { _id: string; name: string; }

const codStatusColor: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  collected: 'bg-success/20 text-success',
  settled: 'bg-muted text-muted-foreground',
};

const settlementStatusColor: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  processed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',
};

export default function CodSettlement() {
  const { t } = useLanguage();
  const [codTxs, setCodTxs] = useState<CodTx[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorFilter, setVendorFilter] = useState('all');

  // New settlement dialog
  const [settlementDialogOpen, setSettlementDialogOpen] = useState(false);
  const [settlementForm, setSettlementForm] = useState({ vendor_id: '', period_start: '', period_end: '', total_amount: '', cod_amount: '', platform_fee: '', notes: '' });

  // Process settlement dialog
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processSettlement, setProcessSettlement] = useState<Settlement | null>(null);
  const [processForm, setProcessForm] = useState({ payment_method: '', payment_ref: '' });

  useEffect(() => { fetchData(); }, [vendorFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (vendorFilter !== 'all') params.vendor_id = vendorFilter;
      const [codRes, srRes, vRes] = await Promise.allSettled([
        api.get('/cod-settlement/cod', { params }),
        api.get('/cod-settlement/settlements', { params }),
        api.get('/vendors', { params: { limit: 100 } }),
      ]);
      if (codRes.status === 'fulfilled') setCodTxs(codRes.value.data.transactions || []);
      if (srRes.status === 'fulfilled') setSettlements(srRes.value.data.settlements || []);
      if (vRes.status === 'fulfilled') setVendors(vRes.value.data.vendors || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const collectCod = async (tx: CodTx) => {
    try {
      await api.put(`/cod-settlement/cod/${tx.id}/collect`);
      toast.success('COD marked as collected');
      fetchData();
    } catch { toast.error('Error'); }
  };

  const createSettlement = async () => {
    try {
      const net = Number(settlementForm.total_amount) - Number(settlementForm.platform_fee || 0);
      await api.post('/cod-settlement/settlements', { ...settlementForm, net_amount: net });
      toast.success('Settlement record created');
      setSettlementDialogOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const processSettlementRecord = async () => {
    if (!processSettlement) return;
    try {
      await api.put(`/cod-settlement/settlements/${processSettlement._id}/process`, processForm);
      toast.success('Settlement processed and wallet updated');
      setProcessDialogOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const totalPendingCod = codTxs.filter(t => t.status === 'pending').reduce((s, t) => s + Number(t.amount), 0);
  const totalPendingSettlements = settlements.filter(s => s.status === 'pending').reduce((s, t) => s + Number(t.netAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('codSettlement')}</h1>
          <p className="text-muted-foreground">{t('manageCodCollections')}</p>
        </div>
        <div className="flex gap-3">
          <Select value={vendorFilter} onValueChange={setVendorFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder={t('allVendors')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allVendors')}</SelectItem>
              {vendors.map(v => <SelectItem key={v._id} value={String(v._id)}>{v.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setSettlementForm({ vendor_id: '', period_start: '', period_end: '', total_amount: '', cod_amount: '', platform_fee: '', notes: '' }); setSettlementDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />{t('newSettlement')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-warning" />
            <div><p className="text-2xl font-bold">৳{totalPendingCod.toLocaleString()}</p><p className="text-muted-foreground text-sm">{t('pendingCodCollection')}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-chart-2" />
            <div><p className="text-2xl font-bold">৳{totalPendingSettlements.toLocaleString()}</p><p className="text-muted-foreground text-sm">{t('pendingSettlements')}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="cod">
        <TabsList>
          <TabsTrigger value="cod">{t('codTransactions')}</TabsTrigger>
          <TabsTrigger value="settlements">{t('settlementRecords')}</TabsTrigger>
        </TabsList>

        {/* COD Transactions */}
        <TabsContent value="cod" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('orderNumber')}</TableHead>
                      <TableHead>{t('shipmentNo')}</TableHead>
                      <TableHead>{t('amount')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('collectedAt')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codTxs.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>#{tx.order_id}</TableCell>
                        <TableCell>#{tx.shipment_id}</TableCell>
                        <TableCell className="font-medium">৳{Number(tx.amount).toLocaleString()}</TableCell>
                        <TableCell><Badge className={codStatusColor[tx.status] || 'bg-muted text-muted-foreground'}>{tx.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{tx.collected_at ? new Date(tx.collected_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          {tx.status === 'pending' && (
                            <Button size="sm" onClick={() => collectCod(tx)}><CheckCircle className="w-3 h-3 mr-1" />{t('markCollected')}</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {codTxs.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noCodTransactions')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement Records */}
        <TabsContent value="settlements" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('vendor')}</TableHead>
                      <TableHead>{t('period')}</TableHead>
                      <TableHead>{t('total')}</TableHead>
                      <TableHead>{t('platformFee')}</TableHead>
                      <TableHead>{t('netPayout')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map(s => (
                      <TableRow key={s._id}>
                        <TableCell className="font-medium">{s.vendorName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.periodStart} – {s.periodEnd}</TableCell>
                        <TableCell>৳{Number(s.totalAmount).toLocaleString()}</TableCell>
                        <TableCell>৳{Number(s.platformFee).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold text-success">৳{Number(s.netAmount).toLocaleString()}</TableCell>
                        <TableCell><Badge className={settlementStatusColor[s.status] || 'bg-muted text-muted-foreground'}>{s.status}</Badge></TableCell>
                        <TableCell>
                          {s.status === 'pending' && (
                            <Button size="sm" onClick={() => { setProcessSettlement(s); setProcessForm({ payment_method: '', payment_ref: '' }); setProcessDialogOpen(true); }}>
                              {t('processSettle')}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {settlements.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noSettlementRecords')}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Settlement Dialog */}
      <Dialog open={settlementDialogOpen} onOpenChange={setSettlementDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('newSettlementRecord')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('vendor')} *</label>
              <Select value={settlementForm.vendor_id} onValueChange={v => setSettlementForm(p => ({ ...p, vendor_id: v }))}>
                <SelectTrigger><SelectValue placeholder={t('select')} /></SelectTrigger>
                <SelectContent>{vendors.map(v => <SelectItem key={v._id} value={String(v._id)}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">{t('periodStart')}</label><Input type="date" value={settlementForm.period_start} onChange={e => setSettlementForm(p => ({ ...p, period_start: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">{t('periodEnd')}</label><Input type="date" value={settlementForm.period_end} onChange={e => setSettlementForm(p => ({ ...p, period_end: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">{t('totalAmount')} *</label><Input type="number" value={settlementForm.total_amount} onChange={e => setSettlementForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">{t('codAmountLbl')}</label><Input type="number" value={settlementForm.cod_amount} onChange={e => setSettlementForm(p => ({ ...p, cod_amount: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t('platformFeeLbl')}</label><Input type="number" value={settlementForm.platform_fee} onChange={e => setSettlementForm(p => ({ ...p, platform_fee: e.target.value }))} /></div>
            <div className="p-3 bg-muted rounded text-sm">
              {t('netPayout')}: <strong>৳{(Number(settlementForm.total_amount || 0) - Number(settlementForm.platform_fee || 0)).toLocaleString()}</strong>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t('notes')}</label><Input value={settlementForm.notes} onChange={e => setSettlementForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettlementDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={createSettlement}>{t('createSettlement')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Settlement Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('processSettlementTitle')} — {processSettlement?.vendorName}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded text-sm space-y-1">
              <div>{t('netPayout')}: <strong>৳{Number(processSettlement?.netAmount || 0).toLocaleString()}</strong></div>
              <div className="text-muted-foreground">{t('deductedFromWallet')}</div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t('paymentMethodLbl')}</label><Input value={processForm.payment_method} onChange={e => setProcessForm(p => ({ ...p, payment_method: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('paymentReference')}</label><Input value={processForm.payment_ref} onChange={e => setProcessForm(p => ({ ...p, payment_ref: e.target.value }))} placeholder={t('paymentReferenceHint')} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={processSettlementRecord}>{t('confirmProcess')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
