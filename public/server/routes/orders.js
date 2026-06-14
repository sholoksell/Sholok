const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      notes,
    } = req.body;

    // Validate cart items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals and verify stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || product.status !== 'active') {
        return res.status(400).json({ 
          message: `Product ${item.productName || ''} is not available` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}` 
        });
      }

      const price = product.salePrice || product.regularPrice;
      const total = price * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.thumbnail,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price,
        total,
      });

      subtotal += total;
    }

    // Calculate delivery charge (simplified - should be based on delivery area)
    const deliveryCharge = subtotal >= 1000 ? 0 : 50;

    // Get discount from cart if any
    const cart = await Cart.findOne({ customerId: req.customerId });
    const discount = cart?.discount || 0;
    const couponCode = cart?.appliedCoupon ? 
      (await require('../models/Coupon').findById(cart.appliedCoupon))?.code : null;

    const total = subtotal + deliveryCharge - discount;

    // Create order
    const order = new Order({
      customerId: req.customerId,
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount,
      couponCode,
      total,
      paymentMethod,
      deliveryAddress,
      deliverySlot,
      notes,
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      statusHistory: [{
        status: 'pending',
        updatedAt: new Date(),
        note: 'Order placed',
      }],
    });

    await order.save();

    // Update product stock and sold count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          stock: -item.quantity,
          soldCount: item.quantity,
        },
      });
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(req.customerId, {
      $inc: { 
        totalOrders: 1,
        totalSpent: total,
      },
    });

    // Clear cart
    if (cart) {
      cart.items = [];
      cart.appliedCoupon = null;
      cart.discount = 0;
      await cart.save();
    }

    // Increment coupon usage
    if (cart?.appliedCoupon) {
      await require('../models/Coupon').findByIdAndUpdate(cart.appliedCoupon, {
        $inc: { usedCount: 1 },
      });
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Get customer orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customerId: req.customerId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('items.productId', 'name slug thumbnail');

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    }).populate('items.productId', 'name slug thumbnail');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// Cancel order
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      note: reason,
    });

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          stock: item.quantity,
          soldCount: -item.quantity,
        },
      });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
});

// Reorder
router.post('/:id/reorder', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customerId,
    }).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let cart = await Cart.findOne({ customerId: req.customerId });

    if (!cart) {
      cart = new Cart({ customerId: req.customerId, items: [] });
    }

    // Add items from order to cart
    for (const item of order.items) {
      if (item.productId && item.productId.status === 'active' && item.productId.stock > 0) {
        const price = item.productId.salePrice || item.productId.regularPrice;
        
        cart.items.push({
          productId: item.productId._id,
          variantId: item.variantId,
          quantity: Math.min(item.quantity, item.productId.stock),
          price,
        });
      }
    }

    await cart.save();

    res.json({ message: 'Items added to cart', cart });
  } catch (error) {
    console.error('Error reordering:', error);
    res.status(500).json({ message: 'Error reordering', error: error.message });
  }
});

module.exports = router;
