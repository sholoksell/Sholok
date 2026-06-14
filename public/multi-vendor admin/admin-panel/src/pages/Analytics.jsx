import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../api/axios";
import toast from "react-hot-toast";

const COLORS = ["#6c47ff","#f97316","#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#06b6d4"];
const fmt = (n) => "৳" + (n || 0).toLocaleString();

export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [days,    setDays]    = useState(30);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data: r } = await api.get("/admin/analytics", { params: { days } });
      setData(r);
    } catch { toast.error("Failed to load analytics"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [days]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Analytics</h1><p className="text-sm text-slate-400">Smart_Store_New platform data</p></div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="input w-36 text-sm">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : !data ? (
        <p className="text-slate-400 text-center py-20">No data available</p>
      ) : (
        <>
          {/* Revenue over time */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Revenue Over Time</h3>
            {data.salesByDay?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.salesByDay}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6c47ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6c47ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                  <XAxis dataKey="_id" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => "৳" + (v/1000).toFixed(0) + "k"} />
                  <Tooltip contentStyle={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 8 }} formatter={(v) => [fmt(v), "Revenue"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#6c47ff" strokeWidth={2} fill="url(#aGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-center py-10">No revenue data for this period</p>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by category */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Sales by Category</h3>
              {data.salesByCategory?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.salesByCategory} dataKey="totalSold" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#16162a", border: "1px solid #2a2a4a", borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-slate-500 text-center py-10">No category data</p>}
            </div>

            {/* Order statuses */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Order Status Breakdown</h3>
              {data.orderStatuses?.length ? (
                <div className="space-y-3">
                  {data.orderStatuses.map((s, i) => (
                    <div key={s._id} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-300 text-sm capitalize flex-1">{s._id}</span>
                      <span className="font-semibold text-white">{s.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-center py-10">No order data</p>}
            </div>
          </div>

          {/* Top stores */}
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Stores</h3>
            {data.topStores?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.topStores.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 bg-[#1e1e36] rounded-xl border border-[#2a2a4a]">
                    <img src={s.logo || `https://ui-avatars.com/api/?name=${s.name}&background=6c47ff&color=fff`} alt={s.name} className="w-10 h-10 rounded-xl" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-white truncate">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.stats?.totalProducts} products</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold text-emerald-400">{fmt(s.stats?.totalRevenue)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-slate-500 text-center py-10">No store data</p>}
          </div>
        </>
      )}
    </div>
  );
}
