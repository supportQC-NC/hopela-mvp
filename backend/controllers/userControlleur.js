// backend/controllers/userControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import generateWelcomeEmail from "../emails/templates/welcomeEmail.js";
import generateResetEmail from "../emails/templates/resetEmail.js";

// =============================================
// AUTH
// =============================================

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error("Email ou mot de passe invalide");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Email ou mot de passe invalide");
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  generateToken(res, user._id);

  res.json({
    _id:              user._id,
    email:            user.email,
    nom:              user.nom,
    prenom:           user.prenom,
    role:             user.role,
    metiers:          user.metiers          || [],
    telephoneContact: user.telephoneContact || null,
    emailContact:     user.emailContact     || null,
    siteWeb:          user.siteWeb          || null,
    reseauxSociaux:   user.reseauxSociaux   || {},
    isActive:         user.isActive,
  });
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Déconnexion réussie" });
});

// =============================================
// PROFIL
// =============================================

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("metiers", "nom description icone");

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  res.json({
    _id:              user._id,
    email:            user.email,
    nom:              user.nom,
    prenom:           user.prenom,
    role:             user.role,
    metiers:          user.metiers          || [],
    telephoneContact: user.telephoneContact || null,
    emailContact:     user.emailContact     || null,
    siteWeb:          user.siteWeb          || null,
    reseauxSociaux:   user.reseauxSociaux   || {},
    avatar:           user.avatar           || null,
    isActive:         user.isActive,
    lastLogin:        user.lastLogin,
    location:         user.location,
    isTracked:        user.isTracked,
    rayonRecherche:   user.rayonRecherche,
  });
});

// @desc    Update user profile (self)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  user.nom    = req.body.nom    || user.nom;
  user.prenom = req.body.prenom || user.prenom;
  user.email  = req.body.email  || user.email;

  // Champs prestataire
  if (req.body.telephoneContact !== undefined) user.telephoneContact = req.body.telephoneContact;
  if (req.body.emailContact     !== undefined) user.emailContact     = req.body.emailContact;
  if (req.body.siteWeb          !== undefined) user.siteWeb          = req.body.siteWeb;

  // Métiers : tableau d'IDs Metier
  if (req.body.metiers !== undefined) user.metiers = req.body.metiers;

  // Réseaux sociaux — merge avec l'existant
  if (req.body.reseauxSociaux) {
    user.reseauxSociaux = {
      ...user.reseauxSociaux?.toObject?.() || user.reseauxSociaux || {},
      ...req.body.reseauxSociaux,
    };
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  await updatedUser.populate("metiers", "nom description icone");

  res.json({
    _id:              updatedUser._id,
    email:            updatedUser.email,
    nom:              updatedUser.nom,
    prenom:           updatedUser.prenom,
    role:             updatedUser.role,
    metiers:          updatedUser.metiers          || [],
    telephoneContact: updatedUser.telephoneContact || null,
    emailContact:     updatedUser.emailContact     || null,
    siteWeb:          updatedUser.siteWeb          || null,
    reseauxSociaux:   updatedUser.reseauxSociaux   || {},
    avatar:           updatedUser.avatar           || null,
    isActive:         updatedUser.isActive,
  });
});

// =============================================
// MOT DE PASSE
// =============================================

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "🔐 Réinitialisation de votre mot de passe",
      html: generateResetEmail({
        prenom: user.prenom,
        nom:    user.nom,
        resetUrl,
      }),
    });

    res.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    user.resetPasswordToken  = null;
    user.resetPasswordExpire = null;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Erreur lors de l'envoi de l'email, réessayez plus tard.");
  }
});

// @desc    Reset password via token
// @route   PUT /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token invalide ou expiré");
  }

  user.password            = req.body.password;
  user.resetPasswordToken  = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({ message: "Mot de passe réinitialisé avec succès" });
});

// =============================================
// GÉOLOCALISATION
// =============================================

// @desc    Tous les prestataires trackés (public — pour la landing)
// @route   GET /api/users/prestataires/positions/public
// @access  Public
const getPrestatairesPositionsPublic = asyncHandler(async (req, res) => {
  const prestataires = await User.find({
    role:      "prestataire",
    isActive:  true,
    isTracked: true,
  })
    .select("prenom nom location metiers telephoneContact avatar")
    .populate("metiers", "nom icone");

  res.json(prestataires);
});

// @desc    Prestataires dans le rayon de l'user connecté
// @route   GET /api/users/prestataires/positions
// @access  Private
const getPrestatairesPositions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  // Si l'user n'a pas encore partagé sa position on retourne tableau vide
  const [lng, lat] = user.location?.coordinates || [0, 0];
  if (lng === 0 && lat === 0) {
    return res.json([]);
  }

  const rayonKm = user.rayonRecherche || 50;

  const prestataires = await User.find({
    role:      "prestataire",
    isActive:  true,
    isTracked: true,
    location: {
      $nearSphere: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: rayonKm * 1000, // MongoDB attend des mètres
      },
    },
  })
    .select("prenom nom location isTracked metiers telephoneContact emailContact avatar")
    .populate("metiers", "nom icone");

  res.json(prestataires);
});

// @desc    Mettre à jour sa position (tous rôles)
// @route   PUT /api/users/location
// @access  Private
const updateLocation = asyncHandler(async (req, res) => {
  const { longitude, latitude } = req.body;

  if (longitude === undefined || latitude === undefined) {
    res.status(400);
    throw new Error("Longitude et latitude requises");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type:        "Point",
        coordinates: [longitude, latitude],
        updatedAt:   new Date(),
      },
      isTracked: true,
    },
    { new: true },
  ).select("prenom nom location isTracked rayonRecherche");

  res.json(user);
});

// @desc    Arrêter le partage de position (tous rôles)
// @route   PUT /api/users/location/stop
// @access  Private
const stopTracking = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isTracked: false });
  res.json({ message: "Partage de position désactivé" });
});

// @desc    Mettre à jour le rayon de recherche (user/admin)
// @route   PUT /api/users/rayon
// @access  Private
const updateRayon = asyncHandler(async (req, res) => {
  const { rayon } = req.body;

  if (!rayon || rayon < 1 || rayon > 500) {
    res.status(400);
    throw new Error("Le rayon doit être compris entre 1 et 500 km");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { rayonRecherche: rayon },
    { new: true },
  ).select("rayonRecherche");

  res.json({ rayonRecherche: user.rayonRecherche });
});

// =============================================
// REGISTER PUBLIC
// =============================================

// @desc    Register new user (Public)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role } = req.body;

  const allowedRoles = ["user", "prestataire"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Cet email est déjà utilisé");
  }

  const user = await User.create({
    email,
    password,
    nom,
    prenom,
    role: userRole,
  });

  try {
    await sendEmail({
      email:   user.email,
      subject: "✦ Bienvenue sur Hopela !",
      html:    generateWelcomeEmail({
        nom:      user.nom,
        prenom:   user.prenom,
        email:    user.email,
        password,
        role:     user.role,
      }),
    });
  } catch (error) {
    console.error("Erreur envoi email de bienvenue:", error.message);
  }

  generateToken(res, user._id);

  res.status(201).json({
    _id:              user._id,
    email:            user.email,
    nom:              user.nom,
    prenom:           user.prenom,
    role:             user.role,
    metiers:          user.metiers          || [],
    telephoneContact: user.telephoneContact || null,
    emailContact:     user.emailContact     || null,
    siteWeb:          user.siteWeb          || null,
    reseauxSociaux:   user.reseauxSociaux   || {},
    isActive:         user.isActive,
  });
});

// =============================================
// ADMIN ONLY
// =============================================

// @desc    Create new user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Cet email est déjà utilisé");
  }

  const user = await User.create({
    email,
    password,
    nom,
    prenom,
    role:      role || "user",
    createdBy: req.user._id,
  });

  try {
    await sendEmail({
      email:   user.email,
      subject: "✦ Votre compte a été créé",
      html:    generateWelcomeEmail({
        nom:      user.nom,
        prenom:   user.prenom,
        email:    user.email,
        password,
        role:     user.role,
      }),
    });
  } catch (error) {
    console.error("Erreur envoi email de bienvenue:", error.message);
  }

  res.status(201).json({
    _id:      user._id,
    email:    user.email,
    nom:      user.nom,
    prenom:   user.prenom,
    role:     user.role,
    isActive: user.isActive,
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select("-password")
    .populate("createdBy", "nom prenom email")
    .populate("metiers", "nom description icone")
    .sort({ createdAt: -1 });

  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("createdBy", "nom prenom email")
    .populate("metiers", "nom description icone");

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  res.json(user);
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  user.nom      = req.body.nom      || user.nom;
  user.prenom   = req.body.prenom   || user.prenom;
  user.email    = req.body.email    || user.email;
  user.role     = req.body.role     || user.role;
  user.isActive = req.body.isActive ?? user.isActive;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id:      updatedUser._id,
    email:    updatedUser.email,
    nom:      updatedUser.nom,
    prenom:   updatedUser.prenom,
    role:     updatedUser.role,
    isActive: updatedUser.isActive,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  if (
    user.role === "admin" &&
    req.user._id.toString() !== user._id.toString()
  ) {
    res.status(400);
    throw new Error("Impossible de supprimer un autre administrateur");
  }

  await User.deleteOne({ _id: user._id });

  res.json({ message: "Utilisateur supprimé" });
});

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-active
// @access  Private/Admin
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    _id:      user._id,
    isActive: user.isActive,
    message:  user.isActive ? "Utilisateur activé" : "Utilisateur désactivé",
  });
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  getPrestatairesPositionsPublic,
  getPrestatairesPositions,
  updateLocation,
  stopTracking,
  updateRayon,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
};