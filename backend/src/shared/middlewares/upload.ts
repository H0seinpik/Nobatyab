import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../../config/env.js";
import type { AuthRequest } from "./auth.js";

const AVATAR_DIR = path.join(env.upload.dir, "avatars");

if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthRequest).user?.sub ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${userId}-${Date.now()}${ext}`);
  },
});

function fileFilter(
  _req: AuthRequest,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    return;
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxAvatarSizeBytes },
});

export function getAvatarDir() {
  return AVATAR_DIR;
}
