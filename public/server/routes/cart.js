const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ customerId: req.customerId })
      .populate('items.productId', 'name slug thumbnail regularPrice salePrice stock status');

    if (!cart) {
      cart = new Cart({ customerId: req.customerId, items: [] });
      await cart.save();
    }

    // Filter out inactive or out of stock products
    cart.items = cart.items.filter(item => 
      item.productId && 
      item.productId.status === 'active' && 
      item.productId.stock > 0
    );

    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// Add to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;

    const product = await Product.findById(productId);

    if (!product || product.status !== 'active') {
      return res.status(404).json({ message: 'Product not available' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ customerId: req.customerId });

    if (!cart) {
      cart = new Cart({ customerId: req.customerId, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.variantId === variantId
    );

    const price = product.salePrice || product.regularPrice;

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      // Add new item
      cart.items.push({
        productId,
        variantId,
        quantity,
        price,
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'name slug thumbnail regularPrice salePrice stock status');

    res.json({ message: 'Item added to cart', cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
});

// Update cart item
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ customerId: req.customerId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      item.remove();
    } else {
      // Check stock
      const product = await Product.findById(item.productId);
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.productId', 'name slug thumbnail regularPrice salePrice stock status');

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// Remove from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.customerId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.id(req.params.itemId).remove();
    await cart.save();
    await cart.populate('items.productId', 'name slug thumbnail regularPrice salePrice stock status');

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerId: req.customerId });

    if (cart) {
      cart.items = [];
      cart.appliedCoupon = null;
      cart.discount = 0;
      await cart.save();
    }

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
});

// Apply coupon
router.post('/apply-coupon', auth, async (req, res) => {
  try {
    const { couponCode } = req.body;
    const Coupon = require('../models/Coupon');

    const cart = await Cart.findOne({ customerId: req.customerId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    if (cart.subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase amount of ${coupon.minPurchaseAmount} required` 
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    let discount = 0;

    if (coupon.discountType === 'percentage') {
      discount = (cart.subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'free_delivery') {
      discount = cart.deliveryCharge;
    }

    cart.appliedCoupon = coupon._id;
    cart.discount = discount;
    await cart.save();

    res.json({ message: 'Coupon applied successfully', cart, discount });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
});

module.exports = router;
