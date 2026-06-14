import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { jobsAPI, dashboardAPI } from "../services/api";
import "./Dashboard.css";

const emptyJob = {
  title: "", titleEn: "", company: "", companyLogo: "🏢",
  salary: "", salaryMin: "", salaryMax: "",
  location: "", jobType: "পূর্ণকালীন", category: "প্রযুক্তি",
  experience: "", description: "", skills: "",
  requirements: "", benefits: "", vacancies: 1,
  deadline: "", featured: false, urgent: false,
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(emptyJob);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch {}
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter !== "all") params.set("status", filter);
      const data = await jobsAPI.getMyJobs(params.toString());
      setJobs(data.jobs);
      setTotalPages(data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadJobs(); }, [filter, page]);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const openCreate = () => {
    setEditingJob(null);
    setForm({ ...emptyJob });
    setShowForm(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setForm({
      ...job,
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : job.skills || "",
      requirements: Array.isArray(job.requirements) ? job.requirements.join(", ") : job.requirements || "",
      benefits: Array.isArray(job.benefits) ? job.benefits.join(", ") : job.benefits || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    const payload = {
      ...form,
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      vacancies: Number(form.vacancies) || 1,
      skills: typeof form.skills === "string"
        ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : form.skills,
      requirements: typeof form.requirements === "string"
        ? form.requirements.split(",").map((s) => s.trim()).filter(Boolean) : form.requirements,
      benefits: typeof form.benefits === "string"
        ? form.benefits.split(",").map((s) => s.trim()).filter(Boolean) : form.benefits,
    };

    try {
      if (editingJob) {
        await jobsAPI.update(editingJob._id, payload);
        setMsg("Job updated successfully!");
      } else {
        await jobsAPI.create(payload);
        setMsg("Job created! It will be reviewed by admin.");
      }
      setShowForm(false);
      loadJobs();
      loadStats();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await jobsAPI.delete(id);
      loadJobs();
      loadStats();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusLabel = { pending: "অপেক্ষমান", review: "পর্যালোচনায়", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>ভেন্ডর ড্যাশবোর্ড</h1>
        <p>স্বাগতম, {user?.name} — আপনার চাকরি পোস্ট পরিচালনা করুন</p>
      </div>

      {msg && <div style={{ padding: "10px 16px", background: "#E3FCEF", borderRadius: 8, marginBottom: 16, color: "#006644", fontWeight: 600 }}>{msg}</div>}

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
      </div>

      {/* Toolbar */}
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
        <button className="btn-submit" onClick={openCreate}>+ নতুন চাকরি পোস্ট</button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form className="create-job-form fade-in-up" onSubmit={handleSubmit}>
          <h2>{editingJob ? "চাকরি সম্পাদনা করুন" : "নতুন চাকরি তৈরি করুন"}</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Job Title *</label>
              <input required value={form.title} onChange={(e) => handleChange("title", e.target.value)} />
            </div>
            <div className="form-group">
              <label>কোম্পানি *</label>
              <input required value={form.company} onChange={(e) => handleChange("company", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>কোম্পানি লোগো (emoji)</label>
              <input value={form.companyLogo} onChange={(e) => handleChange("companyLogo", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>বেতন *</label>
              <input required value={form.salary} onChange={(e) => handleChange("salary", e.target.value)} />
            </div>
            <div className="form-group">
              <label>অবস্থান *</label>
              <input required value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>চাকরির ধরন *</label>
              <select required value={form.jobType} onChange={(e) => handleChange("jobType", e.target.value)}>
                <option value="পূর্ণকালীন">পূর্ণকালীন</option>
                <option value="পার্টটাইম / ফ্রিল্যান্স">পার্টটাইম / ফ্রিল্যান্স</option>
                <option value="চুক্তিভিত্তিক">চুক্তিভিত্তিক</option>
                <option value="ইন্টার্নশিপ">ইন্টার্নশিপ</option>
              </select>
            </div>
            <div className="form-group">
              <label>ক্যাটাগরি</label>
              <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                <option value="প্রযুক্তি">প্রযুক্তি</option>
                <option value="মার্কেটিং">মার্কেটিং</option>
                <option value="ব্যাংকিং">ব্যাংকিং</option>
                <option value="এনজিও / উন্নয়ন">এনজিও / উন্নয়ন</option>
                <option value="ফার্মা / স্বাস্থ্য">ফার্মা / স্বাস্থ্য</option>
                <option value="ডিজাইন">ডিজাইন</option>
                <option value="এইচআর">এইচআর</option>
                <option value="অন্যান্য">অন্যান্য</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>অভিজ্ঞতা</label>
              <input placeholder="" value={form.experience} onChange={(e) => handleChange("experience", e.target.value)} />
            </div>
            <div className="form-group">
              <label>শেষ তারিখ</label>
              <input placeholder="" value={form.deadline} onChange={(e) => handleChange("deadline", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>পদ সংখ্যা</label>
              <input type="number" min="1" value={form.vacancies} onChange={(e) => handleChange("vacancies", e.target.value)} />
            </div>
            <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => handleChange("featured", e.target.checked)} />
                ফিচার্ড
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={form.urgent} onChange={(e) => handleChange("urgent", e.target.checked)} />
                জরুরি
              </label>
            </div>
          </div>

          <div className="form-row form-row--full">
            <div className="form-group">
              <label>চাকরির বিবরণ *</label>
              <textarea required rows="5" value={form.description} onChange={(e) => handleChange("description", e.target.value)} />
            </div>
          </div>

          <div className="form-row form-row--full">
            <div className="form-group">
              <label>দক্ষতা</label>
              <input placeholder="" value={form.skills} onChange={(e) => handleChange("skills", e.target.value)} />
            </div>
          </div>

          <div className="form-row form-row--full">
            <div className="form-group">
              <label>শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা</label>
              <input placeholder="" value={form.requirements} onChange={(e) => handleChange("requirements", e.target.value)} />
            </div>
          </div>

          <div className="form-row form-row--full">
            <div className="form-group">
              <label>সুযোগ-সুবিধা</label>
              <input placeholder="" value={form.benefits} onChange={(e) => handleChange("benefits", e.target.value)} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingJob ? "আপডেট করুন" : "পোস্ট করুন"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>বাতিল</button>
          </div>
        </form>
      )}

      {/* Jobs Table */}
      <div className="jobs-table-wrapper">
        {loading ? (
          <div className="dashboard-empty"><p>লোড হচ্ছে...</p></div>
        ) : jobs.length === 0 ? (
          <div className="dashboard-empty">
            <h3>কোনো চাকরি পোস্ট নেই</h3>
            <p>উপরের বাটনে ক্লিক করে নতুন চাকরি পোস্ট তৈরি করুন</p>
          </div>
        ) : (
          <table className="jobs-table">
            <thead>
              <tr>
                <th>চাকরির শিরোনাম</th>
                <th>কোম্পানি</th>
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
                  <td>{job.location}</td>
                  <td>
                    <span className={`status-badge status-badge--${job.status}`}>
                      {statusLabel[job.status]}
                    </span>
                  </td>
                  <td>{new Date(job.createdAt).toLocaleDateString("bn-BD")}</td>
                  <td>
                    {["pending", "rejected"].includes(job.status) && (
                      <button className="action-btn action-btn--primary" onClick={() => openEdit(job)}>
                        সম্পাদনা
                      </button>
                    )}
                    <button className="action-btn action-btn--danger" onClick={() => handleDelete(job._id)}>
                      মুছুন
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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
    </div>
  );
}
