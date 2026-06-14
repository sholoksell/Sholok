import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = { pending:"bg-amber-500/20 text-amber-400", confirmed:"bg-blue-500/20 text-blue-400", processing:"bg-indigo-500/20 text-indigo-400", shipped:"bg-violet-500/20 text-violet-400", delivered:"bg-emerald-500/20 text-emerald-400", cancelled:"bg-red-500/20 text-red-400", returned:"bg-orange-500/20 text-orange-400" };
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const fmt = (n) => "৳" + (n || 0).toLocaleString();

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [filter,  setFilter]  = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders", { params: { page, limit, status: filter || undefined } });
      setOrders(data.orders);
      setTotal(data.total);
    } catch { toast.error("Failed to fetch orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, filter]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Order status updated");
      fetch();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Orders</h1><p className="text-sm text-slate-400">{total} total orders</p></div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setFilter(""); setPage(1); }} className={`btn text-xs ${!filter ? "btn-primary" : "btn-ghost"}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`btn text-xs capitalize ${filter===s ? "btn-primary" : "btn-ghost"}`}>{s}</button>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        {loading ? <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-[#2a2a4a] bg-[#1a1a30]">
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date", "Update"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a4a]">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#2a2a4a]/20">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{o.customer?.name}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{o.items?.length} item(s)</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{fmt(o.totalAmount)}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${o.paymentStatus==="paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{o.paymentStatus}</span></td>
                    <td className="px-4 py-3"><span className={`badge-status ${STATUS_COLORS[o.orderStatus] || ""}`}>{o.orderStatus}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}
                        className="bg-[#1e1e36] border border-[#2a2a4a] rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <p className="text-center text-slate-500 py-10">No orders found</p>}
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
