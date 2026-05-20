// backend/models/FavoriModel.js
import mongoose from "mongoose";

const favoriSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    prestataire: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Un user ne peut mettre un prestataire en favori qu'une seule fois
favoriSchema.index({ user: 1, prestataire: 1 }, { unique: true });

const Favori = mongoose.model("Favori", favoriSchema);
export default Favori;