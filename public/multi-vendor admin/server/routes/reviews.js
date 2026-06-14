const router  = require("express").Router();
const { protect } = require("../middleware/auth");
const Review   = require("../models/Review");
const Product  = require("../models/Product");

// @GET /api/v1/reviews/product/:productId
router.get("/product/:productId", async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, status: "approved" })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: reviews.length, reviews });
});

// @POST /api/v1/reviews/product/:productId
router.post("/product/:productId", protect, async (req, res) => {
  const { rating, title, body, images } = req.body;
  const exists = await Review.findOne({ product: req.params.productId, user: req.user.id });
  if (exists) return res.status(400).json({ success: false, message: "You have already reviewed this product." });

  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  const review = await Review.create({
    product: req.params.productId,
    store:   product.store,
    user:    req.user.id,
    rating, title, body, images,
  });

  await review.populate("user", "name avatar");
  res.status(201).json({ success: true, review });
});

// @DELETE /api/v1/reviews/:id
router.delete("/:id", protect, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  if (review.user.toString() !== req.user.id && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized." });
  await review.deleteOne();
  res.json({ success: true, message: "Review deleted." });
});

module.exports = router;
