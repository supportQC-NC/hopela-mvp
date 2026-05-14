

// backend/data/users.js
const users = [
  // ── ADMINS ──────────────────────────────────────
  { email: "super_admin@hopela.pro", password: "SuperAdmin123!", nom: "Techer",  prenom: "Naël",  role: "admin", isActive: true, isValidated: true },
  { email: "admin2@hopela.pro",      password: "Admin456!",      nom: "Katrawi", prenom: "Sonia", role: "admin", isActive: true, isValidated: true },

  // ── USERS ────────────────────────────────────────
  { email: "user1@hopela.pro", password: "User123!", nom: "Martin",   prenom: "Julie",     role: "user", isActive: true,  isValidated: true },
  { email: "user2@hopela.pro", password: "User123!", nom: "Bernaud",  prenom: "Thomas",    role: "user", isActive: true,  isValidated: true },
  { email: "user3@hopela.pro", password: "User123!", nom: "Lefevre",  prenom: "Claire",    role: "user", isActive: true,  isValidated: true },
  { email: "user4@hopela.pro", password: "User123!", nom: "Wapotro",  prenom: "Samuel",    role: "user", isActive: true,  isValidated: true },
  { email: "user5@hopela.pro", password: "User123!", nom: "Gopoea",   prenom: "Angélique", role: "user", isActive: false, isValidated: true },

  // ── PRESTATAIRES ─────────────────────────────────
  // telephoneContact obligatoire, ridet obligatoire, isValidated: true pour le seeder
  {
    email: "presta.centre@hopela.pro", password: "Presta123!",
    nom: "Kalouma", prenom: "Rémi", role: "prestataire",
    metierNom: "Électricien",
    telephoneContact: "+687 74 12 34", emailContact: "remi.kalouma@email.nc",
    ridet: "0123456-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.4572, -22.2758], updatedAt: new Date() },
  },
  {
    email: "presta.vallee@hopela.pro", password: "Presta123!",
    nom: "Trulès", prenom: "Nathalie", role: "prestataire",
    metierNom: "Plombier",
    telephoneContact: "+687 75 23 45", emailContact: "nathalie.trules@email.nc",
    ridet: "0234567-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.443, -22.269], updatedAt: new Date() },
  },
  {
    email: "presta.orphelinat@hopela.pro", password: "Presta123!",
    nom: "Naouma", prenom: "Kevin", role: "prestataire",
    metierNom: "Menuisier",
    telephoneContact: "+687 76 34 56", emailContact: null,
    ridet: "0345678-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.428, -22.282], updatedAt: new Date() },
  },
  {
    email: "presta.ansevata@hopela.pro", password: "Presta123!",
    nom: "Pelletier", prenom: "Laura", role: "prestataire",
    metierNom: "Peintre",
    telephoneContact: "+687 77 45 67", emailContact: null,
    ridet: "0456789-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.468, -22.297], updatedAt: new Date() },
  },
  {
    email: "presta.magenta@hopela.pro", password: "Presta123!",
    nom: "Uregei", prenom: "Francis", role: "prestataire",
    metierNom: "Jardinier",
    telephoneContact: "+687 78 56 78", emailContact: "francis.uregei@email.nc",
    ridet: "0567890-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.472, -22.261], updatedAt: new Date() },
  },
  {
    email: "presta.dumbea@hopela.pro", password: "Presta123!",
    nom: "Waheo", prenom: "Pierre", role: "prestataire",
    metierNom: "Climatisation",
    telephoneContact: "+687 79 67 89", emailContact: null,
    ridet: "0678901-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.458, -22.154], updatedAt: new Date() },
  },
  {
    email: "presta.dumbeasurmer@hopela.pro", password: "Presta123!",
    nom: "Boiguivalu", prenom: "Isabelle", role: "prestataire",
    metierNom: "Femme de ménage",
    telephoneContact: "+687 80 78 90", emailContact: null,
    ridet: "0789012-001", isActive: true, isValidated: true, isTracked: false,
    location: { type: "Point", coordinates: [166.398, -22.178], updatedAt: new Date() },
  },
  {
    email: "presta.paita@hopela.pro", password: "Presta123!",
    nom: "Oueloa", prenom: "Christophe", role: "prestataire",
    metierNom: "Maçon",
    telephoneContact: "+687 81 89 01", emailContact: null,
    ridet: "0890123-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.362, -22.105], updatedAt: new Date() },
  },
  {
    email: "presta.montdore@hopela.pro", password: "Presta123!",
    nom: "Djaoui", prenom: "Yasmine", role: "prestataire",
    metierNom: "Photographe",
    telephoneContact: "+687 82 90 12", emailContact: "yasmine.djaoui@email.nc",
    ridet: "0901234-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.553, -22.274], updatedAt: new Date() },
  },
  {
    email: "presta.plum@hopela.pro", password: "Presta123!",
    nom: "Mapou", prenom: "Henri", role: "prestataire",
    metierNom: "Carreleur",
    telephoneContact: "+687 83 01 23", emailContact: null,
    ridet: "1012345-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.585, -22.31], updatedAt: new Date() },
  },
  {
    email: "presta.rivieresalee@hopela.pro", password: "Presta123!",
    nom: "Eurisouke", prenom: "Martine", role: "prestataire",
    metierNom: "Garde d'enfants",
    telephoneContact: "+687 84 12 34", emailContact: null,
    ridet: "1123456-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.51, -22.238], updatedAt: new Date() },
  },
  {
    email: "presta.nouville@hopela.pro", password: "Presta123!",
    nom: "Tein", prenom: "Alexandre", role: "prestataire",
    metierNom: "Informaticien",
    telephoneContact: "+687 85 23 45", emailContact: null,
    ridet: "1234567-001", isActive: false, isValidated: false, isTracked: false,
    location: { type: "Point", coordinates: [166.412, -22.26], updatedAt: new Date() },
  },
  {
    email: "presta.portmoselle@hopela.pro", password: "Presta123!",
    nom: "Leblanc", prenom: "Camille", role: "prestataire",
    metierNom: "Coursier",
    telephoneContact: "+687 86 34 56", emailContact: "camille.leblanc@email.nc",
    ridet: "1345678-001", isActive: true, isValidated: true, isTracked: true,
    location: { type: "Point", coordinates: [166.449, -22.27], updatedAt: new Date() },
  },
];

export default users;