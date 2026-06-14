const router  = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const Coupon  = require("../models/Coupon");

// @POST /api/v1/coupons/validate
router.post("/validate", protect, async (req, res) => {
  const { code, orderTotal } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon)                         return res.status(404).json({ success: false, message: "Coupon not found." });
  if (coupon.expiresAt < Date.now())   return res.status(400).json({ success: false, message: "Coupon has expired." });
  if (coupon.startsAt  > Date.now())   return res.status(400).json({ success: false, message: "Coupon is not active yet." });
  if (orderTotal < coupon.minOrderValue)
    return res.status(400).json({ success: false, message: `Minimum order value ৳${coupon.minOrderValue} required.` });

  const discount = coupon.type === "percentage"
    ? Math.min((orderTotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
    : coupon.value;

  res.json({ success: true, coupon, discount: Math.round(discount) });
});

// @GET /api/v1/coupons  (seller/admin)
router.get("/", protect, authorize("seller", "admin"), async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, coupons });
});

// @POST /api/v1/coupons  (seller/admin)
router.post("/", protect, authorize("seller", "admin"), async (req, res) => {
  const coupon = await Coupon.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, coupon });
});

// @PUT /api/v1/coupons/:id  (seller/admin)
router.put("/:id", protect, authorize("seller", "admin"), async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found." });
  res.json({ success: true, coupon });
});

// @DELETE /api/v1/coupons/:id  (seller/admin)
router.delete("/:id", protect, authorize("seller", "admin"), async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Coupon deleted." });
});

module.exports = router;
