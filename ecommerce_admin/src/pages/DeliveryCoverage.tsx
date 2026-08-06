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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, MapPin, Globe, Edit, Trash2 } from 'lucide-react';

interface GroceryDistrict {
  _id: string;
  name: string;
  nameBn: string;
  isActive: boolean;
  areas: GroceryArea[];
}
interface GroceryArea {
  _id: string;
  name: string;
  nameBn: string;
  isActive: boolean;
}
interface ShippingPolicy {
  _id: string;
  sourceType: string;
  divisionId: number;
  districtId: number;
  areaName: string;
  isInsideCity: boolean;
  baseWeightKg: number;
  baseCharge: number;
  extraChargePerKg: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  freeDeliveryThreshold: number | null;
  isActive: boolean;
}

export default function DeliveryCoverage() {
  const { t } = useLanguage();
  const [groceryDistricts, setGroceryDistricts] = useState<GroceryDistrict[]>([]);
  const [policies, setPolicies] = useState<ShippingPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Grocery area dialog
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaForm, setAreaForm] = useState({ district_id: '', name: '', name_bn: '' });
  const [editArea, setEditArea] = useState<GroceryArea & { districtId: string } | null>(null);

  // Policy dialog
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    area_name: '', is_inside_city: false,
    base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30',
    estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: ''
  });
  const [editPolicy, setEditPolicy] = useState<ShippingPolicy | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, pRes] = await Promise.allSettled([
        api.get('/delivery-coverage/grocery/districts'),
        api.get('/delivery-coverage/shipping-policies'),
      ]);
      if (gRes.status === 'fulfilled') setGroceryDistricts(gRes.value.data || []);
      if (pRes.status === 'fulfilled') setPolicies(pRes.value.data || []);
    } catch { toast.error('Failed to load coverage data'); }
    finally { setLoading(false); }
  };

  const toggleArea = async (area: GroceryArea) => {
    try {
      await api.put(`/delivery-coverage/grocery/areas/${area._id}`, { is_active: area.isActive ? 0 : 1 });
      toast.success(`Area ${area.isActive ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch { toast.error('Failed to update area'); }
  };

  const openAddArea = (districtId: string) => {
    setEditArea(null);
    setAreaForm({ district_id: districtId, name: '', name_bn: '' });
    setAreaDialogOpen(true);
  };

  const saveArea = async () => {
    try {
      if (editArea) {
        await api.put(`/delivery-coverage/grocery/areas/${editArea._id}`, { name: areaForm.name, name_bn: areaForm.name_bn });
        toast.success('Area updated');
      } else {
        await api.post('/delivery-coverage/grocery/areas', areaForm);
        toast.success('Area added');
      }
      setAreaDialogOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const openAddPolicy = () => {
    setEditPolicy(null);
    setPolicyForm({ area_name: '', is_inside_city: false, base_weight_kg: '1', base_charge: '100', extra_charge_per_kg: '30', estimated_days_min: '1', estimated_days_max: '3', free_delivery_threshold: '' });
    setPolicyDialogOpen(true);
  };

  const openEditPolicy = (p: ShippingPolicy) => {
    setEditPolicy(p);
    setPolicyForm({
      area_name: p.areaName || '',
      is_inside_city: p.isInsideCity,
      base_weight_kg: String(p.baseWeightKg),
      base_charge: String(p.baseCharge),
      extra_charge_per_kg: String(p.extraChargePerKg),
      estimated_days_min: String(p.estimatedDaysMin),
      estimated_days_max: String(p.estimatedDaysMax),
      free_delivery_threshold: p.freeDeliveryThreshold ? String(p.freeDeliveryThreshold) : ''
    });
    setPolicyDialogOpen(true);
  };

  const savePolicy = async () => {
    try {
      const payload = {
        ...policyForm,
        base_weight_kg: Number(policyForm.base_weight_kg),
        base_charge: Number(policyForm.base_charge),
        extra_charge_per_kg: Number(policyForm.extra_charge_per_kg),
        estimated_days_min: Number(policyForm.estimated_days_min),
        estimated_days_max: Number(policyForm.estimated_days_max),
        free_delivery_threshold: policyForm.free_delivery_threshold ? Number(policyForm.free_delivery_threshold) : null,
        is_inside_city: policyForm.is_inside_city ? 1 : 0,
      };
      if (editPolicy) {
        await api.put(`/delivery-coverage/shipping-policies/${editPolicy._id}`, payload);
        toast.success('Policy updated');
      } else {
        await api.post('/delivery-coverage/shipping-policies', { source_type: 'sholok', source_id: 1, ...payload });
        toast.success('Policy created');
      }
      setPolicyDialogOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('deliveryCoverage')}</h1>
        <p className="text-muted-foreground">{t('manageGroceryDelivery')}</p>
      </div>

      <Tabs defaultValue="grocery">
        <TabsList>
          <TabsTrigger value="grocery"><MapPin className="w-4 h-4 mr-2" />{t('groceryCoverage')}</TabsTrigger>
          <TabsTrigger value="nationwide"><Globe className="w-4 h-4 mr-2" />{t('shippingPolicies')}</TabsTrigger>
        </TabsList>

        {/* Grocery Coverage */}
        <TabsContent value="grocery" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">{t('groceryDeliveryLimited')}</p>
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : groceryDistricts.map(district => (
            <Card key={district._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{district.name}</CardTitle>
                  <Button size="sm" onClick={() => openAddArea(String(district._id))}>
                    <Plus className="w-3 h-3 mr-1" />{t('addArea')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {district.areas.map(area => (
                    <div key={area._id} className="flex items-center justify-between p-2 border rounded-lg">
                      <span className="text-sm truncate mr-2">{area.name}</span>
                      <Switch checked={area.isActive} onCheckedChange={() => toggleArea(area)} />
                    </div>
                  ))}
                  {district.areas.length === 0 && <p className="text-sm text-muted-foreground col-span-4">{t('noAreasAdded')}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Shipping Policies */}
        <TabsContent value="nationwide" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{t('weightBasedShipping')}</p>
            <Button onClick={openAddPolicy}><Plus className="w-4 h-4 mr-2" />{t('addPolicy')}</Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('areaZone')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('baseCharge')}</TableHead>
                    <TableHead>{t('extraPerKg')}</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>{t('freeThreshold')}</TableHead>
                    <TableHead>{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map(p => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.areaName || `District #${p.districtId}` || 'Default'}</TableCell>
                      <TableCell>
                        <Badge className={p.isInsideCity ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>
                          {p.isInsideCity ? t('insideCity') : t('nationwide')}
                        </Badge>
                      </TableCell>
                      <TableCell>৳{p.baseCharge} / {p.baseWeightKg}kg</TableCell>
                      <TableCell>৳{p.extraChargePerKg}</TableCell>
                      <TableCell>{p.estimatedDaysMin}–{p.estimatedDaysMax} {t('days')}</TableCell>
                      <TableCell>{p.freeDeliveryThreshold ? `৳${p.freeDeliveryThreshold}` : '—'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEditPolicy(p)}><Edit className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {policies.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t('noPoliciesFound')}</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editArea ? t('editArea') : t('addDeliveryAreaTitle')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t('areaNameEnglish')}</label><Input value={areaForm.name} onChange={e => setAreaForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('areaNameBengali')}</label><Input value={areaForm.name_bn} onChange={e => setAreaForm(p => ({ ...p, name_bn: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={saveArea}>{editArea ? t('update') : t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editPolicy ? t('editShippingPolicy') : t('addShippingPolicy')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-sm font-medium mb-1 block">{t('zoneAreaName')}</label><Input value={policyForm.area_name} onChange={e => setPolicyForm(p => ({ ...p, area_name: e.target.value }))} placeholder="e.g. Dhaka City" /></div>
            <div className="col-span-2 flex items-center gap-3"><Switch checked={policyForm.is_inside_city} onCheckedChange={v => setPolicyForm(p => ({ ...p, is_inside_city: v }))} /><label className="text-sm">{t('insideCityFaster')}</label></div>
            <div><label className="text-sm font-medium mb-1 block">{t('baseWeight')}</label><Input type="number" value={policyForm.base_weight_kg} onChange={e => setPolicyForm(p => ({ ...p, base_weight_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('baseChargeLbl')}</label><Input type="number" value={policyForm.base_charge} onChange={e => setPolicyForm(p => ({ ...p, base_charge: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('extraPerKgLbl')}</label><Input type="number" value={policyForm.extra_charge_per_kg} onChange={e => setPolicyForm(p => ({ ...p, extra_charge_per_kg: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('freeThresholdLbl')}</label><Input type="number" value={policyForm.free_delivery_threshold} onChange={e => setPolicyForm(p => ({ ...p, free_delivery_threshold: e.target.value }))} placeholder={t('optional')} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('etaMin')}</label><Input type="number" value={policyForm.estimated_days_min} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_min: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('etaMax')}</label><Input type="number" value={policyForm.estimated_days_max} onChange={e => setPolicyForm(p => ({ ...p, estimated_days_max: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={savePolicy}>{editPolicy ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
