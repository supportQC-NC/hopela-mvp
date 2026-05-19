// backend/models/DemandeModel.js
import mongoose from "mongoose";

const demandeSchema = new mongoose.Schema(
  {
    // ── Auteur ───────────────────────────────────────
    client: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Le client est requis"],
      index:    true,
    },

    // ── Contenu ──────────────────────────────────────
    description: {
      type:      String,
      required:  [true, "La description est requise"],
      trim:      true,
      maxlength: [160, "La description ne peut pas dépasser 160 caractères"],
    },

    // ── Ciblage métier ───────────────────────────────
    // categorie est facultative — sert uniquement à filtrer les métiers côté front.
    // Seul le métier est obligatoire pour le ciblage prestataire.
    categorie: {
      type:  mongoose.Schema.Types.ObjectId,
      ref:   "Categorie",
      index: true,
      default: null,
    },
    metier: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Metier",
      required: [true, "Le métier est requis"],
      index:    true,
    },

    // ── Contact client ───────────────────────────────
    telephoneContact: {
      type:     String,
      required: [true, "Le numéro de téléphone est requis"],
      trim:     true,
    },

    // ── Localisation de la demande ───────────────────
    location: {
      type: {
        type:    String,
        enum:    ["Point"],
        default: "Point",
      },
      coordinates: {
        type:     [Number],
        required: [true, "Les coordonnées sont requises"],
        validate: {
          validator: (coords) =>
            coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90  && coords[1] <= 90,
          message: "Coordonnées invalides [longitude, latitude]",
        },
      },
      adresse: {
        type:    String,
        trim:    true,
        default: null,
      },
    },

    // ── Cycle de vie ─────────────────────────────────
    statut: {
      type:    String,
      enum:    ["active", "expiree", "annulee", "cloturee"],
      default: "active",
      index:   true,
    },

    expireAt: {
      type:  Date,
      index: true,
    },
  },
  { timestamps: true }
);

// ── Index géospatial ──────────────────────────────────
demandeSchema.index({ location: "2dsphere" });

// ── Index composés ────────────────────────────────────
demandeSchema.index({ metier: 1, statut: 1 });
demandeSchema.index({ client: 1, statut: 1 });

// ── Hook pre-save : calcul de expireAt ───────────────
// Utilise une fonction async sans next() — pattern recommandé avec Mongoose 6+
demandeSchema.pre("save", async function () {
  if (this.isNew) {
    const now = this.createdAt || new Date();
    this.expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
});

// ── Virtual ───────────────────────────────────────────
demandeSchema.virtual("isExpired").get(function () {
  return this.expireAt && new Date() > this.expireAt;
});

const Demande = mongoose.model("Demande", demandeSchema);
export default Demande;