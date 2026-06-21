import app from '../public/Video Controls Admin/server/app.js';

export default (req, res) => {
  req.url = req.url.replace(/^\/api\/video-api/, '/api').replace(/^\/tv-api/, '/api');
  return app(req, res);
};
