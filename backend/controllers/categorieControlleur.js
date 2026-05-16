// backend/controllers/categorieControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Categorie    from "../models/CategorieModel.js";
import Metier       from "../models/MetierModel.js";

// =============================================
// PUBLIC
// =============================================

// @desc    Récupérer toutes les catégories actives
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Categorie.find({ isActive: true }).sort({ ordre: 1, nom: 1 });
  res.json(categories);
});

// @desc    Récupérer une catégorie par ID (avec ses métiers actifs)
// @route   GET /api/categories/:id
// @access  Public
const getCategorieById = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);

  if (!categorie) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  // Récupère les métiers actifs de cette catégorie
  const metiers = await Metier.find({ categorie: categorie._id, isActive: true }).sort({ nom: 1 });

  res.json({ ...categorie.toJSON(), metiers });
});

// =============================================
// ADMIN ONLY
// =============================================

// @desc    Récupérer toutes les catégories (actives + inactives)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Categorie.find({})
    .populate("createdBy", "nom prenom email")
    .sort({ ordre: 1, nom: 1 });

  // Ajoute le compte de métiers par catégorie
  const withCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Metier.countDocuments({ categorie: cat._id });
      return { ...cat.toJSON(), metiersCount: count };
    })
  );

  res.json(withCount);
});

// @desc    Créer une catégorie
// @route   POST /api/categories
// @access  Private/Admin
const createCategorie = asyncHandler(async (req, res) => {
  const { nom, description, icone, ordre } = req.body;

  if (!nom) {
    res.status(400);
    throw new Error("Le nom de la catégorie est requis");
  }

  const exists = await Categorie.findOne({ nom: { $regex: new RegExp(`^${nom}$`, "i") } });
  if (exists) {
    res.status(400);
    throw new Error("Cette catégorie existe déjà");
  }

  const categorie = await Categorie.create({
    nom,
    description: description || null,
    icone:       icone       || null,
    ordre:       ordre       ?? 0,
    createdBy:   req.user._id,
  });

  res.status(201).json(categorie);
});

// @desc    Modifier une catégorie
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategorie = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);

  if (!categorie) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  if (req.body.nom         !== undefined) categorie.nom         = req.body.nom;
  if (req.body.description !== undefined) categorie.description = req.body.description;
  if (req.body.icone       !== undefined) categorie.icone       = req.body.icone;
  if (req.body.ordre       !== undefined) categorie.ordre       = req.body.ordre;
  if (req.body.isActive    !== undefined) categorie.isActive    = req.body.isActive;

  const updated = await categorie.save();
  res.json(updated);
});

// @desc    Supprimer une catégorie
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategorie = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);

  if (!categorie) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  // Vérifier qu'aucun métier n'utilise cette catégorie
  const enUtilisation = await Metier.findOne({ categorie: categorie._id });
  if (enUtilisation) {
    res.status(400);
    throw new Error(
      "Impossible de supprimer cette catégorie : elle est utilisée par au moins un métier"
    );
  }

  await Categorie.deleteOne({ _id: categorie._id });
  res.json({ message: "Catégorie supprimée" });
});

// @desc    Activer / désactiver une catégorie
// @route   PATCH /api/categories/:id/toggle
// @access  Private/Admin
const toggleCategorie = asyncHandler(async (req, res) => {
  const categorie = await Categorie.findById(req.params.id);

  if (!categorie) {
    res.status(404);
    throw new Error("Catégorie non trouvée");
  }

  categorie.isActive = !categorie.isActive;
  await categorie.save();

  res.json({
    _id:      categorie._id,
    isActive: categorie.isActive,
    message:  categorie.isActive ? "Catégorie activée" : "Catégorie désactivée",
  });
});

export {
  getCategories,
  getCategorieById,
  getAllCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
  toggleCategorie,
};