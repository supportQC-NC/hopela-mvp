// // backend/routes/userRoutes.js
// import express from "express";
// import {
//   authUser,
//   registerUser,
//   logoutUser,
//   getUserProfile,
//   updateUserProfile,
//   forgotPassword,
//   resetPassword,
//   getPrestatairesPositionsPublic,
//   getPrestatairesPositions,
//   updateLocation,
//   stopTracking,
//   updateRayon,
//   getSavedLocations,
//   addSavedLocation,
//   updateSavedLocation,
//   deleteSavedLocation,
//   setDefaultLocation,
//   createUser,
//   getUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
//   toggleUserActive,
// } from "../controllers/userControlleur.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ── Public ───────────────────────────────────────────────────────────────────
// router.post("/login",                        authUser);
// router.post("/register",                     registerUser);
// router.post("/forgot-password",              forgotPassword);
// router.put("/reset-password/:token",         resetPassword);
// router.get("/prestataires/positions/public", getPrestatairesPositionsPublic);

// // ── Privé (tous rôles connectés) ─────────────────────────────────────────────
// router.post("/logout",  protect, logoutUser);
// router.get("/profile",  protect, getUserProfile);
// router.put("/profile",  protect, updateUserProfile);

// // Géolocalisation temps réel (prestataires)
// router.get("/prestataires/positions", protect, getPrestatairesPositions);
// router.put("/location",               protect, updateLocation);
// router.put("/location/stop",          protect, stopTracking);

// // Rayon de recherche
// router.put("/rayon", protect, updateRayon);

// // Adresses enregistrées (savedLocations) — CRUD complet
// router.get   ("/locations",                       protect, getSavedLocations);
// router.post  ("/locations",                       protect, addSavedLocation);
// router.put   ("/locations/:locationId",           protect, updateSavedLocation);
// router.delete("/locations/:locationId",           protect, deleteSavedLocation);
// router.patch ("/locations/:locationId/default",   protect, setDefaultLocation);

// // ── Admin uniquement ─────────────────────────────────────────────────────────
// router.post  ("/",                   protect, admin, createUser);
// router.get   ("/",                   protect, admin, getUsers);
// router.get   ("/:id",                protect, admin, getUserById);
// router.put   ("/:id",                protect, admin, updateUser);
// router.delete("/:id",                protect, admin, deleteUser);
// router.patch ("/:id/toggle-active",  protect, admin, toggleUserActive);

// export default router;

// backend/routes/userRoutes.js
import express from "express";
import {
  authUser, registerUser, logoutUser, getUserProfile, updateUserProfile,
  forgotPassword, resetPassword,
  getPrestatairesPositionsPublic, getPrestatairesPositions, updateLocation, stopTracking, updateRayon,
  getSavedLocations, addSavedLocation, updateSavedLocation, deleteSavedLocation, setDefaultLocation,
  validatePrestataire,
  createUser, getUsers, getUserById, updateUser, deleteUser, toggleUserActive,
} from "../controllers/userControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.post("/login",                        authUser);
router.post("/register",                     registerUser);
router.post("/forgot-password",              forgotPassword);
router.put ("/reset-password/:token",        resetPassword);
router.get ("/prestataires/positions/public", getPrestatairesPositionsPublic);

// ── Privé ────────────────────────────────────────────────────────────────────
router.post("/logout",  protect, logoutUser);
router.get ("/profile", protect, getUserProfile);
router.put ("/profile", protect, updateUserProfile);

router.get ("/prestataires/positions", protect, getPrestatairesPositions);
router.put ("/location",               protect, updateLocation);
router.put ("/location/stop",          protect, stopTracking);
router.put ("/rayon",                  protect, updateRayon);

router.get   ("/locations",                     protect, getSavedLocations);
router.post  ("/locations",                     protect, addSavedLocation);
router.put   ("/locations/:locationId",         protect, updateSavedLocation);
router.delete("/locations/:locationId",         protect, deleteSavedLocation);
router.patch ("/locations/:locationId/default", protect, setDefaultLocation);

// ── Admin ────────────────────────────────────────────────────────────────────
router.post  ("/",                   protect, admin, createUser);
router.get   ("/",                   protect, admin, getUsers);
router.get   ("/:id",                protect, admin, getUserById);
router.put   ("/:id",                protect, admin, updateUser);
router.delete("/:id",                protect, admin, deleteUser);
router.patch ("/:id/toggle-active",  protect, admin, toggleUserActive);
router.patch ("/:id/validate",       protect, admin, validatePrestataire);

export default router;