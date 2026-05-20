// backend/controllers/prestairePublicControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import User         from "../models/UserModel.js";
import Promotion    from "../models/PromotionModel.js";
import Favori       from "../models/FavoriModel.js";

// @desc    Profil public complet d'un prestataire
// @route   GET /api/prestataires/:id/public
// @access  Public
const getPrestairePublic = asyncHandler(async (req, res) => {
  const prestataire = await User.findOne({
    _id:         req.params.id,
    role:        "prestataire",
    isActive:    true,
    isValidated: true,
  })
    .select("prenom nom avatar metiers telephoneContact emailContact siteWeb reseauxSociaux location isTracked ridet createdAt")
    .populate({
      path:     "metiers",
      select:   "nom description icone categorie",
      populate: { path: "categorie", select: "nom icone" },
    });

  if (!prestataire) {
    res.status(404);
    throw new Error("Prestataire introuvable ou inactif");
  }

  // Promotions actives et valides
  const now = new Date();
  const promotions = await Promotion.find({
    prestataire: prestataire._id,
    isActive:    true,
    $and: [
      { $or: [{ dateDebut: null }, { dateDebut: { $lte: now } }] },
      { $or: [{ dateFin:   null }, { dateFin:   { $gte: now } }] },
    ],
  }).sort({ createdAt: -1 });

  // Compteur de favoris
  const favoriCount = await Favori.countDocuments({ prestataire: prestataire._id });

  res.json({
    prestataire,
    promotions,
    favoriCount,
  });
});

export { getPrestairePublic };