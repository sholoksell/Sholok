import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
      unique: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

locationSchema.index({ order: 1 });

const Location = mongoose.model("Location", locationSchema);
export default Location;
