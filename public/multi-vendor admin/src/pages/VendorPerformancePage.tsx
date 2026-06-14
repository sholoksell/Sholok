import { motion } from "framer-motion";
import { TrendingUp, Star, Package, Users, Award, ArrowUpRight, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, CartesianGrid } from "recharts";

const vendors: { name: string; sales: number; orders: number; rating: number; revenue: number; commission: number; products: number; customers: number; badge: string; trend: string }[] = [];

const monthlyPerf: { month: string; TechMart: number; Fashion: number; HomeDecor: number }[] = [];

const radarData: { subject: string; TechMart: number; Fashion: number }[] = [];

const badgeConfig: Record<string, string> = { Premium: "badge-active", Gold: "badge-premium", Silver: "badge-pending" };

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function VendorPerformancePage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Vendor Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track sales, ratings and commission metrics per vendor</p>
        </div>
        <div className="flex gap-2">
          {["7D", "30D", "90D", "YTD"].map(p => (
            <button key={p} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${p === "30D" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Top Vendor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {vendors.map((v, i) => (
          <motion.div key={v.name} variants={itemVariants} className="glass-card p-4 hover-card-float">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: i === 0 ? "var(--gradient-neon)" : (i === 1 ? "var(--gradient-purple)" : "var(--gradient-warm)") }}>
                {v.name[0]}
              </div>
              <span className={`badge-status text-[10px] ${badgeConfig[v.badge] || "badge-pending"}`}>
                <Award className="w-2.5 h-2.5" />{v.badge}
              </span>
            </div>
            <p className="text-xs font-semibold leading-snug mb-1">{v.name}</p>
            <p className="text-lg font-bold text-neon-green">${(v.sales / 1000).toFixed(1)}k</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-neon-orange fill-neon-orange" />
              <span className="text-xs font-medium">{v.rating}</span>
              <span className="text-xs text-neon-green ml-auto flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />{v.trend}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-muted-foreground">Orders</p>
                <p className="font-bold">{v.orders.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Commission</p>
                <p className="font-bold text-neon-orange">${(v.commission / 1000).toFixed(1)}k</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-neon-blue" />Monthly Revenue Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyPerf} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(220,10%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toLocaleString()}k`} />
              <Tooltip contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="TechMart" fill="hsl(160,100%,50%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fashion" fill="hsl(280,100%,65%)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="HomeDecor" fill="hsl(30,100%,55%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-neon-purple" />Performance Radar (Top 2 Vendors)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(225,15%,18%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(220,10%,50%)", fontSize: 11 }} />
              <Radar name="TechMart" dataKey="TechMart" stroke="hsl(160,100%,50%)" fill="hsl(160,100%,50%)" fillOpacity={0.15} />
              <Radar name="Fashion" dataKey="Fashion" stroke="hsl(280,100%,65%)" fill="hsl(280,100%,65%)" fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: "hsl(225,22%,10%)", border: "1px solid hsl(225,15%,18%)", borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detail Table */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Vendor Metrics Overview</h3>
          <button className="text-xs text-primary hover:underline">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                {["Vendor", "Total Sales", "Orders", "Rating", "Commission", "Products", "Customers", "Badge"].map(h => (
                  <th key={h} className="text-left p-4 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v, i) => (
                <motion.tr key={v.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold" style={{ background: "var(--gradient-neon)" }}>{v.name[0]}</div>
                      <span className="text-sm font-medium">{v.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-neon-green">${v.sales.toLocaleString()}</td>
                  <td className="p-4 text-sm">{v.orders.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 text-neon-orange fill-neon-orange" /><span className="text-sm">{v.rating}</span></div>
                  </td>
                  <td className="p-4 text-sm text-neon-orange">${v.commission.toLocaleString()}</td>
                  <td className="p-4 text-sm">{v.products}</td>
                  <td className="p-4 text-sm">{v.customers.toLocaleString()}</td>
                  <td className="p-4"><span className={`badge-status ${badgeConfig[v.badge] || "badge-pending"}`}><Award className="w-3 h-3" />{v.badge}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
