const router = require("express").Router();
const Setting = require("../models/Setting");
const { protect, authorize } = require("../middleware/auth");

// GET /api/v1/settings — public site config (safe fields only)
router.get("/", async (req, res) => {
  const s = await Setting.get();
  res.json({
    success: true,
    settings: {
      siteName: s.siteName, siteTagline: s.siteTagline,
      currency: s.currency, currencySymbol: s.currencySymbol,
      freeShippingThreshold: s.freeShippingThreshold, flatShippingRate: s.flatShippingRate,
      enableStripe: s.enableStripe, enableSslcommerz: s.enableSslcommerz, enableCod: s.enableCod,
      facebook: s.facebook, twitter: s.twitter, instagram: s.instagram, youtube: s.youtube,
      maintenanceMode: s.maintenanceMode,
      supportEmail: s.supportEmail, supportPhone: s.supportPhone,
    },
  });
});

// GET /api/v1/settings/admin — full admin view
router.get("/admin", protect, authorize("admin"), async (req, res) => {
  const s = await Setting.get();
  res.json({ success: true, settings: s });
});

// PUT /api/v1/settings — update (admin only)
router.put("/", protect, authorize("admin"), async (req, res) => {
  const s = await Setting.get();
  const allowed = [
    "siteName","siteTagline","supportEmail","supportPhone",
    "commissionPercent","freeShippingThreshold","flatShippingRate",
    "enableStripe","enableSslcommerz","enableCod",
    "currency","currencySymbol",
    "facebook","twitter","instagram","youtube",
    "maintenanceMode",
  ];
  for (const k of allowed) if (k in req.body) s[k] = req.body[k];
  await s.save();
  res.json({ success: true, settings: s });
});

module.exports = router;
