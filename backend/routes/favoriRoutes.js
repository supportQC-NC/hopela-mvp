// backend/routes/favoriRoutes.js
import express    from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMesFavoris,
  addFavori,
  removeFavori,
  checkFavori,
  countFavoris,
} from "../controllers/favoriControlleur.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/count/:prestataireId", countFavoris);

// ── Connecté ──────────────────────────────────────────────────────────────────
router.get   ("/",                        protect, getMesFavoris);
router.get   ("/check/:prestataireId",    protect, checkFavori);
router.post  ("/:prestataireId",          protect, addFavori);
router.delete("/:prestataireId",          protect, removeFavori);

export default router;