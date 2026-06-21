require("dotenv").config();
require("express-async-errors");

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit    = require("express-rate-limit");
const connectDB    = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// No real-time transport in the serverless deployment — stub io so
// routes that call req.app.get('io').emit(...) don't crash.
app.set("io", { emit() {}, to() { return { emit() {} }; } });

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:8080",
      process.env.ADMIN_URL  || "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:8080",
      "https://sholok.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// Stripe webhook must use raw body — register BEFORE json parser
app.use("/api/v1/payments/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ── Rate Limit ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// Ensure DB connection is ready before handling any request (serverless cold starts)
app.use((req, res, next) => {
  connectDB().then(() => next()).catch((err) => {
    res.status(503).json({ success: false, message: "Database unavailable", error: err.message });
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth",                   require("./routes/auth"));
app.use("/api/v1/users",                  require("./routes/users"));
app.use("/api/v1/stores",                 require("./routes/stores"));
app.use("/api/v1/products/bulk-upload",   require("./routes/bulkUpload"));
app.use("/api/v1/products",               require("./routes/products"));
app.use("/api/v1/categories",             require("./routes/categories"));
app.use("/api/v1/orders",                 require("./routes/orders"));
app.use("/api/v1/reviews",                require("./routes/reviews"));
app.use("/api/v1/questions",              require("./routes/questions"));
app.use("/api/v1/coupons",                require("./routes/coupons"));
app.use("/api/v1/cart",                   require("./routes/cart"));
app.use("/api/v1/wishlist",               require("./routes/wishlist"));
app.use("/api/v1/analytics",              require("./routes/analytics"));
app.use("/api/v1/flash-sales",            require("./routes/flashSales"));
app.use("/api/v1/group-buys",             require("./routes/groupBuys"));
app.use("/api/v1/admin",                  require("./routes/admin"));
app.use("/api/v1/payments",               require("./routes/payments"));
app.use("/api/v1/notifications",          require("./routes/notifications"));
app.use("/api/v1/chat",                   require("./routes/chat"));
app.use("/api/v1/banners",                require("./routes/banners"));
app.use("/api/v1/settings",               require("./routes/settings"));
app.use("/api/v1/invoices",               require("./routes/invoices"));

// ── Health ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success:  true,
    message:  "🛍️ Sholok eCommerce API is running",
    version:  "2.0.0",
    database: "sholok_multivendor",
    docs:     "/api/v1",
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

module.exports = app;
