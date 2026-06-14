import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, dashboardAPI, authAPI } from "../services/api";
import "./Dashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [jobDetailModal, setJobDetailModal] = useState(null);
  const [vendorDetailModal, setVendorDetailModal] = useState(null);
  const [vendorJobs, setVendorJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  const showMsg = (text, type = "success") => {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

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

  const loadRecentJobs = async () => {
    try {
      const data = await jobsAPI.getAll("limit=5&status=pending");
      setRecentJobs(data.jobs);
    } catch {}
  };

  const loadVendors = async () => {
    try {
      const data = await authAPI.getUsers("role=vendor&limit=100");
      setVendors(data.users);
    } catch {}
  };

  useEffect(() => {
    loadStats();
    loadRecentJobs();
  }, []);

  useEffect(() => {
    if (activeTab === "jobs") loadJobs();
  }, [activeTab, filter, page, search]);

  useEffect(() => {
    if (activeTab === "vendors" || activeTab === "overview") loadVendors();
  }, [activeTab]);

  const handleApprove = async (id) => {
    try {
      await jobsAPI.approve(id);
      showMsg("চাকরি অনুমোদিত হয়েছে ✓");
      loadJobs();
      loadStats();
      loadRecentJobs();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const handleSendToSuperAdmin = async (id) => {
    try {
      await jobsAPI.sendToSuperAdmin(id);
      showMsg("সুপার অ্যাডমিনের কাছে পাঠানো হয়েছে");
      loadJobs();
      loadStats();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await jobsAPI.reject(rejectModal, rejectReason);
      showMsg("চাকরি প্রত্যাখ্যান করা হয়েছে");
      setRejectModal(null);
      setRejectReason("");
      loadJobs();
      loadStats();
      loadRecentJobs();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm("এই চাকরি মুছে ফেলতে চান?")) return;
    try {
      await jobsAPI.delete(id);
      showMsg("চাকরি মুছে ফেলা হয়েছে");
      loadJobs();
      loadStats();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const handleToggleVendor = async (id) => {
    try {
      const data = await authAPI.toggleUserStatus(id);
      showMsg(data.message);
      loadVendors();
      loadStats();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const handleDeleteVendor = async (id) => {
    if (!confirm("এই ভেন্ডর মুছে ফেলতে চান? তার সকল তথ্য মুছে যাবে।")) return;
    try {
      await authAPI.deleteUser(id);
      showMsg("ভেন্ডর মুছে ফেলা হয়েছে");
      loadVendors();
      loadStats();
    } catch (err) {
      showMsg(err.message, "error");
    }
  };

  const openVendorDetail = async (vendor) => {
    setVendorDetailModal(vendor);
    try {
      const data = await jobsAPI.getAll("limit=100");
      setVendorJobs(data.jobs.filter((j) => j.createdBy?._id === vendor._id));
    } catch {
      setVendorJobs([]);
    }
  };

  const statusLabel = {
    pending: "অপেক্ষমান",
    review: "পর্যালোচনায়",
    approved: "অনুমোদিত",
    rejected: "প্রত্যাখ্যাত",
  };

  const filteredVendors = vendors.filter(
    (v) =>
      !vendorSearch ||
      v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.email?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      v.company?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard__header">
        <div className="admin-header-row">
          <div>
            <h1>🛡️ অ্যাডমিন প্যানেল</h1>
            <p>স্বাগতম, <strong>{user?.name}</strong> — মাল্টি-ভেন্ডর জব পোর্টাল ম্যানেজমেন্ট</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`admin-msg ${msgType === "error" ? "admin-msg--error" : "admin-msg--success"}`}>
          {msg}
          <button onClick={() => setMsg("")} className="admin-msg__close">✕</button>
        </div>
      )}

      <div className="admin-nav">
        {[
          { key: "overview", label: "📊 ওভারভিউ" },
          { key: "jobs", label: "💼 চাকরি পরিচালনা" },
          { key: "vendors", label: "🏢 ভেন্ডর পরিচালনা" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`admin-nav__btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== OVERVIEW TAB ===================== */}
      {activeTab === "overview" && (
        <div className="admin-overview">
          <div className="stats-grid">
            <div className="stat-card stat-card--blue stat-card--clickable" onClick={() => { setActiveTab("jobs"); setFilter("all"); }}>
              <div className="stat-card__icon">💼</div>
              <div className="stat-card__label">মোট চাকরি</div>
              <div className="stat-card__value">{stats.totalJobs || 0}</div>
            </div>
            <div className="stat-card stat-card--orange stat-card--clickable" onClick={() => { setActiveTab("jobs"); setFilter("pending"); }}>
              <div className="stat-card__icon">⏳</div>
              <div className="stat-card__label">অপেক্ষমান</div>
              <div className="stat-card__value">{stats.pending || 0}</div>
            </div>
            <div className="stat-card stat-card--clickable" onClick={() => { setActiveTab("jobs"); setFilter("review"); }}>
              <div className="stat-card__icon">🔍</div>
              <div className="stat-card__label">পর্যালোচনায়</div>
              <div className="stat-card__value">{stats.review || 0}</div>
            </div>
            <div className="stat-card stat-card--green stat-card--clickable" onClick={() => { setActiveTab("jobs"); setFilter("approved"); }}>
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__label">অনুমোদিত</div>
              <div className="stat-card__value">{stats.approved || 0}</div>
            </div>
            <div className="stat-card stat-card--red stat-card--clickable" onClick={() => { setActiveTab("jobs"); setFilter("rejected"); }}>
              <div className="stat-card__icon">❌</div>
              <div className="stat-card__label">প্রত্যাখ্যাত</div>
              <div className="stat-card__value">{stats.rejected || 0}</div>
            </div>
            <div className="stat-card stat-card--clickable" onClick={() => setActiveTab("vendors")}>
              <div className="stat-card__icon">🏢</div>
              <div className="stat-card__label">মোট ভেন্ডর</div>
              <div className="stat-card__value">{stats.totalVendors || 0}</div>
            </div>
          </div>

          <div className="admin-overview__grid">
            <div className="admin-card">
              <div className="admin-card__header">
                <h3>⏳ সাম্প্রতিক অপেক্ষমান চাকরি</h3>
                <button className="admin-card__link" onClick={() => { setActiveTab("jobs"); setFilter("pending"); }}>
                  সব দেখুন →
                </button>
              </div>
              {recentJobs.length === 0 ? (
                <div className="admin-card__empty">কোনো অপেক্ষমান চাকরি নেই</div>
              ) : (
                <div className="admin-card__list">
                  {recentJobs.map((job) => (
                    <div key={job._id} className="admin-card__item">
                      <div className="admin-card__item-info">
                        <strong>{job.title}</strong>
                        <span>{job.company} — {job.createdBy?.name || "N/A"}</span>
                      </div>
                      <div className="admin-card__item-actions">
                        <button className="action-btn action-btn--success action-btn--sm" onClick={() => handleApprove(job._id)}>
                          অনুমোদন
                        </button>
                        <button className="action-btn action-btn--danger action-btn--sm" onClick={() => { setRejectModal(job._id); setRejectReason(""); }}>
                          প্রত্যাখ্যান
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-card__header">
                <h3>🏢 সাম্প্রতিক ভেন্ডর</h3>
                <button className="admin-card__link" onClick={() => setActiveTab("vendors")}>
                  সব দেখুন →
                </button>
              </div>
              {vendors.length === 0 ? (
                <div className="admin-card__empty">কোনো ভেন্ডর নেই</div>
              ) : (
                <div className="admin-card__list">
                  {vendors.slice(0, 5).map((v) => (
                    <div key={v._id} className="admin-card__item">
                      <div className="admin-card__item-info">
                        <strong>{v.name}</strong>
                        <span>{v.company || "কোম্পানি নেই"} — {v.email}</span>
                      </div>
                      <span className={`vendor-status ${v.isBlocked ? "vendor-status--blocked" : "vendor-status--active"}`}>
                        {v.isBlocked ? "ব্লকড" : "সক্রিয়"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== JOBS TAB ===================== */}
      {activeTab === "jobs" && (
        <>
          <div className="dashboard__toolbar">
            <div className="dashboard__tabs">
              {["all", "pending", "review", "approved", "rejected"].map((s) => (
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="jobs-table-wrapper">
            {loading ? (
              <div className="dashboard-empty"><p>লোড হচ্ছে...</p></div>
            ) : jobs.length === 0 ? (
              <div className="dashboard-empty">
                <h3>কোনো চাকরি পাওয়া যায়নি</h3>
                <p>ফিল্টার পরিবর্তন করে দেখুন</p>
              </div>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>শিরোনাম</th>
                    <th>কোম্পানি</th>
                    <th>ভেন্ডর</th>
                    <th>ক্যাটাগরি</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="job-title-cell">
                        <button className="link-btn" onClick={() => setJobDetailModal(job)}>
                          {job.title}
                        </button>
                      </td>
                      <td>{job.company}</td>
                      <td>{job.createdBy?.name || "N/A"}</td>
                      <td>{job.category || "—"}</td>
                      <td>
                        <span className={`status-badge status-badge--${job.status}`}>
                          {statusLabel[job.status]}
                        </span>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString("bn-BD")}</td>
                      <td className="action-cell">
                        {(job.status === "pending" || job.status === "review") && (
                          <>
                            <button className="action-btn action-btn--success" onClick={() => handleApprove(job._id)} title="অনুমোদন">
                              ✓ অনুমোদন
                            </button>
                            <button className="action-btn action-btn--danger" onClick={() => { setRejectModal(job._id); setRejectReason(""); }} title="প্রত্যাখ্যান">
                              ✕ প্রত্যাখ্যান
                            </button>
                          </>
                        )}
                        <button className="action-btn action-btn--outline" onClick={() => setJobDetailModal(job)} title="বিস্তারিত">
                          👁
                        </button>
                        <button className="action-btn action-btn--outline action-btn--del" onClick={() => handleDeleteJob(job._id)} title="মুছুন">
                          🗑
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

      {/* ===================== VENDORS TAB ===================== */}
      {activeTab === "vendors" && (
        <>
          <div className="dashboard__toolbar">
            <div>
              <span className="vendor-count">মোট ভেন্ডর: <strong>{vendors.length}</strong></span>
            </div>
            <input
              type="text"
              className="dashboard__search"
              placeholder="ভেন্ডর খুঁজুন (নাম, ইমেইল, কোম্পানি)..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
            />
          </div>

          <div className="jobs-table-wrapper">
            {filteredVendors.length === 0 ? (
              <div className="dashboard-empty"><h3>কোনো ভেন্ডর পাওয়া যায়নি</h3></div>
            ) : (
              <table className="jobs-table">
                <thead>
                  <tr>
                    <th>নাম</th>
                    <th>ইমেইল</th>
                    <th>কোম্পানি</th>
                    <th>ফোন</th>
                    <th>স্ট্যাটাস</th>
                    <th>যোগদান</th>
                    <th>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((v) => (
                    <tr key={v._id} className={v.isBlocked ? "row-blocked" : ""}>
                      <td className="job-title-cell">
                        <button className="link-btn" onClick={() => openVendorDetail(v)}>
                          {v.name}
                        </button>
                      </td>
                      <td>{v.email}</td>
                      <td>{v.company || "—"}</td>
                      <td>{v.phone || "—"}</td>
                      <td>
                        <span className={`vendor-status ${v.isBlocked ? "vendor-status--blocked" : "vendor-status--active"}`}>
                          {v.isBlocked ? "ব্লকড" : "সক্রিয়"}
                        </span>
                      </td>
                      <td>{new Date(v.createdAt).toLocaleDateString("bn-BD")}</td>
                      <td className="action-cell">
                        <button
                          className={`action-btn ${v.isBlocked ? "action-btn--success" : "action-btn--warning"}`}
                          onClick={() => handleToggleVendor(v._id)}
                        >
                          {v.isBlocked ? "আনব্লক" : "ব্লক"}
                        </button>
                        <button className="action-btn action-btn--outline" onClick={() => openVendorDetail(v)} title="বিস্তারিত">
                          👁
                        </button>
                        <button className="action-btn action-btn--outline action-btn--del" onClick={() => handleDeleteVendor(v._id)} title="মুছুন">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ===================== JOB DETAIL MODAL ===================== */}
      {jobDetailModal && (
        <div className="modal-overlay" onClick={() => setJobDetailModal(null)}>
          <div className="modal-content modal-content--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>চাকরির বিস্তারিত</h3>
              <button className="modal-close" onClick={() => setJobDetailModal(null)}>✕</button>
            </div>
            <div className="job-detail-grid">
              <div className="job-detail-row">
                <span className="job-detail-label">শিরোনাম:</span>
                <span>{jobDetailModal.title}</span>
              </div>
              {jobDetailModal.titleEn && (
                <div className="job-detail-row">
                  <span className="job-detail-label">Title (EN):</span>
                  <span>{jobDetailModal.titleEn}</span>
                </div>
              )}
              <div className="job-detail-row">
                <span className="job-detail-label">কোম্পানি:</span>
                <span>{jobDetailModal.company}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">ভেন্ডর:</span>
                <span>{jobDetailModal.createdBy?.name} ({jobDetailModal.createdBy?.email})</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">অবস্থান:</span>
                <span>{jobDetailModal.location || "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">ক্যাটাগরি:</span>
                <span>{jobDetailModal.category || "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">চাকরির ধরন:</span>
                <span>{jobDetailModal.jobType || "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">বেতন:</span>
                <span>{jobDetailModal.salary || ((jobDetailModal.salaryMin || jobDetailModal.salaryMax) ? `${jobDetailModal.salaryMin || 0} - ${jobDetailModal.salaryMax || 0} ৳` : "—")}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">অভিজ্ঞতা:</span>
                <span>{jobDetailModal.experience || "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">শূন্যপদ:</span>
                <span>{jobDetailModal.vacancies || "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">শেষ তারিখ:</span>
                <span>{jobDetailModal.deadline ? new Date(jobDetailModal.deadline).toLocaleDateString("bn-BD") : "—"}</span>
              </div>
              <div className="job-detail-row">
                <span className="job-detail-label">স্ট্যাটাস:</span>
                <span className={`status-badge status-badge--${jobDetailModal.status}`}>
                  {statusLabel[jobDetailModal.status]}
                </span>
              </div>
              {jobDetailModal.description && (
                <div className="job-detail-row job-detail-row--full">
                  <span className="job-detail-label">বিবরণ:</span>
                  <p>{jobDetailModal.description}</p>
                </div>
              )}
              {jobDetailModal.skills?.length > 0 && (
                <div className="job-detail-row job-detail-row--full">
                  <span className="job-detail-label">দক্ষতা:</span>
                  <div className="skill-tags">
                    {jobDetailModal.skills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {jobDetailModal.requirements?.length > 0 && (
                <div className="job-detail-row job-detail-row--full">
                  <span className="job-detail-label">যোগ্যতা:</span>
                  <ul>{jobDetailModal.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}
              {jobDetailModal.benefits?.length > 0 && (
                <div className="job-detail-row job-detail-row--full">
                  <span className="job-detail-label">সুযোগ-সুবিধা:</span>
                  <ul>{jobDetailModal.benefits.map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
              )}
            </div>
            {(jobDetailModal.status === "pending" || jobDetailModal.status === "review") && (
              <div className="modal-actions">
                <button className="action-btn action-btn--success" onClick={() => { handleApprove(jobDetailModal._id); setJobDetailModal(null); }}>
                  ✓ অনুমোদন করুন
                </button>
                <button className="action-btn action-btn--danger" onClick={() => { setRejectModal(jobDetailModal._id); setRejectReason(""); setJobDetailModal(null); }}>
                  ✕ প্রত্যাখ্যান করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== VENDOR DETAIL MODAL ===================== */}
      {vendorDetailModal && (
        <div className="modal-overlay" onClick={() => setVendorDetailModal(null)}>
          <div className="modal-content modal-content--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>ভেন্ডর বিস্তারিত</h3>
              <button className="modal-close" onClick={() => setVendorDetailModal(null)}>✕</button>
            </div>
            <div className="vendor-detail">
              <div className="vendor-detail__info">
                <div className="vendor-detail__avatar">{vendorDetailModal.name?.charAt(0)}</div>
                <div>
                  <h4>{vendorDetailModal.name}</h4>
                  <p>{vendorDetailModal.email}</p>
                  <p>{vendorDetailModal.company || "কোম্পানি নেই"}</p>
                  <p>ফোন: {vendorDetailModal.phone || "—"}</p>
                  <p>যোগদান: {new Date(vendorDetailModal.createdAt).toLocaleDateString("bn-BD")}</p>
                  <span className={`vendor-status ${vendorDetailModal.isBlocked ? "vendor-status--blocked" : "vendor-status--active"}`}>
                    {vendorDetailModal.isBlocked ? "ব্লকড" : "সক্রিয়"}
                  </span>
                </div>
              </div>

              <h4 style={{ marginTop: 20, marginBottom: 12 }}>পোস্ট করা চাকরি ({vendorJobs.length})</h4>
              {vendorJobs.length === 0 ? (
                <p className="admin-card__empty">কোনো চাকরি পোস্ট করেনি</p>
              ) : (
                <table className="jobs-table">
                  <thead>
                    <tr>
                      <th>শিরোনাম</th>
                      <th>স্ট্যাটাস</th>
                      <th>তারিখ</th>
                      <th>অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorJobs.map((job) => (
                      <tr key={job._id}>
                        <td>{job.title}</td>
                        <td>
                          <span className={`status-badge status-badge--${job.status}`}>
                            {statusLabel[job.status]}
                          </span>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString("bn-BD")}</td>
                        <td>
                          {(job.status === "pending" || job.status === "review") && (
                            <button className="action-btn action-btn--success action-btn--sm" onClick={() => handleApprove(job._id)}>
                              অনুমোদন
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-actions">
              <button
                className={`action-btn ${vendorDetailModal.isBlocked ? "action-btn--success" : "action-btn--warning"}`}
                onClick={() => { handleToggleVendor(vendorDetailModal._id); setVendorDetailModal(null); }}
              >
                {vendorDetailModal.isBlocked ? "আনব্লক করুন" : "ব্লক করুন"}
              </button>
              <button className="btn-cancel" onClick={() => setVendorDetailModal(null)}>বন্ধ করুন</button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== REJECT MODAL ===================== */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>প্রত্যাখ্যানের কারণ</h3>
              <button className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <textarea
              rows="3"
              style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--border)", marginTop: 10 }}
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
