const router    = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const FlashSale = require("../models/FlashSale");

router.get("/active", async (req, res) => {
  const now = new Date();
  const sales = await FlashSale.find({ isActive: true, startsAt: { $lte: now }, endsAt: { $gte: now } })
    .populate("products.product", "name images price ratings");
  res.json({ success: true, sales });
});

router.get("/", protect, authorize("admin"), async (req, res) => {
  const sales = await FlashSale.find().sort({ createdAt: -1 });
  res.json({ success: true, sales });
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  const sale = await FlashSale.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, sale });
});

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sale) return res.status(404).json({ success: false, message: "Flash sale not found." });
  res.json({ success: true, sale });
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  await FlashSale.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Flash sale deleted." });
});

module.exports = router;
