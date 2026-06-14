import { useAuth } from "../context/AuthContext";
import { Database, Globe, ShieldCheck, Server } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-xl font-bold text-white">Settings</h1><p className="text-sm text-slate-400">Platform configuration</p></div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Database className="w-4 h-4 text-primary-400" />Database</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Database Name", "Smart_Store_New"],
            ["Cluster",       "cluster0.9crcrtz.mongodb.net"],
            ["Status",        "Connected ✓"],
            ["Provider",      "MongoDB Atlas"],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#1e1e36] rounded-lg p-3">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="text-slate-200 font-medium mt-0.5 text-xs">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Globe className="w-4 h-4 text-primary-400" />API Endpoints</h3>
        <div className="space-y-2 text-sm font-mono">
          {[
            ["Backend API",      "http://localhost:5000/api/v1"],
            ["Smart Store",      "http://localhost:8080"],
            ["Admin Panel",      "http://localhost:5174"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between bg-[#1e1e36] rounded-lg px-3 py-2">
              <span className="text-slate-400 text-xs">{k}</span>
              <a href={v} target="_blank" rel="noreferrer" className="text-primary-400 hover:underline text-xs">{v}</a>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary-400" />Admin Account</h3>
        <div className="flex items-center gap-4">
          <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-xl border border-primary-500/30" />
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <span className="badge-status bg-purple-500/20 text-purple-400 text-xs mt-1">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3"><Server className="w-4 h-4 text-primary-400" />Quick Commands</h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="bg-[#0f0f1a] rounded-lg p-3 text-emerald-400">
            <p className="text-slate-500 mb-1"># Start server</p>
            <p>cd "multi-vendor admin/server" && npm run dev</p>
          </div>
          <div className="bg-[#0f0f1a] rounded-lg p-3 text-blue-400">
            <p className="text-slate-500 mb-1"># Seed database with sample data</p>
            <p>cd "multi-vendor admin/server" && npm run seed</p>
          </div>
          <div className="bg-[#0f0f1a] rounded-lg p-3 text-amber-400">
            <p className="text-slate-500 mb-1"># Start admin panel</p>
            <p>cd "multi-vendor admin/admin-panel" && npm run dev</p>
          </div>
        </div>
      </div>
    </div>
  );
}
