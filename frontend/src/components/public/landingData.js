import { Zap, Shield, Users } from "lucide-react";

export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AVANTAGES = [
  {
    icon: Zap,
    titre: "Pour les clients",
    desc: "Le professionnel dont vous avez besoin est peut-être à 800 mètres. Il ne le sait pas encore. Vous non plus. Hopela le rend visible — grâce à votre position géographique.",
    accent: "#145C45",
  },
  {
    icon: Shield,
    titre: "Des profils déjà là",
    desc: "Un coiffeur à domicile. Un thérapeute. Un jardinier. Un artisan. Un professionnel mobile. Leur présence est déjà là. Hopela vous envoie le signal.",
    accent: "#1A2D4A",
  },
  {
    icon: Users,
    titre: "Pour les professionnels",
    desc: "Vous êtes dans la zone. C'est suffisant. Votre position géographique devient un signal actif dans votre zone. Chaque trajet devient une opportunité. Chaque zone traversée, un territoire visible.",
    accent: "#145C45",
  },
];

export const STEPS = [
  {
    num: "1",
    titre: "Vous signalez votre présence.",
    desc: "Vous êtes dans la zone. Un geste. Votre position devient un signal visible dans un rayon de 10 km.",
  },
  {
    num: "2",
    titre: "Hopela capte et diffuse.",
    desc: "Les personnes autour de vous voient que vous êtes déjà là. Pas une publicité. Pas une fiche statique. Une présence réelle, en temps réel.",
  },
  {
    num: "3",
    titre: "L'opportunité se crée.",
    desc: "Une personne vous contacte. Directement. Sans intermédiaire. Sans commission. Parce que vous étiez déjà là.",
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