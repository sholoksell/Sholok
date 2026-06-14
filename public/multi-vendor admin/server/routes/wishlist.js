const router  = require("express").Router();
const { protect } = require("../middleware/auth");
const User    = require("../models/User");
const Product = require("../models/Product");

// @GET /api/v1/wishlist
router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist", "name images price originalPrice ratings badge store");
  res.json({ success: true, wishlist: user.wishlist });
});

// @POST /api/v1/wishlist/:productId
router.post("/:productId", protect, async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  const user    = await User.findById(req.user.id);
  const inList  = user.wishlist.includes(req.params.productId);

  if (inList) {
    user.wishlist.pull(req.params.productId);
    await Product.findByIdAndUpdate(req.params.productId, { $inc: { wishlistCount: -1 } });
  } else {
    user.wishlist.push(req.params.productId);
    await Product.findByIdAndUpdate(req.params.productId, { $inc: { wishlistCount: 1 } });
  }
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, added: !inList, wishlist: user.wishlist });
});

module.exports = router;
