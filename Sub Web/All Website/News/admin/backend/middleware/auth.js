const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'sholok_news_jwt_2024';

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  const token = header.replace('Bearer ', '');
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
