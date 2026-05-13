// backend/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

/**
 * Crée un storage Multer dynamique selon le sous-dossier cible.
 * @param {string} folder - "logos" | "services"
 */
const createStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `./uploads/${folder}`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      // userId ou serviceId + timestamp pour unicité
      const id = req.params.id || req.user._id.toString();
      cb(null, `${id}-${Date.now()}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format non supporté. Utilisez JPG, PNG ou WEBP."), false);
  }
};

// Upload logo prestataire (champ : "logo")
export const uploadLogo = multer({
  storage: createStorage("logos"),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("logo");

// Upload image service (champ : "image")
export const uploadServiceImage = multer({
  storage: createStorage("services"),
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single("image");

/**
 * Wrapper pour transformer les erreurs Multer en erreurs Express standard.
 */
export const handleUploadError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (!err) return next();
    res.status(400);
    next(err);
  });
};