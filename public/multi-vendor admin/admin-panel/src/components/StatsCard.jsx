import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "primary", sub }) {
  const colors = {
    primary: "from-primary-500/20 to-fuchsia-500/20 border-primary-500/30 text-primary-400",
    green:   "from-emerald-500/20 to-teal-500/20    border-emerald-500/30 text-emerald-400",
    amber:   "from-amber-500/20  to-orange-500/20   border-amber-500/30   text-amber-400",
    red:     "from-red-500/20    to-rose-500/20      border-red-500/30     text-red-400",
    blue:    "from-blue-500/20   to-cyan-500/20      border-blue-500/30    text-blue-400",
  };

  return (
    <div className={`card bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} border flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trendValue !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
          {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{trendValue}</span>
          <span className="text-slate-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
