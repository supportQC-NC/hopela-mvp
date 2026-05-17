import { Zap, Shield, Users } from "lucide-react";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AVANTAGES = [
  {
    icon: Zap,
    titre: "Disponibilité immédiate",
    desc: "Trouvez un prestataire disponible maintenant grâce à la géolocalisation en direct.",
    accent: "#145C45",
  },
  {
    icon: Shield,
    titre: "Prestataires vérifiés",
    desc: "Identité et qualifications contrôlées pour une tranquillité d'esprit totale.",
    accent: "#1A2D4A",
  },
  {
    icon: Users,
    titre: "Communauté locale",
    desc: "Soutenez l'économie locale en faisant appel à des talents de Nouvelle-Calédonie.",
    accent: "#145C45",
  },
];

export const STEPS = [
  {
    num: "01",
    titre: "Localisez",
    desc: "Ouvrez la carte et voyez qui est disponible autour de vous en temps réel.",
  },
  {
    num: "02",
    titre: "Choisissez",
    desc: "Filtrez par métier, consultez les profils et les avis des autres utilisateurs.",
  },
  {
    num: "03",
    titre: "Contactez",
    desc: "Appelez ou messagez directement le prestataire pour fixer un rendez-vous.",
  },
];

export const TEMOIGNAGES = [
  {
    nom: "Marie K.",
    quartier: "Nouméa",
    texte: "J'ai trouvé un plombier en 5 minutes, intervention dans l'heure. Super service !",
    note: 5,
  },
  {
    nom: "Jean-Louis M.",
    quartier: "Dumbéa",
    texte: "Très pratique pour voir qui est disponible sans avoir à appeler 10 personnes.",
    note: 5,
  },
  {
    nom: "Sophie T.",
    quartier: "Mont-Dore",
    texte: "L'interface est fluide et les prestataires sont vraiment qualifiés.",
    note: 5,
  },
];

export const PRICING_PLANS = [
  {
    id: "monthly",
    name: "Mensuel",
    price: 3600,
    period: "/ mois",
    desc: "Flexibilité totale",
    features: ["Accès illimité à la carte", "Profils vérifiés", "Support par email", "Sans engagement"],
    featured: false,
  },
  {
    id: "annual",
    name: "Annuel",
    price: 3600,
    period: "/ mois",
    desc: "Engagement 12 mois (3 mois offerts)",
    features: ["Tout le plan Mensuel", "3 mois OFFERTS (payez 9 mois)", "Priorité au support", "Badge 'Premium' sur votre profil"],
    featured: true,
  },
  {
    id: "quarterly",
    name: "Trimestriel",
    price: 3600,
    period: "/ mois",
    desc: "Engagement 3 mois",
    features: ["Accès illimité à la carte", "Profils vérifiés", "Support prioritaire", "Facturation tous les 3 mois"],
    featured: false,
  },
];
