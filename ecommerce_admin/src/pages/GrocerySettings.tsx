import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Clock, Settings, Trash2, Edit } from 'lucide-react';

interface Slot { _id: string; label: string; startTime: string; endTime: string; maxOrders: number | null; isActive: boolean; sortOrder: number; }

export default function GrocerySettings() {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<Slot | null>(null);
  const [slotForm, setSlotForm] = useState({ label: '', start_time: '', end_time: '', max_orders: '', sort_order: '0' });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, settingsRes] = await Promise.allSettled([
        api.get('/grocery-settings/slots'),
        api.get('/grocery-settings/settings'),
      ]);
      if (slotsRes.status === 'fulfilled') setSlots(slotsRes.value.data || []);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value.data || {});
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditSlot(null);
    setSlotForm({ label: '', start_time: '', end_time: '', max_orders: '', sort_order: String(slots.length + 1) });
    setSlotDialogOpen(true);
  };

  const openEdit = (s: Slot) => {
    setEditSlot(s);
    setSlotForm({ label: s.label, start_time: s.startTime, end_time: s.endTime, max_orders: s.maxOrders ? String(s.maxOrders) : '', sort_order: String(s.sortOrder) });
    setSlotDialogOpen(true);
  };

  const saveSlot = async () => {
    try {
      const payload = { ...slotForm, max_orders: slotForm.max_orders ? Number(slotForm.max_orders) : null, sort_order: Number(slotForm.sort_order) };
      if (editSlot) {
        await api.put(`/grocery-settings/slots/${editSlot._id}`, payload);
        toast.success('Slot updated');
      } else {
        await api.post('/grocery-settings/slots', payload);
        toast.success('Slot created');
      }
      setSlotDialogOpen(false);
      fetchData();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const toggleSlot = async (s: Slot) => {
    try {
      await api.put(`/grocery-settings/slots/${s._id}`, { is_active: s.isActive ? 0 : 1 });
      toast.success(`Slot ${s.isActive ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch { toast.error('Failed to toggle slot'); }
  };

  const deleteSlot = async (s: Slot) => {
    if (!confirm(`Delete slot "${s.label}"?`)) return;
    try {
      await api.delete(`/grocery-settings/slots/${s._id}`);
      toast.success('Slot deleted');
      fetchData();
    } catch { toast.error('Error deleting slot'); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/grocery-settings/settings', settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed to save settings'); }
    finally { setSavingSettings(false); }
  };

  const settingLabels: Record<string, string> = {
    grocery_min_prep_hours: t('minPrepTime'),
    grocery_delivery_days: t('deliveryDaysAvailable'),
    grocery_delivery_enabled: t('groceryDeliveryEnabled'),
    free_delivery_threshold: t('freeDeliveryMinOrder'),
    sholok_inside_city_charge: t('insideCityCharge'),
    sholok_outside_city_charge: t('outsideCityCharge'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('grocerySettings')}</h1>
        <p className="text-muted-foreground">{t('configureDelivery')}</p>
      </div>

      {/* Delivery Slots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" />{t('deliveryTimeSlots')}</CardTitle>
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('addSlot')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('label')}</TableHead>
                  <TableHead>{t('timeWindow')}</TableHead>
                  <TableHead>{t('maxOrders')}</TableHead>
                  <TableHead>{t('active')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map(s => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">{s.label}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.startTime} – {s.endTime}</TableCell>
                    <TableCell className="text-sm">{s.maxOrders ?? t('unlimited')}</TableCell>
                    <TableCell><Switch checked={s.isActive} onCheckedChange={() => toggleSlot(s)} /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(s)}><Edit className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteSlot(s)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {slots.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noSlotsConfigured')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />{t('generalSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <div className="space-y-4">
              {Object.entries(settingLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-4">
                  <label className="text-sm font-medium w-80 shrink-0">{label}</label>
                  <Input
                    className="max-w-xs"
                    value={settings[key] ?? ''}
                    onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <Button onClick={saveSettings} disabled={savingSettings} className="mt-2">
                {savingSettings ? t('saving') : t('saveSettings')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slot Dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editSlot ? t('editSlot') : t('addTimeSlot')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t('label')} *</label><Input value={slotForm.label} onChange={e => setSlotForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Morning (9 AM – 11 AM)" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">{t('startTime')}</label><Input type="time" value={slotForm.start_time} onChange={e => setSlotForm(p => ({ ...p, start_time: e.target.value }))} /></div>
              <div><label className="text-sm font-medium mb-1 block">{t('endTime')}</label><Input type="time" value={slotForm.end_time} onChange={e => setSlotForm(p => ({ ...p, end_time: e.target.value }))} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">{t('maxOrdersBlank')}</label><Input type="number" value={slotForm.max_orders} onChange={e => setSlotForm(p => ({ ...p, max_orders: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('sortOrder')}</label><Input type="number" value={slotForm.sort_order} onChange={e => setSlotForm(p => ({ ...p, sort_order: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={saveSlot}>{editSlot ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
