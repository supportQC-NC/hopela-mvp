// backend/data/categories.js

const categories = [
  {
    nom:         "Urgence & dépannage",
    description: "Les interventions non planifiées, souvent à toute heure.",
    icone:       "wrench",
    ordre:       1,
    isActive:    true,
  },
  {
    nom:         "Services à domicile — récurrents",
    description: "Prestataires qui ont fait de la mobilité leur modèle.",
    icone:       "home",
    ordre:       2,
    isActive:    true,
  },
  {
    nom:         "Beauté & bien-être à domicile",
    description: "Secteur en forte croissance, 100% mobile par choix.",
    icone:       "sparkles",
    ordre:       3,
    isActive:    true,
  },
  {
    nom:         "Sport, santé & para-médical",
    description: "Le mobile comme réponse à l'accessibilité.",
    icone:       "heart-pulse",
    ordre:       4,
    isActive:    true,
  },
  {
    nom:         "Services aux personnes à mobilité réduite",
    description: "Axe stratégique fort — client qui ne peut pas se déplacer.",
    icone:       "accessibility",
    ordre:       5,
    isActive:    true,
  },
  {
    nom:         "Transport & mobilité",
    description: "Chauffeurs, livreurs et transporteurs à la demande.",
    icone:       "car",
    ordre:       6,
    isActive:    true,
  },
  {
    nom:         "Enseignement & coaching mobile",
    description: "Formation, coaching et services créatifs à domicile.",
    icone:       "book-open",
    ordre:       7,
    isActive:    true,
  },
];

export default categories;