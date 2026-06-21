import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Vercel's filesystem is read-only except /tmp, so fall back there
// instead of crashing on import.
const uploadDir = process.env.VERCEL ? "/tmp/uploads" : (process.env.UPLOAD_DIR || "./uploads");
const videoDir = path.join(uploadDir, "videos");
const thumbDir = path.join(uploadDir, "thumbnails");

// Ensure directories exist
[videoDir, thumbDir].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn(`Could not create upload dir ${dir}:`, e.message);
  }
});

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) cb(null, videoDir);
    else if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) cb(null, thumbDir);
    else cb(new Error("Invalid file type"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowed.join(", ")}`), false);
};

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 * 1024 }, // 4GB
});
