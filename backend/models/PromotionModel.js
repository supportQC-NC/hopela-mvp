// backend/models/PromotionModel.js
import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    prestataire: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // ── Contenu ─────────────────────────────────────────
    titre: {
      type:      String,
      required:  [true, "Le titre est requis"],
      trim:      true,
      maxlength: [80, "80 caractères maximum"],
    },
    description: {
      type:      String,
      trim:      true,
      default:   null,
      maxlength: [500, "500 caractères maximum"],
    },

    // ── Badge / icône Lucide ─────────────────────────────
    // Valeurs possibles : "Tag" | "Star" | "Zap" | "Gift" | "Percent" | "Flame" | "Clock" | "BadgeCheck"
    badge: {
      type:    String,
      default: "Tag",
      enum:    ["Tag", "Star", "Zap", "Gift", "Percent", "Flame", "Clock", "BadgeCheck"],
    },

    // ── Galerie (max 3 images) ───────────────────────────
    images: {
      type:     [String],
      default:  [],
      validate: {
        validator: (arr) => arr.length <= 3,
        message:   "Maximum 3 images par promotion",
      },
    },

    // ── Dates de validité ────────────────────────────────
    dateDebut: { type: Date, default: null },
    dateFin:   { type: Date, default: null },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index pour requêtes publiques efficaces
promotionSchema.index({ prestataire: 1, isActive: 1, dateFin: 1 });

const Promotion = mongoose.model("Promotion", promotionSchema);
export default Promotion;