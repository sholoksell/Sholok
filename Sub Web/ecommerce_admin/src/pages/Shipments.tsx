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
import { toast } from 'sonner';
import { Search, Package, Truck, CheckCircle, Clock, Eye, Edit, RefreshCw } from 'lucide-react';

interface Shipment {
  _id: string;
  shipmentNumber: string;
  orderId: string | number;
  sourceType: string;
  sourceLabel: string;
  status: string;
  courierName: string;
  trackingNumber: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  deliveryCharge: number;
  totalWeightKg: number;
  deliveredAt: string;
  createdAt: string;
  items?: any[];
  trackingEvents?: any[];
}

interface Courier { _id: string; name: string; }

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:             { label: 'Pending',              className: 'bg-warning/20 text-warning' },
  confirmed:           { label: 'Confirmed',             className: 'bg-blue-500/20 text-blue-400' },
  processing:          { label: 'Processing',            className: 'bg-chart-1/20 text-chart-1' },
  ready_for_pickup:    { label: 'Ready for Pickup',      className: 'bg-chart-4/20 text-chart-4' },
  picked_up:           { label: 'Picked Up',             className: 'bg-chart-3/20 text-chart-3' },
  in_transit:          { label: 'In Transit',            className: 'bg-chart-2/20 text-chart-2' },
  out_for_delivery:    { label: 'Out for Delivery',      className: 'bg-cyan-500/20 text-cyan-400' },
  delivered:           { label: 'Delivered',             className: 'bg-success/20 text-success' },
  failed_delivery:     { label: 'Failed Delivery',       className: 'bg-destructive/20 text-destructive' },
  returned:            { label: 'Returned',              className: 'bg-muted text-muted-foreground' },
  cancelled:           { label: 'Cancelled',             className: 'bg-muted text-muted-foreground' },
};

const ALL_STATUSES = Object.keys(statusConfig);

export default function Shipments() {
  const { t } = useLanguage();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateShipment, setUpdateShipment] = useState<Shipment | null>(null);
  const [updateForm, setUpdateForm] = useState({ status: '', courier_id: '', courier_name: '', tracking_number: '', description: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchData(); }, [statusFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const [shipmentsRes, couriersRes] = await Promise.allSettled([
        api.get('/shipments', { params }),
        api.get('/couriers'),
      ]);
      if (shipmentsRes.status === 'fulfilled') {
        setShipments(shipmentsRes.value.data.shipments || []);
        setTotal(shipmentsRes.value.data.total || 0);
      }
      if (couriersRes.status === 'fulfilled') setCouriers(couriersRes.value.data || []);
    } catch { toast.error('Failed to load shipments'); }
    finally { setLoading(false); }
  };

  const openView = async (s: Shipment) => {
    try {
      const { data } = await api.get(`/shipments/${s._id}`);
      setViewShipment(data);
      setViewOpen(true);
    } catch { toast.error('Failed to load details'); }
  };

  const openUpdate = (s: Shipment) => {
    setUpdateShipment(s);
    setUpdateForm({ status: s.status, courier_id: '', courier_name: s.courierName || '', tracking_number: s.trackingNumber || '', description: '' });
    setUpdateOpen(true);
  };

  const submitUpdate = async () => {
    if (!updateShipment) return;
    try {
      await api.put(`/shipments/${updateShipment._id}/status`, updateForm);
      toast.success('Shipment updated');
      setUpdateOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const filtered = shipments.filter(s =>
    !search ||
    s.shipmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.orderId).includes(search) ||
    s.trackingNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('shipments')}</h1>
          <p className="text-muted-foreground">{t('trackManageShipments')}</p>
        </div>
        <Button variant="outline" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-2" />{t('refresh')}</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t('total'), count: total, icon: Package, color: 'text-primary' },
          { label: t('pending'), count: shipments.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-warning' },
          { label: t('inTransit'), count: shipments.filter(s => s.status === 'in_transit').length, icon: Truck, color: 'text-chart-2' },
          { label: t('delivered'), count: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle, color: 'text-success' },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label}><CardContent className="pt-6"><div className="flex items-center gap-3"><Icon className={`w-8 h-8 ${color}`} /><div><p className="text-2xl font-bold">{count}</p><p className="text-muted-foreground text-sm">{label}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('searchShipments')} className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-44"><SelectValue placeholder={t('allStatus')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{statusConfig[s]?.label || s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('shipmentNo')}</TableHead>
                    <TableHead>{t('order')}</TableHead>
                    <TableHead>{t('source')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('courier')}</TableHead>
                    <TableHead>{t('tracking')}</TableHead>
                    <TableHead>{t('charge')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(s => (
                    <TableRow key={s._id}>
                      <TableCell className="font-mono text-sm font-medium">{s.shipmentNumber}</TableCell>
                      <TableCell>#{s.orderId}</TableCell>
                      <TableCell><Badge variant="outline">{s.sourceType}{s.sourceLabel ? ` · ${s.sourceLabel}` : ''}</Badge></TableCell>
                      <TableCell><Badge className={statusConfig[s.status]?.className || 'bg-muted text-muted-foreground'}>{statusConfig[s.status]?.label || s.status}</Badge></TableCell>
                      <TableCell className="text-sm">{s.courierName || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{s.trackingNumber || '—'}</TableCell>
                      <TableCell>৳{s.deliveryCharge?.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openView(s)}><Eye className="w-3 h-3" /></Button>
                          <Button size="sm" variant="outline" onClick={() => openUpdate(s)}><Edit className="w-3 h-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t('noShipmentsFound')}</TableCell></TableRow>}
                </TableBody>
              </Table>
              {total > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('previous')}</Button>
                  <span className="py-2 text-sm text-muted-foreground">{t('page')} {page} {t('of')} {Math.ceil(total / 20)}</span>
                  <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>{t('next')}</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Shipment Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{t('shipmentDetails')} — {viewShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          {viewShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">{t('order')}:</span> <span className="font-medium">#{viewShipment.orderId}</span></div>
                <div><span className="text-muted-foreground">{t('status')}:</span> <Badge className={statusConfig[viewShipment.status]?.className}>{statusConfig[viewShipment.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">{t('courier')}:</span> <span>{viewShipment.courierName || '—'}</span></div>
                <div><span className="text-muted-foreground">{t('tracking')}:</span> <span className="font-mono">{viewShipment.trackingNumber || '—'}</span></div>
                <div><span className="text-muted-foreground">{t('weight')}:</span> <span>{viewShipment.totalWeightKg ? `${viewShipment.totalWeightKg} kg` : '—'}</span></div>
                <div><span className="text-muted-foreground">{t('deliveryCharge')}:</span> <span>৳{viewShipment.deliveryCharge}</span></div>
                <div><span className="text-muted-foreground">{t('eta')}:</span> <span>{viewShipment.estimatedDaysMin}–{viewShipment.estimatedDaysMax} {t('days')}</span></div>
              </div>
              {viewShipment.items && viewShipment.items.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t('items')} ({viewShipment.items.length})</p>
                  <div className="space-y-1">{viewShipment.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b"><span>{item.product_name || `Product #${item.product_id}`}</span><span>x{item.quantity}</span></div>
                  ))}</div>
                </div>
              )}
              {viewShipment.trackingEvents && viewShipment.trackingEvents.length > 0 && (
                <div>
                  <p className="font-medium mb-2">{t('trackingHistory')}</p>
                  <div className="space-y-2">{viewShipment.trackingEvents.map((ev: any, i: number) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-muted-foreground whitespace-nowrap">{new Date(ev.created_at).toLocaleDateString()}</span>
                      <Badge className={statusConfig[ev.status]?.className || 'bg-muted text-muted-foreground'} variant="outline">{statusConfig[ev.status]?.label || ev.status}</Badge>
                      {ev.description && <span className="text-muted-foreground">{ev.description}</span>}
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('updateShipment')} — {updateShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('status')} *</label>
              <Select value={updateForm.status} onValueChange={v => setUpdateForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{statusConfig[s]?.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('courier')}</label>
              <Select value={updateForm.courier_id} onValueChange={v => {
                const c = couriers.find(c => c._id === v);
                setUpdateForm(p => ({ ...p, courier_id: v, courier_name: c?.name || '' }));
              }}>
                <SelectTrigger><SelectValue placeholder={t('selectCourier')} /></SelectTrigger>
                <SelectContent>{couriers.map(c => <SelectItem key={c._id} value={String(c._id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t('trackingNumber')}</label><Input value={updateForm.tracking_number} onChange={e => setUpdateForm(p => ({ ...p, tracking_number: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('noteDescription')}</label><Input value={updateForm.description} onChange={e => setUpdateForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateOpen(false)}>{t('cancel')}</Button>
            <Button onClick={submitUpdate}>{t('update')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
