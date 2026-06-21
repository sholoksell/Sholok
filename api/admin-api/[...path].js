const app = require('../../public/ecommerce_admin/server/app');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/admin-api/, '/api');
  return app(req, res);
};
