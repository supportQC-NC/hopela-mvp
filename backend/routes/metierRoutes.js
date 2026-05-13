// backend/routes/metierRoutes.js
import express from "express";
import {
  getMetiers,
  getMetierById,
  getAllMetiers,
  createMetier,
  updateMetier,
  deleteMetier,
  toggleMetier,
} from "../controllers/metierControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────
router.get("/",    getMetiers);       // tous les métiers actifs
router.get("/:id", getMetierById);   // un métier par ID

// ── Admin only ───────────────────────────────────────
router.get("/admin/all",          protect, admin, getAllMetiers);   // actifs + inactifs
router.post("/",                  protect, admin, createMetier);
router.put("/:id",                protect, admin, updateMetier);
router.delete("/:id",             protect, admin, deleteMetier);
router.patch("/:id/toggle",       protect, admin, toggleMetier);

export default router;