const router   = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const GroupBuy = require("../models/GroupBuy");

router.get("/active", async (req, res) => {
  const now = new Date();
  const deals = await GroupBuy.find({ status: "open", endsAt: { $gte: now } })
    .populate("product", "name images price")
    .sort({ endsAt: 1 });
  res.json({ success: true, deals });
});

router.post("/", protect, authorize("admin", "seller"), async (req, res) => {
  const deal = await GroupBuy.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, deal });
});

router.post("/:id/join", protect, async (req, res) => {
  const deal = await GroupBuy.findById(req.params.id);
  if (!deal || deal.status !== "open") return res.status(400).json({ success: false, message: "Deal not available." });
  if (deal.currentMembers.includes(req.user.id)) return res.status(400).json({ success: false, message: "Already joined." });

  deal.currentMembers.push(req.user.id);
  if (deal.currentMembers.length >= deal.minMembers) deal.status = "success";
  await deal.save();
  res.json({ success: true, deal, joined: true, membersCount: deal.currentMembers.length });
});

// @POST /api/v1/group-buys/:id/leave — leave a group buy before deadline
router.post("/:id/leave", protect, async (req, res) => {
  const deal = await GroupBuy.findById(req.params.id);
  if (!deal) return res.status(404).json({ success: false, message: "Deal not found." });
  if (deal.status !== "open") return res.status(400).json({ success: false, message: "Deal already closed." });

  const before = deal.currentMembers.length;
  deal.currentMembers = deal.currentMembers.filter((u) => String(u) !== String(req.user.id));
  if (deal.currentMembers.length === before)
    return res.status(400).json({ success: false, message: "You haven't joined this deal." });

  await deal.save();
  res.json({ success: true, deal, left: true, membersCount: deal.currentMembers.length });
});

// @GET /api/v1/group-buys/:id — public detail
router.get("/:id", async (req, res) => {
  const deal = await GroupBuy.findById(req.params.id).populate("product", "name images price");
  if (!deal) return res.status(404).json({ success: false, message: "Deal not found." });
  res.json({ success: true, deal });
});

module.exports = router;
