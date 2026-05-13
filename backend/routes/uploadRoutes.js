// backend/routes/uploadRoutes.js
import express from "express";
import {
  uploadLogo,
  deleteLogo,
  uploadServiceImage,
  deleteServiceImage,
} from "../controllers/uploadControlleur.js";
import {
  uploadLogo as multerLogo,
  uploadServiceImage as multerServiceImage,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Logo prestataire ─────────────────────────────────
router.post(
  "/logo",
  protect,
  handleUploadError(multerLogo),
  uploadLogo,
);
router.delete("/logo", protect, deleteLogo);

// ── Image service ────────────────────────────────────
router.post(
  "/service/:id",
  protect,
  handleUploadError(multerServiceImage),
  uploadServiceImage,
);
router.delete("/service/:id", protect, deleteServiceImage);

export default router;