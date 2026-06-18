const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'bkash', 'nagad', 'rocket', 'sslcommerz', 'stripe'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  gateway: { type: String, default: '' },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  notes: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  proofImage: { type: String, default: '' },
  refundAmount: { type: Number, default: 0 },
  refundType: { type: String, enum: ['full', 'partial', ''], default: '' },
  refundReason: { type: String, default: '' },
  refundTo: { type: String, default: '' },
  refundedAt: { type: Date },
}, {
  timestamps: true,
  strict: false,
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
