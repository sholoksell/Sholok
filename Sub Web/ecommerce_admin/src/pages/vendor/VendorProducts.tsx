import { useEffect, useState } from 'react';
import { useVendorAuth } from '@/contexts/VendorAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import VendorProductFormDialog from '@/components/products/VendorProductFormDialog';

export default function VendorProducts() {
  const { token } = useVendorAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const limit = 20;

  const load = () => {
    const params = new URLSearchParams({
      page: String(page), limit: String(limit),
      ...(search && { search }),
      ...(status && { status }),
    });
    fetch(`/admin-api/vendor/products?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); });
  };

  useEffect(() => { load(); }, [page, search, status]);

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setDialogOpen(true); };

  const handleDelete = async (id: number) => {
    if (!confirm('Archive this product?')) return;
    await fetch(`/admin-api/vendor/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    archived: 'bg-red-100 text-red-600',
  };
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">My Products</h1>
        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus size={16} className="mr-1" /> Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={status || 'all'} onValueChange={v => { setStatus(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No products found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {p.thumbnail
                            ? <img src={p.thumbnail} alt="" className="w-9 h-9 rounded object-cover" />
                            : <div className="w-9 h-9 bg-muted rounded" />}
                          <div>
                            <p className="font-medium text-foreground">{p.name}</p>
                            {p.name_bn && <p className="text-xs text-muted-foreground">{p.name_bn}</p>}
                            {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-foreground">৳{Number(p.regular_price).toLocaleString()}</p>
                        {p.sale_price && <p className="text-xs text-emerald-600">Sale: ৳{Number(p.sale_price).toLocaleString()}</p>}
                      </td>
                      <td className="py-3">
                        <span className={p.stock <= 5 ? 'text-red-600 font-medium' : 'text-foreground'}>{p.stock}</span>
                      </td>
                      <td className="py-3 capitalize text-foreground">{p.product_type?.replace('_', ' ')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-sm text-muted-foreground self-center">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <VendorProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSaved={load}
      />
    </div>
  );
}
