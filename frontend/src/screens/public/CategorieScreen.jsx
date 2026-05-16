// src/screens/public/CategorieScreen.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Mapping icône complet (partagé avec AdminCatalogues) ────────────────────
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

const IconeRenderer = ({ icone, size = 24, color = "#c9a84c" }) => {
  const Icon = LUCIDE_MAP[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.5} color={color} />;
};

// ── CSS inline ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .sc-root { min-height:100vh; background:#0a0804; color:#f5f0e8; font-family:'DM Sans',sans-serif; }

  /* ── Breadcrumb ── */
  .sc-breadcrumb {
    max-width:1100px; margin:0 auto;
    padding:100px 24px 0;
    display:flex; align-items:center; gap:10px;
  }
  .sc-back {
    display:inline-flex; align-items:center; gap:6px;
    font-size:12px; font-weight:500; color:rgba(201,168,76,0.6);
    text-decoration:none; transition:color 0.2s;
    background:rgba(201,168,76,0.06);
    border:1px solid rgba(201,168,76,0.12);
    border-radius:20px;
    padding:6px 14px;
  }
  .sc-back:hover { color:#c9a84c; background:rgba(201,168,76,0.1); }
  .sc-breadcrumb-sep { color:rgba(245,240,232,0.15); font-size:13px; }
  .sc-breadcrumb-current { font-size:12px; color:rgba(245,240,232,0.3); }

  /* ── Hero catégorie ── */
  .sc-hero {
    max-width:1100px; margin:0 auto;
    padding:40px 24px 60px;
    display:flex; align-items:flex-start; gap:28px;
  }
  .sc-hero-icon {
    width:80px; height:80px;
    border-radius:20px;
    background:rgba(201,168,76,0.08);
    border:1px solid rgba(201,168,76,0.18);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .sc-hero-text { flex:1; }
  .sc-hero-eyebrow {
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    color:rgba(201,168,76,0.6); margin-bottom:10px;
  }
  .sc-hero-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(30px,5vw,56px); font-weight:700; color:#f5f0e8;
    line-height:1.1; margin-bottom:14px;
  }
  .sc-hero-desc {
    font-size:15px; color:rgba(245,240,232,0.45); line-height:1.7;
    max-width:600px;
  }
  .sc-hero-stats {
    display:flex; gap:20px; margin-top:24px; flex-wrap:wrap;
  }
  .sc-hero-stat {
    display:flex; align-items:center; gap:8px;
    font-size:13px; color:rgba(245,240,232,0.4);
  }
  .sc-hero-stat strong { color:#c9a84c; font-weight:700; }

  /* ── Séparateur ── */
  .sc-divider { height:1px; background:rgba(201,168,76,0.08); max-width:1100px; margin:0 auto; }

  /* ── Section métiers ── */
  .sc-section { max-width:1100px; margin:0 auto; padding:60px 24px 80px; }
  .sc-section-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(22px,3vw,36px); font-weight:700; color:#f5f0e8;
    margin-bottom:28px;
  }
  .sc-section-title em { font-style:italic; color:#c9a84c; }

  /* ── Grille métiers ── */
  .sc-metiers-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
    gap:14px;
  }

  /* ── Card métier ── */
  .sc-metier-card {
    background:#120e07;
    border:1px solid rgba(201,168,76,0.1);
    border-radius:16px;
    padding:22px 20px;
    display:flex;
    flex-direction:column;
    gap:10px;
    transition:all 0.25s;
    position:relative;
    overflow:hidden;
  }
  .sc-metier-card::after {
    content:'';
    position:absolute;
    bottom:0; left:0; right:0;
    height:2px;
    background:linear-gradient(90deg,#c9a84c,#e8c97a);
    transform:scaleX(0);
    transform-origin:left;
    transition:transform 0.3s;
  }
  .sc-metier-card:hover { border-color:rgba(201,168,76,0.3); transform:translateY(-3px); box-shadow:0 12px 36px rgba(0,0,0,0.4); }
  .sc-metier-card:hover::after { transform:scaleX(1); }

  .sc-metier-card-top {
    display:flex; align-items:center; gap:12px;
    min-width:0; overflow:hidden;
  }
  .sc-metier-icon-wrap {
    width:42px; height:42px;
    border-radius:11px;
    background:rgba(201,168,76,0.07);
    border:1px solid rgba(201,168,76,0.12);
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }
  .sc-metier-nom {
    font-family:'Cormorant Garamond',serif;
    font-size:18px; font-weight:700; color:#f5f0e8;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    flex:1; min-width:0;
  }
  .sc-metier-desc {
    font-size:12px; color:rgba(245,240,232,0.35); line-height:1.6;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
  }
  .sc-metier-footer {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:10px; border-top:1px solid rgba(255,255,255,0.04);
    margin-top:auto;
  }
  .sc-metier-presta {
    display:flex; align-items:center; gap:5px;
    font-size:11px; color:rgba(245,240,232,0.3);
  }
  .sc-metier-presta-count { font-weight:700; color:rgba(201,168,76,0.7); }
  .sc-metier-dispo {
    font-size:10px; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;
    padding:3px 10px; border-radius:20px;
  }
  .sc-metier-dispo.on { background:rgba(74,222,128,0.08); color:#4ade80; border:1px solid rgba(74,222,128,0.18); }
  .sc-metier-dispo.off { background:rgba(255,255,255,0.03); color:rgba(245,240,232,0.2); border:1px solid rgba(255,255,255,0.06); }

  /* ── Skeleton ── */
  .sc-skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
  .sc-skeleton-card {
    border-radius:16px; height:150px;
    background:linear-gradient(90deg,#120e07 25%,#1a1408 50%,#120e07 75%);
    background-size:400% 100%;
    animation:sc-shimmer 1.6s infinite;
  }
  @keyframes sc-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

  /* ── Empty state ── */
  .sc-empty {
    text-align:center; padding:60px 20px;
    font-size:14px; color:rgba(245,240,232,0.25); font-style:italic;
  }

  /* ── CTA bas de page ── */
  .sc-cta-section { padding:60px 24px; text-align:center; }
  .sc-cta-section h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(24px,4vw,42px); font-weight:700; color:#f5f0e8; margin-bottom:14px; }
  .sc-cta-section h2 em { font-style:italic; color:#c9a84c; }
  .sc-cta-section p { font-size:14px; color:rgba(245,240,232,0.4); margin-bottom:28px; }
  .sc-cta { display:inline-block; background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804; text-decoration:none; font-weight:700; font-size:12px; letter-spacing:2px; text-transform:uppercase; padding:14px 36px; border-radius:4px; transition:all 0.2s; }
  .sc-cta:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(201,168,76,0.4); }

  @media (max-width:640px) {
    .sc-hero { flex-direction:column; gap:18px; }
    .sc-hero-icon { width:60px; height:60px; }
    .sc-metiers-grid, .sc-skeleton-grid { grid-template-columns:1fr; }
  }
`;

// ─────────────────────────────────────────────────────────
const CategorieScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categorie, setCategorie] = useState(null);
  const [metiers, setMetiers] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Injection CSS
    if (!document.getElementById("sc-css")) {
      const s = document.createElement("style");
      s.id = "sc-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // Fetch catégorie + prestataires en parallèle
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
        // L'API /api/categories/:id renvoie { ...categorie, metiers: [...] }
        setMetiers(catData.metiers || []);
        setPrestataires(Array.isArray(prestas) ? prestas : []);
      })
      .catch((e) => {
        if (e.message === "not_found") setNotFound(true);
        else console.error(e);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Compte de prestataires actifs par métier
  const prestaCountByMetier = (metierId) =>
    prestataires.filter((p) =>
      p.metiers?.some((m) => (m._id || m) === metierId),
    ).length;

  // Total prestataires dans cette catégorie
  const totalPrestas = metiers.reduce(
    (acc, m) => acc + prestaCountByMetier(m._id),
    0,
  );

  // ── Not found ──
  if (notFound) {
    return (
      <div className="sc-root">
        <Header />
        <div style={{ textAlign: "center", padding: "160px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 32,
              color: "#f5f0e8",
              marginBottom: 12,
            }}
          >
            Catégorie introuvable
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(245,240,232,0.35)",
              marginBottom: 32,
            }}
          >
            Cette catégorie n'existe pas ou a été supprimée.
          </div>
          <Link
            to="/services"
            style={{
              color: "#c9a84c",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            ← Retour aux services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="sc-root">
      <Header />

      {/* ── Breadcrumb ── */}
      <nav className="sc-breadcrumb">
        <Link to="/services" className="sc-back">
          <ArrowLeft size={13} /> Services
        </Link>
        <span className="sc-breadcrumb-sep">›</span>
        <span className="sc-breadcrumb-current">
          {loading ? "…" : categorie?.nom || "Catégorie"}
        </span>
      </nav>

      {/* ── Hero catégorie ── */}
      {loading ? (
        <div
          style={{
            maxWidth: 1100,
            margin: "40px auto 60px",
            padding: "0 24px",
          }}
        >
          <div
            style={{
              height: 80,
              borderRadius: 20,
              background:
                "linear-gradient(90deg,#120e07 25%,#1a1408 50%,#120e07 75%)",
              backgroundSize: "400% 100%",
              animation: "sc-shimmer 1.6s infinite",
            }}
          />
        </div>
      ) : (
        <div className="sc-hero">
          <div className="sc-hero-icon">
            <IconeRenderer icone={categorie?.icone} size={40} />
          </div>
          <div className="sc-hero-text">
            <div className="sc-hero-eyebrow">Catégorie de service</div>
            <div className="sc-hero-title">{categorie?.nom}</div>
            {categorie?.description && (
              <div className="sc-hero-desc">{categorie.description}</div>
            )}
            <div className="sc-hero-stats">
              <div className="sc-hero-stat">
                <FolderOpen size={14} strokeWidth={1.5} color="#c9a84c" />
                <span>
                  <strong>{metiers.length}</strong> métier
                  {metiers.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="sc-hero-stat">
                <Users2 size={14} strokeWidth={1.5} color="#c9a84c" />
                <span>
                  <strong>{totalPrestas}</strong> prestataire
                  {totalPrestas > 1 ? "s" : ""} disponible
                  {totalPrestas > 1 ? "s" : ""}
                </span>
              </div>
              <div className="sc-hero-stat">
                <MapPin size={14} strokeWidth={1.5} color="#c9a84c" />
                <span>Grand Nouméa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="sc-divider" />

      {/* ── Liste des métiers ── */}
      <div className="sc-section">
        <div className="sc-section-title">
          Métiers disponibles dans <em>{loading ? "…" : categorie?.nom}</em>
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
                <div className="sc-metier-card" key={m._id}>
                  {/* Top */}
                  <div className="sc-metier-card-top">
                    <div className="sc-metier-icon-wrap">
                      <IconeRenderer icone={m.icone} size={20} />
                    </div>
                    <div className="sc-metier-nom" title={m.nom}>
                      {m.nom}
                    </div>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <div className="sc-metier-desc">{m.description}</div>
                  )}

                  {/* Footer */}
                  <div className="sc-metier-footer">
                    <div className="sc-metier-presta">
                      <Users2 size={12} strokeWidth={1.5} />
                      <span className="sc-metier-presta-count">{count}</span>
                      <span>prestataire{count > 1 ? "s" : ""}</span>
                    </div>
                    <span
                      className={`sc-metier-dispo${active ? " on" : " off"}`}
                    >
                      {active ? "🟢 Disponible" : "⚫ Hors ligne"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sc-divider" />

      {/* ── CTA ── */}
      <div className="sc-cta-section">
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
      </div>

      <Footer />
    </div>
  );
};

export default CategorieScreen;
