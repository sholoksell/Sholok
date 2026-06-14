import Job from "../models/Job.js";

// POST /api/jobs — Vendor creates a job
export const createJob = async (req, res) => {
  try {
    const {
      title, titleEn, company, companyLogo, companyRef, salary, salaryMin, salaryMax,
      location, jobType, category, experience, description, skills,
      requirements, benefits, vacancies, deadline, featured, urgent,
    } = req.body;

    const job = await Job.create({
      title, titleEn, company, companyLogo, companyRef, salary, salaryMin, salaryMax,
      location, jobType, category, experience, description, skills,
      requirements, benefits, vacancies, deadline, featured, urgent,
      createdBy: req.user._id,
      status: "pending",
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/jobs — Public: only approved jobs with pagination, search, filters
export const getApprovedJobs = async (req, res) => {
  try {
    const {
      page = 1, limit = 12, search, category, location, jobType,
      salaryMin, salaryMax, sort = "latest",
    } = req.query;

    const filter = { status: "approved" };

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { title: regex },
        { titleEn: regex },
        { company: regex },
        { skills: regex },
      ];
    }
    if (category && category !== "all") filter.category = category;
    if (location) filter.location = new RegExp(location, "i");
    if (jobType) filter.jobType = jobType;
    if (salaryMin) filter.salaryMin = { $gte: Number(salaryMin) };
    if (salaryMax) filter.salaryMax = { ...filter.salaryMax, $lte: Number(salaryMax) };

    let sortOption = { createdAt: -1 };
    if (sort === "salary") sortOption = { salaryMax: -1 };
    if (sort === "featured") sortOption = { featured: -1, createdAt: -1 };

    const jobs = await Job.find(filter)
      .populate("createdBy", "name company")
      .sort(sortOption)
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
};

// GET /api/jobs/all — Admin/Super Admin: all jobs with filters
export const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
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
};

// GET /api/jobs/my-jobs — Vendor: own jobs
export const getMyJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = { createdBy: req.user._id };
    if (status) filter.status = status;

    const jobs = await Job.find(filter)
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
};

// GET /api/jobs/:id — Single job
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("createdBy", "name company email")
      .populate("companyRef");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/jobs/:id — Vendor edits own job (only if pending or rejected)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this job" });
    }

    if (!["pending", "rejected"].includes(job.status)) {
      return res.status(400).json({ message: "Can only edit pending or rejected jobs" });
    }

    const allowedFields = [
      "title", "titleEn", "company", "companyLogo", "companyRef", "salary", "salaryMin",
      "salaryMax", "location", "jobType", "category", "experience",
      "description", "skills", "requirements", "benefits", "vacancies",
      "deadline", "featured", "urgent",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    // Reset to pending when re-edited after rejection
    if (job.status === "rejected") {
      job.status = "pending";
      job.rejectionReason = undefined;
    }

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/jobs/:id — Vendor or Admin can delete
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const isOwner = job.createdBy.toString() === req.user._id.toString();
    const isAdmin = ["admin", "super_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/jobs/send-to-super-admin/:id — Admin sends job for super admin review
export const sendToSuperAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "pending") {
      return res.status(400).json({ message: "Only pending jobs can be sent for review" });
    }

    job.status = "review";
    await job.save();

    res.json({ message: "Job sent to Super Admin for review", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/jobs/approve/:id — Admin/Super Admin approves
export const approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!["pending", "review"].includes(job.status)) {
      return res.status(400).json({ message: "Only pending or review jobs can be approved" });
    }

    job.status = "approved";
    await job.save();

    res.json({ message: "Job approved successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/jobs/reject/:id — Super Admin rejects
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!["review", "pending"].includes(job.status)) {
      return res.status(400).json({ message: "This job cannot be rejected" });
    }

    job.status = "rejected";
    job.rejectionReason = req.body.reason || "";
    await job.save();

    res.json({ message: "Job rejected", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
