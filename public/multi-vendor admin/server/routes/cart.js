const router  = require("express").Router();
const { protect } = require("../middleware/auth");
const Cart    = require("../models/Cart");
const Product = require("../models/Product");

// @GET /api/v1/cart
router.get("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name images price stock");
  res.json({ success: true, cart: cart || { items: [], discount: 0 } });
});

// @POST /api/v1/cart/add
router.post("/add", protect, async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return res.status(404).json({ success: false, message: "Product not found." });
  if (product.stock < quantity)      return res.status(400).json({ success: false, message: "Insufficient stock." });

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

  const idx = cart.items.findIndex((i) => i.product.toString() === productId);
  if (idx > -1) {
    cart.items[idx].quantity = Math.min(cart.items[idx].quantity + quantity, product.stock);
  } else {
    cart.items.push({
      product: product._id, store: product.store,
      name: product.name, image: product.images[0]?.url || "",
      price: product.isFlashSale ? product.flashSalePrice : product.price,
      quantity, variant,
    });
  }
  await cart.save();
  res.json({ success: true, cart });
});

// @PUT /api/v1/cart/:itemId
router.put("/:itemId", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Item not in cart." });
  item.quantity = req.body.quantity;
  if (item.quantity < 1) cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

// @DELETE /api/v1/cart/:itemId
router.delete("/:itemId", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, cart });
});

// @DELETE /api/v1/cart
router.delete("/", protect, async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.json({ success: true, message: "Cart cleared." });
});

module.exports = router;
