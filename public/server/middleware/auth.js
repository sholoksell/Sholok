const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sholok_customer_secret_key_2024');
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({ message: 'Customer not found' });
    }

    if (customer.status === 'blocked') {
      return res.status(403).json({ message: 'Account has been blocked' });
    }

    req.customer = customer;
    req.customerId = customer._id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sholok_customer_secret_key_2024');
      const customer = await Customer.findById(decoded.id).select('-password');
      
      if (customer && customer.status !== 'blocked') {
        req.customer = customer;
        req.customerId = customer._id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = { auth, optionalAuth };
