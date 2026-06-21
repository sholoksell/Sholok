const app = require('../public/ecommerce_admin/server/app');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api\/admin-api/, '/api').replace(/^\/admin-api/, '/api');
  return app(req, res);
};
