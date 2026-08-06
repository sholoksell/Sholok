import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700', shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

export default function VendorOrders() {
  const { token } = useVendorAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any>(null);
  const limit = 20;

  const load = () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), ...(status && { status }) });
    fetch(`/admin-api/vendor/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setOrders(d.orders || []));
  };

  const loadDetail = (o: any) => {
    fetch(`/admin-api/vendor/orders/${o.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setSelected);
  };

  useEffect(() => { load(); }, [page, status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
        <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <SelectItem key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-4">
          {orders.length === 0 ? (
            <p className="text-center text-gray-400 py-10">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Order #</th>
                  <th className="pb-2 font-medium">Items</th>
                  <th className="pb-2 font-medium">Your Total</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium"></th>
                </tr></thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">#{o.order_number}</td>
                      <td className="py-3 text-gray-500 max-w-[180px] truncate">{o.items_summary}</td>
                      <td className="py-3 font-semibold">৳{Number(o.vendor_total || o.total || 0).toLocaleString()}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                      <td className="py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button size="sm" variant="ghost" onClick={() => loadDetail(o)}><Eye size={14} /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-4">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <span className="text-sm text-gray-500 self-center">Page {page}</span>
            <Button size="sm" variant="outline" disabled={orders.length < limit} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order #{selected?.order_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[selected.status] || ''}`}>{selected.status}</span>
                <span className="text-gray-500">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div>
                <p className="font-medium mb-2">Items (your products)</p>
                <div className="space-y-2">
                  {(selected.items || []).map((item: any) => (
                    <div key={item.id} className="flex justify-between border-b pb-2">
                      <div>
                        <p>{item.product_name}</p>
                        <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">৳{Number(item.total).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Your Total</span>
                <span>৳{(selected.items || []).reduce((acc: number, i: any) => acc + Number(i.total), 0).toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
