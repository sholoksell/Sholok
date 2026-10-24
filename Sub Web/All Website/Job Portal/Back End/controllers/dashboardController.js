import Job from "../models/Job.js";
import User from "../models/User.js";

// GET /api/dashboard/stats — Dashboard analytics
export const getDashboardStats = async (req, res) => {
  try {
    const { role } = req.user;
    const stats = {};

    if (role === "vendor") {
      const userId = req.user._id;
      stats.totalJobs = await Job.countDocuments({ createdBy: userId });
      stats.pending = await Job.countDocuments({ createdBy: userId, status: "pending" });
      stats.review = await Job.countDocuments({ createdBy: userId, status: "review" });
      stats.approved = await Job.countDocuments({ createdBy: userId, status: "approved" });
      stats.rejected = await Job.countDocuments({ createdBy: userId, status: "rejected" });
    } else if (role === "admin") {
      stats.totalJobs = await Job.countDocuments();
      stats.pending = await Job.countDocuments({ status: "pending" });
      stats.review = await Job.countDocuments({ status: "review" });
      stats.approved = await Job.countDocuments({ status: "approved" });
      stats.rejected = await Job.countDocuments({ status: "rejected" });
      stats.totalVendors = await User.countDocuments({ role: "vendor" });
    } else if (role === "super_admin") {
      stats.totalJobs = await Job.countDocuments();
      stats.pending = await Job.countDocuments({ status: "pending" });
      stats.review = await Job.countDocuments({ status: "review" });
      stats.approved = await Job.countDocuments({ status: "approved" });
      stats.rejected = await Job.countDocuments({ status: "rejected" });
      stats.totalVendors = await User.countDocuments({ role: "vendor" });
      stats.totalAdmins = await User.countDocuments({ role: "admin" });
      stats.totalUsers = await User.countDocuments({ role: "user" });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
