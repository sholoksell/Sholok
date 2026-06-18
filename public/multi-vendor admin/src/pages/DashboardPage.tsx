import { motion } from "framer-motion";
import {
  ShoppingCart, Store, Users, Package,
  Globe
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import TakaIcon from "@/components/TakaIcon";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { fetchAdminStats } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const COLORS = ["hsl(160,100%,50%)", "hsl(280,100%,65%)", "hsl(210,100%,60%)", "hsl(30,100%,55%)", "hsl(330,100%,60%)"];

const portalModules = [
  { name: "Search", active: true, users: "12.4M" },
  { name: "Shopping", active: true, users: "8.2M" },
  { name: "News", active: true, users: "6.8M" },
  { name: "Blog/Cafe", active: true, users: "5.1M" },
  { name: "Pay", active: true, users: "4.9M" },
  { name: "Maps", active: true, users: "3.7M" },
  { name: "Webtoon", active: true, users: "3.2M" },
  { name: "Music", active: false, users: "2.1M" },
];

const categoryData = [
  { name: "Electronics", value: 32 },
  { name: "Fashion", value: 26 },
  { name: "Grocery", value: 18 },
  { name: "Home & Living", value: 14 },
  { name: "Others", value: 10 },
];

const vendorPerformance = [
  { name: "Daraz", sales: 1250000, rating: 4.8 },
  { name: "Evaly", sales: 980000, rating: 4.5 },
  { name: "Pickaboo", sales: 870000, rating: 4.6 },
  { name: "Othoba", sales: 720000, rating: 4.3 },
  { name: "Rokomari", sales: 650000, rating: 4.7 },
];

const statusColor = (status: string) => {
  switch (status) {
    case "Delivered": return "badge-active";
    case "Processing": return "badge-pending";
    case "Shipped": return "badge-premium";
    case "Pending": return "badge-suspended";
    default: return "badge-status";
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => fetchAdminStats().then(r => r.data),
    refetchInterval: 60000,
  });

  const stats = data?.stats ?? {};

  const revenueData = (data?.dailySales ?? [])
    .filter(Boolean)
    .map((s: { _id?: { month?: number; day?: number }; revenue?: number; total?: number; orders?: number; count?: number }) => ({
      month: s?._id?.month ? MONTH_NAMES[s._id.month - 1] : (s?._id?.day ?? ""),
      revenue: s?.revenue ?? s?.total ?? 0,
      orders: s?.orders ?? s?.count ?? 0,
    }));

  const recentOrders = data?.recentOrders ?? [];

  const fmtTaka = (n: number) => {
    if (n >= 10000000) return `৳${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `৳${(n / 100000).toFixed(1)} L`;
    return `৳${n.toLocaleString()}`;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">{t("dashboard")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("welcomeBack")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="pulse-dot bg-neon-green" />
          <span className="text-xs text-muted-foreground font-mono">{t("live")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("totalRevenue")} value={isLoading ? "..." : fmtTaka(stats.totalRevenue ?? 0)} change="" changeType="up" icon={TakaIcon} delay={0} />
        <StatCard title={t("totalOrders")} value={isLoading ? "..." : (stats.totalOrders ?? 0).toLocaleString()} change="" changeType="up" icon={ShoppingCart} variant="purple" delay={0.05} />
        <StatCard title={t("activeVendors")} value={isLoading ? "..." : (stats.totalSellers ?? 0).toLocaleString()} change="" changeType="up" icon={Store} variant="warm" delay={0.1} />
        <StatCard title={t("totalUsers")} value={isLoading ? "..." : (stats.totalUsers ?? 0).toLocaleString()} change="" changeType="up" icon={Users} delay={0.15} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t("revenueOverview")}</h3>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-green" /> {t("revenue")}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-purple" /> {t("orders")}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160,100%,50%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(160,100%,50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(280,100%,65%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(280,100%,65%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(220,20%,90%)" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160,100%,50%)" fill="url(#colorRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="orders" stroke="hsl(280,100%,65%)" fill="url(#colorOrders)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">{t("categoryPerformance")}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{cat.name}</span>
                </span>
                <span className="font-mono text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">{t("recentOrders")}</h3>
            <button className="text-xs text-primary hover:underline">{t("viewAll")}</button>
          </div>
          <table className="data-grid">
            <thead>
              <tr>
                <th>{t("orderId")}</th>
                <th>{t("customer")}</th>
                <th>{t("vendor")}</th>
                <th>{t("amount")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-4 text-xs">{t("noOrdersYet")}</td></tr>
              ) : recentOrders.map((order: { _id: string; orderNumber: string; shippingAddress?: { name: string }; total?: number; totalAmount?: number; status: string }) => (
                <tr key={order._id}>
                  <td className="font-mono text-primary text-xs">{order.orderNumber}</td>
                  <td>{order.shippingAddress?.name ?? "—"}</td>
                  <td className="text-muted-foreground">—</td>
                  <td className="font-mono">৳{(order.total ?? order.totalAmount ?? 0).toLocaleString()}</td>
                  <td><span className={statusColor(order.status)}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Portal Modules */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-neon-blue" /> {t("portalModules")}
            </h3>
          </div>
          <div className="space-y-2">
            {portalModules.map((mod) => (
              <motion.div
                key={mod.name}
                whileHover={{ x: 3 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`pulse-dot ${mod.active ? "bg-neon-green" : "bg-muted-foreground"}`} />
                  <span className="text-sm text-foreground">{mod.name}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{mod.users}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vendor Performance */}
      <motion.div variants={itemVariants} className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{t("topVendorsBySales")}</h3>
          <button className="text-xs text-primary hover:underline">{t("viewAllVendors")}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {vendorPerformance.map((vendor, i) => (
            <motion.div
              key={vendor.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              whileHover={{ y: -3 }}
              className="glass-card-hover p-4 text-center"
            >
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-bold" style={{ background: COLORS[i] + "33", color: COLORS[i] }}>
                {vendor.name.slice(0, 2)}
              </div>
              <p className="text-xs font-medium text-foreground">{vendor.name}</p>
              <p className="text-sm font-mono font-bold text-foreground mt-1">${(vendor.sales / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground">★ {vendor.rating}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
