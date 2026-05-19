// backend/controllers/demandeControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Demande      from "../models/DemandeModel.js";
import User         from "../models/UserModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Passe automatiquement en "expiree" les demandes actives dont expireAt est dépassé.
const expireDemandes = async () => {
  await Demande.updateMany(
    { statut: "active", expireAt: { $lt: new Date() } },
    { $set: { statut: "expiree" } }
  );
};

// Populate de base renvoyé dans toutes les listes
const populateBase = (query) =>
  query
    .populate("client",    "nom prenom email telephoneContact")
    .populate("categorie", "nom icone")
    .populate("metier",    "nom icone");

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — CRÉER UNE DEMANDE
// POST /api/demandes
// Accès : user connecté (role "user" uniquement)
// ─────────────────────────────────────────────────────────────────────────────
export const creerDemande = asyncHandler(async (req, res) => {
  const {
    description,
    categorie,
    metier,
    telephoneContact,
    longitude,
    latitude,
    adresse,
  } = req.body;

  // ── Validation rôle ──────────────────────────────────
  if (req.user.role !== "user") {
    res.status(403);
    throw new Error("Seuls les clients peuvent publier une demande de besoin");
  }

  // ── Champs obligatoires ──────────────────────────────
  if (!description?.trim()) {
    res.status(400);
    throw new Error("La description est requise");
  }

  if (!metier) {
    res.status(400);
    throw new Error("Le métier est requis");
  }

  if (!telephoneContact?.trim()) {
    res.status(400);
    throw new Error("Le numéro de téléphone est requis");
  }

  // ── Validation coordonnées ───────────────────────────
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);

  if (isNaN(lng) || isNaN(lat)) {
    res.status(400);
    throw new Error("Les coordonnées (longitude, latitude) sont invalides");
  }

  // ── Limite : max 5 demandes actives simultanées ──────
  const nbActives = await Demande.countDocuments({
    client:   req.user._id,
    statut:   "active",
    expireAt: { $gt: new Date() },
  });

  if (nbActives >= 5) {
    res.status(400);
    throw new Error(
      "Vous avez atteint la limite de 5 demandes actives simultanées. " +
      "Attendez l'expiration ou annulez une demande existante."
    );
  }

  // ── Création ─────────────────────────────────────────
  // categorie est null si non fournie (champ optionnel dans le schéma)
  const payload = {
    client:           req.user._id,
    description:      description.trim(),
    metier,
    telephoneContact: telephoneContact.trim(),
    location: {
      type:        "Point",
      coordinates: [lng, lat],
      adresse:     adresse?.trim() || null,
    },
    // expireAt calculé par le hook pre-save async
  };

  // N'injecte categorie que si elle est fournie et non vide
  if (categorie && categorie !== "") {
    payload.categorie = categorie;
  }

  const demande = await Demande.create(payload);

  // Populate avant réponse
  const populated = await populateBase(Demande.findById(demande._id));

  res.status(201).json(populated);
});

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — LISTER SES PROPRES DEMANDES
// GET /api/demandes/mes-demandes
// Accès : user connecté
// ─────────────────────────────────────────────────────────────────────────────
export const getMesDemandes = asyncHandler(async (req, res) => {
  await expireDemandes();

  const demandes = await populateBase(
    Demande.find({ client: req.user._id }).sort({ createdAt: -1 })
  );

  res.json(demandes);
});

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — ANNULER UNE DEMANDE
// PATCH /api/demandes/:id/annuler
// Accès : user connecté, propriétaire de la demande
// ─────────────────────────────────────────────────────────────────────────────
export const annulerDemande = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id);

  if (!demande) {
    res.status(404);
    throw new Error("Demande introuvable");
  }

  if (demande.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé : cette demande ne vous appartient pas");
  }

  if (demande.statut !== "active") {
    res.status(400);
    throw new Error(`Impossible d'annuler une demande au statut "${demande.statut}"`);
  }

  demande.statut = "annulee";
  await demande.save();

  res.json({ message: "Demande annulée avec succès", demande });
});

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — CLÔTURER UNE DEMANDE
// PATCH /api/demandes/:id/cloturer
// Accès : user connecté, propriétaire de la demande
// ─────────────────────────────────────────────────────────────────────────────
export const cloturerDemande = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id);

  if (!demande) {
    res.status(404);
    throw new Error("Demande introuvable");
  }

  if (demande.client.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Non autorisé : cette demande ne vous appartient pas");
  }

  if (demande.statut !== "active") {
    res.status(400);
    throw new Error(`Impossible de clôturer une demande au statut "${demande.statut}"`);
  }

  demande.statut = "cloturee";
  await demande.save();

  res.json({ message: "Demande clôturée avec succès", demande });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRESTATAIRE — LISTE TRIÉE PAR DISTANCE
// GET /api/demandes/prestataire/liste
// Accès : prestataire connecté et validé
// ─────────────────────────────────────────────────────────────────────────────
export const getDemandesPrestataire = asyncHandler(async (req, res) => {
  await expireDemandes();

  if (req.user.role !== "prestataire") {
    res.status(403);
    throw new Error("Accès réservé aux prestataires");
  }

  if (!req.user.isValidated) {
    res.status(403);
    throw new Error("Votre compte n'est pas encore validé");
  }

  const metierIds = req.user.metiers;

  if (!metierIds || metierIds.length === 0) {
    return res.json([]);
  }

  const [lng, lat] = req.user.location?.coordinates || [0, 0];
  const hasPosition = lng !== 0 || lat !== 0;

  let demandes;

  if (hasPosition) {
    demandes = await Demande.aggregate([
      {
        $geoNear: {
          near:          { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMetres",
          spherical:     true,
          query: {
            metier:   { $in: metierIds },
            statut:   "active",
            expireAt: { $gt: new Date() },
          },
        },
      },
      {
        $lookup: {
          from:         "users",
          localField:   "client",
          foreignField: "_id",
          as:           "client",
        },
      },
      { $unwind: "$client" },
      {
        $lookup: {
          from:         "categories",
          localField:   "categorie",
          foreignField: "_id",
          as:           "categorie",
        },
      },
      // unwind avec preserveNullAndEmptyArrays car categorie est optionnelle
      { $unwind: { path: "$categorie", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from:         "metiers",
          localField:   "metier",
          foreignField: "_id",
          as:           "metier",
        },
      },
      { $unwind: "$metier" },
      {
        $project: {
          description:       1,
          telephoneContact:  1,
          location:          1,
          statut:            1,
          expireAt:          1,
          createdAt:         1,
          distanceMetres:    1,
          "client._id":      1,
          "client.nom":      1,
          "client.prenom":   1,
          "categorie._id":   1,
          "categorie.nom":   1,
          "categorie.icone": 1,
          "metier._id":      1,
          "metier.nom":      1,
          "metier.icone":    1,
        },
      },
    ]);
  } else {
    // Pas de position — tri chronologique
    demandes = await populateBase(
      Demande.find({
        metier:   { $in: metierIds },
        statut:   "active",
        expireAt: { $gt: new Date() },
      }).sort({ createdAt: -1 })
    );
  }

  res.json(demandes);
});

// ─────────────────────────────────────────────────────────────────────────────
// PRESTATAIRE — MARQUEURS CARTE
// GET /api/demandes/prestataire/carte
// ─────────────────────────────────────────────────────────────────────────────
export const getDemandesCarte = asyncHandler(async (req, res) => {
  await expireDemandes();

  if (req.user.role !== "prestataire") {
    res.status(403);
    throw new Error("Accès réservé aux prestataires");
  }

  if (!req.user.isValidated) {
    res.status(403);
    throw new Error("Votre compte n'est pas encore validé");
  }

  const metierIds = req.user.metiers;

  if (!metierIds || metierIds.length === 0) {
    return res.json([]);
  }

  const demandes = await Demande.find(
    {
      metier:   { $in: metierIds },
      statut:   "active",
      expireAt: { $gt: new Date() },
    },
    { location: 1, description: 1, expireAt: 1, metier: 1, categorie: 1 }
  )
    .populate("metier",    "nom icone")
    .populate("categorie", "nom icone");

  res.json(demandes);
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — TOUTES LES DEMANDES
// GET /api/demandes/admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllDemandesAdmin = asyncHandler(async (req, res) => {
  await expireDemandes();

  const {
    statut,
    metier,
    categorie,
    client,
    page  = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (statut)    filter.statut    = statut;
  if (metier)    filter.metier    = metier;
  if (categorie) filter.categorie = categorie;
  if (client)    filter.client    = client;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Demande.countDocuments(filter);

  const demandes = await populateBase(
    Demande.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
  );

  res.json({
    total,
    page:       parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    demandes,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — SUPPRIMER UNE DEMANDE
// DELETE /api/demandes/admin/:id
// ─────────────────────────────────────────────────────────────────────────────
export const supprimerDemandeAdmin = asyncHandler(async (req, res) => {
  const demande = await Demande.findById(req.params.id);

  if (!demande) {
    res.status(404);
    throw new Error("Demande introuvable");
  }

  await demande.deleteOne();

  res.json({ message: "Demande supprimée avec succès" });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — MODIFIER LE STATUT
// PATCH /api/demandes/admin/:id/statut
// ─────────────────────────────────────────────────────────────────────────────
export const modifierStatutAdmin = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  const statutsValides = ["active", "expiree", "annulee", "cloturee"];

  if (!statutsValides.includes(statut)) {
    res.status(400);
    throw new Error(`Statut invalide. Valeurs acceptées : ${statutsValides.join(", ")}`);
  }

  const demande = await Demande.findById(req.params.id);

  if (!demande) {
    res.status(404);
    throw new Error("Demande introuvable");
  }

  demande.statut = statut;
  await demande.save();

  res.json({ message: "Statut mis à jour", demande });
});