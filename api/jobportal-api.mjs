import app from '../public/Job Portal/backend/app.js';

export default (req, res) => {
  req.url = req.url.replace(/^\/api\/jobportal-api/, '/api').replace(/^\/jobportal-api/, '/api');
  return app(req, res);
};
