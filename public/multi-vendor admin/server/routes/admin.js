const router  = require("express").Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboard, getUsers, updateUser, deleteUser,
  getStores, updateStore,
  getProducts, deleteProduct,
  getReviews, deleteReview,
  getCategories, createCategory, updateCategory, deleteCategory,
  getAnalytics,
} = require("../controllers/adminController");

const admin = [protect, authorize("admin")];

router.get("/dashboard",          ...admin, getDashboard);
router.get("/analytics",          ...admin, getAnalytics);

router.get("/users",              ...admin, getUsers);
router.put("/users/:id",          ...admin, updateUser);
router.delete("/users/:id",       ...admin, deleteUser);

router.get("/stores",             ...admin, getStores);
router.put("/stores/:id",         ...admin, updateStore);

router.get("/products",           ...admin, getProducts);
router.delete("/products/:id",    ...admin, deleteProduct);

router.get("/reviews",            ...admin, getReviews);
router.delete("/reviews/:id",     ...admin, deleteReview);

router.get("/categories",         ...admin, getCategories);
router.post("/categories",        ...admin, createCategory);
router.put("/categories/:id",     ...admin, updateCategory);
router.delete("/categories/:id",  ...admin, deleteCategory);

module.exports = router;
