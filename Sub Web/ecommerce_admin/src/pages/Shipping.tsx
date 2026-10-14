import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { shippingApi, DeliveryArea, ShippingStats, ShippingOrder, ShippingMethod } from '@/services/shippingService';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Truck, MapPin, Package, CheckCircle, Clock, Plus, Pencil, Trash2,
  Search, Settings, Eye, Edit, RefreshCw, ChevronDown, Save, Globe,
} from 'lucide-react';

// ── Bangladesh location data ──────────────────────────────────────────────────
const BD_DIVISIONS = ['Dhaka','Chittagong','Rajshahi','Khulna','Sylhet','Barisal','Rangpur','Mymensingh'];
const BD_DISTRICTS: Record<string, string[]> = {
  Dhaka:       ['Dhaka','Gazipur','Narayanganj','Narsingdi','Manikganj','Munshiganj','Rajbari','Shariatpur','Faridpur','Madaripur','Gopalganj','Kishoreganj','Tangail'],
  Chittagong:  ["Chittagong","Cox's Bazar","Comilla","Feni","Noakhali","Lakshmipur","Chandpur","Brahmanbaria","Khagrachhari","Rangamati","Bandarban"],
  Rajshahi:    ['Rajshahi','Bogura','Naogaon','Chapai Nawabganj','Natore','Sirajganj','Pabna','Joypurhat'],
  Khulna:      ['Khulna','Jessore','Satkhira','Bagerhat','Narail','Magura','Jhenaidah','Chuadanga','Kushtia','Meherpur'],
  Sylhet:      ['Sylhet','Moulvibazar','Habiganj','Sunamganj'],
  Barisal:     ['Barisal','Pirojpur','Bhola','Jhalokathi','Patuakhali','Barguna'],
  Rangpur:     ['Rangpur','Dinajpur','Kurigram','Gaibandha','Nilphamari','Panchagarh','Thakurgaon','Lalmonirhat'],
  Mymensingh:  ['Mymensingh','Jamalpur','Netrokona','Sherpur'],
};
const BD_AREAS: Record<string, string[]> = {
  Dhaka:         ['Dhanmondi','Mirpur','Gulshan','Banani','Uttara','Mohammadpur','Rayer Bazar','Badda','Khilgaon','Motijheel','Paltan','Old Dhaka','Demra','Jatrabari','Shyamoli','Lalmatia','Azimpur','Lalbagh','New Market','Kalabagan','Farmgate','Tejgaon','Rampura','Khilkhet','Vatara'],
  Gazipur:       ['Gazipur Sadar','Kaliakoir','Kapasia','Sreepur','Tongi'],
  Narayanganj:   ['Narayanganj Sadar','Araihazar','Bandar','Rupganj','Sonargaon'],
  Chittagong:    ['Agrabad','Anderkilla','Bakolia','Bayazid','Chandgaon','Chawkbazar','Double Mooring','Halishahar','Khulshi','Kotwali','Pahartali','Panchlaish','Patenga','Sholoshahar'],
  "Cox's Bazar": ["Cox's Bazar Sadar",'Chakaria','Maheshkhali','Ukhia','Teknaf','Kutubdia'],
  Comilla:       ['Comilla Sadar','Burichang','Chandina','Chauddagram','Daudkandi','Debidwar','Homna','Laksam','Monohorganj','Muradnagar'],
  Rajshahi:      ['Rajshahi Sadar','Boalia','Motihar','Rajpara','Shah Makhdum'],
  Khulna:        ['Khulna Sadar','Daulatpur','Khalishpur','Khanepur','Sonadanga'],
  Sylhet:        ['Sylhet Sadar','Beanibazar','Companiganj','Golapganj','Gowainghat','Jaintapur','Kanaighat','Osmaninagar'],
  Barisal:       ['Barisal Sadar','Agailjhara','Babuganj','Bakerganj','Banaripara','Gauranadi','Mehendiganj','Muladi','Wazirpur'],
  Rangpur:       ['Rangpur Sadar','Badarganj','Gangachara','Kaunia','Mithapukur','Pirgachha','Pirganj','Taraganj'],
  Mymensingh:    ['Mymensingh Sadar','Bhaluka','Dhobaura','Fulbaria','Gaffargaon','Gauripur','Haluaghat','Ishwarganj','Muktagachha','Nandail','Phulpur','Trishal'],
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface RateGroup { id: string; store: string; name: string; base: number; additional: number; }
interface Assignment { key: string; store: string; division: string; district: string; area: string; areaId: string; groupId: string; groupName?: string; }
interface Shipment {
  _id: string; shipmentNumber: string; orderId: string | number; sourceType: string; sourceLabel: string;
  status: string; courierName: string; trackingNumber: string; estimatedDaysMin: number; estimatedDaysMax: number;
  deliveryCharge: number; totalWeightKg: number; deliveredAt: string; createdAt: string; items?: any[]; trackingEvents?: any[];
}
interface Courier { _id: string; name: string; }
interface GroceryArea { _id: string; name: string; nameBn: string; isActive: boolean; }
interface GroceryDistrict { _id: string; name: string; nameBn: string; isActive: boolean; areas: GroceryArea[]; }
interface ShippingPolicy {
  _id: string; sourceType: string; divisionId: number; districtId: number; areaName: string;
  isInsideCity: boolean; baseWeightKg: number; baseCharge: number; extraChargePerKg: number;
  estimatedDaysMin: number; estimatedDaysMax: number; freeDeliveryThreshold: number | null; isActive: boolean;
}

// ── Status configs ─────────────────────────────────────────────────────────────
const SHIPPING_STATUS: Record<string, { label: string; className: string }> = {
  confirmed:        { label: 'Confirmed',        className: 'bg-blue-500/20 text-blue-400' },
  processing:       { label: 'Processing',       className: 'bg-primary/20 text-primary' },
  shipped:          { label: 'Shipped',          className: 'bg-chart-4/20 text-chart-4' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-500/20 text-cyan-400' },
  delivered:        { label: 'Delivered',        className: 'bg-success/20 text-success' },
};
const SHIPMENT_STATUS: Record<string, { label: string; className: string }> = {
  pending:          { label: 'Pending',          className: 'bg-warning/20 text-warning' },
  confirmed:        { label: 'Confirmed',        className: 'bg-blue-500/20 text-blue-400' },
  processing:       { label: 'Processing',       className: 'bg-chart-1/20 text-chart-1' },
  ready_for_pickup: { label: 'Ready for Pickup', className: 'bg-chart-4/20 text-chart-4' },
  picked_up:        { label: 'Picked Up',        className: 'bg-chart-3/20 text-chart-3' },
  in_transit:       { label: 'In Transit',       className: 'bg-chart-2/20 text-chart-2' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-500/20 text-cyan-400' },
  delivered:        { label: 'Delivered',        className: 'bg-success/20 text-success' },
  failed_delivery:  { label: 'Failed Delivery',  className: 'bg-destructive/20 text-destructive' },
  returned:         { label: 'Returned',         className: 'bg-muted text-muted-foreground' },
  cancelled:        { label: 'Cancelled',        className: 'bg-muted text-muted-foreground' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const mkGroupId  = (name: string) => `${slugify('main')}_${slugify(name)}_${Date.now()}`;
const mkAssignKey = (div: string, dist: string, area: string) =>
  `main|${div}|${dist}|${area}`.replace(/\s+/g, '_');

type Tab = 'shipments' | 'orders' | 'rate-groups' | 'assignments' | 'areas' | 'methods' | 'grocery' | 'policies';

export default function Shipping() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('shipments');

  // ── Shipping Orders (old system) ──────────────────────────────────────────
  const [stats, setStats]       = useState<ShippingStats | null>(null);
  const [orders, setOrders]     = useState<ShippingOrder[]>([]);
  const [areas, setAreas]       = useState<DeliveryArea[]>([]);
  const [methods, setMethods]   = useState<ShippingMethod[]>([]);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaDialogOpen, setAreaDialogOpen]     = useState(false);
  const [editingArea, setEditingArea]           = useState<DeliveryArea | null>(null);
  const [areaForm, setAreaForm] = useState({ name: '', city: '', deliveryCharge: 0, freeDeliveryThreshold: 0, estimatedDeliveryDays: 1, postalCodes: '' });
  const [methodDialogOpen, setMethodDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod]       = useState<ShippingMethod | null>(null);
  const [methodForm, setMethodForm] = useState({ name: '', type: 'flat' as ShippingMethod['type'], baseCharge: 0, freeThreshold: 0, isActive: true });

  // ── Shipments (full tracking) ──────────────────────────────────────────────
  const [shipments, setShipments]   = useState<Shipment[]>([]);
  const [couriers, setCouriers]     = useState<Courier[]>([]);
  const [shipSearch, setShipSearch] = useState('');
  const [shipStatus, setShipStatus] = useState('all');
  const [shipPage, setShipPage]     = useState(1);
  const [shipTotal, setShipTotal]   = useState(0);
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
  const [viewOpen, setViewOpen]         = useState(false);
  const [updateOpen, setUpdateOpen]     = useState(false);
  const [updateShipment, setUpdateShipment] = useState<Shipment | null>(null);
  const [updateForm, setUpdateForm] = useState({ status: '', courier_id: '', courier_name: '', tracking_number: '', description: '' });

  // ── Rate Groups ────────────────────────────────────────────────────────────
  const [groups, setGroups]         = useState<RateGroup[]>([]);
  const [groupsSaving, setGroupsSaving] = useState(false);
  const [newGroup, setNewGroup]     = useState({ name: '', base: '', additional: '' });

  // ── Fee Preview ────────────────────────────────────────────────────────────
  const [prevDiv, setPrevDiv]   = useState('');
  const [prevDist, setPrevDist] = useState('');
  const [prevArea, setPrevArea] = useState('');
  const [prevResult, setPrevResult] = useState<{ charge: number; matched: boolean; groupName?: string } | null>(null);
  const [prevLoading, setPrevLoading] = useState(false);

  // ── Area Assignments ───────────────────────────────────────────────────────
  const [assignments, setAssignments]   = useState<Assignment[]>([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [selDiv, setSelDiv]   = useState('');
  const [selDist, setSelDist] = useState('');
  const [selArea, setSelArea] = useState('');
  const [selGroup, setSelGroup] = useState('');

  // ── Grocery Coverage ───────────────────────────────────────────────────────
  const [groceryDistricts, setGroceryDistricts] = useState<GroceryDistrict[]>([]);
  const [gAreaDialogOpen, setGAreaDialogOpen]   = useState(false);
  const [gAreaForm, setGAreaForm] = useState({ district_id: '', name: '', name_bn: '' });
  const [gEditArea, setGEditArea] = useState<(GroceryArea & { districtId: string }) | null>(null);

  // ── Shipping Policies ──────────────────────────────────────────────────────
  const [policies, setPolicies]             = useState<ShippingPolicy[]>([]);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ area_name: '', is_inside_city: false, base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30', estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: '' });
  const [editPolicy, setEditPolicy] = useState<ShippingPolicy | null>(null);

  const [loading, setLoading] = useState(false);

  // ── Load all data ─────────────────────────────────────────────────────────
  const loadShippingOrders = useCallback(async () => {
    const [sRes, aRes, oRes, mRes] = await Promise.allSettled([
      shippingApi.getStats(), shippingApi.getAreas(), shippingApi.getOrders(), shippingApi.getMethods(),
    ]);
    if (sRes.status === 'fulfilled') setStats(sRes.value);
    if (aRes.status === 'fulfilled') setAreas(aRes.value);
    if (oRes.status === 'fulfilled') setOrders(oRes.value);
    if (mRes.status === 'fulfilled') setMethods(mRes.value);
  }, []);

  const loadShipments = useCallback(async () => {
    const params: any = { page: shipPage, limit: 20 };
    if (shipStatus !== 'all') params.status = shipStatus;
    const [sRes, cRes] = await Promise.allSettled([
      api.get('/shipments', { params }), api.get('/couriers'),
    ]);
    if (sRes.status === 'fulfilled') { setShipments(sRes.value.data.shipments || []); setShipTotal(sRes.value.data.total || 0); }
    if (cRes.status === 'fulfilled') setCouriers(cRes.value.data || []);
  }, [shipPage, shipStatus]);

  const loadRates = useCallback(async () => {
    const [gRes, aRes] = await Promise.allSettled([
      api.get('/delivery-rates/rate-groups'), api.get('/delivery-rates/assignments'),
    ]);
    if (gRes.status === 'fulfilled') setGroups(gRes.value.data);
    if (aRes.status === 'fulfilled') setAssignments(aRes.value.data);
  }, []);

  const loadCoverage = useCallback(async () => {
    const [gRes, pRes] = await Promise.allSettled([
      api.get('/delivery-coverage/grocery/districts'),
      api.get('/delivery-coverage/shipping-policies'),
    ]);
    if (gRes.status === 'fulfilled') setGroceryDistricts(gRes.value.data || []);
    if (pRes.status === 'fulfilled') setPolicies(pRes.value.data || []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([loadShippingOrders(), loadShipments(), loadRates(), loadCoverage()])
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadShipments(); }, [shipPage, shipStatus]);

  // ── Orders ──────────────────────────────────────────────────────────────────
  const filteredOrders = orders.filter(o => {
    const name = (o.customerId && typeof o.customerId === 'object') ? (o.customerId as any).name : '';
    return (!search || name.toLowerCase().includes(search.toLowerCase()) || o.orderNumber?.toLowerCase().includes(search.toLowerCase()))
      && (statusFilter === 'all' || o.status === statusFilter);
  });
  const updateOrderStatus = async (id: string, status: string) => {
    try { await shippingApi.updateOrderStatus(id, status); toast.success('Status updated'); loadShippingOrders(); }
    catch { toast.error('Failed'); }
  };

  // ── Areas ───────────────────────────────────────────────────────────────────
  const saveArea = async () => {
    try {
      const data = { ...areaForm, postalCodes: areaForm.postalCodes.split(',').map(s => s.trim()).filter(Boolean) };
      if (editingArea) { await shippingApi.updateArea(editingArea._id, data); toast.success('Area updated'); }
      else { await shippingApi.createArea(data); toast.success('Area created'); }
      setAreaDialogOpen(false); setEditingArea(null); loadShippingOrders();
    } catch { toast.error('Failed to save area'); }
  };
  const deleteArea = async (id: string) => {
    if (!confirm('Delete this delivery area?')) return;
    try { await shippingApi.deleteArea(id); toast.success('Deleted'); loadShippingOrders(); } catch { toast.error('Failed'); }
  };
  const openEditArea = (a: DeliveryArea) => {
    setEditingArea(a);
    setAreaForm({ name: a.name, city: a.city, deliveryCharge: a.deliveryCharge, freeDeliveryThreshold: a.freeDeliveryThreshold, estimatedDeliveryDays: a.estimatedDeliveryDays, postalCodes: a.postalCodes.join(', ') });
    setAreaDialogOpen(true);
  };

  // ── Methods ─────────────────────────────────────────────────────────────────
  const saveMethod = async () => {
    try {
      if (editingMethod) { await shippingApi.updateMethod(editingMethod._id, methodForm); toast.success('Method updated'); }
      else { await shippingApi.createMethod(methodForm); toast.success('Method created'); }
      setMethodDialogOpen(false); loadShippingOrders();
    } catch { toast.error('Failed to save method'); }
  };
  const deleteMethod = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await shippingApi.deleteMethod(id); toast.success('Deleted'); loadShippingOrders(); } catch { toast.error('Failed'); }
  };
  const openEditMethod = (m: ShippingMethod) => {
    setEditingMethod(m);
    setMethodForm({ name: m.name, type: m.type, baseCharge: m.baseCharge, freeThreshold: m.freeThreshold || 0, isActive: m.isActive });
    setMethodDialogOpen(true);
  };

  // ── Shipments ───────────────────────────────────────────────────────────────
  const openViewShipment = async (s: Shipment) => {
    try { const { data } = await api.get(`/shipments/${s._id}`); setViewShipment(data); setViewOpen(true); }
    catch { toast.error('Failed to load details'); }
  };
  const openUpdateShipment = (s: Shipment) => {
    setUpdateShipment(s);
    setUpdateForm({ status: s.status, courier_id: '', courier_name: s.courierName || '', tracking_number: s.trackingNumber || '', description: '' });
    setUpdateOpen(true);
  };
  const submitShipmentUpdate = async () => {
    if (!updateShipment) return;
    try { await api.put(`/shipments/${updateShipment._id}/status`, updateForm); toast.success('Shipment updated'); setUpdateOpen(false); loadShipments(); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const filteredShipments = shipments.filter(s =>
    !shipSearch || s.shipmentNumber?.toLowerCase().includes(shipSearch.toLowerCase()) ||
    String(s.orderId).includes(shipSearch) || s.trackingNumber?.toLowerCase().includes(shipSearch.toLowerCase())
  );

  // ── Rate Groups ──────────────────────────────────────────────────────────────
  const addGroup = () => {
    const name = newGroup.name.trim();
    if (!name) return toast.error('Group name required');
    setGroups(g => [...g, { id: mkGroupId(name), store: 'main', name, base: parseFloat(newGroup.base) || 0, additional: parseFloat(newGroup.additional) || 0 }]);
    setNewGroup({ name: '', base: '', additional: '' });
  };
  const saveGroups = async () => {
    setGroupsSaving(true);
    try { await api.post('/delivery-rates/rate-groups/sync', groups); toast.success('Rate groups saved'); loadRates(); }
    catch { toast.error('Failed to save'); } finally { setGroupsSaving(false); }
  };
  const previewFee = async () => {
    if (!prevDist) return toast.error('Select a district first');
    setPrevLoading(true); setPrevResult(null);
    try {
      const params = new URLSearchParams({ district: prevDist });
      if (prevArea) params.append('area', prevArea);
      const { data } = await api.get(`/delivery-rates/charge?${params}`);
      setPrevResult(data);
    } catch { setPrevResult({ charge: 0, matched: false }); }
    finally { setPrevLoading(false); }
  };

  // ── Area Assignments ─────────────────────────────────────────────────────────
  const addAssignment = () => {
    if (!selDist) return toast.error('Select a district');
    if (!selGroup) return toast.error('Select a rate group');
    const key = mkAssignKey(selDiv, selDist, selArea);
    if (assignments.find(a => a.key === key)) return toast.error('Already assigned');
    const group = groups.find(g => g.id === selGroup);
    setAssignments(a => [...a, { key, store: 'main', division: selDiv, district: selDist, area: selArea, areaId: selArea || selDist, groupId: selGroup, groupName: group?.name }]);
    setSelArea('');
  };
  const saveAssignments = async () => {
    setAssignSaving(true);
    try { await api.post('/delivery-rates/assignments/sync', assignments); toast.success('Assignments saved'); loadRates(); }
    catch { toast.error('Failed'); } finally { setAssignSaving(false); }
  };
  const districtList  = selDiv  ? (BD_DISTRICTS[selDiv]  || []) : [];
  const areaList      = selDist ? (BD_AREAS[selDist]     || []) : [];

  // ── Grocery Coverage ─────────────────────────────────────────────────────────
  const toggleGroceryArea = async (area: GroceryArea) => {
    try { await api.put(`/delivery-coverage/grocery/areas/${area._id}`, { is_active: area.isActive ? 0 : 1 }); toast.success('Updated'); loadCoverage(); }
    catch { toast.error('Failed'); }
  };
  const saveGroceryArea = async () => {
    try {
      if (gEditArea) { await api.put(`/delivery-coverage/grocery/areas/${gEditArea._id}`, { name: gAreaForm.name, name_bn: gAreaForm.name_bn }); toast.success('Area updated'); }
      else { await api.post('/delivery-coverage/grocery/areas', gAreaForm); toast.success('Area added'); }
      setGAreaDialogOpen(false); loadCoverage();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  // ── Shipping Policies ─────────────────────────────────────────────────────────
  const savePolicy = async () => {
    try {
      const payload = { ...policyForm, base_weight_kg: Number(policyForm.base_weight_kg), base_charge: Number(policyForm.base_charge), extra_charge_per_kg: Number(policyForm.extra_charge_per_kg), estimated_days_min: Number(policyForm.estimated_days_min), estimated_days_max: Number(policyForm.estimated_days_max), free_delivery_threshold: policyForm.free_delivery_threshold ? Number(policyForm.free_delivery_threshold) : null, is_inside_city: policyForm.is_inside_city ? 1 : 0 };
      if (editPolicy) { await api.put(`/delivery-coverage/shipping-policies/${editPolicy._id}`, payload); toast.success('Policy updated'); }
      else { await api.post('/delivery-coverage/shipping-policies', { source_type: 'sholok', source_id: 1, ...payload }); toast.success('Policy created'); }
      setPolicyDialogOpen(false); loadCoverage();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };
  const openEditPolicy = (p: ShippingPolicy) => {
    setEditPolicy(p);
    setPolicyForm({ area_name: p.areaName || '', is_inside_city: p.isInsideCity, base_weight_kg: String(p.baseWeightKg), base_charge: String(p.baseCharge), extra_charge_per_kg: String(p.extraChargePerKg), estimated_days_min: String(p.estimatedDaysMin), estimated_days_max: String(p.estimatedDaysMax), free_delivery_threshold: p.freeDeliveryThreshold ? String(p.freeDeliveryThreshold) : '' });
    setPolicyDialogOpen(true);
  };

  // ── Tab button helper ─────────────────────────────────────────────────────────
  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button onClick={() => setTab(id)} className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors border-b-2 ${tab === id ? 'border-primary text-primary bg-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('shippingManagement')}</h1>
          <p className="text-muted-foreground">{t('manageDeliveryAreas')}</p>
        </div>
        <Button variant="outline" onClick={() => { loadShippingOrders(); loadShipments(); loadRates(); loadCoverage(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />{t('refresh')}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{t('pendingShipment')}</p><p className="text-2xl font-bold">{stats.pendingShipment}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Truck className="w-5 h-5 text-warning" /></div><div><p className="text-sm text-muted-foreground">{t('shippedInTransit')}</p><p className="text-2xl font-bold">{stats.shippedOrders + stats.outForDelivery}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success" /></div><div><p className="text-sm text-muted-foreground">{t('delivered')}</p><p className="text-2xl font-bold">{stats.deliveredOrders}</p></div></CardContent></Card>
          <Card className="glass-card border-border"><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center"><MapPin className="w-5 h-5 text-chart-4" /></div><div><p className="text-sm text-muted-foreground">{t('activeAreas')}</p><p className="text-2xl font-bold">{stats.activeAreas}</p></div></CardContent></Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        <TabBtn id="shipments"   label="Shipments" />
        <TabBtn id="orders"      label="Orders" />
        <TabBtn id="rate-groups" label="Rate Groups" />
        <TabBtn id="assignments" label="Area Assignments" />
        <TabBtn id="areas"       label="Delivery Areas" />
        <TabBtn id="methods"     label="Methods" />
        <TabBtn id="grocery"     label="Grocery Coverage" />
        <TabBtn id="policies"    label="Policies" />
      </div>

      {/* ════ SHIPMENTS TAB ════════════════════════════════════════════════ */}
      {tab === 'shipments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[{ label: 'Total', count: shipTotal, icon: Package, color: 'text-primary' }, { label: 'Pending', count: shipments.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-warning' }, { label: 'In Transit', count: shipments.filter(s => s.status === 'in_transit').length, icon: Truck, color: 'text-chart-2' }, { label: 'Delivered', count: shipments.filter(s => s.status === 'delivered').length, icon: CheckCircle, color: 'text-success' }].map(({ label, count, icon: Icon, color }) => (
              <Card key={label}><CardContent className="pt-4 pb-4"><div className="flex items-center gap-3"><Icon className={`w-7 h-7 ${color}`} /><div><p className="text-xl font-bold">{count}</p><p className="text-muted-foreground text-xs">{label}</p></div></div></CardContent></Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search shipments..." className="pl-9" value={shipSearch} onChange={e => setShipSearch(e.target.value)} /></div>
                <Select value={shipStatus} onValueChange={v => { setShipStatus(v); setShipPage(1); }}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="All Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.keys(SHIPMENT_STATUS).map(s => <SelectItem key={s} value={s}>{SHIPMENT_STATUS[s].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Shipment #</TableHead><TableHead>Order</TableHead><TableHead>Source</TableHead><TableHead>Status</TableHead><TableHead>Courier</TableHead><TableHead>Tracking</TableHead><TableHead>Charge</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredShipments.map(s => (
                    <TableRow key={s._id}>
                      <TableCell className="font-mono text-sm font-medium">{s.shipmentNumber}</TableCell>
                      <TableCell>#{s.orderId}</TableCell>
                      <TableCell><Badge variant="outline">{s.sourceType}{s.sourceLabel ? ` · ${s.sourceLabel}` : ''}</Badge></TableCell>
                      <TableCell><Badge className={SHIPMENT_STATUS[s.status]?.className || 'bg-muted text-muted-foreground'}>{SHIPMENT_STATUS[s.status]?.label || s.status}</Badge></TableCell>
                      <TableCell className="text-sm">{s.courierName || '—'}</TableCell>
                      <TableCell className="font-mono text-xs">{s.trackingNumber || '—'}</TableCell>
                      <TableCell>৳{s.deliveryCharge?.toLocaleString()}</TableCell>
                      <TableCell><div className="flex items-center gap-1"><Button size="sm" variant="outline" onClick={() => openViewShipment(s)}><Eye className="w-3 h-3" /></Button><Button size="sm" variant="outline" onClick={() => openUpdateShipment(s)}><Edit className="w-3 h-3" /></Button></div></TableCell>
                    </TableRow>
                  ))}
                  {filteredShipments.length === 0 && <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No shipments found</TableCell></TableRow>}
                </TableBody>
              </Table>
              {shipTotal > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={shipPage === 1} onClick={() => setShipPage(p => p - 1)}>Previous</Button>
                  <span className="py-2 text-sm text-muted-foreground">Page {shipPage} of {Math.ceil(shipTotal / 20)}</span>
                  <Button variant="outline" size="sm" disabled={shipPage * 20 >= shipTotal} onClick={() => setShipPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ ORDERS TAB ════════════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <Card className="glass-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle>{t('shipmentOrders')}</CardTitle>
              <div className="flex gap-2">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder={t('searchOrders')} className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} /></div>
                <select className="bg-background border border-border rounded-md px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  {Object.keys(SHIPPING_STATUS).map(s => <option key={s} value={s}>{SHIPPING_STATUS[s].label}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('order')}</TableHead><TableHead>{t('customer')}</TableHead><TableHead>{t('total')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('date')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const customerName = (order.customerId && typeof order.customerId === 'object') ? (order.customerId as any).name : 'N/A';
                  const cfg = SHIPPING_STATUS[order.status] || { label: order.status, className: 'bg-muted text-muted-foreground' };
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>৳{Number(order.total || 0).toFixed(2)}</TableCell>
                      <TableCell><Badge className={cfg.className}>{cfg.label}</Badge></TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <select className="bg-background border border-border rounded px-2 py-1 text-xs" value={order.status} onChange={e => updateOrderStatus(order._id, e.target.value)}>
                          {Object.entries(SHIPPING_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredOrders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noShipmentOrders')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════ RATE GROUPS TAB ══════════════════════════════════════════════ */}
      {tab === 'rate-groups' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">Add New Rate Group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Group Name *</label><Input value={newGroup.name} onChange={e => setNewGroup(g => ({ ...g, name: e.target.value }))} placeholder="e.g. Dhaka City" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Base Rate (৳) *</label><Input type="number" min="0" value={newGroup.base} onChange={e => setNewGroup(g => ({ ...g, base: e.target.value }))} placeholder="60" /></div>
              <div><label className="text-xs font-medium text-muted-foreground block mb-1">Additional / kg (৳)</label><Input type="number" min="0" value={newGroup.additional} onChange={e => setNewGroup(g => ({ ...g, additional: e.target.value }))} placeholder="20" /></div>
            </div>
            <Button onClick={addGroup} className="mt-3"><Plus className="w-4 h-4 mr-2" />Add Group</Button>
          </div>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">{groups.length} Rate Groups</CardTitle>
              <Button size="sm" onClick={saveGroups} disabled={groupsSaving}><Save className="w-4 h-4 mr-1" />{groupsSaving ? 'Saving…' : 'Save All'}</Button>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Base Rate (৳)</TableHead><TableHead>Additional/kg (৳)</TableHead><TableHead>Example 1kg</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {groups.map(g => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.name}</TableCell>
                      <TableCell><Input type="number" min="0" value={g.base} className="w-24 h-8 text-sm" onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, base: parseFloat(e.target.value) || 0 } : x))} /></TableCell>
                      <TableCell><Input type="number" min="0" value={g.additional} className="w-24 h-8 text-sm" onChange={e => setGroups(gs => gs.map(x => x.id === g.id ? { ...x, additional: parseFloat(e.target.value) || 0 } : x))} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">৳{g.base}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => setGroups(gs => gs.filter(x => x.id !== g.id))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {groups.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No rate groups yet. Add one above.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fee Preview */}
          <Card className="border-border border-dashed">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse inline-block"></span>
                Checkout Fee Preview — Test what a customer will pay
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">Select a location below to see exactly which Rate Group matches and what delivery fee the customer will see at checkout.</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Division</label>
                  <div className="relative">
                    <select value={prevDiv} onChange={e => { setPrevDiv(e.target.value); setPrevDist(''); setPrevArea(''); setPrevResult(null); }} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8">
                      <option value="">All</option>
                      {BD_DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">District *</label>
                  <div className="relative">
                    <select value={prevDist} onChange={e => { setPrevDist(e.target.value); setPrevArea(''); setPrevResult(null); }} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8">
                      <option value="">Select</option>
                      {(prevDiv ? BD_DISTRICTS[prevDiv] || [] : Object.values(BD_DISTRICTS).flat()).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Area (optional)</label>
                  <div className="relative">
                    <select value={prevArea} onChange={e => { setPrevArea(e.target.value); setPrevResult(null); }} disabled={!prevDist} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background pr-8 disabled:opacity-50">
                      <option value="">All areas</option>
                      {(BD_AREAS[prevDist] || []).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <Button onClick={previewFee} disabled={prevLoading || !prevDist} className="w-full">
                  {prevLoading ? 'Calculating…' : 'Check Fee'}
                </Button>
              </div>
              {prevResult && (
                <div className={`mt-3 p-4 rounded-lg border flex items-center gap-4 ${prevResult.matched ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'}`}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{prevResult.matched ? `৳${prevResult.charge} delivery fee` : 'No matching rate group — default fee applies'}</p>
                    {prevResult.matched && prevResult.groupName && <p className="text-xs text-muted-foreground mt-0.5">Matched group: <strong>{prevResult.groupName}</strong></p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Location: {[prevDiv, prevDist, prevArea].filter(Boolean).join(' › ')}</p>
                  </div>
                  <div className={`text-3xl font-bold ${prevResult.matched ? 'text-success' : 'text-warning'}`}>
                    {prevResult.matched ? `৳${prevResult.charge}` : '—'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ AREA ASSIGNMENTS TAB ══════════════════════════════════════════ */}
      {tab === 'assignments' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-base font-semibold mb-4">Assign Area to Rate Group</h2>
            {groups.length === 0 ? <p className="text-sm text-muted-foreground">First create rate groups in the "Rate Groups" tab.</p> : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Division', val: selDiv, onChange: (v: string) => { setSelDiv(v); setSelDist(''); setSelArea(''); }, opts: BD_DIVISIONS, placeholder: 'All Divisions' },
                    { label: 'District *', val: selDist, onChange: (v: string) => { setSelDist(v); setSelArea(''); }, opts: districtList, placeholder: 'Select District' },
                    { label: 'Area (optional)', val: selArea, onChange: (v: string) => setSelArea(v), opts: areaList, placeholder: 'All Areas', disabled: !selDist },
                  ].map(({ label, val, onChange, opts, placeholder, disabled }) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">{label}</label>
                      <div className="relative">
                        <select value={val} onChange={e => onChange(e.target.value)} disabled={disabled} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8 disabled:opacity-50">
                          <option value="">{placeholder}</option>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Rate Group *</label>
                    <div className="relative">
                      <select value={selGroup} onChange={e => setSelGroup(e.target.value)} className="w-full appearance-none border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pr-8">
                        <option value="">Select Group</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name} (৳{g.base})</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <Button onClick={addAssignment} className="mt-3"><Plus className="w-4 h-4 mr-2" />Add Assignment</Button>
              </>
            )}
          </div>
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between py-3">
              <CardTitle className="text-sm">{assignments.length} Assignments</CardTitle>
              <Button size="sm" onClick={saveAssignments} disabled={assignSaving}><Save className="w-4 h-4 mr-1" />{assignSaving ? 'Saving…' : 'Save All'}</Button>
            </CardHeader>
            <CardContent className="pt-0 overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Division</TableHead><TableHead>District</TableHead><TableHead>Area</TableHead><TableHead>Rate Group</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {assignments.map(a => (
                    <TableRow key={a.key}>
                      <TableCell>{a.division || '—'}</TableCell>
                      <TableCell>{a.district}</TableCell>
                      <TableCell className="text-muted-foreground">{a.area || <span className="italic text-xs">All areas</span>}</TableCell>
                      <TableCell><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{a.groupName || a.groupId}</span></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => setAssignments(as => as.filter(x => x.key !== a.key))}><Trash2 className="w-4 h-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {assignments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No assignments yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ DELIVERY AREAS TAB ════════════════════════════════════════════ */}
      {tab === 'areas' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('deliveryAreas')}</CardTitle><Button onClick={() => { setEditingArea(null); setAreaForm({ name: '', city: '', deliveryCharge: 0, freeDeliveryThreshold: 0, estimatedDeliveryDays: 1, postalCodes: '' }); setAreaDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{t('addArea')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('name')}</TableHead><TableHead>{t('city')}</TableHead><TableHead>{t('charge')}</TableHead><TableHead>{t('freeAbove')}</TableHead><TableHead>{t('estDays')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {areas.map(area => (
                  <TableRow key={area._id}>
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>{area.city}</TableCell>
                    <TableCell>৳{area.deliveryCharge}</TableCell>
                    <TableCell>{area.freeDeliveryThreshold > 0 ? `৳${area.freeDeliveryThreshold}` : '—'}</TableCell>
                    <TableCell>{area.estimatedDeliveryDays} day(s)</TableCell>
                    <TableCell><Badge className={area.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{area.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditArea(area)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteArea(area._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {areas.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('noDeliveryAreas')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════ SHIPPING METHODS TAB ══════════════════════════════════════════ */}
      {tab === 'methods' && (
        <Card className="glass-card border-border">
          <CardHeader><div className="flex items-center justify-between"><CardTitle>{t('shippingMethods')}</CardTitle><Button onClick={() => { setEditingMethod(null); setMethodForm({ name: '', type: 'flat', baseCharge: 0, freeThreshold: 0, isActive: true }); setMethodDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />{t('addMethod')}</Button></div></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('name')}</TableHead><TableHead>{t('type')}</TableHead><TableHead>{t('baseCharge')}</TableHead><TableHead>{t('freeAbove')}</TableHead><TableHead>{t('status')}</TableHead><TableHead>{t('actions')}</TableHead></TableRow></TableHeader>
              <TableBody>
                {methods.map(m => (
                  <TableRow key={m._id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="capitalize">{m.type}</TableCell>
                    <TableCell>৳{m.baseCharge}</TableCell>
                    <TableCell>{m.freeThreshold ? `৳${m.freeThreshold}` : '—'}</TableCell>
                    <TableCell><Badge className={m.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{m.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" onClick={() => openEditMethod(m)}><Pencil className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => deleteMethod(m._id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {methods.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{t('noShippingMethods')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ════ GROCERY COVERAGE TAB ══════════════════════════════════════════ */}
      {tab === 'grocery' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Grocery delivery is limited to specific districts and areas. Toggle to enable/disable.</p>
          {loading ? <p className="text-center py-8 text-muted-foreground">Loading…</p> : groceryDistricts.map(district => (
            <Card key={district._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{district.name}</CardTitle>
                  <Button size="sm" onClick={() => { setGEditArea(null); setGAreaForm({ district_id: String(district._id), name: '', name_bn: '' }); setGAreaDialogOpen(true); }}>
                    <Plus className="w-3 h-3 mr-1" />{t('addArea')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {district.areas.map(area => (
                    <div key={area._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="text-sm truncate mr-2">{area.name}</span>
                      <Switch checked={area.isActive} onCheckedChange={() => toggleGroceryArea(area)} />
                    </div>
                  ))}
                  {district.areas.length === 0 && <p className="text-sm text-muted-foreground col-span-4">No areas added yet.</p>}
                </div>
              </CardContent>
            </Card>
          ))}
          {groceryDistricts.length === 0 && !loading && <div className="text-center py-12 text-muted-foreground">No grocery districts found.</div>}
        </div>
      )}

      {/* ════ SHIPPING POLICIES TAB ═════════════════════════════════════════ */}
      {tab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Weight-based shipping policies for different zones.</p>
            <Button onClick={() => { setEditPolicy(null); setPolicyForm({ area_name: '', is_inside_city: false, base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30', estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: '' }); setPolicyDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add Policy</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader><TableRow><TableHead>Zone / Area</TableHead><TableHead>Type</TableHead><TableHead>Base Charge</TableHead><TableHead>Extra/kg</TableHead><TableHead>ETA</TableHead><TableHead>Free Above</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {policies.map(p => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.areaName || `District #${p.districtId}` || 'Default'}</TableCell>
                      <TableCell><Badge className={p.isInsideCity ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>{p.isInsideCity ? 'Inside City' : 'Nationwide'}</Badge></TableCell>
                      <TableCell>৳{p.baseCharge} / {p.baseWeightKg}kg</TableCell>
                      <TableCell>৳{p.extraChargePerKg}</TableCell>
                      <TableCell>{p.estimatedDaysMin}–{p.estimatedDaysMax} days</TableCell>
                      <TableCell>{p.freeDeliveryThreshold ? `৳${p.freeDeliveryThreshold}` : '—'}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={() => openEditPolicy(p)}><Edit className="w-3 h-3" /></Button></TableCell>
                    </TableRow>
                  ))}
                  {policies.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No policies found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ DIALOGS ════════════════════════════════════════════════════════ */}

      {/* Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingArea ? t('editDeliveryArea') : t('addDeliveryArea')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('areaName')}</label><Input value={areaForm.name} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="e.g. Dhaka Metro" /></div>
            <div><label className="text-sm font-medium">{t('city')}</label><Input value={areaForm.city} onChange={e => setAreaForm({ ...areaForm, city: e.target.value })} placeholder="e.g. Dhaka" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('deliveryCharge')} (৳)</label><Input type="number" value={areaForm.deliveryCharge} onChange={e => setAreaForm({ ...areaForm, deliveryCharge: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">{t('freeDeliveryAbove')}</label><Input type="number" value={areaForm.freeDeliveryThreshold} onChange={e => setAreaForm({ ...areaForm, freeDeliveryThreshold: Number(e.target.value) })} /></div>
            </div>
            <div><label className="text-sm font-medium">{t('estDeliveryDays')}</label><Input type="number" value={areaForm.estimatedDeliveryDays} onChange={e => setAreaForm({ ...areaForm, estimatedDeliveryDays: Number(e.target.value) })} /></div>
            <div><label className="text-sm font-medium">{t('postalCodes')}</label><Input value={areaForm.postalCodes} onChange={e => setAreaForm({ ...areaForm, postalCodes: e.target.value })} placeholder="1200, 1205" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setAreaDialogOpen(false)}>Cancel</Button><Button onClick={saveArea}>{editingArea ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Method Dialog */}
      <Dialog open={methodDialogOpen} onOpenChange={setMethodDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingMethod ? t('editShippingMethod') : t('addShippingMethod')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">{t('name')}</label><Input value={methodForm.name} onChange={e => setMethodForm({ ...methodForm, name: e.target.value })} placeholder="Standard Delivery" /></div>
            <div><label className="text-sm font-medium">{t('type')}</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" value={methodForm.type} onChange={e => setMethodForm({ ...methodForm, type: e.target.value as ShippingMethod['type'] })}>
                <option value="flat">Flat Rate</option><option value="weight">Weight Based</option><option value="free">Free Shipping</option><option value="cod">Cash on Delivery</option><option value="express">Express</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">{t('baseCharge')} (৳)</label><Input type="number" value={methodForm.baseCharge} onChange={e => setMethodForm({ ...methodForm, baseCharge: Number(e.target.value) })} /></div>
              <div><label className="text-sm font-medium">{t('freeThreshold')} (৳)</label><Input type="number" value={methodForm.freeThreshold} onChange={e => setMethodForm({ ...methodForm, freeThreshold: Number(e.target.value) })} /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={methodForm.isActive} onChange={e => setMethodForm({ ...methodForm, isActive: e.target.checked })} /><label className="text-sm">{t('active')}</label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMethodDialogOpen(false)}>Cancel</Button><Button onClick={saveMethod}>{editingMethod ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Shipment Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Shipment Details — {viewShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          {viewShipment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Order:</span> <span className="font-medium">#{viewShipment.orderId}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={SHIPMENT_STATUS[viewShipment.status]?.className}>{SHIPMENT_STATUS[viewShipment.status]?.label}</Badge></div>
                <div><span className="text-muted-foreground">Courier:</span> <span>{viewShipment.courierName || '—'}</span></div>
                <div><span className="text-muted-foreground">Tracking:</span> <span className="font-mono">{viewShipment.trackingNumber || '—'}</span></div>
                <div><span className="text-muted-foreground">Weight:</span> <span>{viewShipment.totalWeightKg ? `${viewShipment.totalWeightKg} kg` : '—'}</span></div>
                <div><span className="text-muted-foreground">Charge:</span> <span>৳{viewShipment.deliveryCharge}</span></div>
                <div><span className="text-muted-foreground">ETA:</span> <span>{viewShipment.estimatedDaysMin}–{viewShipment.estimatedDaysMax} days</span></div>
              </div>
              {viewShipment.items && viewShipment.items.length > 0 && (
                <div><p className="font-medium mb-2">Items ({viewShipment.items.length})</p>
                  <div className="space-y-1">{viewShipment.items.map((item: any, i: number) => <div key={i} className="flex justify-between text-sm py-1 border-b"><span>{item.product_name || `Product #${item.product_id}`}</span><span>x{item.quantity}</span></div>)}</div>
                </div>
              )}
              {viewShipment.trackingEvents && viewShipment.trackingEvents.length > 0 && (
                <div><p className="font-medium mb-2">Tracking History</p>
                  <div className="space-y-2">{viewShipment.trackingEvents.map((ev: any, i: number) => <div key={i} className="flex gap-3 text-sm"><span className="text-muted-foreground whitespace-nowrap">{new Date(ev.created_at).toLocaleDateString()}</span><Badge className={SHIPMENT_STATUS[ev.status]?.className || 'bg-muted text-muted-foreground'} variant="outline">{SHIPMENT_STATUS[ev.status]?.label || ev.status}</Badge>{ev.description && <span className="text-muted-foreground">{ev.description}</span>}</div>)}</div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Shipment Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Shipment — {updateShipment?.shipmentNumber}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Status *</label>
              <Select value={updateForm.status} onValueChange={v => setUpdateForm(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.keys(SHIPMENT_STATUS).map(s => <SelectItem key={s} value={s}>{SHIPMENT_STATUS[s].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Courier</label>
              <Select value={updateForm.courier_id} onValueChange={v => { const c = couriers.find(c => c._id === v); setUpdateForm(p => ({ ...p, courier_id: v, courier_name: c?.name || '' })); }}>
                <SelectTrigger><SelectValue placeholder="Select Courier" /></SelectTrigger>
                <SelectContent>{couriers.map(c => <SelectItem key={c._id} value={String(c._id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Tracking Number</label><Input value={updateForm.tracking_number} onChange={e => setUpdateForm(p => ({ ...p, tracking_number: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Note</label><Input value={updateForm.description} onChange={e => setUpdateForm(p => ({ ...p, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setUpdateOpen(false)}>Cancel</Button><Button onClick={submitShipmentUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grocery Area Dialog */}
      <Dialog open={gAreaDialogOpen} onOpenChange={setGAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{gEditArea ? 'Edit Area' : 'Add Grocery Area'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Area Name (English)</label><Input value={gAreaForm.name} onChange={e => setGAreaForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Area Name (Bengali)</label><Input value={gAreaForm.name_bn} onChange={e => setGAreaForm(p => ({ ...p, name_bn: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setGAreaDialogOpen(false)}>Cancel</Button><Button onClick={saveGroceryArea}>{gEditArea ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editPolicy ? 'Edit Shipping Policy' : 'Add Shipping Policy'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Zone / Area Name</label><Input value={policyForm.area_name} onChange={e => setPolicyForm(p => ({ ...p, area_name: e.target.value }))} placeholder="e.g. Dhaka City" /></div>
            <div className="col-span-2 flex items-center gap-3"><Switch checked={policyForm.is_inside_city} onCheckedChange={v => setPolicyForm(p => ({ ...p, is_inside_city: v }))} /><label className="text-sm">Inside City (faster delivery)</label></div>
            <div><label className="text-sm font-medium mb-1 block">Base Weight (kg)</label><Input type="number" value={policyForm.base_weight_kg} onChange={e => setPolicyForm(p => ({ ...p, base_weight_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Base Charge (৳)</label><Input type="number" value={policyForm.base_charge} onChange={e => setPolicyForm(p => ({ ...p, base_charge: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Extra/kg (৳)</label><Input type="number" value={policyForm.extra_charge_per_kg} onChange={e => setPolicyForm(p => ({ ...p, extra_charge_per_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Free Threshold (৳)</label><Input type="number" value={policyForm.free_delivery_threshold} onChange={e => setPolicyForm(p => ({ ...p, free_delivery_threshold: e.target.value }))} placeholder="Optional" /></div>
            <div><label className="text-sm font-medium mb-1 block">ETA Min (days)</label><Input type="number" value={policyForm.estimated_days_min} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_min: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">ETA Max (days)</label><Input type="number" value={policyForm.estimated_days_max} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_max: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>Cancel</Button><Button onClick={savePolicy}>{editPolicy ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
