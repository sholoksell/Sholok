import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700', refunded: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
};

export default function Returns() {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [returns, setReturns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const limit = 20;

  const load = () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(status && { status }), ...(type && { type }) });
    fetch(`/admin-api/returns?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setReturns(d.returns || []); setTotal(d.total || 0); });
  };

  useEffect(() => { load(); }, [page, status, type]);

  const openDetail = (r: any) => { setSelected(r); setNote(r.adminNote || ''); setNewStatus(r.status); };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/admin-api/returns/${selected._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus, admin_note: note }),
    });
    setSaving(false);
    setSelected(null);
    load();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{t('returnRequests')}</h1>
        <span className="text-sm text-gray-500">{total} {t('total')}</span>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['all', 'pending', 'approved', 'rejected', 'refunded', 'processing'].map(s => (
                  <SelectItem key={s} value={s}>{s === 'all' ? t('allStatus') : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type || 'all'} onValueChange={v => { setType(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="return">{t('return')}</SelectItem>
                <SelectItem value="refund">{t('refund')}</SelectItem>
                <SelectItem value="exchange">{t('exchange')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">{t('returnNo')}</th>
                <th className="pb-2 font-medium">{t('order')}</th>
                <th className="pb-2 font-medium">{t('customer')}</th>
                <th className="pb-2 font-medium">{t('product')}</th>
                <th className="pb-2 font-medium">{t('type')}</th>
                <th className="pb-2 font-medium">{t('refundAmt')}</th>
                <th className="pb-2 font-medium">{t('status')}</th>
                <th className="pb-2 font-medium">{t('date')}</th>
                <th className="pb-2 font-medium"></th>
              </tr></thead>
              <tbody>
                {returns.map((r: any) => (
                  <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-medium">{r.returnNumber}</td>
                    <td className="py-3">#{r.orderNumber}</td>
                    <td className="py-3">{r.customerName}</td>
                    <td className="py-3 max-w-[140px] truncate">{r.productName || 'Full Order'}</td>
                    <td className="py-3 capitalize">{r.type}</td>
                    <td className="py-3">{r.refundAmount ? `৳${Number(r.refundAmount).toLocaleString()}` : '—'}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[r.status] || 'bg-gray-100 text-gray-600'}`}>{r.status}</span></td>
                    <td className="py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><Button size="sm" variant="ghost" onClick={() => openDetail(r)}><Eye size={14} /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {returns.length === 0 && <p className="text-center text-gray-400 py-8">{t('noReturnRequests')}</p>}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('prev')}</Button>
              <span className="text-sm text-gray-500 self-center">{t('page')} {page} {t('of')} {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>{t('next')}</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('returnRequest')} — {selected?.returnNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><p className="text-gray-400">{t('customer')}</p><p className="font-medium">{selected.customerName}</p></div>
                <div><p className="text-gray-400">{t('order')}</p><p className="font-medium">#{selected.orderNumber}</p></div>
                <div><p className="text-gray-400">{t('type')}</p><p className="font-medium capitalize">{selected.type}</p></div>
                <div><p className="text-gray-400">{t('refundAmount')}</p><p className="font-medium">{selected.refundAmount ? `৳${Number(selected.refundAmount).toLocaleString()}` : '—'}</p></div>
              </div>
              <div>
                <p className="text-gray-400">{t('reason')}</p>
                <p className="font-medium">{selected.reason}</p>
                {selected.description && <p className="text-gray-500 mt-1">{selected.description}</p>}
              </div>
              <div>
                <Label>{t('updateStatus')}</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['pending', 'processing', 'approved', 'rejected', 'refunded'].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('adminNote')}</Label>
                <Input value={note} onChange={e => setNote(e.target.value)} className="mt-1" placeholder={t('internalNote')} />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>{t('close')}</Button>
                <Button onClick={handleUpdate} disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? t('saving') : t('update')}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
