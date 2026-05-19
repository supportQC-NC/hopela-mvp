// src/components/shared/IconeRenderer.jsx
//
// Composant partagé — résout un nom d'icône Lucide stocké en base
// vers le composant SVG correspondant.
//
// Usage :
//   <IconeRenderer icone="truck" size={18} />
//   <IconeRenderer icone="🔧" size={18} />       ← emoji passthrough
//   <IconeRenderer icone={null} size={18} />     ← fallback
//
// Emplacement : src/components/shared/IconeRenderer.jsx
// Importé par : AdminCatalogues.jsx, adminOverview.jsx, et tout composant
//               qui affiche une icône de métier ou de catégorie.

import {
  // Catégories
  Wrench, Home, Sparkles, HeartPulse, Accessibility, Car, BookOpen,
  // Urgence & dépannage
  Droplets, Key, Zap, WashingMachine, Square, Smartphone, Wind,
  // Services à domicile
  Leaf, Waves, Droplet, Truck, Hammer, Package,
  // Beauté & bien-être
  Hand, Scissors, Star, Palette, Heart, Footprints, Feather,
  // Santé
  Activity, Bone, Dumbbell, PersonStanding, Stethoscope,
  HeartHandshake, Mic, Salad, Brain,
  // PMR
  Users, HouseHeart, ShieldCheck, Pill,
  // Transport
  CarFront, Bike,
  // Enseignement
  Lightbulb, GraduationCap, Camera, Pencil,
  // Génériques / fallback
  ChefHat, Monitor, Building, Grid, Baby, Paintbrush,
  FolderOpen, HelpCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// MAP nom-icône (stocké en BDD) → composant Lucide
// ─────────────────────────────────────────────────────────────────────────────
export const LUCIDE_MAP = {
  // Catégories
  wrench:           Wrench,
  home:             Home,
  sparkles:         Sparkles,
  "heart-pulse":    HeartPulse,
  accessibility:    Accessibility,
  car:              Car,
  "book-open":      BookOpen,
  // Urgence & dépannage
  droplets:         Droplets,
  key:              Key,
  zap:              Zap,
  "washing-machine":WashingMachine,
  square:           Square,
  smartphone:       Smartphone,
  wind:             Wind,
  // Services à domicile
  leaf:             Leaf,
  waves:            Waves,
  droplet:          Droplet,
  truck:            Truck,
  hammer:           Hammer,
  package:          Package,
  // Beauté & bien-être
  hand:             Hand,
  scissors:         Scissors,
  star:             Star,
  palette:          Palette,
  heart:            Heart,
  footprints:       Footprints,
  feather:          Feather,
  // Santé
  activity:         Activity,
  bone:             Bone,
  dumbbell:         Dumbbell,
  "person-standing":PersonStanding,
  stethoscope:      Stethoscope,
  "heart-handshake":HeartHandshake,
  mic:              Mic,
  salad:            Salad,
  brain:            Brain,
  // PMR
  users:            Users,
  "house-heart":    HouseHeart,
  "shield-check":   ShieldCheck,
  pill:             Pill,
  // Transport
  "car-front":      CarFront,
  bike:             Bike,
  // Enseignement
  lightbulb:        Lightbulb,
  "graduation-cap": GraduationCap,
  camera:           Camera,
  pencil:           Pencil,
  // Génériques
  "chef-hat":       ChefHat,
  monitor:          Monitor,
  building:         Building,
  grid:             Grid,
  baby:             Baby,
  paintbrush:       Paintbrush,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT
// Props :
//   icone    {string}          — nom Lucide ("truck") ou emoji ("🔧") ou null
//   size     {number}          — taille en px (défaut : 18)
//   fallback {React.Component} — icône Lucide de secours (défaut : FolderOpen)
//   color    {string}          — couleur CSS optionnelle
// ─────────────────────────────────────────────────────────────────────────────
const IconeRenderer = ({
  icone,
  size     = 18,
  fallback: Fallback = FolderOpen,
  color,
}) => {
  // 1. Pas d'icône → fallback Lucide
  if (!icone) return <Fallback size={size} color={color} />;

  // 2. Nom Lucide connu → composant SVG
  const LucideIcon = LUCIDE_MAP[icone.toLowerCase()];
  if (LucideIcon) return <LucideIcon size={size} color={color} />;

  // 3. Chaîne inconnue (emoji ou texte libre) → span passthrough
  return (
    <span
      style={{
        fontSize:   size * 0.9,
        lineHeight: 1,
        display:    "inline-flex",
        alignItems: "center",
      }}
    >
      {icone}
    </span>
  );
};

export default IconeRenderer;