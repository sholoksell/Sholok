const crypto = require("crypto");
const User   = require("../models/User");
const Store  = require("../models/Store");
const Notification = require("../models/Notification");
const tokens = require("../utils/tokens");
const { sendEmail, templates } = require("../utils/email");

// ── Helper: issue token pair + set cookies ────────────────────
async function sendAuthResponse(user, req, res, statusCode = 200) {
  const { accessToken, refreshToken } = await tokens.issueTokens(user, req);

  const cookieBase = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("accessToken",  accessToken,  { ...cookieBase, maxAge: 15 * 60 * 1000 })
    .cookie("refreshToken", refreshToken, { ...cookieBase, maxAge: tokens.REFRESH_MS, path: "/api/v1/auth" })
    .cookie("token",        accessToken,  { ...cookieBase, maxAge: 15 * 60 * 1000 }) // legacy
    .json({
      success: true,
      accessToken,
      refreshToken,
      token: accessToken, // backward-compat
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        avatar: user.avatar, isVerified: user.isVerified, isActive: user.isActive,
      },
    });
}

// @POST /api/v1/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role, phone, storeName } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ success: false, message: "Email already registered." });

  const user = await User.create({ name, email, password, role: role || "customer", phone });

  // Email verification token
  const verifyToken = crypto.randomBytes(24).toString("hex");
  user.emailVerifyToken  = crypto.createHash("sha256").update(verifyToken).digest("hex");
  user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Auto-create SmartStore for sellers
  if (user.role === "seller") {
    const baseName = (storeName || `${name}'s Store`).trim();
    const slug = baseName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
    await Store.create({ owner: user._id, smartStore: slug, name: baseName });
  }

  const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/verify-email?token=${verifyToken}&id=${user._id}`;
  sendEmail({
    to: email,
    subject: "Verify your email · Sholok",
    html: templates.verifyEmail(name, verifyUrl),
  }).catch((e) => console.warn("Email send failed:", e.message));

  await Notification.create({
    user: user._id, type: "system",
    title: `Welcome to Sholok, ${name}! 🎉`,
    message: user.role === "seller" ? "Your Smart Store has been created. Start adding products!" : "Browse thousands of products from top sellers across Bangladesh.",
  });

  await sendAuthResponse(user, req, res, 201);
};

// @POST /api/v1/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please provide email and password." });

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: "Invalid credentials." });

  if (!user.isActive)
    return res.status(401).json({ success: false, message: "Account deactivated. Contact support." });

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  await sendAuthResponse(user, req, res, 200);
};

// @POST /api/v1/auth/refresh — rotate refresh token
exports.refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token missing." });

  try {
    const { decoded, doc } = await tokens.verifyRefresh(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      doc.revoked = true; await doc.save();
      return res.status(401).json({ success: false, message: "User invalid." });
    }
    doc.revoked = true;
    await doc.save();
    await sendAuthResponse(user, req, res, 200);
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
  }
};

// @GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  let store = null;
  if (user.role === "seller") {
    store = await Store.findOne({ owner: user._id }).select("smartStore name logo stats");
  }
  res.json({ success: true, user, store });
};

// @PUT /api/v1/auth/update-profile
exports.updateProfile = async (req, res) => {
  const { name, phone, address, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, address, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, user });
};

// @PUT /api/v1/auth/change-password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ success: false, message: "Current password is incorrect." });
  user.password = newPassword;
  await user.save();
  await tokens.revokeAllForUser(user._id);
  await sendAuthResponse(user, req, res, 200);
};

// @POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ success: true, message: "If an account exists, a reset email was sent." });

  const resetToken = crypto.randomBytes(24).toString("hex");
  user.resetPasswordToken  = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/reset-password?token=${resetToken}&id=${user._id}`;
  await sendEmail({
    to: email, subject: "Reset your password · Sholok",
    html: templates.resetPassword(user.name, resetUrl),
  }).catch(() => {});

  res.json({ success: true, message: "If an account exists, a reset email was sent." });
};

// @POST /api/v1/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken:  hashed,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ success: false, message: "Invalid or expired reset token." });

  user.password = password;
  user.resetPasswordToken  = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  await tokens.revokeAllForUser(user._id);
  await sendAuthResponse(user, req, res, 200);
};

// @GET /api/v1/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerifyToken:  hashed,
    emailVerifyExpire: { $gt: Date.now() },
  });
  if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification token." });
  user.isVerified = true;
  user.emailVerifyToken  = undefined;
  user.emailVerifyExpire = undefined;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: "Email verified successfully." });
};

// @POST /api/v1/auth/resend-verification
exports.resendVerification = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.isVerified) return res.json({ success: true, message: "Email already verified." });
  const verifyToken = crypto.randomBytes(24).toString("hex");
  user.emailVerifyToken  = crypto.createHash("sha256").update(verifyToken).digest("hex");
  user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const verifyUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}/verify-email?token=${verifyToken}&id=${user._id}`;
  await sendEmail({
    to: user.email, subject: "Verify your email · Sholok",
    html: templates.verifyEmail(user.name, verifyUrl),
  }).catch(() => {});
  res.json({ success: true, message: "Verification email resent." });
};

// @POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  if (refreshToken) await tokens.revokeRefresh(refreshToken).catch(() => {});
  res
    .cookie("accessToken",  "", { httpOnly: true, expires: new Date(0) })
    .cookie("refreshToken", "", { httpOnly: true, expires: new Date(0), path: "/api/v1/auth" })
    .cookie("token",        "", { httpOnly: true, expires: new Date(0) })
    .json({ success: true, message: "Logged out successfully." });
};

// @POST /api/v1/auth/logout-all
exports.logoutAll = async (req, res) => {
  await tokens.revokeAllForUser(req.user.id);
  res.json({ success: true, message: "All sessions revoked." });
};
