import express from "express";
import Job from "../models/Job.js";

const router = express.Router();

// GET /api/admin-panel/jobs — All jobs for admin panel (no auth)
router.get("/jobs", async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { titleEn: regex }, { company: regex }];
    }

    const jobs = await Job.find(filter)
      .populate("createdBy", "name email company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin-panel/jobs/approve/:id
router.put("/jobs/approve/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "approved";
    await job.save();

    res.json({ message: "Job approved successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin-panel/jobs/reject/:id
router.put("/jobs/reject/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "rejected";
    job.rejectionReason = req.body.reason || "";
    await job.save();

    res.json({ message: "Job rejected", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin-panel/jobs/send-to-review/:id
router.put("/jobs/send-to-review/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.status = "review";
    await job.save();

    res.json({ message: "Job sent for review", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
