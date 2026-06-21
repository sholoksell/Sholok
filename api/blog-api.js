const app = require('../public/Blog/backend/app');

module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api\/blog-api/, '/api').replace(/^\/blog-api/, '/api');
  return app(req, res);
};
