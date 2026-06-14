import { useEffect, useState } from "react";
import { Users, Store, Package, ShoppingCart, TrendingUp, DollarSign, AlertCircle, UserPlus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import StatsCard from "../components/StatsCard";
import api from "../api/axios";
import toast from "react-hot-toast";

const STATUS_COLORS = { pending:"bg-amber-500/20 text-amber-400", confirmed:"bg-blue-500/20 text-blue-400", shipped:"bg-indigo-500/20 text-indigo-400", delivered:"bg-emerald-500/20 text-emerald-400", cancelled:"bg-red-500/20 text-red-400" };
const fmt = (n) => "৳" + (n || 0).toLocaleString();

export default function Dashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data)   return <div className="text-slate-400 text-center py-20">Failed to load data. Is the server running?</div>;

  const { stats, dailySales, topProducts, recentOrders, recentUsers } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Smart_Store_New — Live Overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Revenue"  value={fmt(stats.totalRevenue)}  icon={DollarSign}   color="primary" />
        <StatsCard title="Total Orders"   value={stats.totalOrders}        icon={ShoppingCart}  color="green"   sub={`${stats.pendingOrders} pending`} />
        <StatsCard title="Total Users"    value={stats.totalUsers}         icon={Users}         color="blue"    sub={`${stats.totalSellers} sellers`} />
        <StatsCard title="Total Stores"   value={stats.totalStores}        icon={Store}         color="amber"   />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Products"       value={stats.totalProducts}      icon={Package}       color="primary" />
        <StatsCard title="Sellers"        value={stats.totalSellers}       icon={Store}         color="green"   />
        <StatsCard title="Customers"      value={stats.totalCustomers}     icon={UserPlus}      color="blue"    />
        <StatsCard title="Pending Orders" value={stats.pendingOrders}      icon={AlertCircle}   color="red"     />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue (Last 7 Days)</h3>
          {dailySales?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailySales}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6c47ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6c47ff" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis dataKey="_id" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => "৳" + (v/1000).toFixed(0) + "k"} />
                <Tooltip contentStyle={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 8 }} formatter={(v) => ["৳" + v.toLocaleString(), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6c47ff" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-10 text-sm">No sales data yet</p>}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Products (by sold)</h3>
          {topProducts?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(v) => v.length > 18 ? v.slice(0, 18) + "…" : v} />
                <Tooltip contentStyle={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 8 }} />
                <Bar dataKey="sold" fill="#6c47ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-10 text-sm">No products yet</p>}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Orders</h3>
        {recentOrders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-[#2a2a4a]">
                <th className="pb-2 text-left">Order #</th>
                <th className="pb-2 text-left">Customer</th>
                <th className="pb-2 text-left">Amount</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-left">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a4a]">
                {recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#2a2a4a]/30 transition-colors">
                    <td className="py-2.5 text-slate-300 font-mono text-xs">{o.orderNumber}</td>
                    <td className="py-2.5 text-slate-300">{o.customer?.name || "—"}</td>
                    <td className="py-2.5 text-emerald-400 font-medium">{fmt(o.totalAmount)}</td>
                    <td className="py-2.5"><span className={`badge-status ${STATUS_COLORS[o.orderStatus] || "bg-slate-500/20 text-slate-400"}`}>{o.orderStatus}</span></td>
                    <td className="py-2.5 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-slate-500 text-center py-8 text-sm">No orders yet</p>}
      </div>
    </div>
  );
}
