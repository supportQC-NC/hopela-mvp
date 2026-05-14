// backend/controllers/userControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import generateWelcomeEmail    from "../emails/templates/welcomeEmail.js";
import generateResetEmail      from "../emails/templates/resetEmail.js";
import generateValidationEmail from "../emails/templates/validationEmail.js";

// ── Helper réponse profil complet ─────────────────────────────────────────────
const userResponse = (u) => ({
  _id:              u._id,
  email:            u.email,
  nom:              u.nom,
  prenom:           u.prenom,
  role:             u.role,
  metiers:          u.metiers          || [],
  telephoneContact: u.telephoneContact || null,
  emailContact:     u.emailContact     || null,
  siteWeb:          u.siteWeb          || null,
  reseauxSociaux:   u.reseauxSociaux   || {},
  avatar:           u.avatar           || null,
  isActive:         u.isActive,
  isValidated:      u.isValidated,
  isTracked:        u.isTracked,
  lastLogin:        u.lastLogin        || null,
  location:         u.location,
  rayonRecherche:   u.rayonRecherche,
  savedLocations:   u.savedLocations   || [],
  ridet:            u.ridet            || null,
});

// =============================================
// AUTH
// =============================================

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    res.status(401); throw new Error("Email ou mot de passe invalide");
  }

  if (user.role === "prestataire" && !user.isValidated) {
    res.status(403);
    throw new Error("Votre compte est en attente de validation par un administrateur. Vous recevrez un email dès que votre compte sera activé.");
  }

  if (!await user.comparePassword(password)) {
    res.status(401); throw new Error("Email ou mot de passe invalide");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  generateToken(res, user._id);

  const populated = await User.findById(user._id).populate("metiers", "nom description icone");
  res.json(userResponse(populated));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Déconnexion réussie" });
});

// =============================================
// PROFIL
// =============================================

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("metiers", "nom description icone");
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }
  res.json(userResponse(user));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }

  if (req.body.nom    !== undefined) user.nom    = req.body.nom;
  if (req.body.prenom !== undefined) user.prenom = req.body.prenom;
  if (req.body.email  !== undefined) user.email  = req.body.email;
  if (req.body.telephoneContact !== undefined) user.telephoneContact = req.body.telephoneContact;
  if (req.body.emailContact     !== undefined) user.emailContact     = req.body.emailContact;
  if (req.body.siteWeb          !== undefined) user.siteWeb          = req.body.siteWeb;
  if (req.body.metiers          !== undefined) user.metiers          = req.body.metiers;
  if (req.body.ridet            !== undefined) user.ridet            = req.body.ridet;
  if (req.body.reseauxSociaux) {
    user.reseauxSociaux = { ...user.reseauxSociaux?.toObject?.() || {}, ...req.body.reseauxSociaux };
  }
  if (req.body.password) user.password = req.body.password;

  const updated = await user.save();
  await updated.populate("metiers", "nom description icone");
  res.json(userResponse(updated));
});

// =============================================
// MOT DE PASSE
// =============================================

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ message: "Si cet email existe, un lien a été envoyé." });

  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  try {
    await sendEmail({ email: user.email, subject: "🔐 Réinitialisation mot de passe", html: generateResetEmail({ prenom: user.prenom, nom: user.nom, resetUrl }) });
    res.json({ message: "Si cet email existe, un lien a été envoyé." });
  } catch {
    user.resetPasswordToken = null; user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });
    res.status(500); throw new Error("Erreur envoi email.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) { res.status(400); throw new Error("Token invalide ou expiré"); }
  user.password = req.body.password;
  user.resetPasswordToken = null; user.resetPasswordExpire = null;
  await user.save();
  res.json({ message: "Mot de passe réinitialisé avec succès" });
});

// =============================================
// GÉOLOCALISATION
// =============================================

const getPrestatairesPositionsPublic = asyncHandler(async (req, res) => {
  const list = await User.find({ role: "prestataire", isActive: true, isValidated: true, isTracked: true })
    .select("prenom nom location metiers telephoneContact avatar ridet")
    .populate("metiers", "nom icone");
  res.json(list);
});

const getPrestatairesPositions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }

  let lng = parseFloat(req.query.lng);
  let lat = parseFloat(req.query.lat);
  if (isNaN(lng) || isNaN(lat)) [lng, lat] = user.location?.coordinates || [0, 0];
  if (lng === 0 && lat === 0) return res.json([]);

  const rayonKm = parseFloat(req.query.rayon) || user.rayonRecherche || 10;

  const list = await User.find({
    role: "prestataire", isActive: true, isValidated: true, isTracked: true,
    location: { $nearSphere: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: rayonKm * 1000 } },
  })
    .select("prenom nom location isTracked metiers telephoneContact emailContact avatar ridet")
    .populate("metiers", "nom icone");

  res.json(list);
});

const updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { location: { type: "Point", coordinates: [longitude, latitude], updatedAt: new Date() }, isTracked: true },
    { returnDocument: "after" }
  ).select("prenom nom location isTracked rayonRecherche");
  res.json(user);
});

const stopTracking = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isTracked: false });
  res.json({ message: "Partage désactivé" });
});

const updateRayon = asyncHandler(async (req, res) => {
  const { rayon } = req.body;
  if (!rayon || rayon < 1 || rayon > 500) { res.status(400); throw new Error("Rayon entre 1 et 500 km"); }
  const user = await User.findByIdAndUpdate(req.user._id, { rayonRecherche: rayon }, { returnDocument: "after" }).select("rayonRecherche");
  res.json({ rayonRecherche: user.rayonRecherche });
});

// =============================================
// ADRESSES ENREGISTRÉES
// =============================================

const getSavedLocations = asyncHandler(async (req, res) => {
  const u = await User.findById(req.user._id).select("savedLocations");
  res.json(u.savedLocations || []);
});

const addSavedLocation = asyncHandler(async (req, res) => {
  const { label, longitude, latitude, adresse, isDefault } = req.body;
  if (!label || longitude === undefined || latitude === undefined) { res.status(400); throw new Error("label, longitude, latitude requis"); }
  const user = await User.findById(req.user._id);
  if (user.savedLocations.length >= 10) { res.status(400); throw new Error("Maximum 10 adresses"); }
  if (isDefault || user.savedLocations.length === 0) user.savedLocations.forEach((l) => { l.isDefault = false; });
  user.savedLocations.push({ label, longitude, latitude, adresse: adresse || null, isDefault: isDefault || user.savedLocations.length === 0 });
  await user.save();
  res.status(201).json(user.savedLocations);
});

const updateSavedLocation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const loc  = user.savedLocations.id(req.params.locationId);
  if (!loc) { res.status(404); throw new Error("Adresse non trouvée"); }
  if (req.body.isDefault) user.savedLocations.forEach((l) => { l.isDefault = false; });
  const { label, longitude, latitude, adresse, isDefault } = req.body;
  if (label     !== undefined) loc.label     = label;
  if (longitude !== undefined) loc.longitude = longitude;
  if (latitude  !== undefined) loc.latitude  = latitude;
  if (adresse   !== undefined) loc.adresse   = adresse;
  if (isDefault !== undefined) loc.isDefault = isDefault;
  await user.save();
  res.json(user.savedLocations);
});

const deleteSavedLocation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const loc  = user.savedLocations.id(req.params.locationId);
  if (!loc) { res.status(404); throw new Error("Adresse non trouvée"); }
  const wasDefault = loc.isDefault;
  loc.deleteOne();
  if (wasDefault && user.savedLocations.length > 0) user.savedLocations[0].isDefault = true;
  await user.save();
  res.json(user.savedLocations);
});

const setDefaultLocation = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const loc  = user.savedLocations.id(req.params.locationId);
  if (!loc) { res.status(404); throw new Error("Adresse non trouvée"); }
  user.savedLocations.forEach((l) => { l.isDefault = false; });
  loc.isDefault = true;
  await user.save();
  res.json(user.savedLocations);
});

// =============================================
// STATS PUBLIQUES (landing page)
// =============================================

// @desc    Statistiques publiques agrégées — sans données sensibles
// @route   GET /api/users/stats/public
// @access  Public
const getPublicStats = asyncHandler(async (req, res) => {
  const [prestatairesActifs, usersActifs] = await Promise.all([
    User.countDocuments({ role: "prestataire", isActive: true, isValidated: true }),
    User.countDocuments({ role: "user",        isActive: true }),
  ]);

  res.json({
    prestatairesActifs,
    usersActifs,
    tempsReponse: "< 5min",
  });
});

// =============================================
// REGISTER PUBLIC
// =============================================

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role, telephoneContact, ridet } = req.body;
  const allowedRoles = ["user", "prestataire"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  if (userRole === "prestataire") {
    if (!telephoneContact?.trim()) { res.status(400); throw new Error("Le numéro de téléphone est obligatoire pour les prestataires."); }
    if (!ridet?.trim())            { res.status(400); throw new Error("Le RIDET est obligatoire pour les prestataires."); }
  }

  if (await User.findOne({ email })) { res.status(400); throw new Error("Cet email est déjà utilisé"); }

  const user = await User.create({
    email, password, nom, prenom, role: userRole,
    telephoneContact: telephoneContact || null,
    ridet:            ridet            || null,
    isValidated: userRole !== "prestataire",
  });

  try {
    await sendEmail({
      email:   user.email,
      subject: userRole === "prestataire" ? "✦ Inscription Hopela — en attente de validation" : "✦ Bienvenue sur Hopela !",
      html:    generateWelcomeEmail({ nom: user.nom, prenom: user.prenom, email: user.email, password, role: user.role }),
    });
  } catch (e) { console.error("Email bienvenue:", e.message); }

  generateToken(res, user._id);

  if (userRole === "prestataire") {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    return res.status(201).json({
      pendingValidation: true,
      message: "Votre compte a été créé. Un administrateur doit valider votre compte avant que vous puissiez vous connecter. Vous recevrez un email de confirmation.",
    });
  }

  res.status(201).json({
    _id: user._id, email: user.email, nom: user.nom, prenom: user.prenom,
    role: user.role, metiers: [], isActive: user.isActive, isValidated: user.isValidated,
    rayonRecherche: user.rayonRecherche, savedLocations: [],
  });
});

// =============================================
// ADMIN ONLY
// =============================================

const createUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role, telephoneContact, ridet } = req.body;
  if (await User.findOne({ email })) { res.status(400); throw new Error("Email déjà utilisé"); }

  const user = await User.create({
    email, password, nom, prenom, role: role || "user",
    createdBy: req.user._id,
    telephoneContact: telephoneContact || null,
    ridet:            ridet            || null,
    isValidated: true,
  });

  try {
    await sendEmail({ email: user.email, subject: "✦ Votre compte a été créé", html: generateWelcomeEmail({ nom: user.nom, prenom: user.prenom, email: user.email, password, role: user.role }) });
  } catch (e) { console.error("Email bienvenue admin:", e.message); }

  res.status(201).json({ _id: user._id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role, isActive: user.isActive, isValidated: user.isValidated });
});

// @desc    Valider un prestataire
// @route   PATCH /api/users/:id/validate
// @access  Private/Admin
const validatePrestataire = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)                       { res.status(404); throw new Error("Utilisateur non trouvé"); }
  if (user.role !== "prestataire") { res.status(400); throw new Error("Cet utilisateur n'est pas un prestataire"); }
  if (user.isValidated)            { res.status(400); throw new Error("Ce prestataire est déjà validé"); }

  user.isValidated = true;
  user.isActive    = true;
  await user.save();

  try {
    await sendEmail({
      email:   user.email,
      subject: "✅ Votre compte Hopela est validé !",
      html:    generateValidationEmail({ prenom: user.prenom, nom: user.nom, loginUrl: `${process.env.FRONTEND_URL}/login` }),
    });
  } catch (e) { console.error("Email validation:", e.message); }

  res.json({ message: `Le compte de ${user.prenom} ${user.nom} a été validé.`, user: { _id: user._id, isValidated: true } });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").populate("createdBy", "nom prenom email").populate("metiers", "nom description icone").sort({ createdAt: -1 });
  res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").populate("createdBy", "nom prenom email").populate("metiers", "nom description icone");
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }
  user.nom      = req.body.nom      || user.nom;
  user.prenom   = req.body.prenom   || user.prenom;
  user.email    = req.body.email    || user.email;
  user.role     = req.body.role     || user.role;
  user.isActive = req.body.isActive ?? user.isActive;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({ _id: updated._id, email: updated.email, nom: updated.nom, prenom: updated.prenom, role: updated.role, isActive: updated.isActive, isValidated: updated.isValidated });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }
  if (user.role === "admin" && req.user._id.toString() !== user._id.toString()) { res.status(400); throw new Error("Impossible de supprimer un autre admin"); }
  await User.deleteOne({ _id: user._id });
  res.json({ message: "Utilisateur supprimé" });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("Utilisateur non trouvé"); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ _id: user._id, isActive: user.isActive, message: user.isActive ? "Activé" : "Désactivé" });
});

export {
  authUser, registerUser, logoutUser, getUserProfile, updateUserProfile,
  forgotPassword, resetPassword,
  getPrestatairesPositionsPublic, getPrestatairesPositions, updateLocation, stopTracking, updateRayon,
  getSavedLocations, addSavedLocation, updateSavedLocation, deleteSavedLocation, setDefaultLocation,
  getPublicStats,
  validatePrestataire,
  createUser, getUsers, getUserById, updateUser, deleteUser, toggleUserActive,
};