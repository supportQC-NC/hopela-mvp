// backend/controllers/promotionControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Promotion    from "../models/PromotionModel.js";
import path         from "path";
import fs           from "fs";

const MAX_PROMOTIONS = 5;
const MAX_IMAGES     = 3;

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Filtre les promotions expirées ou non encore actives
const isVisible = (promo) => {
  const now = new Date();
  if (!promo.isActive) return false;
  if (promo.dateDebut && new Date(promo.dateDebut) > now) return false;
  if (promo.dateFin   && new Date(promo.dateFin)   < now) return false;
  return true;
};

// =============================================
// PUBLIC
// =============================================

// @desc    Toutes les promotions actives en ce moment (landing page)
// @route   GET /api/promotions/actives
// @access  Public
const getPromotionsActives = asyncHandler(async (req, res) => {
  const now = new Date();
  const promos = await Promotion.find({
    isActive: true,
    $and: [
      { $or: [{ dateDebut: null }, { dateDebut: { $lte: now } }] },
      { $or: [{ dateFin:   null }, { dateFin:   { $gte: now } }] },
    ],
  })
    .populate("prestataire", "prenom nom avatar metiers")
    .populate({ path: "prestataire", populate: { path: "metiers", select: "nom icone" } })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(promos);
});

// @desc    Promotions actives et valides d'un prestataire (vue publique)
// @route   GET /api/promotions/prestataire/:id
// @access  Public
const getPromotionsPubliques = asyncHandler(async (req, res) => {
  const promos = await Promotion.find({
    prestataire: req.params.id,
    isActive:    true,
    $or: [
      { dateFin: null },
      { dateFin: { $gte: new Date() } },
    ],
    $or: [
      { dateDebut: null },
      { dateDebut: { $lte: new Date() } },
    ],
  }).sort({ createdAt: -1 });

  res.json(promos);
});

// =============================================
// PRESTATAIRE CONNECTÉ
// =============================================

// @desc    Toutes mes promotions (y compris expirées)
// @route   GET /api/promotions/mes-promotions
// @access  Private/Prestataire
const getMesPromotions = asyncHandler(async (req, res) => {
  const promos = await Promotion.find({ prestataire: req.user._id }).sort({ createdAt: -1 });
  res.json(promos);
});

// @desc    Créer une promotion (max 5)
// @route   POST /api/promotions
// @access  Private/Prestataire
const createPromotion = asyncHandler(async (req, res) => {
  const count = await Promotion.countDocuments({ prestataire: req.user._id });
  if (count >= MAX_PROMOTIONS) {
    res.status(400);
    throw new Error(`Vous avez atteint la limite de ${MAX_PROMOTIONS} promotions.`);
  }

  const { titre, description, badge, dateDebut, dateFin } = req.body;

  if (!titre) { res.status(400); throw new Error("Le titre est requis"); }

  const promo = await Promotion.create({
    prestataire: req.user._id,
    titre,
    description: description || null,
    badge:       badge       || "Tag",
    dateDebut:   dateDebut   || null,
    dateFin:     dateFin     || null,
  });

  res.status(201).json(promo);
});

// @desc    Modifier une promotion
// @route   PUT /api/promotions/:id
// @access  Private/Prestataire
const updatePromotion = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);

  if (!promo) { res.status(404); throw new Error("Promotion introuvable"); }
  if (promo.prestataire.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error("Non autorisé");
  }

  const { titre, description, badge, dateDebut, dateFin, isActive } = req.body;

  if (titre       !== undefined) promo.titre       = titre;
  if (description !== undefined) promo.description = description;
  if (badge       !== undefined) promo.badge       = badge;
  if (dateDebut   !== undefined) promo.dateDebut   = dateDebut || null;
  if (dateFin     !== undefined) promo.dateFin     = dateFin   || null;
  if (isActive    !== undefined) promo.isActive    = isActive;

  const updated = await promo.save();
  res.json(updated);
});

// @desc    Supprimer une promotion (et ses images)
// @route   DELETE /api/promotions/:id
// @access  Private/Prestataire
const deletePromotion = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);

  if (!promo) { res.status(404); throw new Error("Promotion introuvable"); }
  if (promo.prestataire.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error("Non autorisé");
  }

  // Suppression des fichiers images
  promo.images.forEach((imgPath) => {
    const fullPath = path.join(process.cwd(), imgPath.replace(/^\//, ""));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });

  await Promotion.deleteOne({ _id: promo._id });
  res.json({ message: "Promotion supprimée", _id: req.params.id });
});

// @desc    Ajouter une image à une promotion (max 3)
// @route   POST /api/promotions/:id/images
// @access  Private/Prestataire
const addImagePromotion = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);

  if (!promo) { res.status(404); throw new Error("Promotion introuvable"); }
  if (promo.prestataire.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error("Non autorisé");
  }
  if (promo.images.length >= MAX_IMAGES) {
    res.status(400); throw new Error(`Maximum ${MAX_IMAGES} images par promotion`);
  }
  if (!req.file) { res.status(400); throw new Error("Aucun fichier reçu"); }

  const imageUrl = `/uploads/promotions/${req.file.filename}`;
  promo.images.push(imageUrl);
  await promo.save();

  res.json(promo);
});

// @desc    Supprimer une image d'une promotion
// @route   DELETE /api/promotions/:id/images/:imageIndex
// @access  Private/Prestataire
const deleteImagePromotion = asyncHandler(async (req, res) => {
  const promo = await Promotion.findById(req.params.id);

  if (!promo) { res.status(404); throw new Error("Promotion introuvable"); }
  if (promo.prestataire.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error("Non autorisé");
  }

  const idx = parseInt(req.params.imageIndex, 10);
  if (isNaN(idx) || idx < 0 || idx >= promo.images.length) {
    res.status(400); throw new Error("Index d'image invalide");
  }

  const imgPath = promo.images[idx];
  const fullPath = path.join(process.cwd(), imgPath.replace(/^\//, ""));
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

  promo.images.splice(idx, 1);
  await promo.save();

  res.json(promo);
});

// @desc    Toutes les promotions (admin) avec infos prestataire
// @route   GET /api/promotions/admin/all
// @access  Private/Admin
const getAllPromotionsAdmin = asyncHandler(async (req, res) => {
  const promos = await Promotion.find({})
    .populate("prestataire", "prenom nom email metiers")
    .populate({ path: "prestataire", populate: { path: "metiers", select: "nom" } })
    .sort({ createdAt: -1 });
  res.json(promos);
});

export {
  getPromotionsActives,
  getPromotionsPubliques,
  getMesPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addImagePromotion,
  deleteImagePromotion,
  getAllPromotionsAdmin,
};