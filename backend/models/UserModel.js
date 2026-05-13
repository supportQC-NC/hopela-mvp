// backend/models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    // ── Authentification ─────────────────────────────
    email: {
      type: String,
      required: [true, "Email requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Mot de passe requis"],
      minlength: 6,
      select: false,
    },

    // ── Identité ─────────────────────────────────────
    nom: {
      type: String,
      required: [true, "Nom requis"],
      trim: true,
    },
    prenom: {
      type: String,
      required: [true, "Prénom requis"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user", "prestataire"],
      default: "user",
    },

    // ── Gestion du compte ────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },

    // ── Profil prestataire ───────────────────────────
    avatar: {
      type: String,
      default: null,
    },
    // Métiers : références vers le modèle Metier (géré par l'admin)
    metiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Metier",
      },
    ],
    // Contact public du prestataire (distinct de l'email de connexion)
    telephoneContact: {
      type: String,
      trim: true,
      default: null,
    },
    emailContact: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },

    // ── Réseaux sociaux & site web ───────────────────
    siteWeb: {
      type: String,
      trim: true,
      default: null,
    },
    reseauxSociaux: {
      facebook:  { type: String, trim: true, default: null },
      instagram: { type: String, trim: true, default: null },
      twitter:   { type: String, trim: true, default: null },
      tiktok:    { type: String, trim: true, default: null },
      linkedin:  { type: String, trim: true, default: null },
      youtube:   { type: String, trim: true, default: null },
    },

    // ── Géolocalisation ─────────────────────────────
    // Disponible pour tous les rôles (user, admin, prestataire)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    // true = l'utilisateur partage sa position en temps réel
    isTracked: {
      type: Boolean,
      default: false,
    },
    // Rayon de recherche en km (user/admin uniquement, pour filtrer les prestataires proches)
    rayonRecherche: {
      type: Number,
      min: [1,    "Le rayon minimum est de 1 km"],
      max: [500,  "Le rayon maximum est de 500 km"],
      default: 50, // 50 km par défaut
    },
  },
  { timestamps: true },
);

// Index géospatial
userSchema.index({ location: "2dsphere" });

// ── Hooks ────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Méthodes ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  return resetToken;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;