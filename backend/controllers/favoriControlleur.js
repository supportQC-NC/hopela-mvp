// backend/controllers/favoriControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Favori       from "../models/FavoriModel.js";
import User         from "../models/UserModel.js";

// =============================================
// CONNECTÉ — Gestion des favoris
// =============================================

// @desc    Mes favoris (liste complète des prestataires)
// @route   GET /api/favoris
// @access  Private
const getMesFavoris = asyncHandler(async (req, res) => {
  const favoris = await Favori.find({ user: req.user._id })
    .populate({
      path:     "prestataire",
      select:   "prenom nom avatar metiers telephoneContact emailContact location isTracked ridet",
      populate: { path: "metiers", select: "nom icone categorie", populate: { path: "categorie", select: "nom icone" } },
    })
    .sort({ createdAt: -1 });

  // On retourne uniquement les prestataires (pas l'objet favori complet)
  const prestataires = favoris.map((f) => ({
    favoriId:    f._id,
    prestataire: f.prestataire,
    createdAt:   f.createdAt,
  }));

  res.json(prestataires);
});

// @desc    Ajouter un prestataire en favori
// @route   POST /api/favoris/:prestataireId
// @access  Private
const addFavori = asyncHandler(async (req, res) => {
  const { prestataireId } = req.params;

  // Vérifie que le prestataire existe
  const prestataire = await User.findOne({ _id: prestataireId, role: "prestataire", isActive: true });
  if (!prestataire) { res.status(404); throw new Error("Prestataire introuvable"); }

  // Pas se mettre soi-même en favori
  if (req.user._id.toString() === prestataireId) {
    res.status(400); throw new Error("Vous ne pouvez pas vous ajouter à vos favoris");
  }

  // Upsert — évite les doublons proprement
  const favori = await Favori.findOneAndUpdate(
    { user: req.user._id, prestataire: prestataireId },
    { user: req.user._id, prestataire: prestataireId },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  res.status(201).json({ message: "Ajouté aux favoris", favoriId: favori._id });
});

// @desc    Retirer un prestataire des favoris
// @route   DELETE /api/favoris/:prestataireId
// @access  Private
const removeFavori = asyncHandler(async (req, res) => {
  const result = await Favori.findOneAndDelete({
    user:        req.user._id,
    prestataire: req.params.prestataireId,
  });

  if (!result) { res.status(404); throw new Error("Favori introuvable"); }

  res.json({ message: "Retiré des favoris", prestataireId: req.params.prestataireId });
});

// @desc    Vérifie si un prestataire est en favori (pour le bouton toggle)
// @route   GET /api/favoris/check/:prestataireId
// @access  Private
const checkFavori = asyncHandler(async (req, res) => {
  const exists = await Favori.exists({
    user:        req.user._id,
    prestataire: req.params.prestataireId,
  });
  res.json({ isFavori: !!exists });
});

// =============================================
// PUBLIC — Compteur de favoris d'un prestataire
// =============================================

// @desc    Nombre d'utilisateurs ayant mis ce prestataire en favori
// @route   GET /api/favoris/count/:prestataireId
// @access  Public
const countFavoris = asyncHandler(async (req, res) => {
  const count = await Favori.countDocuments({ prestataire: req.params.prestataireId });
  res.json({ count });
});

export { getMesFavoris, addFavori, removeFavori, checkFavori, countFavoris };