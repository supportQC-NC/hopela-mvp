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
    categorie: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Categorie",
      required: [true, "La catégorie est requise"],
      index:    true,
    },
    metier: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Metier",
      required: [true, "Le métier est requis"],
      index:    true,
    },

    // ── Contact client (saisi/confirmé à la création) ─
    // Stocké dans le document pour garder la valeur au moment de la demande,
    // indépendamment des modifications ultérieures du profil du client.
    telephoneContact: {
      type:     String,
      required: [true, "Le numéro de téléphone est requis"],
      trim:     true,
    },

    // ── Localisation de la demande ───────────────────
    // Point géographique positionné par le client sur la carte.
    location: {
      type: {
        type:    String,
        enum:    ["Point"],
        default: "Point",
      },
      coordinates: {
        // [longitude, latitude] — convention GeoJSON
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
        // Adresse humaine facultative (géocodage inversé côté front)
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

    // Calculé à la création : createdAt + 48h
    // Utilisé par les requêtes pour filtrer les demandes encore valides.
    expireAt: {
      type:  Date,
      index: true,
    },
  },
  { timestamps: true }
);

// ── Index géospatial ─────────────────────────────────
// Obligatoire pour les requêtes $near / $geoWithin sur les coordonnées.
demandeSchema.index({ location: "2dsphere" });

// ── Index composés fréquents ─────────────────────────
// Prestataire cherchant les demandes actives pour son métier, triées par distance
demandeSchema.index({ metier: 1, statut: 1 });
// Admin : toutes les demandes d'un client
demandeSchema.index({ client: 1, statut: 1 });

// ── Hook pre-save : calcul automatique de expireAt ───
// expireAt = createdAt + 48h (uniquement à la création, jamais recalculé)
demandeSchema.pre("save", function (next) {
  if (this.isNew) {
    const now = this.createdAt || new Date();
    this.expireAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  }
  next();
});

// ── Méthode virtuelle : demande encore valide ? ───────
demandeSchema.virtual("isExpired").get(function () {
  return this.expireAt && new Date() > this.expireAt;
});

const Demande = mongoose.model("Demande", demandeSchema);
export default Demande;