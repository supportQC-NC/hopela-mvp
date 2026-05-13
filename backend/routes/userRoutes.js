// backend/routes/userRoutes.js
import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getPrestatairesPositionsPublic,
  getPrestatairesPositions,
  updateLocation,
  stopTracking,
  updateRayon,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
} from "../controllers/userControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────
router.post("/login",                  authUser);
router.post("/register",               registerUser);
router.post("/forgot-password",        forgotPassword);
router.put("/reset-password/:token",   resetPassword);
// Carte publique — landing (sans auth)
router.get("/prestataires/positions/public", getPrestatairesPositionsPublic);

// ── Privé (tous rôles connectés) ─────────────────────
router.post("/logout",        protect, logoutUser);
router.get("/profile",        protect, getUserProfile);
router.put("/profile",        protect, updateUserProfile);

// Géolocalisation — tous rôles (filtrée par rayon)
router.get("/prestataires/positions", protect, getPrestatairesPositions);
router.put("/location",               protect, updateLocation);
router.put("/location/stop",          protect, stopTracking);
router.put("/rayon",                  protect, updateRayon);

// ── Admin only ───────────────────────────────────────
router.post("/",                    protect, admin, createUser);
router.get("/",                     protect, admin, getUsers);
router.get("/:id",                  protect, admin, getUserById);
router.put("/:id",                  protect, admin, updateUser);
router.delete("/:id",               protect, admin, deleteUser);
router.patch("/:id/toggle-active",  protect, admin, toggleUserActive);

export default router;