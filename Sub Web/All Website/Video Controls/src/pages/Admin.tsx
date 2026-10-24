import { Users, Video as VideoIcon, Flag, Eye, TrendingUp, DollarSign, Loader2, Shield, Settings, Trash2, Ban, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { adminApi, adminAuthApi, isAdminLoggedIn, removeAdminToken, videoApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Admin = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [adminVideos, setAdminVideos] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "videos" | "users" | "controls">("overview");
  const [controlsVideo, setControlsVideo] = useState<any>(null);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Verify admin session independently
  useEffect(() => {
    const verifyAdmin = async () => {
      if (!isAdminLoggedIn()) {
        setVerifying(false);
        return;
      }
      try {
        const data = await adminAuthApi.verify();
        if (data.user?.role === "admin") {
          setAdminUser(data.user);
          setVerified(true);
        } else {
          removeAdminToken();
        }
      } catch {
        removeAdminToken();
      }
      setVerifying(false);
    };
    verifyAdmin();
  }, []);

  // Fetch admin data only after verified
  useEffect(() => {
    if (!verified) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, videosData, usersData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getVideos(),
          adminApi.getUsers(),
        ]);
        setStats(statsData);
        setAdminVideos(videosData.videos || []);
        setAdminUsers(usersData.users || []);
      } catch {
        // API error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [verified]);

  const handleLogout = () => {
    removeAdminToken();
    navigate("/admin/login", { replace: true });
  };

  const handleRemoveVideo = async (videoId: string) => {
    try {
      await adminApi.removeVideo(videoId);
      setAdminVideos(adminVideos.filter((v) => v._id !== videoId));
    } catch {}
  };

  const handleToggleUser = async (userId: string) => {
    try {
      const data = await adminApi.toggleUser(userId);
      setAdminUsers(adminUsers.map((u) => (u._id === userId ? data.user : u)));
    } catch {}
  };

  const handleUpdateControls = async (field: string, value: any) => {
    if (!controlsVideo) return;
    try {
      await adminApi.updateVideoControls(controlsVideo._id, { [field]: value });
      setControlsVideo({
        ...controlsVideo,
        videoControlsAdmin: { ...controlsVideo.videoControlsAdmin, [field]: value },
      });
      setAdminVideos(adminVideos.map((v) =>
        v._id === controlsVideo._id ? { ...v, videoControlsAdmin: { ...v.videoControlsAdmin, [field]: value } } : v
      ));
    } catch {}
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", icon: Users },
    { label: "Total Videos", value: stats?.totalVideos?.toLocaleString() || "0", icon: VideoIcon },
    { label: "Active Reports", value: stats?.activeReports?.toString() || "0", icon: Flag },
    { label: "Total Views", value: stats?.totalViews?.toLocaleString() || "0", icon: Eye },
    { label: "Total Channels", value: stats?.totalChannels?.toLocaleString() || "0", icon: TrendingUp },
    { label: "Comments", value: stats?.totalComments?.toLocaleString() || "0", icon: DollarSign },
  ];

  if (verifying) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!verified) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold">Sholok Admin Panel</h1>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {adminUser?.displayName || adminUser?.username}
          </span>
          <Button size="sm" variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview, moderation tools & Video Controls Admin</p>
          </div>
          {loading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-6 border-b border-border">
          {(["overview", "videos", "users", "controls"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-semibold capitalize transition-smooth ${activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "controls" ? "Video Controls Admin" : tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
          {statCards.map((s) => (
            <div key={s.label} className="p-5 rounded-2xl gradient-card border border-border hover:shadow-glow transition-smooth">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-primary/15 text-primary grid place-items-center">
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-3">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Videos Tab / Controls Tab */}
        {(activeTab === "overview" || activeTab === "videos" || activeTab === "controls") && (
          <div className="mt-10 rounded-2xl gradient-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-bold">
                {activeTab === "controls" ? "Video Controls Admin" : "All Videos"}
              </h2>
              <span className="text-sm text-muted-foreground">{adminVideos.length} total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="text-left p-4">Video</th>
                    <th className="text-left p-4">Channel</th>
                    <th className="text-left p-4">Views</th>
                    <th className="text-left p-4">Status</th>
                    {activeTab === "controls" && <th className="text-left p-4">Controls</th>}
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminVideos.map((v: any) => {
                    const vid = v._id;
                    const vTitle = v.title;
                    const vChannel = v.channel?.name || "Unknown";
                    const vViews = v.views?.toLocaleString() || "0";
                    const vThumb = v.thumbnailPath ? videoApi.getThumbnailUrl(v._id) : "";
                    const vStatus = v.status || "active";
                    const modStatus = v.videoControlsAdmin?.moderationStatus || "approved";

                    return (
                      <tr key={vid} className="border-t border-border hover:bg-secondary/30 transition-smooth">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {vThumb && <img src={vThumb} alt="" className="w-16 h-10 rounded object-cover" />}
                            <span className="font-medium line-clamp-1 max-w-xs">{vTitle}</span>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{vChannel}</td>
                        <td className="p-4">{vViews}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            vStatus === "active" ? "bg-green-500/15 text-green-400" :
                            vStatus === "removed" ? "bg-red-500/15 text-red-400" :
                            "bg-yellow-500/15 text-yellow-400"
                          }`}>
                            {vStatus}
                          </span>
                          {modStatus === "flagged" && (
                            <span className="ml-2 px-2 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold">Flagged</span>
                          )}
                        </td>
                        {activeTab === "controls" && (
                          <td className="p-4">
                            <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => { setControlsVideo(v); setControlsOpen(true); }}>
                              <Settings className="w-3 h-3 mr-1" /> Manage
                            </Button>
                          </td>
                        )}
                        <td className="p-4">
                          <Button size="sm" variant="ghost" className="text-destructive text-xs" onClick={() => handleRemoveVideo(vid)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="mt-10 rounded-2xl gradient-card border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="font-bold">All Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u: any) => (
                    <tr key={u._id} className="border-t border-border hover:bg-secondary/30 transition-smooth">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary grid place-items-center text-xs font-bold">
                            {u.displayName?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{u.displayName || u.username}</p>
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          u.role === "admin" ? "bg-purple-500/15 text-purple-400" :
                          u.role === "creator" ? "bg-blue-500/15 text-blue-400" :
                          "bg-gray-500/15 text-gray-400"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => handleToggleUser(u._id)}>
                          {u.isActive ? <><Ban className="w-3 h-3 mr-1" /> Disable</> : <><CheckCircle className="w-3 h-3 mr-1" /> Enable</>}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Video Controls Admin Dialog */}
      <Dialog open={controlsOpen} onOpenChange={setControlsOpen}>
        <DialogContent className="sm:max-w-lg gradient-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Video Controls Admin
            </DialogTitle>
          </DialogHeader>
          {controlsVideo && (
            <div className="space-y-4 mt-4">
              <p className="text-sm font-semibold line-clamp-1">{controlsVideo.title}</p>

              <div className="space-y-3">
                {[
                  { key: "autoplay", label: "Autoplay" },
                  { key: "allowDownload", label: "Allow Download" },
                  { key: "allowEmbed", label: "Allow Embed" },
                  { key: "ageRestricted", label: "Age Restricted" },
                  { key: "isFeatured", label: "Featured Video" },
                  { key: "isPinned", label: "Pinned" },
                  { key: "watermark", label: "Show Watermark" },
                  { key: "commentsEnabled", label: "Comments Enabled" },
                  { key: "likesVisible", label: "Likes Visible" },
                  { key: "viewCountVisible", label: "View Count Visible" },
                  { key: "monetizationEnabled", label: "Monetization" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <label className="text-sm font-medium">{label}</label>
                    <Switch
                      checked={!!controlsVideo.videoControlsAdmin?.[key]}
                      onCheckedChange={(checked) => handleUpdateControls(key, checked)}
                    />
                  </div>
                ))}

                <div className="pt-2 border-t border-border">
                  <label className="text-sm font-semibold block mb-2">Moderation Status</label>
                  <select
                    value={controlsVideo.videoControlsAdmin?.moderationStatus || "approved"}
                    onChange={(e) => handleUpdateControls("moderationStatus", e.target.value)}
                    className="w-full rounded-lg bg-background/50 border border-input px-3 py-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Ad Placement</label>
                  <select
                    value={controlsVideo.videoControlsAdmin?.adPlacement || "none"}
                    onChange={(e) => handleUpdateControls("adPlacement", e.target.value)}
                    className="w-full rounded-lg bg-background/50 border border-input px-3 py-2 text-sm"
                  >
                    <option value="none">None</option>
                    <option value="pre-roll">Pre-roll</option>
                    <option value="mid-roll">Mid-roll</option>
                    <option value="post-roll">Post-roll</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Max Resolution</label>
                  <select
                    value={controlsVideo.videoControlsAdmin?.maxResolution || "1080p"}
                    onChange={(e) => handleUpdateControls("maxResolution", e.target.value)}
                    className="w-full rounded-lg bg-background/50 border border-input px-3 py-2 text-sm"
                  >
                    <option value="360p">360p</option>
                    <option value="480p">480p</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4K">4K</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Priority (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={controlsVideo.videoControlsAdmin?.priority || 0}
                    onChange={(e) => handleUpdateControls("priority", parseInt(e.target.value))}
                    className="w-full rounded-lg bg-background/50 border border-input px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
