// backend/data/services.js
// Le champ prestatireEmail est utilisé par le seeder pour lier l'ObjectId du prestataire.
// Pas de prix — conformément au modèle ServiceModel.js

const services = [

  // ── Électricien (presta.centre) ──────────────────
  {
    prestataireEmail: "presta.centre@hopela.pro",
    nom: "Installation tableau électrique",
    description: "Remplacement ou installation complète d'un tableau électrique aux normes NF C 15-100.",
    duree: 240,
    isActive: true,
  },
  {
    prestataireEmail: "presta.centre@hopela.pro",
    nom: "Dépannage électrique",
    description: "Diagnostic et réparation de pannes électriques en urgence.",
    duree: 60,
    isActive: true,
  },
  {
    prestataireEmail: "presta.centre@hopela.pro",
    nom: "Pose de prises et interrupteurs",
    description: "Installation ou remplacement de prises électriques et interrupteurs.",
    duree: 45,
    isActive: true,
  },

  // ── Plombier (presta.vallee) ─────────────────────
  {
    prestataireEmail: "presta.vallee@hopela.pro",
    nom: "Débouchage canalisation",
    description: "Débouchage manuel ou à haute pression de canalisations bouchées.",
    duree: 60,
    isActive: true,
  },
  {
    prestataireEmail: "presta.vallee@hopela.pro",
    nom: "Installation robinetterie",
    description: "Pose et remplacement de robinets, mitigeurs et accessoires sanitaires.",
    duree: 90,
    isActive: true,
  },
  {
    prestataireEmail: "presta.vallee@hopela.pro",
    nom: "Détection et réparation de fuite",
    description: "Localisation et réparation de fuites d'eau visibles ou cachées.",
    duree: 120,
    isActive: true,
  },

  // ── Menuisier (presta.orphelinat) ────────────────
  {
    prestataireEmail: "presta.orphelinat@hopela.pro",
    nom: "Pose de parquet",
    description: "Pose de parquet flottant ou collé sur tout type de surface.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.orphelinat@hopela.pro",
    nom: "Fabrication meuble sur mesure",
    description: "Conception et fabrication de meubles en bois sur mesure selon vos besoins.",
    duree: null,
    isActive: true,
  },
  {
    prestataireEmail: "presta.orphelinat@hopela.pro",
    nom: "Réparation porte et fenêtre",
    description: "Remise en état, réglage et réparation de portes et fenêtres en bois.",
    duree: 90,
    isActive: true,
  },

  // ── Peintre (presta.ansevata) ────────────────────
  {
    prestataireEmail: "presta.ansevata@hopela.pro",
    nom: "Peinture intérieure",
    description: "Application de peinture sur murs et plafonds, préparation des surfaces incluse.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.ansevata@hopela.pro",
    nom: "Peinture extérieure",
    description: "Ravalement et peinture de façades, protection contre les intempéries.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.ansevata@hopela.pro",
    nom: "Pose de papier peint",
    description: "Pose de papier peint toutes surfaces, enlèvement de l'ancien revêtement inclus.",
    duree: 240,
    isActive: false,
  },

  // ── Jardinier (presta.magenta) ───────────────────
  {
    prestataireEmail: "presta.magenta@hopela.pro",
    nom: "Tonte et débroussaillage",
    description: "Tonte de pelouse, débroussaillage et ramassage des déchets verts.",
    duree: 120,
    isActive: true,
  },
  {
    prestataireEmail: "presta.magenta@hopela.pro",
    nom: "Taille de haies et arbustes",
    description: "Taille soignée de haies, arbustes et arbres fruitiers.",
    duree: 180,
    isActive: true,
  },
  {
    prestataireEmail: "presta.magenta@hopela.pro",
    nom: "Création massif fleuri",
    description: "Conception et plantation de massifs fleuris selon la saison.",
    duree: 240,
    isActive: true,
  },

  // ── Climatisation (presta.dumbea) ────────────────
  {
    prestataireEmail: "presta.dumbea@hopela.pro",
    nom: "Installation climatiseur split",
    description: "Installation complète d'un système split mural, câblage et mise en service inclus.",
    duree: 180,
    isActive: true,
  },
  {
    prestataireEmail: "presta.dumbea@hopela.pro",
    nom: "Entretien annuel climatisation",
    description: "Nettoyage des filtres, contrôle du gaz et vérification du bon fonctionnement.",
    duree: 60,
    isActive: true,
  },

  // ── Femme de ménage (presta.dumbeasurmer) ────────
  {
    prestataireEmail: "presta.dumbeasurmer@hopela.pro",
    nom: "Ménage régulier",
    description: "Nettoyage hebdomadaire ou bihebdomadaire de votre domicile.",
    duree: 120,
    isActive: true,
  },
  {
    prestataireEmail: "presta.dumbeasurmer@hopela.pro",
    nom: "Grand ménage de printemps",
    description: "Nettoyage complet et en profondeur de toute la maison.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.dumbeasurmer@hopela.pro",
    nom: "Repassage à domicile",
    description: "Service de repassage de vêtements et linge de maison à domicile.",
    duree: 120,
    isActive: false,
  },

  // ── Maçon (presta.paita) ─────────────────────────
  {
    prestataireEmail: "presta.paita@hopela.pro",
    nom: "Construction muret",
    description: "Construction de murets en parpaing, brique ou pierre.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.paita@hopela.pro",
    nom: "Ragréage et chape",
    description: "Réalisation de chape ou ragréage pour préparer un sol avant revêtement.",
    duree: 240,
    isActive: true,
  },

  // ── Photographe (presta.montdore) ────────────────
  {
    prestataireEmail: "presta.montdore@hopela.pro",
    nom: "Reportage événementiel",
    description: "Couverture photo complète de votre événement (mariage, anniversaire, soirée).",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.montdore@hopela.pro",
    nom: "Séance portrait",
    description: "Séance photo portrait en studio ou en extérieur, retouches incluses.",
    duree: 90,
    isActive: true,
  },
  {
    prestataireEmail: "presta.montdore@hopela.pro",
    nom: "Photo immobilière",
    description: "Photographies professionnelles de biens immobiliers pour vente ou location.",
    duree: 120,
    isActive: true,
  },

  // ── Carreleur (presta.plum) ──────────────────────
  {
    prestataireEmail: "presta.plum@hopela.pro",
    nom: "Pose carrelage sol",
    description: "Pose de carrelage au sol avec préparation du support et joints.",
    duree: 480,
    isActive: true,
  },
  {
    prestataireEmail: "presta.plum@hopela.pro",
    nom: "Pose faïence murale",
    description: "Pose de faïence sur murs de salle de bain ou cuisine.",
    duree: 300,
    isActive: true,
  },

  // ── Garde d'enfants (presta.rivieresalee) ────────
  {
    prestataireEmail: "presta.rivieresalee@hopela.pro",
    nom: "Baby-sitting ponctuel",
    description: "Garde d'enfants à domicile pour une soirée ou une demi-journée.",
    duree: 180,
    isActive: true,
  },
  {
    prestataireEmail: "presta.rivieresalee@hopela.pro",
    nom: "Garde régulière périscolaire",
    description: "Récupération à l'école et garde jusqu'au retour des parents en semaine.",
    duree: 120,
    isActive: true,
  },
  {
    prestataireEmail: "presta.rivieresalee@hopela.pro",
    nom: "Aide aux devoirs",
    description: "Accompagnement scolaire et aide aux devoirs pour enfants de 6 à 14 ans.",
    duree: 60,
    isActive: true,
  },

  // ── Coursier (presta.portmoselle) ────────────────
  {
    prestataireEmail: "presta.portmoselle@hopela.pro",
    nom: "Livraison express",
    description: "Livraison de colis ou documents en moins de 2h dans Nouméa.",
    duree: 60,
    isActive: true,
  },
  {
    prestataireEmail: "presta.portmoselle@hopela.pro",
    nom: "Courses à domicile",
    description: "Réalisation de vos courses alimentaires et livraison à domicile.",
    duree: 90,
    isActive: true,
  },
];

export default services;