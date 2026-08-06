const jwt = require('jsonwebtoken');
const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || 'sholok_customer_secret_key_2024';

module.exports = (req, res, next) => {
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
