const router    = require("express").Router();
const { protect } = require("../middleware/auth");
const Question = require("../models/Question");
const Product  = require("../models/Product");
const Store    = require("../models/Store");

// @GET /api/v1/questions/product/:productId — public
router.get("/product/:productId", async (req, res) => {
  const questions = await Question.find({ product: req.params.productId, status: { $ne: "hidden" } })
    .populate("user", "name avatar")
    .populate("answers.user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: questions.length, questions });
});

// @POST /api/v1/questions/product/:productId — buyer asks question
router.post("/product/:productId", protect, async (req, res) => {
  const { body } = req.body;
  if (!body || body.trim().length < 3)
    return res.status(400).json({ success: false, message: "Question is too short." });

  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  const question = await Question.create({
    product: product._id,
    store:   product.store,
    user:    req.user.id,
    body,
  });
  await question.populate("user", "name avatar");
  res.status(201).json({ success: true, question });
});

// @POST /api/v1/questions/:id/answer — anyone (seller answers will be flagged isSeller)
router.post("/:id/answer", protect, async (req, res) => {
  const { body } = req.body;
  if (!body || body.trim().length < 1)
    return res.status(400).json({ success: false, message: "Answer cannot be empty." });

  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: "Question not found." });

  // Detect seller (owner of the store)
  const store = await Store.findById(question.store).select("owner");
  const isSeller = !!store && String(store.owner) === String(req.user.id);

  question.answers.push({ user: req.user.id, body, isSeller });
  if (question.status === "open") question.status = "answered";
  await question.save();
  await question.populate("answers.user", "name avatar");

  res.status(201).json({ success: true, question });
});

// @DELETE /api/v1/questions/:id — author or admin
router.delete("/:id", protect, async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: "Question not found." });
  if (String(question.user) !== String(req.user.id) && req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Not authorized." });
  await question.deleteOne();
  res.json({ success: true, message: "Question deleted." });
});

module.exports = router;
