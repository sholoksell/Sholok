import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { orderApi, Order } from '@/services/orderService';
import { customerApi, Customer } from '@/services/customerService';
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
  ChevronDown, X, Printer, RefreshCw, MapPin, Phone, Mail, User,
  CreditCard, CalendarDays, ExternalLink,
} from 'lucide-react';
import TakaIcon from '@/components/TakaIcon';

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
const SHIPMENT_STATUSES = ['Pending','Confirmed','Processing','Ready for Pickup','Picked Up','In Transit','Out for Delivery','Delivered','Failed Delivery','Returned','Cancelled','Completed','Refunded'];

const shipmentStatusColor: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Confirmed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Processing': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Ready for Pickup': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Picked Up': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'In Transit': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Out for Delivery': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Delivered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'Failed Delivery': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'Returned': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Cancelled': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Refunded': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const imgSrc = (url?: string) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return url.startsWith('/') ? url : `/${url}`;
};

export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [shipmentFilter, setShipmentFilter] = useState('all');
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
  const [exportLoading, setExportLoading] = useState(false);

  // Shipment state
  interface Shipment {
    id: string; type: string; status: string; warehouse?: string;
    vendor?: string; courier: string; trackingNumber: string;
    weight?: string; packages?: number; deliveryCharge?: number;
    dispatchDate?: string; eta?: string; destination?: string;
    products: { name: string; qty: number }[];
  }
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipStatusOpen, setShipStatusOpen] = useState(false);
  const [activeShipIdx, setActiveShipIdx] = useState<number>(0);
  const [shipStatusVal, setShipStatusVal] = useState('');

  // Customer details
  const [custOpen, setCustOpen] = useState(false);
  const [custData, setCustData] = useState<Customer | null>(null);
  const [custLoading, setCustLoading] = useState(false);

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
      if (shipmentFilter !== 'all') {
        const ex = o as any;
        const hasTracking = ex.courierName || ex.trackingNumber;
        const smap: Record<string, string> = {
          delivered: 'Delivered', shipped: 'In Transit', out_for_delivery: 'Out for Delivery',
          processing: 'Processing', confirmed: 'Preparing', pending: 'Pending',
          cancelled: 'Cancelled', refunded: 'Returned',
        };
        const derived = hasTracking ? (smap[o.status] || 'Pending') : 'Not Created';
        if (derived !== shipmentFilter) return false;
      }
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
  }, [orders, search, statusFilter, paymentFilter, shipmentFilter, fromDate, toDate]);

  const totalOrders = orders.length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'refunded').length;
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);

  const getShipmentInfo = (order: Order) => {
    const ex = order as any;
    if (!ex.courierName && !ex.trackingNumber) return { status: 'Not Created', partner: '—' };
    const smap: Record<string, string> = {
      delivered: 'Delivered', shipped: 'In Transit', out_for_delivery: 'Out for Delivery',
      processing: 'Processing', confirmed: 'Preparing', pending: 'Pending',
      cancelled: 'Cancelled', refunded: 'Returned',
    };
    return { status: smap[order.status] || 'Pending', partner: ex.courierName || 'Not Assigned' };
  };

  // ── Existing action handlers (unchanged) ────────────────────────────────────

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
      // Derive shipments from order tracking data
      const ex = full as any;
      if (ex.trackingNumber) {
        const smap: Record<string, string> = {
          delivered: 'Delivered', shipped: 'In Transit', out_for_delivery: 'Out for Delivery',
          processing: 'Processing', confirmed: 'Confirmed', pending: 'Pending',
          cancelled: 'Cancelled', refunded: 'Refunded',
        };
        setShipments([{
          id: 'SHP-001', type: 'Sholok Fulfillment',
          status: smap[full.status] || 'Pending',
          courier: ex.courierName || '—', trackingNumber: ex.trackingNumber,
          dispatchDate: new Date(full.updatedAt).toLocaleDateString('en-BD'),
          eta: ex.estimatedDeliveryDate ? new Date(ex.estimatedDeliveryDate).toLocaleDateString('en-BD') : '—',
          destination: [full.shippingAddress?.city, full.shippingAddress?.state].filter(Boolean).join(', ') || '—',
          products: full.items.map(i => ({ name: i.productName, qty: i.quantity })),
        }]);
      } else {
        setShipments([]);
      }
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

  const openInvoice = (order: Order) => {
    window.open(`https://api.sholok.com/api/orders/invoice/${order.orderNumber}`, '_blank');
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

  // ── Customer details ─────────────────────────────────────────────────────────

  const openCustomerDetail = async (customerId: string) => {
    if (!customerId) return;
    setCustLoading(true);
    setCustOpen(true);
    setCustData(null);
    try {
      const c = await customerApi.getById(customerId);
      setCustData(c);
    } catch { toast.error('Failed to load customer'); }
    finally { setCustLoading(false); }
  };

  const customerName = (o: Order) => (o.customerId as any)?.name ?? 'N/A';

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const StatusDropdown = ({ orderId, status }: { orderId: string; status: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Badge className={`${(statusConfig[status] ?? defaultCfg).className} border-0 cursor-pointer`}>
            {(statusConfig[status] ?? defaultCfg).label} <ChevronDown className="w-2.5 h-2.5 ml-0.5 inline" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {ALL_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdateStatus(orderId, s)}>{statusConfig[s].label}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const PaymentDropdown = ({ orderId, paymentStatus }: { orderId: string; paymentStatus: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Badge className={`${(paymentStatusConfig[paymentStatus] ?? defaultCfg).className} border-0 cursor-pointer`}>
            {(paymentStatusConfig[paymentStatus] ?? defaultCfg).label} <ChevronDown className="w-2.5 h-2.5 ml-0.5 inline" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PAYMENT_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleUpdatePaymentStatus(orderId, s)}>{paymentStatusConfig[s].label}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('orders')}</h1>
          <p className="text-muted-foreground">{t('manageTrackOrders')}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button onClick={handleExportCsv} disabled={exportLoading} className="gap-2 bg-success hover:bg-success/90 text-white">
            <Download className="w-4 h-4" />
            {exportLoading ? t('exporting') : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Orders',       value: totalOrders,      icon: <ShoppingCart className="w-5 h-5 text-chart-1" />,   bg: 'bg-chart-1/10' },
          { label: 'Confirmed',          value: confirmedOrders,  icon: <CheckCircle   className="w-5 h-5 text-chart-2" />,   bg: 'bg-chart-2/10' },
          { label: 'Pending',            value: pendingOrders,    icon: <Clock         className="w-5 h-5 text-warning" />,    bg: 'bg-warning/10' },
          { label: 'Processing',         value: processingOrders, icon: <Package       className="w-5 h-5 text-chart-1" />,   bg: 'bg-chart-1/10' },
          { label: 'Shipped / In Transit', value: shippedOrders, icon: <Truck         className="w-5 h-5 text-chart-3" />,   bg: 'bg-chart-3/10' },
          { label: 'Delivered',          value: deliveredOrders,  icon: <CheckCircle   className="w-5 h-5 text-success" />,   bg: 'bg-success/10' },
          { label: 'Cancelled / Returned', value: cancelledOrders, icon: <X           className="w-5 h-5 text-destructive" />, bg: 'bg-destructive/10' },
          { label: 'Order Value',        value: `৳${totalRevenue.toLocaleString()}`, icon: <TakaIcon className="w-5 h-5 text-chart-4" />, bg: 'bg-chart-4/10' },
        ].map((s, i) => (
          <Card key={i} className="glass-card border-border">
            <CardContent className="p-3">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>{s.icon}</div>
              <p className="text-xl font-bold leading-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-border"><CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={t('searchOrderOrCustomer')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
            <option value="all">{t('allStatus')}</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
          </select>
          <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
            <option value="all">All Payment Status</option>
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{paymentStatusConfig[s]?.label}</option>)}
          </select>
          <select value={shipmentFilter} onChange={e => setShipmentFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground">
            <option value="all">All Shipment Status</option>
            {['Not Created','Pending','Preparing','Processing','Picked Up','In Transit','Out for Delivery','Delivered','Failed Delivery','Returned','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-36" title="From date" />
          <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-36" title="To date" />
          {(search || statusFilter !== 'all' || paymentFilter !== 'all' || shipmentFilter !== 'all' || fromDate || toDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter('all'); setPaymentFilter('all'); setShipmentFilter('all'); setFromDate(''); setToDate(''); }}>
              <X className="w-4 h-4 mr-1" />Clear
            </Button>
          )}
        </div>
      </CardContent></Card>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <Card className="border-primary/40 bg-primary/5"><CardContent className="p-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline">{t('setStatus')} <ChevronDown className="w-3 h-3 ml-1" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              {ALL_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleBulkAction('status', s)}>{statusConfig[s]?.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline">{t('setPayment')} <ChevronDown className="w-3 h-3 ml-1" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              {PAYMENT_STATUSES.map(s => <DropdownMenuItem key={s} onClick={() => handleBulkAction('paymentStatus', s)}>{paymentStatusConfig[s]?.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="w-3 h-3 mr-1" />Delete</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}><X className="w-3 h-3 mr-1" />Clear</Button>
        </CardContent></Card>
      )}

      {/* Orders table */}
      <Card className="glass-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Order List</CardTitle>
          <span className="text-sm text-muted-foreground">View, search and manage all marketplace orders.</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={filteredOrders.length > 0 && selected.length === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date &amp; Time</TableHead>
                  <TableHead>{t('customer')}</TableHead>
                  <TableHead>{t('items')}</TableHead>
                  <TableHead>{t('total')}</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Shipment Status</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8">{t('loadingOrders')}</TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">{t('noOrdersFound')}</TableCell></TableRow>
                ) : filteredOrders.map((order) => {
                  const ship = getShipmentInfo(order);
                  return (
                  <TableRow
                    key={order._id}
                    className={`cursor-pointer hover:bg-muted/40 transition-colors ${selected.includes(order._id) ? 'bg-primary/5' : ''}`}
                    onClick={(e) => {
                      const closest = (e.target as HTMLElement).closest('button,input,[role="combobox"],[role="option"]');
                      if (!closest) handleViewOrder(order);
                    }}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(order._id)} onCheckedChange={() => toggleSelect(order._id)} />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-semibold text-primary text-sm">{order.orderNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </TableCell>
                    <TableCell>
                      {(order.customerId as any)?._id ? (
                        <button className="text-left hover:text-primary transition-colors group" onClick={e => { e.stopPropagation(); openCustomerDetail((order.customerId as any)._id); }}>
                          <p className="font-semibold text-sm group-hover:underline">{customerName(order)}</p>
                          <p className="text-xs text-muted-foreground">{(order.customerId as any)?.phone || (order.customerId as any)?.email || ''}</p>
                        </button>
                      ) : (
                        <div>
                          <p className="font-semibold text-sm">{customerName(order)}</p>
                          <p className="text-xs text-muted-foreground">{(order.shippingAddress as any)?.phone || ''}</p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}</span>
                    </TableCell>
                    <TableCell><span className="font-bold">৳{(order.total || 0).toLocaleString()}</span></TableCell>
                    <TableCell>
                      <div><PaymentDropdown orderId={order._id} paymentStatus={order.paymentStatus} /></div>
                      <div className="text-xs text-muted-foreground mt-0.5">{(order.paymentMethod || 'COD').toUpperCase()}</div>
                    </TableCell>
                    <TableCell><StatusDropdown orderId={order._id} status={order.status} /></TableCell>
                    <TableCell>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${shipmentStatusColor[ship.status] || 'bg-gray-100 text-gray-600'}`}>
                          • {ship.status}
                        </span>
                      </div>
                      {ship.partner !== '—' && <div className="text-xs text-muted-foreground mt-0.5">Partner: {ship.partner}</div>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}><Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}><Eye className="w-4 h-4 mr-2" />{t('view')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openInvoice(order)}><FileText className="w-4 h-4 mr-2" />{t('invoice')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openTrackingDialog(order)}><Truck className="w-4 h-4 mr-2" />{t('setTracking')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNoteDialog(order)}><StickyNote className="w-4 h-4 mr-2" />{t('addNote')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'processing')}><Package className="w-4 h-4 mr-2" />{t('markProcessing')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'delivered')}><CheckCircle className="w-4 h-4 mr-2" />{t('markDelivered')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(order._id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" />{t('delete')}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {!loading && filteredOrders.length > 0 && (
            <div className="pt-3 text-sm text-muted-foreground border-t border-border mt-2">
              Showing 1–{filteredOrders.length} of {filteredOrders.length} orders
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Full-screen Order Details ────────────────────────────────────────────── */}
      {viewOpen && viewOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f8fb] dark:bg-background">
          <div className="min-h-full p-4 md:p-6">
            <div className="max-w-[1400px] mx-auto">

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <button onClick={() => setViewOpen(false)} className="hover:text-primary transition-colors font-medium">Orders</button>
                <span>/</span>
                <span className="font-bold text-foreground">Order Details</span>
              </div>

              {/* ── ORDER HEADER ─────────────────────────────────────────────────────── */}
              <section className="bg-card border border-border rounded-2xl shadow-sm p-5 mb-5">
                <div className="flex justify-between items-start gap-5 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      Order <span className="text-primary">{viewOrder.orderNumber}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong className="text-foreground">Order Date:</strong>{' '}
                      {new Date(viewOrder.createdAt).toLocaleString('en-BD', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Order Status:</span>
                      <StatusDropdown orderId={viewOrder._id} status={viewOrder.status} />
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">Payment:</span>
                      <PaymentDropdown orderId={viewOrder._id} paymentStatus={viewOrder.paymentStatus} />
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        Fulfillment: {(viewOrder as any).trackingNumber ? 'Shipped' : viewOrder.status === 'processing' ? 'Processing' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}>
                      🖨 Print
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}>
                      📄 Invoice
                    </Button>
                    <Button size="sm" onClick={() => { setViewOpen(false); openTrackingDialog(viewOrder); }}>
                      + Create Shipment
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setViewOpen(false); openNoteDialog(viewOrder); }}>
                      <StickyNote className="w-3.5 h-3.5 mr-1" />Add Note
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => {
                      if (confirm('Cancel this order?')) { handleUpdateStatus(viewOrder._id, 'cancelled'); setViewOpen(false); }
                    }}>Cancel Order</Button>
                    <Button size="sm" variant="ghost" onClick={() => setViewOpen(false)}><X className="w-4 h-4" /></Button>
                  </div>
                </div>

                {/* Meta row — 5 cols */}
                <div className="grid grid-cols-2 md:grid-cols-5 mt-5 pt-5 border-t border-border divide-x divide-border">
                  {[
                    { label: 'Customer', value: (viewOrder.customerId as any)?.name ?? 'N/A' },
                    { label: 'Total Products', value: `${viewOrder.items.length} Products` },
                    { label: 'Total Shipments', value: `${shipments.length} Shipment${shipments.length !== 1 ? 's' : ''}` },
                    { label: 'Payment Method', value: viewOrder.paymentMethod?.replace(/_/g, ' ') || '—' },
                    { label: 'Grand Total', value: `৳${viewOrder.total.toLocaleString()}` },
                  ].map((m, i) => (
                    <div key={i} className={`px-4 py-1 ${i === 0 ? 'pl-0' : ''}`}>
                      <span className="block text-xs text-muted-foreground mb-1">{m.label}</span>
                      <span className="text-sm font-bold capitalize">{m.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── MAIN GRID ────────────────────────────────────────────────────────── */}
              <div className="grid gap-5" style={{ gridTemplateColumns: 'minmax(0,1fr) 350px' }}>

                {/* ═══ LEFT COLUMN ══════════════════════════════════════════════════ */}
                <div className="space-y-5">

                  {/* Customer Info + Delivery Address side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Customer Information */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-border">
                        <h3 className="font-bold text-sm">Customer Information</h3>
                      </div>
                      <div className="p-5 space-y-4">
                        {[
                          {
                            icon: '👤', label: 'Customer Name',
                            content: (viewOrder.customerId as any)?._id
                              ? <button className="font-bold text-sm hover:text-primary hover:underline text-left" onClick={() => openCustomerDetail((viewOrder.customerId as any)._id)}>
                                  {(viewOrder.customerId as any)?.name ?? 'N/A'} <span className="text-xs opacity-40">↗</span>
                                </button>
                              : <span className="font-bold text-sm">{(viewOrder.customerId as any)?.name ?? 'N/A'}</span>,
                          },
                          { icon: '📞', label: 'Mobile Number', content: <span className="font-bold text-sm">{(viewOrder.customerId as any)?.phone ?? '—'}</span> },
                          { icon: '✉', label: 'Email', content: <span className="font-bold text-sm break-all">{(viewOrder.customerId as any)?.email ?? '—'}</span> },
                          { icon: '#', label: 'Customer ID', content: <span className="font-bold text-sm font-mono">{(viewOrder.customerId as any)?._id ? `CUS-${String((viewOrder.customerId as any)._id).slice(-6).toUpperCase()}` : '—'}</span> },
                        ].map((row, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-base">{row.icon}</div>
                            <div>
                              <span className="block text-xs text-muted-foreground mb-0.5">{row.label}</span>
                              {row.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                        <h3 className="font-bold text-sm">Delivery Address</h3>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground">✏ Change Address</Button>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 text-base">📍</div>
                          <div>
                            <span className="block text-xs text-muted-foreground mb-0.5">Recipient</span>
                            <span className="font-bold text-sm">{viewOrder.shippingAddress?.name || (viewOrder.customerId as any)?.name || '—'}</span>
                          </div>
                        </div>
                        {viewOrder.shippingAddress ? (
                          <p className="text-sm text-muted-foreground leading-relaxed pl-0">
                            {viewOrder.shippingAddress.phone && <>{viewOrder.shippingAddress.phone}<br /></>}
                            {viewOrder.shippingAddress.street && <>{viewOrder.shippingAddress.street}<br /></>}
                            {viewOrder.shippingAddress.city && <>District: {viewOrder.shippingAddress.city}<br /></>}
                            {viewOrder.shippingAddress.state && <>Area: {viewOrder.shippingAddress.state}<br /></>}
                            {viewOrder.shippingAddress.zipCode && <>Postcode: {viewOrder.shippingAddress.zipCode}</>}
                          </p>
                        ) : <p className="text-sm text-muted-foreground">No address on file</p>}
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold">✓ Delivery Area Covered</span>
                        <div className="pt-1">
                          <Button size="sm" variant="outline" className="w-full text-xs h-8">✏ Edit Delivery Address</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Order Items ─────────────────────────────────────────────────── */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                      <div>
                        <h3 className="font-bold text-sm">Order Items</h3>
                        <p className="text-xs text-muted-foreground">{viewOrder.items.length} Products in this Order</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">{viewOrder.items.length} Items</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[780px]">
                        <thead>
                          <tr className="border-b border-border bg-muted/30">
                            {['#','Product','SKU','Ownership','Vendor / Warehouse','Qty','Unit Price','Total'].map((h, i) => (
                              <th key={i} className={`text-xs font-bold text-muted-foreground px-4 py-3 ${i >= 5 ? 'text-center' : 'text-left'} ${i === 7 ? 'text-right pr-5' : ''}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {viewOrder.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                              <td className="px-4 py-3 text-sm text-muted-foreground">{String(idx + 1).padStart(2, '0')}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {item.productImage
                                    ? <img src={imgSrc(item.productImage)} alt={item.productName} className="w-10 h-10 rounded-lg object-cover border border-border bg-muted flex-shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                                    : <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-muted-foreground" /></div>}
                                  <div>
                                    <p className="font-bold text-sm">{item.productName || '—'}</p>
                                    {item.variantName && <p className="text-xs text-muted-foreground">{item.variantName}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{(item as any).sku || '—'}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${(item as any).vendorId ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-primary/10 text-primary'}`}>
                                  {(item as any).vendorId ? 'Vendor' : 'Sholok Owned'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground">
                                {(item as any).vendorName || (item as any).warehouseName || 'Sholok Warehouse #01'}
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-bold">{item.quantity}</td>
                              <td className="px-4 py-3 text-center text-sm">৳{(item.price || 0).toLocaleString()}</td>
                              <td className="px-5 py-3 text-right font-bold text-sm">৳{(item.total || (item.price * item.quantity) || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Shipments ────────────────────────────────────────────────────── */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                      <div>
                        <h3 className="font-bold text-sm">Shipments</h3>
                        <p className="text-xs text-muted-foreground">
                          {shipments.length} Shipment{shipments.length !== 1 ? 's' : ''} created for this Order
                        </p>
                      </div>
                      <Button size="sm" onClick={() => { setViewOpen(false); openTrackingDialog(viewOrder); }}>
                        + Create Shipment
                      </Button>
                    </div>
                    <div className="p-5 space-y-4">
                      {shipments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No shipments created yet</p>
                          <Button size="sm" variant="outline" className="mt-3 text-xs" onClick={() => { setViewOpen(false); openTrackingDialog(viewOrder); }}>
                            + Create First Shipment
                          </Button>
                        </div>
                      ) : shipments.map((shp, idx) => (
                        <div key={idx} className="border border-border rounded-xl overflow-hidden">
                          {/* Shipment header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm">Shipment #{shp.id}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">{shp.type}</span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${shipmentStatusColor[shp.status] || 'bg-muted text-muted-foreground'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                                {shp.status}
                              </span>
                            </div>
                          </div>
                          {/* Shipment body */}
                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              {[
                                { label: 'Courier', val: shp.courier },
                                { label: 'Tracking #', val: <span className="font-mono font-bold text-primary text-xs">{shp.trackingNumber || '—'}</span> },
                                { label: 'Dispatch Date', val: shp.dispatchDate || '—' },
                                { label: 'ETA', val: shp.eta || '—' },
                              ].map((r, i) => (
                                <div key={i} className="p-2.5 rounded-lg bg-muted/30">
                                  <span className="block text-xs text-muted-foreground mb-1">{r.label}</span>
                                  <span className="font-semibold text-xs">{r.val}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t border-border pt-3">
                              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Products in this Shipment</p>
                              <div className="space-y-1.5">
                                {shp.products.map((p, i) => (
                                  <div key={i} className="flex justify-between items-center p-2 rounded-lg border border-border/50 text-sm">
                                    <span className="text-muted-foreground">{p.name}</span>
                                    <span className="font-semibold text-xs">Qty: {p.qty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Shipment footer */}
                          <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border flex-wrap gap-2">
                            <span className="text-xs text-muted-foreground">
                              Destination: {shp.destination || '—'}
                            </span>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="h-7 text-xs">View Details</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                                setActiveShipIdx(idx);
                                setShipStatusVal(shp.status);
                                setShipStatusOpen(true);
                              }}>Change Status</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setViewOpen(false); openTrackingDialog(viewOrder); }}>Tracking</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Order Timeline ───────────────────────────────────────────────── */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-sm">Order Timeline</h3>
                      <p className="text-xs text-muted-foreground">Complete order activity history</p>
                    </div>
                    <div className="p-5">
                      <div className="relative pl-5">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
                        {[
                          { status: 'Order Created', date: viewOrder.createdAt, note: 'Customer placed the order.' },
                          ...((viewOrder as any).statusHistory || []),
                        ].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((h: any, i: number, arr: any[]) => (
                            <div key={i} className={`relative ${i < arr.length - 1 ? 'pb-5' : ''}`}>
                              <div className="absolute left-[-14px] top-1 w-3 h-3 rounded-full border-2 border-primary bg-card" />
                              <p className="text-sm font-bold capitalize">{h.status?.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.date).toLocaleString()}</p>
                              {h.note && <p className="text-xs text-muted-foreground italic mt-0.5">{h.note}</p>}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Order Notes ──────────────────────────────────────────────────── */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-sm">Order Notes</h3>
                      <p className="text-xs text-muted-foreground">Visible only to Admin</p>
                    </div>
                    <div className="p-5">
                      <textarea
                        className="w-full border border-border rounded-lg p-3 bg-background text-foreground text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                        defaultValue={viewOrder.notes || ''}
                        placeholder="Write an order note..."
                        id="viewOrderNoteTA"
                      />
                      <div className="flex justify-end mt-3">
                        <Button size="sm" onClick={async () => {
                          const el = document.getElementById('viewOrderNoteTA') as HTMLTextAreaElement;
                          if (!el) return;
                          try {
                            await orderApi.updateNote(viewOrder._id, el.value);
                            toast.success('Note saved');
                            setOrders(prev => prev.map(o => o._id === viewOrder._id ? { ...o, notes: el.value } : o));
                          } catch { toast.error('Failed to save note'); }
                        }}>
                          Add order Note
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ── Notification History ─────────────────────────────────────────── */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-sm">Delivery Address Change Notification History</h3>
                      <p className="text-xs text-muted-foreground">Delivery address change notifications sent to the customer</p>
                    </div>
                    <div className="p-5">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              {['Notification Type','Channel','Message','Status','Date & Time'].map(h => (
                                <th key={h} className="text-left text-xs font-bold text-muted-foreground px-4 py-2.5">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                No notification history found.
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ═══ RIGHT SIDEBAR ════════════════════════════════════════════════ */}
                <div className="space-y-5">

                  {/* Order Summary */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-sm">Order Summary</h3></div>
                    <div className="p-5 space-y-3 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span><strong className="text-foreground">৳{(viewOrder.subtotal || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery Charge</span><strong className="text-foreground">৳{(viewOrder.shipping || viewOrder.deliveryCharge || 0).toLocaleString()}</strong>
                      </div>
                      {(viewOrder.discount || 0) > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                          <span>Discount</span><strong>-৳{(viewOrder.discount || 0).toLocaleString()}</strong>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base border-t border-border pt-3 mt-1">
                        <span>Grand Total</span>
                        <span className="text-primary">৳{viewOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-sm">Payment Information</h3></div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg">💵</div>
                        <div>
                          <p className="font-bold text-sm capitalize">{viewOrder.paymentMethod?.replace(/_/g, ' ') || '—'}</p>
                          <p className="text-xs text-muted-foreground">Customer pays after delivery is completed</p>
                        </div>
                      </div>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Payment Status</span>
                          <PaymentDropdown orderId={viewOrder._id} paymentStatus={viewOrder.paymentStatus} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Paid Amount</span>
                          <strong>৳{viewOrder.paymentStatus === 'paid' ? viewOrder.total.toLocaleString() : '0'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Due Amount</span>
                          <strong>৳{viewOrder.paymentStatus === 'paid' ? '0' : viewOrder.total.toLocaleString()}</strong>
                        </div>
                      </div>
                      {viewOrder.paymentMethod?.toLowerCase().includes('cash') && (
                        <p className="text-xs text-muted-foreground mt-3 p-2.5 rounded-lg bg-muted/40 leading-relaxed">
                          Cash on Delivery: Payment remains Pending until delivery is completed.
                        </p>
                      )}
                      <Button size="sm" variant="outline" className="w-full mt-3 text-xs" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}>
                        ✎ Update Payment Status
                      </Button>
                    </div>
                  </div>

                  {/* Fulfillment */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-sm">Fulfillment</h3></div>
                    <div className="p-5">
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-3">
                        Sholok Fulfillment
                      </span>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                          <span className="font-semibold">Sholok</span>
                          <span className="text-xs text-muted-foreground">Warehouse #01</span>
                        </div>
                        {(viewOrder as any).trackingNumber && (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                            <span className="font-semibold capitalize">{(viewOrder as any).courierName || 'Courier'}</span>
                            <span className="text-xs text-muted-foreground">In Transit</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Summary */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-sm">Tracking Summary</h3></div>
                    <div className="p-5 space-y-3">
                      {(() => {
                        const groups: Record<string, string[]> = {
                          'Delivered': ['Delivered','Completed'],
                          'In Transit': ['In Transit','Out for Delivery','Picked Up'],
                          'Processing': ['Processing','Confirmed','Ready for Pickup'],
                          'Pending': ['Pending'],
                          'Returned': ['Returned','Failed Delivery','Refunded'],
                          'Cancelled': ['Cancelled'],
                        };
                        const colors: Record<string, string> = {
                          'Delivered': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                          'In Transit': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                          'Processing': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                          'Pending': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                          'Returned': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                          'Cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-500',
                        };
                        return Object.entries(groups).map(([label, statuses]) => {
                          const count = shipments.filter(s => statuses.includes(s.status)).length;
                          if (count === 0) return null;
                          return (
                            <div key={label} className="flex items-center justify-between">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors[label]}`}>{label}</span>
                              <span className="text-sm font-bold">{count} Shipment{count !== 1 ? 's' : ''}</span>
                            </div>
                          );
                        }).filter(Boolean);
                      })()}
                      {shipments.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">No shipments</p>
                      )}
                    </div>
                  </div>

                  {/* Return & Refund */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border"><h3 className="font-bold text-sm">Return &amp; Refund</h3></div>
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Return Status</p>
                          <p className="font-bold">None</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Refund Amount</p>
                          <p className="font-bold">৳0</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Documents */}
                  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-sm">Order Documents</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Shipment-level packing slips &amp; shipping labels; order-level payment receipt</p>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { icon: '📦', name: 'Packing Slips', desc: '1 Packing Slip — 1 per Shipment' },
                        { icon: '🚚', name: 'Shipping Labels', desc: '1 Shipping Label — 1 per Shipment' },
                        { icon: '💳', name: 'Payment Receipt', desc: '1 Receipt — Order-level' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{doc.icon}</span>
                            <div>
                              <p className="text-sm font-semibold">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.desc}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}>
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => { setViewOpen(false); openInvoice(viewOrder); }}>
                              ↓
                            </Button>
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                        Document Rule: Each Packing Slip and Shipping Label contains only its own Shipment's products/details. Payment Receipt remains 1 per Order.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shipment Change Status Modal ──────────────────────────────────────── */}
      <Dialog open={shipStatusOpen} onOpenChange={setShipStatusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Shipment Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Shipment #{shipments[activeShipIdx]?.id}</p>
            <div>
              <label className="text-sm font-medium block mb-1.5">New Status</label>
              <select
                value={shipStatusVal}
                onChange={e => setShipStatusVal(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {SHIPMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {shipStatusVal && (
              <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
                New status: <span className={`font-bold px-2 py-0.5 rounded-full ${shipmentStatusColor[shipStatusVal] || ''}`}>{shipStatusVal}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipStatusOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              setShipments(prev => prev.map((s, i) => i === activeShipIdx ? { ...s, status: shipStatusVal } : s));
              toast.success(`Shipment status updated to "${shipStatusVal}"`);
              setShipStatusOpen(false);
            }}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Tracking Dialog (unchanged) ───────────────────────────────────────── */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('setTracking')} — {trackingOrder?.orderNumber}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="text-sm font-medium">{t('courierName')}</label>
              <Input value={trackingForm.courierName} onChange={e => setTrackingForm(f => ({ ...f, courierName: e.target.value }))} placeholder="e.g. Pathao, RedX, Steadfast…" />
            </div>
            <div><label className="text-sm font-medium">{t('trackingNumber')}</label>
              <Input value={trackingForm.trackingNumber} onChange={e => setTrackingForm(f => ({ ...f, trackingNumber: e.target.value }))} placeholder="Tracking ID" />
            </div>
            <div><label className="text-sm font-medium">{t('estDelivery')}</label>
              <Input type="date" value={trackingForm.estimatedDeliveryDate} onChange={e => setTrackingForm(f => ({ ...f, estimatedDeliveryDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSaveTracking}><Truck className="w-4 h-4 mr-2" />{t('saveTracking')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Note Dialog (unchanged) ───────────────────────────────────────────── */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('adminNotes')} — {noteOrder?.orderNumber}</DialogTitle></DialogHeader>
          <textarea
            className="w-full border border-border rounded-lg p-3 bg-background text-foreground text-sm min-h-[120px] resize-y"
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder={t('internalNote')}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSaveNote}><StickyNote className="w-4 h-4 mr-2" />{t('saveNote')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── Customer Details Dialog ───────────────────────────────────────────── */}
      <Dialog open={custOpen} onOpenChange={setCustOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-4 h-4" /> Customer Details
            </DialogTitle>
          </DialogHeader>
          {custLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading…</div>
          ) : custData ? (
            <div className="space-y-4 text-sm">
              {/* Profile */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
                  {custData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">{custData.name}</p>
                  <p className="text-muted-foreground text-xs">{custData.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge className={`text-xs border-0 ${custData.status === 'active' ? 'bg-success/20 text-success' : custData.status === 'blocked' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                      {custData.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{custData.group}</Badge>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-sm">{custData.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg border border-border">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-xs truncate max-w-[120px]">{custData.email}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border text-center">
                  <p className="text-xl font-bold text-primary">{custData.totalOrders ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="p-3 rounded-lg border border-border text-center">
                  <p className="text-xl font-bold text-primary">৳{(custData.totalSpent ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Spent</p>
                </div>
                <div className="p-3 rounded-lg border border-border text-center">
                  <p className="text-xl font-bold text-primary">{custData.rewardPoints ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>

              {/* Address */}
              {custData.address && (custData.address.street || custData.address.city) && (
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Default Address</p>
                      <p className="text-sm">{custData.address.street}</p>
                      <p className="text-sm text-muted-foreground">{[custData.address.city, custData.address.state, custData.address.zipCode].filter(Boolean).join(', ')}</p>
                      {custData.address.country && <p className="text-sm text-muted-foreground">{custData.address.country}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Joined */}
              <div className="text-xs text-muted-foreground text-center">
                Member since {new Date(custData.createdAt).toLocaleDateString()}
                {custData.lastLoginDate && ` · Last login: ${new Date(custData.lastLoginDate).toLocaleDateString()}`}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">Customer not found</div>
          )}
          <DialogFooter>
            <Button onClick={() => setCustOpen(false)}>{t('close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
