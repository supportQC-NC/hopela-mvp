// backend/models/ContactModel.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    nom:     { type: String, required: true, trim: true, maxlength: 100 },
    email:   { type: String, required: true, trim: true, lowercase: true },
    sujet:   { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },

    // Statut du message
    statut: {
      type: String,
      enum: ["nouveau", "lu", "traite", "archive"],
      default: "nouveau",
    },

    // Réponse de l'admin
    reponse:      { type: String, default: null },
    reponduPar:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reponduLe:    { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);