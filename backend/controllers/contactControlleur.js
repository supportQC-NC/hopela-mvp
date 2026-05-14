// backend/controllers/contactControlleur.js
import asyncHandler from "../middleware/asyncHandler.js";
import Contact from "../models/ContactModel.js";
import sendEmail from "../utils/sendEmail.js";
import generateContactEmail      from "../emails/templates/contactEmail.js";
import generateContactReplyEmail from "../emails/templates/contactReplyEmail.js";

// @desc    Envoyer un message de contact (public)
// @route   POST /api/contact
// @access  Public
const createContact = asyncHandler(async (req, res) => {
  const { nom, email, sujet, message } = req.body;

  if (!nom || !email || !sujet || !message) {
    res.status(400);
    throw new Error("Tous les champs sont requis");
  }

  const contact = await Contact.create({ nom, email, sujet, message });

  // Accusé de réception au visiteur
  try {
    await sendEmail({
      email,
      subject: "✦ Votre message a bien été reçu — Hopela",
      html: generateContactEmail({ nom, sujet, message }),
    });
  } catch (e) { console.error("Email accusé réception:", e.message); }

  // Notification aux admins (email configuré dans .env)
  try {
    const adminEmail = process.env.SMTP_USER;
    if (adminEmail) {
      await sendEmail({
        email: adminEmail,
        subject: `📬 Nouveau message de contact — ${sujet}`,
        html: `<p>Nouveau message de <strong>${nom}</strong> (${email})</p><p><strong>Sujet :</strong> ${sujet}</p><p><strong>Message :</strong></p><p style="white-space:pre-wrap">${message}</p><p>→ Répondre depuis l'interface admin.</p>`,
      });
    }
  } catch (e) { console.error("Email notif admin:", e.message); }

  res.status(201).json({
    message: "Votre message a bien été envoyé. Vous recevrez une réponse par email.",
    id: contact._id,
  });
});

// @desc    Récupérer tous les messages (admin)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = asyncHandler(async (req, res) => {
  const { statut } = req.query;
  const filter = statut && statut !== "tous" ? { statut } : {};
  const contacts = await Contact.find(filter)
    .populate("reponduPar", "prenom nom")
    .sort({ createdAt: -1 });
  res.json(contacts);
});

// @desc    Récupérer un message (admin)
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id).populate("reponduPar", "prenom nom");
  if (!contact) { res.status(404); throw new Error("Message non trouvé"); }
  res.json(contact);
});

// @desc    Changer le statut (lu, traite, archive)
// @route   PATCH /api/contact/:id/statut
// @access  Private/Admin
const updateStatut = asyncHandler(async (req, res) => {
  const { statut } = req.body;
  const allowed = ["nouveau", "lu", "traite", "archive"];
  if (!allowed.includes(statut)) { res.status(400); throw new Error("Statut invalide"); }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { statut },
    { returnDocument: "after" }
  );
  if (!contact) { res.status(404); throw new Error("Message non trouvé"); }
  res.json(contact);
});

// @desc    Répondre à un message et envoyer l'email
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
const replyContact = asyncHandler(async (req, res) => {
  const { reponse } = req.body;
  if (!reponse?.trim()) { res.status(400); throw new Error("La réponse ne peut pas être vide"); }

  const contact = await Contact.findById(req.params.id);
  if (!contact) { res.status(404); throw new Error("Message non trouvé"); }

  // Sauvegarder la réponse
  contact.reponse    = reponse;
  contact.reponduPar = req.user._id;
  contact.reponduLe  = new Date();
  contact.statut     = "traite";
  await contact.save();

  // Envoyer l'email de réponse au visiteur
  try {
    await sendEmail({
      email: contact.email,
      subject: `Re: ${contact.sujet} — Hopela`,
      html: generateContactReplyEmail({
        nom:             contact.nom,
        sujetOriginal:   contact.sujet,
        messageOriginal: contact.message,
        reponse,
        adminPrenom:     req.user.prenom || "L'équipe",
      }),
    });
  } catch (e) { console.error("Email réponse:", e.message); }

  res.json({ message: "Réponse envoyée avec succès", contact });
});

// @desc    Supprimer un message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) { res.status(404); throw new Error("Message non trouvé"); }
  res.json({ message: "Message supprimé" });
});

export { createContact, getContacts, getContactById, updateStatut, replyContact, deleteContact };