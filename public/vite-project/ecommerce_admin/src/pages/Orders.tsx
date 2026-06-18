import { useState, useEffect, useMemo, useRef } from 'react';
import { orderApi, Order } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Search, MoreVertical, Eye, Edit, Trash2, Package, Clock, CheckCircle,
  ShoppingCart, Download, Truck, FileText, StickyNote,
  ChevronDown, X, Printer, RefreshCw,
} from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';
import { useLanguage } from '@/contexts/LanguageContext';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending:          { label: 'Pending',          className: 'bg-warning/20 text-warning' },
  confirmed:        { label: 'Confirmed',         className: 'bg-chart-2/20 text-chart-2' },
  processing:       { label: 'Processing',        className: 'bg-chart-1/20 text-chart-1' },
  shipped:          { label: 'Shipped',           className: 'bg-chart-3/20 text-chart-3' },
  out_for_delivery: { label: 'Out for Delivery',  className: 'bg-chart-5/20 text-chart-5' },
  delivered:        { label: 'Delivered',         className: 'bg-success/20 text-success' },
  cancelled:        { label: 'Cancelled',         className: 'bg-muted text-muted-foreground' },
  refunded:         { label: 'Refunded',          className: 'bg-destructive/20 text-destructive' },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-warning/20 text-warning' },
  paid:     { label: 'Paid',     className: 'bg-success/20 text-success' },
  failed:   { label: 'Failed',   className: 'bg-destructive/20 text-destructive' },
  refunded: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

const defaultCfg = { label: 'Unknown', className: 'bg-muted text-muted-foreground' };
const ALL_STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];
const PAYMENT_STATUSES = ['pending','paid','failed','refunded'];

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', courierName: '', estimatedDeliveryDate: '' });
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteOrder, setNoteOrder] = useState<Order | null>(null);
  const [noteText, setNoteText] = useState('');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setSelected([]);
    try {
      const data = await orderApi.getAll();
      setOrders(data);
    } catch {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (paymentFilter !== 'all' && o.paymentStatus !== paymentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const inNum = o.orderNumber.toLowerCase().includes(q);
        const inCustomer = ((o.customerId as any)?.name ?? '').toLowerCase().includes(q);
        if (!inNum && !inCustomer) return false;
      }
      if (fromDate && new Date(o.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(o.createdAt) > new Date(toDate + 'T23:59:59')) return false;
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, fromDate, toDate]);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid').length;

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateStatus(orderId, status as Order['status']);
      toast.success('Order status updated');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: status as Order['status'] } : o));
      if (viewOrder?._id === orderId) setViewOrder(v => v ? { ...v, status: status as Order['status'] } : null);
    } catch { toast.error('Failed to update status'); }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await orderApi.updatePaymentStatus(orderId, paymentStatus as Order['paymentStatus']);
      toast.success('Payment status updated');
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: paymentStatus as Order['paymentStatus'] } : o));
    } catch { toast.error('Failed to update payment status'); }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Delete this order?')) return;
    try {
      await orderApi.delete(orderId);
      toast.success('Order deleted');
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch { toast.error('Failed to delete order'); }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const full = await orderApi.getById(order._id);
      setViewOrder(full);
      setViewOpen(true);
    } catch { toast.error('Failed to load order details'); }
  };

  const openTrackingDialog = (order: Order) => {
    setTrackingOrder(order);
    setTrackingForm({
      trackingNumber: (order as any).trackingNumber || '',
      courierName: (order as any).courierName || '',
      estimatedDeliveryDate: (order as any).estimatedDeliveryDate
        ? new Date((order as any).estimatedDeliveryDate).toISOString().split('T')[0] : '',
    });
    setTrackingOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!trackingOrder) return;
    try {
      await orderApi.updateTracking(trackingOrder._id, trackingForm);
      toast.success('Tracking info updated');
      setOrders(prev => prev.map(o => o._id === trackingOrder._id ? { ...o, ...trackingForm } : o));
      setTrackingOpen(false);
    } catch { toast.error('Failed to save tracking'); }
  };

  const openNoteDialog = (order: Order) => {
    setNoteOrder(order);
    setNoteText((order as any).notes || '');
    setNoteOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteOrder) return;
    try {
      await orderApi.updateNote(noteOrder._id, noteText);
      toast.success('Note saved');
      setOrders(prev => prev.map(o => o._id === noteOrder._id ? { ...o, notes: noteText } : o));
      setNoteOpen(false);
    } catch { toast.error('Failed to save note'); }
  };

  const openInvoice = async (order: Order) => {
    try {
      const full = await orderApi.getById(order._id);
      setInvoiceOrder(full);
      setInvoiceOpen(true);
    } catch { toast.error('Failed to load invoice'); }
  };

  const handlePrintInvoice = () => {
    const el = invoicePrintRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Invoice</title><style>
      body{font-family:Arial,sans-serif;padding:20px;color:#000}
      table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px;font-size:12px}
      th{background:#f0f0f0}.flex{display:flex;justify-content:space-between}
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleSelectAll = () => {
    if (selected.length === filteredOrders.length) setSelected([]);
    else setSelected(filteredOrders.map(o => o._id));
  };

  const handleBulkAction = async (action: string, value?: string) => {
    if (selected.length === 0) { toast.error('No orders selected'); return; }
    if (!confirm(`Apply action to ${selected.length} orders?`)) return;
    try {
      if (action === 'delete') {
        await orderApi.bulkAction(selected, 'delete');
        setOrders(prev => prev.filter(o => !selected.includes(o._id)));
        toast.success(`${selected.length} orders deleted`);
      } else if (action === 'status' && value) {
        await orderApi.bulkAction(selected, 'status', value);
        setOrders(prev => prev.map(o => selected.includes(o._id) ? { ...o, status: value as Order['status'] } : o));
        toast.success(`Status updated for ${selected.length} orders`);
      } else if (action === 'paymentStatus' && value) {
        await orderApi.bulkAction(selected, 'paymentStatus', value);
        setOrders(prev => prev.map(o => selected.includes(o._id) ? { ...o, paymentStatus: value as Order['paymentStatus'] } : o));
        toast.success(`Payment status updated for ${selected.length} orders`);
      }
      setSelected([]);
    } catch { toast.error('Bulk action failed'); }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const blob = await orderApi.exportCsv(params);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'orders.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success('Orders exported');
    } catch { toast.error('Export failed'); }
    finally { setExportLoading(false); }
  };

  const customerName = (o: Order) => (o.customerId as any)?.name ?? 'N/A';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('orders')}</h1>
          <p className="text-muted-foreground">Manage and track all customer orders</p>
        </div>
        <Button onClick={handleExportCsv} disabled={exportLoading} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          {exportLoading ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-chart-1" /></div>
          <div><p className="text-2xl font-bold">{totalOrders}</p><p className="text-sm text-muted-foreground">Total Orders</p></div>
        </CardContent></Card>
        <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center"><Clock className="w-6 h-6 text-warning" /></div>
          <div><p className="text-2xl font-bold">{pendingOrders}</p><p className="text-sm text-muted-foreground">Pending Orders</p></div>
        </CardContent></Card>
        <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center"><TakaIcon className="w-6 h-6 text-chart-4" /></div>
          <div><p className="text-2xl font-bold">৳{totalRevenue.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Revenue</p></div>
        </CardContent></Card>
        <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><CheckCircle className="w-6 h-6 text-success" /></div>
          <div><p className="text-2xl font-bold">{paidOrders}</p><p className="text-sm text-muted-foreground">Paid Orders</p></div>
        </CardContent></Card>
      </div>

      <Card className="glass-card border-border"><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search order # or customer…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
            <option value="all">All Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
            <option value="all">All Payments</option>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{paymentStatusConfig[s]?.label}</option>)}
          </select>
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-36" title="From date" />
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-36" title="To date" />
          {(search || statusFilter !== 'all' || paymentFilter !== 'all' || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); setPaymentFilter('all'); setFromDate(''); setToDate(''); }}>
              <X className="w-4 h-4 mr-1" />Clear
            </Button>
          )}
        </div>
      </CardContent></Card>

      {selected.length > 0 && (
        <Card className="border-primary/40 bg-primary/5"><CardContent className="p-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Set Status <ChevronDown className="w-3 h-3 ml-1" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              {ALL_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleBulkAction('status', s)}>{statusConfig[s]?.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Set Payment <ChevronDown className="w-3 h-3 ml-1" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              {PAYMENT_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleBulkAction('paymentStatus', s)}>{paymentStatusConfig[s]?.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}><X className="w-3 h-3 mr-1" />Clear</Button>
        </CardContent></Card>
      )}

      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchOrders}><RefreshCw className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={filteredOrders.length > 0 && selected.length === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>{t('customer')}</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>{t('total')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8">Loading orders…</TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No orders found</TableCell></TableRow>
                ) : filteredOrders.map((order) => (
                  <TableRow key={order._id} className={selected.includes(order._id) ? 'bg-primary/5' : ''}>
                    <TableCell><Checkbox checked={selected.includes(order._id)} onCheckedChange={() => toggleSelect(order._id)} /></TableCell>
                    <TableCell><span className="font-mono font-medium">{order.orderNumber}</span></TableCell>
                    <TableCell>
                      <p className="font-medium">{customerName(order)}</p>
                      {(order.customerId as any)?.email && (
                        <p className="text-xs text-muted-foreground">{(order.customerId as any)?.email}</p>
                      )}
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell><span className="font-semibold">৳{(order.total || 0).toLocaleString()}</span></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <Badge className={`${(statusConfig[order.status] ?? defaultCfg).className} border-0 cursor-pointer`}>
                              {(statusConfig[order.status] ?? defaultCfg).label} <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {ALL_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdateStatus(order._id, s)}>{statusConfig[s].label}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <Badge className={`${(paymentStatusConfig[order.paymentStatus] ?? defaultCfg).className} border-0 cursor-pointer`}>
                              {(paymentStatusConfig[order.paymentStatus] ?? defaultCfg).label} <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {PAYMENT_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdatePaymentStatus(order._id, s)}>{paymentStatusConfig[s].label}</DropdownMenuItem>)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {(order as any).trackingNumber ? <span className="font-mono text-foreground">{(order as any).trackingNumber}</span> : <span className="text-muted-foreground">—</span>}
                      </span>
                    </TableCell>
                    <TableCell><span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openInvoice(order)}><FileText className="w-4 h-4 mr-2" />Invoice</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTrackingDialog(order)}><Truck className="w-4 h-4 mr-2" />Set Tracking</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNoteDialog(order)}><StickyNote className="w-4 h-4 mr-2" />Add Note</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'processing')}><Package className="w-4 h-4 mr-2" />Mark Processing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'delivered')}><CheckCircle className="w-4 h-4 mr-2" />Mark Delivered</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(order._id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order Details — {viewOrder?.orderNumber}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Order Status</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button><Badge className={`${(statusConfig[viewOrder.status] ?? defaultCfg).className} border-0 cursor-pointer`}>{(statusConfig[viewOrder.status] ?? defaultCfg).label} <ChevronDown className="w-3 h-3 ml-1" /></Badge></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {ALL_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdateStatus(viewOrder._id, s)}>{statusConfig[s].label}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button><Badge className={`${(paymentStatusConfig[viewOrder.paymentStatus] ?? defaultCfg).className} border-0 cursor-pointer`}>{(paymentStatusConfig[viewOrder.paymentStatus] ?? defaultCfg).label} <ChevronDown className="w-3 h-3 ml-1" /></Badge></button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {PAYMENT_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdatePaymentStatus(viewOrder._id, s)}>{paymentStatusConfig[s].label}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{(viewOrder.customerId as any)?.name ?? 'N/A'}</p>
                  <p>{(viewOrder.customerId as any)?.email ?? ''}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Date</p>
                  <p className="font-medium">{new Date(viewOrder.createdAt).toLocaleString()}</p>
                  <p className="text-muted-foreground mt-2">Payment Method</p>
                  <p className="capitalize">{viewOrder.paymentMethod?.replace(/_/g,' ') || '—'}</p>
                </div>
              </div>
              <div className="bg-secondary/50 p-3 rounded-lg space-y-1">
                <p className="font-semibold">Shipping / Tracking</p>
                <p>Courier: {(viewOrder as any).courierName || '—'}</p>
                <p>Tracking #: {(viewOrder as any).trackingNumber || '—'}</p>
                {(viewOrder as any).estimatedDeliveryDate && <p>Est. Delivery: {new Date((viewOrder as any).estimatedDeliveryDate).toLocaleDateString()}</p>}
                <Button size="sm" variant="outline" className="mt-1" onClick={() => { setViewOpen(false); openTrackingDialog(viewOrder); }}>
                  <Truck className="w-3 h-3 mr-1" />Update Tracking
                </Button>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="bg-secondary/50 p-3 rounded-lg space-y-0.5">
                  <p>{viewOrder.shippingAddress?.name}</p>
                  <p>{viewOrder.shippingAddress?.phone}</p>
                  <p>{viewOrder.shippingAddress?.street}</p>
                  <p>{[viewOrder.shippingAddress?.city,viewOrder.shippingAddress?.state,viewOrder.shippingAddress?.zipCode].filter(Boolean).join(', ')}</p>
                  <p>{viewOrder.shippingAddress?.country}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {viewOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName || 'Unknown'}</p>
                        {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                        <p className="text-xs">Qty: {item.quantity} × ৳{(item.price||0).toLocaleString()}</p>
                      </div>
                      <p className="font-semibold">৳{(item.total||item.price*item.quantity||0).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 space-y-1.5">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{(viewOrder.subtotal||0).toLocaleString()}</span></div>
                {(viewOrder.tax||0)>0 && <div className="flex justify-between"><span>Tax</span><span>৳{(viewOrder.tax||0).toLocaleString()}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>৳{(viewOrder.shipping||viewOrder.deliveryCharge||0).toLocaleString()}</span></div>
                {(viewOrder.discount||0)>0 && <div className="flex justify-between text-success"><span>Discount</span><span>-৳{(viewOrder.discount||0).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>৳{viewOrder.total.toLocaleString()}</span></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">Admin Notes</h3>
                  <Button size="sm" variant="ghost" onClick={() => { setViewOpen(false); openNoteDialog(viewOrder); }}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                </div>
                <p className="bg-secondary/50 p-3 rounded-lg min-h-[36px]">
                  {viewOrder.notes || <span className="text-muted-foreground">No notes</span>}
                </p>
              </div>
              {(viewOrder as any).statusHistory?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Order Timeline</h3>
                  <div className="space-y-2">
                    {(viewOrder as any).statusHistory.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                        <div>
                          <span className="font-medium capitalize">{h.status?.replace(/_/g,' ')}</span>
                          <span className="text-muted-foreground ml-2">{new Date(h.updatedAt).toLocaleString()}</span>
                          {h.note && <p className="text-muted-foreground">{h.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}><Printer className="w-4 h-4 mr-2" />View Invoice</Button>
                <Button onClick={() => setViewOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Tracking — {trackingOrder?.orderNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">Courier Name</label>
              <Input value={trackingForm.courierName} onChange={e => setTrackingForm(f=>({...f,courierName:e.target.value}))} placeholder="e.g. Pathao, RedX, Steadfast…" />
            </div>
            <div><label className="text-sm font-medium">Tracking Number</label>
              <Input value={trackingForm.trackingNumber} onChange={e => setTrackingForm(f=>({...f,trackingNumber:e.target.value}))} placeholder="Tracking ID" />
            </div>
            <div><label className="text-sm font-medium">Estimated Delivery Date</label>
              <Input type="date" value={trackingForm.estimatedDeliveryDate} onChange={e => setTrackingForm(f=>({...f,estimatedDeliveryDate:e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTracking}><Truck className="w-4 h-4 mr-2" />Save Tracking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admin Note — {noteOrder?.orderNumber}</DialogTitle></DialogHeader>
          <textarea className="w-full border border-border rounded-lg p-3 bg-background text-foreground text-sm min-h-[120px] resize-y"
            value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add an internal note…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote}><StickyNote className="w-4 h-4 mr-2" />Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Invoice — {invoiceOrder?.orderNumber}</DialogTitle></DialogHeader>
          {invoiceOrder && (
            <div ref={invoicePrintRef} className="p-4 space-y-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">SHOLOK</h2>
                  <p className="text-muted-foreground text-xs">Invoice #{invoiceOrder.orderNumber}</p>
                  <p className="text-muted-foreground text-xs">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium">Bill To:</p>
                  <p>{(invoiceOrder.customerId as any)?.name ?? ''}</p>
                  <p>{(invoiceOrder.customerId as any)?.email ?? ''}</p>
                  {invoiceOrder.shippingAddress && <>
                    <p>{invoiceOrder.shippingAddress.street}</p>
                    <p>{[invoiceOrder.shippingAddress.city,invoiceOrder.shippingAddress.state].filter(Boolean).join(', ')}</p>
                  </>}
                </div>
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-secondary">
                    <th className="text-left p-2 border border-border">Product</th>
                    <th className="text-center p-2 border border-border">Qty</th>
                    <th className="text-right p-2 border border-border">Price</th>
                    <th className="text-right p-2 border border-border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border border-border">{item.productName}{item.variantName && <span className="text-muted-foreground"> ({item.variantName})</span>}</td>
                      <td className="text-center p-2 border border-border">{item.quantity}</td>
                      <td className="text-right p-2 border border-border">৳{(item.price||0).toLocaleString()}</td>
                      <td className="text-right p-2 border border-border">৳{(item.total||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="ml-auto w-64 space-y-1 text-xs">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{(invoiceOrder.subtotal||0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>৳{(invoiceOrder.shipping||invoiceOrder.deliveryCharge||0).toLocaleString()}</span></div>
                {(invoiceOrder.discount||0)>0 && <div className="flex justify-between text-success"><span>Discount</span><span>-৳{(invoiceOrder.discount||0).toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-sm border-t pt-1"><span>Total</span><span>৳{invoiceOrder.total.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Payment</span><span className="capitalize">{invoiceOrder.paymentMethod?.replace(/_/g,' ')||'—'}</span></div>
                <div className="flex justify-between items-center"><span>Pay Status</span>
                  <Badge className={`${(paymentStatusConfig[invoiceOrder.paymentStatus]??defaultCfg).className} border-0 text-xs`}>
                    {(paymentStatusConfig[invoiceOrder.paymentStatus]??defaultCfg).label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceOpen(false)}>Close</Button>
            <Button onClick={handlePrintInvoice}><Printer className="w-4 h-4 mr-2" />Print Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
