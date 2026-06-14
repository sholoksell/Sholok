const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { auth } = require('../middleware/auth');

// Verify coupon
router.post('/verify', auth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Invalid or expired coupon' 
      });
    }

    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase of ৳${coupon.minPurchaseAmount} required`,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'Coupon usage limit reached',
      });
    }

    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
    });
  } catch (error) {
    console.error('Error verifying coupon:', error);
    res.status(500).json({ message: 'Error verifying coupon', error: error.message });
  }
});

// Get available coupons
router.get('/available', auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
      ],
    }).select('-usedCount -usageLimit');

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons', error: error.message });
  }
});

module.exports = router;
