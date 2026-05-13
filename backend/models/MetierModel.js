// backend/models/MetierModel.js
import mongoose from "mongoose";

const metierSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom du métier est requis"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    icone: {
      // Nom d'icône (ex: "wrench", "scissors") ou URL SVG
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// ⚠️  La suppression n'est autorisée que si aucun prestataire
//     ne référence ce métier — vérification faite dans le contrôleur.

const Metier = mongoose.model("Metier", metierSchema);
export default Metier;