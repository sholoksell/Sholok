const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    icon:        { type: String, default: "Tag" },
    image:       { type: String, default: "" },
    color:       { type: String, default: "from-violet-500 to-fuchsia-500" },
    description: { type: String, default: "" },
    parent:      { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    productCount:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
