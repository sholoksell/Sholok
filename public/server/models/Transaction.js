const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    required: true,
    // income: salary, freelance, business, investment, other
    // expense: food, transport, bills, rent, health, education, shopping, entertainment, other
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    default: '',
    // For freelance: fiverr, upwork, local, other
  },
}, {
  timestamps: true,
});

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
