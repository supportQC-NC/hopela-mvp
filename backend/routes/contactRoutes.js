// backend/routes/contactRoutes.js
import express from "express";
import {
  createContact, getContacts, getContactById,
  updateStatut, replyContact, deleteContact,
} from "../controllers/contactControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post  ("/send",        createContact);              // public — envoyer un message
router.get   ("/",            protect, admin, getContacts);
router.get   ("/:id",         protect, admin, getContactById);
router.patch ("/:id/statut",  protect, admin, updateStatut);
router.post  ("/:id/reply",   protect, admin, replyContact);
router.delete("/:id",         protect, admin, deleteContact);

export default router;