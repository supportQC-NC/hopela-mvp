import {
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  FolderOpen,
} from "lucide-react";

const LUCIDE_MAP = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
};

const CatIcon = ({ icone, size = 26 }) => {
  const Icon = LUCIDE_MAP[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.5} />;
};

export default CatIcon;
