// backend/routes/promotionRoutes.js
import express  from "express";
import multer   from "multer";
import path     from "path";
import fs       from "fs";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getPromotionsActives,
  getPromotionsPubliques,
  getMesPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addImagePromotion,
  deleteImagePromotion,
  getAllPromotionsAdmin,
} from "../controllers/promotionControlleur.js";

const router = express.Router();

// ── Storage images promotions ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/promotions";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `promo-${req.params.id}-${Date.now()}${ext}`);
  },
});

const uploadPromoImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format non supporté"), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

const handleUpload = (req, res, next) => {
  uploadPromoImage(req, res, (err) => {
    if (err) { res.status(400); return next(err); }
    next();
  });
};

// ── Routes publiques ──────────────────────────────────────────────────────────
router.get("/actives",          getPromotionsActives);
router.get("/prestataire/:id",  getPromotionsPubliques);

// ── Routes admin ───────────────────────────────────────────────────────────────
router.get("/admin/all", protect, admin, getAllPromotionsAdmin);

// ── Routes prestataire connecté ───────────────────────────────────────────────
router.get   ("/mes-promotions",             protect, getMesPromotions);
router.post  ("/",                           protect, createPromotion);
router.put   ("/:id",                        protect, updatePromotion);
router.delete("/:id",                        protect, deletePromotion);
router.post  ("/:id/images",                 protect, handleUpload, addImagePromotion);
router.delete("/:id/images/:imageIndex",     protect, deleteImagePromotion);

export default router;