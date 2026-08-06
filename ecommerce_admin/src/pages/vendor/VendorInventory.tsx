import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

export default function VendorInventory() {
  const { token } = useVendorAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [newStock, setNewStock] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!token) return;
    fetch('/admin-api/vendor/inventory', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setProducts(data); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, [token]);

  const handleUpdate = async () => {
    if (!editing) return;
    setSaving(true);
    await fetch(`/admin-api/vendor/inventory/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stock: Number(newStock) }),
    });
    setSaving(false);
    setEditing(null);
    load();
  };

  const lowStock = products.filter(p => p.stock <= (p.low_stock_threshold || 5));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Inventory Management</h1>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800">
          <AlertTriangle size={16} /><span className="text-sm font-medium">{lowStock.length} product(s) low on stock</span>
        </div>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Stock</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium"></th>
              </tr></thead>
              <tbody>
                {products.map(p => {
                  const low = p.stock <= (p.low_stock_threshold || 5);
                  return (
                    <tr key={p.id} className={`border-b last:border-0 ${low ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 font-medium">{p.name}</td>
                      <td className="py-3 text-gray-400 font-mono text-xs">{p.sku || '—'}</td>
                      <td className="py-3">
                        <span className={`font-semibold ${low ? 'text-red-600' : 'text-gray-800'}`}>{p.stock}</span>
                        {low && <span className="text-xs text-red-500 ml-1">(low)</span>}
                      </td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" onClick={() => { setEditing(p); setNewStock(String(p.stock)); }}>Update Stock</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Stock — {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>New Stock Quantity</Label><Input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} className="mt-1" min={0} /></div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">{saving ? 'Saving…' : 'Update'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
