// backend/routes/prestairePublicRoutes.js
import express from "express";
import { getPrestairePublic } from "../controllers/prestairePublicControlleur.js";

const router = express.Router();

// GET /api/prestataires/:id/public
router.get("/:id/public", getPrestairePublic);

export default router;