const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../public/server/config/db');
connectDB();

const app = require('../public/server/app');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api\/customer-api/, '/api').replace(/^\/customer-api/, '/api');
  return app(req, res);
};
