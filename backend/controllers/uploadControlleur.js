// backend/controllers/uploadControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/UserModel.js";
import Service from "../models/ServiceModel.js";
import fs from "fs";
import path from "path";

// =============================================
// LOGO PRESTATAIRE
// =============================================

// @desc    Upload / remplacer le logo du prestataire
// @route   POST /api/upload/logo
// @access  Private/Prestataire
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Aucun fichier reçu");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  // Supprimer l'ancien logo s'il existe
  if (user.avatar) {
    const oldPath = path.join(".", user.avatar);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  // Enregistrer le chemin relatif (servi via /uploads/logos/...)
  user.avatar = `/uploads/logos/${req.file.filename}`;
  await user.save({ validateBeforeSave: false });

  res.json({
    message: "Logo mis à jour",
    avatar: user.avatar,
  });
});

// @desc    Supprimer le logo du prestataire
// @route   DELETE /api/upload/logo
// @access  Private/Prestataire
const deleteLogo = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  if (!user.avatar) {
    res.status(400);
    throw new Error("Aucun logo à supprimer");
  }

  const oldPath = path.join(".", user.avatar);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  user.avatar = null;
  await user.save({ validateBeforeSave: false });

  res.json({ message: "Logo supprimé" });
});

// =============================================
// IMAGE SERVICE
// =============================================

// @desc    Upload / remplacer l'image d'un service
// @route   POST /api/upload/service/:id
// @access  Private/Prestataire
const uploadServiceImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Aucun fichier reçu");
  }

  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service non trouvé");
  }

  // Vérifier que le service appartient bien au prestataire connecté
  if (service.prestataire.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé");
  }

  // Supprimer l'ancienne image si elle existe
  if (service.image) {
    const oldPath = path.join(".", service.image);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  service.image = `/uploads/services/${req.file.filename}`;
  await service.save();

  res.json({
    message: "Image du service mise à jour",
    image: service.image,
  });
});

// @desc    Supprimer l'image d'un service
// @route   DELETE /api/upload/service/:id
// @access  Private/Prestataire
const deleteServiceImage = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    res.status(404);
    throw new Error("Service non trouvé");
  }

  if (service.prestataire.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé");
  }

  if (!service.image) {
    res.status(400);
    throw new Error("Aucune image à supprimer");
  }

  const oldPath = path.join(".", service.image);
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

  service.image = null;
  await service.save();

  res.json({ message: "Image supprimée" });
});

export { uploadLogo, deleteLogo, uploadServiceImage, deleteServiceImage };