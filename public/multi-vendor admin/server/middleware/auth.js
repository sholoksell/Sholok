const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

// Protect route — must be logged in
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.cookies?.token) {
    token = req.cookies.token; // legacy
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: "Account not found or deactivated." });
    }
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

// Role-based access
exports.authorize = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this route.`,
      });
    }
    next();
  };
