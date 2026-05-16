// backend/controllers/metierControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Metier       from "../models/MetierModel.js";
import Categorie    from "../models/CategorieModel.js";
import User         from "../models/UserModel.js";

// =============================================
// PUBLIC
// =============================================

// @desc    Récupérer tous les métiers actifs
// @route   GET /api/metiers
// @access  Public
const getMetiers = asyncHandler(async (req, res) => {
  const metiers = await Metier.find({ isActive: true })
    .populate("categorie", "nom icone ordre")
    .sort({ nom: 1 });
  res.json(metiers);
});

// @desc    Récupérer un métier par ID
// @route   GET /api/metiers/:id
// @access  Public
const getMetierById = asyncHandler(async (req, res) => {
  const metier = await Metier.findById(req.params.id)
    .populate("categorie", "nom icone ordre");

  if (!metier) {
    res.status(404);
    throw new Error("Métier non trouvé");
  }

  res.json(metier);
});

// =============================================
// ADMIN ONLY
// =============================================

// @desc    Récupérer tous les métiers (actifs + inactifs)
// @route   GET /api/metiers/admin/all
// @access  Private/Admin
const getAllMetiers = asyncHandler(async (req, res) => {
  const metiers = await Metier.find({})
    .populate("categorie", "nom icone ordre")
    .populate("createdBy", "nom prenom email")
    .sort({ nom: 1 });
  res.json(metiers);
});

// @desc    Créer un métier
// @route   POST /api/metiers
// @access  Private/Admin
const createMetier = asyncHandler(async (req, res) => {
  const { nom, description, icone, categorieId } = req.body;

  if (!nom) {
    res.status(400);
    throw new Error("Le nom du métier est requis");
  }

  if (!categorieId) {
    res.status(400);
    throw new Error("La catégorie du métier est requise");
  }

  // Vérifie que la catégorie existe
  const categorie = await Categorie.findById(categorieId);
  if (!categorie) {
    res.status(404);
    throw new Error("Catégorie introuvable");
  }

  // Vérifie que le nom n'existe pas déjà
  const exists = await Metier.findOne({ nom: { $regex: new RegExp(`^${nom}$`, "i") } });
  if (exists) {
    res.status(400);
    throw new Error("Ce métier existe déjà");
  }

  const metier = await Metier.create({
    nom,
    description: description || null,
    icone:       icone       || null,
    categorie:   categorieId,
    createdBy:   req.user._id,
  });

  // Retourne le métier populé pour que le front dispose de l'objet catégorie complet
  const populated = await Metier.findById(metier._id).populate("categorie", "nom icone ordre");
  res.status(201).json(populated);
});

// @desc    Modifier un métier
// @route   PUT /api/metiers/:id
// @access  Private/Admin
const updateMetier = asyncHandler(async (req, res) => {
  const metier = await Metier.findById(req.params.id);

  if (!metier) {
    res.status(404);
    throw new Error("Métier non trouvé");
  }

  if (req.body.nom         !== undefined) metier.nom         = req.body.nom;
  if (req.body.description !== undefined) metier.description = req.body.description;
  if (req.body.icone       !== undefined) metier.icone       = req.body.icone;
  if (req.body.isActive    !== undefined) metier.isActive    = req.body.isActive;

  // Mise à jour de la catégorie si fournie
  if (req.body.categorieId !== undefined) {
    const categorie = await Categorie.findById(req.body.categorieId);
    if (!categorie) {
      res.status(404);
      throw new Error("Catégorie introuvable");
    }
    metier.categorie = req.body.categorieId;
  }

  const updated = await metier.save();
  const populated = await Metier.findById(updated._id).populate("categorie", "nom icone ordre");
  res.json(populated);
});

// @desc    Supprimer un métier
// @route   DELETE /api/metiers/:id
// @access  Private/Admin
const deleteMetier = asyncHandler(async (req, res) => {
  const metier = await Metier.findById(req.params.id);

  if (!metier) {
    res.status(404);
    throw new Error("Métier non trouvé");
  }

  // Vérifier qu'aucun prestataire n'utilise ce métier
  const enUtilisation = await User.findOne({ metiers: metier._id });
  if (enUtilisation) {
    res.status(400);
    throw new Error(
      "Impossible de supprimer ce métier : il est utilisé par au moins un prestataire"
    );
  }

  await Metier.deleteOne({ _id: metier._id });
  res.json({ message: "Métier supprimé" });
});

// @desc    Activer / désactiver un métier
// @route   PATCH /api/metiers/:id/toggle
// @access  Private/Admin
const toggleMetier = asyncHandler(async (req, res) => {
  const metier = await Metier.findById(req.params.id);

  if (!metier) {
    res.status(404);
    throw new Error("Métier non trouvé");
  }

  metier.isActive = !metier.isActive;
  await metier.save();

  res.json({
    _id:      metier._id,
    isActive: metier.isActive,
    message:  metier.isActive ? "Métier activé" : "Métier désactivé",
  });
});

export {
  getMetiers,
  getMetierById,
  getAllMetiers,
  createMetier,
  updateMetier,
  deleteMetier,
  toggleMetier,
};