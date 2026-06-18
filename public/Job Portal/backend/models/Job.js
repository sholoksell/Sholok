import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 200,
    },
    titleEn: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    titleBn: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    companyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    companyLogo: {
      type: String,
      default: "🏢",
    },
    salary: {
      type: String,
      required: [true, "Salary is required"],
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["পূর্ণকালীন", "পার্টটাইম / ফ্রিল্যান্স", "চুক্তিভিত্তিক", "ইন্টার্নশিপ"],
    },
    category: {
      type: String,
      default: "অন্যান্য",
    },
    experience: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    descriptionEn: {
      type: String,
    },
    descriptionBn: {
      type: String,
    },
    skills: [{ type: String }],
    requirements: [{ type: String }],
    requirementsEn: [{ type: String }],
    requirementsBn: [{ type: String }],
    benefits: [{ type: String }],
    vacancies: {
      type: Number,
      default: 1,
    },
    deadline: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "review", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ createdBy: 1, status: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
