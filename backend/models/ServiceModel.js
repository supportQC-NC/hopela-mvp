// backend/models/ServiceModel.js
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    prestataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le prestataire est requis"],
      index: true,
    },
    nom: {
      type: String,
      required: [true, "Le nom du service est requis"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    // Durée estimée en minutes (ex: 60 = 1h, 120 = 2h)
    duree: {
      type: Number,
      min: [0, "La durée ne peut pas être négative"],
      default: null,
    },
    // Chemin relatif vers l'image (ex: /uploads/services/xxx.jpg)
    image: {
      type: String,
      default: null,
    },
    // Le prestataire peut activer ou désactiver ses propres services
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Index composé pour récupérer rapidement les services d'un prestataire
serviceSchema.index({ prestataire: 1, isActive: 1 });

const Service = mongoose.model("Service", serviceSchema);
export default Service;