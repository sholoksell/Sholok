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
import { Plus, Truck, Edit, Trash2 } from 'lucide-react';

interface Courier { _id: string; name: string; code: string; isActive: boolean; trackingUrlTemplate: string; }

export default function Couriers() {
  const { t } = useLanguage();
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourier, setEditCourier] = useState<Courier | null>(null);
  const [form, setForm] = useState({ name: '', code: '', tracking_url_template: '', is_active: true });

  useEffect(() => { fetchCouriers(); }, []);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/couriers');
      setCouriers(data || []);
    } catch { toast.error('Failed to load couriers'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditCourier(null); setForm({ name: '', code: '', tracking_url_template: '', is_active: true }); setDialogOpen(true); };
  const openEdit = (c: Courier) => { setEditCourier(c); setForm({ name: c.name, code: c.code || '', tracking_url_template: c.trackingUrlTemplate || '', is_active: c.isActive }); setDialogOpen(true); };

  const save = async () => {
    try {
      if (editCourier) {
        await api.put(`/couriers/${editCourier._id}`, { ...form, is_active: form.is_active ? 1 : 0 });
        toast.success('Courier updated');
      } else {
        await api.post('/couriers', form);
        toast.success('Courier created');
      }
      setDialogOpen(false);
      fetchCouriers();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  const deleteCourier = async (c: Courier) => {
    if (!confirm(`Delete courier "${c.name}"?`)) return;
    try {
      await api.delete(`/couriers/${c._id}`);
      toast.success('Courier deleted');
      fetchCouriers();
    } catch { toast.error('Error deleting courier'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('couriers')}</h1>
          <p className="text-muted-foreground">{t('manageCouriersDesc')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('addCourier')}</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('courierCode')}</TableHead>
                  <TableHead>{t('trackingUrlTemplate')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {couriers.map(c => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-muted-foreground" /><span className="font-medium">{c.name}</span></div>
                    </TableCell>
                    <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{c.code || '—'}</code></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{c.trackingUrlTemplate || '—'}</TableCell>
                    <TableCell><Badge className={c.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{c.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Edit className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCourier(c)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {couriers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{t('noCouriersFound')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editCourier ? t('editCourier') : t('addCourier')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">{t('name')} *</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('courierCode')}</label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('trackingUrlHint')}</label><Input value={form.tracking_url_template} onChange={e => setForm(p => ({ ...p, tracking_url_template: e.target.value }))} placeholder="https://redx.com.bd/track?trackingId={tracking}" /></div>
            <div className="flex items-center gap-3"><Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /><label className="text-sm">{t('active')}</label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={save}>{editCourier ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
