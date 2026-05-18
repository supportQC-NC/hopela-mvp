// backend/routes/demandeRoutes.js
import express from "express";
import {
  creerDemande,
  getMesDemandes,
  annulerDemande,
  cloturerDemande,
  getDemandesPrestataire,
  getDemandesCarte,
  getAllDemandesAdmin,
  supprimerDemandeAdmin,
  modifierStatutAdmin,
} from "../controllers/demandeControlleur.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Client ────────────────────────────────────────────────────────────────────
// Créer une demande
router.post("/",                      protect, creerDemande);
// Lister ses propres demandes
router.get ("/mes-demandes", protect,         getMesDemandes);
// Annuler une de ses demandes (statut → annulee)
router.patch("/:id/annuler",          protect, annulerDemande);
// Clôturer une de ses demandes (statut → cloturee)
router.patch("/:id/cloturer",         protect, cloturerDemande);

// ── Prestataire ───────────────────────────────────────────────────────────────
// Liste des demandes actives pour son/ses métier(s), triée par distance
router.get ("/prestataire/liste",     protect, getDemandesPrestataire);
// Marqueurs carte — données légères pour affichage Mapbox
router.get ("/prestataire/carte",     protect, getDemandesCarte);

// ── Admin ─────────────────────────────────────────────────────────────────────
// Toutes les demandes avec filtres et pagination
router.get   ("/admin",               protect, admin, getAllDemandesAdmin);
// Modifier le statut d'une demande
router.patch ("/admin/:id/statut",    protect, admin, modifierStatutAdmin);
// Supprimer une demande
router.delete("/admin/:id",           protect, admin, supprimerDemandeAdmin);

export default router;