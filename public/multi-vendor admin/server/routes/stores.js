const router = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const { getStores, getStoreBySlug, getMyStore, updateMyStore, getFeaturedStores } = require("../controllers/storeController");

router.get("/",          getStores);
router.get("/featured",  getFeaturedStores);
router.get("/me",        protect, authorize("seller"), getMyStore);
router.put("/me",        protect, authorize("seller"), updateMyStore);
router.get("/:slug",     getStoreBySlug);   // by smartStore slug

module.exports = router;
