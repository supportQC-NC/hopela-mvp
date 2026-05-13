// backend/routes/serviceRoutes.js
import express from "express";
import {
  getMesServices,
  createService,
  updateService,
  toggleService,
  deleteService,
  getServicesPrestataire,
} from "../controllers/serviceControlleur.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────
// Services actifs d'un prestataire (vue publique)
router.get("/prestataire/:id", getServicesPrestataire);

// ── Privé/Prestataire ────────────────────────────────
router.get("/",          protect, getMesServices);
router.post("/",         protect, createService);
router.put("/:id",       protect, updateService);
router.patch("/:id/toggle", protect, toggleService);
router.delete("/:id",    protect, deleteService);

export default router;