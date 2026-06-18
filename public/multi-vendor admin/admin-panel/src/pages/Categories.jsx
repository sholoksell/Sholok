import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const COLORS = ["from-violet-500 to-fuchsia-500","from-pink-500 to-rose-500","from-amber-500 to-orange-500","from-rose-400 to-pink-400","from-indigo-500 to-purple-500","from-emerald-500 to-teal-500","from-cyan-500 to-blue-500","from-sky-500 to-cyan-500"];

const blank = { name: "", nameBn: "", nameEn: "", icon: "Tag", color: COLORS[0], description: "", descriptionBn: "", descriptionEn: "", order: 0, isActive: true, isFeatured: false };

export default function Categories() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(blank);
  const [editId,  setEditId]  = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get("/admin/categories"); setCats(data.categories); }
    catch { toast.error("Failed to fetch categories"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { setForm(blank); setEditId(null); setModal(true); };
  const openEdit = (c) => { setForm({ name: c.name, nameBn: c.nameBn || "", nameEn: c.nameEn || "", icon: c.icon, color: c.color, description: c.description, descriptionBn: c.descriptionBn || "", descriptionEn: c.descriptionEn || "", order: c.order, isActive: c.isActive, isFeatured: c.isFeatured }); setEditId(c._id); setModal(true); };

  const save = async () => {
    if (!form.name) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editId) { await api.put(`/admin/categories/${editId}`, form); toast.success("Category updated"); }
      else        { await api.post("/admin/categories", form);         toast.success("Category created"); }
      setModal(false); fetch();
    } catch (e) { toast.error(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await api.delete(`/admin/categories/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Categories</h1><p className="text-sm text-slate-400">{cats.length} categories</p></div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus className="w-4 h-4" />Add Category</button>
      </div>

      {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(8)].map((_,i) => <div key={i} className="card animate-pulse h-24" />)}</div> : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {cats.map((c) => (
            <div key={c._id} className={`card bg-gradient-to-br ${c.color}/10 border border-[#2a2a4a] hover:border-primary-500/30 transition-all group`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-3`}>
                <span className="text-white text-lg">{c.icon === "Tag" ? "🏷️" : "📦"}</span>
              </div>
              <p className="font-semibold text-white text-sm truncate">{c.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.productCount} products</p>
              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="btn-ghost p-1.5 text-xs"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => del(c._id)} className="btn-ghost p-1.5 text-red-400 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16162a] border border-[#2a2a4a] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">{editId ? "Edit" : "Add"} Category</h3>
              <button onClick={() => setModal(false)} className="text-slate-500 hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs text-slate-400 mb-1 block">Name *</label><input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" placeholder="e.g. Electronics" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Name (Bangla)</label><input value={form.nameBn} onChange={(e) => setForm({...form, nameBn: e.target.value})} className="input" placeholder="যেমন: ইলেকট্রনিক্স" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Name (English)</label><input value={form.nameEn} onChange={(e) => setForm({...form, nameEn: e.target.value})} className="input" placeholder="e.g. Electronics" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Icon (Lucide name)</label><input value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} className="input" placeholder="e.g. Cpu, Shirt" /></div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Color Gradient</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setForm({...form, color: c})}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} border-2 transition-all ${form.color===c ? "border-white scale-110" : "border-transparent"}`} />
                  ))}
                </div>
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input resize-none" rows={2} /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Description (Bangla)</label><textarea value={form.descriptionBn} onChange={(e) => setForm({...form, descriptionBn: e.target.value})} className="input resize-none" rows={2} /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Description (English)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({...form, descriptionEn: e.target.value})} className="input resize-none" rows={2} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-4 h-4 accent-primary-500" />Active
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({...form, isFeatured: e.target.checked})} className="w-4 h-4 accent-primary-500" />Featured
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
