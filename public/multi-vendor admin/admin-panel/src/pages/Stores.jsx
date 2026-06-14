import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Star, ExternalLink } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Stores() {
  const [stores,  setStores]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/stores", { params: { page, limit: 20 } });
      setStores(data.stores);
      setTotal(data.total);
    } catch { toast.error("Failed to fetch stores"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStores(); }, [page]);

  const toggle = async (store, field) => {
    try {
      await api.put(`/admin/stores/${store._id}`, { [field]: !store[field] });
      toast.success(`Store ${field} updated`);
      fetchStores();
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Smart Stores</h1>
        <p className="text-sm text-slate-400">{total} stores registered</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="card animate-pulse h-40 bg-[#1e1e36]" />) :
          stores.map((store) => (
            <div key={store._id} className="card border border-[#2a2a4a] hover:border-primary-500/30 transition-colors">
              {/* Banner */}
              <div className="h-16 rounded-lg overflow-hidden mb-3 bg-gradient-to-r from-primary-500/20 to-fuchsia-500/20">
                {store.banner && <img src={store.banner} alt="" className="w-full h-full object-cover opacity-60" />}
              </div>
              <div className="flex items-start gap-3">
                <img src={store.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(store.name)}&background=6c47ff&color=fff`}
                  alt={store.name} className="w-12 h-12 rounded-xl border border-[#2a2a4a] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{store.name}</p>
                  <p className="text-xs text-slate-500">/{store.smartStore}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400">{store.stats?.rating?.toFixed(1) || "0.0"}</span>
                    <span className="text-xs text-slate-600">· {store.stats?.totalProducts || 0} products</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a2a4a]">
                <button onClick={() => toggle(store, "isVerified")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${store.isVerified ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-[#2a2a4a] text-slate-500 hover:border-emerald-500/30"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />{store.isVerified ? "Verified" : "Verify"}
                </button>
                <button onClick={() => toggle(store, "isFeatured")}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${store.isFeatured ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-[#2a2a4a] text-slate-500 hover:border-amber-500/30"}`}>
                  <Star className="w-3.5 h-3.5" />{store.isFeatured ? "Featured" : "Feature"}
                </button>
                <a href={`http://localhost:8080/store/${store.smartStore}`} target="_blank" rel="noreferrer"
                  className="ml-auto text-slate-500 hover:text-primary-400 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button onClick={() => toggle(store, "isActive")}
                  className={`p-1.5 rounded-lg transition-colors ${store.isActive ? "text-red-400 hover:bg-red-500/20" : "text-emerald-400 hover:bg-emerald-500/20"}`}>
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
      {!loading && !stores.length && <p className="text-center text-slate-500 py-20">No stores yet. Register as a seller to create a Smart Store.</p>}
    </div>
  );
}
