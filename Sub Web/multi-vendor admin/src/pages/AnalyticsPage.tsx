import { motion } from "framer-motion";
import {
  BarChart3, TrendingUp, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Download
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, LineChart, Line
} from "recharts";
import TakaIcon from "@/components/TakaIcon";

const monthlyData = [
  { month: "Jan", revenue: 42000, commission: 4200, vendors: 980, orders: 580 },
  { month: "Feb", revenue: 48000, commission: 4800, vendors: 1010, orders: 620 },
  { month: "Mar", revenue: 55000, commission: 5500, vendors: 1050, orders: 710 },
  { month: "Apr", revenue: 51000, commission: 5100, vendors: 1080, orders: 680 },
  { month: "May", revenue: 63000, commission: 6300, vendors: 1120, orders: 820 },
  { month: "Jun", revenue: 72000, commission: 7200, vendors: 1150, orders: 950 },
  { month: "Jul", revenue: 68000, commission: 6800, vendors: 1170, orders: 890 },
  { month: "Aug", revenue: 79000, commission: 7900, vendors: 1190, orders: 1020 },
  { month: "Sep", revenue: 85000, commission: 8500, vendors: 1210, orders: 1100 },
  { month: "Oct", revenue: 92000, commission: 9200, vendors: 1230, orders: 1250 },
  { month: "Nov", revenue: 98000, commission: 9800, vendors: 1240, orders: 1340 },
  { month: "Dec", revenue: 110000, commission: 11000, vendors: 1247, orders: 1500 },
];

const chartStyle = { background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 12 };

export default function AnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground"><Download className="w-4 h-4" /> Export CSV</button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground"><Download className="w-4 h-4" /> Export PDF</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "৳9.82 Cr", change: "+12.5%", up: true, icon: TakaIcon },
          { label: "Commission Earned", value: "৳98,16,950", change: "+10.8%", up: true, icon: TrendingUp },
          { label: "Total Orders", value: "14,582", change: "+8.2%", up: true, icon: ShoppingCart },
          { label: "Refund Rate", value: "2.3%", change: "-0.5%", up: false, icon: Package },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-muted"><kpi.icon className="w-4 h-4 text-muted-foreground" /></div>
              <span className={`text-xs font-mono font-medium flex items-center gap-0.5 ${kpi.up ? "text-neon-green" : "text-destructive"}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Commission Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue & Commission Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="aRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160,100%,50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(160,100%,50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(280,100%,65%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(280,100%,65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={chartStyle} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(160,100%,50%)" fill="url(#aRevenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="commission" stroke="hsl(280,100%,65%)" fill="url(#aCommission)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Orders + Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="orders" fill="hsl(210,100%,60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Vendor Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartStyle} />
              <Line type="monotone" dataKey="vendors" stroke="hsl(30,100%,55%)" strokeWidth={2} dot={{ fill: "hsl(30,100%,55%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
