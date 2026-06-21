const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist. Vercel's filesystem is read-only
// except /tmp, so fall back there instead of crashing on require().
const uploadsBase = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
const imagesDir = `${uploadsBase}/images`;
const videosDir = `${uploadsBase}/videos`;
const avatarsDir = `${uploadsBase}/avatars`;
[imagesDir, videosDir, avatarsDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn(`Could not create upload dir ${dir}:`, e.message);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else if (file.fieldname === 'avatar' || file.fieldname === 'coverImage') {
      cb(null, avatarsDir);
    } else {
      cb(null, imagesDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|webm/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (file.mimetype.startsWith('image/') && allowedImageTypes.test(ext)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedVideoTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI, WebM) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
