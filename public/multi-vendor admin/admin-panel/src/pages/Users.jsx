import { useEffect, useState } from "react";
import { Search, UserCheck, UserX, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const ROLE_COLORS = { admin: "bg-purple-500/20 text-purple-400", seller: "bg-blue-500/20 text-blue-400", customer: "bg-emerald-500/20 text-emerald-400" };

export default function Users() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: { page, search, role, limit } });
      setUsers(data.users);
      setTotal(data.total);
    } catch { toast.error("Failed to fetch users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search, role]);

  const toggleActive = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
      fetchUsers();
    } catch { toast.error("Action failed"); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-white">Users</h1><p className="text-sm text-slate-400">{total} total users</p></div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9 w-64" placeholder="Search name or email…" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="input w-36">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="customer">Customer</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-slate-500 border-b border-[#2a2a4a] bg-[#1a1a30]">
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-[#2a2a4a]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#2a2a4a]/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full" />
                        <span className="text-slate-200 font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3"><span className={`badge-status ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`badge-status ${u.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(u)} title={u.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive ? "text-amber-400 hover:bg-amber-500/20" : "text-emerald-400 hover:bg-emerald-500/20"}`}>
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <p className="text-center text-slate-500 py-10">No users found</p>}
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-ghost p-1.5"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => p + 1)} disabled={page * limit >= total} className="btn-ghost p-1.5"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
