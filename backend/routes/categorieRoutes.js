// backend/routes/categorieRoutes.js
import express from "express";
import {
  getCategories,
  getCategorieById,
  getAllCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  toggleCategorie,
} from "../controllers/categorieControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────
router.get("/",    getCategories);      // toutes les catégories actives
router.get("/:id", getCategorieById);  // une catégorie par ID + ses métiers

// ── Admin only ───────────────────────────────────────
router.get("/admin/all",        protect, admin, getAllCategories);   // actives + inactives
router.post("/",                protect, admin, createCategorie);
router.put("/:id",              protect, admin, updateCategorie);
router.delete("/:id",           protect, admin, deleteCategorie);
router.patch("/:id/toggle",     protect, admin, toggleCategorie);

export default router;