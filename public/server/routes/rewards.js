const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const customerAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sholok_customer_secret_key_2024');
    req.customer = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get my reward points
router.get('/', customerAuthMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .select('rewardPoints pointsHistory group groupDiscount');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({
      points: customer.rewardPoints || 0,
      history: customer.pointsHistory || [],
      group: customer.group || 'regular',
      groupDiscount: customer.groupDiscount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
