import { motion } from "framer-motion";
import { Users, Search, Filter, MoreHorizontal, UserCheck, UserX, Shield } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, banUser } from "@/lib/api";

const roleColor = (role: string) => {
  switch (role) {
    case "Vendor": return "badge-premium";
    case "Sub Admin": return "badge-active";
    case "Customer": return "badge-status bg-neon-blue/15 text-neon-blue";
    default: return "badge-status";
  }
};

const statusBadge = (status: string) => {
  switch (status) {
    case "Active": return "badge-active";
    case "Suspended": return "badge-suspended";
    case "Pending": return "badge-pending";
    default: return "badge-status";
  }
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", search, roleFilter],
    queryFn: () => fetchUsers({ search, role: roleFilter, limit: 20 }).then(r => r.data),
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => banUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all platform users, vendors, and admins</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm text-muted-foreground hover:bg-secondary transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-foreground" style={{ background: "var(--gradient-neon)" }}>
            <UserCheck className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Users", value: isLoading ? "..." : total.toLocaleString(), icon: Users },
          { label: "Active", value: isLoading ? "..." : users.filter((u: { isBanned?: boolean }) => !u.isBanned).length.toString(), icon: UserCheck },
          { label: "Suspended", value: isLoading ? "..." : users.filter((u: { isBanned?: boolean }) => u.isBanned).length.toString(), icon: UserX },
          { label: "Pending KYC", value: isLoading ? "..." : users.filter((u: { sellerStatus?: string }) => u.sellerStatus === "pending").length.toString(), icon: Shield },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-muted"><stat.icon className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-lg font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Search users by name, email, or role..."
                className="bg-transparent flex-1 outline-none text-foreground placeholder:text-muted-foreground"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
          </div>
          <select
              className="px-3 py-2 rounded-lg bg-muted text-sm text-foreground border-none outline-none"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="seller">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          <select className="px-3 py-2 rounded-lg bg-muted text-sm text-foreground border-none outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
        </div>

        <table className="data-grid">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-sm">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-muted-foreground text-sm">No users found</td></tr>
            ) : users.map((user: { _id: string; name: string; email: string; role: string; isBanned?: boolean; sellerStatus?: string; createdAt: string }, i: number) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                      {user.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className={roleColor(user.role === "seller" ? "Vendor" : user.role === "admin" ? "Sub Admin" : "Customer")}>{user.role}</span></td>
                <td><span className={statusBadge(user.isBanned ? "Suspended" : "Active")}>{user.isBanned ? "Banned" : "Active"}</span></td>
                <td className="text-muted-foreground text-xs font-mono">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="font-mono">—</td>
                <td className="font-mono">—</td>
                <td>
                  <button
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title={user.isBanned ? "Unban user" : "Ban user"}
                    onClick={() => banMutation.mutate(user._id)}
                  >
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
