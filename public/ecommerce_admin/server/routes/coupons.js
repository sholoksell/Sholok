const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Reuses the Coupon model registered by routes/marketing.js (admin CRUD).
// Falls back to registering it here in case this module loads first.
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

// GET /coupons/available — public list of currently usable coupons
router.get('/available', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('code description discountType discountValue minPurchaseAmount maxDiscountAmount endDate')
      .sort({ createdAt: -1 });

    const available = coupons.filter((c) => !c.usageLimit || c.usedCount < c.usageLimit);
    res.json({ coupons: available });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /coupons/verify — { code, cartTotal } -> { valid, discount, message }
router.post('/verify', async (req, res) => {
  try {
    const { code, cartTotal = 0 } = req.body;
    if (!code) return res.status(400).json({ valid: false, message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    const now = new Date();

    if (!coupon || coupon.startDate > now || coupon.endDate < now) {
      return res.json({ valid: false, message: 'Invalid or expired coupon' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ valid: false, message: 'Coupon usage limit reached' });
    }
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.json({ valid: false, message: `Minimum purchase of ${coupon.minPurchaseAmount} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, cartTotal);

    res.json({ valid: true, discount, discountType: coupon.discountType, message: 'Coupon applied' });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
});

module.exports = router;
