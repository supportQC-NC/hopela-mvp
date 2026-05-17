// src/screens/public/CategorieScreen.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  Droplets,
  Key,
  Zap,
  WashingMachine,
  Square,
  Smartphone,
  Wind,
  Leaf,
  Waves,
  Droplet,
  Truck,
  Hammer,
  Package,
  Hand,
  Scissors,
  Star,
  Palette,
  Heart,
  Footprints,
  Feather,
  Activity,
  Bone,
  Dumbbell,
  PersonStanding,
  Stethoscope,
  HeartHandshake,
  Mic,
  Salad,
  Brain,
  Users,
  HouseHeart,
  ShieldCheck,
  Pill,
  CarFront,
  Bike,
  Lightbulb,
  GraduationCap,
  Camera,
  Pencil,
  ChefHat,
  Monitor,
  Building,
  Baby,
  Paintbrush,
  FolderOpen,
  ArrowLeft,
  MapPin,
  Users2,
} from "lucide-react";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./categorieScreen.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LUCIDE_MAP = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
  droplets: Droplets,
  key: Key,
  zap: Zap,
  "washing-machine": WashingMachine,
  square: Square,
  smartphone: Smartphone,
  wind: Wind,
  leaf: Leaf,
  waves: Waves,
  droplet: Droplet,
  truck: Truck,
  hammer: Hammer,
  package: Package,
  hand: Hand,
  scissors: Scissors,
  star: Star,
  palette: Palette,
  heart: Heart,
  footprints: Footprints,
  feather: Feather,
  activity: Activity,
  bone: Bone,
  dumbbell: Dumbbell,
  "person-standing": PersonStanding,
  stethoscope: Stethoscope,
  "heart-handshake": HeartHandshake,
  mic: Mic,
  salad: Salad,
  brain: Brain,
  users: Users,
  "house-heart": HouseHeart,
  "shield-check": ShieldCheck,
  pill: Pill,
  "car-front": CarFront,
  bike: Bike,
  lightbulb: Lightbulb,
  "graduation-cap": GraduationCap,
  camera: Camera,
  pencil: Pencil,
  "chef-hat": ChefHat,
  monitor: Monitor,
  building: Building,
  baby: Baby,
  paintbrush: Paintbrush,
};

const IconeRenderer = ({ icone, size = 24 }) => {
  const Icon = LUCIDE_MAP[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.6} />;
};

const CategorieScreen = () => {
  const { id } = useParams();

  const [categorie, setCategorie] = useState(null);
  const [metiers, setMetiers] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/categories/${id}`).then((r) => {
        if (!r.ok) throw new Error("not_found");
        return r.json();
      }),
      fetch(`${API_URL}/api/users/prestataires/positions/public`).then((r) =>
        r.json(),
      ),
    ])
      .then(([catData, prestas]) => {
        setCategorie(catData);
        setMetiers(catData.metiers || []);
        setPrestataires(Array.isArray(prestas) ? prestas : []);
      })
      .catch((e) => {
        if (e.message === "not_found") setNotFound(true);
        else console.error(e);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const prestaCountByMetier = (metierId) =>
    prestataires.filter((p) =>
      p.metiers?.some((m) => (m._id || m) === metierId),
    ).length;

  const totalPrestas = metiers.reduce(
    (acc, m) => acc + prestaCountByMetier(m._id),
    0,
  );

  if (notFound) {
    return (
      <div className="sc-root">
        <Header />
        <section className="sc-not-found">
          <div className="sc-not-found-icon">🔍</div>
          <h1>Catégorie introuvable</h1>
          <p>Cette catégorie n'existe pas ou a été supprimée.</p>
          <Link to="/services" className="sc-back-link">
            ← Retour aux services
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="sc-root">
      <Header />

      <section className="sc-hero">
        <div className="sc-hero-inner">
          <nav className="sc-breadcrumb">
            <Link to="/services" className="sc-back">
              <ArrowLeft size={14} /> Services
            </Link>
            <span className="sc-breadcrumb-sep">›</span>
            <span className="sc-breadcrumb-current">
              {loading ? "…" : categorie?.nom || "Catégorie"}
            </span>
          </nav>

          {loading ? (
            <div className="sc-hero-skeleton" />
          ) : (
            <div className="sc-hero-content">
              <div className="sc-hero-icon">
                <IconeRenderer icone={categorie?.icone} size={42} />
              </div>

              <div className="sc-hero-text">
                <div className="sc-eyebrow">Catégorie de service</div>
                <h1>{categorie?.nom}</h1>

                {categorie?.description && <p>{categorie.description}</p>}

                <div className="sc-hero-stats">
                  <div className="sc-hero-stat">
                    <FolderOpen size={16} />
                    <span>
                      <strong>{metiers.length}</strong> métier
                      {metiers.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="sc-hero-stat">
                    <Users2 size={16} />
                    <span>
                      <strong>{totalPrestas}</strong> prestataire
                      {totalPrestas > 1 ? "s" : ""} disponible
                      {totalPrestas > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="sc-hero-stat">
                    <MapPin size={16} />
                    <span>Grand Nouméa</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="sc-section sc-section-metiers">
        <div className="sc-section-head">
          <div className="sc-eyebrow">Métiers disponibles</div>
          <h2>
            Tous les métiers dans <em>{loading ? "…" : categorie?.nom}</em>
          </h2>
        </div>

        {loading ? (
          <div className="sc-skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sc-skeleton-card" />
            ))}
          </div>
        ) : metiers.length === 0 ? (
          <div className="sc-empty">
            Aucun métier dans cette catégorie pour l'instant.
          </div>
        ) : (
          <div className="sc-metiers-grid">
            {metiers.map((m) => {
              const count = prestaCountByMetier(m._id);
              const active = count > 0;

              return (
                <article className="sc-metier-card" key={m._id}>
                  <div className="sc-metier-card-top">
                    <div className="sc-metier-icon-wrap">
                      <IconeRenderer icone={m.icone} size={22} />
                    </div>

                    <h3 title={m.nom}>{m.nom}</h3>
                  </div>

                  {m.description && (
                    <p className="sc-metier-desc">{m.description}</p>
                  )}

                  <div className="sc-metier-footer">
                    <div className="sc-metier-presta">
                      <Users2 size={13} />
                      <span>
                        <strong>{count}</strong> prestataire
                        {count > 1 ? "s" : ""}
                      </span>
                    </div>

                    <span
                      className={`sc-metier-dispo ${
                        active ? "is-online" : "is-offline"
                      }`}
                    >
                      {active ? "Disponible" : "Hors ligne"}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="sc-cta-section">
        <h2>
          Trouvez votre <em>prestataire</em>
          <br />
          sur la carte
        </h2>
        <p>
          Connectez-vous pour voir les prestataires disponibles en temps réel
          près de vous.
        </p>
        <Link to="/login" className="sc-cta">
          Accéder à la carte →
        </Link>
      </section>

      <Footer />
    </div>
  );
};

export default CategorieScreen;
