const router = require("express").Router();
const auth   = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
});

router.post("/register",                authLimiter, validate(schemas.register),       auth.register);
router.post("/login",                   authLimiter, validate(schemas.login),          auth.login);
router.post("/refresh",                                                                auth.refresh);
router.post("/logout",                  auth.logout);
router.post("/logout-all",              protect,    auth.logoutAll);
router.get ("/me",                      protect,    auth.getMe);
router.put ("/update-profile",          protect,    auth.updateProfile);
router.put ("/change-password",         protect,    validate(schemas.changePassword), auth.changePassword);

router.post("/forgot-password",         authLimiter, validate(schemas.forgotPassword), auth.forgotPassword);
router.post("/reset-password/:token",   authLimiter, validate(schemas.resetPassword),  auth.resetPassword);
router.get ("/verify-email/:token",                                                    auth.verifyEmail);
router.post("/resend-verification",     protect,    auth.resendVerification);

module.exports = router;
