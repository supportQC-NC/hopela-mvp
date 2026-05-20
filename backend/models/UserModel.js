// backend/models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const savedLocationSchema = new mongoose.Schema(
  {
    label:     { type: String, required: true, trim: true, maxlength: 50 },
    longitude: { type: Number, required: true },
    latitude:  { type: Number, required: true },
    adresse:   { type: String, trim: true, default: null },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    // ── Auth ─────────────────────────────────────────
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },

    // ── Identité ─────────────────────────────────────
    nom:    { type: String, required: true, trim: true },
    prenom: { type: String, required: true, trim: true },
    role:   { type: String, enum: ["admin", "user", "prestataire"], default: "user" },

    // ── Compte ───────────────────────────────────────
    isActive:            { type: Boolean, default: true },
    lastLogin:           { type: Date, default: null },
    createdBy:           { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resetPasswordToken:  { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },

    // ── Validation prestataire par admin ─────────────
    isValidated: { type: Boolean, default: false },
    // false = en attente de validation admin (prestataires uniquement)
    // true  = validé, peut se connecter
    // users et admins sont toujours true par défaut

    // ── Profil prestataire ───────────────────────────
    avatar:           { type: String, default: null },
    metiers:          [{ type: mongoose.Schema.Types.ObjectId, ref: "Metier" }],
    telephoneContact: { type: String, trim: true, default: null },
    emailContact:     { type: String, trim: true, lowercase: true, default: null },
    ridet:            { type: String, trim: true, default: null },
    // RIDET = Registre de l'Industrie, du Commerce, des Métiers et de l'Agriculture (NC)

    // ── Réseaux & site ───────────────────────────────
    siteWeb: { type: String, trim: true, default: null },
    reseauxSociaux: {
      facebook:  { type: String, trim: true, default: null },
      instagram: { type: String, trim: true, default: null },
      twitter:   { type: String, trim: true, default: null },
      tiktok:    { type: String, trim: true, default: null },
      linkedin:  { type: String, trim: true, default: null },
      youtube:   { type: String, trim: true, default: null },
    },

    // ── Géolocalisation temps réel ───────────────────
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
      updatedAt:   { type: Date, default: null },
    },
    isTracked: { type: Boolean, default: false },

    // ── Adresses enregistrées (users) ────────────────
    savedLocations: {
      type: [savedLocationSchema],
      default: [],
      validate: { validator: (a) => a.length <= 10, message: "Maximum 10 adresses" },
    },

    // ── Rayon de recherche ───────────────────────────
    rayonRecherche: { type: Number, min: 1, max: 500, default: 2 },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Un seul défaut dans savedLocations
userSchema.pre("save", function () {
  if (!this.isModified("savedLocations")) return;
  const defaults = this.savedLocations.filter((l) => l.isDefault);
  if (defaults.length > 1) {
    const lastIdx = this.savedLocations.findLastIndex((x) => x.isDefault);
    this.savedLocations.forEach((l, i) => { l.isDefault = i === lastIdx; });
  }
});

userSchema.methods.comparePassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

userSchema.methods.getResetPasswordToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken  = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return token;
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

export default mongoose.model("User", userSchema);