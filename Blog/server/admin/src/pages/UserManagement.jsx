import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiUser, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (search) params.set('search', search);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (_) {} finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(1); setPage(1); }, [search]);
  useEffect(() => { fetchUsers(page); }, [page]);

  const toggleActive = async (user) => {
    setActionLoading(user._id + '-active');
    try {
      const res = await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.user.isActive ? 'User activated' : 'User deactivated');
    } catch (_) { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  const toggleRole = async (user) => {
    if (!window.confirm(`Change ${user.displayName}'s role to ${user.role === 'admin' ? 'user' : 'admin'}?`)) return;
    setActionLoading(user._id + '-role');
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const res = await api.put(`/admin/users/${user._id}`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, role: res.data.user.role } : u));
      toast.success('Role updated');
    } catch (_) { toast.error('Failed'); } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">User Management</h1>
        <p className="text-gray-400 text-sm">{total} registered users</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input pl-10 py-2" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Followers</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>)
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=6941ff&color=fff&size=40`}
                        alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900">{user.displayName}</p>
                        <p className="text-xs text-gray-400">@{user.username} · {user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'admin' ? <FiShield className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{(user.followers?.length || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : '-'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => toggleRole(user)} disabled={actionLoading === user._id + '-role'}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition" title="Toggle Admin">
                        <FiShield className={`w-4 h-4 ${user.role === 'admin' ? 'fill-current text-primary-500' : ''}`} />
                      </button>
                      <button onClick={() => toggleActive(user)} disabled={actionLoading === user._id + '-active'}
                        className={`p-2 rounded-lg transition ${user.isActive ? 'text-green-500 hover:bg-red-50 hover:text-red-500' : 'text-red-400 hover:bg-green-50 hover:text-green-500'}`} title="Toggle Active">
                        {user.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && <div className="text-center py-12 text-gray-400">No users found</div>}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
