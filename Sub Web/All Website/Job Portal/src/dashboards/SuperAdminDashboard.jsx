import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, dashboardAPI, authAPI } from "../services/api";
import "./Dashboard.css";

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("review");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("jobs");
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", role: "admin" });

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch {}
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      const data = await jobsAPI.getAll(params.toString());
      setJobs(data.jobs);
      setTotalPages(data.pages);
    } catch {}
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (userFilter) params.set("role", userFilter);
      const data = await authAPI.getUsers(params.toString());
      setUsers(data.users);
    } catch {}
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadJobs(); }, [filter, page, search]);
  useEffect(() => { if (activeTab === "users") loadUsers(); }, [activeTab, userFilter]);

  const handleApprove = async (id) => {
    try {
      await jobsAPI.approve(id);
      setMsg("চাকরি অনুমোদন করা হয়েছে ✓");
      loadJobs();
      loadStats();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await jobsAPI.reject(rejectModal, rejectReason);
      setMsg("চাকরি প্রত্যাখ্যান করা হয়েছে");
      setRejectModal(null);
      setRejectReason("");
      loadJobs();
      loadStats();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    try {
      await jobsAPI.delete(id);
      loadJobs();
      loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await authAPI.createAdmin(adminForm);
      setMsg(`${adminForm.role === "admin" ? "অ্যাডমিন" : "সুপার অ্যাডমিন"} তৈরি হয়েছে`);
      setShowCreateAdmin(false);
      setAdminForm({ name: "", email: "", password: "", role: "admin" });
      if (activeTab === "users") loadUsers();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const statusLabel = { pending: "অপেক্ষমান", review: "পর্যালোচনায়", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };
  const roleLabel = { user: "ব্যবহারকারী", vendor: "ভেন্ডর", admin: "অ্যাডমিন", super_admin: "সুপার অ্যাডমিন" };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>সুপার অ্যাডমিন ড্যাশবোর্ড</h1>
        <p>স্বাগতম, {user?.name} — সম্পূর্ণ সিস্টেম নিয়ন্ত্রণ</p>
      </div>

      {msg && (
        <div style={{ padding: "10px 16px", background: "#E3FCEF", borderRadius: 8, marginBottom: 16, color: "#006644", fontWeight: 600 }}>
          {msg}
          <button onClick={() => setMsg("")} style={{ float: "right", fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label">মোট চাকরি</div>
          <div className="stat-card__value">{stats.totalJobs || 0}</div>
        </div>
        <div className="stat-card stat-card--orange">
          <div className="stat-card__label">অপেক্ষমান</div>
          <div className="stat-card__value">{stats.pending || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">পর্যালোচনায়</div>
          <div className="stat-card__value">{stats.review || 0}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__label">অনুমোদিত</div>
          <div className="stat-card__value">{stats.approved || 0}</div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-card__label">প্রত্যাখ্যাত</div>
          <div className="stat-card__value">{stats.rejected || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">ভেন্ডর</div>
          <div className="stat-card__value">{stats.totalVendors || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">অ্যাডমিন</div>
          <div className="stat-card__value">{stats.totalAdmins || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">মোট ব্যবহারকারী</div>
          <div className="stat-card__value">{stats.totalUsers || 0}</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="dashboard__tabs" style={{ marginBottom: 24 }}>
        <button className={`dash-tab ${activeTab === "jobs" ? "active" : ""}`} onClick={() => setActiveTab("jobs")}>
          চাকরি অনুমোদন
        </button>
        <button className={`dash-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          ব্যবহারকারী ব্যবস্থাপনা
        </button>
      </div>

      {activeTab === "jobs" && (
        <>
          <div className="dashboard__toolbar">
            <div className="dashboard__tabs">
              {["all", "review", "pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  className={`dash-tab ${filter === s ? "active" : ""}`}
                  onClick={() => { setFilter(s); setPage(1); }}
                >
                  {s === "all" ? "সকল" : statusLabel[s]}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="dashboard__search"
              placeholder="চাকরি খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="jobs-table-wrapper">
            {loading ? (
              <div className="dashboard-empty"><p>লোড হচ্ছে...</p></div>
            ) : jobs.length === 0 ? (
              <div className="dashboard-empty"><h3>কোনো চাকরি পাওয়া যায়নি</h3></div>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>শিরোনাম</th>
                    <th>কোম্পানি</th>
                    <th>ভেন্ডর</th>
                    <th>অবস্থান</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="job-title-cell">{job.title}</td>
                      <td>{job.company}</td>
                      <td>{job.createdBy?.name || "N/A"}</td>
                      <td>{job.location}</td>
                      <td>
                        <span className={`status-badge status-badge--${job.status}`}>
                          {statusLabel[job.status]}
                        </span>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString("bn-BD")}</td>
                      <td>
                        {job.status === "review" && (
                          <>
                            <button className="action-btn action-btn--success" onClick={() => handleApprove(job._id)}>
                              অনুমোদন
                            </button>
                            <button className="action-btn action-btn--danger" onClick={() => { setRejectModal(job._id); setRejectReason(""); }}>
                              প্রত্যাখ্যান
                            </button>
                          </>
                        )}
                        <button className="action-btn action-btn--outline" onClick={() => handleDelete(job._id)}>
                          মুছুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>« আগে</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={page === i + 1 ? "active" : ""} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>পরে »</button>
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <>
          <div className="dashboard__toolbar">
            <div className="dashboard__tabs">
              {["", "user", "vendor", "admin", "super_admin"].map((r) => (
                <button
                  key={r}
                  className={`dash-tab ${userFilter === r ? "active" : ""}`}
                  onClick={() => setUserFilter(r)}
                >
                  {r === "" ? "সকল" : roleLabel[r]}
                </button>
              ))}
            </div>
            <button className="btn-submit" onClick={() => setShowCreateAdmin(true)}>+ অ্যাডমিন তৈরি</button>
          </div>

          {showCreateAdmin && (
            <form className="create-job-form fade-in-up" onSubmit={handleCreateAdmin}>
              <h2>নতুন অ্যাডমিন তৈরি করুন</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>নাম *</label>
                  <input required value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ইমেইল *</label>
                  <input required type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>পাসওয়ার্ড *</label>
                  <input required type="password" minLength={6} value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ভূমিকা</label>
                  <select value={adminForm.role} onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}>
                    <option value="admin">অ্যাডমিন</option>
                    <option value="super_admin">সুপার অ্যাডমিন</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">তৈরি করুন</button>
                <button type="button" className="btn-cancel" onClick={() => setShowCreateAdmin(false)}>বাতিল</button>
              </div>
            </form>
          )}

          <div className="jobs-table-wrapper">
            {users.length === 0 ? (
              <div className="dashboard-empty"><h3>কোনো ব্যবহারকারী পাওয়া যায়নি</h3></div>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>নাম</th>
                    <th>ইমেইল</th>
                    <th>ভূমিকা</th>
                    <th>কোম্পানি</th>
                    <th>যোগদান</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`status-badge ${u.role === "super_admin" ? "status-badge--approved" : u.role === "admin" ? "status-badge--review" : u.role === "vendor" ? "status-badge--pending" : "status-badge--rejected"}`}>
                          {roleLabel[u.role]}
                        </span>
                      </td>
                      <td>{u.company || "—"}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString("bn-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>প্রত্যাখ্যানের কারণ</h3>
            <textarea
              rows="3"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)" }}
              placeholder="কারণ লিখুন (ঐচ্ছিক)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setRejectModal(null)}>বাতিল</button>
              <button className="action-btn action-btn--danger" onClick={handleReject}>প্রত্যাখ্যান করুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
