// backend/controllers/userControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/UserModel.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import generateWelcomeEmail from "../emails/templates/welcomeEmail.js";
import generateResetEmail from "../emails/templates/resetEmail.js";

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
    _id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    metier: user.metier,
    note: user.note,
    nbAvis: user.nbAvis,
    isActive: user.isActive,
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

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  res.json({
    _id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    location: user.location,
    isTracked: user.isTracked,
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

  user.nom = req.body.nom || user.nom;
  user.prenom = req.body.prenom || user.prenom;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    email: updatedUser.email,
    nom: updatedUser.nom,
    prenom: updatedUser.prenom,
    role: updatedUser.role,
  });
});

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
        nom: user.nom,
        resetUrl,
      }),
    });

    res.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    user.resetPasswordToken = null;
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
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Token invalide ou expiré");
  }

  user.password = req.body.password;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.json({ message: "Mot de passe réinitialisé avec succès" });
});

// =============================================
// GÉOLOCALISATION
// =============================================

// @desc    Get all active prestataires positions
// @route   GET /api/users/prestataires/positions
// @access  Public
const getPrestatairesPositions = asyncHandler(async (req, res) => {
  const prestataires = await User.find({
    role: "prestataire",
    isActive: true,
    isTracked: true,
  }).select("prenom nom location isTracked metier note nbAvis avatar");

  res.json(prestataires);
});

// @desc    Update own location
// @route   PUT /api/users/location
// @access  Private/Prestataire
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
        type: "Point",
        coordinates: [longitude, latitude],
        updatedAt: new Date(),
      },
      isTracked: true,
    },
    { new: true },
  ).select("prenom nom location isTracked");

  res.json(user);
});

// @desc    Stop sharing location
// @route   PUT /api/users/location/stop
// @access  Private/Prestataire
const stopTracking = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isTracked: false });
  res.json({ message: "Partage de position désactivé" });
});

// =============================================
// REGISTER PUBLIC
// =============================================

// @desc    Register new user (Public)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, nom, prenom, role } = req.body;

  // Seuls user et prestataire peuvent s'inscrire librement
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

  // Email de bienvenue
  try {
    await sendEmail({
      email: user.email,
      subject: "✦ Bienvenue sur Hopela !",
      html: generateWelcomeEmail({
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
    _id:      user._id,
    email:    user.email,
    nom:      user.nom,
    prenom:   user.prenom,
    role:     user.role,
    metier:   user.metier   || null,
    note:     user.note     || null,
    nbAvis:   user.nbAvis   || 0,
    isActive: user.isActive,
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
    role: role || "user",
    createdBy: req.user._id,
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "✦ Votre compte a été créé",
      html: generateWelcomeEmail({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password,
        role: user.role,
      }),
    });
  } catch (error) {
    console.error("Erreur envoi email de bienvenue:", error.message);
  }

  res.status(201).json({
    _id: user._id,
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,
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
    .sort({ createdAt: -1 });

  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("createdBy", "nom prenom email");

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  res.json(user);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  user.nom = req.body.nom || user.nom;
  user.prenom = req.body.prenom || user.prenom;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.isActive = req.body.isActive ?? user.isActive;

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    email: updatedUser.email,
    nom: updatedUser.nom,
    prenom: updatedUser.prenom,
    role: updatedUser.role,
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
    _id: user._id,
    isActive: user.isActive,
    message: user.isActive ? "Utilisateur activé" : "Utilisateur désactivé",
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
  getPrestatairesPositions,
  updateLocation,
  stopTracking,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
};