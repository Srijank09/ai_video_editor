import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOADS_DIR } from "../utils/paths";

const router = Router();

// 1. Configure HOW and WHERE Multer saves incoming chunks to disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    cb(null, `${uniqueId}${ext}`);
  },
});

// 2. Configure security rules: only video files, max 200MB
const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB in bytes
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video files are allowed"));
    }
  },
});

// 3. POST /api/videos/upload
// upload.single("video") looks for a form field named "video"
router.post("/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No video file received" });
    return;
  }

  const videoId = path.parse(req.file.filename).name; // the UUID without extension

  res.status(201).json({
    id: videoId,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
  });
});

export default router;