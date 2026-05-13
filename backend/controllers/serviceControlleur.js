// backend/controllers/serviceControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Service from "../models/ServiceModel.js";

// =============================================
// PRESTATAIRE — ses propres services
// =============================================

// @desc    Récupérer tous ses services
// @route   GET /api/services
// @access  Private/Prestataire
const getMesServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ prestataire: req.user._id }).sort({ createdAt: -1 });
  res.json(services);
});

// @desc    Créer un service
// @route   POST /api/services
// @access  Private/Prestataire
const createService = asyncHandler(async (req, res) => {
  const { nom, description, duree } = req.body;

  if (!nom) {
    res.status(400);
    throw new Error("Le nom du service est requis");
  }

  const service = await Service.create({
    prestataire: req.user._id,
    nom,
    description: description || null,
    duree:       duree       || null,
  });

  res.status(201).json(service);
});

// @desc    Modifier un service
// @route   PUT /api/services/:id
// @access  Private/Prestataire
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service non trouvé");
  }

  // Un prestataire ne peut modifier que ses propres services
  if (service.prestataire.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé");
  }

  if (req.body.nom         !== undefined) service.nom         = req.body.nom;
  if (req.body.description !== undefined) service.description = req.body.description;
  if (req.body.duree       !== undefined) service.duree       = req.body.duree;

  const updated = await service.save();
  res.json(updated);
});

// @desc    Activer / désactiver un service
// @route   PATCH /api/services/:id/toggle
// @access  Private/Prestataire
const toggleService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service non trouvé");
  }

  if (service.prestataire.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé");
  }

  service.isActive = !service.isActive;
  await service.save();

  res.json({
    _id:      service._id,
    isActive: service.isActive,
    message:  service.isActive ? "Service activé" : "Service désactivé",
  });
});

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
// @access  Private/Prestataire
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error("Service non trouvé");
  }

  if (service.prestataire.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé");
  }

  await Service.deleteOne({ _id: service._id });
  res.json({ message: "Service supprimé" });
});

// =============================================
// PUBLIC — services d'un prestataire
// =============================================

// @desc    Récupérer les services actifs d'un prestataire (vue publique)
// @route   GET /api/services/prestataire/:id
// @access  Public
const getServicesPrestataire = asyncHandler(async (req, res) => {
  const services = await Service.find({
    prestataire: req.params.id,
    isActive:    true,
  }).sort({ createdAt: -1 });

  res.json(services);
});

export {
  getMesServices,
  createService,
  updateService,
  toggleService,
  deleteService,
  getServicesPrestataire,
};