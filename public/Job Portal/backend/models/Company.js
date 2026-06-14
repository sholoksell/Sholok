import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
    },
    logo: {
      type: String,
      default: "🏢",
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    size: {
      type: String,
      default: "",
    },
    founded: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    benefits: [{ type: String }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

companySchema.index({ name: 1 });

const Company = mongoose.model("Company", companySchema);
export default Company;
