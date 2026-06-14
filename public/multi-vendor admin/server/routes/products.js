const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getSellerProducts, getFeaturedProducts,
} = require("../controllers/productController");

router.get("/",          getProducts);
router.get("/featured",  getFeaturedProducts);
router.get("/seller/my-products", protect, authorize("seller"), getSellerProducts);
router.get("/:id",       getProduct);
router.post("/",         protect, authorize("seller", "admin"), createProduct);
router.put("/:id",       protect, authorize("seller", "admin"), updateProduct);
router.delete("/:id",    protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
