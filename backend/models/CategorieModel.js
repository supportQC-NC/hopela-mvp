// backend/models/CategorieModel.js
import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema(
  {
    nom: {
      type:     String,
      required: [true, "Le nom de la catégorie est requis"],
      unique:   true,
      trim:     true,
    },
    description: {
      type:    String,
      trim:    true,
      default: null,
    },
    icone: {
      // Nom d'icône Lucide (ex: "wrench", "heart-pulse") ou emoji
      type:    String,
      trim:    true,
      default: null,
    },
    ordre: {
      // Permet de contrôler l'ordre d'affichage côté front
      type:    Number,
      default: 0,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    createdBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ⚠️  La suppression n'est autorisée que si aucun métier
//     ne référence cette catégorie — vérification faite dans le contrôleur.

const Categorie = mongoose.model("Categorie", categorieSchema);
export default Categorie;