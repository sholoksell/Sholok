const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// Export payments CSV
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const { status, method, from, to } = req.query;
    let query = {};
    if (status) query.status = status;
    if (method) query.method = method;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59');
    }
    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber total')
      .sort({ createdAt: -1 });
    const rows = [['Transaction ID', 'Order #', 'Amount', 'Method', 'Status', 'Date', 'Notes']];
    payments.forEach(p => {
      rows.push([
        p.transactionId || '',
        p.orderId?.orderNumber || '',
        p.amount,
        p.method || '',
        p.status,
        new Date(p.createdAt).toISOString().split('T')[0],
        p.notes || '',
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, method } = req.query;
    let query = {};

    if (status) query.status = status;
    if (method) query.method = method;

    const payments = await Payment.find(query)
      .populate('orderId', 'orderNumber total')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId', 'orderNumber total customerId')
      .populate({
        path: 'orderId',
        populate: { path: 'customerId', select: 'name email' }
      });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = { status };
    if (notes) update.notes = notes;
    const payment = await Payment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('orderId', 'orderNumber total');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Process refund
router.post('/:id/refund', authMiddleware, async (req, res) => {
  try {
    const { refundAmount, refundType, refundReason, refundTo } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const amount = refundAmount || payment.amount;
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundType = refundType || 'full';
    payment.refundReason = refundReason || '';
    payment.refundTo = refundTo || '';
    payment.refundedAt = new Date();
    payment.notes = (payment.notes ? payment.notes + '\n' : '') + `Refund: ${refundReason || ''}`;
    await payment.save();
    // Update linked order payment status
    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'refunded' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify payment (COD / bank transfer)
router.patch('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { verified, notes } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { verified, status: verified ? 'completed' : 'failed', notes: notes || '' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (verified && payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'paid' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete payment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
