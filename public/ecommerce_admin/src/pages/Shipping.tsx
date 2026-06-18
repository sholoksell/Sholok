import { useState, useEffect } from 'react';
import { shippingApi, DeliveryArea, ShippingStats, ShippingOrder, ShippingMethod } from '@/services/shippingService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Truck, MapPin, Package, CheckCircle, Clock, Plus, Pencil, Trash2, Search, Settings } from 'lucide-react';

const shippingStatusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-blue-500/20 text-blue-400' },
  processing: { label: 'Processing', className: 'bg-primary/20 text-primary' },
  shipped: { label: 'Shipped', className: 'bg-chart-4/20 text-chart-4' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-500/20 text-cyan-400' },
  delivered: { label: 'Delivered', className: 'bg-success/20 text-success' },
};

export default function Shipping() {
  const [tab, setTab] = useState<'areas' | 'orders' | 'methods'>('orders');
  const [stats, setStats] = useState<ShippingStats | null>(null);
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [orders, setOrders] = useState<ShippingOrder[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [areaForm, setAreaForm] = useState({ name: '', city: '', deliveryCharge: 0, freeDeliveryThreshold: 0, estimatedDeliveryDays: 1, postalCodes: '' });
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [methodForm, setMethodForm] = useState({ name: '', type: 'flat' as ShippingMethod['type'], baseCharge: 0, freeThreshold: 0, isActive: true });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, areasData, ordersData, methodsData] = await Promise.all([
        shippingApi.getStats(),
        shippingApi.getAreas(),
        shippingApi.getOrders(),
        shippingApi.getMethods(),
      ]);
      setStats(statsData);
      setAreas(areasData);
      setOrders(ordersData);
      setMethods(methodsData);
    } catch { toast.error('Failed to load shipping data'); }
    finally { setLoading(false); }
  };

  const openNewMethod = () => {
    setEditingMethod(null);
    setMethodForm({ name: '', type: 'flat', baseCharge: 0, freeThreshold: 0, isActive: true });
    setMethodDialogOpen(true);
  };
  const openEditMethod = (m: ShippingMethod) => {
    setEditingMethod(m);
    setMethodForm({ name: m.name, type: m.type, baseCharge: m.baseCharge, freeThreshold: m.freeThreshold || 0, isActive: m.isActive });
    setMethodDialogOpen(true);
  };
  const handleSaveMethod = async () => {
    try {
      if (editingMethod) { await shippingApi.updateMethod(editingMethod._id, methodForm); toast.success('Method updated'); }
      else { await shippingApi.createMethod(methodForm); toast.success('Method created'); }
      setMethodDialogOpen(false); fetchData();
    } catch { toast.error('Failed to save method'); }
  };
  const handleDeleteMethod = async (id: string) => {
    if (!confirm('Delete this shipping method?')) return;
    try { await shippingApi.deleteMethod(id); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const handleSaveArea = async () => {
    try {
      const data = { ...areaForm, postalCodes: areaForm.postalCodes.split(',').map(s => s.trim()).filter(Boolean) };
      if (editingArea) {
        await shippingApi.updateArea(editingArea._id, data);
        toast.success('Delivery area updated');
      } else {
        await shippingApi.createArea(data);
        toast.success('Delivery area created');
      }
      setAreaDialogOpen(false);
      setEditingArea(null);
      fetchData();
    } catch { toast.error('Failed to save delivery area'); }
  };

  const handleDeleteArea = async (id: string) => {
    if (!confirm('Delete this delivery area?')) return;
    try {
      await shippingApi.deleteArea(id);
      toast.success('Delivery area deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await shippingApi.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const openEditArea = (area: DeliveryArea) => {
    setEditingArea(area);
    setAreaForm({ name: area.name, city: area.city, deliveryCharge: area.deliveryCharge, freeDeliveryThreshold: area.freeDeliveryThreshold, estimatedDeliveryDays: area.estimatedDeliveryDays, postalCodes: area.postalCodes.join(', ') });
    setAreaDialogOpen(true);
  };

  const openNewArea = () => {
    setEditingArea(null);
    setAreaForm({ name: '', city: '', deliveryCharge: 0, freeDeliveryThreshold: 0, estimatedDeliveryDays: 1, postalCodes: '' });
    setAreaDialogOpen(true);
  };

  const filteredOrders = orders.filter(o => {
    const name = typeof o.customerId === 'object' ? o.customerId.name : '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || o.orderNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipping Management</h1>
          <p className="text-muted-foreground">Manage delivery areas and track shipments</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Pending Shipment</p><p className="text-2xl font-bold">{stats.pendingShipment}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Truck className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">Shipped / In Transit</p><p className="text-2xl font-bold">{stats.shippedOrders + stats.outForDelivery}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">Delivered</p><p className="text-2xl font-bold">{stats.deliveredOrders}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">Active Areas</p><p className="text-2xl font-bold">{stats.activeAreas}</p></div></CardContent></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <Button variant={tab === 'orders' ? 'default' : 'outline'} onClick={() => setTab('orders')}>Shipment Orders</Button>
        <Button variant={tab === 'areas' ? 'default' : 'outline'} onClick={() => setTab('areas')}>Delivery Areas</Button>
        <Button variant={tab === 'methods' ? 'default' : 'outline'} onClick={() => setTab('methods')}><Settings className="w-4 h-4 mr-2" />Shipping Methods</Button>
      </div>

      {tab === 'orders' && (
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>Shipment Orders</CardTitle>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search orders..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const customerName = typeof order.customerId === 'object' ? order.customerId.name : 'N/A';
                  const cfg = shippingStatusConfig[order.status] || { label: order.status, className: 'bg-muted text-muted-foreground' };
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>৳{order.total?.toFixed(2)}</TableCell>
                      <TableCell><Badge className={cfg.className}>{cfg.label}</Badge></TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <select className="bg-background border border-border rounded px-2 py-1 text-xs" value={order.status} onChange={e => handleUpdateOrderStatus(order._id, e.target.value)}>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No shipment orders found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 'areas' && (
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Delivery Areas</CardTitle>
              <Button onClick={openNewArea}><Plus className="w-4 h-4 mr-2" />Add Area</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>City</TableHead><TableHead>Charge</TableHead><TableHead>Free Above</TableHead><TableHead>Est. Days</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {areas.map(area => (
                  <TableRow key={area._id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.city}</TableCell>
                    <TableCell>৳{area.deliveryCharge}</TableCell>
                    <TableCell>{area.freeDeliveryThreshold > 0 ? `৳${area.freeDeliveryThreshold}` : '—'}</TableCell>
                    <TableCell>{area.estimatedDeliveryDays} day(s)</TableCell>
                    <TableCell><Badge className={area.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{area.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditArea(area)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteArea(area._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {areas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No delivery areas found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingArea ? 'Edit Delivery Area' : 'Add Delivery Area'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Area Name</label><Input value={areaForm.name} onChange={e => setAreaForm({...areaForm, name: e.target.value})} placeholder="e.g. Dhaka Metro" /></div>
            <div><label className="text-sm font-medium">City</label><Input value={areaForm.city} onChange={e => setAreaForm({...areaForm, city: e.target.value})} placeholder="e.g. Dhaka" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Delivery Charge (৳)</label><Input type="number" value={areaForm.deliveryCharge} onChange={e => setAreaForm({...areaForm, deliveryCharge: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">Free Delivery Above</label><Input type="number" value={areaForm.freeDeliveryThreshold} onChange={e => setAreaForm({...areaForm, freeDeliveryThreshold: Number(e.target.value)})} /></div>
            </div>
            <div><label className="text-sm font-medium">Estimated Delivery Days</label><Input type="number" value={areaForm.estimatedDeliveryDays} onChange={e => setAreaForm({...areaForm, estimatedDeliveryDays: Number(e.target.value)})} /></div>
            <div><label className="text-sm font-medium">Postal Codes (comma separated)</label><Input value={areaForm.postalCodes} onChange={e => setAreaForm({...areaForm, postalCodes: e.target.value})} placeholder="1200, 1205, 1210" /></div>
            <Button onClick={handleSaveArea} className="w-full">{editingArea ? 'Update Area' : 'Create Area'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shipping Methods Tab */}
      {tab === 'methods' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>Shipping Methods</CardTitle><Button onClick={openNewMethod}><Plus className="w-4 h-4 mr-2" />Add Method</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Base Charge</TableHead><TableHead>Free Above</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {methods.map(m => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>৳{m.baseCharge}</TableCell>
                    <TableCell>{m.freeThreshold ? `৳${m.freeThreshold}` : '—'}</TableCell>
                    <TableCell><Badge className={m.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{m.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditMethod(m)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDeleteMethod(m._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {methods.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No shipping methods configured</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Shipping Method Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">Name</label><Input value={methodForm.name} onChange={e => setMethodForm({...methodForm, name: e.target.value})} placeholder="Standard Delivery" /></div>
            <div><label className="text-sm font-medium">Type</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm" value={methodForm.type} onChange={e => setMethodForm({...methodForm, type: e.target.value as ShippingMethod['type']})}>
                <option value="flat">Flat Rate</option><option value="weight">Weight Based</option><option value="free">Free Shipping</option><option value="cod">Cash on Delivery</option><option value="express">Express</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Base Charge (৳)</label><Input type="number" value={methodForm.baseCharge} onChange={e => setMethodForm({...methodForm, baseCharge: Number(e.target.value)})} /></div>
              <div><label className="text-sm font-medium">Free Threshold (৳)</label><Input type="number" value={methodForm.freeThreshold} onChange={e => setMethodForm({...methodForm, freeThreshold: Number(e.target.value)})} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={methodForm.isActive} onChange={e => setMethodForm({...methodForm, isActive: e.target.checked})} /><label className="text-sm">Active</label></div>
            <Button onClick={handleSaveMethod} className="w-full">{editingMethod ? 'Update' : 'Create'} Method</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
