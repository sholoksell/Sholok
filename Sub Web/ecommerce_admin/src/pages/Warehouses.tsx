import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Warehouse as WarehouseIcon, Edit } from 'lucide-react';

interface Warehouse { _id: string; name: string; code: string; city: string; district: string; division: string; isActive: boolean; isDefault: boolean; contactName: string; contactPhone: string; }

export default function Warehouses() {
  const { t } = useLanguage();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({ name: '', code: '', city: '', district: '', division: '', address: '', contact_name: '', contact_phone: '', is_default: false });

  useEffect(() => { fetchWarehouses(); }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/warehouses');
      setWarehouses(data || []);
    } catch { toast.error('Failed to load warehouses'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditWarehouse(null); setForm({ name: '', code: '', city: '', district: '', division: '', address: '', contact_name: '', contact_phone: '', is_default: false }); setDialogOpen(true); };
  const openEdit = (w: Warehouse) => { setEditWarehouse(w); setForm({ name: w.name, code: w.code || '', city: w.city || '', district: w.district || '', division: w.division || '', address: '', contact_name: w.contactName || '', contact_phone: w.contactPhone || '', is_default: w.isDefault }); setDialogOpen(true); };

  const save = async () => {
    try {
      if (editWarehouse) {
        await api.put(`/warehouses/${editWarehouse._id}`, { ...form, is_default: form.is_default ? 1 : 0 });
        toast.success('Warehouse updated');
      } else {
        await api.post('/warehouses', { ...form, is_default: form.is_default ? 1 : 0 });
        toast.success('Warehouse created');
      }
      setDialogOpen(false);
      fetchWarehouses();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('warehouses')}</h1>
          <p className="text-muted-foreground">{t('manageWarehousesDesc')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('addWarehouse')}</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? <p className="text-center py-8 text-muted-foreground">{t('loading')}</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('location')}</TableHead>
                  <TableHead>{t('contactName')}</TableHead>
                  <TableHead>{t('defaultLbl')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map(w => (
                  <TableRow key={w._id}>
                    <TableCell>
                      <div className="flex items-center gap-2"><WarehouseIcon className="w-4 h-4 text-muted-foreground" /><div><div className="font-medium">{w.name}</div>{w.code && <code className="text-xs text-muted-foreground">{w.code}</code>}</div></div>
                    </TableCell>
                    <TableCell className="text-sm">{[w.city, w.district, w.division].filter(Boolean).join(', ') || '—'}</TableCell>
                    <TableCell className="text-sm">{w.contactName ? `${w.contactName} · ${w.contactPhone}` : '—'}</TableCell>
                    <TableCell>{w.isDefault && <Badge className="bg-primary/20 text-primary">{t('defaultLbl')}</Badge>}</TableCell>
                    <TableCell><Badge className={w.isActive ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}>{w.isActive ? t('active') : t('inactive')}</Badge></TableCell>
                    <TableCell><Button size="sm" variant="outline" onClick={() => openEdit(w)}><Edit className="w-3 h-3" /></Button></TableCell>
                  </TableRow>
                ))}
                {warehouses.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{t('noWarehouses')}</TableCell></TableRow>}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editWarehouse ? t('editWarehouse') : t('addWarehouse')}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-sm font-medium mb-1 block">{t('name')} *</label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('code')}</label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('city')}</label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('district')}</label><Input value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('division')}</label><Input value={form.division} onChange={e => setForm(p => ({ ...p, division: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('contactName')}</label><Input value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">{t('contactPhone')}</label><Input value={form.contact_phone} onChange={e => setForm(p => ({ ...p, contact_phone: e.target.value }))} /></div>
            <div className="col-span-2 flex items-center gap-3"><Switch checked={form.is_default} onCheckedChange={v => setForm(p => ({ ...p, is_default: v }))} /><label className="text-sm">{t('setAsDefaultWarehouse')}</label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
            <Button onClick={save}>{editWarehouse ? t('update') : t('create')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
