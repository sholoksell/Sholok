const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || 'sholok_customer_secret_key_2024';

const customerAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, CUSTOMER_JWT_SECRET);
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

async function buildCartResponse(customer) {
  const productIds = customer.cart.map((item) => item.productId);
  // .lean() avoids Mongoose casting raw legacy fields (plain string name,
  // flat "price") into this schema's {name:{en,bn}, regularPrice} shape,
  // which silently blanks them out — this collection has product docs from
  // an older/shared schema mixed in with newer ones.
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productsById = new Map(products.map((p) => [String(p._id), p]));

  const items = customer.cart
    .map((item) => ({ item, product: productsById.get(String(item.productId)) }))
    .filter(({ product }) => product)
    .map(({ item, product }) => {
      // Real price may live in either the legacy flat "price" field or the
      // newer "regularPrice" field, depending on which system created the doc.
      const basePrice = (typeof product.price === 'number' && product.price > 0)
        ? product.price
        : (product.regularPrice ?? 0);
      const price = product.salePrice && product.salePrice > 0 ? product.salePrice : basePrice;
      const name = typeof product.name === 'string' ? product.name : (product.name?.en || product.name?.bn || '');
      return {
        _id: item._id,
        productId: product._id,
        variantId: item.variantId,
        quantity: item.quantity,
        price,
        product: {
          _id: product._id,
          name,
          slug: product.slug,
          thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
          stock: product.stock,
        },
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = customer.appliedCoupon?.discount || 0;
  const total = Math.max(subtotal - discount, 0);

  return {
    items,
    subtotal,
    discount,
    appliedCoupon: customer.appliedCoupon?.code || null,
    total,
  };
}

// GET /cart
router.get('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /cart/add
router.post('/add', customerAuthMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1, variantId = null } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const existing = customer.cart.find(
      (item) => item.productId.toString() === productId && item.variantId === variantId
    );
    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      customer.cart.push({ productId, quantity, variantId });
    }
    await customer.save();
    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /cart/update/:itemId
router.put('/update/:itemId', customerAuthMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ message: 'quantity must be at least 1' });

    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const item = customer.cart.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    item.quantity = quantity;
    await customer.save();
    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /cart/remove/:itemId
router.delete('/remove/:itemId', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.cart = customer.cart.filter((item) => item._id.toString() !== req.params.itemId);
    await customer.save();
    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /cart/clear
router.delete('/clear', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.cart = [];
    customer.appliedCoupon = { code: null, discount: 0 };
    await customer.save();
    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /cart/apply-coupon
router.post('/apply-coupon', customerAuthMiddleware, async (req, res) => {
  try {
    const { couponCode } = req.body;
    if (!couponCode) return res.status(400).json({ message: 'couponCode is required' });

    const mongoose = require('mongoose');
    let Coupon;
    try {
      Coupon = mongoose.model('Coupon');
    } catch {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    const now = new Date();
    if (!coupon || coupon.startDate > now || coupon.endDate < now) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const cartSummary = await buildCartResponse(customer);
    if (cartSummary.subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase of ${coupon.minPurchaseAmount} required` });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (cartSummary.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, cartSummary.subtotal);

    customer.appliedCoupon = { code: coupon.code, discount };
    await customer.save();

    res.json(await buildCartResponse(customer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
