import { useEffect, useState } from "react";
import { Search, Trash2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const fmt = (n) => "৳" + (n || 0).toLocaleString();

export default function Products() {
  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const limit = 20;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/products", { params: { page, search, limit } });
      setProducts(data.products);
      setTotal(data.total);
    } catch { toast.error("Failed to fetch products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search]);

  const del = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await api.delete(`/admin/products/${id}`); toast.success("Product deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Products</h1><p className="text-sm text-slate-400">{total} total products</p></div>
      </div>
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9" placeholder="Search products…" />
      </div>
      <div className="card p-0 overflow-hidden">
        {loading ? <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-[#2a2a4a] bg-[#1a1a30]">
                {["Product", "Category", "Price", "Stock", "Sold", "Rating", "Store", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a4a]">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#2a2a4a]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-[#2a2a4a]" />}
                        <div>
                          <p className="text-slate-200 font-medium text-xs leading-tight max-w-[160px] truncate">{p.name}</p>
                          {p.badge && <span className="text-[10px] text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.categoryName}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{fmt(p.price)}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${p.stock > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 text-slate-400">{p.sold}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-slate-300 text-xs">{p.ratings?.average?.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.store?.name}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => del(p._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!products.length && <p className="text-center text-slate-500 py-10">No products found</p>}
          </div>
        )}
      </div>
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {(page-1)*limit+1}–{Math.min(page*limit,total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p-1)} disabled={page===1} className="btn-ghost p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => p+1)} disabled={page*limit>=total} className="btn-ghost p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
