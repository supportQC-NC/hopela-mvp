// backend/data/demandes.js
// Les champs `clientEmail`, `metierNom` et `categorieNom` sont résolus par le seeder.
// Ils ne sont PAS insérés en base — le seeder les retire et injecte les ObjectId.
//
// expireAt est calculé automatiquement par le hook pre-save de DemandeModel :
//   expireAt = createdAt + 48h
//   → Pour les besoins du seed, certaines demandes sont déjà "expirées" ou "clôturées"
//     afin d'avoir des données variées pour tester les filtres admin.
//
// Les coordonnées sont situées dans la zone de Nouméa / Grand Nouméa (NC).
// Convention GeoJSON : [longitude, latitude]
//
// ⚠️  Les categorieNom DOIVENT correspondre EXACTEMENT aux noms dans data/categories.js :
//   "Urgence & dépannage"
//   "Services à domicile — récurrents"
//   "Beauté & bien-être à domicile"
//   "Sport, santé & para-médical"
//   "Services aux personnes à mobilité réduite"
//   "Transport & mobilité"
//   "Enseignement & coaching mobile"

const demandes = [

  // ── user1 — Julie Martin ─────────────────────────────────────────────────────
  {
    clientEmail:      "user1@hopela.pro",
    description:      "Robinet de la cuisine qui fuit depuis 3 jours, besoin d'une intervention rapide.",
    metierNom:        "Plombier",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 20 11 22",
    longitude:        166.448,
    latitude:         -22.271,
    adresse:          "Quartier Latin, Nouméa",
    statut:           "active",
  },
  {
    clientEmail:      "user1@hopela.pro",
    description:      "Prise électrique grillée dans le salon, besoin dépannage aujourd'hui si possible.",
    metierNom:        "Électricien dépannage",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 20 11 22",
    longitude:        166.449,
    latitude:         -22.272,
    adresse:          "Quartier Latin, Nouméa",
    statut:           "active",
  },

  // ── user2 — Thomas Bernaud ───────────────────────────────────────────────────
  {
    clientEmail:      "user2@hopela.pro",
    description:      "Cherche jardinier pour tonte pelouse et taille haie, jardin 200m². Dispo week-end.",
    metierNom:        "Jardinier paysagiste",
    categorieNom:     "Services à domicile — récurrents",
    telephoneContact: "+687 30 22 33",
    longitude:        166.461,
    latitude:         -22.258,
    adresse:          "Magenta, Nouméa",
    statut:           "active",
  },
  {
    clientEmail:      "user2@hopela.pro",
    description:      "Clim split cassée, plus de froid. Technicien dispo rapidement ?",
    metierNom:        "Technicien climatisation",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 30 22 33",
    longitude:        166.462,
    latitude:         -22.259,
    adresse:          "Magenta, Nouméa",
    statut:           "cloturee",
  },

  // ── user3 — Claire Lefevre ───────────────────────────────────────────────────
  {
    clientEmail:      "user3@hopela.pro",
    description:      "Besoin agent entretien pour nettoyage complet appartement 3 pièces suite déménagement.",
    metierNom:        "Agent d'entretien",
    categorieNom:     "Services à domicile — récurrents",
    telephoneContact: "+687 40 33 44",
    longitude:        166.432,
    latitude:         -22.284,
    adresse:          "Orphelinat, Nouméa",
    statut:           "active",
  },
  {
    clientEmail:      "user3@hopela.pro",
    description:      "Serrure d'entrée bloquée, clé coincée. Besoin serrurier URGENT.",
    metierNom:        "Serrurier",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 40 33 44",
    longitude:        166.433,
    latitude:         -22.283,
    adresse:          "Orphelinat, Nouméa",
    statut:           "expiree",
  },

  // ── user4 — Samuel Wapotro ───────────────────────────────────────────────────
  {
    clientEmail:      "user4@hopela.pro",
    description:      "Recherche coach sportif pour remise en forme, 3 séances/semaine à domicile.",
    metierNom:        "Coach sportif",
    // ✅ Corrigé : "Bien-être & santé" n'existe pas — le vrai nom est "Sport, santé & para-médical"
    categorieNom:     "Sport, santé & para-médical",
    telephoneContact: "+687 50 44 55",
    longitude:        166.583,
    latitude:         -22.308,
    adresse:          "Plum, Nouméa",
    statut:           "active",
  },
  {
    clientEmail:      "user4@hopela.pro",
    description:      "Lave-linge en panne, ne prend plus l'eau. Réparateur électroménager dispo ?",
    metierNom:        "Réparateur électroménager",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 50 44 55",
    longitude:        166.584,
    latitude:         -22.309,
    adresse:          "Plum, Nouméa",
    statut:           "annulee",
  },

  // ── user5 — Angélique Gopoea ─────────────────────────────────────────────────
  // (isActive: false côté user — les demandes restent visibles en admin pour les tests)
  {
    clientEmail:      "user5@hopela.pro",
    description:      "Vitres fissurées après coup de vent, remplacement urgent double vitrage.",
    metierNom:        "Vitrier",
    categorieNom:     "Urgence & dépannage",
    telephoneContact: "+687 60 55 66",
    longitude:        166.471,
    latitude:         -22.263,
    adresse:          "Rivière Salée, Nouméa",
    statut:           "active",
  },
];

export default demandes;