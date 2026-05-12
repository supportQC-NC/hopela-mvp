// backend/data/users.js
const users = [
  // ── ADMINS ──────────────────────────────────────
  {
    email: "super_admin@hopela.pro",
    password: "SuperAdmin123!",
    nom: "Dupont",
    prenom: "Mathieu",
    role: "admin",
    isActive: true,
  },
  {
    email: "admin2@hopela.pro",
    password: "Admin456!",
    nom: "Katrawi",
    prenom: "Sonia",
    role: "admin",
    isActive: true,
  },

  // ── USERS ────────────────────────────────────────
  {
    email: "user1@hopela.pro",
    password: "User123!",
    nom: "Martin",
    prenom: "Julie",
    role: "user",
    isActive: true,
  },
  {
    email: "user2@hopela.pro",
    password: "User123!",
    nom: "Bernaud",
    prenom: "Thomas",
    role: "user",
    isActive: true,
  },
  {
    email: "user3@hopela.pro",
    password: "User123!",
    nom: "Lefevre",
    prenom: "Claire",
    role: "user",
    isActive: true,
  },
  {
    email: "user4@hopela.pro",
    password: "User123!",
    nom: "Wapotro",
    prenom: "Samuel",
    role: "user",
    isActive: true,
  },
  {
    email: "user5@hopela.pro",
    password: "User123!",
    nom: "Gopoea",
    prenom: "Angélique",
    role: "user",
    isActive: false,
  },

  // ── PRESTATAIRES ─────────────────────────────────

  // Centre-ville Nouméa [166.4572, -22.2758]
  {
    email: "presta.centre@hopela.pro",
    password: "Presta123!",
    nom: "Kalouma",
    prenom: "Rémi",
    role: "prestataire",
    metier: "Électricien",
    note: 4.8,
    nbAvis: 34,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.4572, -22.2758], updatedAt: new Date() },
  },

  // Vallée du Tir [166.4430, -22.2690]
  {
    email: "presta.vallee@hopela.pro",
    password: "Presta123!",
    nom: "Trulès",
    prenom: "Nathalie",
    role: "prestataire",
    metier: "Plombier",
    note: 4.5,
    nbAvis: 21,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.443, -22.269], updatedAt: new Date() },
  },

  // Baie de l'Orphelinat [166.4280, -22.2820]
  {
    email: "presta.orphelinat@hopela.pro",
    password: "Presta123!",
    nom: "Naouma",
    prenom: "Kevin",
    role: "prestataire",
    metier: "Menuisier",
    note: 4.2,
    nbAvis: 17,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.428, -22.282], updatedAt: new Date() },
  },

  // Anse Vata [166.4680, -22.2970]
  {
    email: "presta.ansevata@hopela.pro",
    password: "Presta123!",
    nom: "Pelletier",
    prenom: "Laura",
    role: "prestataire",
    metier: "Peintre",
    note: 4.9,
    nbAvis: 52,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.468, -22.297], updatedAt: new Date() },
  },

  // Magenta [166.4720, -22.2610]
  {
    email: "presta.magenta@hopela.pro",
    password: "Presta123!",
    nom: "Uregei",
    prenom: "Francis",
    role: "prestataire",
    metier: "Jardinier",
    note: 4.6,
    nbAvis: 29,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.472, -22.261], updatedAt: new Date() },
  },

  // Dumbéa [166.4580, -22.1540]
  {
    email: "presta.dumbea@hopela.pro",
    password: "Presta123!",
    nom: "Waheo",
    prenom: "Pierre",
    role: "prestataire",
    metier: "Climatisation",
    note: 4.7,
    nbAvis: 41,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.458, -22.154], updatedAt: new Date() },
  },

  // Dumbéa-sur-Mer [166.3980, -22.1780]
  {
    email: "presta.dumbeasurmer@hopela.pro",
    password: "Presta123!",
    nom: "Boiguivalu",
    prenom: "Isabelle",
    role: "prestataire",
    metier: "Femme de ménage",
    note: 4.4,
    nbAvis: 63,
    isActive: true,
    isTracked: false,
    location: { type: "Point", coordinates: [166.398, -22.178], updatedAt: new Date() },
  },

  // Paita [166.3620, -22.1050]
  {
    email: "presta.paita@hopela.pro",
    password: "Presta123!",
    nom: "Oueloa",
    prenom: "Christophe",
    role: "prestataire",
    metier: "Maçon",
    note: 4.3,
    nbAvis: 18,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.362, -22.105], updatedAt: new Date() },
  },

  // Mont-Dore [166.5530, -22.2740]
  {
    email: "presta.montdore@hopela.pro",
    password: "Presta123!",
    nom: "Djaoui",
    prenom: "Yasmine",
    role: "prestataire",
    metier: "Photographe",
    note: 5.0,
    nbAvis: 87,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.553, -22.274], updatedAt: new Date() },
  },

  // Plum [166.5850, -22.3100]
  {
    email: "presta.plum@hopela.pro",
    password: "Presta123!",
    nom: "Mapou",
    prenom: "Henri",
    role: "prestataire",
    metier: "Carreleur",
    note: 4.1,
    nbAvis: 12,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.585, -22.31], updatedAt: new Date() },
  },

  // Rivière-Salée [166.5100, -22.2380]
  {
    email: "presta.rivieresalee@hopela.pro",
    password: "Presta123!",
    nom: "Eurisouke",
    prenom: "Martine",
    role: "prestataire",
    metier: "Garde d'enfants",
    note: 4.9,
    nbAvis: 44,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.51, -22.238], updatedAt: new Date() },
  },

  // Nouville [166.4120, -22.2600]
  {
    email: "presta.nouville@hopela.pro",
    password: "Presta123!",
    nom: "Tein",
    prenom: "Alexandre",
    role: "prestataire",
    metier: "Informaticien",
    note: 4.6,
    nbAvis: 9,
    isActive: false,
    isTracked: false,
    location: { type: "Point", coordinates: [166.412, -22.26], updatedAt: new Date() },
  },

  // Port Moselle [166.4490, -22.2700]
  {
    email: "presta.portmoselle@hopela.pro",
    password: "Presta123!",
    nom: "Leblanc",
    prenom: "Camille",
    role: "prestataire",
    metier: "Coursier",
    note: 4.7,
    nbAvis: 76,
    isActive: true,
    isTracked: true,
    location: { type: "Point", coordinates: [166.449, -22.27], updatedAt: new Date() },
  },
];

export default users;