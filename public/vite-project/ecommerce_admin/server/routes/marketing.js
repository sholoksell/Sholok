const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');

// Coupon schema (shared with main server)
let Coupon;
try {
  Coupon = mongoose.model('Coupon');
} catch {
  const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'free_delivery'], required: true },
    discountValue: { type: Number, required: true },
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    usagePerCustomer: { type: Number, default: 1 },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });
  Coupon = mongoose.model('Coupon', couponSchema);
}

// Banner schema (shared)
let Banner;
try {
  Banner = mongoose.model('Banner');
} catch {
  const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    link: { type: String },
    placement: { type: String, enum: ['homepage_top', 'homepage_slider', 'sidebar', 'category', 'popup'], default: 'homepage_slider' },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  }, { timestamps: true });
  Banner = mongoose.model('Banner', bannerSchema);
}

// ── Coupon Routes ──

router.get('/coupons', authMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/coupons', authMiddleware, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.put('/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Banner Routes ──

router.get('/banners', authMiddleware, async (req, res) => {
  try {
    const banners = await Banner.find().sort({ priority: -1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/banners', authMiddleware, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/banners/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/banners/:id', authMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marketing stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ isActive: true, endDate: { $gte: new Date() } });
    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ isActive: true });
    const activeFlashSales = await FlashSale.countDocuments({ isActive: true, endDate: { $gte: new Date() } });

    const totalRedemptions = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: '$usedCount' } } },
    ]);

    res.json({
      totalCoupons,
      activeCoupons,
      totalBanners,
      activeBanners,
      totalRedemptions: totalRedemptions[0]?.total || 0,
      activeFlashSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Flash Sale / Discount Routes ──

let FlashSale;
try {
  FlashSale = mongoose.model('FlashSale');
} catch {
  const flashSaleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    minPurchaseAmount: { type: Number, default: 0 },
    badge: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });
  FlashSale = mongoose.model('FlashSale', flashSaleSchema);
}

router.get('/flash-sales', authMiddleware, async (req, res) => {
  try {
    const sales = await FlashSale.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/flash-sales', authMiddleware, async (req, res) => {
  try {
    const sale = new FlashSale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/flash-sales/:id', authMiddleware, async (req, res) => {
  try {
    const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(sale);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/flash-sales/:id', authMiddleware, async (req, res) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flash sale deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// ── Email Campaign (stored campaigns) ──
let EmailCampaign;
try {
  EmailCampaign = mongoose.model('EmailCampaign');
} catch {
  const emailCampaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, enum: ['all', 'active', 'inactive', 'new', 'returning'], default: 'all' },
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    sentCount: { type: Number, default: 0 },
  }, { timestamps: true });
  EmailCampaign = mongoose.model('EmailCampaign', emailCampaignSchema);
}

router.get('/email-campaigns', authMiddleware, async (req, res) => {
  try {
    const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

router.post('/email-campaigns', authMiddleware, async (req, res) => {
  try {
    const campaign = new EmailCampaign(req.body);
    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.put('/email-campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/email-campaigns/:id', authMiddleware, async (req, res) => {
  try {
    await EmailCampaign.findByIdAndDelete(req.params.id);
    res.json({ message: 'Campaign deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;
