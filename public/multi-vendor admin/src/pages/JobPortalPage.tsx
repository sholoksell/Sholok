import { useState, useEffect, useCallback, type ElementType } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle, XCircle, Eye, Clock, Search,
  MapPin, Building, Users, Star, AlertTriangle, Ban,
  RefreshCw, Loader2, Send,
} from "lucide-react";

// ─── API helpers ──────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api/admin-panel";

const request = async (url: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const res = await fetch(`${API_BASE}${url}`, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

const jobsAPI = {
  getAll: (params = "") => request(`/jobs?${params}`),
  approve: (id: string) => request(`/jobs/approve/${id}`, { method: "PUT" }),
  reject: (id: string, reason = "") =>
    request(`/jobs/reject/${id}`, { method: "PUT", body: JSON.stringify({ reason }) }),
  sendToReview: (id: string) =>
    request(`/jobs/send-to-review/${id}`, { method: "PUT" }),
};

// ─── Types ────────────────────────────────────────────────────────────
interface JobPost {
  _id: string;
  title: string;
  titleEn?: string;
  company: string;
  companyLogo: string;
  location: string;
  jobType: string;
  category: string;
  experience: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  deadline: string;
  featured: boolean;
  urgent: boolean;
  skills: string[];
  requirements: string[];
  benefits: string[];
  vacancies: number;
  description: string;
  status: "pending" | "review" | "approved" | "rejected";
  rejectionReason?: string;
  createdBy?: { name: string; email: string; company?: string };
  createdAt: string;
  updatedAt: string;
}

// ─── Config ───────────────────────────────────────────────────────────
const statusConfig: Record<string, { cls: string; icon: ElementType; color: string; label: string }> = {
  pending:  { cls: "badge-pending",   icon: Clock,       color: "text-neon-orange",  label: "অপেক্ষমান" },
  review:   { cls: "badge-premium",   icon: Eye,         color: "text-neon-purple",  label: "পর্যালোচনায়" },
  approved: { cls: "badge-active",    icon: CheckCircle, color: "text-neon-green",   label: "অনুমোদিত" },
  rejected: { cls: "badge-suspended", icon: XCircle,     color: "text-destructive",  label: "প্রত্যাখ্যাত" },
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ─── Component ────────────────────────────────────────────────────────
export default function JobPortalPage() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch jobs from backend
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (filter !== "all") params.set("status", filter);
      if (search) params.set("search", search);
      const data = await jobsAPI.getAll(params.toString());
      setJobs(data.jobs);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      console.error("Failed to load jobs:", err);
    }
    setLoading(false);
  }, [filter, search, page]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  // Counts (from loaded data for display)
  const counts = {
    pending: jobs.filter((j) => j.status === "pending").length,
    review: jobs.filter((j) => j.status === "review").length,
    approved: jobs.filter((j) => j.status === "approved").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
    total,
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await jobsAPI.approve(id);
      await loadJobs();
      setSelectedJob(null);
    } catch (err: any) {
      alert(err.message || "Approve failed");
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Rejection reason (optional):");
    setActionLoading(id);
    try {
      await jobsAPI.reject(id, reason || "");
      await loadJobs();
      setSelectedJob(null);
    } catch (err: any) {
      alert(err.message || "Reject failed");
    }
    setActionLoading(null);
  };

  const handleSendToReview = async (id: string) => {
    setActionLoading(id);
    try {
      await jobsAPI.sendToReview(id);
      await loadJobs();
    } catch (err: any) {
      alert(err.message || "Send to review failed");
    }
    setActionLoading(null);
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("bn-BD"); } catch { return d; }
  };

  const tabs = [
    { key: "all", label: "সকল" },
    { key: "pending", label: "অপেক্ষমান" },
    { key: "review", label: "পর্যালোচনায়" },
    { key: "approved", label: "অনুমোদিত" },
    { key: "rejected", label: "প্রত্যাখ্যাত" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-neon">Job Portal Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, approve or reject job posts submitted by vendors & companies
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          onClick={() => loadJobs()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "মোট চাকরি", value: counts.total, icon: Briefcase, color: "text-neon-blue" },
          { label: "অপেক্ষমান", value: counts.pending, icon: Clock, color: "text-neon-orange" },
          { label: "পর্যালোচনায়", value: counts.review, icon: Eye, color: "text-neon-purple" },
          { label: "অনুমোদিত", value: counts.approved, icon: CheckCircle, color: "text-neon-green" },
          { label: "প্রত্যাখ্যাত", value: counts.rejected, icon: XCircle, color: "text-destructive" },
        ].map((s) => (
          <motion.div key={s.label} variants={itemVariants} className="glass-card p-4 flex items-center gap-3">
            <s.icon className={`w-7 h-7 ${s.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search jobs by title, company..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setFilter(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
        </div>
      )}

      {/* Job Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job, i) => {
            const cfg = statusConfig[job.status] || statusConfig.pending;
            const isActioning = actionLoading === job._id;
            return (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-4 hover-card-float space-y-3"
              >
                {/* Company Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{job.companyLogo || "🏢"}</span>
                    <div>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      {job.createdBy && (
                        <p className="text-[10px] text-muted-foreground/60">
                          by: {job.createdBy.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge-status ${cfg.cls} flex items-center gap-1`}>
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <p className="text-sm font-semibold leading-snug">{job.title}</p>
                  {job.titleEn && <p className="text-xs text-muted-foreground">{job.titleEn}</p>}
                </div>

                {/* Info */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />{job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />{job.vacancies} পদ
                  </span>
                </div>

                {/* Salary & Experience */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neon-green">{job.salary}</span>
                  <span className="text-muted-foreground">{job.experience}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{job.category}</span>
                  {job.featured && (
                    <span className="text-[10px] bg-neon-orange/20 text-neon-orange px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-neon-orange" />Featured
                    </span>
                  )}
                  {job.urgent && (
                    <span className="text-[10px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />Urgent
                    </span>
                  )}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 4).map((s) => (
                    <span key={s} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                  {job.skills.length > 4 && (
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">+{job.skills.length - 4}</span>
                  )}
                </div>

                {/* Meta */}
                <div className="text-[10px] text-muted-foreground flex justify-between">
                  <span>তারিখ: {formatDate(job.createdAt)}</span>
                  {job.deadline && <span>Deadline: {job.deadline}</span>}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {(job.status === "pending" || job.status === "review") && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleApprove(job._id)}
                        disabled={isActioning}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50"
                        style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}
                      >
                        {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleReject(job._id)}
                        disabled={isActioning}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {isActioning ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Reject
                      </motion.button>
                    </>
                  )}
                  {job.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSendToReview(job._id)}
                      disabled={isActioning}
                      className="py-1.5 px-2 rounded-lg text-xs bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 disabled:opacity-50"
                      title="Send to Super Admin Review"
                    >
                      <Send className="w-3 h-3" />
                    </motion.button>
                  )}
                  {job.status === "approved" && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleReject(job._id)}
                      disabled={isActioning}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <Ban className="w-3 h-3" />Revoke
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedJob(job)}
                    className="py-1.5 px-2 rounded-lg text-xs bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="w-3 h-3" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">কোনো চাকরি পোস্ট পাওয়া যায়নি</p>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                page === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedJob(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg mx-4 p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedJob.companyLogo || "🏢"}</span>
                <div>
                  <h2 className="text-lg font-bold">{selectedJob.title}</h2>
                  {selectedJob.titleEn && <p className="text-sm text-muted-foreground">{selectedJob.titleEn}</p>}
                </div>
              </div>
              <span className={`badge-status ${statusConfig[selectedJob.status]?.cls}`}>
                {statusConfig[selectedJob.status]?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground" /><span>{selectedJob.company}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{selectedJob.location}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{selectedJob.jobType}</span></div>
              <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span>{selectedJob.vacancies} Vacancies</span></div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-semibold text-neon-green">{selectedJob.salary}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-sm">{selectedJob.experience}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm">{selectedJob.category}</p>
            </div>

            {selectedJob.description && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm whitespace-pre-line">{selectedJob.description}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Skills</p>
              <div className="flex flex-wrap gap-1">
                {selectedJob.skills.map((s) => (
                  <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>

            {selectedJob.createdBy && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm">{selectedJob.createdBy.name} ({selectedJob.createdBy.email})</p>
              </div>
            )}

            {selectedJob.rejectionReason && (
              <div className="space-y-1">
                <p className="text-xs text-destructive font-medium">Rejection Reason</p>
                <p className="text-sm text-destructive/80">{selectedJob.rejectionReason}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created: {formatDate(selectedJob.createdAt)}</span>
              {selectedJob.deadline && <span>Deadline: {selectedJob.deadline}</span>}
            </div>

            <div className="flex gap-2 pt-2">
              {(selectedJob.status === "pending" || selectedJob.status === "review") && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleApprove(selectedJob._id)}
                    disabled={!!actionLoading}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    style={{ background: "var(--gradient-neon)", color: "hsl(var(--primary-foreground))" }}
                  >
                    <CheckCircle className="w-4 h-4" />Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleReject(selectedJob._id)}
                    disabled={!!actionLoading}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />Reject
                  </motion.button>
                </>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
