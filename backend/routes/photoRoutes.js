// backend/routes/photoRoutes.js
import express from "express";
import {
  getArticlePhoto,
  checkPhotoExists,
} from "../controllers/photoControlleur.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();



export default router;