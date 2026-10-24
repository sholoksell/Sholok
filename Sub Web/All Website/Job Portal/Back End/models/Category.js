import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    label: {
      type: String,
      required: [true, "Category label is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ order: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
