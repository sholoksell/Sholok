const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { placeOrder, getMyOrders, getOrder, updateOrderStatus, getSellerOrders, getAllOrders } = require("../controllers/orderController");

router.post("/",              protect, authorize("customer"), placeOrder);
router.get("/my-orders",      protect, authorize("customer"), getMyOrders);
router.get("/seller",         protect, authorize("seller"),   getSellerOrders);
router.get("/",               protect, authorize("admin"),    getAllOrders);
router.get("/:id",            protect, getOrder);
router.put("/:id/status",     protect, authorize("seller", "admin"), updateOrderStatus);

module.exports = router;
