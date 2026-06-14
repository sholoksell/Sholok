const router   = require("express").Router();
const Category = require("../models/Category");

router.get("/", async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json({ success: true, categories });
});

router.get("/:slug", async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ success: false, message: "Category not found." });
  res.json({ success: true, category });
});

module.exports = router;
