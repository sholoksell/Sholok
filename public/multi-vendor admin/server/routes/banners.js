const router = require("express").Router();
const Banner = require("../models/Banner");
const { protect, authorize } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

// GET /api/v1/banners  — public, only active
router.get("/", async (req, res) => {
  const { slot } = req.query;
  const now = new Date();
  const filter = {
    isActive: true,
    startsAt: { $lte: now },
    $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
  };
  if (slot) filter.slot = slot;
  const banners = await Banner.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, banners });
});

// Admin CRUD
const adminGuard = [protect, authorize("admin")];

router.get("/admin/all", ...adminGuard, async (req, res) => {
  const banners = await Banner.find().sort({ slot: 1, order: 1 });
  res.json({ success: true, banners });
});

router.post("/", ...adminGuard, validate(schemas.banner), async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, banner });
});

router.put("/:id", ...adminGuard, validate(schemas.banner), async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, banner });
});

router.delete("/:id", ...adminGuard, async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
